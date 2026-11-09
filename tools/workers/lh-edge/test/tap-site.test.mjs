/* eslint-disable max-len */
/* TAP Air Portugal on tap.turnsthe.page (brief 312): a site without <cc>/<ll> roots (src/sites.js
   PLAIN_SITES, as Air Dolomiti): every path passed through to main--lh-tap--moved-permanently.aem.live
   as it is, / to the first root /pt-pt (302, the query kept), lh-com's sitemaps 404, the origin's
   robots, metadata (noindex) and pages as the origin answers them; the host in wrangler.toml's
   vars and its smoke checks. The other sites as before. */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { siteOf, PLAIN_SITES } from '../src/sites.js';
import { PLAIN_CHECKS, TAP_CHECKS, checksOf } from '../smoke.mjs';

globalThis.HTMLRewriter = HTMLRewriter;

const TAP = 'main--lh-tap--moved-permanently.aem.live';
const AD = 'main--lh-airdolomiti--moved-permanently.aem.live';
const toml = fs.readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8');
const tomlVar = (name) => (toml.match(new RegExp(`^${name} = "([^"]*)"`, 'm')) || [])[1] || '';
// the vars as wrangler.toml has them
const env = () => ({
  ORIGIN: 'main--lh-com--moved-permanently.aem.live',
  WWW_HOST: 'www.lufthansa.com',
  SITE_HOSTS: tomlVar('SITE_HOSTS'),
  SITE_ORIGINS: tomlVar('SITE_ORIGINS'),
  SITE_WWW_HOSTS: tomlVar('SITE_WWW_HOSTS'),
  SITE_DESIGN_HOSTS: tomlVar('SITE_DESIGN_HOSTS'),
});
const META = { total: 1, data: [{ URL: '/**', robots: 'noindex, nofollow', brand: 'tap' }], ':type': 'sheet' };
let calls;
beforeEach(() => {
  calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const u = new URL(req.url);
    calls.push({ host: u.hostname, path: `${u.pathname}${u.search}`, headers: Object.fromEntries(req.headers) });
    const noindex = { 'x-robots-tag': 'noindex, nofollow' };
    if (u.hostname === TAP || u.hostname === AD) {
      if (u.pathname === '/metadata.json') return Response.json(META, { headers: noindex });
      if (u.pathname === '/robots.txt') return new Response('User-agent: *\nDisallow: /\n', { headers: { 'content-type': 'text/plain', ...noindex } });
      if (u.pathname === '/pt-pt' || u.pathname === '/en-pt/flights') return new Response(`<html>${u.hostname}${u.pathname}</html>`, { headers: { 'content-type': 'text/html', ...noindex } });
      return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html', ...noindex } });
    }
    return new Response(`other ${u.hostname}${u.pathname}`, { headers: { 'content-type': 'text/html' } });
  };
});
const get = (url, method = 'GET') => worker.fetch(new Request(url, { method, redirect: 'manual' }), env(), { waitUntil() {} });

test('wrangler.toml: tap.turnsthe.page is TAP, its origin lh-tap\'s aem.live, its www www.flytap.com; no design host; the other sites\' entries as before', () => {
  assert.match(tomlVar('SITE_HOSTS'), /(^|; )tap\.turnsthe\.page=tap(;|$)/);
  assert.match(tomlVar('SITE_ORIGINS'), new RegExp(`(^|; )tap=${TAP}(;|$)`));
  assert.match(tomlVar('SITE_WWW_HOSTS'), /(^|; )tap=www\.flytap\.com(;|$)/);
  assert.match(tomlVar('SITE_DESIGN_HOSTS'), /(^|; )tap=www\.lufthansa\.com(;|$)/);
  ['airdolomiti.turnsthe.page=airdolomiti', 'cargo.turnsthe.page=cargo', 'swiss.turnsthe.page=swiss', 'b2b.turnsthe.page=b2b'].forEach((e) => assert.ok(tomlVar('SITE_HOSTS').includes(e), e));
  const site = siteOf(new Request('https://tap.turnsthe.page/pt-pt'), env());
  assert.equal(site.name, 'tap');
  assert.equal(site.tables, null);
  assert.equal(site.plain, PLAIN_SITES.tap);
  assert.equal(site.origin, TAP);
  assert.equal(site.www, 'www.flytap.com');
  assert.equal(site.design, 'www.lufthansa.com');
});

test('/ to /pt-pt (302, the query kept), nothing fetched; HEAD too', async () => {
  for (const [p, location] of [['/', '/pt-pt'], ['/?utm_source=x', '/pt-pt?utm_source=x']]) { // eslint-disable-line no-restricted-syntax
    const resp = await get(`https://tap.turnsthe.page${p}`); // eslint-disable-line no-await-in-loop
    assert.equal(resp.status, 302, p);
    assert.equal(resp.headers.get('location'), location, p);
    assert.equal(resp.headers.get('x-lh-edge-route'), 'site-entry');
  }
  assert.equal(calls.length, 0);
  assert.equal((await get('https://tap.turnsthe.page/', 'HEAD')).status, 302);
});

test('every other path from lh-tap as it is: the roots\' pages, metadata (noindex), robots; lh-com\'s sitemaps 404', async () => {
  const home = await get('https://tap.turnsthe.page/pt-pt');
  assert.equal(home.status, 200);
  assert.equal(await home.text(), `<html>${TAP}/pt-pt</html>`);
  assert.equal(home.headers.get('x-robots-tag'), null, 'as the other brand hosts (the noindex is the pages\' robots metadata)');
  assert.equal((await get('https://tap.turnsthe.page/en-pt/flights')).status, 200);
  assert.equal((await get('https://tap.turnsthe.page/es-es/voos')).status, 404, 'a root not imported yet: the origin\'s 404');
  assert.deepEqual(await (await get('https://tap.turnsthe.page/metadata.json')).json(), META);
  assert.match(await (await get('https://tap.turnsthe.page/robots.txt')).text(), /Disallow: \//);
  assert.equal((await get('https://tap.turnsthe.page/de/en/homepage')).status, 404, 'no market route: the origin\'s answer');
  assert.ok(calls.every((c) => c.host === TAP), calls.map((c) => c.host).join());
  assert.equal(calls.find((c) => c.path === '/pt-pt').headers['x-forwarded-host'], 'tap.turnsthe.page');
  calls = [];
  const sitemap = await get('https://tap.turnsthe.page/sitemap/sitemap_lh.xml');
  assert.equal(sitemap.status, 404);
  assert.equal(sitemap.headers.get('x-lh-edge-route'), 'site-sitemap');
  assert.equal(calls.length, 0);
});

test('Air Dolomiti\'s host as before', async () => {
  const resp = await get('https://airdolomiti.turnsthe.page/');
  assert.equal(resp.status, 404, 'the origin\'s answer for / (its homepage document is /)');
  assert.equal(calls.at(-1).host, AD);
  assert.equal((await get('https://airdolomiti.turnsthe.page/en')).headers.get('location'), '/en/');
});

test('smoke: tap.turnsthe.page gets its own checks (its roots, robots, metadata, the sitemap), Cargo and Air Dolomiti theirs as before', () => {
  assert.equal(checksOf('https://tap.turnsthe.page'), TAP_CHECKS);
  assert.equal(checksOf('https://airdolomiti.turnsthe.page'), PLAIN_CHECKS);
  assert.deepEqual(TAP_CHECKS.map((c) => c.path), ['/metadata.json', '/robots.txt', '/', '/pt-pt', '/en-pt', '/sitemap/sitemap_lh.xml', '/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/fonts/lufthansa/LufthansaTextWeb-Regular.woff2']);
  assert.deepEqual(PLAIN_CHECKS.map((c) => c.path), ['/metadata.json', '/robots.txt', '/', '/en/', '/de/', '/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/fonts/lufthansa/LufthansaTextWeb-Regular.woff2']);
});
