/* eslint-disable max-len */
/* The routes ahead of the market route for a market root (src/markets.js siteFetch): the app
   view, SDUI, offline list, micro-frontend page, header and footer JSON, aircraft list, llms.txt,
   and the hreflang of roots with their own documents. Other hosts and roots: as before. */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { resetMarketCache } from '../src/markets.js';
import { resetSheetCache } from '../src/sheet.js';
import { resetAliasCache } from '../src/solo.js';
import { resetWebCache } from '../src/sdui-web.js';

globalThis.HTMLRewriter = HTMLRewriter;

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../../../..');
const read = (p) => fs.readFileSync(p, 'utf8');
const OWA_SHEET = read(path.join(root, 'tools/importer/owa-tracking-sheet.json'));
const ORIGIN = 'main--lh-com--moved-permanently.aem.live';
const env = {
  ORIGIN, WWW_HOST: 'www.lufthansa.com', PILOT_HOSTS: 'lhedge.example', ALIAS_REWRITE_HOSTS: 'lhcom.bbird.live,lhedge.bbird.live', EDGE_TTL: '60',
};
const sheet = (data) => ({
  total: data.length, offset: 0, limit: 1000, data, ':type': 'sheet',
});
const row = (p, extra = {}) => ({
  path: p, title: `Page ${p.split('/').pop()} | Lufthansa`, description: `About ${p.split('/').pop()}`, markets: '', robots: '', 'primary-language-url': '', lastModified: '1793045388', ...extra,
});
const PAGE = (p) => `<!DOCTYPE html><html><head><title>${p}</title><link rel="canonical" href="https://lhcom.bbird.live${p}"></head>
<body><header></header><main><div><h1>Addresses</h1><p><a href="/de/en/baggage">Baggage</a> <a href="/de/en/homepage">Home</a></p>
<div class="micro-frontend"><div><div>app</div></div></div><picture><img src="./media_1.jpg?width=750" alt=""></picture></div></main><footer></footer></body></html>`;
// the pages de/en's nav and footer link: in the language index, so the market serves them
const NAV_PAGES = [...new Set(['nav', 'footer'].flatMap((d) => [...read(path.join(here, 'fixtures/owa', `de-en-${d}.plain.html`)).matchAll(/href="(?:https:\/\/www\.lufthansa\.com)?(\/de\/en\/[^"?#]*)/g)].map((m) => m[1])))]
  .filter((p) => !['/de/en/homepage', '/de/en/baggage'].includes(p));
const FILES = {
  '/de/en/search-index.json': sheet([
    ...NAV_PAGES.map((p) => row(p)),
    row('/de/en/homepage', { 'llms-include': 'true', 'llms-category': 'Start', 'ai-guidance': 'Call the German service centre.' }),
    row('/de/en/baggage', { 'llms-include': 'true', 'llms-category': 'Baggage' }),
    row('/de/en/addresses-worldwide'),
    row('/de/en/book-and-manage/trip-management'),
  ]),
  '/de/de/search-index.json': sheet([row('/de/de/homepage'), row('/de/de/gepaeck', { 'primary-language-url': '/de/en/baggage' })]),
  '/at/de/search-index.json': sheet([row('/at/de/homepage'), row('/at/de/gepaeck')]),
  '/gb/en/search-index.json': sheet([row('/gb/en/homepage'), row('/gb/en/baggage')]),
  '/market-pages.json': sheet([]),
  '/de/en/articles/query-index.json': sheet([]),
  '/fleet-index.json': sheet([row('/de/en/359', { 'aircraft-code': '359', 'aircraft-order': '1', title: 'Airbus A350-900 | Lufthansa' }), row('/de/de/359', { 'aircraft-code': '359' })]),
};
let calls;
beforeEach(() => {
  resetMarketCache();
  resetSheetCache();
  resetAliasCache();
  resetWebCache();
  calls = [];
  globalThis.fetch = async (input) => {
    const req = input instanceof Request ? input : new Request(input);
    const u = new URL(req.url);
    calls.push(u.pathname);
    if (FILES[u.pathname]) return Response.json(FILES[u.pathname]);
    if (u.pathname === '/app/config/owa-tracking.json') return new Response(OWA_SHEET, { headers: { 'content-type': 'application/json' } });
    const nav = u.pathname.match(/^\/de\/en\/(nav|footer)\.plain\.html$/);
    if (nav) return new Response(read(path.join(here, 'fixtures/owa', `de-en-${nav[1]}.plain.html`)), { headers: { 'content-type': 'text/html' } });
    if (['/de/en/baggage', '/de/en/addresses-worldwide', '/de/en/book-and-manage/trip-management', '/de/en/homepage'].includes(u.pathname)) {
      return new Response(PAGE(u.pathname), { headers: { 'content-type': 'text/html; charset=utf-8' } });
    }
    if (u.pathname === '/de/en/addresses-worldwide.plain.html') return new Response('<div><h1>Addresses</h1><p>Our offices worldwide. Bags: see <a href="/de/en/baggage">Baggage</a> for the rules.</p></div>', { headers: { 'content-type': 'text/html' } });
    return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});
const get = (p, host = 'lhedge.example', init = {}) => worker.fetch(new Request(`https://${host}${p}`, init), env, {});

test('hreflang of a market copy lists at/de and gb/en where their indexes have the page', async () => {
  const html = await (await get('/ch/en/baggage')).text();
  const KEEP = new Set(['en-DE', 'en-GB', 'en-CH', 'de-DE', 'de-AT', 'de-CH']);
  const alts = [...html.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)].filter((m) => KEEP.has(m[1])).map((m) => `${m[1]} ${m[2].replace('https://lhcom.bbird.live', '')}`);
  assert.deepEqual(alts, ['en-DE /de/en/baggage', 'en-GB /gb/en/baggage', 'en-CH /ch/en/baggage', 'de-DE /de/de/gepaeck', 'de-AT /at/de/gepaeck', 'de-CH /ch/de/gepaeck']);
  const de = await (await get('/ch/en/addresses-worldwide')).text();
  assert.deepEqual([...de.matchAll(/hreflang="([^"]+)"/g)].map((m) => m[1]).filter((h) => KEEP.has(h)), ['en-DE', 'en-CH'], 'gb/en has no such page');
});

test('a revalidation of a market copy gets the page, not the 404 (the language version is fetched without the conditions)', async () => {
  const plain = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const req = input instanceof Request ? input : new Request(input);
    if (req.headers.get('if-modified-since') || req.headers.get('if-none-match')) {
      if (new URL(req.url).pathname === '/de/en/baggage') return new Response(null, { status: 304 });
    }
    return plain(input, init);
  };
  await Promise.all([{ 'if-modified-since': 'Tue, 27 Oct 2026 15:46:24 GMT' }, { 'if-none-match': '"abc"' }].map(async (h) => {
    const resp = await get('/ch/en/baggage', 'lhedge.example', { headers: h });
    assert.equal(resp.status, 200, JSON.stringify(h));
    assert.equal(resp.headers.get('x-lh-edge-route'), 'market');
    assert.match(await resp.text(), /Addresses/);
  }));
});

test('routes that make their answer from documents answer a revalidation in full (the origin\'s 304 is about the document)', async () => {
  const plain = globalThis.fetch;
  globalThis.fetch = async (input, init) => {
    const req = input instanceof Request ? input : new Request(input);
    if (req.headers.get('if-modified-since') || req.headers.get('if-none-match')) return new Response(null, { status: 304 });
    return plain(input, init);
  };
  const cases = [
    ['/ch/en/addresses-worldwide.solo_continue', 'solo'],
    ['/ch/en/addresses-worldwide.sdui', 'sdui-web-short'],
    ['/content/lh/markets/ch/en/addresses-worldwide.sdui', 'sdui-web'],
    ['/content/lh/markets/ch/en/addresses-worldwide.csi-offline.json', 'csi-offline'],
    ['/ch/en/book-and-manage/trip-management.mfe.html', 'mfe'],
    ['/content/lh/markets/ch/en/homepage.csi-owa-header.json', 'owa'],
  ];
  const conds = [{ 'if-modified-since': 'Tue, 27 Oct 2026 15:46:24 GMT' }, { 'if-none-match': '"abc"' }];
  const want = await Promise.all(cases.map(async ([p]) => (await get(p)).status));
  assert.deepEqual(want, cases.map(() => 200));
  await Promise.all(cases.flatMap(([p, route]) => conds.map(async (h) => {
    const resp = await get(p, 'lhedge.example', { headers: h });
    assert.equal(resp.status, 200, `${p} ${JSON.stringify(h)}`);
    assert.equal(resp.headers.get('x-lh-edge-route'), route, p);
  })));
  // the pass-through keeps the conditions: the origin's 304
  assert.equal((await get('/de/en/baggage', 'lhedge.example', { headers: conds[0] })).status, 304);
});

test('the app view of a market page: the market route\'s page, links in the solo form under the market root', async () => {
  const resp = await get('/ch/en/addresses-worldwide.solo_continue');
  assert.equal(resp.status, 200);
  assert.equal(resp.headers.get('x-lh-edge-route'), 'solo');
  const html = await resp.text();
  assert.match(html, /<meta name="channel" content="app">/);
  assert.match(html, /href="\/ch\/en\/baggage\.solo_continue"/);
  assert.match(html, /href="https:\/\/www\.lufthansa\.com\.solo_continue\/"/, 'the homepage closes the web view');
  assert.match(html, /<link rel="canonical" href="https:\/\/lhcom\.bbird\.live\/ch\/en\/addresses-worldwide">/);
  // another host: as before (the origin's answer for the ch path)
  assert.equal((await get('/ch/en/addresses-worldwide.solo_continue', 'lhcom.example')).status, 404);
});

test('SDUI: the short spelling answers the market page; the full content path renders it for the market root', async () => {
  const short = await get('/ch/en/addresses-worldwide.sdui');
  assert.equal(short.status, 200);
  assert.match(await short.text(), /href="\/ch\/en\/baggage"/);
  const full = await get('/content/lh/markets/ch/en/addresses-worldwide.sdui');
  assert.equal(full.status, 200);
  const body = JSON.stringify(await full.json());
  assert.match(body, /Addresses/);
  assert.match(body, /\/ch\/en\/baggage/);
  assert.ok(!/\/de\/en\/baggage/.test(body));
  assert.equal((await get('/content/lh/markets/ch/en/addresses-worldwide.sdui', 'lhcom.example')).status, 404, 'not served there: as before');
});

test('offline list and micro-frontend page of a market page', async () => {
  const off = await (await get('/content/lh/markets/ch/en/addresses-worldwide.csi-offline.json')).json();
  assert.equal(off.targetPage, 'https://lhedge.example/ch/en/addresses-worldwide');
  assert.ok(off.resources.includes('/ch/en/media_1.jpg?width=750'), off.resources.join(' '));
  const mfe = await get('/ch/en/book-and-manage/trip-management.mfe.html');
  assert.equal(mfe.status, 200);
  assert.equal(mfe.headers.get('x-lh-edge-route'), 'mfe');
  assert.match(await mfe.text(), /canonical" href="https:\/\/lhcom\.bbird\.live\/ch\/en\/book-and-manage\/trip-management"/);
  assert.equal((await get('/content/lh/markets/ch/en/addresses-worldwide.csi-offline.json', 'lhcom.example')).status, 404);
});

test('header and footer JSON of a market root: its nav and footer through the market route, the language version\'s tracking rows', async () => {
  const header = await get('/content/lh/markets/ch/en/homepage.csi-owa-header.json');
  assert.equal(header.status, 200);
  const h = JSON.stringify(await header.json());
  assert.ok(calls.includes('/ch/en/nav.plain.html') && calls.includes('/de/en/nav.plain.html'), 'own nav first, then the language version\'s');
  assert.ok(!/"\/de\/en\//.test(h), 'no link into de/en');
  assert.match(h, /\/ch\/en\//);
  const footer = await get('/content/lh/markets/ch/en/homepage.csi-owa-footer.json');
  assert.equal(footer.status, 200);
  // de/en's own JSON is unchanged by the market root's rows
  const de = JSON.stringify(await (await get('/content/lh/markets/de/en/homepage.csi-owa-header.json')).json());
  assert.match(de, /\/de\/en\//);
  assert.equal((await get('/content/lh/markets/ch/en/homepage.csi-owa-header.json', 'lhcom.example')).status, 404);
});

test('aircraft list of a market page: the language version\'s aircraft under the market root', async () => {
  const body = await (await get('/ch/en/addresses-worldwide.aircraft.json')).json();
  assert.deepEqual(body.aircrafts, [{ name: '359', title: 'Airbus A350-900', url: '/ch/en/359' }]);
  assert.deepEqual((await (await get('/ch/en/addresses-worldwide.aircraft.json', 'lhcom.example')).json()).aircrafts, []);
});

test('llms.txt of a market: its locales from the market route\'s index, no ai-guidance of another market', async () => {
  const txt = await (await get('/ch/llms.txt')).text();
  assert.match(txt, /^# Lufthansa — Switzerland \(CH\)/);
  assert.match(txt, /\(https:\/\/www\.lufthansa\.com\/ch\/en\/baggage\)/);
  assert.ok(!/German service centre/.test(txt));
  assert.ok(!/\/de\/en\//.test(txt));
  assert.match(await (await get('/ch/en/llms.txt')).text(), /ENGLISH LANGUAGE \(en\) — SWITZERLAND/);
  const other = await get('/ch/llms.txt', 'lhcom.example');
  assert.equal(other.status, 404, 'not served there: as before');
});

test('llms.txt in the edge cache: one entry per public host (a CDN in front calls under lh-edge\'s own host)', async () => {
  const store = new Map();
  globalThis.caches = {
    default: {
      match: async (req) => (store.has(req.url) ? store.get(req.url).clone() : undefined),
      put: async (req, resp) => { store.set(req.url, resp); },
    },
  };
  const waits = [];
  const ctx = { waitUntil: (p) => waits.push(p) };
  const call = (host) => worker.fetch(new Request('https://lhedge.example/ch/llms.txt', { headers: host ? { 'x-lh-public-host': host } : {} }), env, ctx);
  const pilot = await call();
  assert.equal(pilot.status, 200);
  await Promise.all(waits);
  const viaCdn = await call('lhcom.example');
  assert.equal(viaCdn.status, 404, 'the CDN host gets its own answer, not the pilot host\'s cached one');
  delete globalThis.caches;
});
