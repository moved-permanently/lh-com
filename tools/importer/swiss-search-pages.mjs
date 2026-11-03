#!/usr/bin/env node
/**
 * SWISS's search pages (www's /<cc>/<ll>/search-results, the FAQ search bar's searchUrl): one
 * document per root with documents, the ten ch languages and the own roots (scripts/brands.js
 * SWISS_OWN_ROOTS: kr/ko). The market roots get their language's page from lh-edge's market route
 * (no markets row: every market root of the language), and its block reads the page root's own
 * search index (no index row: the block's /<cc>/<ll>/search-index.json, on SWISS's hosts the
 * language index lh-edge answers for it).
 *
 * - the search-results block: label rows only for the languages it has no texts for (it, pt, zh,
 *   ja, el, ru, ko; en, de, fr and es are www's, blocks/search-results); the input label is www's
 *   FAQ search bar placeholder ("Search for topic" in the root's language), the others the
 *   replica's own wording (www's label bundle is not recorded for these languages)
 * - metadata: the root's nav and footer, Robots noindex, nofollow (as www's corporate search
 *   page), hide-in-search true (left out of the results), Parent the root's homepage
 *
 * Usage: node tools/importer/swiss-search-pages.mjs [--roots ch/en,kr/ko] [--content-dir dir]
 *   (default: ch/<ll> into content-sites/lh-swiss/content, kr/ko into
 *   content-sites/lh-swiss-mk/content, where their other documents are)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SWISS_OWN_ROOTS } from '../../scripts/brands.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export const CH_LANGUAGES = ['en', 'de', 'fr', 'it', 'es', 'pt', 'zh', 'ja', 'el', 'ru'];
export const ROOTS = [...CH_LANGUAGES.map((l) => `ch/${l}`), ...Object.keys(SWISS_OWN_ROOTS)];

// the page's heading (www's corporate search pages: Search results, Suchergebnisse, Résultats
// de recherche; the others in the same wording)
export const HEADINGS = {
  en: 'Search results',
  de: 'Suchergebnisse',
  fr: 'Résultats de recherche',
  it: 'Risultati della ricerca',
  es: 'Resultados de búsqueda',
  pt: 'Resultados da pesquisa',
  zh: '搜索结果',
  ja: '検索結果',
  el: 'Αποτελέσματα αναζήτησης',
  ru: 'Результаты поиска',
  ko: '검색 결과',
};

// the block's label rows ({QUERY}, {NUMBER} and {PAGE} as the block replaces them)
export const LABELS = {
  it: {
    'Input label': 'Cercare per argomento',
    'Search button label': 'Cerca',
    'Search for label': 'La tua ricerca per {QUERY}',
    'Results label': '{NUMBER} risultati',
    'No results label': 'Nessun risultato trovato. Modifica la ricerca e riprova.',
    'Failed label': 'Non è stato possibile caricare i risultati della ricerca.',
    'Failed sr label': 'Non è stato possibile caricare i risultati della ricerca.',
    'Success sr label': 'Risultati della ricerca caricati.',
    'Pagination label': 'Paginazione in basso',
    'Previous label': 'Pagina precedente',
    'Next label': 'Pagina successiva',
    'Page label': 'Pagina {PAGE}',
  },
  pt: {
    'Input label': 'Procurar tópico',
    'Search button label': 'Pesquisar',
    'Search for label': 'A sua pesquisa por {QUERY}',
    'Results label': '{NUMBER} resultados',
    'No results label': 'Não foram encontrados resultados. Refine a sua pesquisa e tente novamente.',
    'Failed label': 'Não foi possível carregar os resultados da pesquisa.',
    'Failed sr label': 'Não foi possível carregar os resultados da pesquisa.',
    'Success sr label': 'Resultados da pesquisa carregados.',
    'Pagination label': 'Paginação inferior',
    'Previous label': 'Página anterior',
    'Next label': 'Página seguinte',
    'Page label': 'Página {PAGE}',
  },
  zh: {
    'Input label': '搜索主题',
    'Search button label': '搜索',
    'Search for label': '{QUERY} 的搜索结果',
    'Results label': '{NUMBER} 条结果',
    'No results label': '未找到结果。请调整搜索内容后重试。',
    'Failed label': '无法加载您的搜索结果。',
    'Failed sr label': '无法加载您的搜索结果。',
    'Success sr label': '搜索结果已加载。',
    'Pagination label': '底部分页',
    'Previous label': '上一页',
    'Next label': '下一页',
    'Page label': '第 {PAGE} 页',
  },
  ja: {
    'Input label': 'トピックの検索',
    'Search button label': '検索',
    'Search for label': '{QUERY} の検索結果',
    'Results label': '{NUMBER} 件の結果',
    'No results label': '結果が見つかりませんでした。検索条件を変更して、もう一度お試しください。',
    'Failed label': '検索結果を読み込めませんでした。',
    'Failed sr label': '検索結果を読み込めませんでした。',
    'Success sr label': '検索結果を読み込みました。',
    'Pagination label': '下部のページ送り',
    'Previous label': '前のページ',
    'Next label': '次のページ',
    'Page label': '{PAGE} ページ',
  },
  el: {
    'Input label': 'Αναζήτηση θέματος',
    'Search button label': 'Αναζήτηση',
    'Search for label': 'Η αναζήτησή σας για {QUERY}',
    'Results label': '{NUMBER} αποτελέσματα',
    'No results label': 'Δεν βρέθηκαν αποτελέσματα. Προσαρμόστε την αναζήτησή σας και δοκιμάστε ξανά.',
    'Failed label': 'Δεν ήταν δυνατή η φόρτωση των αποτελεσμάτων αναζήτησης.',
    'Failed sr label': 'Δεν ήταν δυνατή η φόρτωση των αποτελεσμάτων αναζήτησης.',
    'Success sr label': 'Τα αποτελέσματα αναζήτησης φορτώθηκαν.',
    'Pagination label': 'Σελιδοποίηση στο κάτω μέρος',
    'Previous label': 'Προηγούμενη σελίδα',
    'Next label': 'Επόμενη σελίδα',
    'Page label': 'Σελίδα {PAGE}',
  },
  ru: {
    'Input label': 'Найти тему',
    'Search button label': 'Найти',
    'Search for label': 'Результаты поиска по запросу {QUERY}',
    'Results label': 'Результатов: {NUMBER}',
    'No results label': 'Ничего не найдено. Измените запрос и попробуйте ещё раз.',
    'Failed label': 'Не удалось загрузить результаты поиска.',
    'Failed sr label': 'Не удалось загрузить результаты поиска.',
    'Success sr label': 'Результаты поиска загружены.',
    'Pagination label': 'Нумерация страниц внизу',
    'Previous label': 'Предыдущая страница',
    'Next label': 'Следующая страница',
    'Page label': 'Страница {PAGE}',
  },
  ko: {
    'Input label': '주제 검색',
    'Search button label': '검색',
    'Search for label': '{QUERY}에 대한 검색 결과',
    'Results label': '검색 결과 {NUMBER}건',
    'No results label': '검색 결과가 없습니다. 검색어를 바꿔 다시 시도해 주세요.',
    'Failed label': '검색 결과를 불러올 수 없습니다.',
    'Failed sr label': '검색 결과를 불러올 수 없습니다.',
    'Success sr label': '검색 결과를 불러왔습니다.',
    'Pagination label': '하단 페이지 탐색',
    'Previous label': '이전 페이지',
    'Next label': '다음 페이지',
    'Page label': '{PAGE} 페이지',
  },
};

const row = (k, v) => `<div><div>${k}</div><div>${v}</div></div>`;

// the sub-sites without a results page on www (medical services: its magnifier searches ?query= on
// the page itself): their own, on their own index (helix-query.yaml search-medicalservices-<ll>);
// a sub-site page's locale is ch/<ll>, so the block names the index (as corporate's pages do)
export const SUB_ROOTS = ['medicalservices/en', 'medicalservices/de'];

/** The search page's document (.plain.html) of a root ("ch/en", "kr/ko", "medicalservices/en"). */
export function searchPage(key) {
  const lang = key.split('/')[1];
  const h1 = HEADINGS[lang];
  if (!h1) throw new Error(`no heading for ${key}`);
  const sub = SUB_ROOTS.includes(key);
  const index = sub ? `<div><div>/${key}/search-index.json</div></div>` : '';
  const labels = Object.entries(LABELS[lang] || {}).map(([k, v]) => row(k, v)).join('');
  const meta = [
    row('nav', `/${key}/nav`),
    row('footer', `/${key}/footer`),
    row('Robots', 'noindex, nofollow'),
    row('Title', `${h1} | SWISS`),
    row('og:title', h1),
    row('Theme', 'flow-spacing'),
    row('hide-in-search', 'true'),
    ...(sub ? [] : [row('Parent', `<a href="/${key}/homepage">/${key}/homepage</a>`)]),
  ].join('');
  return `<div><h1>${h1}</h1><div class="search-results">${index}${labels}</div><div class="metadata">${meta}</div></div>\n`;
}

/**
 * Where a root's documents are (ch/<ll>: swiss-import's; the own roots: the market importer's; the
 * sub-sites: swiss-sub-import's).
 */
export function contentDirOf(key) {
  let site = 'lh-swiss-mk';
  if (key.startsWith('ch/')) site = 'lh-swiss';
  else if (SUB_ROOTS.includes(key)) site = 'lh-swiss-sub';
  return path.join(root, 'content-sites', site, 'content');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const opt = (name) => {
    const i = process.argv.indexOf(`--${name}`);
    return i > 0 ? process.argv[i + 1] : undefined;
  };
  const roots = opt('roots') ? opt('roots').split(',') : [...ROOTS, ...SUB_ROOTS];
  roots.forEach((key) => {
    const f = path.join(opt('content-dir') || contentDirOf(key), key, 'search-results.plain.html');
    fs.mkdirSync(path.dirname(f), { recursive: true });
    fs.writeFileSync(f, searchPage(key));
    console.log(`/${key}/search-results`, path.relative(root, f));
  });
}
