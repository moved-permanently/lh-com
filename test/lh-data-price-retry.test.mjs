/* Price routes (scripts/lh-data.js PRICE_ROUTES) after a failed call: www's Cloudflare challenges
   a share of the CORS preflights (403 text/html, cf-mitigated: challenge; the browser reports
   "Failed to fetch"), often the first ones of a fresh tab (brussels.turnsthe.page, 2026-11-01:
   the first destinationfinder preflight challenged, the next one a second later answered). A
   price call is retried twice within the render (after 250 ms and 1 s); when all three attempts
   fail, the next render tries again after a short backoff (5 s, doubling up to 60 s, reset by a
   live answer) instead of the 10-minute memo; a timeout is never remembered. Through lh-proxy the
   same: a price route neither obeys nor sets the proxy's 10-minute memo. Every other route as
   before (one retry, then 10 minutes).
   Run: node --max-old-space-size=512 --test test/lh-data-price-retry.test.mjs */
/* global globalThis */
import test, { beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import {
  lhFetch, isDirectRouteBlocked, PROXY_ORIGIN, PRICE_RETRY_MS, priceBackoffMs,
} from '../scripts/lh-data.js';

const LIVE = 'https://www.lufthansa.com';
const store = () => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    clear: () => m.clear(),
  };
};
// a demo host (scripts/demo.js): the page calls www directly
globalThis.window = { sessionStorage: store(), localStorage: store(), location: { pathname: '/be/en/homepage', hostname: 'brussels.turnsthe.page' } };

const NOW = Date.parse('2026-11-01T12:00:00Z');
let calls;
let plan;
beforeEach(() => {
  window.sessionStorage.clear();
  calls = [];
  plan = {};
  mock.timers.enable({ apis: ['Date'], now: NOW });
  globalThis.fetch = async (url, init = {}) => {
    const href = String(url);
    if (href.startsWith('/data/recorded/')) return new Response(JSON.stringify({ entries: {} }), { status: 200 });
    calls.push(href);
    const route = href.replace(LIVE, '').replace(PROXY_ORIGIN, '').replace(/\?.*$/, '');
    const queue = plan[route] || [];
    const next = queue.length ? queue.shift() : 'ok';
    if (next === 'network') throw new TypeError('Failed to fetch');
    if (next === 'challenge') return new Response('<html>Just a moment...</html>', { status: 403, headers: { 'content-type': 'text/html', 'cf-mitigated': 'challenge' } });
    if (next === '502') return new Response('{"error":"upstream-blocked"}', { status: 502, headers: { 'content-type': 'application/json' } });
    if (next === 'hang') {
      return new Promise((resolve, reject) => {
        init.signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
      });
    }
    return new Response(JSON.stringify({ route }), { status: 200, headers: { 'content-type': 'application/json' } });
  };
});
afterEach(() => mock.timers.reset());

const finder = '/service/api/destinationfinder/destination/finder/BRU/E?months=0_11&tripType=RETURN';
const finderPath = '/service/api/destinationfinder/destination/finder/BRU/E';
const labels = '/service/api/labels/fareteaserstatic/sn/en';
const offers = '/service/api/lhg-fare-teaser/fareteaser/offers/BRU';
const recommend = '/service/api/lhg-fare-teaser/fareteaser/recommend';
const later = (ms) => mock.timers.tick(ms);

test('a failed first price call, then a good one in the same session: the next render shows prices', async () => {
  plan[finderPath] = ['challenge', 'network', 'challenge'];
  await assert.rejects(lhFetch(finder, { market: 'be/en' }));
  assert.equal(calls.length, 3, 'the call and two retries within the render');
  // no 10-minute memo: after the short backoff the next render calls again and gets prices
  assert.equal(isDirectRouteBlocked(finder, LIVE), true, 'within the backoff');
  later(priceBackoffMs(1));
  assert.equal(isDirectRouteBlocked(finder, LIVE), false);
  const r = await lhFetch(finder, { market: 'be/en' });
  assert.equal(r.source, 'live');
  assert.deepEqual(r.data, { route: finderPath });
});

test('a challenge on the first attempt: live on a retry within the same render', async () => {
  plan[finderPath] = ['challenge'];
  const r = await lhFetch(finder, { market: 'be/en' });
  assert.equal(r.source, 'live');
  assert.equal(calls.length, 2);
  assert.deepEqual(PRICE_RETRY_MS, [250, 1000]);
});

test('the backoff: 5 s, doubling up to 60 s; a render within it waits, a live answer resets it', async () => {
  assert.deepEqual(
    [1, 2, 3, 4, 5, 6, 9].map(priceBackoffMs),
    [5000, 10000, 20000, 40000, 60000, 60000, 60000],
  );
  plan[finderPath] = ['network', 'network', 'network'];
  await assert.rejects(lhFetch(finder, { market: 'be/en' }));
  const n = calls.length;
  await assert.rejects(lhFetch(finder, { market: 'be/en' }));
  assert.equal(calls.length, n, 'within the backoff: no call');
  later(5000);
  plan[finderPath] = ['network', 'network', 'network'];
  await assert.rejects(lhFetch(finder, { market: 'be/en' }));
  later(5000);
  await assert.rejects(lhFetch(finder, { market: 'be/en' }));
  assert.equal(calls.length, n + 3, 'second failure: 10 s');
  later(5000);
  const r = await lhFetch(finder, { market: 'be/en' });
  assert.equal(r.source, 'live');
  // reset: one more failure waits 5 s again
  plan[finderPath] = ['network', 'network', 'network'];
  await assert.rejects(lhFetch(finder, { market: 'be/en' }));
  later(5000);
  assert.equal(isDirectRouteBlocked(finder, LIVE), false);
});

test('a timeout is never remembered: the next render calls at once', async () => {
  plan[finderPath] = ['hang'];
  await assert.rejects(lhFetch(finder, { market: 'be/en' }));
  assert.equal(calls.length, 1, 'a timeout is not retried');
  assert.equal(isDirectRouteBlocked(finder, LIVE), false);
  const r = await lhFetch(finder, { market: 'be/en' });
  assert.equal(r.source, 'live');
});

test('other routes unchanged: one retry, then skipped for 10 minutes', async () => {
  plan[labels] = ['challenge', 'network'];
  await assert.rejects(lhFetch(labels, { market: 'be/en' }));
  assert.equal(calls.length, 2);
  later(60000);
  assert.equal(isDirectRouteBlocked(labels, LIVE), true);
  later(9 * 60000);
  assert.equal(isDirectRouteBlocked(labels, LIVE), false);
});

test('through lh-proxy: a price route neither obeys nor sets the proxy\'s 10-minute memo', async () => {
  // the origin list (no prices) refused: the proxy is skipped for the other routes, as before
  plan[recommend] = ['502'];
  await assert.rejects(lhFetch(recommend, { market: 'be/en' }));
  const n = calls.length;
  await assert.rejects(lhFetch(recommend, { market: 'be/en' }));
  assert.equal(calls.length, n, 'recommend skipped');
  // the prices still go out and show
  const r = await lhFetch(offers, { method: 'POST', body: { a: 1 }, market: 'be/en' });
  assert.equal(r.source, 'live');
  assert.equal(r.via, 'proxy');

  // a refused price call: its own short backoff, the proxy stays on for the other routes
  window.sessionStorage.clear();
  plan[offers] = ['502'];
  await assert.rejects(lhFetch(offers, { method: 'POST', body: { a: 1 }, market: 'be/en' }));
  const m = calls.length;
  await assert.rejects(lhFetch(offers, { method: 'POST', body: { a: 1 }, market: 'be/en' }));
  assert.equal(calls.length, m, 'within the backoff');
  const rec = await lhFetch(recommend, { market: 'be/en' });
  assert.equal(rec.source, 'live', 'the proxy is not switched off by a price call');
  later(5000);
  const again = await lhFetch(offers, { method: 'POST', body: { a: 1 }, market: 'be/en' });
  assert.equal(again.source, 'live');
});
