/* eslint-disable max-len */
/* lh-edge as the front door (src/front-door.js): on FRONT_DOOR_HOSTS lh-edge's own rules for the
   main host: the gate's paths to lh-backends, lh-edge's paths to the routes, everything else to
   the origin; X-LH-Public-Host is the host. Other hosts as before. */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/index.js';
import { frontDoorTarget, frontDoorOf } from '../src/front-door.js';
import { resetRouterCache } from '../src/router.js';
import { resetMarketCache } from '../src/markets.js';

const ORIGIN = 'main--lh-com--moved-permanently.aem.live';
const DOOR = 'lufthansa.turnsthe.page';
let calls;
let backendCalls;
const env = () => ({
  ORIGIN,
  WWW_HOST: 'www.lufthansa.com',
  EDGE_TTL: '60',
  PILOT_HOSTS: 'lhedge.example',
  PILOT_COUNTRIES_BY_HOST: `lhcom.example=ch; ${DOOR}=ch`,
  FRONT_DOOR_HOSTS: DOOR,
  ROUTER_HEADER: 'x-route',
  BACKENDS: {
    fetch: async (req) => {
      backendCalls.push({ path: new URL(req.url).pathname, host: req.headers.get('x-lh-public-host'), cookie: req.headers.get('cookie') });
      return new Response('backends', { headers: { 'set-cookie': 'lh_gate=x; Path=/' } });
    },
  },
});
beforeEach(() => {
  resetRouterCache();
  resetMarketCache();
  calls = [];
  backendCalls = [];
  globalThis.fetch = async (input) => {
    const req = input instanceof Request ? input : new Request(input);
    const u = new URL(req.url);
    calls.push({ path: u.pathname, forwarded: req.headers.get('x-forwarded-host'), push: req.headers.get('x-push-invalidation') });
    if (u.pathname.endsWith('.json')) {
      return Response.json({
        total: 0, offset: 0, limit: 0, data: [], ':type': 'sheet',
      });
    }
    return new Response(`<html>eds ${u.pathname}</html>`, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'max-age=7200' } });
  };
});
const get = (path, host = DOOR, headers = {}) => worker.fetch(new Request(`https://${host}${path}`, { headers }), env(), { waitUntil: () => {} });

const EDGE = [
  // lhcom-solo-pages-to-lh-edge
  '/de/en/baggage.solo_continue', '/de/de/homepage.solo.continue.solo_continue', '/de/en/x.solo_continue.html',
  // lhcom-feeds-to-lh-edge
  '/content/mobile/lh/en/homepage.sdui', '/content/dam/lh/images/x.png', '/graphql/execute.json/Message-Center/q', '/api/content/graphql/execute.json/a/b',
  '/.well-known/assetlinks.json', '/.well-known/apple-app-site-association', '/service/secured/api/core/authenticate/loginPageUrl', '/service/secured/api/search',
  '/service/secured/api/core/booking/defaultairport', '/service/secured/api/core/booking/bookinglist', '/apps/dcep/deeplink/goodfortrain/stele', '/content/lh/markets/de/en/homepage.csi-owa-header.json',
  // lhcom-www-endpoints-to-lh-edge
  '/', '/de', '/de/en', '/de/en/', '/content/experience-fragments/lh/x.csi-xf.json', '/service-worker.js', '/sitemap/sitemap_lh.xml.gz', '/sitemap/sitemap_lh_hu_en.xml.gz',
  '/de/llms.txt', '/de/en/llms.txt', '/service/secured/api/captcha/verify', '/content/lh/markets/de/en/a.sdui', '/content/lh/markets/de/en/a.csi-offline.json',
  '/de/en/a.aircraft.json', '/de/en/a.changelocale', '/de/en/a.changelocale.html', '/de/en/a.mfe.html',
  // lhcom-ch-market-to-lh-edge
  '/ch/en/baggage', '/ch/de/gepaeck', '/sitemap/sitemap_lh.xml', '/sitemap/sitemap_lh_ch_en.xml',
  // lhcom-service-endpoints-to-lh-edge
  '/service/secured/api/x/y', '/sso/oauth/login', '/deeplink/cockpit', '/apps/dcep/deeplink/cockpit', '/apps/selectlanguage', '/de/en/homepage.v2.sdui',
];
const GATE = ['/migration-status', '/migration-status/batch-4', '/_lh-auth/login', '/_lh-auth/callback'];
// what lhcom's CDN leaves to the Edge Delivery origin (some of it lh-edge answers on lhedge)
const ORIGIN_PATHS = ['/de/en/homepage', '/de/en/baggage', '/de/en/addresses-worldwide.sdui', '/de/en/a.csi-offline.json', '/hu/en/baggage', '/sitemap/sitemap_lh_hu_en.xml',
  '/sitemap/sitemap_lh_de_en.xml', '/llms.txt', '/robots.txt', '/scripts/aem.js', '/loginservice', '/seatmap/LH400', '/_lh-backends/health', '/migration', '/de/en/a.v1.sdui', '/chx/en/a'];

test('the CDN rules: every sample path gets its target', () => {
  EDGE.forEach((p) => assert.equal(frontDoorTarget(p), 'edge', p));
  GATE.forEach((p) => assert.equal(frontDoorTarget(p), 'gate', p));
  ORIGIN_PATHS.forEach((p) => assert.equal(frontDoorTarget(p), 'origin', p));
});

test('front-door hosts: FRONT_DOOR_HOSTS only (not lufthansa-edge, the China host or the rest of turnsthe.page)', () => {
  assert.equal(frontDoorOf(new Request(`https://${DOOR}/`), env()), DOOR);
  ['lufthansa-edge.turnsthe.page', 'lufthansa-cn.turnsthe.page', 'other.turnsthe.page'].forEach((h) => assert.equal(frontDoorOf(new Request(`https://${h}/`), env()), null, h));
});

test('the gate: lh-backends with X-LH-Public-Host = the host, the cookie and its Set-Cookie passed on', async () => {
  const resp = await get('/migration-status', DOOR, { cookie: 'lh_gate=abc', 'x-lh-public-host': 'lhedge.example' });
  assert.equal(await resp.text(), 'backends');
  assert.equal(resp.headers.get('set-cookie'), 'lh_gate=x; Path=/');
  assert.deepEqual(backendCalls, [{ path: '/migration-status', host: DOOR, cookie: 'lh_gate=abc' }]);
  assert.equal(calls.length, 0, 'not the origin');
});

test('paths the CDN leaves to the origin: the pass-through (forwarded host, push invalidation), not lh-edge\'s routes', async () => {
  const sdui = await get('/de/en/addresses-worldwide.sdui');
  assert.equal(sdui.headers.get('x-route'), 'pass-through');
  assert.equal(await sdui.text(), '<html>eds /de/en/addresses-worldwide.sdui</html>');
  assert.deepEqual(calls[0], { path: '/de/en/addresses-worldwide.sdui', forwarded: DOOR, push: 'enabled' });
  assert.equal(sdui.headers.get('cache-control'), 'max-age=60', 'EDGE_TTL caps the browser cache, as on every host');
  // lhedge itself still answers the short app screen spelling with its route
  assert.equal((await get('/de/en/addresses-worldwide.sdui', 'lhedge.example')).headers.get('x-route'), 'sdui-web-short');
  // lh-backends' own families the CDN doesn't send to lh-edge: the origin, not BACKENDS
  assert.equal((await get('/loginservice')).headers.get('x-route'), 'pass-through');
  assert.equal(backendCalls.length, 0);
});

test('paths the CDN sends to lh-edge: its routes, with X-LH-Public-Host = the host whatever the client sent', async () => {
  const entry = await get('/de/en', DOOR, { 'x-lh-public-host': 'lhedge.example' });
  assert.equal(entry.headers.get('x-route'), 'entry');
  assert.equal(entry.headers.get('location'), '/de/en/homepage');
  const api = await get('/service/secured/api/core/x', DOOR, { 'x-lh-public-host': 'lhedge.example' });
  assert.equal(api.headers.get('x-route'), 'backends');
  assert.equal(backendCalls[0].host, DOOR);
  // the market roots of the host (ch only, as lhcom), not lhedge's (the client's header ignored)
  const hu = await get('/hu/en/baggage', DOOR, { 'x-lh-public-host': 'lhedge.example' });
  assert.equal(hu.headers.get('x-route'), 'pass-through');
  const ch = await get('/ch/en', DOOR);
  assert.equal(ch.headers.get('location'), '/ch/en/homepage');
});

test('other hosts: as before (no front door without FRONT_DOOR_HOSTS)', async () => {
  const lhcom = await worker.fetch(new Request('https://lhedge.example/de/en/addresses-worldwide.sdui', { headers: { 'x-lh-public-host': 'lhcom.example' } }), env(), {});
  assert.equal(lhcom.headers.get('x-route'), 'sdui-web-short');
  const off = await worker.fetch(new Request(`https://${DOOR}/de/en/addresses-worldwide.sdui`), { ...env(), FRONT_DOOR_HOSTS: '' }, {});
  assert.equal(off.headers.get('x-route'), 'sdui-web-short');
});
