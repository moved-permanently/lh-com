import { getLocale } from '../../scripts/locale.js';

/**
 * Search bar: www's dcep-search-bar (SWISS's FAQ "Search for topic"). The block's first row is a
 * link to the root's results page (the search-results block), its text the field's label and
 * placeholder; a "Button label" row names the button (else the page language's word). The form
 * opens the results page with ?query=<term> (www's searchUrl ".../search-results?query=%q%");
 * an empty term opens nothing. On a market root the link is the root's own page (lh-edge's market
 * route rewrites it), so each root searches its own index.
 */
export const LABELS = {
  en: 'Search',
  de: 'Suchen',
  fr: 'Rechercher',
  it: 'Cerca',
  es: 'Buscar',
  pt: 'Pesquisar',
  el: 'Αναζήτηση',
  ja: '検索',
  ru: 'Поиск',
  zh: '搜索',
  ko: '검색',
  nl: 'Zoeken',
  pl: 'Szukaj',
};

/** The results page for a term: the parameter www leaves empty or as %q%, else query. */
export function resultsUrl(href, term, base = window.location.href) {
  const url = new URL(href, base);
  const param = [...url.searchParams.entries()].find(([, v]) => !v || /%q%/.test(v));
  url.searchParams.set(param ? param[0] : 'query', term);
  return `${url.pathname}${url.search}`;
}

let instances = 0;

export default async function decorate(block) {
  const rows = [...block.children];
  const a = block.querySelector('a[href]');
  if (!a) return;
  const label = a.textContent.trim();
  const href = a.getAttribute('href');
  const buttonRow = rows.find((r) => /^button label$/i.test((r.children[0]?.textContent || '').trim()));
  let lang = 'en';
  try {
    lang = getLocale().lang || lang;
  } catch (e) {
    lang = (document.documentElement.lang || lang).slice(0, 2);
  }
  const authored = buttonRow && buttonRow.children[1]?.textContent.trim();
  const buttonLabel = authored || LABELS[lang] || LABELS.en;

  instances += 1;
  const id = `search-bar-${instances}-input`;
  const form = document.createElement('form');
  form.className = 'search-bar-form';
  form.setAttribute('role', 'search');
  form.setAttribute('action', href);
  const labelEl = document.createElement('label');
  labelEl.className = 'search-bar-label';
  labelEl.setAttribute('for', id);
  labelEl.textContent = label;
  const input = document.createElement('input');
  input.className = 'search-bar-input';
  input.id = id;
  input.setAttribute('type', 'search');
  input.setAttribute('name', 'query');
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('placeholder', label);
  const button = document.createElement('button');
  button.className = 'search-bar-submit';
  button.setAttribute('type', 'submit');
  button.setAttribute('aria-label', buttonLabel);
  form.append(labelEl, input, button);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const term = input.value.trim();
    if (!term) {
      input.focus();
      return;
    }
    window.location.href = resultsUrl(href, term);
  });
  block.replaceChildren(form);
}
