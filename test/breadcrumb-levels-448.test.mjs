/* eslint-disable max-len */
/* The breadcrumb's levels without a page (blocks/breadcrumb, brand-neutral; brief 448, Air
   Dolomiti's www: "Home | servizi | Parcheggi convenzionati", the middle crumb its address's first
   part, not a page, so not a link): a page's metadata Breadcrumb Levels ("servizi"; several "a > b",
   the root's side first) are crumbs without a link between its Parent's crumb and its own; a
   parent page's levels the same between it and its own parent. Without the row, as before.
   Run: node --max-old-space-size=512 --test test/breadcrumb-levels-448.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html lang="en"><head></head><body></body></html>');
window.location = {
  hostname: 'main--lh-airdolomiti--moved-permanently.aem.page', origin: 'https://main--lh-airdolomiti--moved-permanently.aem.page', href: 'https://main--lh-airdolomiti--moved-permanently.aem.page/en/fleet', pathname: '/en/fleet', search: '',
};
Object.defineProperty(window, 'origin', { value: 'https://main--lh-airdolomiti--moved-permanently.aem.page', configurable: true });
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
globalThis.DOMParser = window.DOMParser;
const store = new Map();
globalThis.sessionStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, v) };

let pages = {};
const requests = [];
globalThis.fetch = async (url) => {
  requests.push(url);
  const html = pages[url];
  return { ok: Boolean(html), status: html ? 200 : 404, text: async () => html || '' };
};
const head = (meta) => `<!DOCTYPE html><html><head>${Object.entries(meta).map(([k, v]) => `<meta name="${k}" content="${v}">`).join('')}</head><body></body></html>`;

const { default: decorate } = await import('../blocks/breadcrumb/breadcrumb.js');

const trail = async (parent, path = '/en/fleet', levels = '') => {
  window.location.pathname = path;
  window.location.href = `${window.location.origin}${path}`;
  document.head.innerHTML = `<meta name="parent" content="${parent}"><meta name="breadcrumb-title" content="The Fleet">${levels ? `<meta name="breadcrumb-levels" content="${levels}">` : ''}`;
  const block = document.createElement('div');
  block.className = 'breadcrumb block';
  document.body.replaceChildren(block);
  store.clear();
  requests.length = 0;
  decorate(block);
  for (let i = 0; i < 50 && block.classList.contains('breadcrumb-loading'); i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => { setTimeout(r, 5); });
  }
  return [...block.querySelectorAll('li')].map((li) => [li.textContent, (li.querySelector('a') || {}).getAttribute ? li.querySelector('a').getAttribute('href') : null]);
};

test('a level without a page: a crumb without a link between the parent and the page', async () => {
  pages = { '/': head({ 'breadcrumb-title': 'Home' }) };
  assert.deepEqual(await trail('/', '/servizi/parcheggi-convenzionati', 'servizi'), [['Home', '/'], ['servizi', null], ['The Fleet', null]]);
  assert.deepEqual(requests, ['/'], 'no request for the level');
  pages = { '/en/': head({ 'breadcrumb-title': 'Home' }) };
  assert.deepEqual(await trail('/en/', '/en/a/b/c', 'a > b'), [['Home', '/en/'], ['a', null], ['b', null], ['The Fleet', null]]);
});

test('a parent page\'s own levels between it and its parent', async () => {
  pages = {
    '/en/x/y': head({ 'breadcrumb-title': 'Y', parent: '/en/', 'breadcrumb-levels': 'x' }),
    '/en/': head({ 'breadcrumb-title': 'Home' }),
  };
  assert.deepEqual(await trail('/en/x/y', '/en/x/y/z'), [['Home', '/en/'], ['x', null], ['Y', '/en/x/y'], ['The Fleet', null]]);
});

test('without Breadcrumb Levels as before', async () => {
  pages = { '/': head({ 'breadcrumb-title': 'Home' }) };
  assert.deepEqual(await trail('/', '/orario-voli'), [['Home', '/'], ['The Fleet', null]]);
});
