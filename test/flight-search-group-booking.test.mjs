/* The flight search's group booking link: an optional `Group booking` row (a link) puts it in
   the passenger picker, as ITA's ("Booking from 10 persons" to its group travel page) and
   lufthansa.com's (.group-booking-link under the passenger steppers) pickers. Without the row
   the picker as before; without the picker (no `Passenger picker` row) there is no panel and so
   no link.
   Run: node --max-old-space-size=512 --test test/flight-search-group-booking.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'ita.turnsthe.page', pathname: '/it/en/homepage', search: '', href: 'https://ita.turnsthe.page/it/en/homepage', origin: 'https://ita.turnsthe.page',
};
globalThis.window = window;
globalThis.document = document;
const { readFlightSearchSettings } = await import('../blocks/flight-search/flight-search.js');
const { createPassengerPicker, PASSENGER_LABELS } = await import('../blocks/flight-search/passenger-picker.js');

const cell = (html) => {
  const c = document.createElement('div');
  c.innerHTML = html;
  return c;
};
const row = (html) => {
  const c = cell(html);
  const text = c.textContent.trim();
  return {
    cell: c, text, list: [text], link: c.querySelector('a[href]'),
  };
};
const settingsOf = (rows) => readFlightSearchSettings(rows, { homeAirport: 'ROM', lang: 'en' });
const LINK = '<a href="/it/en/book-and-prepare/group-travel-and-charter">Booking from 10 persons</a>';
const labels = PASSENGER_LABELS.en;

test('settings: the Group booking row\'s link; none without the row or without a link', () => {
  assert.equal(settingsOf({}).groupBooking, null);
  assert.equal(settingsOf({ 'group-booking': row('Booking from 10 persons') }).groupBooking, null);
  assert.deepEqual(settingsOf({ 'passenger-picker': row('yes'), 'group-booking': row(LINK) }).groupBooking, {
    href: '/it/en/book-and-prepare/group-travel-and-charter', text: 'Booking from 10 persons',
  });
});

test('the picker: the link after the passengers and cabin, before Done', () => {
  const { element } = createPassengerPicker({
    labels,
    cabins: ['E', 'B'],
    value: { adults: 1, cabin: 'E' },
    groupBooking: { href: '/it/en/book-and-prepare/group-travel-and-charter', text: 'Booking from 10 persons' },
  });
  const panel = element.querySelector('.flight-search-passengers-panel');
  const link = panel.querySelector('a.flight-search-passengers-group');
  assert.ok(link);
  assert.equal(link.getAttribute('href'), '/it/en/book-and-prepare/group-travel-and-charter');
  assert.equal(link.textContent, 'Booking from 10 persons');
  assert.ok(link.nextElementSibling === panel.querySelector('.flight-search-passengers-done'));
  assert.ok(link.previousElementSibling === panel.querySelector('.flight-search-passenger-cabin'));
});

test('without the row: the picker as before (no link, the same markup)', () => {
  const opts = { labels, cabins: ['E', 'B'], value: { adults: 1, cabin: 'E' } };
  const strip = (html) => html.replace(/flight-search-passengers-[a-z0-9]{6}/g, 'ID');
  const plain = createPassengerPicker(opts).element;
  const none = createPassengerPicker({ ...opts, groupBooking: null }).element;
  assert.equal(plain.querySelector('.flight-search-passengers-group'), null);
  assert.equal(strip(none.outerHTML), strip(plain.outerHTML));
});
