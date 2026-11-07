/* blog-overview on lufthansa.com's tag and author pages (brief 461): www's lists there start with
   the picture (picture | text, then text | picture, ...; /de/en/articles/tags/allegris,
   tags/munich, authors/florian-tomberg at 1440), its category lists with the text (highlights,
   explore-flying). A list with a Tag or an Author row gets the class blog-overview-image-first,
   and lufthansa.com's theme swaps the order for it from 768 px; category lists as before.
   Run: node --max-old-space-size=512 --test test/blog-overview-image-first-461.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'main--lh-com--moved-permanently.aem.page', pathname: '/', search: '', hash: '', replace: () => {}, href: 'https://main--lh-com--moved-permanently.aem.page/', origin: 'https://main--lh-com--moved-permanently.aem.page',
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

const run = async (row, value) => {
  window.location.pathname = '/de/en/articles/tags/allegris';
  const block = document.createElement('div');
  block.className = 'blog-overview';
  block.innerHTML = `<div><div>${row}</div><div>${value}</div></div>`;
  document.body.replaceChildren(block);
  await decorate(block);
  return block;
};

test('a Tag or an Author list: image first; a Category list: as before', async () => {
  assert.ok((await run('Tag', 'articles:allegris')).classList.contains('blog-overview-image-first'));
  assert.ok((await run('Author', 'florian-tomberg')).classList.contains('blog-overview-image-first'));
  assert.ok(!(await run('Category', 'highlights')).classList.contains('blog-overview-image-first'));
});

test('lufthansa.com: odd cards picture | text, even text | picture from 768 px', () => {
  const css = fs.readFileSync(new URL('../blocks/blog-overview/blog-overview.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  const media = css.slice(css.indexOf('@media (width >= 768px) { .blog-overview .blog-overview-list'));
  assert.ok(media.includes('body.brand-lufthansa .blog-overview.blog-overview-image-first .blog-overview-card:nth-child(odd) .blog-overview-image { order: -1; }'));
  assert.ok(media.includes('body.brand-lufthansa .blog-overview.blog-overview-image-first .blog-overview-card:nth-child(even) .blog-overview-image { order: 0; }'));
});
