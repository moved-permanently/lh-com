/* eslint-disable max-len, no-restricted-syntax, no-await-in-loop */
/* hreflang on the live roots' own pages (src/live-alternates.js, tools/reports/markets/go-live.md):
   once a wave is live (live market roots in the locale table), the pages of the language versions
   and the own roots (de/en, de/de, at/de, gb/en: the pass-through) list their language versions,
   own roots and the live market roots that have the page, as the market route lists them on a
   market page; with no live market root (liveWaves [], the table as the tests load it) every
   answer stays as it is and no index is read.
   Run: node --import ./test/cloudflare-workers-shim.mjs --test test/live-alternates.test.mjs */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { resetMarketCache } from '../src/markets.js';
import { resetRouterCache } from '../src/router.js';
import { withLiveAlternates, liveMarketRoots, liveRootPage } from '../src/live-alternates.js';
import { LH_TABLES, tablesOf } from '../src/sites.js';

globalThis.HTMLRewriter = HTMLRewriter;

const ORIGIN = 'main--lh-com--moved-permanently.aem.live';
const MAIN = 'lufthansa.turnsthe.page';
const env = (extra = {}) => ({
  ORIGIN, WWW_HOST: 'www.lufthansa.com', PILOT_HOSTS: 'lhedge.example', PILOT_COUNTRIES_BY_HOST: `${MAIN}=ch`, FRONT_DOOR_HOSTS: MAIN, EDGE_TTL: '60', ...extra,
});
const sheet = (data) => ({
  total: data.length, offset: 0, limit: 1000, data, ':type': 'sheet',
});
const row = (path, extra = {}) => ({
  path, title: path, markets: '', robots: '', 'primary-language-url': '', lastModified: '1793045388', ...extra,
});
const INDEX = {
  '/de/en/search-index.json': sheet([row('/de/en/homepage'), row('/de/en/baggage'), row('/de/en/only-de', { markets: 'de' }), row('/de/en/addresses-worldwide')]),
  '/de/de/search-index.json': sheet([row('/de/de/homepage'), row('/de/de/baggage'), row('/de/de/adressen-weltweit', { 'primary-language-url': '/de/en/addresses-worldwide' })]),
  '/at/de/search-index.json': sheet([row('/at/de/homepage'), row('/at/de/baggage')]),
  '/gb/en/search-index.json': sheet([row('/gb/en/homepage')]),
  '/market-pages.json': sheet([row('/ch/en/homepage')]),
};
const page = (path, extra = '') => `<!DOCTYPE html><html><head><title>${path}</title><link rel="canonical" href="https://${ORIGIN}${path}">${extra}</head><body><main><h1>x</h1></main></body></html>`;
let calls;
beforeEach(() => {
  resetMarketCache();
  resetRouterCache();
  calls = [];
  globalThis.fetch = async (input) => {
    const req = input instanceof Request ? input : new Request(input);
    const u = new URL(req.url);
    calls.push(u.pathname);
    if (INDEX[u.pathname]) return Response.json(INDEX[u.pathname]);
    if (/\.(json|txt)$/.test(u.pathname)) return new Response('', { status: 404 });
    if (u.pathname.endsWith('/nav.plain.html')) return new Response('<div>nav</div>', { headers: { 'content-type': 'text/html' } });
    return new Response(page(u.pathname), { headers: { 'content-type': 'text/html; charset=utf-8' } });
  };
});
const tags = (html) => [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)].map((m) => `${m[1]} ${m[2]}`);
const req = (path, host = MAIN, method = 'GET') => new Request(`https://${host}${path}`, { method });
const htmlResp = (path, extra) => new Response(page(path, extra), { headers: { 'content-type': 'text/html; charset=utf-8' } });

test('no live market root (liveWaves []): none in the table, the live roots\' pages pass through as they are, no index read', async () => {
  assert.deepEqual(liveMarketRoots(LH_TABLES), []);
  const before = page('/de/en/baggage');
  for (const host of [MAIN, 'lhedge.example']) {
    calls = [];
    const resp = await worker.fetch(req('/de/en/baggage', host), env(), { waitUntil: () => {} });
    const html = await resp.text();
    assert.equal(tags(html).length, 0, host);
    assert.ok(html.includes('<title>/de/en/baggage</title>'), host);
    assert.ok(!calls.some((c) => c.endsWith('.json')), `${host}: ${calls.join(' ')}`);
  }
  const same = htmlResp('/de/en/baggage');
  assert.equal(await withLiveAlternates(same, req('/de/en/baggage'), env()), same, 'the same response object');
  assert.equal(await (await withLiveAlternates(htmlResp('/de/en/baggage'), req('/de/en/baggage'), env())).text(), before);
});

test('the live roots\' pages: the language versions and own roots, not the market roots or other files', () => {
  assert.deepEqual(liveRootPage('/de/en/baggage', LH_TABLES), { root: 'de/en', lang: 'en', suffix: '/baggage' });
  assert.deepEqual(liveRootPage('/at/de/baggage', LH_TABLES), { root: 'at/de', lang: 'de', suffix: '/baggage' });
  assert.deepEqual(liveRootPage('/gb/en/homepage', LH_TABLES), { root: 'gb/en', lang: 'en', suffix: '/homepage' });
  ['/ch/en/baggage', '/ae/en/baggage', '/de/en', '/de/en/', '/de/en/nav', '/de/en/footer', '/de/en/fragments/x', '/de/en/baggage.plain.html',
    '/de/en/search-index.json', '/de/en/media_1.jpg', '/fr/fr/homepage', '/scripts/aem.js'].forEach((p) => assert.equal(liveRootPage(p, LH_TABLES), null, p));
});

test('a wave live: a de/en page lists its language versions, own roots and the live market roots that have it', async () => {
  const roots = ['ae/en', 'ae/de'];
  assert.deepEqual(liveMarketRoots(tablesOf({ ...LH_TABLES.table, 'ae/en': { ...LH_TABLES.table['ae/en'], status: 'live' }, 'ae/de': { ...LH_TABLES.table['ae/de'], status: 'live' } }, LH_TABLES.versions)).sort(), [...roots].sort());
  const html = await (await withLiveAlternates(htmlResp('/de/en/baggage', '<link rel="alternate" hreflang="en" href="https://x/old">'), req('/de/en/baggage'), env(), roots)).text();
  assert.deepEqual(tags(html).sort(), [
    `de-AE https://${ORIGIN}/ae/de/baggage`, `de-AT https://${ORIGIN}/at/de/baggage`, `de-DE https://${ORIGIN}/de/de/baggage`,
    `en-AE https://${ORIGIN}/ae/en/baggage`, `en-DE https://${ORIGIN}/de/en/baggage`,
  ]);
  assert.ok(!html.includes('https://x/old'), 'the page\'s own hreflang links replaced');
  assert.ok(html.includes(`<link rel="canonical" href="https://${ORIGIN}/de/en/baggage">`), 'canonical kept');
  // an own root's page (at/de) lists itself and the same set
  const at = tags(await (await withLiveAlternates(htmlResp('/at/de/baggage'), req('/at/de/baggage'), env(), roots)).text());
  assert.equal(at.length, 5);
  // a translated slug: the other language's page that names it as its primary-language-url
  assert.deepEqual(tags(await (await withLiveAlternates(htmlResp('/de/en/addresses-worldwide'), req('/de/en/addresses-worldwide'), env(), roots)).text()).sort(), [
    `de-AE https://${ORIGIN}/ae/de/adressen-weltweit`, `de-DE https://${ORIGIN}/de/de/adressen-weltweit`, `en-AE https://${ORIGIN}/ae/en/addresses-worldwide`, `en-DE https://${ORIGIN}/de/en/addresses-worldwide`,
  ]);
  // a page whose markets leave the wave's country out: not listed for it
  assert.deepEqual(tags(await (await withLiveAlternates(htmlResp('/de/en/only-de'), req('/de/en/only-de'), env(), roots)).text()), []);
});

test('a wave live: other answers as they are (a 404, JSON, nav, a market page, a POST, a page the index lacks)', async () => {
  const roots = ['ae/en', 'ae/de'];
  const cases = [
    [new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html' } }), req('/de/en/missing')],
    [Response.json({ data: [] }), req('/de/en/search-index.json')],
    [htmlResp('/de/en/nav'), req('/de/en/nav')],
    [htmlResp('/ae/en/baggage'), req('/ae/en/baggage')],
    [htmlResp('/de/en/baggage'), req('/de/en/baggage', MAIN, 'POST')],
    [htmlResp('/de/en/not-indexed'), req('/de/en/not-indexed')],
  ];
  for (const [resp, request] of cases) {
    const out = await withLiveAlternates(resp, request, env(), roots);
    assert.equal(tags(await out.text()).length, 0, request.url);
  }
});
