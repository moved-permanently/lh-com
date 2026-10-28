/* eslint-disable max-len, no-restricted-syntax, no-await-in-loop */
/* The market model's lean sources (src/market-lean.js, helix-query.yaml market-model-* and
   market-llms-*): the reader on raw query-index text, the completeness check, and every market
   answer byte for byte the same as from the full indexes (MARKET_MODEL=full), without reading a
   full search index. */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import {
  resetMarketCache, marketModel, sitemapEntries, sitemapCount, MARKET_ROOTS,
} from '../src/markets.js';
import { resetSheetCache } from '../src/sheet.js';
import { LeanSource, MODEL_COLUMNS, LLMS_COLUMNS } from '../src/market-lean.js';

globalThis.HTMLRewriter = HTMLRewriter;

const ORIGIN = 'main--lh-com--moved-permanently.aem.live';
const env = (extra = {}) => ({
  ORIGIN, WWW_HOST: 'www.lufthansa.com', PILOT_HOSTS: 'lhedge.example', ALIAS_REWRITE_HOSTS: 'lhcom.bbird.live,lhedge.bbird.live', EDGE_TTL: '60', ...extra,
});
const row = (path, extra = {}) => ({
  path, title: `${path} | Lufthansa`, description: `About ${path}`, content: 'x'.repeat(200), markets: '', robots: '', 'primary-language-url': '', lastModified: '1793045388', 'llms-include': '', 'llms-title': '', 'llms-description': '', 'llms-category': '', 'ai-guidance': '', ...extra,
});
// the full indexes: markets includes and excludes, noindex, translated slugs, llms rows, own
// pages (one of them a language page), titles with characters the reader must not trip over
const FULL = {
  '/de/en/search-index.json': [
    row('/de/en/homepage', { 'llms-include': 'true', 'llms-category': 'Booking', 'ai-guidance': 'German guidance' }),
    row('/de/en/baggage', { 'llms-include': ' True ', 'llms-category': 'Baggage', title: 'Baggage {"path":"/de/en/fake",} "quoted" \\ back' }),
    row('/de/en/flights'), row('/de/en/event/de-only', { markets: 'de' }), row('/de/en/not-ch', { markets: '-ch, -us' }),
    row('/de/en/feedback', { robots: 'noindex,nofollow' }), row('/de/en/addresses-worldwide'), row('/de/en/fragments/teaser'),
    row('/de/en/hidden', { 'llms-include': 'false', 'llms-category': 'Booking' }),
  ],
  '/de/de/search-index.json': [
    row('/de/de/homepage'), row('/de/de/gepaeck', { 'primary-language-url': '/de/en/baggage' }), row('/de/de/fluege', { 'primary-language-url': '/de/en/flights', 'llms-include': 'true', 'llms-category': 'Buchung' }),
    row('/de/de/adressen-weltweit', { 'primary-language-url': '/de/en/addresses-worldwide' }),
  ],
  '/at/de/search-index.json': [row('/at/de/homepage', { 'llms-include': 'true', 'llms-category': 'Buchung', 'ai-guidance': 'AT guidance' }), row('/at/de/gepaeck'), row('/at/de/fluege', { 'llms-include': 'true', 'llms-category': 'Buchung' })],
  '/gb/en/search-index.json': [row('/gb/en/homepage'), row('/gb/en/baggage', { 'llms-include': 'true', 'llms-category': 'Baggage' }), row('/gb/en/flights')],
  '/market-pages.json': [
    row('/ch/en/homepage', { 'ai-guidance': 'Swiss guidance' }), row('/ch/en/own-page', { 'llms-include': 'true', 'llms-category': 'Local' }), row('/ch/en/flights', { robots: 'noindex' }),
    row('/ch/de/homepage'), row('/ch/en/nav'), row('/hu/en/local-page/offer'),
  ],
};
const leanOf = (pathname) => {
  const m = pathname.match(/^\/market-(model|llms)\/([a-z]{2}-[a-z]{2}|own)\.json$/);
  if (!m) return null;
  return { full: m[2] === 'own' ? '/market-pages.json' : `/${m[2].replace('-', '/')}/search-index.json`, columns: m[1] === 'model' ? MODEL_COLUMNS : LLMS_COLUMNS };
};
// the query index's JSON: total first, rows with the path first, the canonical column Edge
// Delivery adds, paged by limit and offset
const sheetJson = (rows, url, columns = null) => {
  const offset = Number(url.searchParams.get('offset') || 0);
  const limit = Number(url.searchParams.get('limit') || 1000);
  const data = rows.slice(offset, offset + limit).map((r) => (columns ? { path: r.path, ...Object.fromEntries(columns.map((c) => [c, r[c] ?? ''])), canonical: `https://lhcom.bbird.live${r.path}` } : r));
  return JSON.stringify({
    total: rows.length, offset, limit: data.length, data, columns: ['path', ...(columns || []), 'canonical'], ':type': 'sheet',
  });
};
const page = (path) => `<!DOCTYPE html><html><head><title>${path}</title><link rel="canonical" href="https://lhcom.bbird.live${path}"></head>
<body><header></header><main><div><p><a href="/de/en/baggage">b</a> <a href="/de/en/event/de-only">d</a> <a href="/de/en/not-ch">n</a> <a href="/de/en/flights">f</a></p></div></main><footer></footer></body></html>`;

let calls;
let lean;
beforeEach(() => {
  resetMarketCache();
  resetSheetCache();
  calls = [];
  lean = { ...FULL };
  globalThis.fetch = async (input) => {
    const req = input instanceof Request ? input : new Request(input);
    const u = new URL(req.url);
    calls.push(`${u.pathname}${u.search}`);
    const l = leanOf(u.pathname);
    if (l) return lean[l.full] ? new Response(sheetJson(lean[l.full], u, l.columns), { headers: { 'content-type': 'application/json' } }) : new Response('not found', { status: 404 });
    if (FULL[u.pathname]) return new Response(sheetJson(FULL[u.pathname], u), { headers: { 'content-type': 'application/json' } });
    if (u.pathname === '/sitemap/sitemap_lh.xml') return new Response('<?xml version="1.0"?><sitemapindex><sitemap><loc>https://www.lufthansa.com/sitemap/sitemap_lh_de_en.xml.gz</loc></sitemap></sitemapindex>', { headers: { 'content-type': 'application/xml' } });
    const doc = u.pathname.replace(/\.plain\.html$/, '');
    if (FULL['/de/en/search-index.json'].concat(FULL['/de/de/search-index.json'], FULL['/market-pages.json']).some((r) => r.path === doc)) {
      return new Response(page(doc), { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-tag': doc } });
    }
    return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});

const answer = async (path, e) => {
  resetMarketCache();
  resetSheetCache();
  const resp = await worker.fetch(new Request(`https://lhedge.example${path}`), e, { waitUntil: () => {} });
  return `${resp.status} ${resp.headers.get('content-type')} ${resp.headers.get('cache-tag')} ${resp.headers.get('location')}\n${await resp.text()}`;
};
const PATHS = ['/ch/en/baggage', '/ch/en/flights', '/ch/en/event/de-only', '/ch/en/not-ch', '/ch/de/gepaeck', '/ch/de/fluege', '/ch/de/adressen-weltweit', '/ch/en/addresses-worldwide',
  '/ch/en/baggage.plain.html', '/hu/en/baggage', '/hu/de/gepaeck', '/ch/llms.txt', '/ch/en/llms.txt', '/at/llms.txt', '/gb/llms.txt', '/hu/llms.txt',
  '/sitemap/sitemap_lh.xml', '/sitemap/sitemap_lh_ch_en.xml', '/sitemap/sitemap_lh_ch_de.xml', '/sitemap/sitemap_lh_hu_en.xml', '/sitemap/sitemap_lh_ch_en.xml.gz'];

test('lean reader: rows by path, path set, sparse rows, rows by value and prefix, on raw query-index text', () => {
  const rows = [row('/x/a'), row('/x/b', { title: 'B {"path":"/x/fake",} "q" \\', markets: 'de' }), row('/x/c', { 'llms-include': ' TRUE ' }), row('/x/q"uote')];
  const text = sheetJson(rows, new URL('https://o/x.json'), ['title', 'markets', 'llms-include']);
  const src = new LeanSource({ parts: [text], total: rows.length });
  assert.equal(src.row('/x/b').title, 'B {"path":"/x/fake",} "q" \\');
  assert.equal(src.row('/x/fake'), null, 'a path inside a value is no row');
  ['/x/a', '/x/b', '/x/c', '/x/q"uote'].forEach((p) => assert.ok(src.has(p), p));
  assert.ok(!src.has('/x/fake') && !src.has('/x/'));
  // past the threshold the path set answers the same
  ['/x/a', '/x/b', '/x/c', '/x/q"uote'].forEach((p) => assert.ok(src.has(p), p));
  assert.ok(!src.has('/x/fake'));
  assert.deepEqual(src.rowsWith(['markets']).map((r) => r.path), ['/x/b']);
  assert.deepEqual(src.rowsWhere('llms-include', (v) => v.trim().toLowerCase() === 'true', ['/x/a']).map((r) => r.path), ['/x/a', '/x/c']);
  assert.deepEqual(src.rowsUnder('/x/').length, 4);
  assert.deepEqual(src.all().map((r) => r.path), rows.map((r) => r.path));
});

test('a lean source counts only when complete: missing or short of the full index -> the full indexes', async () => {
  const pilot = new Request('https://lhedge.example/');
  assert.ok((await marketModel(pilot, env())).lean, 'complete lean sources: the lean model');
  resetMarketCache();
  lean['/de/de/search-index.json'] = FULL['/de/de/search-index.json'].slice(1);
  assert.ok(!(await marketModel(pilot, env())).lean, 'a source still filling: not used');
  resetMarketCache();
  delete lean['/market-pages.json'];
  assert.ok(!(await marketModel(pilot, env())).lean, 'a missing source: not used');
  resetMarketCache();
  lean = { ...FULL };
  assert.ok(!(await marketModel(pilot, env({ MARKET_MODEL: 'full' }))).lean, 'MARKET_MODEL=full: the full indexes');
});

test('every market answer from the lean sources is byte for byte the one from the full indexes, without a full index read', async () => {
  for (const p of PATHS) {
    const full = await answer(p, env({ MARKET_MODEL: 'full' }));
    calls = [];
    const fromLean = await answer(p, env());
    assert.equal(fromLean, full, p);
    const fullReads = calls.filter((c) => /search-index\.json|market-pages\.json/.test(c) && !/offset=1000000/.test(c));
    assert.deepEqual(fullReads, [], `${p}: only the totals of the full indexes`);
  }
  // the answers carry what the fixtures set up
  assert.match(await answer('/ch/llms.txt', env()), /Swiss guidance/);
  assert.match(await answer('/ch/llms.txt', env()), /ch\/en\/own-page/);
  assert.doesNotMatch(await answer('/ch/llms.txt', env()), /German guidance/);
});

test('sitemap counts: sitemapCount is the number of sitemap entries of every served root, from both sources', async () => {
  for (const e of [env({ MARKET_MODEL: 'full' }), env()]) {
    resetMarketCache();
    const model = await marketModel(new Request('https://lhedge.example/'), e);
    MARKET_ROOTS.forEach((r) => assert.equal(sitemapCount(model, r), sitemapEntries(model, r).length, r));
    // a root with own pages, a noindex own page over a language page, nav left out
    assert.equal(sitemapCount(model, 'ch/en'), sitemapEntries(model, 'ch/en').length);
    assert.ok(sitemapEntries(model, 'ch/en').some((x) => x.path === '/ch/en/own-page'));
    assert.ok(!sitemapEntries(model, 'ch/en').some((x) => x.path === '/ch/en/flights' || x.path === '/ch/en/nav'));
  }
});
