/* eslint-disable max-len */
/* Brief 582 (the market rows from lh-snapshots-090): on am/de hotelangebote, am/en and cr/es hotel-offers www's booking
   widget has hideHotel set and only the hotel tab, and www draws it empty (the widget's element holds no text). The
   Tabs by market row's group "<markets> = none" (tools/importer/market-sections.mjs withTabsByMarket writes it when
   no tab is left): readFlightSearchSettings says hidden and the block removes itself; other markets as before.
   Run: node --max-old-space-size=512 --test test/flight-search-none-582.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'lufthansa.turnsthe.page', pathname: '/am/en/hotel-offers', search: '', href: 'https://lufthansa.turnsthe.page/am/en/hotel-offers', origin: 'https://lufthansa.turnsthe.page',
};
globalThis.window = window;
globalThis.document = document;
const { readFlightSearchSettings, marketTabs } = await import('../blocks/flight-search/flight-search.js');

const row = (html) => {
  const c = document.createElement('div');
  c.innerHTML = html;
  const text = c.textContent.trim();
  return {
    cell: c, text, list: text.split(/\s*[,;\n]\s*/).filter(Boolean), link: c.querySelector('a[href]'),
  };
};
const ROWS = { tabs: row('Hotel'), 'tabs-by-market': row('<p>am/en, cd/en, cr/en = none</p>') };

test('a market of a "none" group: no tabs, hidden', () => {
  assert.deepEqual(marketTabs(ROWS, { country: 'am' }), []);
  assert.equal(readFlightSearchSettings(ROWS, { country: 'am', lang: 'en' }).hidden, true);
});

test('another market, or no row: the Tabs row, shown', () => {
  const s = readFlightSearchSettings(ROWS, { country: 'de', lang: 'en' });
  assert.equal(s.hidden, false);
  assert.deepEqual(s.tabs, ['Hotel']);
  assert.equal(readFlightSearchSettings({ tabs: row('Hotel') }, { country: 'am', lang: 'en' }).hidden, false);
});

test('the block removes itself (with its wrapper) for such a market', () => {
  const js = fs.readFileSync(new URL('../blocks/flight-search/flight-search.js', import.meta.url), 'utf8');
  assert.match(js, /if \(authored\.hidden\) \{\s*\(block\.closest\('\.flight-search-wrapper'\) \|\| block\)\.remove\(\);\s*return;\s*\}/);
});
