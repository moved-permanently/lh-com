/* blog-overview's Category row (blocks/blog-overview): the posts' category metadata as before
   (#didyouknow), now also without its # and in any case (didyouknow, DidYouKnow), else the posts'
   folder, the path segment before the post (Air Dolomiti's /articoli/didyouknow/,
   /en/articles/dyk/, /de/artikel/reiseziele/: a category page can name its folder). A category
   match wins over a folder match; lufthansa.com's categories (highlights, explore-flying) as
   before.
   Run: node --max-old-space-size=512 --test test/blog-overview-category.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'main--lh-airdolomiti--moved-permanently.aem.page', pathname: '/', search: '', hash: '', replace: () => {}, href: 'https://main--lh-airdolomiti--moved-permanently.aem.page/', origin: 'https://main--lh-airdolomiti--moved-permanently.aem.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
window.history = { state: null, replaceState: () => {} };
Object.defineProperty(window.HTMLSelectElement.prototype, 'value', {
  configurable: true,
  get() { return (this.querySelector('option[selected]') || this.querySelector('option') || {}).value || ''; },
  set(v) { [...this.querySelectorAll('option')].forEach((o) => o.toggleAttribute('selected', o.value === v)); },
});
globalThis.window = window;
globalThis.document = document;

const post = (path, category, date) => ({
  path, title: path.split('/').pop(), description: '', image: '', 'image-alt': '', category, 'publication-date': date, 'reading-time': '',
});
const INDEX = {
  '/articoli/query-index.json': [
    post('/articoli/didyouknow/x', '#DidYouKnow', '2024-01-01'),
    post('/articoli/avgeek/y', 'AvGeek', '2024-02-01'),
  ],
  '/en/articles/query-index.json': [
    post('/en/articles/dyk/a', '#DidYouKnow', '2024-01-01'),
    post('/en/articles/avgeek-en/b', 'AvGeek', '2024-02-01'),
  ],
  '/de/en/articles/query-index.json': [
    { ...post('/de/en/articles/highlights/h', 'highlights', '2026-01-02'), 'page-type': 'article' },
    { ...post('/de/en/articles/highlights/f', 'explore-flying', '2026-01-03'), 'page-type': 'article' },
    { ...post('/de/en/articles/explore-flying/e', 'explore-flying', '2026-01-04'), 'page-type': 'article' },
  ],
};
beforeEach(() => {
  globalThis.fetch = async (url) => {
    const href = String(url).split('?')[0];
    if (INDEX[href]) {
      return new Response(JSON.stringify({
        total: INDEX[href].length, offset: 0, limit: 500, data: INDEX[href],
      }), { headers: { 'content-type': 'application/json' } });
    }
    if (href.includes('/data/recorded/')) return new Response(JSON.stringify({ entries: {} }));
    return new Response('{}', { status: 404, headers: { 'content-type': 'application/json' } });
  };
});

const { default: decorate } = await import('../blocks/blog-overview/blog-overview.js');

const run = async (meta, category, pathname = '/') => {
  window.location.pathname = pathname;
  document.head.innerHTML = Object.entries(meta).map(([k, v]) => `<meta name="${k}" content="${v}">`).join('');
  const block = document.createElement('div');
  block.className = 'blog-overview';
  block.innerHTML = `<div><div>Category</div><div>${category}</div></div>`;
  document.body.replaceChildren(block);
  try {
    await decorate(block);
  } finally {
    document.head.innerHTML = '';
  }
  return [...block.querySelectorAll('.blog-overview-title a')].map((a) => a.getAttribute('href'));
};

test('Category: the metadata with or without #, any case', async () => {
  const it = { brand: 'airdolomiti', language: 'it' };
  const values = ['#didyouknow', '#DidYouKnow', 'didyouknow', 'DidYouKnow'];
  const shown = await values.reduce(async (acc, value) => [...await acc, await run(it, value)], []);
  shown.forEach((paths, i) => assert.deepEqual(paths, ['/articoli/didyouknow/x'], values[i]));
  assert.deepEqual(await run(it, 'AVGEEK'), ['/articoli/avgeek/y']);
});

test('Category: the folder when no category matches (Air Dolomiti\'s English dyk, avgeek-en)', async () => {
  const en = { brand: 'airdolomiti', language: 'en' };
  assert.deepEqual(await run(en, 'dyk'), ['/en/articles/dyk/a']);
  assert.deepEqual(await run(en, 'avgeek-en'), ['/en/articles/avgeek-en/b']);
  assert.deepEqual(await run(en, 'DYK'), ['/en/articles/dyk/a'], 'any case');
  assert.deepEqual(await run(en, 'nothing-like-it'), [], 'no match: no posts, as before');
});

test('lufthansa.com: a category match wins over a folder of the same name, as before', async () => {
  // /de/en/articles/highlights/f is in the highlights folder but its category is explore-flying
  assert.deepEqual(await run({}, 'highlights', '/de/en/articles'), ['/de/en/articles/highlights/h']);
  assert.deepEqual(await run({}, 'explore-flying', '/de/en/articles'), ['/de/en/articles/explore-flying/e', '/de/en/articles/highlights/f']);
});
