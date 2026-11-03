/* eslint-disable max-len */
/* SWISS's market roots under the paths helix-query.yaml's market-pages index leaves out (src/sites.js
   MARKET_INDEX_EXCLUDED_ROOTS: lh-com's four roots with their own indexes, ITA's and Austrian's
   language versions, Discover's xx/fr): helix-query.yaml serves every site, so on lh-swiss their own
   pages (es/es's bizum, br/pt's pix, de/en's homepage) have no row in /market-pages.json and missed
   their search index and sitemap. Each of those paths has its own search-<cc>-<ll> index, which on
   lh-swiss holds exactly the root's own pages: on SWISS's hosts every origin read of
   /market-pages.json (the market model, the search index, the sitemap, llms.txt) adds the rows of
   those roots' /<root>/search-index.json (siteEnv MARKET_EXTRA_INDEXES, src/edge.js originFetch).
   ITA's and every other site's market-pages index and reads as before.
   Run: node --import ./test/cloudflare-workers-shim.mjs --test test/swiss-market-index.test.mjs */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { resetMarketCache } from '../src/markets.js';
import { siteOf, siteEnv, MARKET_INDEX_EXCLUDED_ROOTS } from '../src/sites.js';

globalThis.HTMLRewriter = HTMLRewriter;

const SWISS = 'main--lh-swiss--moved-permanently.aem.live';
const ITA = 'main--lh-ita--moved-permanently.aem.live';
const LH = 'main--lh-com--moved-permanently.aem.live';
const VARS = {
  SITE_HOSTS: 'swiss.example=swiss; ita.example=ita',
  SITE_ORIGINS: `swiss=${SWISS}; ita=${ITA}`,
  SITE_WWW_HOSTS: 'swiss=www.swiss.com; ita=www.ita-airways.com',
};
const env = () => ({
  ORIGIN: LH, WWW_HOST: 'www.lufthansa.com', PILOT_HOSTS: '', EDGE_TTL: '60', ...VARS,
});
const sheet = (data) => ({
  total: data.length, offset: 0, limit: 1000, data, ':type': 'sheet',
});
const row = (path, extra = {}) => ({
  path, title: path, description: '', markets: '', robots: '', 'primary-language-url': '', lastModified: '1793045388', ...extra,
});
const FILES = {
  [`${SWISS}/ch/es/language-index.json`]: sheet([row('/ch/es/homepage'), row('/ch/es/prepare/baggage')]),
  [`${SWISS}/market-pages.json`]: sheet([row('/ar/es/homepage'), row('/ar/es/local-page/companion-special-swiss-business')]),
  [`${SWISS}/es/es/search-index.json`]: sheet([row('/es/es/homepage'), row('/es/es/bizum')]),
  [`${SWISS}/br/pt/search-index.json`]: sheet([row('/br/pt/homepage'), row('/br/pt/pix')]),
};
let calls;
beforeEach(() => {
  resetMarketCache();
  calls = [];
  globalThis.fetch = async (input) => {
    const req = input instanceof Request ? input : new Request(input);
    const u = new URL(req.url);
    calls.push(`${u.hostname}${u.pathname}`);
    const f = FILES[`${u.hostname}${u.pathname}`];
    if (f) return Response.json(f);
    return new Response('nf', { status: 404 });
  };
});
const get = (url) => worker.fetch(new Request(url), env(), { waitUntil() {} });

test('MARKET_INDEX_EXCLUDED_ROOTS: the two-letter roots helix-query.yaml\'s market-pages leaves out, as it lists them', () => {
  const yaml = fs.readFileSync(new URL('../../../../helix-query.yaml', import.meta.url), 'utf8');
  const block = yaml.slice(yaml.indexOf('\n  market-pages:\n'), yaml.indexOf('\n    target: /market-pages.json'));
  const excluded = [...block.matchAll(/^ {6}- \/([a-z]{2})\/([a-z]{2})\/\*\*$/gm)].map((m) => `${m[1]}/${m[2]}`);
  assert.deepEqual([...MARKET_INDEX_EXCLUDED_ROOTS].sort(), excluded.sort());
});

test('siteEnv: SWISS\'s live market roots among them read their own search index besides the market index; roots not in the table and the other sites none', () => {
  const swiss = siteEnv(env(), siteOf(new Request('https://swiss.example/ch/en/homepage'), env()));
  ['es/es', 'br/pt', 'de/en', 'fr/fr', 'it/it'].forEach((r) => assert.ok(swiss.MARKET_EXTRA_INDEXES.includes(`/${r}/search-index.json`), r));
  // a root of a language whose market roots are not live yet, a language version of another site
  assert.equal(swiss.MARKET_EXTRA_INDEXES.some((p) => p.startsWith('/pl/pl/') || p.startsWith('/nl/nl/')), false);
  const ita = siteEnv(env(), siteOf(new Request('https://ita.example/it/en/homepage'), env()));
  assert.equal(ita.MARKET_EXTRA_INDEXES, undefined);
});

test('a SWISS market root under such a path (es/es): its own pages in its search index, the language version\'s for the rest', async () => {
  const resp = await get('https://swiss.example/es/es/search-index.json');
  assert.equal(resp.status, 200);
  const paths = (await resp.json()).data.map((r) => r.path);
  assert.ok(paths.includes('/es/es/bizum'), paths.join(' '));
  assert.ok(paths.includes('/es/es/homepage'), paths.join(' '));
  assert.ok(paths.includes('/es/es/prepare/baggage'), `the language version's page as the root's: ${paths.join(' ')}`);
  assert.ok(calls.includes(`${SWISS}/es/es/search-index.json`), calls.join(' '));
});

test('a SWISS market root the market index has (ar/es): as before, its own page in its search index', async () => {
  const paths = (await (await get('https://swiss.example/ar/es/search-index.json')).json()).data.map((r) => r.path);
  assert.ok(paths.includes('/ar/es/local-page/companion-special-swiss-business'), `ar/es: ${paths.join(' ')}`);
  assert.equal(paths.some((p) => p.startsWith('/es/es/')), false, `another root's own pages stay out: ${paths.join(' ')}`);
});

test('ITA\'s and lh-com\'s reads of the market index as before (no root search indexes added)', async () => {
  await get('https://ita.example/it/en/search-index.json');
  await get('https://lhedge.example/de/en/search-index.json');
  assert.equal(calls.some((c) => /\/(es\/es|br\/pt)\/search-index\.json$/.test(c)), false, calls.join(' '));
});
