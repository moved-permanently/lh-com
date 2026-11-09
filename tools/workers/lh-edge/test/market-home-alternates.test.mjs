/* eslint-disable max-len, no-restricted-syntax, no-await-in-loop */
/* hreflang on lufthansa.com's market roots' own homepages (brief 538 item 1). A market root's homepage is its own
   document: the market route hands it on as the origin answers it, so the language versions' homepages named it
   (de/de/homepage: kr/ko/homepage among 251) and it named nothing back (kr/ko, jp/ja, fr/fr, hk/hk/homepage: 0, live
   2026-11-09). The brand sites have had this since 16f2dd1 (withLiveAlternates' marketOwn in the site route); now
   lh-com's market route does the same: a live market root's own document lists the set its language version's page
   lists. Its market copies keep the market route's own list (not twice); a pilot root's own document, an own page no
   other root has, nav and a POST as before.
   Run: node --import ./test/cloudflare-workers-shim.mjs --test test/market-home-alternates.test.mjs */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { resetMarketCache } from '../src/markets.js';
import { resetRouterCache } from '../src/router.js';
import { LH_TABLES, tablesOf } from '../src/sites.js';

globalThis.HTMLRewriter = HTMLRewriter;

const ORIGIN = 'main--lh-com--moved-permanently.aem.live';
const HOST = 'lhedge.example';
// a wave live: ae/en and ae/de (market roots, their language versions' documents); kw/en still pilot
const live = (k) => ({ ...LH_TABLES.table[k], status: 'live' });
const pilot = (k) => ({ ...LH_TABLES.table[k], status: 'pilot' });
const TABLE = {
  'de/en': live('de/en'), 'de/de': live('de/de'), 'ae/en': live('ae/en'), 'ae/de': live('ae/de'), 'kw/en': pilot('kw/en'),
};
const env = {
  ORIGIN, WWW_HOST: 'www.lufthansa.com', PILOT_HOSTS: '', EDGE_TTL: '60', SITE_TABLES: tablesOf(TABLE, { en: 'de/en', de: 'de/de' }),
};
const sheet = (data) => ({
  total: data.length, offset: 0, limit: 1000, data, ':type': 'sheet',
});
const row = (path, extra = {}) => ({
  path, title: path, markets: '', robots: '', 'primary-language-url': '', lastModified: '1793045388', ...extra,
});
const INDEX = {
  '/de/en/search-index.json': sheet([row('/de/en/homepage'), row('/de/en/baggage')]),
  '/de/de/search-index.json': sheet([row('/de/de/homepage'), row('/de/de/baggage')]),
  // the market roots' own documents: ae/en's and kw/en's homepages, ae/en's own page no other root has
  '/market-pages.json': sheet([row('/ae/en/homepage'), row('/kw/en/homepage'), row('/ae/en/local-page/dubai-office')]),
};
const OWN = new Set(['/de/en/homepage', '/de/en/baggage', '/de/de/homepage', '/de/de/baggage', '/ae/en/homepage', '/kw/en/homepage', '/ae/en/local-page/dubai-office', '/de/en/nav', '/ae/en/nav']);
const page = (path) => `<!DOCTYPE html><html><head><title>${path}</title><link rel="canonical" href="https://${HOST}${path}"><link rel="alternate" hreflang="en" href="https://${HOST}/old"></head><body><main><h1>${path}</h1></main></body></html>`;
beforeEach(() => {
  resetMarketCache();
  resetRouterCache();
  globalThis.fetch = async (input) => {
    const req = input instanceof Request ? input : new Request(input);
    const u = new URL(req.url);
    if (u.hostname !== ORIGIN) return new Response('nf', { status: 404 });
    if (INDEX[u.pathname]) return Response.json(INDEX[u.pathname]);
    if (/\.(json|txt)$/.test(u.pathname)) return new Response('', { status: 404 });
    const path = u.pathname.replace(/\.plain\.html$/, '');
    if (!OWN.has(path)) return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html' } });
    const html = u.pathname.endsWith('.plain.html') ? `<div><h1>${path}</h1></div>` : page(path);
    return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8' } });
  };
});
const get = (path, method = 'GET') => worker.fetch(new Request(`https://${HOST}${path}`, { method }), env, { waitUntil() {} });
// the alternates lh-edge writes (the origin's /old link is checked on its own)
const tags = (html) => [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)">/g)].map((m) => `${m[1]} ${m[2]}`).filter((t) => !t.endsWith('/old')).sort();
const SET = ['de-AE /ae/de', 'de-DE /de/de', 'en-AE /ae/en', 'en-DE /de/en'].map((t) => `${t.replace(' /', ` https://${HOST}/`)}/homepage`).sort();

test('a live market root\'s own homepage lists the set its language version\'s homepage lists: they answer each other', async () => {
  const resp = await get('/ae/en/homepage');
  assert.equal(resp.status, 200);
  const html = await resp.text();
  assert.ok(html.includes('<h1>/ae/en/homepage</h1>'), 'its own document');
  assert.deepEqual(tags(html), SET);
  assert.ok(!html.includes(`https://${HOST}/old`), 'the origin\'s own hreflang link replaced');
  assert.ok(html.includes(`<link rel="canonical" href="https://${HOST}/ae/en/homepage">`), 'canonical kept');
  for (const other of ['/de/en/homepage', '/de/de/homepage', '/ae/de/homepage']) {
    assert.deepEqual(tags(await (await get(other)).text()), SET, other);
  }
});

test('a market copy keeps the market route\'s own list, once', async () => {
  const html = await (await get('/ae/en/baggage')).text();
  const all = [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(all).size, all.length, `no hreflang twice: ${all.join(' ')}`);
  assert.deepEqual(tags(html), ['de-AE /ae/de', 'de-DE /de/de', 'en-AE /ae/en', 'en-DE /de/en'].map((t) => `${t.replace(' /', ` https://${HOST}/`)}/baggage`).sort());
});

test('other answers as they are: a pilot root\'s own homepage, an own page no other root has, nav, a POST', async () => {
  for (const path of ['/kw/en/homepage', '/ae/en/local-page/dubai-office', '/ae/en/nav']) {
    const html = await (await get(path)).text();
    assert.deepEqual(tags(html), [], path);
  }
  assert.deepEqual(tags(await (await get('/ae/en/homepage', 'POST')).text()), [], 'POST');
});
