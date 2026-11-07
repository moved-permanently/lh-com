/* eslint-disable max-len, import/extensions -- dev tooling */
/* Air Dolomiti's flight search documents (tools/importer/airdolomiti-import.mjs flightSearchRows,
   placeSearch): the block as flight-search (airdolomiti), the variant with www's two trip type tabs
   (blocks/flight-search/flight-search-airdolomiti.js), and the row Open label with the text of
   www's phone card ("Prenota il tuo volo", "Book your flight", "Jetzt buchen") where the widget
   has it, so the variant shows the card that opens the search on phones. Without www's widget on
   the page: the base rows only.
   Run: node --max-old-space-size=512 --test test/airdolomiti-flight-search.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { flightSearchRows, placeSearch } from '../tools/importer/airdolomiti-import.mjs';

const widget = (card) => `<main><div class="_bookingWidgetContainer_5dr3g_15"><div class="_searchMobile_5dr3g_21"><button class="_searchBtn_97599_1 _searchBtnMobile_97599_29" type="submit">${card}<svg></svg></button></div><form class="_bookingWidget_5dr3g_15"><div class="_bookingWidgetTop_5dr3g_126"><label>Andata / Ritorno</label><label>Solo andata</label></div><div class="_bookingWidgetBottomIn_5dr3g_99"><div class="_inputField_1lma4_1"><label>Partenza</label></div></div></form></div></main>`;

test('the Open label row from www\'s phone card, after the widget\'s texts', () => {
  const rows = flightSearchRows({ rendered: widget('Prenota il tuo volo'), lang: 'it' });
  assert.deepEqual(rows.find(([k]) => k === 'Open label'), ['Open label', 'Prenota il tuo volo']);
  assert.deepEqual(rows.find(([k]) => k === 'Trip types'), ['Trip types', 'Andata / Ritorno, Solo andata']);
  assert.equal(flightSearchRows({ rendered: widget('Jetzt buchen'), lang: 'de' }).find(([k]) => k === 'Open label')[1], 'Jetzt buchen');
  const bare = flightSearchRows({ rendered: '<main></main>', lang: 'it' });
  assert.equal(bare.find(([k]) => k === 'Open label'), undefined, 'no widget: no card');
});

test('the block as flight-search (airdolomiti), once per page in a section of its own', () => {
  const calls = [];
  const page = {
    search: [['Open label', 'Prenota il tuo volo']],
    section: () => calls.push(['section']),
    block: (name, rows) => calls.push(['block', name, rows]),
    note: () => {},
  };
  placeSearch(page);
  placeSearch(page);
  assert.deepEqual(calls, [['section'], ['block', 'flight-search (airdolomiti)', [['Open label', 'Prenota il tuo volo']]], ['section']]);
});

test('www\'s booking widget on any other page (hubs, destinations, services; brief 448): the flight search where the widget is, no booking link', async () => {
  const { bookingWidget } = await import('../tools/importer/airdolomiti-import.mjs');
  const calls = [];
  const page = {
    rendered: widget('Book your flight'),
    lang: 'en',
    isRoute: false,
    tool: null,
    section: () => calls.push(['section']),
    block: (name, rows) => calls.push(['block', name, rows.find(([k]) => k === 'Open label')]),
    note: () => {},
    booking: () => { calls.push(['booking link']); return ''; },
    add: () => calls.push(['add']),
  };
  bookingWidget(page);
  assert.deepEqual(calls, [['section'], ['block', 'flight-search (airdolomiti)', ['Open label', 'Book your flight']], ['section']]);
  // the route and booking pages as before: the rows now, the block after the page's hero
  const route = { ...page, isRoute: false, tool: 'booking', search: null };
  calls.length = 0;
  bookingWidget(route);
  assert.deepEqual(calls, [], 'placed later (after the hero)');
  assert.ok(route.search && route.search.length, 'the rows');
});
