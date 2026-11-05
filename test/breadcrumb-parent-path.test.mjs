/* eslint-disable max-len */
/* The breadcrumb's parents as written (blocks/breadcrumb, brand-neutral): a Parent with a trailing
   slash (Air Dolomiti's /en/ and /de/, the homepages' addresses) is fetched and linked as written;
   aem.page answers /en with 404 where the published host redirects it, so the slash-less form lost
   the trail's "Home" on preview. A parent that answers 404 is tried once more with the slash
   toggled (older documents' /en), the link then the form that answered. Every other parent (no
   slash, e.g. lufthansa.com's /de/de/gepaeck; the root /) as before: one request, linked as is.
   Run: node --max-old-space-size=512 --test test/breadcrumb-parent-path.test.mjs */
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

const trail = async (parent, path = '/en/fleet') => {
  window.location.pathname = path;
  window.location.href = `${window.location.origin}${path}`;
  document.head.innerHTML = `<meta name="parent" content="${parent}"><meta name="breadcrumb-title" content="The Fleet">`;
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

test('a parent with a trailing slash: fetched and linked as written', async () => {
  pages = { '/en/': head({ 'breadcrumb-title': 'Home' }) };
  assert.deepEqual(await trail('/en/'), [['Home', '/en/'], ['The Fleet', null]]);
  assert.deepEqual(requests, ['/en/']);
});

test('a parent that answers 404: once more with the slash toggled, linked as it answered', async () => {
  pages = { '/de/': head({ 'breadcrumb-title': 'Home' }) };
  assert.deepEqual(await trail('/de', '/de/flotte'), [['Home', '/de/'], ['The Fleet', null]]);
  assert.deepEqual(requests, ['/de', '/de/']);
  pages = {};
  assert.deepEqual(await trail('/en'), [['The Fleet', null]], 'neither answers: the trail ends as before');
  assert.deepEqual(requests, ['/en', '/en/']);
});

test('other parents as before: one request, linked as written (lufthansa.com\'s, the root)', async () => {
  pages = {
    '/de/de/gepaeck': head({ 'breadcrumb-title': 'Gepäck', parent: '/de/de/homepage' }),
    '/de/de/homepage': head({ 'breadcrumb-title': 'Startseite' }),
  };
  assert.deepEqual(await trail('/de/de/gepaeck', '/de/de/handgepaeck'), [['Startseite', '/de/de/homepage'], ['Gepäck', '/de/de/gepaeck'], ['The Fleet', null]]);
  assert.deepEqual(requests, ['/de/de/gepaeck', '/de/de/homepage']);
  pages = { '/': head({ 'breadcrumb-title': 'Home' }) };
  assert.deepEqual(await trail('/', '/orario-voli'), [['Home', '/'], ['The Fleet', null]]);
  assert.deepEqual(requests, ['/']);
});
