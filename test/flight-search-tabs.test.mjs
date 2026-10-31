/* eslint-disable max-len */
/* The flight search's tabs (blocks/flight-search tabKind, tabKinds): the flight tab whatever the
   language of its label. ITA's homepages ("Voli", "Vols", "Vuelos", "Vluchten", "Voos",
   "Πτήσεις", "フライト") and Discover's xx/fr ("Vols") author one tab in their language: when no
   tab reads as a flight tab, the first one is it (the live flight manager's first tab is always
   Flights). lufthansa.com's rows (Flights, Flüge, the tab bars of cash-and-miles, Hotel alone)
   as before. Run: node --max-old-space-size=512 --test test/flight-search-tabs.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'ita.turnsthe.page', pathname: '/it/it/homepage', search: '', href: 'https://ita.turnsthe.page/it/it/homepage', origin: 'https://ita.turnsthe.page',
};
globalThis.window = window;
globalThis.document = document;
const { tabKind, tabKinds } = await import('../blocks/flight-search/flight-search.js');

test('tabKinds: a single tab in any language is the flight tab', () => {
  ['Voli', 'Vols', 'Vuelos', 'Vluchten', 'Voos', 'Πτήσεις', 'フライト'].forEach((label) => {
    assert.deepEqual(tabKinds([label]), ['flight'], label);
  });
});

test('tabKinds: the first of several unknown tabs is the flight tab; hotel and car keep their kind', () => {
  assert.deepEqual(tabKinds(['Voli', 'Noleggio auto', 'Hotel']), ['flight', 'car', 'hotel']);
  assert.deepEqual(tabKinds(['Vols', 'Location de voitures', 'Hôtel']), ['flight', 'other', 'other']);
});

test('tabKinds: lufthansa.com\'s tab rows as before', () => {
  const before = (labels) => labels.map(tabKind);
  [
    ['Flights'], ['Flüge'], ['Hotel'], ['Flights', 'Rental car', 'Hotel'], ['Flüge', 'Flug & Hotel', 'Mietwagen', 'Hotel'],
    ['Flüge', 'Mietwagen', 'Hotel'], ['Flights', 'Flight & Hotel', 'Rental car', 'Hotel'], ['Flights', 'Car', 'Hotel'], [],
  ].forEach((labels) => assert.deepEqual(tabKinds(labels), before(labels), labels.join(', ')));
  assert.deepEqual(tabKinds(['Hotel']), ['hotel'], 'a hotel-only search stays a hotel search');
  assert.deepEqual(tabKinds(['Mietwagen', 'Hotel']), ['car', 'hotel'], 'a known first tab keeps its kind');
});

test('the block decides its panels by tabKinds', async () => {
  const fs = await import('node:fs');
  const src = fs.readFileSync(new URL('../blocks/flight-search/flight-search.js', import.meta.url), 'utf8');
  assert.match(src, /const tabKindList = tabKinds\(settings\.tabs\);/);
  assert.doesNotMatch(src, /settings\.tabs\.map\(tabKind\)/);
});
