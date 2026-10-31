/* eslint-disable import/no-extraneous-dependencies -- js-yaml is a dev dependency */
/* Air Dolomiti's posts list (/articoli on lh-airdolomiti): helix-query.yaml articles-airdolomiti-it
   (/articoli/<category>/<post> -> /articoli/query-index.json, appended: every other index as
   before), scripts/brands.js articleIndex, scripts/articles.js loadArticles with the page's brand,
   blocks/blog-overview on a brand page: its posts, its category names, the language's dates.
   lufthansa.com: its /<root>/articles/query-index.json, page-type "article" only, as before.
   Run: node --max-old-space-size=512 --test test/airdolomiti-blog-index.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import yaml from 'js-yaml';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
// the block's imports load scripts.js: on a demo host's / it only redirects (stubbed), it
// decorates nothing
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'main--lh-airdolomiti--moved-permanently.aem.page', pathname: '/', search: '', replace: () => {}, href: 'https://main--lh-airdolomiti--moved-permanently.aem.page/', origin: 'https://main--lh-airdolomiti--moved-permanently.aem.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
window.history = { state: null, replaceState: () => {} };
// linkedom's select has no value setter (the block sets the category filter's value)
Object.defineProperty(window.HTMLSelectElement.prototype, 'value', {
  configurable: true,
  get() { return (this.querySelector('option[selected]') || this.querySelector('option') || {}).value || ''; },
  set(v) { [...this.querySelectorAll('option')].forEach((o) => o.toggleAttribute('selected', o.value === v)); },
});
globalThis.window = window;
globalThis.document = document;

const POSTS = [
  {
    path: '/articoli/avgeek/i-flap', title: 'I FLAP', description: 'Come ogni altro organo mobile degli aerei', image: '/articoli/avgeek/media_1.png', 'image-alt': 'flap', category: 'AvGeek', 'publication-date': '2023-07-19', 'reading-time': 'Tempo di lettura: 2 minuti',
  },
  {
    path: '/articoli/destinazioni/verona', title: 'Verona', description: 'La città', image: '/articoli/destinazioni/media_2.png', 'image-alt': '', category: 'Destinazioni', 'publication-date': '2024-03-02', 'reading-time': 'Tempo di lettura: 3 minuti',
  },
  {
    path: '/articoli/didyouknow/x', title: 'Lo sapevi', description: '', image: '', 'image-alt': '', category: '#DidYouKnow', 'publication-date': '2022-11-30', 'reading-time': '',
  },
];
const LH = [
  {
    path: '/de/en/articles/highlights/a', title: 'A', 'page-type': 'article', category: 'highlights', 'publication-date': '2026-01-02',
  },
  {
    path: '/de/en/articles/highlights', title: 'Highlights', 'page-type': 'overview', category: 'highlights',
  },
];
let calls;
beforeEach(() => {
  calls = [];
  globalThis.fetch = async (url) => {
    const href = String(url);
    calls.push(href);
    const sheet = (data) => new Response(JSON.stringify({
      total: data.length, offset: 0, limit: 500, data,
    }), { headers: { 'content-type': 'application/json' } });
    if (href.startsWith('/articoli/query-index.json')) return sheet(POSTS);
    if (href.startsWith('/de/en/articles/query-index.json')) return sheet(LH);
    if (href.includes('/data/recorded/')) return new Response(JSON.stringify({ entries: {} }));
    return new Response('{}', { status: 404, headers: { 'content-type': 'application/json' } });
  };
});

const { loadArticles } = await import('../scripts/articles.js');
const { BRANDS } = await import('../scripts/brands.js');
const { default: decorate } = await import('../blocks/blog-overview/blog-overview.js');

const onPage = async (meta, fn) => {
  document.head.innerHTML = Object.entries(meta).map(([k, v]) => `<meta name="${k}" content="${v}">`).join('');
  try {
    return await fn();
  } finally {
    document.head.innerHTML = '';
  }
};

test('helix-query.yaml: the posts index appended, every other index as before', () => {
  const now = yaml.load(fs.readFileSync('helix-query.yaml', 'utf8')).indices;
  const ad = now['articles-airdolomiti-it'];
  assert.deepEqual(ad.include, ['/articoli/*/*']);
  assert.equal(ad.target, '/articoli/query-index.json');
  ['title', 'description', 'image', 'image-alt', 'category', 'publication-date', 'reading-time', 'lastModified']
    .forEach((p) => assert.ok(ad.properties[p], p));
  assert.equal(ad.properties.title.select, 'main .article-header h1');
  assert.equal(ad.properties.category.select, 'head > meta[name="category"]');
  const before = yaml.load(execFileSync('git', ['show', 'HEAD:helix-query.yaml'], { encoding: 'utf8' })).indices;
  Object.keys(before).filter((k) => k !== 'articles-airdolomiti-it').forEach((k) => {
    assert.equal(JSON.stringify(now[k]), JSON.stringify(before[k]), k);
  });
  assert.equal(Object.keys(now).pop(), 'articles-airdolomiti-it', 'appended at the end');
});

test('loadArticles: a brand\'s own index (every row a post); lufthansa.com\'s as before', async () => {
  assert.deepEqual(BRANDS.airdolomiti.articleIndex, { it: '/articoli/query-index.json' });
  const posts = await loadArticles({ key: 'de/en', lang: 'it' }, BRANDS.airdolomiti);
  assert.deepEqual(posts.map((p) => p.path), ['/articoli/destinazioni/verona', '/articoli/avgeek/i-flap', '/articoli/didyouknow/x'], 'newest first');
  assert.deepEqual(posts.map((p) => [p.category, p.categoryName]), [['destinazioni', 'Destinazioni'], ['avgeek', 'AvGeek'], ['#didyouknow', '#DidYouKnow']]);
  assert.ok(calls.some((c) => c.startsWith('/articoli/query-index.json')));
  const lh = await loadArticles({ key: 'de/en', lang: 'en' });
  assert.deepEqual(lh.map((a) => a.path), ['/de/en/articles/highlights/a'], 'page-type article only');
  assert.ok(calls.some((c) => c.startsWith('/de/en/articles/query-index.json')));
  // a brand language without an index: lufthansa.com's way (the locale's index)
  calls = [];
  await loadArticles({ key: 'de/en', lang: 'en' }, BRANDS.airdolomiti);
  assert.ok(calls.every((c) => !c.startsWith('/articoli/')));
});

test('blog-overview on Air Dolomiti\'s /articoli: its posts, its category names, Italian dates', async () => {
  const block = document.createElement('div');
  block.className = 'blog-overview';
  document.body.replaceChildren(block);
  await onPage({ brand: 'airdolomiti', language: 'it' }, () => decorate(block));
  const cards = [...block.querySelectorAll('.blog-overview-card')];
  assert.deepEqual(cards.map((c) => c.querySelector('.blog-overview-title a').getAttribute('href')), ['/articoli/destinazioni/verona', '/articoli/avgeek/i-flap', '/articoli/didyouknow/x']);
  assert.equal(cards[1].querySelector('.blog-overview-info span').textContent, '19 luglio 2023');
  assert.deepEqual([...block.querySelectorAll('option')].map((o) => [o.value, o.textContent]).slice(1), [
    ['#didyouknow', '#DidYouKnow'], ['avgeek', 'AvGeek'], ['destinazioni', 'Destinazioni']]);
  // (the index itself: loadArticles above; the module keeps the sheet it fetched once)
});
