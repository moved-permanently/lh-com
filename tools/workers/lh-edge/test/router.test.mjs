/* eslint-disable max-len, no-restricted-syntax, no-await-in-loop */
/* Production mode (src/router.js) and the referrer check (src/referrer.js): off by default (the
   route table as before), route switches, percentages with a sticky cookie, the kill switch, a
   default origin with path-by-path Edge Delivery, the route header, noindex on demo hosts; the
   per-host pilot countries (src/markets.js). */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import worker, { ROUTES } from '../src/index.js';
import {
  resetRouterCache, decide, pathPattern, choose, stateOf,
} from '../src/router.js';
import { hostAllowed, referrerRefusal } from '../src/referrer.js';
import { servedMarketRoots, resetMarketCache } from '../src/markets.js';

const ORIGIN = 'main--lh-com--moved-permanently.aem.live';
const base = {
  ORIGIN, WWW_HOST: 'www.lufthansa.com', EDGE_TTL: '60', PILOT_HOSTS: 'lhedge.example',
};
let calls;
beforeEach(() => {
  resetRouterCache();
  resetMarketCache();
  calls = [];
  globalThis.fetch = async (input) => {
    const req = input instanceof Request ? input : new Request(input);
    const u = new URL(req.url);
    calls.push(`${u.hostname} ${req.method} ${u.pathname}`);
    if (u.hostname === 'origin-www.example') return new Response(`old origin ${u.pathname}`, { headers: { 'content-type': 'text/html' } });
    if (u.pathname.endsWith('.json')) {
      return Response.json({
        total: 0, offset: 0, limit: 0, data: [], columns: [], ':type': 'sheet',
      });
    }
    return new Response(`<html>eds ${u.pathname}</html>`, { headers: { 'content-type': 'text/html; charset=utf-8' } });
  };
});
const get = (path, env, headers = {}, host = 'lhcom.example') => worker.fetch(new Request(`https://${host}${path}`, { headers }), { ...base, ...env }, { waitUntil: () => {} });
const kiosk = (env, headers = {}) => worker.fetch(new Request('https://lhcom.example/apps/dcep/deeplink/goodfortrain/stele', {
  method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', ...headers }, body: 'Country=de&Language=en&Filekey=ABC123&Lastname=Test',
}), { ...base, ...env }, {});

test('off by default: the first matching route answers, no header added, as before', async () => {
  const resp = await get('/de/en/baggage', {});
  assert.equal(await resp.text(), '<html>eds /de/en/baggage</html>');
  assert.equal(resp.headers.get('x-robots-tag'), null);
  assert.equal(resp.headers.get('set-cookie'), null);
  assert.deepEqual([...resp.headers.keys()].filter((h) => h.startsWith('x-lh-edge-router')), []);
  const route = choose(ROUTES, new Request('https://x/.well-known/assetlinks.json'), base, {});
  assert.equal(route.route.name, 'well-known');
});

test('a route switched off falls to the default origin (Edge Delivery, else DEFAULT_ORIGIN); the route header names who answered', async () => {
  const cfg = JSON.stringify({ routes: { 'well-known': 'off' } });
  const off = await get('/.well-known/assetlinks.json', { ROUTER_CONFIG: cfg, ROUTER_HEADER: 'x-lh-edge-router' });
  assert.ok(calls.includes(`${ORIGIN} GET /.well-known/assetlinks.json`), 'asked Edge Delivery');
  assert.equal(off.headers.get('x-lh-edge-router'), 'default');
  resetRouterCache();
  const on = await get('/.well-known/assetlinks.json', { ROUTER_HEADER: 'x-lh-edge-router' });
  assert.equal(on.headers.get('x-lh-edge-router'), 'well-known');
  assert.equal(on.headers.get('content-type'), 'application/json');
  resetRouterCache();
  const toOld = await get('/.well-known/assetlinks.json', { ROUTER_CONFIG: cfg, DEFAULT_ORIGIN: 'origin-www.example' });
  assert.equal(await toOld.text(), 'old origin /.well-known/assetlinks.json');
});

test('a percentage: that share of visitors, sticky by cookie', () => {
  const req = (cookie) => new Request('https://x/', { headers: cookie ? { cookie } : {} });
  const first = decide(req(), 'sdui', 25, () => 0.1);
  assert.deepEqual([first.pass, /^lhe-sdui=1; Max-Age=2592000; Path=\/; Secure; SameSite=Lax$/.test(first.setCookie)], [true, true]);
  const out = decide(req(), 'sdui', 25, () => 0.9);
  assert.deepEqual([out.pass, out.setCookie.startsWith('lhe-sdui=0')], [false, true]);
  assert.deepEqual(decide(req('a=b; lhe-sdui=1'), 'sdui', 25, () => 0.99), { pass: true });
  assert.deepEqual(decide(req('lhe-sdui=0'), 'sdui', 25, () => 0), { pass: false });
  assert.deepEqual([stateOf('on'), stateOf('off'), stateOf(40), stateOf('140'), stateOf(undefined)], [true, false, 40, 100, undefined]);
});

test('the kill switch (var or KV) sends everything to the default origin', async () => {
  const killed = await get('/.well-known/assetlinks.json', { ROUTER_KILL: 'on', DEFAULT_ORIGIN: 'origin-www.example' });
  assert.equal(await killed.text(), 'old origin /.well-known/assetlinks.json');
  resetRouterCache();
  const kv = { get: async () => JSON.stringify({ kill: true }) };
  const byKv = await get('/de/en/baggage', { ROUTER: kv, DEFAULT_ORIGIN: 'origin-www.example' });
  assert.equal(await byKv.text(), 'old origin /de/en/baggage');
});

test('with a default origin, Edge Delivery answers only the configured paths (longest pattern wins, switches as routes)', async () => {
  const cfg = JSON.stringify({ paths: { '/de/en/baggage': 'on', '/de/en/offers/**': 'on', '/de/en/offers/old': 'off' } });
  const env = { ROUTER_CONFIG: cfg, DEFAULT_ORIGIN: 'origin-www.example', ROUTER_HEADER: 'x-lh-edge-router' };
  const moved = await get('/de/en/baggage', env);
  assert.equal(await moved.text(), '<html>eds /de/en/baggage</html>');
  assert.equal(moved.headers.get('x-lh-edge-router'), 'pass-through');
  assert.equal(await (await get('/de/en/offers/paris', env)).text(), '<html>eds /de/en/offers/paris</html>');
  assert.equal(await (await get('/de/en/offers/old', env)).text(), 'old origin /de/en/offers/old');
  const rest = await get('/de/en/flights', env);
  assert.equal(await rest.text(), 'old origin /de/en/flights');
  assert.equal(rest.headers.get('x-lh-edge-router'), 'default');
  assert.equal(pathPattern({ '/a/**': 1, '/a/b/**': 1 }, '/a/b/c'), '/a/b/**');
  assert.equal(pathPattern({ '/a/**': 1 }, '/ab'), null);
  assert.equal(pathPattern({ '/a/**': 1 }, '/a'), '/a/**');
});

test('demo hosts get X-Robots-Tag: noindex, a production host never', async () => {
  const env = { DEMO_HOSTS: 'lhcom.example,www.example', PRODUCTION_HOSTS: 'www.example' };
  assert.equal((await get('/de/en/baggage', env)).headers.get('x-robots-tag'), 'noindex');
  assert.equal((await get('/de/en/baggage', env, {}, 'www.example')).headers.get('x-robots-tag'), null);
  assert.equal((await get('/de/en/baggage', env, {}, 'other.example')).headers.get('x-robots-tag'), null);
  assert.equal((await get('/de/en/baggage', env, { 'x-lh-public-host': 'lhcom.example' }, 'lhedge.example')).headers.get('x-robots-tag'), 'noindex');
});

test('a broken configuration routes as without one', async () => {
  const resp = await get('/.well-known/assetlinks.json', { ROUTER_CONFIG: '{not json', ROUTER_HEADER: 'x-r' });
  assert.equal(resp.headers.get('x-r'), 'well-known');
});

test('referrer check: off by default; on: browsers only, allowed hosts, own host, relative, null, empty as configured', async () => {
  const browser = 'Mozilla/5.0 (Windows NT 10.0)';
  const on = { REFERRER_FILTER: 'on', REFERRER_ALLOW_HOSTS: 'www.example.com, *.austrian.com' };
  const req = (headers) => new Request('https://lhcom.example/x', { method: 'POST', headers });
  assert.equal(referrerRefusal(req({ 'user-agent': browser, referer: 'https://evil.test/' }), base), null, 'off');
  const refused = referrerRefusal(req({ 'user-agent': browser, referer: 'https://evil.test/' }), on);
  assert.equal(refused.status, 403);
  assert.equal(referrerRefusal(req({ 'user-agent': browser, referer: 'https://www.example.com/a' }), on), null, 'exact');
  assert.equal(referrerRefusal(req({ 'user-agent': browser, referer: 'https://booking.austrian.com/' }), on), null, 'wildcard');
  assert.equal(referrerRefusal(req({ 'user-agent': browser, referer: 'https://x.austrian.com.other.test/' }), on).status, 403, 'not a suffix trick');
  assert.equal(referrerRefusal(req({ 'user-agent': browser, referer: 'https://austrian.com/' }), on).status, 403, 'wildcard: subdomains');
  assert.equal(referrerRefusal(req({ 'user-agent': browser, referer: '//evil.test/x' }), on).status, 403, 'protocol-relative');
  assert.equal(referrerRefusal(req({ 'user-agent': browser, origin: 'https://evil.test' }), on).status, 403, 'Origin when no Referer');
  assert.equal(referrerRefusal(req({ 'user-agent': browser, origin: 'null' }), on), null, 'Origin null');
  assert.equal(referrerRefusal(req({ 'user-agent': browser, referer: '/de/en/homepage' }), on), null, 'relative');
  assert.equal(referrerRefusal(req({ 'user-agent': browser, referer: 'https://lhcom.example/de/en/homepage' }), on), null, 'own host');
  assert.equal(referrerRefusal(req({ 'user-agent': browser }), on).status, 403, 'empty refused by default');
  assert.equal(referrerRefusal(req({ 'user-agent': browser }), { ...on, REFERRER_ALLOW_EMPTY: 'true' }), null, 'empty allowed');
  assert.equal(referrerRefusal(req({ 'user-agent': 'curl/8', referer: 'https://evil.test/' }), on), null, 'not a browser');
  assert.equal(referrerRefusal(req({ 'user-agent': 'Opera/9.80', referer: 'https://evil.test/' }), on).status, 403, 'Opera is a browser');
  assert.ok(hostAllowed('a.b.example.com', ['*.example.com']) && !hostAllowed('example.com.evil', ['*.example.com']));
});

test('referrer check on the kiosk POST: refused 403 from another host, answered from an allowed one, off: as before', async () => {
  const browser = { 'user-agent': 'Mozilla/5.0', referer: 'https://evil.test/' };
  const before = await kiosk({}, browser);
  assert.notEqual(before.status, 403);
  const on = { REFERRER_FILTER: 'on', REFERRER_ALLOW_HOSTS: '*.example.com' };
  assert.equal((await kiosk(on, browser)).status, 403);
  const allowed = await kiosk(on, { 'user-agent': 'Mozilla/5.0', referer: 'https://www.example.com/' });
  assert.equal(allowed.status, before.status);
  assert.equal(await allowed.text(), await (await kiosk({}, browser)).text());
});

test('pilot countries by host: lhcom shows ch only, lhedge every pilot root', () => {
  const env = { ...base, PILOT_COUNTRIES_BY_HOST: 'lhcom.example=ch' };
  const roots = (host) => servedMarketRoots(new Request(`https://${host}/`), env);
  assert.ok(roots('lhcom.example').length >= 2 && roots('lhcom.example').every((r) => r.startsWith('ch/')));
  assert.ok(roots('lhedge.example').length > roots('lhcom.example').length);
  assert.deepEqual(roots('other.example'), []);
  assert.deepEqual(servedMarketRoots(new Request('https://lhcom.example/'), base), []);
});
