/* eslint-disable max-len */
/* www's market-neutral pages (brief 267): pages www has only under xx/en and xx/de (no de/en or
   de/de page in the scope) are documents of lh-com's neutral versions (NEUTRAL_VERSIONS: en
   xx/en, de xx/de). A market root answers such a path from the neutral document when its language
   version has no page there and the document's `markets` allows the country (empty: every
   market); the language version's pages first, as before; de/en and de/de themselves never.
   Run: node --import ./test/cloudflare-workers-shim.mjs --test test/neutral-pages.test.mjs */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { resetMarketCache } from '../src/markets.js';
import { resetRouterCache } from '../src/router.js';
import { LH_TABLES } from '../src/sites.js';

globalThis.HTMLRewriter = HTMLRewriter;

const ORIGIN = 'main--lh-com--moved-permanently.aem.live';
const env = () => ({
  ORIGIN, WWW_HOST: 'www.lufthansa.com', PILOT_HOSTS: 'lhedge.example', EDGE_TTL: '60',
});
const sheet = (data) => ({
  total: data.length, offset: 0, limit: 1000, data, ':type': 'sheet',
});
const row = (path, extra = {}) => ({
  path, title: path, markets: '', robots: '', 'primary-language-url': '', lastModified: '1793045388', ...extra,
});
const INDEX = {
  '/de/en/search-index.json': sheet([row('/de/en/homepage'), row('/de/en/baggage')]),
  '/de/de/search-index.json': sheet([row('/de/de/homepage'), row('/de/de/gepaeck')]),
  '/market-pages.json': sheet([row('/ch/en/homepage')]),
};
const page = (path, markets) => `<!DOCTYPE html><html><head><title>${path}</title>
<link rel="canonical" href="https://${ORIGIN}${path}">${markets === undefined ? '' : `<meta name="markets" content="${markets}">`}</head>
<body><header></header><main><div><h1>${path}</h1><p><a href="/xx/en/book-and-manage/stopover/rosewood">Rosewood</a> <a href="/de/en/baggage">Baggage</a></p></div></main><footer></footer></body></html>`;
const DOCS = {
  '/de/en/baggage': page('/de/en/baggage'),
  '/xx/en/book-and-manage/stopover/munich-airport': page('/xx/en/book-and-manage/stopover/munich-airport', '-de, -ae'),
  '/xx/en/book-and-manage/stopover/rosewood': page('/xx/en/book-and-manage/stopover/rosewood'),
  '/xx/en/only-austria': page('/xx/en/only-austria', 'at'),
  '/xx/de/319': page('/xx/de/319', '-de'),
  '/xx/en/baggage': page('/xx/en/baggage'),
};
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
    const doc = DOCS[u.pathname];
    if (doc) return new Response(doc, { headers: { 'content-type': 'text/html; charset=utf-8' } });
    return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});
const get = (path, host = 'lhedge.example') => worker.fetch(new Request(`https://${host}${path}`), env(), { waitUntil: () => {} });

test('the neutral versions: en xx/en, de xx/de (the locale table\'s)', () => {
  assert.deepEqual(LH_TABLES.neutral, { en: 'xx/en', de: 'xx/de' });
});

test('a market root answers a page its language version lacks from the neutral document its markets allow', async () => {
  const resp = await get('/ch/en/book-and-manage/stopover/munich-airport');
  assert.equal(resp.status, 200);
  assert.equal(resp.headers.get('x-lh-edge-route'), 'market');
  const html = await resp.text();
  assert.match(html, /<link rel="canonical" href="https:\/\/[^"]+\/ch\/en\/book-and-manage\/stopover\/munich-airport">/);
  assert.ok(html.includes('href="/ch/en/book-and-manage/stopover/rosewood"'), 'a link into the neutral version becomes the root\'s');
  // German: xx/de for ch/de
  assert.equal((await get('/ch/de/319')).status, 200);
});

test('the neutral document\'s markets: an excluded or not included country gets the 404; no document, the 404', async () => {
  assert.equal((await get('/ch/en/only-austria')).status, 404);
  assert.equal((await get('/ch/en/nothing-here')).status, 404);
});

test('the language version first: its page, never the neutral copy of the same path', async () => {
  const resp = await get('/ch/en/baggage');
  assert.equal(resp.status, 200);
  assert.ok((await resp.text()).includes('<title>/de/en/baggage</title>'));
  assert.ok(!calls.includes('/xx/en/baggage'));
});

test('de/en and de/de themselves and the neutral paths: as before (the origin\'s answer)', async () => {
  assert.equal((await get('/de/en/book-and-manage/stopover/munich-airport')).status, 404);
  assert.ok(!calls.includes('/xx/en/book-and-manage/stopover/munich-airport'));
  const xx = await get('/xx/en/book-and-manage/stopover/munich-airport');
  assert.equal(xx.status, 200);
  assert.notEqual(xx.headers.get('x-lh-edge-route'), 'market');
});
