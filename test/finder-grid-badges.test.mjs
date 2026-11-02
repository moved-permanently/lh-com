/* The offers grid's order and badges on Discover (blocks/destination-finder grid, brand flag
   BRANDS.discover.gridBadges): as www's Discover component (dcep-destination-finder, sort
   "Recommended"): the highlighted offers (Highlighted offers, Highlight priority: topDeal, then
   kClass, in the answer's order) carry a badge, "Recommended" for a top deal, "Best price" for a
   k-class offer (the texts from labels/common, common.destinationFinderCard.badge.*); only the
   top deals come first (by price), every other tile by price, the k-class ones included.
   Lufthansa, ITA, Austrian and Brussels grids as before: every highlighted offer "Recommended", on
   top. The answer: offers of www.discover-airlines.com's
   destinationfinder/destination/finder/FRA/E (X-Portal FOUR_Y, 2026-11-02, a Bright Data load of
   /de/en/book/flights/offers): its first five offers, the three top deals and every offer up to
   Venice's price, in its order; www's first 16 tiles of that load are WWW_TILES.
   Run: node --max-old-space-size=512 --test test/finder-grid-badges.test.mjs */
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
// the block's imports load scripts.js: on a demo host's / it only redirects (stubbed)
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

const row = (city, cityName, countryName, price, topDeal, isKClass, own) => ({
  city, cityName, topDeal, cityRegion: 'EU', countryName, countryCode: 'XX', affinities: [], price, numberOfStopovers: 0, tenantAirlineStopovers: 0, isTenantAirlineOperating: own, isKClass,
});
const ANSWER = {
  destinationFinderOffers: [
    row('SCQ', 'Santiago de Compostela', 'Spain', 230.77, false, false, false),
    row('TER', 'Terceira', 'Portugal', 322.41, false, false, false),
    row('RAP', 'Rapid City', 'USA', 849.63, false, true, false),
    row('YOW', 'Ottawa', 'Canada', 948.67, false, true, false),
    row('VIX', 'Vitoria', 'Brazil', 1096.65, false, true, false),
    row('ZRH', 'Zurich', 'Switzerland', 142.21, false, true, false),
    row('PAR', 'Paris', 'France', 128.23, false, true, true),
    row('YYC', 'Calgary', 'Canada', 764.87, true, true, true),
    row('SOF', 'Sofia', 'Bulgaria', 133.46, false, true, false),
    row('LCA', 'Larnaca', 'Cyprus', 219.44, true, true, true),
    row('DUB', 'Dublin', 'Ireland', 111.44, false, true, false),
    row('PMI', 'Palma de Mallorca', 'Spain', 138.57, false, true, true),
    row('BSL', 'Basel', 'Switzerland', 140.77, false, true, false),
    row('MIL', 'Milan', 'Italy', 115.58, false, true, false),
    row('ATH', 'Athens', 'Greece', 135.63, false, true, false),
    row('SXB', 'Strasbourg', 'France', 118, false, false, false),
    row('SZG', 'Salzburg', 'Austria', 174.16, true, true, false),
    row('LNZ', 'Linz', 'Austria', 136.16, false, true, false),
    row('EAP', 'Mulhouse Basel', 'Switzerland', 96.5, false, true, false),
    row('VCE', 'Venice', 'Italy', 142.28, false, true, false),
    row('VIE', 'Vienna', 'Austria', 133.26, false, true, false),
  ],
  currencyInfo: { currency: 'EUR', currencySymbol: '€', currencySymbolPrefixed: false },
  originCityName: 'Frankfurt',
};
// www's first 16 tiles (city, its badge) of the same load
const WWW_TILES = [
  'Salzburg Recommended', 'Larnaca Recommended', 'Calgary Recommended', 'Mulhouse Basel', 'Dublin',
  'Milan', 'Strasbourg', 'Paris', 'Vienna', 'Sofia', 'Athens', 'Linz', 'Palma de Mallorca', 'Basel',
  'Zurich', 'Venice',
];
const COMMON = {
  'common.destinationFinderCard.badge.featured': 'Recommended',
  'common.destinationFinderCard.badge.kClass': 'Best price',
  'common.destinationFinderCard.badge.previouslySeen': 'Previously seen',
};
const FINDER = '/service/api/destinationfinder/destination/finder/FRA/E';
let calls;
let commonAnswer;
beforeEach(() => {
  window.sessionStorage.clear();
  calls = [];
  commonAnswer = COMMON;
  mock.timers.enable({ apis: ['setTimeout', 'Date'], now: Date.parse('2026-11-02T12:00:00Z') });
  globalThis.fetch = async (url) => {
    const href = String(url);
    if (href.includes('/data/recorded/')) return new Response(JSON.stringify({ entries: {} }));
    calls.push(href);
    const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
    if (href.includes(FINDER)) return json(ANSWER);
    if (href.includes('/service/api/labels/common/') && commonAnswer) return json(commonAnswer);
    return json({}, 404);
  };
});
afterEach(() => mock.timers.reset());

const { default: decorateFinder } = await import('../blocks/destination-finder/destination-finder.js');

const flush = () => new Promise((resolve) => { setImmediate(resolve); });
const settle = async (promise) => {
  let done = false;
  promise.then(() => { done = true; }, () => { done = true; });
  for (let i = 0; i < 400 && !done; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    await flush();
    mock.timers.tick(100);
  }
  await flush();
  return promise;
};
// Discover's authored grid (lh-discover /de/en/book/flights/offers): www's data-dcep values
const ROWS = [['Origin', 'Frankfurt (FRA)'], ['Trip duration', '14'], ['Highlighted offers', '6'], ['Highlight priority', 'topDeal, previouslySeen, kClass']];
const grid = async (brand) => {
  document.head.innerHTML = brand ? `<meta name="brand" content="${brand}">` : '';
  const el = document.createElement('div');
  el.className = 'destination-finder grid';
  el.innerHTML = ROWS.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('');
  document.body.replaceChildren(el);
  await settle(decorateFinder(el));
  assert.equal(el.dataset.lhSource, 'live');
  return [...el.querySelectorAll('.destination-finder-tile')].map((li) => {
    const badge = li.querySelector('.destination-finder-tile-badge');
    const city = li.querySelector('.destination-finder-tile-city').textContent;
    return badge ? `${city} ${badge.textContent}` : city;
  });
};

test('Discover: www\'s order and badges (Recommended first, Best price where the price puts it)', async () => {
  const tiles = await grid('discover');
  assert.deepEqual(tiles.slice(0, 16), WWW_TILES);
  assert.deepEqual(tiles.slice(16), [
    'Santiago de Compostela', 'Terceira', 'Rapid City Best price', 'Ottawa Best price', 'Vitoria Best price',
  ]);
  assert.ok(calls.some((c) => c.includes('/service/api/labels/common/')), 'the badge texts from labels/common');
});

test('Discover: labels/common without an answer: the grid\'s own badge texts', async () => {
  commonAnswer = null;
  const tiles = await grid('discover');
  assert.deepEqual(tiles.slice(0, 4), ['Salzburg Recommended', 'Larnaca Recommended', 'Calgary Recommended', 'Mulhouse Basel']);
  assert.equal(tiles.find((t) => t.startsWith('Rapid City')), 'Rapid City Best price');
});

// lh-com's / is a German page: the badge in the page's language (Empfohlen)
const BEFORE = ['Salzburg', 'Larnaca', 'Calgary', 'Rapid City', 'Ottawa', 'Vitoria', 'Mulhouse Basel', 'Dublin'];
['', 'ita', 'austrian', 'brussels'].forEach((brand) => {
  test(`${brand || 'lufthansa.com'}: as before (every highlighted offer Recommended, on top), no labels/common`, async () => {
    const tiles = await grid(brand);
    const badged = tiles.filter((t) => / (Recommended|Empfohlen)$/.test(t));
    assert.deepEqual(badged.map((t) => t.replace(/ (Recommended|Empfohlen)$/, '')), BEFORE.slice(0, 6));
    assert.deepEqual(tiles.slice(0, 8).map((t) => t.replace(/ (Recommended|Empfohlen)$/, '')), BEFORE);
    assert.equal(tiles.length, 21);
    assert.ok(!calls.some((c) => c.includes('/service/api/labels/common/')));
  });
});
