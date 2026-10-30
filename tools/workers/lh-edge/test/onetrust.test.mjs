/* eslint-disable max-len */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import HTMLRewriter from './htmlrewriter-shim.mjs';
import worker from '../src/index.js';
import { frontDoorTarget } from '../src/front-door.js';
import { onetrustUpstream, isFontsPath, IMMUTABLE } from '../src/onetrust.js';

globalThis.HTMLRewriter = HTMLRewriter;

const LH = 'main--lh-com--moved-permanently.aem.live';
const DISCOVER = 'main--lh-discover--moved-permanently.aem.live';
const env = (extra = {}) => ({
  ORIGIN: LH,
  WWW_HOST: 'www.lufthansa.com',
  FRONT_DOOR_HOSTS: 'front.example',
  SITE_HOSTS: 'discover.example=discover',
  SITE_ORIGINS: `discover=${DISCOVER}`,
  SITE_WWW_HOSTS: 'discover=www.discover-airlines.com',
  ...extra,
});
const STUB = 'var otStubData={"bannerScriptUrl":"x"};/* the stub */';
let calls;
beforeEach(() => {
  calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const req = input instanceof Request ? input : new Request(input, init);
    calls.push({ url: req.url, headers: Object.fromEntries(req.headers), init });
    const u = new URL(req.url);
    if (u.hostname === 'cdn.cookielaw.org') {
      if (u.pathname === '/scripttemplates/otSDKStub.js') {
        return new Response(STUB, {
          headers: {
            'content-type': 'application/javascript', 'cache-control': 'public, max-age=14400', 'access-control-allow-origin': '*', 'set-cookie': '__cf_bm=1; domain=.cookielaw.org',
          },
        });
      }
      if (u.pathname === '/logos/static/ot_company_logo.png') return new Response('PNG', { headers: { 'content-type': 'image/png', 'cache-control': 'max-age=86400' } });
      return new Response('nope', { status: 404 });
    }
    if (u.pathname === '/fonts/lufthansa/v1.38.0/LufthansaTextWeb-Regular-latin.woff2') {
      return new Response('wOF2', { headers: { 'content-type': 'font/woff2', 'cache-control': 'max-age=7200', 'cdn-cache-control': 'max-age=172800' } });
    }
    if (u.pathname.endsWith('/homepage')) return new Response('<html><head></head><body><main><h1>Home</h1></main></body></html>', { headers: { 'content-type': 'text/html; charset=utf-8' } });
    if (u.pathname.endsWith('.json')) return Response.json({ data: [] });
    return new Response('<html>404</html>', { status: 404, headers: { 'content-type': 'text/html' } });
  };
});

const get = (host, path, headers = {}) => worker.fetch(new Request(`https://${host}${path}`, { headers }), env(), { waitUntil() {} });

test('onetrustUpstream: /onetrust/* and /logos/* on cdn.cookielaw.org, nothing else', () => {
  assert.equal(onetrustUpstream('/onetrust/scripttemplates/otSDKStub.js'), 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js');
  assert.equal(onetrustUpstream('/onetrust/consent/abc/abc.json', '?v=1'), 'https://cdn.cookielaw.org/consent/abc/abc.json?v=1');
  assert.equal(onetrustUpstream('/logos/static/ot_company_logo.png'), 'https://cdn.cookielaw.org/logos/static/ot_company_logo.png');
  assert.equal(onetrustUpstream('/onetrust/'), null);
  assert.equal(onetrustUpstream('/logos'), null);
  assert.equal(onetrustUpstream('/de/de/onetrust/x'), null);
});

test('the front door sends OneTrust, the logos and the versioned fonts to lh-edge', () => {
  assert.equal(frontDoorTarget('/onetrust/scripttemplates/otSDKStub.js'), 'edge');
  assert.equal(frontDoorTarget('/logos/static/ot_company_logo.png'), 'edge');
  assert.equal(frontDoorTarget('/fonts/lufthansa/v1.38.0/LufthansaTextWeb-Regular.woff2'), 'edge');
  assert.equal(frontDoorTarget('/fonts/other.woff2'), 'origin');
  assert.equal(frontDoorTarget('/styles/fonts.css'), 'origin');
  assert.equal(isFontsPath('/fonts/lufthansa/v1.38.0/sub/x.woff2'), false);
});

test('/onetrust/* on every kind of host: cdn.cookielaw.org bytes and cache-control, edge-cached, no cookies either way', async () => {
  for (const host of ['lh-edge.example', 'front.example', 'discover.example']) { // eslint-disable-line no-restricted-syntax
    calls = [];
    const resp = await get(host, '/onetrust/scripttemplates/otSDKStub.js', { cookie: 'OptanonConsent=x; lh-geo=DE', 'accept-encoding': 'gzip' }); // eslint-disable-line no-await-in-loop
    assert.equal(resp.status, 200, host);
    assert.equal(await resp.text(), STUB); // eslint-disable-line no-await-in-loop
    assert.equal(resp.headers.get('cache-control'), 'public, max-age=14400');
    assert.equal(resp.headers.get('content-type'), 'application/javascript');
    assert.equal(resp.headers.get('set-cookie'), null);
    assert.equal(calls.length, 1, host);
    assert.equal(calls[0].url, 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js');
    assert.deepEqual(calls[0].init.cf, { cacheEverything: true });
    assert.equal(calls[0].headers.cookie, undefined);
    assert.equal(calls[0].headers['accept-encoding'], 'gzip');
  }
  const logo = await get('front.example', '/logos/static/ot_company_logo.png');
  assert.equal(logo.status, 200);
  assert.equal(await logo.text(), 'PNG');
  assert.equal(calls.at(-1).url, 'https://cdn.cookielaw.org/logos/static/ot_company_logo.png');
  const missing = await get('lh-edge.example', '/onetrust/nope.js');
  assert.equal(missing.status, 404);
});

test('/fonts/lufthansa/v<version>/*: the origin\'s file, immutable for a year', async () => {
  for (const host of ['lh-edge.example', 'front.example', 'discover.example']) { // eslint-disable-line no-restricted-syntax
    const resp = await get(host, '/fonts/lufthansa/v1.38.0/LufthansaTextWeb-Regular-latin.woff2'); // eslint-disable-line no-await-in-loop
    assert.equal(resp.status, 200, host);
    assert.equal(await resp.text(), 'wOF2'); // eslint-disable-line no-await-in-loop
    assert.equal(resp.headers.get('cache-control'), IMMUTABLE, host);
    assert.equal(resp.headers.get('cdn-cache-control'), null);
  }
  const missing = await get('lh-edge.example', '/fonts/lufthansa/v1.38.0/missing.woff2');
  assert.equal(missing.status, 404);
  assert.notEqual(missing.headers.get('cache-control'), IMMUTABLE);
});

test('lh-geo: the visitor\'s country on HTML answers, once', async () => {
  const page = await get('lh-edge.example', '/de/de/homepage', { 'cf-ipcountry': 'at' });
  assert.equal(page.headers.get('set-cookie'), 'lh-geo=AT; Path=/; SameSite=Lax; Secure');
  const front = await get('front.example', '/de/de/homepage', { 'cf-ipcountry': 'CH' });
  assert.match(front.headers.get('set-cookie'), /^lh-geo=CH;/);
  const site = await get('discover.example', '/de/en/homepage', { 'cf-ipcountry': 'US' });
  assert.match(site.headers.get('set-cookie') || '', /lh-geo=US;/);
  // already there, unknown, Tor, not HTML: no cookie
  assert.equal((await get('lh-edge.example', '/de/de/homepage', { 'cf-ipcountry': 'AT', cookie: 'a=1; lh-geo=AT' })).headers.get('set-cookie'), null);
  assert.equal((await get('lh-edge.example', '/de/de/homepage')).headers.get('set-cookie'), null);
  assert.equal((await get('lh-edge.example', '/de/de/homepage', { 'cf-ipcountry': 'T1' })).headers.get('set-cookie'), null);
  assert.equal((await get('lh-edge.example', '/onetrust/scripttemplates/otSDKStub.js', { 'cf-ipcountry': 'DE' })).headers.get('set-cookie'), null);
  // a changed country replaces the old value
  assert.match((await get('lh-edge.example', '/de/de/homepage', { 'cf-ipcountry': 'DE', cookie: 'lh-geo=AT' })).headers.get('set-cookie'), /^lh-geo=DE;/);
});
