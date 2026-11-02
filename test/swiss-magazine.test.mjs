/* eslint-disable max-len */
/* SWISS's magazine on lh-swiss (www.swiss.com/magazine/<ll>/, de and en; the capture of 2026-11-02,
   swiss-snapshots-033 to 036): the third sub-site of scripts/site-languages.js SUB_SITES, with its
   articles' own index (articleIndex: /magazine/<ll>/query-index.json, helix-query.yaml
   magazine-<ll>; scripts/articles.js reads a sub-site's before its brand's, its non-article rows
   left out). Its overview pages are blog-overview (grid) lists over that index as www's teaser
   containers: Path (the articles under a section or category), Page size, Load more (false: the
   front and section pages' five latest per row). The other sites and lh-com as before.
   Run: node --max-old-space-size=512 --test test/swiss-magazine.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'main--lh-swiss--moved-permanently.aem.page', pathname: '/', search: '', hash: '', replace: () => {}, href: 'https://main--lh-swiss--moved-permanently.aem.page/', origin: 'https://main--lh-swiss--moved-permanently.aem.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
window.history = { state: null, replaceState: () => {} };
globalThis.window = window;
globalThis.document = document;

const row = (path, category, date, extra = {}) => ({
  path, title: path.split('/').pop(), description: '', image: `${path}/media_1.jpg`, 'image-alt': 'x', category, 'publication-date': date, 'page-type': 'article', ...extra,
});
const DE = [
  row('/magazine/de/reisen/destinationen/paris', 'Destinationen', '2026-10-12'),
  row('/magazine/de/reisen/destinationen/grape-escape', 'Destinationen', '2026-08-25'),
  row('/magazine/de/reisen/lifestyle/kids', 'Lifestyle', '2026-07-01'),
  row('/magazine/de/reisen/reisegeschichten/seoul', 'Reisegeschichten', '2026-06-01'),
  row('/magazine/de/reisen/destinationen/bologna', 'Destinationen', '2026-07-15'),
  row('/magazine/de/reisen/destinationen/toronto', 'Destinationen', '2026-08-01'),
  row('/magazine/de/reisen/destinationen/florence', 'Destinationen', '2026-08-04'),
  row('/magazine/de/inside-swiss/behind-the-scenes/b777', 'Hinter den Kulissen', '2026-02-21'),
  { path: '/magazine/de/reisen', title: 'Reisen', 'page-type': 'overview' },
  { path: '/magazine/de/contact', title: 'Kontakt', 'page-type': 'page' },
];
const INDEX = { '/magazine/de/query-index.json': DE };
let fetched;
beforeEach(() => {
  fetched = [];
  globalThis.fetch = async (url) => {
    const href = String(url).split('?')[0];
    fetched.push(href);
    if (INDEX[href]) {
      const body = {
        total: INDEX[href].length, offset: 0, limit: 500, data: INDEX[href],
      };
      return new Response(JSON.stringify(body), { headers: { 'content-type': 'application/json' } });
    }
    if (href.includes('/data/recorded/')) return new Response(JSON.stringify({ entries: {} }));
    return new Response('{}', { status: 404, headers: { 'content-type': 'application/json' } });
  };
});

const { SUB_SITES } = await import('../scripts/site-languages.js');
const { getLocale } = await import('../scripts/locale.js');
const { loadArticles } = await import('../scripts/articles.js');
const { default: decorate } = await import('../blocks/blog-overview/blog-overview.js');

const withPage = async (metas, fn) => {
  document.head.innerHTML = Object.entries(metas).map(([k, v]) => `<meta name="${k}" content="${v}">`).join('');
  try { return await fn(); } finally { document.head.innerHTML = ''; }
};
const run = async (pathname, rows) => {
  window.location.pathname = pathname;
  return withPage({ brand: 'swiss' }, async () => {
    const block = document.createElement('div');
    block.className = 'blog-overview grid';
    block.innerHTML = rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('');
    document.body.replaceChildren(block);
    await decorate(block);
    return block;
  });
};
const cards = (block) => [...block.querySelectorAll('.blog-overview-card a')].map((a) => a.getAttribute('href'));

test('SUB_SITES: the magazine (de, en), its front pages (/magazine/<ll>, a page itself), www\'s language names, the language list in the bar, its articles\' index per language', () => {
  const mag = SUB_SITES.swiss.find((s) => s.name === 'magazine');
  assert.deepEqual(mag.languages.map((l) => [l.lang, l.home, l.name]), [['de', '/magazine/de', 'German'], ['en', '/magazine/en', 'English']]);
  assert.deepEqual(mag.header, { languages: 'bar' });
  assert.deepEqual(mag.articleIndex, { de: '/magazine/de/query-index.json', en: '/magazine/en/query-index.json' });
  assert.deepEqual(SUB_SITES.swiss.map((s) => s.name), ['corporate', 'medicalservices', 'magazine']);
});

test('a magazine page: its language, base and articles\' index', async () => {
  await withPage({ brand: 'swiss' }, () => {
    const l = getLocale('/magazine/de/reisen/destinationen/paris');
    assert.equal(l.lang, 'de');
    assert.equal(l.base, '/magazine/de');
    assert.equal(l.subSite.name, 'magazine');
    assert.deepEqual(l.subSite.articleIndex, { de: '/magazine/de/query-index.json', en: '/magazine/en/query-index.json' });
    assert.equal(getLocale('/corporate/de/careers').subSite.articleIndex, undefined);
  });
});

test('loadArticles: a sub-site\'s index before the brand\'s; its rows of another page type left out; newest first', async () => {
  const list = await loadArticles({ key: 'ch/de', lang: 'de', subSite: { articleIndex: { de: '/magazine/de/query-index.json' } } }, { articleIndex: { de: '/other.json' } });
  assert.ok(fetched.includes('/magazine/de/query-index.json') && !fetched.includes('/other.json'));
  assert.equal(list.length, 8, 'the overview and contact rows out');
  assert.equal(list[0].path, '/magazine/de/reisen/destinationen/paris');
  assert.equal(list[0].categoryName, 'Destinationen');
});

test('blog-overview (grid) on a section page: Path, Page size 5, Load more false: the five latest under the path, no button', async () => {
  const block = await run('/magazine/de/reisen', [['Path', '/magazine/de/reisen/destinationen'], ['Page size', '5'], ['Load more', 'false'], ['Hide filter', 'true']]);
  assert.deepEqual(cards(block), ['/magazine/de/reisen/destinationen/paris', '/magazine/de/reisen/destinationen/grape-escape', '/magazine/de/reisen/destinationen/florence', '/magazine/de/reisen/destinationen/toronto', '/magazine/de/reisen/destinationen/bologna']);
  assert.equal(block.querySelector('.blog-overview-load-more'), null);
  assert.equal(block.querySelector('.blog-overview-chip').textContent, 'Destinationen');
});

test('blog-overview (grid) on a category page: Path and Load more (as before: true)', async () => {
  const block = await run('/magazine/de/reisen', [['Path', '/magazine/de/reisen'], ['Page size', '3'], ['Hide filter', 'true']]);
  assert.equal(cards(block).length, 3);
  assert.ok(cards(block).every((h) => h.startsWith('/magazine/de/reisen/')));
  assert.ok(block.querySelector('.blog-overview-load-more'), 'Load more');
});
