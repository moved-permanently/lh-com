/* eslint-disable max-len */
/* A site's alias host (www.austrian.cn for www.austrian.com: austrian-cn.turnsthe.page for
   austrian.turnsthe.page): routed as the site (SITE_HOSTS), the alias rules of src/alias.js with the
   site's own hosts as the hosts its links move from, / to /<ALIAS_HOME_ROOT>/homepage (the site's
   cn/en), the canonical and robots as on the site's host. lufthansa-cn as before (alias.test.mjs). */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';
import { siteOf } from '../src/sites.js';
import { resetMarketCache } from '../src/markets.js';
import HTMLRewriter from './htmlrewriter-shim.mjs';

globalThis.HTMLRewriter = HTMLRewriter;
const AT = 'main--lh-austrian--moved-permanently.aem.live';
const env = {
  ORIGIN: 'main--lh-com--moved-permanently.aem.live',
  WWW_HOST: 'www.lufthansa.com',
  PUBLIC_HOST: '',
  PILOT_HOSTS: '',
  EDGE_TTL: '60',
  AEM_PUBLISH: 'https://publish-p1-e2.adobeaemcloud.com',
  ALIAS_HOSTS: 'lufthansa-cn.turnsthe.page,austrian-cn.turnsthe.page',
  ALIAS_REWRITE_HOSTS: 'lufthansa.turnsthe.page,lufthansa-edge.turnsthe.page',
  ALIAS_HOME_ROOT: 'cn/en',
  ALIAS_HTML_CACHE_CONTROL: 'public, max-age=28800',
  SITE_HOSTS: 'austrian.turnsthe.page=austrian; austrian-cn.turnsthe.page=austrian',
  SITE_ORIGINS: `austrian=${AT}`,
  SITE_WWW_HOSTS: 'austrian=www.austrian.com',
  SITE_DESIGN_HOSTS: 'austrian=www.lufthansa.com',
};
// as main--lh-austrian--moved-permanently.aem.live answers (no production host in the site's
// config): the canonical, og:url and hreflang name the X-Forwarded-Host it is asked with (the live
// austrian-cn answer, 2026-11-02 13:20 UTC: canonical https://austrian-cn.turnsthe.page/cn/zh/homepage)
const PAGE = (host) => `<!DOCTYPE html><html><head><title>Austrian</title>
<link rel="canonical" href="https://${host}/at/en/homepage">
<meta property="og:url" content="https://${host}/at/en/homepage">
<link rel="alternate" hreflang="de-AT" href="https://${host}/at/de/homepage">
</head><body><main>
<a href="https://austrian.turnsthe.page/at/en/baggage">baggage</a>
<a href="https://www.austrian.com/at/en/offers">www</a>
<a href="https://lufthansa.turnsthe.page/de/en/homepage">lufthansa</a>
<a href="/at/en/relative">relative</a>
<img src="https://austrian.turnsthe.page/at/en/media_1.jpg">
</main></body></html>`;
const ROBOTS = 'User-agent: *\nDisallow: /\n';

let calls;
let forwarded;
beforeEach(() => {
  resetMarketCache();
  calls = [];
  forwarded = [];
  globalThis.fetch = async (input) => {
    const req = input instanceof Request ? input : new Request(input);
    const u = new URL(req.url);
    calls.push(`${u.hostname}${u.pathname}`);
    forwarded.push(req.headers.get('x-forwarded-host'));
    if (u.hostname === AT && u.pathname === '/at/en/homepage') return new Response(PAGE(req.headers.get('x-forwarded-host') || AT), { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'max-age=300' } });
    if (u.hostname === AT && u.pathname === '/robots.txt') return new Response(ROBOTS, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
    return new Response('nf', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});
const get = (host, p, headers = {}) => worker.fetch(new Request(`https://${host}${p}`, { redirect: 'manual', headers }), env, { waitUntil() {} });

test('austrian-cn: the Austrian site on its alias host (its origin, its tables)', async () => {
  const site = siteOf(new Request('https://austrian-cn.turnsthe.page/at/en/homepage'), env);
  assert.equal(site.name, 'austrian');
  assert.equal(site.origin, AT);
  const resp = await get('austrian-cn.turnsthe.page', '/at/en/homepage');
  assert.equal(resp.status, 200);
  assert.ok(calls.includes(`${AT}/at/en/homepage`), calls.join(' '));
});

test('austrian-cn: links to the site\'s host on the alias host; www.austrian.com, other sites and relative links stay; the canonical and hreflang the site host\'s', async () => {
  const resp = await get('austrian-cn.turnsthe.page', '/at/en/homepage');
  const html = await resp.text();
  assert.match(html, /<a href="https:\/\/austrian-cn\.turnsthe\.page\/at\/en\/baggage">/);
  assert.match(html, /<img src="https:\/\/austrian-cn\.turnsthe\.page\/at\/en\/media_1\.jpg">/);
  assert.match(html, /<a href="https:\/\/www\.austrian\.com\/at\/en\/offers">/);
  assert.match(html, /<a href="https:\/\/lufthansa\.turnsthe\.page\/de\/en\/homepage">/, 'another site\'s host stays');
  assert.match(html, /<a href="\/at\/en\/relative">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/austrian\.turnsthe\.page\/at\/en\/homepage">/);
  assert.match(html, /<meta property="og:url" content="https:\/\/austrian\.turnsthe\.page\/at\/en\/homepage">/);
  assert.match(html, /<link rel="alternate" hreflang="de-AT" href="https:\/\/austrian\.turnsthe\.page\/at\/de\/homepage">/);
  assert.ok(forwarded.every((h) => h === 'austrian.turnsthe.page'), `the origin asked for the site's host: ${forwarded.join(' ')}`);
  assert.equal(resp.headers.get('cache-control'), 'public, max-age=28800');
});

test('austrian-cn: / to /cn/en/homepage (www.austrian.cn\'s home); austrian.turnsthe.page\'s / as before', async () => {
  const home = await get('austrian-cn.turnsthe.page', '/', { 'cf-ipcountry': 'DE' });
  assert.equal(home.status, 302);
  assert.equal(home.headers.get('location'), '/cn/en/homepage');
  const withQuery = await get('austrian-cn.turnsthe.page', '/?x=1');
  assert.equal(withQuery.headers.get('location'), '/cn/en/homepage?x=1');
  const main = await get('austrian.turnsthe.page', '/');
  assert.equal(main.headers.get('location'), '/at/en/homepage');
});

test('austrian-cn: robots as austrian.turnsthe.page (the .com file); the site host\'s own answers untouched', async () => {
  const cn = await get('austrian-cn.turnsthe.page', '/robots.txt');
  const at = await get('austrian.turnsthe.page', '/robots.txt');
  assert.equal(await cn.text(), ROBOTS);
  assert.equal(await at.text(), ROBOTS);
  const page = await get('austrian.turnsthe.page', '/at/en/homepage');
  const html = await page.text();
  assert.match(html, /<link rel="canonical" href="https:\/\/austrian\.turnsthe\.page\/at\/en\/homepage">/);
  assert.match(html, /<a href="https:\/\/austrian\.turnsthe\.page\/at\/en\/baggage">/, 'no alias rewrite on the site\'s host');
  assert.notEqual(page.headers.get('cache-control'), 'public, max-age=28800');
});
