/* eslint-disable max-len */
/* Sitemaps on the brand hosts (brief 342, src/site-sitemaps.js): each brand host answers
   /sitemap.xml with a sitemap index of its own sitemaps, URLs on the host itself:
   - TAP: its eight language versions' /<version>/sitemap.xml (from helix-query.yaml's
     tap-pages-<version> indexes: the version's pages, as the roots' sitemaps list them, without
     hreflang as theirs) and the market roots' that are on (/<root>/sitemap.xml, the market route's);
   - a site with <cc>/<ll> roots (Discover …): every language version's, own root's and served market
     root's /<cc>/<ll>/sitemap.xml: a language version's or own root's pages from its index, a
     market root's the language pages it serves and its own pages (the market model, as its pages);
   - a site without roots (Cargo, Air Dolomiti): one per language from its search index
     (/<ll>/sitemap.xml; a language at / as www.airdolomiti.it's /sitemap-it.xml).
   lh-com's hosts and every other path as before; robots.txt as it is.
   Run: node --import ./test/cloudflare-workers-shim.mjs --test test/site-sitemaps.test.mjs */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { resetMarketCache } from '../src/markets.js';
// eslint-disable-next-line import/no-relative-packages
import { TAP_LIVE_MARKETS, TAP_MARKETS } from '../../../../scripts/tap-markets.js';

globalThis.HTMLRewriter = HTMLRewriter;

const toml = fs.readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8');
const tomlVar = (name) => (toml.match(new RegExp(`^${name} = "([^"]*)"`, 'm')) || [])[1] || '';
const env = () => ({
  ORIGIN: 'main--lh-com--moved-permanently.aem.live',
  WWW_HOST: 'www.lufthansa.com',
  SITE_HOSTS: tomlVar('SITE_HOSTS'),
  SITE_ORIGINS: tomlVar('SITE_ORIGINS'),
  SITE_WWW_HOSTS: tomlVar('SITE_WWW_HOSTS'),
  MARKET_MODEL: 'full',
});
const sheet = (rows) => Response.json({
  total: rows.length, offset: 0, limit: 1000, data: rows, ':type': 'sheet',
});
const T = '1793700000';
const DAY = '2026-11-03';
const INDEXES = {
  'lh-tap': {
    '/pt-br/pages-index.json': [
      {
        path: '/pt-br', markets: '', robots: 'noindex, nofollow', lastModified: T,
      },
      {
        path: '/pt-br/ajuda', markets: '', robots: 'noindex, nofollow', lastModified: T,
      },
      {
        path: '/pt-br/a-bordo', markets: 'br', robots: '', lastModified: '',
      },
    ],
    '/de-de/pages-index.json': [
      { path: '/de-de', markets: '', lastModified: T },
      { path: '/de-de/nur-deutschland', markets: 'de', lastModified: T },
      { path: '/de-de/an-bord', markets: '', lastModified: T },
    ],
  },
  'lh-discover': {
    '/de/en/search-index.json': [
      {
        path: '/de/en/homepage', markets: '', robots: '', lastModified: T,
      },
      {
        path: '/de/en/book/flights', markets: '', robots: '', lastModified: T,
      },
      {
        path: '/de/en/only-germany', markets: 'de', robots: '', lastModified: T,
      },
      {
        path: '/de/en/hidden', markets: '', robots: 'noindex', lastModified: T,
      },
      {
        path: '/de/en/fragments/teaser', markets: '', robots: '', lastModified: T,
      },
    ],
    '/market-pages.json': [
      { path: '/us/en/homepage', robots: '', lastModified: T },
      { path: '/us/en/buccaneers-season-kickoff', robots: '', lastModified: T },
      { path: '/us/en/nav', robots: '', lastModified: T },
    ],
  },
  'lh-cargo': {
    '/en/search-index.json': [
      { path: '/en/home', lastModified: T },
      { path: '/en/ci/bold-moves', lastModified: T },
      { path: '/en/nav', lastModified: T },
    ],
  },
  'lh-airdolomiti': {
    '/search-index.json': [
      { path: '/aeroporti/bari', lastModified: T },
      { path: '/stato-volo', lastModified: '' },
    ],
    '/de/search-index.json': [{ path: '/de/flughaefen/bari', lastModified: T }],
  },
};
let calls;
beforeEach(() => {
  resetMarketCache();
  calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const u = new URL(req.url);
    calls.push(`${u.hostname}${u.pathname}`);
    const repo = (u.hostname.match(/^main--([a-z0-9-]+)--/) || [])[1];
    const rows = (INDEXES[repo] || {})[u.pathname];
    if (rows) return sheet(rows);
    if (u.pathname === '/sitemap.xml') return new Response('<?xml version="1.0" encoding="utf-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n</urlset>\n', { headers: { 'content-type': 'application/xml' } });
    if (u.pathname === '/robots.txt') return new Response('User-agent: *\nDisallow: /\n', { headers: { 'content-type': 'text/plain' } });
    return new Response('Not Found', { status: 404 });
  };
});
const get = (host, path, method = 'GET') => worker.fetch(new Request(`https://${host}${path}`, { method }), env(), { waitUntil: () => {} });
const locs = (xml) => [...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);

test('TAP: /sitemap.xml lists the eight language versions\' and the roots\' sitemaps that are on, on its host', async () => {
  const resp = await get('tap.turnsthe.page', '/sitemap.xml');
  assert.equal(resp.status, 200);
  assert.match(resp.headers.get('content-type'), /^application\/xml/);
  assert.equal(resp.headers.get('x-lh-edge-route'), 'site-sitemap');
  const xml = await resp.text();
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>\n<sitemapindex xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">/);
  const list = locs(xml);
  const roots = TAP_LIVE_MARKETS.filter((r) => TAP_MARKETS[r]).sort();
  assert.deepEqual(list.slice(0, 8), ['pt-pt', 'en-pt', 'es-es', 'fr-fr', 'de-de', 'it-it', 'pl-pl', 'pt-br'].map((v) => `https://tap.turnsthe.page/${v}/sitemap.xml`));
  assert.deepEqual(list.slice(8), roots.map((r) => `https://tap.turnsthe.page/${r}/sitemap.xml`));
  assert.equal(list.length, 8 + 137);
  assert.ok(!calls.some((c) => c.endsWith('/sitemap.xml')), 'made here, not asked of the origin');
});

test('TAP: a language version\'s sitemap: its pages from its index (homepage first), lastmod, no hreflang', async () => {
  const xml = await (await get('tap.turnsthe.page', '/pt-br/sitemap.xml')).text();
  assert.deepEqual(locs(xml), ['https://tap.turnsthe.page/pt-br', 'https://tap.turnsthe.page/pt-br/a-bordo', 'https://tap.turnsthe.page/pt-br/ajuda']);
  assert.match(xml, /<url><loc>https:\/\/tap\.turnsthe\.page\/pt-br<\/loc><lastmod>2026-11-03<\/lastmod><\/url>/);
  assert.match(xml, /<url><loc>https:\/\/tap\.turnsthe\.page\/pt-br\/a-bordo<\/loc><\/url>/);
  assert.doesNotMatch(xml, /xhtml/);
  const de = locs(await (await get('tap.turnsthe.page', '/de-de/sitemap.xml')).text());
  assert.deepEqual(de, ['https://tap.turnsthe.page/de-de', 'https://tap.turnsthe.page/de-de/an-bord', 'https://tap.turnsthe.page/de-de/nur-deutschland'], 'the version keeps every page of its own');
  const head = await get('tap.turnsthe.page', '/pt-pt/sitemap.xml', 'HEAD');
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
});

test('TAP: a root\'s sitemap stays the market route\'s', async () => {
  const resp = await get('tap.turnsthe.page', '/de-ch/sitemap.xml');
  assert.equal(resp.headers.get('x-lh-edge-route'), 'tap-market');
  assert.deepEqual(locs(await resp.text()).slice(0, 2), ['https://tap.turnsthe.page/de-ch', 'https://tap.turnsthe.page/de-ch/an-bord']);
});

test('a site with <cc>/<ll> roots (Discover): the index, a language version\'s, a market root\'s', async () => {
  const index = locs(await (await get('discover.turnsthe.page', '/sitemap.xml')).text());
  assert.deepEqual(index, ['de/en', 'de/de', 'xx/fr', 'ca/en', 'ca/fr', 'us/de', 'us/en', 'xx/de', 'xx/en'].map((r) => `https://discover.turnsthe.page/${r}/sitemap.xml`));
  const v = await get('discover.turnsthe.page', '/de/en/sitemap.xml');
  assert.equal(v.headers.get('x-lh-edge-route'), 'site-sitemap');
  const vx = await v.text();
  assert.deepEqual(locs(vx), ['/de/en/book/flights', '/de/en/homepage', '/de/en/only-germany'].map((p) => `https://discover.turnsthe.page${p}`), 'not noindex, nav or fragments');
  assert.match(vx, new RegExp(`<lastmod>${DAY}</lastmod>`));
  const us = locs(await (await get('discover.turnsthe.page', '/us/en/sitemap.xml')).text());
  assert.deepEqual(us, ['/us/en/book/flights', '/us/en/buccaneers-season-kickoff', '/us/en/homepage'].map((p) => `https://discover.turnsthe.page${p}`), 'the language pages the country has and its own pages');
  assert.equal((await get('discover.turnsthe.page', '/zz/qq/sitemap.xml')).headers.get('x-lh-edge-route') === 'site-sitemap', false, 'not a root: as before');
});

test('sites without roots: Cargo per language, Air Dolomiti\'s Italian at /sitemap-it.xml', async () => {
  assert.deepEqual(locs(await (await get('cargo.turnsthe.page', '/sitemap.xml')).text()), ['https://cargo.turnsthe.page/en/sitemap.xml', 'https://cargo.turnsthe.page/de/sitemap.xml']);
  assert.deepEqual(locs(await (await get('cargo.turnsthe.page', '/en/sitemap.xml')).text()), ['https://cargo.turnsthe.page/en/home', 'https://cargo.turnsthe.page/en/ci/bold-moves']);
  assert.deepEqual(locs(await (await get('airdolomiti.turnsthe.page', '/sitemap.xml')).text()), ['https://airdolomiti.turnsthe.page/sitemap-it.xml', 'https://airdolomiti.turnsthe.page/en/sitemap.xml', 'https://airdolomiti.turnsthe.page/de/sitemap.xml']);
  assert.deepEqual(locs(await (await get('airdolomiti.turnsthe.page', '/sitemap-it.xml')).text()), ['https://airdolomiti.turnsthe.page/', 'https://airdolomiti.turnsthe.page/aeroporti/bari', 'https://airdolomiti.turnsthe.page/stato-volo']);
  assert.deepEqual(locs(await (await get('airdolomiti.turnsthe.page', '/de/sitemap.xml')).text()), ['https://airdolomiti.turnsthe.page/de/', 'https://airdolomiti.turnsthe.page/de/flughaefen/bari']);
});

test('as before: lh-com\'s host, robots.txt, a path that is no sitemap of the site', async () => {
  const lh = await get('lufthansa.turnsthe.page', '/sitemap.xml');
  assert.notEqual(lh.headers.get('x-lh-edge-route'), 'site-sitemap');
  const robots = await get('tap.turnsthe.page', '/robots.txt');
  assert.equal(await robots.text(), 'User-agent: *\nDisallow: /\n');
  assert.notEqual((await get('cargo.turnsthe.page', '/fr/sitemap.xml')).headers.get('x-lh-edge-route'), 'site-sitemap');
});
