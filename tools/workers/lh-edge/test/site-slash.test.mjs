/* eslint-disable max-len */
/* A trailing slash on the brand hosts (brief 349, src/url-forms.js siteSlashForm): a page path
   with a trailing slash that the site answers 404 (/ch/en/homepage/, /pt-pt/, /en/home/) is one
   301 to the path without it, the query kept, as lufthansa.turnsthe.page's url-form route does;
   every slash path the site answers today keeps its answer (Air Dolomiti's /en/ homepage, TAP's
   /de-ch/, the entry redirects /ch/en/ and /en/), and / stays as it is; files, code paths and
   POSTs as before.
   Run: node --import ./test/cloudflare-workers-shim.mjs --test test/site-slash.test.mjs */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { resetMarketCache } from '../src/markets.js';

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
// the origins: a slash path is 404 (aem.live), but Air Dolomiti's /en/ and TAP's /de-ch/ homepages
const OWN_SLASH = new Set(['main--lh-airdolomiti--moved-permanently.aem.live/en/', 'main--lh-tap--moved-permanently.aem.live/de-ch/']);
let calls;
beforeEach(() => {
  resetMarketCache();
  calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    const u = new URL(req.url);
    calls.push(`${req.method} ${u.hostname}${u.pathname}`);
    if (u.pathname.endsWith('.json')) return Response.json({ total: 0, data: [], ':type': 'sheet' });
    if (u.pathname.endsWith('/') && u.pathname !== '/' && !OWN_SLASH.has(`${u.hostname}${u.pathname}`)) {
      return new Response('<html><head><title>Page not found | Lufthansa</title></head><body>404</body></html>', { status: 404, headers: { 'content-type': 'text/html' } });
    }
    return new Response('<html><head></head><body><main>page</main></body></html>', { headers: { 'content-type': 'text/html' } });
  };
});
const get = (url, method = 'GET') => worker.fetch(new Request(url, { method }), env(), { waitUntil: () => {} });

test('a brand host\'s page path with a trailing slash the site answers 404: one 301 without it, the query kept', async () => {
  const cases = [
    ['https://swiss.turnsthe.page/ch/en/homepage/', '/ch/en/homepage'],
    ['https://austrian.turnsthe.page/at/en/homepage/', '/at/en/homepage'],
    ['https://cargo.turnsthe.page/en/home/', '/en/home'],
    ['https://tap.turnsthe.page/pt-pt/', '/pt-pt'],
    ['https://tap.turnsthe.page/pt-pt/ajuda/', '/pt-pt/ajuda'],
    ['https://tap.turnsthe.page/pt-pt/ajuda/?x=1&y=2', '/pt-pt/ajuda?x=1&y=2'],
    ['https://discover.turnsthe.page/de/en/homepage//', '/de/en/homepage'],
    ['https://airdolomiti.turnsthe.page/en/newsletter-subscription/', '/en/newsletter-subscription'],
  ];
  // one at a time: the fetch stub is shared
  await cases.reduce((prev, [url, location]) => prev.then(async () => {
    const resp = await get(url);
    assert.equal(resp.status, 301, url);
    assert.equal(resp.headers.get('location'), location, url);
    assert.equal(resp.headers.get('x-lh-edge-route'), 'url-form', url);
  }), Promise.resolve());
  const head = await get('https://tap.turnsthe.page/pt-pt/', 'HEAD');
  assert.equal(head.status, 301);
});

test('slash paths the site answers keep their answers; / , files, code paths and POSTs as before', async () => {
  const ad = await get('https://airdolomiti.turnsthe.page/en/');
  assert.equal(ad.status, 200, 'Air Dolomiti\'s English homepage is /en/');
  const ch = await get('https://tap.turnsthe.page/de-ch/');
  assert.equal(ch.status, 200, 'a TAP market root\'s own homepage');
  const entry = await get('https://swiss.turnsthe.page/ch/en/');
  assert.equal(entry.status, 302, 'the entry redirect');
  assert.equal(entry.headers.get('location'), '/ch/en/homepage');
  assert.equal((await get('https://cargo.turnsthe.page/en/')).headers.get('location'), '/en/home');
  assert.notEqual((await get('https://tap.turnsthe.page/')).status, 301, '/ as it is');
  assert.equal((await get('https://swiss.turnsthe.page/scripts/nope/')).status, 404, 'code paths: no redirect');
  assert.equal((await get('https://swiss.turnsthe.page/ch/en/file.pdf/')).status, 404, 'a file name: no redirect');
  assert.equal((await get('https://swiss.turnsthe.page/ch/en/homepage/', 'POST')).status !== 301, true, 'POST: no redirect');
});

test('lufthansa.turnsthe.page as before (its own url-form route)', async () => {
  const resp = await get('https://lufthansa.turnsthe.page/de/en/homepage/?a=1');
  assert.equal(resp.status, 301);
  assert.equal(resp.headers.get('location'), '/de/en/homepage?a=1');
});
