/* eslint-disable max-len */
/* Sites without <cc>/<ll> roots (src/sites.js PLAIN_SITES, brief 162): Lufthansa Cargo on
   cargo.turnsthe.page and Air Dolomiti on airdolomiti.turnsthe.page, every path passed through to
   the site's origin as it is, Cargo's entry redirects as on its source, /digitalhangar/ from the
   site's design host (Cargo: www.lufthansa.com, never www.lufthansa-cargo.com; Air Dolomiti: none,
   the origin's answer), no market route; Discover and ITA as before. */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { siteOf, PLAIN_SITES } from '../src/sites.js';

globalThis.HTMLRewriter = HTMLRewriter;

const CARGO = 'main--lh-cargo--moved-permanently.aem.live';
const AD = 'main--lh-airdolomiti--moved-permanently.aem.live';
const DISCOVER = 'main--lh-discover--moved-permanently.aem.live';
const FONT = '/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/fonts/lufthansa/LufthansaTextWeb-Regular.woff2';
// the vars as wrangler.toml has them
const env = (extra = {}) => ({
  ORIGIN: 'main--lh-com--moved-permanently.aem.live',
  WWW_HOST: 'www.lufthansa.com',
  SITE_HOSTS: 'discover.turnsthe.page=discover; ita.turnsthe.page=ita; cargo.turnsthe.page=cargo; airdolomiti.turnsthe.page=airdolomiti',
  SITE_ORIGINS: `discover=${DISCOVER}; ita=main--lh-ita--moved-permanently.aem.live; cargo=${CARGO}; airdolomiti=${AD}`,
  SITE_WWW_HOSTS: 'discover=www.discover-airlines.com; ita=www.ita-airways.com; cargo=www.lufthansa-cargo.com; airdolomiti=www.airdolomiti.it',
  SITE_DESIGN_HOSTS: 'discover=www.discover-airlines.com; ita=www.ita-airways.com; cargo=www.lufthansa.com',
  ...extra,
});
const META = { total: 1, data: [{ URL: '/**', robots: 'noindex, nofollow', brand: 'cargo' }], ':type': 'sheet' };
let calls;
beforeEach(() => {
  calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const u = new URL(req.url);
    calls.push({ host: u.hostname, path: `${u.pathname}${u.search}`, headers: Object.fromEntries(req.headers) });
    const noindex = { 'x-robots-tag': 'noindex, nofollow' };
    if (u.hostname === CARGO || u.hostname === AD) {
      if (u.pathname === '/metadata.json') return Response.json(META, { headers: noindex });
      if (u.pathname === '/robots.txt') return new Response('User-agent: *\nDisallow: /\n', { headers: { 'content-type': 'text/plain', ...noindex } });
      if (u.pathname === '/en/news/old-article') return new Response(null, { status: 301, headers: { location: '/en/news/new-article', ...noindex } });
      if (u.pathname === '/en/products/cool-td') return new Response(`<html>${u.hostname} cool-td</html>`, { headers: { 'content-type': 'text/html', ...noindex } });
      return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html', ...noindex } });
    }
    if (u.hostname.startsWith('www.')) return new Response(`font from ${u.hostname}`, { headers: { 'content-type': 'font/woff2', 'cache-control': 'public, max-age=300' } });
    return new Response(`other ${u.hostname}${u.pathname}`, { headers: { 'content-type': 'text/html' } });
  };
});
const get = (url, e = env(), method = 'GET') => worker.fetch(new Request(url, { method, redirect: 'manual' }), e, { waitUntil() {} });

test('siteOf: a plain site with its origin, www and design host; without an origin none', () => {
  const cargo = siteOf(new Request('https://cargo.turnsthe.page/en/home'), env());
  assert.equal(cargo.name, 'cargo');
  assert.equal(cargo.tables, null);
  assert.equal(cargo.plain, PLAIN_SITES.cargo);
  assert.equal(cargo.origin, CARGO);
  assert.equal(cargo.www, 'www.lufthansa-cargo.com');
  assert.equal(cargo.design, 'www.lufthansa.com');
  const ad = siteOf(new Request('https://airdolomiti.turnsthe.page/'), env());
  assert.equal(ad.design, '');
  assert.equal(siteOf(new Request('https://cargo.turnsthe.page/'), env({ SITE_ORIGINS: `discover=${DISCOVER}` })), null);
  assert.equal(siteOf(new Request('https://discover.turnsthe.page/'), env()).plain, null, 'Discover keeps its tables');
});

test('Cargo: / and /en/, /de/ redirect to the homepage documents as on the source, nothing fetched', async () => {
  const cases = {
    '/': '/en/home', '/?utm=1': '/en/home?utm=1', '/en/': '/en/home', '/en': '/en/home', '/de/': '/de/home', '/de': '/de/home',
  };
  for (const [p, location] of Object.entries(cases)) { // eslint-disable-line no-restricted-syntax
    const resp = await get(`https://cargo.turnsthe.page${p}`); // eslint-disable-line no-await-in-loop
    assert.equal(resp.status, 302, p);
    assert.equal(resp.headers.get('location'), location, p);
    assert.equal(resp.headers.get('x-lh-edge-route'), 'site-entry');
  }
  assert.equal(calls.length, 0);
  assert.equal((await get('https://cargo.turnsthe.page/', env(), 'HEAD')).status, 302);
});

test('Cargo: every other path from its origin as it is (pages, the redirects sheet, metadata, robots), no market route', async () => {
  const page = await get('https://cargo.turnsthe.page/en/products/cool-td');
  assert.equal(page.status, 200);
  assert.equal(await page.text(), `<html>${CARGO} cool-td</html>`);
  assert.equal(page.headers.get('x-robots-tag'), null, 'as the other brand hosts (the reference Worker drops it)');
  const moved = await get('https://cargo.turnsthe.page/en/news/old-article');
  assert.equal(moved.status, 301);
  assert.equal(moved.headers.get('location'), '/en/news/new-article');
  assert.deepEqual(await (await get('https://cargo.turnsthe.page/metadata.json')).json(), META);
  assert.match(await (await get('https://cargo.turnsthe.page/robots.txt')).text(), /Disallow: \//);
  // the homepage documents: 404 until published (only /metadata.json is live)
  assert.equal((await get('https://cargo.turnsthe.page/en/home')).status, 404);
  // a <cc>/<ll> path: the origin's own answer, no language version
  assert.equal((await get('https://cargo.turnsthe.page/de/en/homepage')).status, 404);
  assert.ok(calls.every((c) => c.host === CARGO), calls.map((c) => c.host).join());
  assert.equal(calls.find((c) => c.path === '/en/products/cool-td').headers['x-forwarded-host'], 'cargo.turnsthe.page');
});

test('Cargo: /digitalhangar/ from www.lufthansa.com (its fonts), never www.lufthansa-cargo.com; OneTrust from the host', async () => {
  const font = await get(`https://cargo.turnsthe.page${FONT}`);
  assert.equal(font.status, 200);
  assert.equal(await font.text(), 'font from www.lufthansa.com');
  assert.equal(font.headers.get('cache-control'), 'public, max-age=300');
  assert.deepEqual(calls.map((c) => c.host), ['www.lufthansa.com']);
  await get('https://cargo.turnsthe.page/onetrust/scripttemplates/otSDKStub.js');
  assert.equal(calls.at(-1).host, 'cdn.cookielaw.org');
  assert.ok(calls.every((c) => c.host !== 'www.lufthansa-cargo.com'));
});

test('Air Dolomiti: / is the Italian homepage at /, /en/ and /de/ as they are; /digitalhangar/ the origin\'s answer', async () => {
  for (const p of ['/', '/en/', '/de/', '/en/voli']) { // eslint-disable-line no-restricted-syntax
    const resp = await get(`https://airdolomiti.turnsthe.page${p}`); // eslint-disable-line no-await-in-loop
    assert.equal(resp.status, 404, `${p}: the origin's answer (nothing published yet)`);
    assert.equal(calls.at(-1).host, AD);
    assert.equal(calls.at(-1).path, p);
  }
  const font = await get(`https://airdolomiti.turnsthe.page${FONT}`);
  assert.equal(font.status, 404);
  assert.equal(calls.at(-1).host, AD, 'no request to www.airdolomiti.it');
  assert.equal((await (await get('https://airdolomiti.turnsthe.page/metadata.json')).json()).data[0].robots, 'noindex, nofollow');
});

test('Discover: /digitalhangar/ from its design host as before, / to its first language version', async () => {
  const font = await get(`https://discover.turnsthe.page${FONT}`);
  assert.equal(await font.text(), 'font from www.discover-airlines.com');
  const entry = await get('https://discover.turnsthe.page/');
  assert.equal(entry.headers.get('location'), '/de/en/homepage');
});
