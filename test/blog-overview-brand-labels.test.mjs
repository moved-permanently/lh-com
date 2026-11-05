/* eslint-disable max-len, no-restricted-syntax, no-await-in-loop -- dev tooling */
/* blog-overview on a brand site (brief 406): www.lufthansa.com's label bundle blogOverview is
   lufthansa.com's (GET /service/api/labels/blogOverview/{tenant}/{lang}) and refuses the brands'
   hosts (CORS: swiss.turnsthe.page's magazine asked for .../lx/en and .../lx/de and was refused on
   every list since the magazine went up, 4ac777b). A brand page's lists ask www for nothing: their
   texts are the block's own (DEFAULT_LABELS of the page's language) and the authored rows, the
   source marked built-in. lh-com's pages as before (www's bundle first).
   Run: node --max-old-space-size=512 --test test/blog-overview-brand-labels.test.mjs */
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

const row = (path, category, date) => ({
  path, title: path.split('/').pop(), description: '', image: `${path}/media_1.jpg`, 'image-alt': 'x', category, 'publication-date': date, 'page-type': 'article',
});
const INDEX = {
  '/magazine/en/query-index.json': [row('/magazine/en/travel/destinations/paris', 'Destinations', '2026-10-12'), row('/magazine/en/travel/destinations/rome', 'Destinations', '2026-09-12')],
  '/magazine/de/query-index.json': [row('/magazine/de/reisen/destinationen/paris', 'Destinationen', '2026-10-12')],
};
let fetched;
beforeEach(() => {
  fetched = [];
  globalThis.fetch = async (url) => {
    const href = String(url).split('?')[0];
    fetched.push(href);
    if (INDEX[href]) {
      return new Response(JSON.stringify({
        total: INDEX[href].length, offset: 0, limit: 500, data: INDEX[href],
      }), { headers: { 'content-type': 'application/json' } });
    }
    if (href.includes('/data/recorded/')) return new Response(JSON.stringify({ entries: {} }));
    if (href.includes('/service/api/labels/')) return new Response(JSON.stringify({ 'blogOverview.common.default.currentPageScreenReader': 'From www: page {CURRENT_PAGE}' }), { headers: { 'content-type': 'application/json' } });
    return new Response('{}', { status: 404, headers: { 'content-type': 'application/json' } });
  };
});

const { default: decorate } = await import('../blocks/blog-overview/blog-overview.js');

const run = async (pathname, metas, rows) => {
  window.location.pathname = pathname;
  document.head.innerHTML = Object.entries(metas).map(([k, v]) => `<meta name="${k}" content="${v}">`).join('');
  try {
    const block = document.createElement('div');
    block.className = 'blog-overview grid';
    block.innerHTML = rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('');
    document.body.replaceChildren(block);
    await decorate(block);
    return block;
  } finally {
    document.head.innerHTML = '';
  }
};
const status = (block) => block.querySelector('.blog-overview-status, [aria-live]')?.textContent || '';
const asked = () => fetched.filter((u) => u.includes('/service/api/labels/'));

test('the SWISS magazine (en, de): no label request to www, the block\'s own texts, marked built-in', async () => {
  for (const [path, own] of [['/magazine/en', 'You are on page 1 of the results'], ['/magazine/de', 'Sie befinden sich auf Ergebnisseite 1']]) {
    fetched = [];
    const block = await run(path, { brand: 'swiss' }, [['Path', `${path}/${path.endsWith('en') ? 'travel' : 'reisen'}`], ['Page size', '5'], ['Hide filter', 'true']]);
    assert.deepEqual(asked(), [], path);
    assert.match(block.dataset.lhSources, /labels\/blogOverview:built-in/, path);
    assert.ok(status(block).includes(own), `${path}: ${status(block)}`);
  }
});

test('an authored row still wins on a brand page', async () => {
  const block = await run('/magazine/en', { brand: 'swiss' }, [['Path', '/magazine/en/travel'], ['Current page label', 'Seite {CURRENT_PAGE}'], ['Hide filter', 'true']]);
  assert.deepEqual(asked(), []);
  assert.ok(status(block).includes('Seite 1'), status(block));
});

test('lh-com: www\'s bundle as before', async () => {
  window.location.hostname = 'main--lh-com--moved-permanently.aem.page';
  try {
    await run('/de/en/discover', {}, [['Page size', '5'], ['Hide filter', 'true']]);
    assert.ok(asked().some((u) => u.endsWith('/service/api/labels/blogOverview/lh/en')), asked().join(' '));
  } finally {
    window.location.hostname = 'main--lh-swiss--moved-permanently.aem.page';
  }
});
