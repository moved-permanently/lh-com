/* The destination finder's offers on a brand page (blocks/destination-finder): the slider lists the
   offers the brand operates (isTenantAirlineOperating under its X-Portal) when its block asks for
   it, as www's component does with airlineWhitelistingEnabled (the Airline whitelist row:
   Discover's homepages; Austrian's www component has it off), in the answer's order; the grid
   preselects "<brand> only" with ?PartnerFlights=one, as www's nav link to its offers page.
   lufthansa.com as before (the top deals, then the lowest price; all partners).
   The answer: a fixture in the shape of destinationfinder/destination/finder/FRA/E under
   X-Portal: FOUR_Y (www.lufthansa.com refuses this test's network; checked in a real browser).
   Run: node --max-old-space-size=512 --test test/finder-brand-offers.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
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
// the block's imports load scripts.js: on a demo host's / it only redirects (stubbed), it
// decorates nothing
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'discover.turnsthe.page', pathname: '/', search: '', replace: () => {}, href: 'https://discover.turnsthe.page/', origin: 'https://discover.turnsthe.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
window.sessionStorage = store();
window.localStorage = store();
globalThis.window = window;
globalThis.document = document;

// the answer's offers, in its order: Discover's own flights between Lufthansa's cheaper ones
const offer = (city, cityName, price, own, topDeal = false) => ({
  city, cityName, topDeal, cityRegion: 'EU', countryName: '', countryCode: 'XX', affinities: [], price, numberOfStopovers: own ? 0 : 1, tenantAirlineStopovers: 0, isTenantAirlineOperating: own, isKClass: false,
});
const ANSWER = {
  destinationFinderOffers: [
    offer('SZG', 'Salzburg', 175, false, true),
    offer('MLE', 'Male', 675, true),
    offer('LCA', 'Larnaca', 220, false),
    offer('AGP', 'Malaga', 182, true),
    offer('BRI', 'Bari', 168, true),
    offer('MLH', 'Mulhouse', 97, false),
    offer('FMY', 'Fort Myers', 751, true),
    offer('SCQ', 'Santiago de Compostela', 249, false),
    offer('WDH', 'Windhoek', 706, true),
  ],
  currencyInfo: { currency: 'EUR', currencySymbol: '€', currencySymbolPrefixed: false },
  originCityName: 'Frankfurt',
};
let calls;
beforeEach(() => {
  window.sessionStorage.clear();
  calls = [];
  globalThis.fetch = async (url) => {
    const href = String(url);
    if (href.includes('/data/recorded/')) return new Response(JSON.stringify({ entries: {} }));
    calls.push(href);
    if (href.includes('/destinationfinder/destination/finder/FRA/E')) {
      return new Response(JSON.stringify(ANSWER), { status: 200, headers: { 'content-type': 'application/json' } });
    }
    return new Response('{}', { status: 404, headers: { 'content-type': 'application/json' } });
  };
});

const { loadDestinations, gridTenantOnly } = await import('../blocks/destination-finder/destination-finder.js');
const { getLocale } = await import('../scripts/locale.js');

const onPage = async (meta, fn) => {
  document.head.innerHTML = Object.entries(meta).map(([k, v]) => `<meta name="${k}" content="${v}">`).join('');
  try {
    return await fn();
  } finally {
    document.head.innerHTML = '';
  }
};
const state = (airlineWhitelist) => ({ origin: { code: 'FRA', name: 'Frankfurt' }, tripType: 'RETURN', airlineWhitelist });
const codes = async (meta, whitelist, path) => onPage(meta, async () => {
  const { destinations, source } = await loadDestinations(state(whitelist), getLocale(path));
  assert.equal(source, 'live');
  return destinations.map((d) => d.code);
});
const LH_ORDER = ['SZG', 'MLH', 'BRI', 'AGP', 'LCA', 'SCQ', 'MLE', 'WDH', 'FMY'];

test('Discover with the whitelist (www\'s airlineWhitelistingEnabled): its own flights, in the answer\'s order', async () => {
  assert.deepEqual(await codes({ brand: 'discover' }, true, '/de/de/homepage'), ['MLE', 'AGP', 'BRI', 'FMY', 'WDH']);
  assert.ok(calls.some((c) => c.includes('/destinationfinder/destination/finder/FRA/E')));
});

test('without the whitelist (Austrian\'s www component, ITA) and on lufthansa.com: as before', async () => {
  assert.deepEqual(await codes({ brand: 'discover' }, false, '/de/de/homepage'), LH_ORDER, 'the top deals, then the price');
  assert.deepEqual(await codes({}, true, '/de/de/homepage'), LH_ORDER, 'lufthansa.com: the row changes nothing');
  assert.deepEqual(await codes({}, false, '/de/de/homepage'), LH_ORDER);
});

test('a brand answer without one offer of its own: all offers, as before', async () => {
  const own = ANSWER.destinationFinderOffers.map((o) => o.isTenantAirlineOperating);
  ANSWER.destinationFinderOffers.forEach((o) => { o.isTenantAirlineOperating = false; });
  try {
    assert.deepEqual(await codes({ brand: 'discover' }, true, '/de/de/homepage'), LH_ORDER);
  } finally {
    ANSWER.destinationFinderOffers.forEach((o, i) => { o.isTenantAirlineOperating = own[i]; });
  }
});

test('the grid: ?PartnerFlights=one preselects "<brand> only" on a brand page, never on lufthansa.com', async () => {
  assert.equal(await onPage({ brand: 'discover' }, () => gridTenantOnly('?PartnerFlights=one&OriginCode=FRA')), true);
  assert.equal(await onPage({ brand: 'discover' }, () => gridTenantOnly('?PartnerFlights=all')), false);
  assert.equal(await onPage({ brand: 'discover' }, () => gridTenantOnly('')), false);
  assert.equal(await onPage({}, () => gridTenantOnly('?PartnerFlights=one')), false);
});
