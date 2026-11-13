/* eslint-disable max-len */
/* The flight search's tabs per market (brief 558, the market comparison's widget settings): www's booking widget
   hides its hotel, car or holiday tab per market (hideHotel, hideCar, hideHoliday in its dcep settings: cr/es, pa/es,
   pe/es and ec/es show cash-and-miles without the car and hotel tabs, 13 de roots hotelangebote without the hotel
   tab). An optional `Tabs by market` row, one paragraph per group "<markets> = <tab, tab>" (markets as section
   metadata reads them: "cr, pa" or "-de", a root such as "cr/es" counting as its country): the first group whose
   markets allow the page's country gives its tab list; else the Tabs row as before.
   Run: node --max-old-space-size=512 --test test/flight-search-tabs-by-market-558.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'lufthansa.turnsthe.page', pathname: '/xx/es/cash-and-miles', search: '', href: 'https://lufthansa.turnsthe.page/xx/es/cash-and-miles', origin: 'https://lufthansa.turnsthe.page',
};
globalThis.window = window;
globalThis.document = document;
const { readFlightSearchSettings } = await import('../blocks/flight-search/flight-search.js');

const row = (html) => {
  const c = document.createElement('div');
  c.innerHTML = html;
  const text = c.textContent.trim();
  return {
    cell: c, text, list: text.split(/\s*[,;\n]\s*/).filter(Boolean), link: c.querySelector('a[href]'),
  };
};
const TABS = row('Vuelos, Vuelo + Hotel, Coche de alquiler, Hotel');
const BY_MARKET = row('<p>cr/es, pa/es, pe/es, ec/es = Vuelos, Vuelo + Hotel</p><p>-xx = Vuelos, Coche de alquiler, Hotel</p>');
const tabsFor = (country, rows) => readFlightSearchSettings(rows, { country, lang: 'es' }).tabs;

test('without the row: the Tabs row', () => {
  assert.deepEqual(tabsFor('cr', { tabs: TABS }), ['Vuelos', 'Vuelo + Hotel', 'Coche de alquiler', 'Hotel']);
});

test('a market of the first group gets its tabs', () => {
  assert.deepEqual(tabsFor('cr', { tabs: TABS, 'tabs-by-market': BY_MARKET }), ['Vuelos', 'Vuelo + Hotel']);
  assert.deepEqual(tabsFor('ec', { tabs: TABS, 'tabs-by-market': BY_MARKET }), ['Vuelos', 'Vuelo + Hotel']);
});

test('the first group that allows the country wins; an exclude group', () => {
  assert.deepEqual(tabsFor('ar', { tabs: TABS, 'tabs-by-market': BY_MARKET }), ['Vuelos', 'Coche de alquiler', 'Hotel']);
});

test('no group allows the country: the Tabs row', () => {
  assert.deepEqual(tabsFor('xx', { tabs: TABS, 'tabs-by-market': BY_MARKET }), ['Vuelos', 'Vuelo + Hotel', 'Coche de alquiler', 'Hotel']);
});

test('a group line without "=" is ignored', () => {
  assert.deepEqual(tabsFor('cr', { tabs: TABS, 'tabs-by-market': row('<p>cr, pa</p>') }), ['Vuelos', 'Vuelo + Hotel', 'Coche de alquiler', 'Hotel']);
});
