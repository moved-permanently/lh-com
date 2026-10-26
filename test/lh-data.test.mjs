/* Direct calls to www (scripts/lh-data.js): one retry, then only the failing route is skipped.
   Run: node --test test/*.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { lhFetch, isDirectRouteBlocked, DIRECT_RETRY_MS } from '../scripts/lh-data.js';

const LIVE = 'https://www.lufthansa.com';
const store = () => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    clear: () => m.clear(),
  };
};
globalThis.window = { sessionStorage: store(), localStorage: store(), location: { pathname: '/de/en/homepage' } };

let calls;
let plan;
beforeEach(() => {
  window.sessionStorage.clear();
  calls = [];
  plan = {};
  globalThis.fetch = async (url) => {
    const href = String(url);
    if (href.startsWith('/data/recorded/')) {
      // no recordings in this test: the index is empty
      return new Response(JSON.stringify({ entries: {} }), { status: 200 });
    }
    calls.push(href);
    const route = href.slice(LIVE.length).replace(/\?.*$/, '');
    const queue = plan[route] || [];
    const next = queue.length ? queue.shift() : 'ok';
    if (next === 'network') throw new TypeError('Failed to fetch');
    if (next === 'cloudflare') return new Response('<html>blocked</html>', { status: 403, headers: { 'content-type': 'text/html' } });
    return new Response(JSON.stringify({ route }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
});

const labels = '/service/api/labels/singleOfferDisplay/lh/en';
const prices = '/service/api/flight-prices/FRA/CHI/E/2026-10-26T23:00:00/7?mode=MONTHS';

test('one network error: retried after a short pause, live, nothing blocked', async () => {
  plan[labels] = ['network'];
  const start = Date.now();
  const r = await lhFetch(labels, { market: 'de/en' });
  assert.equal(r.source, 'live');
  assert.equal(calls.length, 2);
  assert.ok(Date.now() - start >= DIRECT_RETRY_MS - 5);
  assert.equal(isDirectRouteBlocked(labels, LIVE), false);
  // the other direct routes of the page are called as usual
  const p = await lhFetch(prices, { market: 'de/en' });
  assert.equal(p.source, 'live');
});

test('a route that fails twice is skipped; other routes stay live', async () => {
  plan[labels] = ['network', 'cloudflare'];
  await assert.rejects(lhFetch(labels, { market: 'de/en' }));
  assert.equal(isDirectRouteBlocked(labels, LIVE), true);
  // the blocked route is not called again for a while
  const before = calls.length;
  await assert.rejects(lhFetch(labels, { market: 'de/en' }));
  assert.equal(calls.length, before);
  // prices and other routes are not affected
  const p = await lhFetch(prices, { market: 'de/en' });
  assert.equal(p.source, 'live');
  assert.equal(isDirectRouteBlocked(prices, LIVE), false);
  const d = await lhFetch('/service/api/destinationfinder/destination/content/CHI', { market: 'de/en' });
  assert.equal(d.source, 'live');
});

test('a 4xx answer is neither retried nor blocking', async () => {
  globalThis.fetch = async (url) => {
    if (String(url).startsWith('/data/recorded/')) return new Response('{"entries":{}}');
    calls.push(String(url));
    return new Response('{}', { status: 404, headers: { 'content-type': 'application/json' } });
  };
  await assert.rejects(lhFetch(prices, { market: 'de/en' }));
  assert.equal(calls.length, 1);
  assert.equal(isDirectRouteBlocked(prices, LIVE), false);
});

test('an older all-of-www memo is ignored', async () => {
  window.sessionStorage.setItem('lh-direct-blocked', JSON.stringify({ origin: LIVE, until: Date.now() + 60000 }));
  const r = await lhFetch(labels, { market: 'de/en' });
  assert.equal(r.source, 'live');
});
