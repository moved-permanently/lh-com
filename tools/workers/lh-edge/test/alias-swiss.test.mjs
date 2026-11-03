/* eslint-disable max-len */
/* SWISS's China host (www.swiss.com.cn for www.swiss.com: swiss-cn.turnsthe.page for
   swiss.turnsthe.page), as austrian-cn (alias-site.test.mjs): routed as the SWISS site (SITE_HOSTS),
   the alias rules of src/alias.js with the site's own host as the host its links move from, / to
   /cn/en/homepage (www.swiss.com.cn's home; SWISS's cn/en market root), the origin asked for
   swiss.turnsthe.page so the canonical names its page (as www.swiss.com.cn's name www.swiss.com's),
   robots as swiss.turnsthe.page's. The deployed vars (wrangler.toml) name it; lufthansa-cn's and
   austrian-cn's entries as they were. */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import worker from '../src/index.js';
import { siteOf } from '../src/sites.js';
import { resetMarketCache } from '../src/markets.js';
import HTMLRewriter from './htmlrewriter-shim.mjs';

globalThis.HTMLRewriter = HTMLRewriter;
const LX = 'main--lh-swiss--moved-permanently.aem.live';
const toml = fs.readFileSync(new URL('../wrangler.toml', import.meta.url), 'utf8');
const VAR = (name) => (toml.match(new RegExp(`^${name} = "([^"]*)"`, 'm')) || [])[1];
const env = {
  ORIGIN: 'main--lh-com--moved-permanently.aem.live',
  WWW_HOST: 'www.lufthansa.com',
  PUBLIC_HOST: '',
  PILOT_HOSTS: '',
  EDGE_TTL: '60',
  AEM_PUBLISH: 'https://publish-p1-e2.adobeaemcloud.com',
  ALIAS_HOSTS: VAR('ALIAS_HOSTS'),
  ALIAS_REWRITE_HOSTS: 'lufthansa.turnsthe.page,lufthansa-edge.turnsthe.page',
  ALIAS_HOME_ROOT: VAR('ALIAS_HOME_ROOT'),
  ALIAS_HTML_CACHE_CONTROL: 'public, max-age=28800',
  SITE_HOSTS: VAR('SITE_HOSTS'),
  SITE_ORIGINS: VAR('SITE_ORIGINS'),
  SITE_WWW_HOSTS: VAR('SITE_WWW_HOSTS'),
};
// as main--lh-swiss--moved-permanently.aem.live answers: canonical, og:url and hreflang name the
// X-Forwarded-Host it is asked with
const PAGE = (host, p) => `<!DOCTYPE html><html><head><title>SWISS</title>
<link rel="canonical" href="https://${host}${p}">
<meta property="og:url" content="https://${host}${p}">
<link rel="alternate" hreflang="zh-CN" href="https://${host}/cn/zh/homepage">
</head><body><main>
<a href="https://swiss.turnsthe.page/cn/en/fly/check-in">check-in</a>
<a href="https://www.swiss.com/cn/en/book/flights">www</a>
<a href="https://austrian.turnsthe.page/at/en/homepage">austrian</a>
<a href="/cn/en/relative">relative</a>
<img src="https://swiss.turnsthe.page/cn/en/media_1.jpg">
</main></body></html>`;
const ROBOTS = 'User-agent: *\nDisallow: /\n';

let forwarded;
beforeEach(() => {
  resetMarketCache();
  forwarded = [];
  globalThis.fetch = async (input) => {
    const req = input instanceof Request ? input : new Request(input);
    const u = new URL(req.url);
    forwarded.push(req.headers.get('x-forwarded-host'));
    if (u.hostname === LX && ['/cn/en/homepage', '/ch/en/homepage'].includes(u.pathname)) return new Response(PAGE(req.headers.get('x-forwarded-host') || LX, u.pathname), { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'max-age=300' } });
    if (u.hostname === LX && u.pathname === '/robots.txt') return new Response(ROBOTS, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
    return new Response('nf', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});
const get = (host, p, headers = {}) => worker.fetch(new Request(`https://${host}${p}`, { redirect: 'manual', headers }), env, { waitUntil() {} });

test('the deployed vars: swiss-cn an alias host of the SWISS site; lufthansa-cn\'s and austrian-cn\'s entries as they were', () => {
  const aliases = VAR('ALIAS_HOSTS').split(',');
  assert.deepEqual(aliases, ['lufthansa-cn.turnsthe.page', 'austrian-cn.turnsthe.page', 'swiss-cn.turnsthe.page']);
  const hosts = Object.fromEntries(VAR('SITE_HOSTS').split(';').map((x) => x.trim().split('=')));
  assert.equal(hosts['swiss-cn.turnsthe.page'], 'swiss');
  assert.equal(hosts['austrian-cn.turnsthe.page'], 'austrian');
  assert.equal(hosts['lufthansa-cn.turnsthe.page'], undefined, 'lufthansa-cn is lh-com\'s alias, not a site host');
  // the site's own host first: the one the alias asks the origin for (the canonical)
  assert.equal(Object.keys(hosts).filter((h) => hosts[h] === 'swiss')[0], 'swiss.turnsthe.page');
  assert.equal(VAR('ALIAS_HOME_ROOT'), 'cn/en');
});

test('swiss-cn: the SWISS site on its alias host (its origin, its tables)', async () => {
  const site = siteOf(new Request('https://swiss-cn.turnsthe.page/cn/en/homepage'), env);
  assert.equal(site.name, 'swiss');
  assert.equal(site.origin, LX);
  const resp = await get('swiss-cn.turnsthe.page', '/cn/en/homepage');
  assert.equal(resp.status, 200);
});

test('swiss-cn: links to swiss.turnsthe.page on the alias host; www.swiss.com, other sites and relative links stay; the canonical and hreflang swiss.turnsthe.page\'s', async () => {
  const resp = await get('swiss-cn.turnsthe.page', '/cn/en/homepage');
  const html = await resp.text();
  assert.match(html, /<a href="https:\/\/swiss-cn\.turnsthe\.page\/cn\/en\/fly\/check-in">/);
  assert.match(html, /<img src="https:\/\/swiss-cn\.turnsthe\.page\/cn\/en\/media_1\.jpg">/);
  assert.match(html, /<a href="https:\/\/www\.swiss\.com\/cn\/en\/book\/flights">/);
  assert.match(html, /<a href="https:\/\/austrian\.turnsthe\.page\/at\/en\/homepage">/, 'another site\'s host stays');
  assert.match(html, /<a href="\/cn\/en\/relative">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/swiss\.turnsthe\.page\/cn\/en\/homepage">/);
  assert.match(html, /<meta property="og:url" content="https:\/\/swiss\.turnsthe\.page\/cn\/en\/homepage">/);
  assert.match(html, /<link rel="alternate" hreflang="zh-CN" href="https:\/\/swiss\.turnsthe\.page\/cn\/zh\/homepage">/);
  assert.ok(forwarded.every((h) => h === 'swiss.turnsthe.page'), `the origin asked for the site's host: ${forwarded.join(' ')}`);
  assert.equal(resp.headers.get('cache-control'), 'public, max-age=28800');
});

test('swiss-cn: / to /cn/en/homepage (www.swiss.com.cn\'s home), the query kept; swiss.turnsthe.page\'s / as before', async () => {
  const home = await get('swiss-cn.turnsthe.page', '/', { 'cf-ipcountry': 'CH' });
  assert.equal(home.status, 302);
  assert.equal(home.headers.get('location'), '/cn/en/homepage');
  assert.equal((await get('swiss-cn.turnsthe.page', '/?x=1')).headers.get('location'), '/cn/en/homepage?x=1');
  assert.equal((await get('swiss.turnsthe.page', '/')).headers.get('location'), '/ch/en/homepage');
});

test('swiss-cn: robots as swiss.turnsthe.page (the .com file); the site host\'s own answers untouched', async () => {
  assert.equal(await (await get('swiss-cn.turnsthe.page', '/robots.txt')).text(), ROBOTS);
  assert.equal(await (await get('swiss.turnsthe.page', '/robots.txt')).text(), ROBOTS);
  const page = await get('swiss.turnsthe.page', '/ch/en/homepage');
  const html = await page.text();
  assert.match(html, /<link rel="canonical" href="https:\/\/swiss\.turnsthe\.page\/ch\/en\/homepage">/);
  assert.match(html, /<a href="https:\/\/swiss\.turnsthe\.page\/cn\/en\/fly\/check-in">/, 'no alias rewrite on the site\'s host');
  assert.notEqual(page.headers.get('cache-control'), 'public, max-age=28800');
});
