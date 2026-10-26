import { getLocale } from '../../scripts/locale.js';
import { readConfigRows, resolveLabels } from '../../scripts/block-config.js';
import { fetchLabels, pickLabels } from '../../scripts/lh-api.js';
import { markSource } from '../../scripts/lh-data.js';
import { loadSheet } from '../../scripts/articles.js';
import {
  search, excerpt, prepareRow, PAGE_SIZE,
} from '../../scripts/site-search.js';

/**
 * UI strings: an authored row ("No results label | ..."), else www's label bundle
 * searchResultsAEM (GET /service/api/labels/searchResultsAEM/lh/{lang}), else these defaults
 * (www's texts, recorded 2026-10-26). {QUERY} and {NUMBER} are replaced.
 */
const DEFAULT_LABELS = {
  en: {
    'input label': 'Enter search term',
    'search button label': 'Search',
    'search for label': 'Your search for {QUERY}',
    'results label': '{NUMBER} results',
    'no results label': 'No results found. Please refine your search and try again.',
    'failed label': 'Your search results could not be loaded.',
    'failed sr label': 'Search results could not be loaded.',
    'success sr label': 'Search results loaded.',
    'pagination label': 'Bottom pagination',
    'previous label': 'Previous page',
    'next label': 'Next page',
    'page label': 'Page {PAGE}',
  },
  de: {
    'input label': 'Suchbegriff eingeben',
    'search button label': 'Suchen',
    'search for label': 'Ihre Suche zu {QUERY}',
    'results label': '{NUMBER} Suchergebnisse',
    'no results label': 'Keine Suchergebnisse gefunden. Bitte passen Sie Ihre Suche an und versuchen Sie es erneut.',
    'failed label': 'Ihre Suchergebnise konnten nicht geladen werden.',
    'failed sr label': 'Ihre Suchergebnise konnten nicht geladen werden.',
    'success sr label': 'Suchergebnisse geladen',
    'pagination label': 'Bottom pagination',
    'previous label': 'Vorherige Seite',
    'next label': 'Nächste Seite',
    'page label': 'Seite {PAGE}',
  },
};

/** www's label keys (searchResultsAEM, searchBar) for the strings above. */
const LIVE_LABELS = {
  'input label': 'searchBar.fullApp.default.searchLabel',
  'search for label': 'searchResultsAEM.fullApp.default.searchFor',
  'results label': 'searchResultsAEM.fullApp.default.numberOfResults',
  'no results label': 'searchResultsAEM.fullApp.default.noSearchResults',
  'failed label': 'searchResultsAEM.fullApp.default.searchFailed',
  'failed sr label': 'searchResultsAEM.fullApp.default.searchFailedSR',
  'success sr label': 'searchResultsAEM.fullApp.default.searchSuccessSR',
  'pagination label': 'searchResultsAEM.fullApp.default.paginationLabelSR',
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/** The query of the page URL (www's ?query=), as typed. */
export function readQuery(query = window.location.search) {
  return (new URLSearchParams(query).get('query') || '').trim();
}

/** A label with a placeholder replaced by a node: "Your search for {QUERY}" -> text + <strong>. */
function withNode(label, name, node) {
  const [before, after = ''] = label.split(`{${name}}`);
  const out = [document.createTextNode(before), node];
  if (after) out.push(document.createTextNode(after));
  return out;
}

/** The excerpt text with the matches in <strong> (text nodes only, no HTML from the index). */
function excerptNodes({ text, highlights }) {
  const nodes = [];
  let at = 0;
  highlights.forEach(({ start, end }) => {
    if (start > at) nodes.push(document.createTextNode(text.slice(at, start)));
    nodes.push(el('strong', '', text.slice(start, end)));
    at = end;
  });
  if (at < text.length) nodes.push(document.createTextNode(text.slice(at)));
  return nodes;
}

/** The URL of this page for another query or result page (app view forms stay). */
function pageUrl(query, page) {
  const url = new URL(window.location.href);
  url.searchParams.set('query', query);
  if (page > 1) url.searchParams.set('page', String(page));
  else url.searchParams.delete('page');
  return `${url.pathname}${url.search}`;
}

function buildForm(labels, query, uid) {
  const form = el('form', 'search-results-form');
  form.setAttribute('role', 'search');
  const id = `${uid}-input`;
  const label = el('label', 'search-results-label', labels['input label']);
  label.htmlFor = id;
  const input = el('input', 'search-results-input');
  input.id = id;
  input.type = 'search';
  input.name = 'query';
  input.autocomplete = 'off';
  input.placeholder = labels['input label'];
  input.value = query;
  const button = el('button', 'search-results-submit');
  button.type = 'submit';
  button.setAttribute('aria-label', labels['search button label']);
  form.append(label, input, button);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const term = input.value.trim();
    if (!term) {
      input.focus();
      return;
    }
    window.location.href = pageUrl(term, 1);
  });
  return form;
}

function buildPagination(labels, query, page, pages) {
  const nav = el('nav', 'search-results-pagination');
  nav.setAttribute('aria-label', labels['pagination label']);
  const list = el('ul');
  const item = (target, text, aria, current) => {
    const li = el('li');
    if (current) {
      const span = el('span', 'search-results-page current', text);
      span.setAttribute('aria-current', 'page');
      li.append(span);
    } else {
      const a = el('a', 'search-results-page', text);
      a.href = pageUrl(query, target);
      a.setAttribute('aria-label', aria);
      li.append(a);
    }
    return li;
  };
  if (page > 1) list.append(item(page - 1, '‹', labels['previous label']));
  for (let p = 1; p <= pages; p += 1) {
    list.append(item(p, String(p), labels['page label'].replace('{PAGE}', p), p === page));
  }
  if (page < pages) list.append(item(page + 1, '›', labels['next label']));
  nav.append(list);
  return nav;
}

function renderResults(container, labels, query, results, page) {
  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, page), pages);
  container.append(el('p', 'search-results-count', labels['results label'].replace('{NUMBER}', results.length)));
  const list = el('ul', 'search-results-list');
  results.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE).forEach(({ row, prepared }) => {
    const li = el('li', 'search-results-item');
    const a = el('a', 'search-results-link');
    a.href = row.path;
    a.append(el('span', 'search-results-headline', prepared.fields.title || row.path));
    const p = el('p', 'search-results-excerpt');
    p.append(...excerptNodes(excerpt(prepared, query)));
    a.append(p);
    li.append(a);
    list.append(li);
  });
  container.append(list);
  if (pages > 1) container.append(buildPagination(labels, query, current, pages));
}

/**
 * The query index to search: the block's one-cell row (the block library's search block: a
 * query index URL or path), else the locale's search index.
 */
export function indexPath(block, locale) {
  const row = [...block.children].find((r) => r.children.length === 1 && r.textContent.trim());
  const value = row ? (row.querySelector('a[href]')?.getAttribute('href') || row.textContent).trim() : '';
  if (value) {
    try {
      const url = new URL(value, window.location.href);
      if (url.origin === window.location.origin) return url.pathname;
    } catch (e) { /* not a URL */ }
  }
  return `/${locale.key}/search-index.json`;
}

let instances = 0;

export default async function decorate(block) {
  const locale = getLocale();
  const config = readConfigRows(block);
  const index = indexPath(block, locale);
  instances += 1;
  const uid = `search-results-${instances}`;
  const query = readQuery();
  const page = Number.parseInt(new URLSearchParams(window.location.search).get('page'), 10) || 1;
  block.replaceChildren();
  block.setAttribute('aria-busy', 'true');

  const [indexResult, live] = await Promise.all([
    query ? loadSheet(index).then((rows) => ({ rows }), (error) => ({ error })) : { rows: [] },
    fetchLabels(['searchResultsAEM', 'searchBar'], locale).catch(() => ({ labels: {}, sources: {} })),
  ]);
  const defaults = DEFAULT_LABELS[locale.lang] || DEFAULT_LABELS.en;
  const labels = resolveLabels({
    [locale.lang]: { ...defaults, ...pickLabels(live.labels, LIVE_LABELS) },
  }, config, locale.lang);
  markSource(block, {
    'search-index': indexResult.error ? 'none' : 'live',
    'labels/searchResultsAEM': (live.sources && live.sources.searchResultsAEM) || 'none',
  }, ['search-index']);

  const inner = el('div', 'search-results-inner');
  inner.append(buildForm(labels, query, uid));
  const heading = el('h2', 'search-results-heading');
  heading.append(...withNode(labels['search for label'], 'QUERY', el('strong', '', query)));
  inner.append(heading);
  const status = el('p', 'search-results-sr');
  status.setAttribute('role', 'status');
  const body = el('div', 'search-results-body');
  // www: an empty query is refused by its search API ("could not be loaded")
  if (!query || indexResult.error) {
    body.append(el('p', 'search-results-message', labels['failed label']));
    status.textContent = labels['failed sr label'];
  } else {
    const results = search(indexResult.rows.map(prepareRow), query);
    if (!results.length) body.append(el('p', 'search-results-message', labels['no results label']));
    else renderResults(body, labels, query, results, page);
    status.textContent = labels['success sr label'];
  }
  inner.append(body, status);
  block.append(inner);
  block.removeAttribute('aria-busy');
}
