/* eslint-disable max-len */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { frontDoorTarget } from '../src/front-door.js';
import { digitalhangarUpstream, isDigitalhangarPath } from '../src/digitalhangar.js';

globalThis.HTMLRewriter = HTMLRewriter;

const FONTS = '/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/fonts';
const env = (extra = {}) => ({
  ORIGIN: 'main--lh-com--moved-permanently.aem.live',
  WWW_HOST: 'www.lufthansa.com',
  FRONT_DOOR_HOSTS: 'front.example',
  SITE_HOSTS: 'discover.example=discover; ita.example=ita',
  SITE_ORIGINS: 'discover=main--lh-discover--moved-permanently.aem.live; ita=main--lh-ita--moved-permanently.aem.live',
  SITE_WWW_HOSTS: 'discover=www.discover-airlines.com; ita=www.ita-airways.com',
  SITE_DESIGN_HOSTS: 'discover=www.discover-airlines.com; ita=www.ita-airways.com',
  ...extra,
});
// www's headers for a font file (2026-10-30)
const WWW_HEADERS = {
  'content-type': 'font/woff2', 'cache-control': 'public, max-age=300', 'access-control-allow-origin': '*', etag: '"f1"', 'set-cookie': '__cf_bm=1; domain=.lufthansa.com',
};
let calls;
beforeEach(() => {
  calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    calls.push({ url: req.url, headers: Object.fromEntries(req.headers), init });
    const u = new URL(req.url);
    if (u.hostname.startsWith('www.') && u.pathname.startsWith(`${FONTS}/`) && !u.pathname.includes('missing')) {
      if (req.headers.get('if-none-match') === '"f1"') return new Response(null, { status: 304, headers: { etag: '"f1"', 'cache-control': 'public, max-age=300' } });
      return new Response(`font from ${u.hostname}`, { headers: WWW_HEADERS });
    }
    return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html', 'cache-control': 'max-age=60' } });
  };
});

const get = (host, path, headers = {}, method = 'GET', e = env()) => worker.fetch(new Request(`https://${host}${path}`, { method, headers }), e, { waitUntil() {} });

test('the front door sends /digitalhangar/* to lh-edge', () => {
  assert.equal(frontDoorTarget(`${FONTS}/lufthansa/LufthansaTextWeb-Regular.woff2`), 'edge');
  assert.equal(frontDoorTarget(`${FONTS}/ita/OpenSans-Regular.woff`), 'edge');
  assert.equal(frontDoorTarget('/digitalhangar/'), 'origin');
  assert.equal(frontDoorTarget('/de/digitalhangar/x'), 'origin');
  assert.equal(isDigitalhangarPath('/digitalhangarx/y'), false);
});

test('digitalhangarUpstream: the env\'s www host, else www.lufthansa.com', () => {
  const url = new URL(`https://x.example${FONTS}/ita/OpenSans-Bold.woff?v=1`);
  assert.equal(digitalhangarUpstream(url, { WWW_HOST: 'www.ita-airways.com' }), `https://www.ita-airways.com${FONTS}/ita/OpenSans-Bold.woff?v=1`);
  assert.equal(digitalhangarUpstream(url, {}), `https://www.lufthansa.com${FONTS}/ita/OpenSans-Bold.woff?v=1`);
});

test('/digitalhangar/* on every kind of host: the brand www\'s answer, its headers unchanged, no cookies either way', async () => {
  const hosts = {
    'lh-edge.example': 'www.lufthansa.com', 'front.example': 'www.lufthansa.com', 'discover.example': 'www.discover-airlines.com', 'ita.example': 'www.ita-airways.com',
  };
  for (const [host, www] of Object.entries(hosts)) { // eslint-disable-line no-restricted-syntax
    calls = [];
    const resp = await get(host, `${FONTS}/lufthansa/LufthansaTextWeb-Regular.woff2`, { cookie: 'lh-geo=DE-HH', 'accept-encoding': 'gzip' }); // eslint-disable-line no-await-in-loop
    assert.equal(resp.status, 200, host);
    assert.equal(await resp.text(), `font from ${www}`, host); // eslint-disable-line no-await-in-loop
    assert.equal(resp.headers.get('cache-control'), 'public, max-age=31536000, immutable', `${host}: a release file: a year (test/digitalhangar-release.test.mjs)`);
    assert.equal(resp.headers.get('access-control-allow-origin'), '*');
    assert.equal(resp.headers.get('content-type'), 'font/woff2');
    assert.equal(resp.headers.get('etag'), '"f1"');
    assert.equal(resp.headers.get('set-cookie'), null);
    assert.equal(calls.length, 1, host);
    assert.equal(calls[0].url, `https://${www}${FONTS}/lufthansa/LufthansaTextWeb-Regular.woff2`);
    assert.deepEqual(calls[0].init.cf, { cacheEverything: true, cacheTtlByStatus: { '200-299': 31536000, '300-599': -1 } });
    assert.equal(calls[0].headers.cookie, undefined);
    assert.equal(calls[0].headers['accept-encoding'], 'gzip');
  }
});

test('/digitalhangar/*: www\'s 404 and 304 as they are, HEAD without a body, no www host set: www.lufthansa.com', async () => {
  const missing = await get('front.example', `${FONTS}/lufthansa/missing.woff2`);
  assert.equal(missing.status, 404);
  assert.equal(missing.headers.get('cache-control'), 'max-age=60');
  const revalidated = await get('ita.example', `${FONTS}/ita/OpenSans-Regular.woff`, { 'if-none-match': '"f1"' });
  assert.equal(revalidated.status, 304);
  assert.equal(calls.at(-1).headers['if-none-match'], '"f1"');
  const lhRevalidated = await get('lh-edge.example', `${FONTS}/ita/OpenSans-Regular.woff`, { 'if-none-match': '"f1"' });
  assert.equal(lhRevalidated.status, 304, 'lh-com\'s route keeps the conditions');
  const head = await get('discover.example', `${FONTS}/lufthansa/LufthansaHeadWeb-Bold.woff2`, {}, 'HEAD');
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  assert.equal(calls.at(-1).init.method, 'HEAD');
  await get('lh-edge.example', `${FONTS}/mmg/LufthansaMAMTextWeb-Regular.woff`, {}, 'GET', env({ WWW_HOST: '' }));
  assert.equal(calls.at(-1).url, `https://www.lufthansa.com${FONTS}/mmg/LufthansaMAMTextWeb-Regular.woff`);
});
