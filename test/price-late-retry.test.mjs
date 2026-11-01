/* One late try per price widget per page load (blocks/fare-teaser, blocks/destination-finder slider
   and grid; scripts/lh-data.js priceRetryDelay): when a widget's price call failed on every
   attempt (www's Cloudflare challenged the preflights of a fresh tab: brussels.turnsthe.page and
   discover.turnsthe.page, 2026-11-01), the widget asks once more when the route's backoff is over
   (5 s; at once when nothing is remembered, as after a timeout: after 5 s as well) and fills its
   prices in place. One more try only: a second failure leaves the widget as it is. A widget whose
   first call answered asks nothing more.
   Time is mocked (setTimeout, Date): the test moves it in 100 ms steps.
   Run: node --max-old-space-size=512 --test test/price-late-retry.test.mjs */
/* global globalThis */
import test, { beforeEach, afterEach, mock } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const store = () => {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => m.set(k, String(v)),
    removeItem: (k) => m.delete(k),
    clear: () => m.clear(),
  };
};
const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
// the blocks' imports load scripts.js: on a demo host's / it only redirects (stubbed)
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'discover.turnsthe.page', pathname: '/', search: '', hash: '', replace: () => {}, href: 'https://discover.turnsthe.page/', origin: 'https://discover.turnsthe.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
window.sessionStorage = store();
window.localStorage = store();
// linkedom's select has no value setter (the grid sets its pickers)
Object.defineProperty(window.HTMLSelectElement.prototype, 'value', {
  configurable: true,
  get() { return (this.querySelector('option[selected]') || this.querySelector('option') || {}).value || ''; },
  set(v) { [...this.querySelectorAll('option')].forEach((o) => o.toggleAttribute('selected', o.value === v)); },
});
globalThis.window = window;
globalThis.document = document;
globalThis.NodeFilter = { SHOW_ELEMENT: 1, SHOW_TEXT: 4 };

const offer = (city, cityName, price) => ({
  city, cityName, topDeal: false, cityRegion: 'EU', countryName: '', countryCode: 'XX', affinities: [], price, numberOfStopovers: 0, tenantAirlineStopovers: 0, isTenantAirlineOperating: true, isKClass: false,
});
const ANSWER = {
  destinationFinderOffers: [offer('PMI', 'Palma de Mallorca', 99), offer('BCN', 'Barcelona', 129)],
  currencyInfo: { currency: 'EUR', currencySymbol: '€', currencySymbolPrefixed: false },
  originCityName: 'Frankfurt',
};
const FINDER = '/service/api/destinationfinder/destination/finder/FRA/E';
const NOW = Date.parse('2026-11-01T12:00:00Z');
let finderCalls;
let plan;
beforeEach(() => {
  window.sessionStorage.clear();
  finderCalls = 0;
  plan = [];
  mock.timers.enable({ apis: ['setTimeout', 'Date'], now: NOW });
  globalThis.fetch = async (url) => {
    const href = String(url);
    if (href.includes('/data/recorded/')) return new Response(JSON.stringify({ entries: {} }));
    if (href.includes(FINDER)) {
      finderCalls += 1;
      const next = plan.length ? plan.shift() : 'ok';
      if (next === 'challenge') return new Response('<html>Just a moment...</html>', { status: 403, headers: { 'content-type': 'text/html', 'cf-mitigated': 'challenge' } });
      return new Response(JSON.stringify(ANSWER), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    return new Response('{}', { status: 404, headers: { 'content-type': 'application/json' } });
  };
});
afterEach(() => mock.timers.reset());

const { priceRetryDelay, priceBackoffMs } = await import('../scripts/lh-data.js');
const { default: decorateFareTeaser } = await import('../blocks/fare-teaser/fare-teaser.js');
const { default: decorateFinder } = await import('../blocks/destination-finder/destination-finder.js');

const flush = () => new Promise((resolve) => { setImmediate(resolve); });
/** Moves the mocked time in 100 ms steps (letting the page's promises run) for ms. */
const advance = async (ms) => {
  for (let t = 0; t < ms; t += 100) {
    // eslint-disable-next-line no-await-in-loop
    await flush();
    mock.timers.tick(100);
  }
  await flush();
};
const settle = async (promise) => {
  let done = false;
  promise.then(() => { done = true; }, () => { done = true; });
  for (let i = 0; i < 200 && !done; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await advance(100);
  }
  return promise;
};
const block = (name, rows) => {
  document.head.innerHTML = '<meta name="brand" content="discover">';
  const el = document.createElement('div');
  el.className = name;
  el.innerHTML = rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('');
  document.body.replaceChildren(el);
  return el;
};

test('priceRetryDelay: when the routes\' backoff ends; nothing remembered: the first backoff', () => {
  assert.equal(priceRetryDelay([FINDER]), priceBackoffMs(1));
  window.sessionStorage.setItem('lh-price-backoff', JSON.stringify({
    routes: { [FINDER]: { origin: 'https://www.lufthansa.com', failures: 2, until: NOW + 8000 } },
  }));
  assert.equal(priceRetryDelay([FINDER]), 8000);
  window.sessionStorage.setItem('lh-price-backoff', JSON.stringify({
    routes: { [FINDER]: { origin: 'https://www.lufthansa.com', failures: 2, until: NOW - 1 } },
  }));
  assert.equal(priceRetryDelay([FINDER]), 0);
});

test('fare teaser: every attempt challenged, the late try after the backoff fills the prices in place', async () => {
  plan = ['challenge', 'challenge', 'challenge'];
  const el = block('fare-teaser', [['Origin', 'Frankfurt (FRA)'], ['Destinations', 'Frankfurt (FRA) - Palma de Mallorca (PMI), Frankfurt (FRA) - Barcelona (BCN)']]);
  await settle(decorateFareTeaser(el));
  assert.equal(el.dataset.lhSource, 'none');
  const items = [...el.querySelectorAll('.fare-teaser-list > li')];
  assert.equal(items.length, 2);
  const firstItem = items[0];
  assert.equal(finderCalls, 3);
  await advance(priceBackoffMs(1) + 500);
  assert.equal(finderCalls, 4, 'one late try');
  assert.equal(el.dataset.lhSource, 'live');
  assert.ok(el.querySelector('.fare-teaser-list > li') === firstItem, 'the same cards, filled in place');
  assert.match(firstItem.querySelector('.fare-teaser-price').textContent, /99/);
  assert.equal(firstItem.querySelector('.fare-teaser-offer').hidden, false);
  await advance(60000);
  assert.equal(finderCalls, 4, 'nothing more');
});

test('fare teaser: the late try fails as well: left as it is, no further try', async () => {
  plan = ['challenge', 'challenge', 'challenge', 'challenge', 'challenge', 'challenge'];
  const el = block('fare-teaser', [['Origin', 'Frankfurt (FRA)'], ['Destinations', 'Frankfurt (FRA) - Palma de Mallorca (PMI)']]);
  await settle(decorateFareTeaser(el));
  await advance(priceBackoffMs(1) + 3000);
  assert.equal(finderCalls, 6, 'the late try with its own two retries');
  assert.equal(el.dataset.lhSource, 'none');
  await advance(120000);
  assert.equal(finderCalls, 6);
});

test('fare teaser: a first call that answers: no late try', async () => {
  const el = block('fare-teaser', [['Origin', 'Frankfurt (FRA)'], ['Destinations', 'Frankfurt (FRA) - Palma de Mallorca (PMI)']]);
  await settle(decorateFareTeaser(el));
  assert.equal(el.dataset.lhSource, 'live');
  await advance(30000);
  assert.equal(finderCalls, 1);
});

test('destination finder slider: every attempt challenged, the late try fills the slider', async () => {
  plan = ['challenge', 'challenge', 'challenge'];
  const el = block('destination-finder', [['Origin', 'Frankfurt (FRA)']]);
  await settle(decorateFinder(el));
  await advance(3000);
  assert.equal(el.dataset.lhSource, 'none');
  assert.equal(el.querySelectorAll('.destination-finder-price').length, 0);
  // the late try is quiet: the list is not marked busy while it runs (its first attempt
  // challenged, its retry 250 ms later answers)
  plan = ['challenge'];
  while (finderCalls < 4) {
    // eslint-disable-next-line no-await-in-loop
    await advance(100);
  }
  assert.equal(el.querySelector('.destination-finder-list').hasAttribute('aria-busy'), false, 'in flight, not busy');
  await advance(2000);
  assert.equal(finderCalls, 5);
  assert.equal(el.dataset.lhSource, 'live');
  assert.ok(el.querySelectorAll('.destination-finder-price').length >= 1);
  await advance(60000);
  assert.equal(finderCalls, 5, 'nothing more');
});

test('destination finder grid: every attempt challenged, the late try fills the grid', async () => {
  plan = ['challenge', 'challenge', 'challenge'];
  const el = block('destination-finder grid', [['Origin', 'Frankfurt (FRA)']]);
  await settle(decorateFinder(el));
  await advance(3000);
  assert.equal(el.dataset.lhSource, 'none');
  const calls = finderCalls;
  await advance(priceBackoffMs(1) + 500);
  assert.equal(finderCalls, calls + 1);
  assert.equal(el.dataset.lhSource, 'live');
  await advance(60000);
  assert.equal(finderCalls, calls + 1, 'nothing more');
});
