/* eslint-disable max-len */
/* The offers grid's order and badges on Discover (blocks/destination-finder grid, brand flag
   BRANDS.discover.gridBadges): as www's Discover component (dcep-destination-finder, sort
   "Recommended"): the highlighted offers (Highlighted offers, Highlight priority: topDeal, then
   kClass, in the answer's order) carry a badge, "Recommended" for a top deal, "Best price" for a
   k-class offer (the texts from labels/common, common.destinationFinderCard.badge.*); only the
   top deals come first (by price), every other tile by price, the k-class ones included.
   ITA, Austrian and Brussels grids as before: every highlighted offer "Recommended", on top.
   lufthansa.com since standing order 26 (2026-11-14) as www's lufthansa.com grids (the same
   component; parity recordings of gb/en, de/en, de/de and at/de): Discover's badges and "Compare
   cities", and the sort www opens with: "Recommended" when a highlighted offer is a top deal, else
   "Best price" (resultSection.sortKClass; the k-class highlights first by price, then every other
   offer by price), as www's /gb/en/flights with London's answer, which has no top deal
   (lufthansa-api-001: destinationfinder/destination/finder/LHR/E, X-Portal LH, 2026-11-14,
   one load of our page; LHR_ANSWER is its first six k-class offers and the ten cheapest others). The answer: offers of www.discover-airlines.com's
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
// a phone (below 768 px) when a test sets phone
let phone = false;
window.matchMedia = (query) => ({ matches: phone && /width < 768px/.test(query), addEventListener: () => {}, addListener: () => {} });
window.sessionStorage = store();
window.localStorage = store();
// linkedom's select has no value setter (the grid sets its pickers)
Object.defineProperty(window.HTMLSelectElement.prototype, 'value', {
  configurable: true,
  get() { return (this.querySelector('option[selected]') || this.querySelector('option') || {}).value || ''; },
  set(v) { [...this.querySelectorAll('option')].forEach((o) => o.toggleAttribute('selected', o.value === v)); },
});
// nor options / selectedIndex (the sort's announcement reads them)
Object.defineProperty(window.HTMLSelectElement.prototype, 'options', {
  configurable: true,
  get() { return [...this.querySelectorAll('option')]; },
});
Object.defineProperty(window.HTMLSelectElement.prototype, 'selectedIndex', {
  configurable: true,
  get() { return Math.max(0, this.options.findIndex((o) => o.hasAttribute('selected'))); },
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
const FINDER_LHR = '/service/api/destinationfinder/destination/finder/LHR/E';
// lufthansa-api-001's LHR answer: its first six k-class offers (in its order) and the ten cheapest
// others; no top deal in the whole answer (0 of 319)
const LHR_ANSWER = {
  destinationFinderOffers: [
    row('JAX', 'Jacksonville, FL', 'USA', 586.21, false, true, false),
    row('YOW', 'Ottawa', 'Canada', 681.89, false, true, false),
    row('ZAG', 'Zagreb', 'Croatia', 160.45, false, true, true),
    row('BRU', 'Brussels', 'Belgium', 107.95, false, true, true),
    row('OLB', 'Olbia', 'Italy', 157.9, false, true, true),
    row('VIX', 'Vitoria', 'Brazil', 808.31, false, true, false),
    row('ZRH', 'Zurich', 'Switzerland', 114.36, false, true, true),
    row('MUC', 'Munich', 'Germany', 116.26, false, true, true),
    row('GVA', 'Geneva', 'Switzerland', 119.1, false, true, true),
    row('LNZ', 'Linz', 'Austria', 122.81, false, true, false),
    row('FRA', 'Frankfurt', 'Germany', 125.65, false, true, true),
    row('INN', 'Innsbruck', 'Austria', 129.75, false, true, false),
    row('VIE', 'Vienna', 'Austria', 133.35, false, false, true),
    row('MIL', 'Milan', 'Italy', 133.94, false, true, true),
    row('BIO', 'Bilbao', 'Spain', 137.96, false, true, true),
    row('ROM', 'Rome', 'Italy', 138.01, false, true, true),
  ],
  currencyInfo: { currency: 'GBP', currencySymbol: '£', currencySymbolPrefixed: true },
  originCityName: 'London',
};
// www's first 16 tiles of /gb/en/flights (lh-parity-004a, 2026-11-09: the same six first, by price)
const WWW_GB_TILES = [
  'Brussels Best price', 'Olbia Best price', 'Zagreb Best price', 'Jacksonville, FL Best price',
  'Ottawa Best price', 'Vitoria Best price', 'Zurich', 'Munich', 'Geneva', 'Linz', 'Frankfurt',
  'Innsbruck', 'Vienna', 'Milan', 'Bilbao', 'Rome',
];
let calls;
let commonAnswer;
beforeEach(() => {
  window.sessionStorage.clear();
  calls = [];
  commonAnswer = COMMON;
  mock.timers.enable({ apis: ['setTimeout', 'Date'], now: Date.parse('2026-11-02T12:00:00Z') });
  globalThis.fetch = async (url) => {
    // the site's flag live-prices on (scripts/live-prices.js, standing order 23)
    if (String(url) === '/config/flags.json') return new Response(JSON.stringify({ data: [{ flag: 'live-prices', value: 'on' }] }), { status: 200, headers: { 'content-type': 'application/json' } });
    const href = String(url);
    if (href.includes('/data/recorded/')) return new Response(JSON.stringify({ entries: {} }));
    calls.push(href);
    const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
    if (href.includes(FINDER)) return json(ANSWER);
    if (href.includes(FINDER_LHR)) return json(LHR_ANSWER);
    if (href.includes('/service/api/labels/common/') && commonAnswer) return json(commonAnswer);
    return json({}, 404);
  };
});
afterEach(() => {
  mock.timers.reset();
  phone = false;
});

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
// gb/en/flights' authored grid (content/gb/en/flights): London's airport, the same priority
const GB_ROWS = [['Origin', 'London (LHR)'], ...ROWS.slice(1)];
let lastBlock;
const grid = async (brand, rows = ROWS, pathname = '/') => {
  document.head.innerHTML = brand ? `<meta name="brand" content="${brand}">` : '';
  window.location.pathname = pathname;
  const el = document.createElement('div');
  el.className = 'destination-finder grid';
  el.innerHTML = rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('');
  document.body.replaceChildren(el);
  try {
    await settle(decorateFinder(el));
  } finally {
    window.location.pathname = '/';
  }
  assert.equal(el.dataset.lhSource, 'live');
  lastBlock = el;
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

const sortOf = () => {
  const select = lastBlock.querySelector('.destination-finder-sort select');
  return { value: select.value, options: [...select.querySelectorAll('option')].map((o) => `${o.value} ${o.textContent}`) };
};
const compareBoxes = () => lastBlock.querySelectorAll('.destination-finder-compare-checkbox').length;

test('lufthansa.com with a top deal among the highlights: www\'s order and badges, sort Recommended, Compare cities on every card', async () => {
  const tiles = await grid('');
  assert.deepEqual(tiles.slice(0, 16), WWW_TILES);
  assert.equal(tiles.find((t) => t.startsWith('Rapid City')), 'Rapid City Best price');
  assert.equal(sortOf().value, 'topDeal');
  assert.ok(calls.some((c) => c.includes('/service/api/labels/common/')), 'the badge texts from labels/common');
  assert.equal(compareBoxes(), tiles.length);
});

test('lufthansa.com /gb/en/flights (London\'s answer, no top deal): www\'s sort Best price, its order and badges', async () => {
  const tiles = await grid('', GB_ROWS, '/gb/en/flights');
  assert.deepEqual(tiles, WWW_GB_TILES);
  const sort = sortOf();
  assert.equal(sort.value, 'kClass');
  assert.deepEqual(sort.options, ['topDeal Recommended', 'kClass Best price', 'price Price', 'alphabet Alphabet']);
  assert.equal(compareBoxes(), 16);
});

test('lufthansa.com /gb/en/flights: Recommended picked by hand lifts no offer (no top deal), the badges stay', async () => {
  await grid('', GB_ROWS, '/gb/en/flights');
  const select = lastBlock.querySelector('.destination-finder-sort select');
  select.value = 'topDeal';
  select.dispatchEvent(new window.Event('change'));
  const tiles = [...lastBlock.querySelectorAll('.destination-finder-tile')].map((li) => {
    const badge = li.querySelector('.destination-finder-tile-badge');
    const city = li.querySelector('.destination-finder-tile-city').textContent;
    return badge ? `${city} ${badge.textContent}` : city;
  });
  assert.deepEqual(tiles.slice(0, 3), ['Brussels Best price', 'Zurich', 'Munich']);
  assert.equal(tiles.filter((t) => t.endsWith(' Best price')).length, 6);
});

// a brand without www's badges: the picker as before (no Best price)
const BEFORE = ['Salzburg', 'Larnaca', 'Calgary', 'Rapid City', 'Ottawa', 'Vitoria', 'Mulhouse Basel', 'Dublin'];
['ita', 'austrian', 'brussels'].forEach((brand) => {
  test(`${brand}: as before (every highlighted offer Recommended, on top), no labels/common, no Compare cities`, async () => {
    const tiles = await grid(brand);
    const badged = tiles.filter((t) => / (Recommended|Empfohlen)$/.test(t));
    assert.deepEqual(badged.map((t) => t.replace(/ (Recommended|Empfohlen)$/, '')), BEFORE.slice(0, 6));
    assert.deepEqual(tiles.slice(0, 8).map((t) => t.replace(/ (Recommended|Empfohlen)$/, '')), BEFORE);
    assert.equal(tiles.length, 21);
    assert.ok(!calls.some((c) => c.includes('/service/api/labels/common/')));
    assert.equal(sortOf().options.length, 3);
    assert.equal(compareBoxes(), 0);
  });
});

// standing order 26: www's lufthansa.com phones (/gb/en/flights at 390, lh-parity-004a) have the
// smart search over the origin and "Filters" and the sort on one row; from 768 px as before
const SMART_ROWS = [...GB_ROWS, ['Smart search', '<a href="/gb/en/smart-search">Smart destination search</a>']];
const placement = () => {
  const filters = lastBlock.querySelector('.destination-finder-filters');
  const toolbar = lastBlock.querySelector('.destination-finder-toolbar');
  const bar = lastBlock.querySelector('.destination-finder-filters-bar');
  const name = (e) => e.className.split(' ').filter((c) => c.startsWith('destination-finder-')).join(' ');
  return {
    filters: [...filters.children].map(name),
    bar: bar ? [...bar.children].map(name) : null,
    toolbar: [...toolbar.children].map(name),
  };
};

test('lufthansa.com on a phone: the smart search over the origin, Filters and the sort on one row', async () => {
  phone = true;
  await grid('', SMART_ROWS, '/gb/en/flights');
  assert.ok(lastBlock.classList.contains('destination-finder-phone-bar'));
  assert.deepEqual(placement(), {
    filters: ['destination-finder-filters-heading', 'destination-finder-sr-only', 'destination-finder-smart-search', 'destination-finder-filter', 'destination-finder-filters-bar', 'destination-finder-filters-panel'],
    bar: ['destination-finder-filters-toggle', 'destination-finder-field destination-finder-sort'],
    toolbar: [],
  });
});

test('lufthansa.com from 768 px: the sort and the smart search in the toolbar, as before', async () => {
  await grid('', SMART_ROWS, '/gb/en/flights');
  assert.deepEqual(placement(), {
    filters: ['destination-finder-filters-heading', 'destination-finder-sr-only', 'destination-finder-filter', 'destination-finder-filters-bar', 'destination-finder-filters-panel'],
    bar: ['destination-finder-filters-toggle'],
    toolbar: ['destination-finder-field destination-finder-sort', 'destination-finder-smart-search'],
  });
});

test('another brand on a phone (ITA): as before', async () => {
  phone = true;
  await grid('ita', SMART_ROWS, '/gb/en/flights');
  assert.ok(!lastBlock.classList.contains('destination-finder-phone-bar'));
  assert.deepEqual(placement(), {
    filters: ['destination-finder-filters-heading', 'destination-finder-sr-only', 'destination-finder-filter', 'destination-finder-filters-toggle', 'destination-finder-filters-panel'],
    bar: null,
    toolbar: ['destination-finder-field destination-finder-sort', 'destination-finder-smart-search'],
  });
});

// standing order 27: www's lufthansa.com fields (lh-parity-004a/004b, every flights page): the origin by its city
// name alone ("London", ours "London (LHR)"), "Destination" inside the empty destination field (its label for
// screen readers only, destination-finder.css keeps its place); other brands as before
test('lufthansa.com: the origin by its name, the destination field\'s label as its placeholder', async () => {
  await grid('', SMART_ROWS, '/gb/en/flights');
  const origin = lastBlock.querySelector('input[name="originCode"]');
  const dest = lastBlock.querySelector('input[name="selectedDestinationFilterOptions"]');
  assert.equal(origin.value, 'London');
  assert.equal(dest.getAttribute('placeholder'), 'Destination');
  assert.ok(dest.closest('.destination-finder-field').classList.contains('destination-finder-destination'));
  const label = dest.closest('.destination-finder-field').querySelector('label');
  assert.equal(label.textContent, 'Destination', 'the label stays, for screen readers');
});

test('another brand (ITA): the origin with its code, no placeholder, as before', async () => {
  await grid('ita', SMART_ROWS, '/gb/en/flights');
  assert.equal(lastBlock.querySelector('input[name="originCode"]').value, 'London (LHR)');
  assert.equal(lastBlock.querySelector('input[name="selectedDestinationFilterOptions"]').getAttribute('placeholder'), null);
});
