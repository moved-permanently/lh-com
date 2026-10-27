/* eslint-disable max-len, no-restricted-syntax, no-await-in-loop */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { gunzipSync } from 'node:zlib';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker, { routeOf } from '../src/index.js';
import {
  marketAllows, marketPath, resetMarketCache, MARKET_ROOTS, marketHref,
} from '../src/markets.js';

globalThis.HTMLRewriter = HTMLRewriter;

const ORIGIN = 'main--lh-com--moved-permanently.aem.live';
const env = (extra = {}) => ({
  ORIGIN, WWW_HOST: 'www.lufthansa.com', PILOT_HOSTS: 'lhedge.example', ALIAS_REWRITE_HOSTS: 'lhcom.bbird.live,lhedge.bbird.live', EDGE_TTL: '60', ...extra,
});
const sheet = (data) => ({
  total: data.length, offset: 0, limit: 1000, data, ':type': 'sheet',
});
const row = (path, extra = {}) => ({
  path, title: path, markets: '', robots: '', 'primary-language-url': '', lastModified: '1793045388', ...extra,
});
const INDEX = {
  '/de/en/search-index.json': sheet([
    row('/de/en/homepage'), row('/de/en/baggage'), row('/de/en/event/dghm-2026', { markets: 'de' }),
    row('/de/en/addresses-worldwide'), row('/de/en/addresses-worldwide-de'), row('/de/en/feedback', { robots: 'noindex,nofollow' }), row('/de/en/only-not-ch', { markets: '-ch, -us' }), row('/de/en/articles/a'),
  ]),
  '/de/de/search-index.json': sheet([
    row('/de/de/homepage'), row('/de/de/baggage'), row('/de/de/adressen-weltweit', { 'primary-language-url': '/de/en/addresses-worldwide' }),
  ]),
  '/market-pages.json': sheet([row('/ch/en/homepage'), row('/ch/en/own-page'), row('/ch/de/homepage'), row('/ch/en/nav')]),
  '/de/en/articles/query-index.json': sheet([row('/de/en/articles/a', { image: '/de/en/media_1.jpg' })]),
};
const page = (path) => `<!DOCTYPE html><html><head><title>${path}</title>
<link rel="canonical" href="https://lhcom.bbird.live${path}"><meta property="og:url" content="https://lhcom.bbird.live${path}">
<meta name="parent" content="/de/en/homepage"><meta name="robots" content="noindex, nofollow"></head>
<body><header></header><main><div><h1>Baggage</h1><p>
<a href="/de/en/homepage">Home</a> <a href="/de/en/carry-on">not indexed</a> <a href="/de/en/event/dghm-2026">de only</a>
<a href="https://main--lh-com--moved-permanently.aem.page/de/en/addresses-worldwide#x">addresses</a> <a href="https://www.lufthansa.com/de/en/travel-briefing">www</a>
<a href="/de/en/fragments/teaser">fragment</a> <a href="/de/de/baggage">German</a> <a href="/de/en/baggage?x=1">self</a></p>
<picture><img src="https://lhcom.bbird.live/de/en/media_1234.jpg?width=750" alt=""></picture></div></main><footer></footer></body></html>`;
const DOCS = {
  '/de/en/baggage': page('/de/en/baggage'),
  '/de/en/addresses-worldwide': page('/de/en/addresses-worldwide'),
  '/de/de/adressen-weltweit': page('/de/de/adressen-weltweit'),
  '/de/en/event/dghm-2026': page('/de/en/event/dghm-2026'),
  '/de/en/addresses-worldwide-de': page('/de/en/addresses-worldwide-de').replace('<title>', '<meta name="markets" content="de, at"><title>'),
  '/ch/en/homepage': '<html><head><link rel="canonical" href="https://lhcom.bbird.live/ch/en/homepage"></head><body>own ch homepage</body></html>',
  '/de/en/fragments/teaser.plain.html': '<div><a href="/de/en/baggage">Baggage</a></div>',
  '/ch/en/old': 301,
  '/de/en/support/support': 302,
  '/de/en/book-and-manage/refund/confirmation': page('/de/en/book-and-manage/refund/confirmation'),
};
const SITEMAP_INDEX = '<?xml version="1.0" encoding="UTF-8" standalone="no"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"><sitemap><loc>https://www.lufthansa.com/sitemap/sitemap_lh_at_de.xml.gz</loc></sitemap><sitemap><loc>https://www.lufthansa.com/sitemap/sitemap_lh_de_de.xml.gz</loc></sitemap><sitemap><loc>https://www.lufthansa.com/sitemap/sitemap_lh_de_en.xml.gz</loc></sitemap><sitemap><loc>https://www.lufthansa.com/sitemap/sitemap_lh_gb_en.xml.gz</loc></sitemap></sitemapindex>';

let calls;
beforeEach(() => {
  resetMarketCache();
  calls = [];
  globalThis.fetch = async (input) => {
    const req = input instanceof Request ? input : new Request(input);
    const u = new URL(req.url);
    calls.push(u.pathname);
    if (INDEX[u.pathname]) return Response.json(INDEX[u.pathname]);
    if (u.pathname === '/sitemap/sitemap_lh.xml') return new Response(SITEMAP_INDEX, { headers: { 'content-type': 'application/xml' } });
    const doc = DOCS[u.pathname];
    if (doc === 301) return new Response(null, { status: 301, headers: { location: '/ch/en/new' } });
    if (doc === 302) return new Response(null, { status: 302, headers: { location: 'https://main--lh-com--moved-permanently.aem.live/de/en/baggage' } });
    if (doc) {
      return new Response(doc, {
        headers: { 'content-type': 'text/html; charset=utf-8', 'cache-tag': `main--lh-com--moved-permanently,${u.pathname}`, 'cache-control': 'max-age=7200, must-revalidate' },
      });
    }
    return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});

const get = (path, host = 'lhedge.example', headers = {}) => worker.fetch(new Request(`https://${host}${path}`, { headers }), env(), {});

test('markets values: include and exclude lists, empty is every market', () => {
  assert.ok(marketAllows('', 'ch'));
  assert.ok(marketAllows('de, at, ch', 'ch'));
  assert.ok(!marketAllows('de, at', 'ch'));
  assert.ok(!marketAllows('-ch, -us', 'ch'));
  assert.ok(marketAllows('-us', 'ch'));
  assert.ok(marketAllows(' DE ; CH ', 'ch'));
  assert.deepEqual(MARKET_ROOTS, ['ch/de', 'ch/en']);
  assert.deepEqual(marketPath('/ch/en/baggage'), { root: 'ch/en', rest: '/baggage' });
  ['/de/en/baggage', '/at/de/x', '/gb/en/x', '/ch/fr/x', '/ch/en', '/content/mobile/lh/en/homepage'].forEach((p) => assert.equal(marketPath(p), null, p));
});

test('the four roots and other paths never reach the market route', () => {
  ['/de/en/baggage', '/de/de/gepaeck', '/at/de/homepage', '/gb/en/flights', '/us/en/ccpa', '/ch/fr/homepage', '/ch/en'].forEach((p) => {
    assert.notEqual(routeOf(new Request(`https://lhedge.example${p}`)).name, 'market', p);
  });
  assert.equal(routeOf(new Request('https://lhedge.example/ch/en/baggage')).name, 'market');
});

test('a host without pilot roots: /ch/en/... passes through to the origin unchanged', async () => {
  const resp = await get('/ch/en/baggage', 'lhcom.example');
  assert.equal(resp.status, 404);
  assert.equal(await resp.text(), '<html>404</html>');
  assert.deepEqual(calls, ['/ch/en/baggage']);
  // the public host decides (the CDN in front sends X-LH-Public-Host)
  calls = [];
  const via = await get('/ch/en/baggage', 'lhedge.example', { 'x-lh-public-host': 'lhcom.bbird.live' });
  assert.equal(via.status, 404);
  assert.deepEqual(calls, ['/ch/en/baggage']);
});

test('a language page for the market root: links, canonical, og:url, hreflang, cache tag', async () => {
  const resp = await get('/ch/en/baggage');
  assert.equal(resp.status, 200);
  assert.equal(resp.headers.get('x-lh-edge-route'), 'market');
  assert.equal(resp.headers.get('cache-tag'), 'main--lh-com--moved-permanently,/de/en/baggage');
  assert.equal(resp.headers.get('cache-control'), 'max-age=60, must-revalidate');
  const html = await resp.text();
  assert.match(html, /<link rel="canonical" href="https:\/\/lhcom\.bbird\.live\/ch\/en\/baggage">/);
  assert.match(html, /<meta property="og:url" content="https:\/\/lhcom\.bbird\.live\/ch\/en\/baggage">/);
  assert.match(html, /<meta name="parent" content="\/ch\/en\/homepage">/);
  assert.match(html, /<meta name="robots" content="noindex, nofollow">/, 'robots as on lhcom');
  const alts = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)].map((m) => `${m[1]} ${m[2]}`);
  assert.deepEqual(alts, [
    'en-DE https://lhcom.bbird.live/de/en/baggage', 'en-CH https://lhcom.bbird.live/ch/en/baggage',
    'de-DE https://lhcom.bbird.live/de/de/baggage', 'de-CH https://lhcom.bbird.live/ch/de/baggage',
  ]);
  const hrefs = [...html.matchAll(/<a href="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(hrefs, [
    '/ch/en/homepage', '/de/en/carry-on', '/de/en/event/dghm-2026', '/ch/en/addresses-worldwide#x',
    'https://www.lufthansa.com/ch/en/travel-briefing', '/ch/en/fragments/teaser', '/de/de/baggage', '/ch/en/baggage?x=1',
  ]);
  assert.match(html, /<img src="\/de\/en\/media_1234\.jpg\?width=750"/);
  assert.deepEqual(calls.slice(0, 1), ['/ch/en/baggage'], 'the own document first');
});

test('translated slugs pair by primary-language-url in the alternates', async () => {
  const html = await (await get('/ch/de/adressen-weltweit')).text();
  const alts = [...html.matchAll(/hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => `${m[1]} ${m[2]}`);
  assert.deepEqual(alts, [
    'de-DE https://lhcom.bbird.live/de/de/adressen-weltweit', 'de-CH https://lhcom.bbird.live/ch/de/adressen-weltweit',
    'en-DE https://lhcom.bbird.live/de/en/addresses-worldwide', 'en-CH https://lhcom.bbird.live/ch/en/addresses-worldwide',
  ]);
});

test('own documents and redirects of the market root win; markets and missing index rows 404', async () => {
  const own = await get('/ch/en/homepage');
  assert.equal(await own.text(), DOCS['/ch/en/homepage']);
  assert.equal(own.headers.get('x-lh-edge-route'), null);
  const moved = await get('/ch/en/old');
  assert.equal(moved.status, 301);
  assert.equal(moved.headers.get('location'), '/ch/en/new');
  for (const p of ['/ch/en/event/dghm-2026', '/ch/en/addresses-worldwide-de', '/ch/en/only-not-ch', '/ch/en/carry-on', '/ch/en/x.pdf']) {
    const r = await get(p);
    assert.equal(r.status, 404, p);
    assert.equal(await r.text(), '<html>404</html>', p);
  }
});

test('the language version\'s redirects and the pages its index leaves out on purpose', async () => {
  const moved = await get('/ch/en/support/support');
  assert.equal(moved.status, 302);
  assert.equal(moved.headers.get('location'), '/ch/en/baggage');
  const conf = await get('/ch/en/book-and-manage/refund/confirmation');
  assert.equal(conf.status, 200);
  assert.match(await conf.text(), /<link rel="canonical" href="https:\/\/lhcom\.bbird\.live\/ch\/en\/book-and-manage\/refund\/confirmation">/);
});

test('fragments fall back to the language version; HEAD has no body', async () => {
  const frag = await get('/ch/en/fragments/teaser.plain.html');
  assert.equal(frag.status, 200);
  assert.equal(await frag.text(), '<div><a href="/ch/en/baggage">Baggage</a></div>');
  const head = await worker.fetch(new Request('https://lhedge.example/ch/en/baggage', { method: 'HEAD' }), env(), {});
  assert.equal(head.status, 200);
});

test('JSON: the language rows the market serves, paths rewritten, own pages in the search index', async () => {
  const idx = await (await get('/ch/en/search-index.json?limit=3&offset=1')).json();
  // the index has no markets value for addresses-worldwide-de yet (it takes it on publish)
  assert.equal(idx.total, 7);
  assert.deepEqual(idx.data.map((r) => r.path), ['/ch/en/addresses-worldwide-de', '/ch/en/articles/a', '/ch/en/baggage']);
  const all = await (await get('/ch/en/search-index.json')).json();
  assert.deepEqual(all.data.map((r) => r.path), ['/ch/en/addresses-worldwide', '/ch/en/addresses-worldwide-de', '/ch/en/articles/a', '/ch/en/baggage', '/ch/en/feedback', '/ch/en/homepage', '/ch/en/own-page']);
  const art = await (await get('/ch/en/articles/query-index.json')).json();
  assert.deepEqual(art.data.map((r) => [r.path, r.image]), [['/ch/en/articles/a', '/de/en/media_1.jpg']]);
});

test('sitemaps: the market root\'s and the index with it on pilot hosts, the origin\'s elsewhere', async () => {
  const xml = await (await get('/sitemap/sitemap_lh_ch_en.xml')).text();
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  assert.deepEqual(locs, ['https://www.lufthansa.com/ch/en/addresses-worldwide', 'https://www.lufthansa.com/ch/en/addresses-worldwide-de', 'https://www.lufthansa.com/ch/en/articles/a', 'https://www.lufthansa.com/ch/en/baggage', 'https://www.lufthansa.com/ch/en/homepage', 'https://www.lufthansa.com/ch/en/own-page']);
  assert.match(xml, /<lastmod>2026-10-26<\/lastmod>/);
  assert.match(xml, /<xhtml:link rel="alternate" hreflang="de-CH" href="https:\/\/www\.lufthansa\.com\/ch\/de\/adressen-weltweit"\/>/);
  const gz = await get('/sitemap/sitemap_lh_ch_en.xml.gz');
  assert.equal(gunzipSync(Buffer.from(await gz.arrayBuffer())).toString(), xml);
  const index = await (await get('/sitemap/sitemap_lh.xml')).text();
  assert.deepEqual([...index.matchAll(/sitemap_lh_([a-z_]+)\.xml\.gz/g)].map((m) => m[1]), ['at_de', 'ch_de', 'ch_en', 'de_de', 'de_en', 'gb_en']);
  assert.equal(index.replace(/<sitemap><loc>[^<]*_ch_[a-z]{2}\.xml\.gz<\/loc><\/sitemap>/g, ''), SITEMAP_INDEX);
  // files of 100 URLs: page 1 is the unnumbered name, past the last 404, no _1
  assert.equal((await get('/sitemap/sitemap_lh_ch_en_2.xml')).status, 404);
  assert.equal((await get('/sitemap/sitemap_lh_ch_en_1.xml')).status, 404);
  // elsewhere: the static index, and no market sitemap
  const plain = await get('/sitemap/sitemap_lh.xml', 'lhcom.example');
  assert.equal(await plain.text(), SITEMAP_INDEX);
  assert.equal((await get('/sitemap/sitemap_lh_ch_en.xml.gz', 'lhcom.example')).status, 404);
  assert.equal((await get('/sitemap/sitemap_lh_ch_en.xml', 'lhcom.example')).status, 404);
});

test('entry redirects: pilot roots to their homepages on pilot hosts, to www elsewhere', async () => {
  const loc = async (path, host, headers) => (await get(path, host, headers)).headers.get('location');
  assert.equal(await loc('/ch', 'lhedge.example'), '/ch/de/homepage');
  assert.equal(await loc('/ch', 'lhedge.example', { 'accept-language': 'en-GB,en;q=0.9' }), '/ch/en/homepage');
  assert.equal(await loc('/ch/en', 'lhedge.example'), '/ch/en/homepage');
  assert.equal(await loc('/ch/de/', 'lhedge.example'), '/ch/de/homepage');
  assert.equal(await loc('/', 'lhedge.example', { 'cf-ipcountry': 'CH' }), '/ch/de/homepage');
  assert.equal(await loc('/ch', 'lhcom.example'), 'https://www.lufthansa.com/ch');
  assert.equal(await loc('/ch/en', 'lhcom.example'), 'https://www.lufthansa.com/ch/en/homepage');
  assert.equal(await loc('/ch/fr', 'lhedge.example'), 'https://www.lufthansa.com/ch/fr/homepage');
  assert.equal(await loc('/de', 'lhedge.example', { 'accept-language': 'en' }), '/de/en/homepage');
});

test('link rule: site hosts stripped, links into the language version only where the market serves them', () => {
  const ctx = {
    from: 'de/en', to: 'ch/en', allowed: (s) => s !== '/x', hosts: /^https:\/\/(lhcom\.bbird\.live)(?=\/|$)/,
  };
  assert.equal(marketHref('/de/en/a', ctx), '/ch/en/a');
  assert.equal(marketHref('/de/en/x', ctx), null);
  assert.equal(marketHref('https://lhcom.bbird.live/de/en/x', ctx), '/de/en/x');
  assert.equal(marketHref('/de/en', ctx), '/ch/en');
  assert.equal(marketHref('/de/enx/a', ctx), null);
  assert.equal(marketHref('#top', ctx), null);
  assert.equal(marketHref('https://www.lufthansa.com/de/en/x?a=1', ctx), 'https://www.lufthansa.com/ch/en/x?a=1', 'www pages that were not migrated: www\'s market root');
  assert.equal(marketHref('https://www.lufthansa.com/de/de/x', ctx), null);
});
