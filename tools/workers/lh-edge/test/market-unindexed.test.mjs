/* eslint-disable max-len */
/* A market root's page the language index lacks though the language version serves it (brief 445):
   Edge Delivery leaves a page out of a query index when its record is over 100 KB (SWISS's Greek
   privacy statement: 100,029 bytes, its main p and li texts 96 KB; the Greek and Russian conditions
   of carriage), so /gr/el/terms-conditions/privacy-statement answered 404 while /ch/el/… is live.
   The market route answers such a page from the language version's document as an indexed one
   (its markets metadata counts); the language version's redirects as before; not its drafts, and
   no .plain.html (it has no metadata to check).
   Run: node --import ./test/cloudflare-workers-shim.mjs --test test/market-unindexed.test.mjs */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import { market, resetMarketCache } from '../src/markets.js';
import { siteOf, siteEnv, tablesOf } from '../src/sites.js';

globalThis.HTMLRewriter = HTMLRewriter;

const SWISS = 'main--lh-swiss--moved-permanently.aem.live';
const VARS = {
  SITE_HOSTS: 'swiss.example=swiss',
  SITE_ORIGINS: `swiss=${SWISS}`,
  SITE_WWW_HOSTS: 'swiss=www.swiss.com',
};
const env = () => ({
  ORIGIN: 'main--lh-com--moved-permanently.aem.live', WWW_HOST: 'www.lufthansa.com', PILOT_HOSTS: '', EDGE_TTL: '60', ...VARS,
});
const sheet = (data) => ({
  total: data.length, offset: 0, limit: 1000, data, ':type': 'sheet',
});
const row = (path, extra = {}) => ({
  path, title: path, markets: '', robots: '', 'primary-language-url': '', lastModified: '1793045388', ...extra,
});
// the language index without the long pages
const INDEX = sheet([row('/ch/en/homepage'), row('/ch/en/prepare/baggage')]);
const page = (path, meta = '') => `<!DOCTYPE html><html><head><title>${path}</title>${meta}<link rel="canonical" href="https://${SWISS}${path}"></head><body><main><h1>${path}</h1><p><a href="/ch/en/prepare/baggage">baggage</a></p></main></body></html>`;
const html = (body) => new Response(body, { headers: { 'content-type': 'text/html; charset=utf-8' } });
const DOCS = {
  '/ch/en/prepare/baggage': () => html(page('/ch/en/prepare/baggage')),
  '/ch/en/terms-conditions/privacy-statement': () => html(page('/ch/en/terms-conditions/privacy-statement')),
  '/ch/en/terms-conditions/swiss-only': () => html(page('/ch/en/terms-conditions/swiss-only', '<meta name="markets" content="ch">')),
  '/ch/en/drafts/long': () => html(page('/ch/en/drafts/long')),
  '/ch/en/old-terms': () => new Response(null, { status: 301, headers: { location: `https://${SWISS}/ch/en/terms-conditions/privacy-statement` } }),
};
let calls;
beforeEach(() => {
  resetMarketCache();
  calls = [];
  globalThis.fetch = async (input) => {
    const req = input instanceof Request ? input : new Request(input);
    const u = new URL(req.url);
    calls.push(`${u.hostname}${u.pathname}`);
    if (u.pathname === '/ch/en/language-index.json' && u.hostname === SWISS) return Response.json(INDEX);
    if (u.pathname.endsWith('.json')) return Response.json(sheet([]));
    if (u.hostname === SWISS && DOCS[u.pathname]) return DOCS[u.pathname]();
    return new Response('nf', { status: 404 });
  };
});

// SWISS with a market root de/en of ch/en's language (as swiss-markets.test.mjs)
const swissEnv = () => {
  const site = siteOf(new Request('https://swiss.example/ch/en/homepage'), env());
  const rows = {
    ...site.tables.table,
    'de/en': {
      country: 'de', lang: 'en', hreflang: 'en-DE', status: 'live', documents: 'language',
    },
  };
  return { ...siteEnv(env(), site), SITE_TABLES: tablesOf(rows, site.tables.versions) };
};
const get = (path, method = 'GET') => market(new Request(`https://swiss.example${path}`, { method }), swissEnv());

test('a page the language index lacks: the language version\'s document, as the market route answers an indexed one (one read of it)', async () => {
  const resp = await get('/de/en/terms-conditions/privacy-statement');
  assert.equal(resp.status, 200);
  assert.equal(resp.headers.get('x-lh-edge-route'), 'market');
  const body = await resp.text();
  assert.ok(body.includes('<h1>/ch/en/terms-conditions/privacy-statement</h1>'), 'the language document');
  // its links as an indexed page's: into the root where the root serves the page
  assert.ok(body.includes('href="/de/en/prepare/baggage"'), body);
  assert.equal(calls.filter((c) => c === `${SWISS}/ch/en/terms-conditions/privacy-statement`).length, 1, calls.join(' '));
});

test('its HEAD: the status without a body', async () => {
  const resp = await get('/de/en/terms-conditions/privacy-statement', 'HEAD');
  assert.equal(resp.status, 200);
  assert.equal(resp.headers.get('x-lh-edge-route'), 'market');
});

test('its markets metadata leaves the country out: the root\'s 404', async () => {
  const resp = await get('/de/en/terms-conditions/swiss-only');
  assert.equal(resp.status, 404);
});

test('a path the language version has no document of: the root\'s 404; its redirect as before (to the unindexed page: the language version\'s, as links to it)', async () => {
  assert.equal((await get('/de/en/terms-conditions/none')).status, 404);
  const moved = await get('/de/en/old-terms');
  assert.equal(moved.status, 301);
  assert.equal(new URL(moved.headers.get('location'), 'https://swiss.example').pathname, '/ch/en/terms-conditions/privacy-statement');
});

test('the language version\'s drafts and an unindexed page\'s .plain.html: the root\'s 404', async () => {
  assert.equal((await get('/de/en/drafts/long')).status, 404);
  assert.equal((await get('/de/en/terms-conditions/privacy-statement.plain.html')).status, 404);
});
