/* eslint-disable max-len */
/* Standing order 30 (2026-11-15), item 1: blog-overview's pagination as www's maui-pagination. Its narrow form (pager
   narrower than 650px: first, previous, "Page N", next, last) next to the page numbers, in a list of its own
   (ul.blog-overview-pages-narrow) so the numbered list keeps its items (the tag pages' rule counts them). Shown by
   lufthansa.com's theme only, below 650px of pager width (blog-overview.css): www's /de/en/articles/explore-flying at
   390 (lh-parity-007) shows "Page 1" between the arrows.
   Run: node --max-old-space-size=512 --test test/blog-overview-pagination-narrow-so30.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'lufthansa.turnsthe.page', pathname: '/de/en/articles', search: '', hash: '', replace: () => {}, href: 'https://lufthansa.turnsthe.page/de/en/articles', origin: 'https://lufthansa.turnsthe.page',
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

const post = (i) => ({
  path: `/de/en/articles/explore-flying/a${i}`, title: `A${i}`, description: '', image: '', 'image-alt': '', category: 'explore-flying', 'publication-date': `2026-01-${String(i).padStart(2, '0')}`, 'reading-time': '', 'page-type': 'article',
});
const INDEX = { '/de/en/articles/query-index.json': Array.from({ length: 20 }, (_, i) => post(i + 1)) };
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

window.HTMLElement.prototype.scrollIntoView = () => {};
window.HTMLElement.prototype.focus = () => {};
const { default: decorate } = await import('../blocks/blog-overview/blog-overview.js');

const run = async () => {
  const block = document.createElement('div');
  block.className = 'blog-overview';
  block.innerHTML = '<div><div>Category</div><div>explore-flying</div></div>';
  document.body.replaceChildren(block);
  await decorate(block);
  return block;
};

test('the pager: the numbered list as before, and the narrow form first, previous, "Page 1", next, last', async () => {
  const block = await run();
  const lists = [...block.querySelectorAll('.blog-overview-pagination > ul')];
  assert.equal(lists.length, 2);
  const [wide, narrow] = lists;
  assert.ok(!wide.classList.contains('blog-overview-pages-narrow'));
  assert.deepEqual([...wide.querySelectorAll('li')].map((li) => li.textContent.trim() || li.firstElementChild.className), ['blog-overview-prev', '1', '2', '3', '4', 'blog-overview-next']);
  assert.ok(narrow.classList.contains('blog-overview-pages-narrow'));
  const items = [...narrow.children];
  assert.deepEqual(items.map((li) => li.className || li.firstElementChild.className), ['blog-overview-first', 'blog-overview-prev', 'blog-overview-page-text', 'blog-overview-next', 'blog-overview-last']);
  assert.equal(items[2].textContent, 'Page 1');
  assert.ok(items[0].firstElementChild.disabled && items[1].firstElementChild.disabled, 'first and previous disabled on page 1');
  assert.ok(!items[3].firstElementChild.disabled && !items[4].firstElementChild.disabled);
  assert.equal(items[4].firstElementChild.getAttribute('aria-label'), 'Page 4');
});

test('last: page 4, the text and the buttons follow', async () => {
  const block = await run();
  block.querySelector('.blog-overview-pages-narrow .blog-overview-last').click();
  await new Promise((r) => { setTimeout(r, 0); });
  const items = [...block.querySelector('.blog-overview-pages-narrow').children];
  assert.equal(items[2].textContent, 'Page 4');
  assert.ok(items[3].firstElementChild.disabled && items[4].firstElementChild.disabled);
});

test('the stylesheet: hidden by default, lufthansa.com shows it below 650px of pager width', async () => {
  const fs = await import('node:fs');
  const css = fs.readFileSync(new URL('../blocks/blog-overview/blog-overview.css', import.meta.url), 'utf8');
  assert.match(css, /\.blog-overview \.blog-overview-pagination \.blog-overview-pages-narrow \{\n {2}display: none;\n\}/);
  assert.match(css, /body\.brand-lufthansa \.blog-overview \.blog-overview-pagination \{\n {2}container-type: inline-size;\n\}/);
  const at = css.indexOf('@container (width < 650px)');
  assert.ok(at > 0);
  const block = css.slice(at, css.indexOf('\n}\n', at));
  assert.match(block, /ul:not\(\.blog-overview-pages-narrow\) \{\n {4}display: none;/);
  assert.match(block, /ul\.blog-overview-pages-narrow \{\n {4}display: flex;/);
});
