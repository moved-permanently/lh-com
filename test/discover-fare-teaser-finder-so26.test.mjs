/* eslint-disable max-len */
/* Standing order 26 of 2026-11-14, item 2: Discover's homepage fare teaser takes its prices from
   the destination finder's answer the page asks for in the visitor's browser, the same call as the
   offers grid (www.lufthansa.com/service/api/destinationfinder/destination/finder/FRA/E?months=0_11
   &tripType=RETURN, X-Portal FOUR_Y, the page's language), behind the site's flag live-prices. It
   did before this order: discover-snapshots-006 (one load each of our de/en and de/de homepages,
   2026-11-14) has that call twice per homepage, both HTTP 200 (the teaser's and the finder
   slider's); the one lh-proxy call (fareteaser/recommend, 502) is the origin list, which holds no
   price and keeps its recording. Order 25's note that the teaser's prices came through lh-proxy was
   wrong. The answer here is the recording's only: homepage-de-en-5.json (sha256 49190a40ec1dc8c8...,
   591 offers), its offers for the teaser's three routes; every other call is refused.
   Run: node --max-old-space-size=512 --test test/discover-fare-teaser-finder-so26.test.mjs */
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
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'discover.turnsthe.page', pathname: '/de/en/homepage', search: '', hash: '', replace: () => {}, href: 'https://discover.turnsthe.page/de/en/homepage', origin: 'https://discover.turnsthe.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
window.sessionStorage = store();
window.localStorage = store();
window.IntersectionObserver = function IntersectionObserver() {
  return { observe: () => {}, unobserve: () => {}, disconnect: () => {} };
};
globalThis.window = window;
globalThis.document = document;
globalThis.NodeFilter = { SHOW_ELEMENT: 1, SHOW_TEXT: 4 };
globalThis.IntersectionObserver = window.IntersectionObserver;

// discover-snapshots-006 api/homepage-de-en-5.json: the teaser's three routes, as recorded
const RECORDED = {
  destinationFinderOffers: [
    {
      city: 'HRG', cityName: 'Hurghada', topDeal: false, cityRegion: 'AF', countryName: 'Egypt', countryCode: 'EG', affinities: [], minimumFlightDuration: 270, price: 286.47, numberOfStopovers: 0, tenantAirlineStopovers: 0, isTenantAirlineOperating: true, isKClass: true,
    },
    {
      city: 'YYC', cityName: 'Calgary', topDeal: true, cityRegion: 'NA', countryName: 'Canada', countryCode: 'CA', affinities: ['HI', 'NA', 'SI', 'SK'], minimumFlightDuration: 575, price: 764.74, numberOfStopovers: 0, tenantAirlineStopovers: 0, isTenantAirlineOperating: true, isKClass: true,
    },
    {
      city: 'CUN', cityName: 'Cancun', topDeal: false, cityRegion: 'NA', countryName: 'Mexico', countryCode: 'MX', affinities: ['BE', 'HI', 'SI'], minimumFlightDuration: 685, price: 702.11, numberOfStopovers: 0, tenantAirlineStopovers: 0, isTenantAirlineOperating: true, isKClass: true,
    },
  ],
  currencyInfo: { currency: 'EUR', currencySymbol: '€', currencySymbolPrefixed: false },
  originCityName: 'Frankfurt',
};
const RECORDED_URL = 'https://www.lufthansa.com/service/api/destinationfinder/destination/finder/FRA/E?months=0_11&tripType=RETURN';

let calls;
let flag;
beforeEach(async () => {
  calls = [];
  flag = 'on';
  window.sessionStorage.clear();
  const { resetFlags } = await import('../scripts/flags.js');
  resetFlags();
  mock.timers.enable({ apis: ['setTimeout', 'Date'], now: Date.parse('2026-11-14T18:09:03Z') });
  globalThis.fetch = async (url, init = {}) => {
    const href = String(url);
    const headers = Object.fromEntries(Object.entries(init.headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
    calls.push({ href, headers });
    const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
    if (href === '/config/flags.json') return json({ data: [{ flag: 'live-prices', value: flag }] });
    // the recorded call only: its URL, its portal and language
    if (href === RECORDED_URL && headers['x-portal'] === 'FOUR_Y' && headers['x-portal-language'] === 'en') return json(RECORDED);
    if (href.includes('/data/recorded/')) return json({ entries: {} });
    return json({}, 404);
  };
});
afterEach(() => mock.timers.reset());

const flush = () => new Promise((resolve) => { setImmediate(resolve); });
const settle = async (promise) => {
  let done = false;
  promise.then(() => { done = true; }, () => { done = true; });
  for (let i = 0; i < 600 && !done; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await flush();
    mock.timers.tick(100);
  }
  for (let i = 0; i < 100; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await flush();
    mock.timers.tick(100);
  }
  return promise;
};
// lh-discover /de/en/homepage's fare teaser (its authored rows, the conditions left out)
const ROWS = [['Origin', 'Frankfurt (FRA)'], ['Destinations', 'Hurghada (HRG), Cancun (CUN), Calgary (YYC)'], ['Trip duration', '7'], ['Cabin', 'E'], ['Travel months', '1,2,3,4,5,6,7,8,9,10,11,12'], ['Price label', 'Round trip from']];
const teaser = async () => {
  document.head.innerHTML = '<meta name="brand" content="discover">';
  const el = document.createElement('div');
  el.className = 'fare-teaser';
  el.innerHTML = ROWS.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('');
  document.body.replaceChildren(el);
  const { default: decorate } = await import('../blocks/fare-teaser/fare-teaser.js');
  await settle(decorate(el));
  return el;
};
const finderCalls = () => calls.filter((c) => c.href.includes('/destinationfinder/destination/finder/'));

test('Discover\'s fare teaser: the recorded finder answer\'s prices, from the call the offers grid makes', async () => {
  const el = await teaser();
  const items = [...el.querySelectorAll('.fare-teaser-item')].map((li) => [
    li.querySelector('.fare-teaser-destination').textContent, li.querySelector('.fare-teaser-price').textContent.replace(/\s/g, ' '),
  ]);
  assert.deepEqual(items, [['Hurghada', '287 €'], ['Cancun', '703 €'], ['Calgary', '765 €']]);
  assert.equal(el.dataset.lhSource, 'live');
  const finder = finderCalls();
  assert.equal(finder.length, 1, 'one finder call for the three routes');
  assert.equal(finder[0].href, RECORDED_URL);
  assert.equal(finder[0].headers['x-portal'], 'FOUR_Y');
});

test('no price through lh-proxy', async () => {
  await teaser();
  assert.deepEqual(calls.filter((c) => /lh-proxy|lhg-fare-teaser\/fareteaser\/(?!recommend)/.test(c.href)).map((c) => c.href), []);
});

test('live-prices off: no finder call, the one line instead', async () => {
  flag = 'off';
  const el = await teaser();
  assert.deepEqual(finderCalls(), []);
  assert.ok(el.querySelector('p.live-prices-off'));
});
