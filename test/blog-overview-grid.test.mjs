/* blog-overview (grid): www.airdolomiti.it/articoli's posts list (2026-11-01, 1440 and 390): a grid
   of cards (3 columns from 1025px, 2 from 600px, 1 on phones), each card one link: the post's
   image, its category chip, its title and the date only; 9 posts, then a "Load more" button (the
   block's Load more label row: "Carica altri articoli") that adds 9 more, until all are shown; no
   numbered pages. The default blog-overview (lufthansa.com's article overviews) exactly as before:
   its markup's hash is the one before the variant existed.
   Run: node --max-old-space-size=512 --test test/blog-overview-grid.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createHash } from 'node:crypto';
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

const CATS = ['Destinazioni', 'AvGeek', '#DidYouKnow', 'Throwback', 'Travellers'];
const day = (i) => `2026-${String(1 + (i % 12)).padStart(2, '0')}-${String(1 + (i % 27)).padStart(2, '0')}`;
const AD = Array.from({ length: 20 }, (_, i) => ({
  path: `/articoli/c${i % 5}/post-${i}`, title: `POST ${i}`, description: `Testo ${i}`, image: `/media_${i}.jpg`, 'image-alt': `Foto ${i}`, category: CATS[i % 5], 'publication-date': day(i), 'reading-time': 'Tempo di lettura: 2 minuti',
}));
const LH = Array.from({ length: 8 }, (_, i) => ({
  path: `/de/en/articles/highlights/a-${i}`, title: `Article ${i}`, description: `Text ${i}`, image: `/de/en/articles/highlights/media_${i}.jpg`, 'image-alt': `Image ${i}`, category: i % 2 ? 'highlights' : 'explore-flying', 'publication-date': day(i), 'reading-time': '3 min', 'page-type': 'article', tags: 'Munich', 'tag-ids': 'articles:munich',
}));
const INDEX = { '/articoli/query-index.json': AD, '/de/en/articles/query-index.json': LH };
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

const run = async ({
  cls = '', rows = [], meta = {}, pathname = '/',
}) => {
  window.location.pathname = pathname;
  document.head.innerHTML = Object.entries(meta).map(([k, v]) => `<meta name="${k}" content="${v}">`).join('');
  const block = document.createElement('div');
  block.className = `blog-overview${cls ? ` ${cls}` : ''}`;
  block.innerHTML = rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('');
  document.body.replaceChildren(block);
  try {
    await decorate(block);
  } finally {
    document.head.innerHTML = '';
  }
  return block;
};
const sha = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16);

test('the default blog-overview: its markup as before the grid variant (lufthansa.com and Air Dolomiti)', async () => {
  const lh = await run({ pathname: '/de/en/articles' });
  assert.ok(lh.querySelector('.blog-overview-pagination') !== null);
  assert.equal(lh.querySelector('.blog-overview-load-more'), null);
  const lhPaged = await run({ pathname: '/de/en/articles', rows: [['Page size', '3']] });
  const ad = await run({ meta: { brand: 'airdolomiti', language: 'it' } });
  const hashes = [sha(lh.innerHTML), sha(lhPaged.innerHTML), sha(ad.innerHTML)];
  // the hashes of the block before the variant existed (cff8cc6); Air Dolomiti's (an Italian page
  // without label rows) since its built-in texts have Italian (brief 291)
  assert.deepEqual(hashes, JSON.parse(fs.readFileSync('test/fixtures/blog-overview-default-hashes.json', 'utf8')));
});

test('grid: 9 cards, each one link with image, category chip, title and date only; Load more adds 9', async () => {
  const block = await run({
    cls: 'grid', meta: { brand: 'airdolomiti', language: 'it' }, rows: [['Load more label', 'Carica altri articoli'], ['Hide filter', 'true']],
  });
  const cards = () => [...block.querySelectorAll('.blog-overview-card')];
  assert.equal(cards().length, 9);
  const card = cards()[0];
  const link = card.querySelector(':scope > a.blog-overview-card-link');
  assert.ok(link, 'the card is one link');
  assert.equal(link.getAttribute('href'), AD.slice().sort((a, b) => b['publication-date'].localeCompare(a['publication-date']))[0].path);
  assert.ok(link.querySelector('.blog-overview-image picture, .blog-overview-image img') !== null);
  assert.equal(link.querySelector('.blog-overview-chip').textContent.length > 0, true);
  assert.ok(CATS.includes(link.querySelector('.blog-overview-chip').textContent));
  assert.match(link.querySelector('.blog-overview-title').textContent, /^POST \d+$/);
  assert.match(link.querySelector('.blog-overview-date').textContent, /^\d{1,2} [a-z]+ 2026$/);
  ['.blog-overview-description', '.blog-overview-more', '.blog-overview-info', '.blog-overview-tags'].forEach((s) => assert.equal(card.querySelector(s), null, s));
  assert.ok(block.querySelector('.blog-overview-pagination') === null || block.querySelector('.blog-overview-pagination').hidden, 'no numbered pages');
  assert.equal(block.querySelector('.blog-overview-filter'), null, 'Hide filter');
  const more = block.querySelector('button.blog-overview-load-more');
  assert.equal(more.textContent, 'Carica altri articoli');
  more.click();
  assert.equal(cards().length, 18);
  assert.ok(!block.querySelector('button.blog-overview-load-more').hidden);
  block.querySelector('button.blog-overview-load-more').click();
  assert.equal(cards().length, 20);
  assert.ok(block.querySelector('button.blog-overview-load-more').hidden, 'all shown: no button');
});

test('grid: Page size, the category filter and a Load more label default', async () => {
  const block = await run({ cls: 'grid', meta: { brand: 'airdolomiti', language: 'it' }, rows: [['Page size', '6']] });
  assert.equal(block.querySelectorAll('.blog-overview-card').length, 6);
  // the built-in Italian label (brief 291; before it the English one)
  assert.equal(block.querySelector('button.blog-overview-load-more').textContent, 'Carica altro');
  const select = block.querySelector('select');
  select.value = 'avgeek';
  select.dispatchEvent(new window.Event('change'));
  assert.equal(block.querySelectorAll('.blog-overview-card').length, 4, 'the AvGeek posts, all of them');
  assert.ok(block.querySelector('button.blog-overview-load-more').hidden);
});

test('blog-overview.css: the grid variant only (3 columns from 1025px, 2 from 600px, 1 on phones)', () => {
  const css = fs.readFileSync('blocks/blog-overview/blog-overview.css', 'utf8');
  assert.match(css, /\.blog-overview\.grid \.blog-overview-list \{[^}]*display: grid;[^}]*grid-template-columns: minmax\(0, 1fr\);/);
  assert.match(css, /@media \(width >= 600px\) \{\s*\.blog-overview\.grid \.blog-overview-list \{\s*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
  assert.match(css, /@media \(width >= 1025px\) \{[^@]*\.blog-overview\.grid \.blog-overview-list \{\s*grid-template-columns: repeat\(3, minmax\(0, 1fr\)\);/);
});
