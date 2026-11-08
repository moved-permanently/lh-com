/* eslint-disable max-len */
/* Brief 497 item 3: lh-b2b's market roots under the paths helix-query.yaml's market-pages index leaves
   out (src/sites.js MARKET_INDEX_EXCLUDED_ROOTS; on b2b: at/de, gb/en, it/en). gb/en's own
   /gb/en/program/experts/programs-and-groups (live 2026-11-08) has no row in /market-pages.json. The
   page itself is answered from the origin first, and the root's search index already takes the root's
   own index in (worldSearchIndex), but the market model's own documents come from the market index
   only: gb/en's sitemap listed the path with the language row's date, and a page only gb/en has would
   be missing from it. As on SWISS (swiss-market-index.test.mjs), b2b's reads of /market-pages.json add
   those roots' own search indexes (siteEnv MARKET_EXTRA_INDEXES, src/edge.js).
   Run: node --import ./test/cloudflare-workers-shim.mjs --test test/b2b-market-index.test.mjs */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { resetMarketCache } from '../src/markets.js';
import { siteOf, siteEnv } from '../src/sites.js';

globalThis.HTMLRewriter = HTMLRewriter;

const B2B = 'main--lh-b2b--moved-permanently.aem.live';
const env = () => ({
  ORIGIN: 'main--lh-com--moved-permanently.aem.live',
  WWW_HOST: 'www.lufthansa.com',
  PILOT_HOSTS: '',
  EDGE_TTL: '60',
  AEM_PUBLISH: 'https://publish-p1-e2.adobeaemcloud.com',
  SITE_HOSTS: 'b2b.example=b2b',
  SITE_ORIGINS: `b2b=${B2B}`,
  SITE_WWW_HOSTS: 'b2b=business.lufthansagroup.com',
  SITE_DESIGN_HOSTS: 'b2b=www.lufthansa.com',
});
const sheet = (data) => ({
  total: data.length, offset: 0, limit: 1000, data, ':type': 'sheet',
});
const row = (path, extra = {}) => ({
  path, title: path, description: '', robots: '', markets: '', lastModified: '1793587779', ...extra,
});
const FILES = {
  '/de/en/search-index.json': sheet([
    row('/de/en/homepage'),
    // de only: the other roots get the rest-of-world document
    row('/de/en/program/experts/programs-and-groups', { markets: 'de/en' }),
  ]),
  '/de/de/search-index.json': sheet([row('/de/de/homepage')]),
  '/market-pages.json': sheet([
    row('/xx/en/program/experts/programs-and-groups', { markets: undefined }),
  ]),
  // gb/en's own documents: its own index (helix-query search-gb-en serves every site), 2026-11-08
  '/gb/en/search-index.json': sheet([
    row('/gb/en/program/experts/programs-and-groups', { lastModified: '1794131899' }),
    row('/gb/en/program/experts/gb-only', { lastModified: '1794131899' }),
  ]),
};
let calls;
beforeEach(() => {
  resetMarketCache();
  calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const u = new URL(req.url);
    calls.push(`${u.hostname}${u.pathname}`);
    const f = u.hostname === B2B && FILES[u.pathname];
    if (f) return Response.json(f);
    return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});
const get = (path) => worker.fetch(new Request(`https://b2b.example${path}`), env(), { waitUntil() {} });

test('siteEnv: b2b\'s market roots among the excluded paths read their own search index besides the market index', () => {
  const b2b = siteEnv(env(), siteOf(new Request('https://b2b.example/de/en/homepage'), env()));
  assert.deepEqual([...b2b.MARKET_EXTRA_INDEXES].sort(), ['/at/de/search-index.json', '/gb/en/search-index.json', '/it/en/search-index.json']);
});

test('gb/en\'s sitemap: its own document with its own date, a page only gb/en has listed too', async () => {
  const resp = await get('/gb/en/sitemap.xml');
  assert.equal(resp.status, 200);
  const xml = await resp.text();
  assert.match(xml, /<loc>https:\/\/b2b\.example\/gb\/en\/program\/experts\/programs-and-groups<\/loc><lastmod>2026-11-08<\/lastmod>/, xml);
  assert.match(xml, /<loc>https:\/\/b2b\.example\/gb\/en\/program\/experts\/gb-only<\/loc>/, xml);
  assert.ok(calls.includes(`${B2B}/gb/en/search-index.json`), calls.join(' '));
});

test('another root (kw/en) as before: the rest-of-world page, none of gb/en\'s own', async () => {
  const xml = await (await get('/kw/en/sitemap.xml')).text();
  assert.match(xml, /\/kw\/en\/program\/experts\/programs-and-groups<\/loc>/, xml);
  assert.doesNotMatch(xml, /gb-only/, xml);
});
