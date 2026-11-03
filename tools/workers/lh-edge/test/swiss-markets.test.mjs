/* eslint-disable max-len */
/* SWISS's language versions' index (src/sites.js SITE_INDEX_PATHS, src/edge.js originFetch): its
   reference roots are ch/<ll>, which on lh-com are market roots with documents of their own, and
   helix-query.yaml serves every site, so a search-ch-<ll> index would put a /ch/<ll>/search-index.json
   on lh-com's origin too (lh-com's market route would answer it instead of building ch's from de/en).
   SWISS's indexes are /ch/<ll>/language-index.json (helix-query.yaml language-ch-<ll>); on SWISS's
   hosts every origin read of /<version>/search-index.json takes that file (the market model, the
   market roots' search indexes, a visitor's request). lh-com and the other sites as before.
   Run: node --import ./test/cloudflare-workers-shim.mjs --test test/swiss-markets.test.mjs */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { market, resetMarketCache } from '../src/markets.js';
import {
  siteOf, siteEnv, tablesOf, SITE_INDEX_PATHS,
} from '../src/sites.js';

globalThis.HTMLRewriter = HTMLRewriter;

const SWISS = 'main--lh-swiss--moved-permanently.aem.live';
const LH = 'main--lh-com--moved-permanently.aem.live';
const VARS = {
  SITE_HOSTS: 'swiss.example=swiss; brussels.example=brussels',
  SITE_ORIGINS: `swiss=${SWISS}; brussels=main--lh-brussels--moved-permanently.aem.live`,
  SITE_WWW_HOSTS: 'swiss=www.swiss.com; brussels=www.brusselsairlines.com',
};
const env = () => ({
  ORIGIN: LH, WWW_HOST: 'www.lufthansa.com', PILOT_HOSTS: '', EDGE_TTL: '60', ...VARS,
});
const sheet = (data) => ({
  total: data.length, offset: 0, limit: 1000, data, ':type': 'sheet',
});
const row = (path, extra = {}) => ({
  path, title: path, markets: '', robots: '', 'primary-language-url': '', lastModified: '1793045388', ...extra,
});
const INDEX = sheet([row('/ch/en/homepage'), row('/ch/en/prepare/baggage', { markets: 'de/en' })]);
const page = (path) => `<!DOCTYPE html><html><head><title>${path}</title><link rel="canonical" href="https://${SWISS}${path}"></head><body><main><h1>${path}</h1></main></body></html>`;
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
    if (u.pathname === '/ch/en/prepare/baggage') return new Response(page(u.pathname), { headers: { 'content-type': 'text/html; charset=utf-8' } });
    return new Response('nf', { status: 404 });
  };
});

test('SITE_INDEX_PATHS: SWISS\'s language versions read /<version>/language-index.json; siteEnv maps each version\'s search index; the other sites none', () => {
  assert.deepEqual(Object.keys(SITE_INDEX_PATHS), ['swiss']);
  const swiss = siteEnv(env(), siteOf(new Request('https://swiss.example/ch/en/homepage'), env()));
  Object.values(swiss.SITE_TABLES.versions).forEach((v) => {
    assert.equal(swiss.INDEX_PATHS[`/${v}/search-index.json`], `/${v}/language-index.json`, v);
  });
  assert.ok(swiss.INDEX_PATHS['/ch/en/search-index.json']);
  // the own roots (kr/ko: every page its own document) the same way (helix-query.yaml language-kr-ko)
  assert.deepEqual(swiss.SITE_TABLES.ownRoots, ['kr/ko']);
  assert.equal(swiss.INDEX_PATHS['/kr/ko/search-index.json'], '/kr/ko/language-index.json');
  assert.equal(Object.keys(swiss.INDEX_PATHS).length, Object.keys(swiss.SITE_TABLES.versions).length + 1);
  const brussels = siteEnv(env(), siteOf(new Request('https://brussels.example/be/en/homepage'), env()));
  assert.equal(brussels.INDEX_PATHS, undefined);
});

test('a visitor\'s /kr/ko/search-index.json on SWISS\'s host: lh-swiss\'s /kr/ko/language-index.json', async () => {
  const resp = await worker.fetch(new Request('https://swiss.example/kr/ko/search-index.json'), env(), { waitUntil() {} });
  assert.ok(calls.includes(`${SWISS}/kr/ko/language-index.json`), calls.join(' '));
  assert.ok(!calls.includes(`${SWISS}/kr/ko/search-index.json`), calls.join(' '));
  assert.equal(resp.status, 200);
});

test('a visitor\'s /ch/en/search-index.json: on SWISS\'s host lh-swiss\'s language index; on lh-com\'s host lh-com\'s path as before', async () => {
  const resp = await worker.fetch(new Request('https://swiss.example/ch/en/search-index.json'), env(), { waitUntil() {} });
  assert.equal(resp.status, 200);
  assert.equal((await resp.json()).total, 2);
  assert.ok(calls.includes(`${SWISS}/ch/en/language-index.json`), calls.join(' '));
  assert.ok(!calls.includes(`${SWISS}/ch/en/search-index.json`));
  calls = [];
  await worker.fetch(new Request('https://lhedge.example/ch/en/search-index.json'), env(), { waitUntil() {} });
  assert.ok(!calls.some((c) => c.endsWith('/language-index.json')), calls.join(' '));
});

test('a SWISS market root (once in the table): its page from the language version\'s document, the model read from the language index', async () => {
  const site = siteOf(new Request('https://swiss.example/ch/en/homepage'), env());
  const rows = {
    ...site.tables.table,
    'de/en': {
      country: 'de', lang: 'en', hreflang: 'en-DE', status: 'live', documents: 'language',
    },
  };
  const senv = { ...siteEnv(env(), site), SITE_TABLES: tablesOf(rows, site.tables.versions) };
  const resp = await market(new Request('https://swiss.example/de/en/prepare/baggage'), senv);
  assert.equal(resp.status, 200);
  assert.ok((await resp.text()).includes('<h1>/ch/en/prepare/baggage</h1>'), 'the language document');
  assert.ok(calls.includes(`${SWISS}/ch/en/language-index.json`), calls.join(' '));
  assert.ok(!calls.includes(`${SWISS}/ch/en/search-index.json`));
});
