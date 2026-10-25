import { createOptimizedPicture } from '../../scripts/aem.js';
import { getLocale } from '../../scripts/locale.js';
import { readConfigRows, resolveLabels } from '../../scripts/block-config.js';
import { fetchLabels, pickLabels } from '../../scripts/lh-api.js';
import { markSource } from '../../scripts/lh-data.js';
import {
  loadArticles, formatArticleDate, normalizeCategory, normalizeTag,
} from '../../scripts/articles.js';

/**
 * UI strings: an authored row ("No results | ..."), else www's label bundle blogOverview
 * (GET /service/api/labels/blogOverview/lh/{lang}), else these defaults (www's texts).
 * {TOTAL}, {TITLE}, {CURRENT_PAGE} are replaced.
 */
const DEFAULT_LABELS = {
  en: {
    'results label': '{TOTAL} Results found',
    'search label': 'Search keyword',
    'categories label': 'Categories',
    'all categories label': 'All Categories',
    'read label': 'Read article',
    'read screen reader label': "Read '{TITLE}'",
    'no results label': "Oops. We didn't write any blogs to this topic yet.",
    'current page label': 'You are on page {CURRENT_PAGE} of the results',
    'pagination label': 'Blog Articles pagination',
    'tags label': '{TITLE} article tag/s',
    'previous label': 'Previous page',
    'next label': 'Next page',
    'page label': 'Page {PAGE}',
  },
  de: {
    'results label': '{TOTAL} Treffer gefunden',
    'search label': 'Suchbegriff',
    'categories label': 'Kategorien',
    'all categories label': 'Alle Kategorien',
    'read label': 'Artikel lesen',
    'read screen reader label': '{TITLE} lesen',
    'no results label': 'Ups. Es gibt bisher leider keine Blogs zu diesem Thema.',
    'current page label': 'Sie befinden sich auf Ergebnisseite {CURRENT_PAGE}',
    'pagination label': 'Blog Articles pagination',
    'tags label': '{TITLE} article tag/s',
    'previous label': 'Vorherige Seite',
    'next label': 'Nächste Seite',
    'page label': 'Seite {PAGE}',
  },
};

const LIVE_LABELS = {
  'results label': 'blogOverview.common.default.blogArticleSearched',
  'search label': 'blogOverview.common.default.searchKeyword',
  'categories label': 'blogOverview.common.default.category',
  'all categories label': 'blogOverview.common.default.allCategory',
  'read label': 'blogOverview.common.default.articleDetailsLink',
  'read screen reader label': 'blogOverview.common.default.articleDetailsLinkScreenReader',
  'no results label': 'blogOverview.common.default.noResultFound',
  'current page label': 'blogOverview.common.default.currentPageScreenReader',
  'pagination label': 'blogOverview.common.default.articlePaginationScreenReader',
  'tags label': 'blogOverview.common.default.tagChipAriaLabel',
};

/** Category names (www's category filter); other categories show their id in title case. */
const CATEGORY_NAMES = {
  en: { 'explore-flying': 'Explore Flying', 'explore-the-world': 'Explore the World', highlights: 'Highlights' },
  de: { 'explore-flying': 'Erlebe das Fliegen', 'explore-the-world': 'Erlebe die Welt', highlights: 'Highlights' },
};

const BREAKPOINTS = [{ media: '(min-width: 600px)', width: '750' }, { width: '600' }];

let instanceCount = 0;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

const fill = (template, values) => Object.entries(values)
  .reduce((s, [k, v]) => s.replaceAll(`{${k}}`, v), template).replace(/''/g, "'");

const fold = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** The options of the block (www's widget configuration). */
function readOptions(block) {
  const config = readConfigRows(block);
  const text = (...keys) => keys.map((k) => config[k]?.text).find(Boolean) || '';
  const size = Number.parseInt(text('page-size', 'pagination-size'), 10);
  return {
    config,
    category: normalizeCategory(text('category', 'category-id')),
    tag: normalizeTag(text('tag', 'selected-tag')),
    author: text('author', 'author-id'),
    pageSize: Number.isFinite(size) && size > 0 ? size : 6,
    hideFilter: /^(true|yes|ja|1)$/i.test(text('hide-filter')),
  };
}

/**
 * Whether an article matches every word of a search (title, description, tags, keywords,
 * destinations).
 */
function matches(article, query) {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const haystack = fold([article.title, article.description, ...article.tags, article.keywords,
    ...article.destinations].join(' '));
  return words.every((w) => haystack.includes(w));
}

function buildPicture(src, alt) {
  try {
    const url = new URL(src, window.location.href);
    if (url.origin === window.location.origin || /\.aem\.(page|live)$/.test(url.hostname)) {
      return createOptimizedPicture(url.pathname, alt, false, BREAKPOINTS);
    }
    const picture = el('picture');
    const img = el('img');
    img.src = url.href;
    img.alt = alt;
    img.loading = 'lazy';
    picture.append(img);
    return picture;
  } catch (e) {
    return null;
  }
}

/**
 * One card (www .blog-article-container): image | tags, title, date | reading time | author,
 * text, link.
 */
function buildCard(article, labels, locale, dateStyle) {
  const li = el('li', 'blog-overview-card');
  const media = el('div', 'blog-overview-image');
  if (article.image) {
    const link = el('a');
    link.href = article.path;
    link.tabIndex = -1;
    link.setAttribute('aria-hidden', 'true');
    const picture = buildPicture(article.image, article.imageAlt);
    if (picture) link.append(picture);
    media.append(link);
  }
  const details = el('div', 'blog-overview-details');
  if (article.tags.length) {
    const tags = el('ul', 'blog-overview-tags');
    tags.setAttribute('aria-label', fill(labels['tags label'], { TITLE: article.title }));
    tags.append(...article.tags.map((t) => el('li', '', t)));
    details.append(tags);
  }
  const title = el('h2', 'blog-overview-title');
  const titleLink = el('a', '', article.title);
  titleLink.href = article.path;
  title.append(titleLink);
  details.append(title);
  const date = formatArticleDate(article.date, locale, dateStyle);
  const info = [date, article.readingTime, article.author].filter(Boolean);
  if (info.length) {
    const p = el('p', 'blog-overview-info');
    info.forEach((part, i) => {
      if (i) p.append(el('span', 'blog-overview-divider', '|'));
      p.append(el('span', '', part));
    });
    details.append(p);
  }
  // www cuts the teaser text after 172 characters
  const text = article.description.length > 172 ? `${article.description.slice(0, 172).trimEnd()}…` : article.description;
  if (text) details.append(el('p', 'blog-overview-description', text));
  const more = el('p', 'blog-overview-more');
  const moreLink = el('a', '', labels['read label']);
  moreLink.href = article.path;
  moreLink.setAttribute('aria-label', fill(labels['read screen reader label'], { TITLE: article.title }));
  more.append(moreLink);
  details.append(more);
  li.append(...(media.children.length ? [details, media] : [details]));
  if (!media.children.length) li.classList.add('blog-overview-card-text-only');
  return li;
}

/** Page numbers with gaps, as maui-pagination: 1 2 3 … 71 / 1 … 4 5 6 … 71. */
function pageItems(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, current - 1, current, current + 1]);
  if (current <= 3) [2, 3, 4].forEach((n) => set.add(n));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((n) => set.add(n));
  const nums = [...set].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);
  return nums.flatMap((n, i) => (i && n - nums[i - 1] > 1 ? ['…', n] : [n]));
}

/**
 * Article list over the locale's article index (www's blog overview): filtered by the block's
 * category, tag and author, newest first, with search, category filter, paging and total count.
 * @param {Element} block
 */
export default async function decorate(block) {
  instanceCount += 1;
  const uid = `blog-overview-${instanceCount}`;
  const locale = getLocale();
  const options = readOptions(block);
  // www prints English dates on author pages as "April 30, 2024", elsewhere (de/en)
  // "30. April 2024"
  const dateStyle = options.author ? 'us' : 'market';
  block.replaceChildren();
  block.setAttribute('aria-busy', 'true');

  const [articlesResult, live] = await Promise.all([
    loadArticles(locale).then((list) => ({ list }), (error) => ({ error })),
    fetchLabels(['blogOverview'], locale).catch(() => ({ labels: {}, sources: { blogOverview: 'none' } })),
  ]);
  const defaults = DEFAULT_LABELS[locale.lang] || DEFAULT_LABELS.en;
  const liveLabels = pickLabels(live.labels, LIVE_LABELS);
  const labels = resolveLabels({
    [locale.lang]: { ...defaults, ...liveLabels },
  }, options.config, locale.lang);
  markSource(block, {
    articles: articlesResult.error ? 'none' : 'live',
    'labels/blogOverview': live.sources?.blogOverview || 'none',
  }, ['articles']);

  const all = (articlesResult.list || [])
    .filter((a) => (!options.tag || a.tagIds.includes(options.tag))
    && (!options.author || a.authorId === options.author));
  const saved = (window.history.state && window.history.state[uid]) || {};
  const state = {
    category: saved.category ?? options.category,
    query: saved.query || '',
    page: saved.page || 1,
  };

  // --- header: total count, search field and category filter (not with Hide filter)
  const status = el('p', 'blog-overview-sr', '');
  status.setAttribute('aria-live', 'polite');
  status.className = 'blog-overview-sr';
  const count = el('p', 'blog-overview-count');
  const list = el('ul', 'blog-overview-list');
  const empty = el('p', 'blog-overview-empty', labels['no results label']);
  const pager = el('nav', 'blog-overview-pagination');
  pager.setAttribute('aria-label', labels['pagination label']);

  let form;
  let input;
  let select;
  if (!options.hideFilter) {
    form = el('form', 'blog-overview-filter');
    form.setAttribute('role', 'search');
    form.noValidate = true;
    const field = el('div', 'blog-overview-search');
    const label = el('label', 'blog-overview-sr', labels['search label']);
    label.htmlFor = `${uid}-query`;
    input = el('input');
    input.type = 'search';
    input.id = `${uid}-query`;
    input.name = 'query';
    input.autocomplete = 'off';
    input.placeholder = labels['search label'];
    input.value = state.query;
    field.append(label, input);
    const selectWrap = el('div', 'blog-overview-select');
    const selectLabel = el('label', 'blog-overview-sr', labels['categories label']);
    selectLabel.htmlFor = `${uid}-category`;
    select = el('select');
    select.id = `${uid}-category`;
    select.name = 'category';
    const names = CATEGORY_NAMES[locale.lang] || CATEGORY_NAMES.en;
    const categories = [...new Set([...Object.keys(names), ...all.map((a) => a.category)])]
      .filter((c) => c && (names[c] || all.some((a) => a.category === c))).sort();
    const optionEl = (value, text) => {
      const o = el('option', '', text);
      o.value = value;
      return o;
    };
    select.append(optionEl('', labels['all categories label']), ...categories.map((c) => optionEl(c, names[c]
      || c.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase()))));
    select.value = categories.includes(state.category) ? state.category : '';
    selectWrap.append(selectLabel, select);
    form.append(field, selectWrap);
  }
  const bar = el('div', 'blog-overview-bar');
  if (form) bar.append(count, form);

  const save = () => {
    try {
      window.history.replaceState({ ...(window.history.state || {}), [uid]: { ...state } }, '');
    } catch (e) { /* sandboxed */ }
  };

  const render = (focusList) => {
    const filtered = all.filter((a) => (!state.category || a.category === state.category)
      && matches(a, state.query));
    const pages = Math.max(1, Math.ceil(filtered.length / options.pageSize));
    state.page = Math.min(Math.max(1, state.page), pages);
    const start = (state.page - 1) * options.pageSize;
    const shown = filtered.slice(start, start + options.pageSize);

    count.replaceChildren();
    const [before, after] = labels['results label'].split('{TOTAL}');
    count.append(document.createTextNode(before || ''), el('strong', '', String(filtered.length)), document.createTextNode(after ?? ''));
    status.textContent = fill(labels['current page label'], { CURRENT_PAGE: state.page });

    list.replaceChildren(...shown.map((a) => buildCard(a, labels, locale, dateStyle)));
    list.hidden = !shown.length;
    empty.hidden = !!shown.length;

    pager.replaceChildren();
    pager.hidden = pages < 2;
    if (pages > 1) {
      const ul = el('ul');
      const button = (text, page, extra = {}) => {
        const li = el('li');
        const b = el('button', extra.className || 'blog-overview-page', text);
        b.type = 'button';
        if (extra.label) b.setAttribute('aria-label', extra.label);
        if (page === state.page && !extra.className) b.setAttribute('aria-current', 'page');
        b.disabled = !!extra.disabled;
        b.addEventListener('click', () => {
          state.page = page;
          save();
          render(true);
        });
        li.append(b);
        return li;
      };
      ul.append(button('', state.page - 1, { className: 'blog-overview-prev', label: labels['previous label'], disabled: state.page === 1 }));
      pageItems(state.page, pages).forEach((item) => {
        if (item === '…') ul.append(el('li', 'blog-overview-gap', '…'));
        else ul.append(button(String(item), item, { label: fill(labels['page label'], { PAGE: item }) }));
      });
      ul.append(button('', state.page + 1, { className: 'blog-overview-next', label: labels['next label'], disabled: state.page === pages }));
      pager.append(ul);
    }
    if (focusList) {
      block.scrollIntoView({ behavior: 'smooth', block: 'start' });
      status.focus({ preventScroll: true });
    }
  };

  if (form) {
    let timer;
    input.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        state.query = input.value.trim();
        state.page = 1;
        save();
        render();
      }, 250);
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      clearTimeout(timer);
      state.query = input.value.trim();
      state.page = 1;
      save();
      render();
    });
    select.addEventListener('change', () => {
      state.category = select.value;
      state.page = 1;
      save();
      render();
    });
  }

  status.tabIndex = -1;
  block.append(status, ...(form ? [bar] : []), list, empty, pager);
  render();
  block.removeAttribute('aria-busy');
}
