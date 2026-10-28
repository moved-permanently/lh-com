/* The demo-only parts of the site switched by host (scripts/demo.js): the demo hosts, and on a
   production host the API calls same-origin without proxy or recordings, no forms worker.
   Run: node --test test/*.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { isDemoHost } from '../scripts/demo.js';
import { lhFetch, lhRecorded } from '../scripts/lh-data.js';
import { formsEndpoint, formsConfig, resetFormsConfig } from '../scripts/lh-forms.js';

const store = () => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), clear: () => m.clear(),
  };
};
let calls;
const at = (hostname) => {
  globalThis.window = {
    sessionStorage: store(), localStorage: store(), location: { pathname: '/de/en/homepage', hostname },
  };
  globalThis.document = { querySelector: () => null };
};
beforeEach(() => {
  calls = [];
  resetFormsConfig();
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    if (String(url).startsWith('/data/recorded/')) return new Response(JSON.stringify({ entries: {} }));
    return new Response(JSON.stringify({ ok: true }), { headers: { 'content-type': 'application/json' } });
  };
});

test('demo hosts: the replica, Edge Delivery hosts and previews, workers.dev, localhost; not www', () => {
  ['lhcom.bbird.live', 'lhedge.bbird.live', 'lhcn.bbird.live', 'main--lh-com--moved-permanently.aem.page', 'branch--lh-com--moved-permanently.aem.live', 'x.hlx.page', 'lh-edge.aem-poc-lab.workers.dev', 'localhost', '127.0.0.1',
    'lufthansa.turnsthe.page', 'lufthansa-edge.turnsthe.page', 'lufthansa-cn.turnsthe.page', 'lufthansa-forms.turnsthe.page', 'lh-proxy.benpeter.workers.dev']
    .forEach((h) => assert.ok(isDemoHost(h), h));
  // turnsthe.page: the lufthansa hosts only (other demos may live on the domain)
  ['www.lufthansa.com', 'lufthansa.com', 'www.lufthansa.cn', 'aem.page.example.com', 'bbird.live.example.com',
    'turnsthe.page', 'demo2.turnsthe.page', 'xlufthansa.turnsthe.page', 'lufthansa.turnsthe.page.example.com', 'www.lufthansa.turnsthe.page']
    .forEach((h) => assert.ok(!isDemoHost(h), h));
});

test('production host: API routes same-origin with the market headers, no proxy, no recordings; a failing call fails', async () => {
  at('www.lufthansa.com');
  const proxied = await lhFetch('/service/api/lhg-fare-teaser/fareteaser/recommend', { market: 'de/en' });
  assert.deepEqual([proxied.source, proxied.via], ['live', 'same-origin']);
  assert.equal(calls[0].url, '/service/api/lhg-fare-teaser/fareteaser/recommend');
  assert.equal(calls[0].init.credentials, 'same-origin');
  assert.equal(calls[0].init.headers['X-Portal-Site'], 'DE');
  const poi = await lhFetch('/service/secured/api/pointsOfInterest/1', { market: 'de/en' });
  assert.equal(poi.via, 'same-origin', 'points of interest live, not recorded');
  assert.ok(!calls.some((c) => c.url.startsWith('/data/recorded/') || c.url.includes('workers.dev')));
  globalThis.fetch = async () => new Response('', { status: 503 });
  await assert.rejects(lhFetch('/service/api/labels/x', { market: 'de/en' }));
  assert.deepEqual(await lhRecorded('/service/api/suggestions/airports', { market: 'de/en' }), []);
});

test('demo host: as before (the proxy for a non-direct route, its recordings on failure)', async () => {
  at('lhcom.bbird.live');
  await lhFetch('/service/api/lhg-fare-teaser/fareteaser/recommend', { market: 'de/en' }).catch(() => null);
  assert.ok(calls.some((c) => c.url.startsWith('https://lh-proxy.aem-poc-lab.workers.dev/')));
});

test('forms: the demo worker on demo hosts, a production host its own meta (none: no config read, nothing sent)', async () => {
  at('lhcom.bbird.live');
  assert.equal(formsEndpoint(), 'https://lhforms.bbird.live');
  at('www.lufthansa.com');
  window.localStorage.setItem('lh-forms', 'https://tester.example');
  assert.equal(formsEndpoint(), '', 'no tester override, no demo worker');
  assert.deepEqual(await formsConfig(), { botCheck: 'off', turnstileSiteKey: '' });
  assert.equal(calls.length, 0);
  globalThis.document = { querySelector: () => ({ content: 'https://forms.lufthansa.example/' }) };
  assert.equal(formsEndpoint(), 'https://forms.lufthansa.example');
});
