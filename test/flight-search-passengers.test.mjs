/* eslint-disable max-len */
/* The flight search's passengers and airports (blocks/flight-search, passenger-picker.js,
   scripts/shop-handoff.js): the `Passenger picker` row turns the traveller line into a picker
   (adults, children 2-11, infants under 2, the cabins of the `Cabins` row); the `Airports` row
   limits the origin and destination suggestions to its codes; the shop handoff sends children
   (CHD) and infants (INF). Without the rows the block and its handoff are as before.
   Run: node --max-old-space-size=512 --test test/flight-search-passengers.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'airdolomiti.turnsthe.page', pathname: '/', search: '', href: 'https://airdolomiti.turnsthe.page/', origin: 'https://airdolomiti.turnsthe.page',
};
// linkedom's select has no value setter
Object.defineProperty(window.HTMLSelectElement.prototype, 'value', {
  configurable: true,
  get() { return (this.querySelector('option[selected]') || this.querySelector('option') || {}).value || ''; },
  set(v) { [...this.querySelectorAll('option')].forEach((o) => o.toggleAttribute('selected', o.value === v)); },
});
globalThis.window = window;
globalThis.document = document;
const { readFlightSearchSettings, allowedAirports } = await import('../blocks/flight-search/flight-search.js');
const {
  createPassengerPicker, clampPassengers, passengerSummary, PASSENGER_LABELS,
} = await import('../blocks/flight-search/passenger-picker.js');
const { buildShopHandoff } = await import('../scripts/shop-handoff.js');

const row = (text) => ({ text, list: text.split(/\s*,\s*/) });
const settingsOf = (rows) => readFlightSearchSettings(rows, { homeAirport: 'FRA', lang: 'it' });

test('settings: without the rows as before; with them the picker, its cabins and the airports', () => {
  const plain = settingsOf({ 'traveller-label': row('Economy, 1 Traveller') });
  assert.equal(plain.passengerPicker, false);
  assert.deepEqual(plain.airports, []);
  assert.deepEqual(plain.cabins, ['E', 'P', 'B', 'F']);
  const ad = settingsOf({ 'passenger-picker': row('yes'), cabins: row('E, B'), airports: row('VRN, MUC, FCO, bri, xx') });
  assert.equal(ad.passengerPicker, true);
  assert.deepEqual(ad.cabins, ['E', 'B']);
  assert.deepEqual(ad.airports, ['VRN', 'MUC', 'FCO', 'BRI'], 'three-letter codes only, upper case');
});

test('allowedAirports: only the row\'s codes; no row: every suggestion', () => {
  const list = [{ code: 'VRN', name: 'Verona' }, { code: 'VIE', name: 'Vienna' }, { code: 'MUC', name: 'Munich' }];
  assert.deepEqual(allowedAirports(list, ['VRN', 'MUC']).map((a) => a.code), ['VRN', 'MUC']);
  assert.ok(allowedAirports(list, []) === list);
});

test('the rules: 1-9 adults, adults + children <= 9, at most one infant per adult', () => {
  assert.deepEqual(clampPassengers({ adults: 0 }), { adults: 1, children: 0, infants: 0 });
  assert.deepEqual(clampPassengers({ adults: 7, children: 5, infants: 9 }), { adults: 7, children: 2, infants: 7 });
  assert.deepEqual(clampPassengers({ adults: 12 }), { adults: 9, children: 0, infants: 0 });
});

test('the picker: the line shows the cabin and the count; + and − keep the rules', () => {
  const labels = PASSENGER_LABELS.en;
  const picker = createPassengerPicker({ labels, cabins: ['E', 'B'], value: { adults: 1, cabin: 'E' } });
  document.body.append(picker.element);
  const opener = picker.element.querySelector('.flight-search-travellers');
  assert.equal(opener.textContent, 'Economy, 1 Traveller');
  assert.equal(opener.getAttribute('aria-expanded'), 'false');
  opener.click();
  assert.equal(opener.getAttribute('aria-expanded'), 'true');
  const more = (type) => picker.element
    .querySelector(`.flight-search-passenger-${type} .flight-search-passenger-more`);
  assert.equal(picker.element.querySelector('.flight-search-passenger-infants .flight-search-passenger-fewer').disabled, true);
  more('children').click();
  more('infants').click();
  assert.equal(more('infants').disabled, true, 'one infant per adult');
  const select = picker.element.querySelector('select');
  assert.deepEqual([...select.options].map((o) => o.value), ['E', 'B']);
  select.value = 'B';
  select.dispatchEvent(new window.Event('change'));
  assert.deepEqual(picker.getValue(), {
    adults: 1, children: 1, infants: 1, cabin: 'B',
  });
  assert.equal(opener.textContent, 'Business, 3 Travellers');
  assert.equal(passengerSummary(PASSENGER_LABELS.it, 'E', { adults: 2, children: 0, infants: 0 }), 'Economy, 2 passeggeri');
});

test('every language has every key of en, with the same placeholders', () => {
  const ph = (s) => (s.match(/\{[A-Z]+\}/g) || []).sort().join();
  Object.entries(PASSENGER_LABELS).forEach(([lang, t]) => {
    Object.entries(PASSENGER_LABELS.en).forEach(([k, v]) => {
      // the adults' hint: none in every language (test/flight-search-adults-hint.test.mjs)
      assert.ok(k === 'adults hint' ? t[k] === '' : t[k], `${lang} ${k}`);
      assert.equal(ph(t[k]), ph(v), `${lang} ${k}`);
    });
  });
  ['en', 'de', 'it', 'fr', 'es', 'nl', 'pt', 'el', 'ja', 'ru', 'zh', 'pl'].forEach((l) => assert.ok(PASSENGER_LABELS[l], l));
});

test('the shop handoff: children CHD and infants INF after the adults; adults only as before', () => {
  const locale = { key: 'de/en', country: 'de' };
  const query = {
    departureDate: '2026-12-24', origin: 'FRA', destination: 'JFK', tripType: 'ONEWAY', adults: 2, cabin: 'E',
  };
  const before = '{"itineraries":[{"departureDateTime":"2026-12-24","originLocationCode":"FRA","destinationLocationCode":"JFK"}],"travelers":[{"discounts":[],"passengerTypeCode":"ADT"},{"discounts":[],"passengerTypeCode":"ADT"}],"cabin":"ECONOMY","portalFacts":{"performance":false,"targeting":false,"functional":false}}';
  assert.equal(buildShopHandoff(query, locale).fields.search, before);
  assert.equal(buildShopHandoff({ ...query, children: 0, infants: 0 }, locale).fields.search, before);
  const search = JSON.parse(buildShopHandoff({
    ...query, children: 1, infants: 1, cabin: 'B',
  }, locale).fields.search);
  assert.deepEqual(search.travelers.map((t) => t.passengerTypeCode), ['ADT', 'ADT', 'CHD', 'INF']);
  assert.ok(search.travelers.every((t) => Array.isArray(t.discounts) && !t.discounts.length));
  assert.equal(search.cabin, 'BUSINESS');
});
