/* eslint-disable max-len */
// Brussels Airlines (lh-brussels) on its host: the site entry (src/sites.js SITES.brussels), its
// entry paths (SITE_ENTRIES: /, /<cc>, /<cc>/<ll>, www's /xx/<ll>), market roots from the language
// documents, its DAM paths and fonts
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { resetMarketCache } from '../src/markets.js';
import { siteOf, SITES, SITE_ENTRIES } from '../src/sites.js';
/* eslint-disable-next-line import/no-relative-packages */
import { edsDamPath } from '../../../../scripts/dam-path.js';

globalThis.HTMLRewriter = HTMLRewriter;

const BRUSSELS = 'main--lh-brussels--moved-permanently.aem.live';
const AUSTRIAN = 'main--lh-austrian--moved-permanently.aem.live';
const VARS = {
  SITE_HOSTS: 'austrian.example=austrian; brussels.example=brussels',
  SITE_ORIGINS: `austrian=${AUSTRIAN}; brussels=${BRUSSELS}`,
  SITE_WWW_HOSTS: 'austrian=www.austrian.com; brussels=www.brusselsairlines.com',
  SITE_DESIGN_HOSTS: 'austrian=www.lufthansa.com; brussels=www.lufthansa.com',
};
const env = () => ({
  ORIGIN: 'main--lh-com--moved-permanently.aem.live', WWW_HOST: 'www.lufthansa.com', PILOT_HOSTS: '', EDGE_TTL: '60', AEM_PUBLISH: 'https://publish-p1-e2.adobeaemcloud.com', ...VARS,
});
const sheet = (data) => ({
  total: data.length, offset: 0, limit: 1000, data, ':type': 'sheet',
});
const row = (path, extra = {}) => ({
  path, title: path, markets: '', robots: '', 'primary-language-url': '', lastModified: '1793045388', ...extra,
});
const page = (path, body) => `<!DOCTYPE html><html><head><title>${path}</title><link rel="canonical" href="https://${BRUSSELS}${path}"></head><body><main>${body}</main></body></html>`;
const FILES = {
  '/be/en/search-index.json': sheet([row('/be/en/homepage'), row('/be/en/baggage', { markets: '' }), row('/be/en/flying-with-us/africa', { markets: 'gb/en' })]),
  '/be/fr/search-index.json': sheet([row('/be/fr/bagages', { markets: 'fr, ch/fr' })]),
  '/de/de/search-index.json': sheet([row('/de/de/gepaeck', { markets: 'ch/de' })]),
  '/market-pages.json': sheet([row('/us/en/homepage')]),
  '/be/en/homepage': page('/be/en/homepage', '<h1>be/en homepage</h1>'),
  '/be/fr/homepage': page('/be/fr/homepage', '<h1>be/fr accueil</h1>'),
  '/be/en/baggage': page('/be/en/baggage', '<h1>Baggage</h1><a href="/be/en/flying-with-us/africa">Africa</a>'),
  '/be/en/flying-with-us/africa': page('/be/en/flying-with-us/africa', '<h1>Africa</h1>'),
  '/be/fr/bagages': page('/be/fr/bagages', '<h1>Bagages</h1>'),
  '/de/de/gepaeck': page('/de/de/gepaeck', '<h1>Gepäck</h1>'),
  '/us/en/homepage': page('/us/en/homepage', '<h1>us/en own homepage</h1>'),
};
const PDF = '/content/dam/bel/documents/conditions-of-carriage.pdf';
const FONT = '/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/fonts/brussels/Intelo-Regular.woff2';
let calls;
beforeEach(() => {
  resetMarketCache();
  calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const u = new URL(req.url);
    calls.push(`${u.hostname}${u.pathname}`);
    if (u.hostname === 'www.lufthansa.com' && u.pathname === FONT) {
      return new Response(new Uint8Array([119, 79, 70, 50]), { headers: { 'content-type': 'font/woff2' } });
    }
    if (u.hostname === BRUSSELS) {
      if (u.pathname === edsDamPath(PDF)) return new Response('%PDF-1.7', { headers: { 'content-type': 'application/pdf' } });
      const f = FILES[u.pathname];
      if (f && typeof f === 'object') return Response.json(f);
      if (f) return new Response(f, { headers: { 'content-type': 'text/html; charset=utf-8' } });
    }
    return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});
const get = (url, init) => worker.fetch(new Request(url, init), env(), { waitUntil() {} });

test('brussels: the site on its host: six language roots, 92 market roots, no xx roots', () => {
  const site = siteOf(new Request('https://brussels.example/be/en/homepage'), env());
  assert.equal(site.name, 'brussels');
  assert.equal(site.origin, BRUSSELS);
  assert.equal(site.www, 'www.brusselsairlines.com');
  assert.equal(site.design, 'www.lufthansa.com');
  assert.deepEqual(site.tables.versions, {
    en: 'be/en', fr: 'be/fr', nl: 'be/nl', de: 'de/de', it: 'it/it', es: 'es/es',
  });
  assert.equal(site.tables.marketRoots.length, 92);
  assert.equal(Object.keys(site.tables.table).length, 98);
  assert.deepEqual(SITES.brussels.ownRoots, []);
  ['xx/en', 'xx/fr', 'xx/nl'].forEach((r) => assert.equal(site.tables.table[r], undefined, r));
  assert.equal(siteOf(new Request('https://austrian.example/at/en/homepage'), env()).name, 'austrian');
});

test('brussels: a reference root\'s pages from lh-brussels\'s origin only', async () => {
  const en = await get('https://brussels.example/be/en/homepage');
  assert.equal(en.status, 200);
  assert.match(await en.text(), /be\/en homepage/);
  assert.match(await (await get('https://brussels.example/be/fr/homepage')).text(), /be\/fr accueil/);
  assert.ok(calls.every((c) => c.startsWith(BRUSSELS)), calls.join(' '));
});

test('brussels: entry paths: /, /be, /be/en and www\'s /xx/<ll> to a homepage (302); a root\'s homepage path stays', async () => {
  const expect = {
    '/': '/be/en/homepage',
    '/be': '/be/en/homepage',
    '/be/': '/be/en/homepage',
    '/be/en': '/be/en/homepage',
    '/be/fr/': '/be/fr/homepage',
    '/be/nl': '/be/nl/homepage',
    '/de': '/de/de/homepage',
    '/de/en': '/de/en/homepage',
    '/ch': '/ch/en/homepage',
    '/ch/it': '/ch/it/homepage',
    '/us/en': '/us/en/homepage',
    '/xx': '/be/en/homepage',
    '/xx/en': '/be/en/homepage',
    '/xx/fr': '/be/fr/homepage',
    '/xx/nl/': '/be/nl/homepage',
  };
  const answers = await Promise.all(Object.keys(expect).map((p) => get(`https://brussels.example${p}`)));
  answers.forEach((resp, i) => {
    const p = Object.keys(expect)[i];
    assert.equal(resp.status, 302, p);
    assert.equal(resp.headers.get('location'), expect[p], p);
    assert.equal(resp.headers.get('x-lh-edge-route'), 'site-entry', p);
  });
  assert.equal((await get('https://brussels.example/be/en?x=1')).headers.get('location'), '/be/en/homepage?x=1');
  assert.match(await (await get('https://brussels.example/us/en/homepage')).text(), /us\/en own homepage/);
  assert.notEqual((await get('https://brussels.example/zz/en')).status, 302, 'no root: no entry');
  // Austrian's host: its entries as before, none of Brussels'
  assert.equal((await get('https://austrian.example/')).headers.get('location'), '/at/en/homepage');
  assert.equal((await get('https://austrian.example/xx/en')).headers.get('location'), '/at/en/homepage');
  // be/fr is Brussels' root, not Austrian's (Austrian's own be/en root has its entry, brief 212)
  assert.notEqual((await get('https://austrian.example/be/fr')).status, 302);
  // Austrian's: its roots' (brief 212) and www's /xx/en, /at; no Brussels path
  ['/xx/en', '/xx/en/', '/at', '/at/', '/at/en', '/at/en/'].forEach((p) => assert.ok(SITE_ENTRIES.austrian[p], p));
  assert.equal(Object.keys(SITE_ENTRIES.austrian).some((p) => p.startsWith('/be/fr') || p.startsWith('/be/nl')), false);
});

test('brussels: www\'s /xx/<ll>/<path> to /be/<ll>/<path> (301, query kept, no origin request); Austrian\'s /xx/ paths as before', async () => {
  const expect = {
    '/xx/en/baggage': '/be/en/baggage',
    '/xx/fr/bagages?x=1': '/be/fr/bagages?x=1',
    '/xx/nl/local-page/black-friday': '/be/nl/local-page/black-friday',
    '/xx/en/homepage': '/be/en/homepage',
  };
  const answers = await Promise.all(Object.keys(expect).map((p) => get(`https://brussels.example${p}`)));
  answers.forEach((resp, i) => {
    const p = Object.keys(expect)[i];
    assert.equal(resp.status, 301, p);
    assert.equal(resp.headers.get('location'), expect[p], p);
    assert.equal(resp.headers.get('x-lh-edge-route'), 'url-form', p);
  });
  assert.deepEqual(calls, []);
  // a language Brussels has no be/ root of, the entry paths (302 as before), POST, Austrian's host
  assert.notEqual((await get('https://brussels.example/xx/de/gepaeck')).status, 301);
  assert.equal((await get('https://brussels.example/xx/en/')).status, 302);
  assert.notEqual((await get('https://brussels.example/xx/en/baggage', { method: 'POST' })).status, 301);
  assert.notEqual((await get('https://austrian.example/xx/en/baggage')).status, 301);
});

test('brussels: market roots from their language document where the markets row lists them', async () => {
  const gb = await get('https://brussels.example/gb/en/baggage');
  assert.equal(gb.status, 200);
  assert.equal(gb.headers.get('x-lh-edge-route'), 'market');
  const html = await gb.text();
  assert.match(html, /<h1>Baggage<\/h1>/);
  assert.match(html, /href="\/gb\/en\/flying-with-us\/africa"/);
  assert.equal((await get('https://brussels.example/us/en/flying-with-us/africa')).status, 404, 'markets gb/en only');
  assert.match(await (await get('https://brussels.example/fr/fr/bagages')).text(), /<h1>Bagages<\/h1>/);
  assert.match(await (await get('https://brussels.example/ch/de/gepaeck')).text(), /<h1>Gepäck<\/h1>/);
  assert.ok(calls.every((c) => c.startsWith(BRUSSELS)), calls.join(' '));
});

test('brussels: a PDF from lh-brussels\'s copies, the fonts from www.lufthansa.com (the same release)', async () => {
  const pdf = await get(`https://brussels.example${PDF}`);
  assert.equal(pdf.status, 200);
  assert.equal(await pdf.text(), '%PDF-1.7');
  assert.deepEqual(calls, [`${BRUSSELS}${edsDamPath(PDF)}`]);
  calls = [];
  const font = await get(`https://brussels.example${FONT}`);
  assert.equal(font.status, 200);
  assert.equal(font.headers.get('content-type'), 'font/woff2');
  assert.ok(calls.length && calls.every((c) => c.startsWith('www.lufthansa.com')), calls.join(' '));
});
