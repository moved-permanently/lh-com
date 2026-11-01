/* eslint-disable max-len */
/* The manage-bookings lookup (blocks/booking-lookup, variant "my-bookings"): a valid search opens
   the same page on the site's www, without any of the entered data: www.lufthansa.com on
   lh-com, the brand's own www on a brand site (Discover's tour operator login on
   www.discover-airlines.com).
   Run: node --max-old-space-size=512 --test test/booking-lookup-my-bookings.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
const at = (pathname) => {
  window.location = {
    hostname: 'example.turnsthe.page', pathname, search: '', href: `https://example.turnsthe.page${pathname}`, origin: 'https://example.turnsthe.page', assign: (u) => { window.location.assigned = u; },
  };
};
at('/de/en/homepage');
globalThis.window = window;
globalThis.document = document;
const { default: decorate } = await import('../blocks/booking-lookup/booking-lookup.js');

/** Decorates a my-bookings block on a page, searches with a booking code and a last name. */
function search(meta, pathname) {
  document.head.innerHTML = meta;
  at(pathname);
  const block = document.createElement('div');
  block.className = 'booking-lookup my-bookings';
  block.innerHTML = '<div><div>Tab</div><div>My bookings</div></div>';
  document.body.replaceChildren(block);
  decorate(block);
  block.querySelector('input[name="reference"]').value = 'ABC123';
  block.querySelector('input[name="lastName"]').value = 'Muster';
  block.querySelector('form').dispatchEvent(new window.Event('submit', { cancelable: true }));
  return window.location.assigned;
}

test('lh-com: the same page on www.lufthansa.com, as before', () => {
  assert.equal(search('', '/de/en/book-and-manage/booking-services/manage-my-bookings'), 'https://www.lufthansa.com/de/en/book-and-manage/booking-services/manage-my-bookings');
});

test('a brand site: the same page on the brand\'s www, not on lufthansa.com', () => {
  assert.equal(search('<meta name="brand" content="discover">', '/de/en/profile/login/login-tour-operator-code'), 'https://www.discover-airlines.com/de/en/profile/login/login-tour-operator-code');
  assert.equal(search('<meta name="brand" content="discover">', '/de/de/profile/login/login-tour-operator-code'), 'https://www.discover-airlines.com/de/de/profile/login/login-tour-operator-code');
});
