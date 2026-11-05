/* eslint-disable max-len */
/* The flight search's date fields (blocks/flight-search/flight-search.js), every brand: one Tab
   stop per date, as www's flight manager has one stop for its field (the parity captures'
   shadow HTML: a readonly text input "Departure - Return" and its "Select date" button). Each
   date shows as a readonly text field named by its label; Enter, Space, Alt+Down or a click opens
   the browser's calendar of the date input behind it (showPicker: the arrow keys move between the
   days, Enter picks one, Escape closes); Delete or Backspace clears it. The date input keeps the
   value (the hand-off as before) out of the Tab order. The chosen date shows in the page's
   language. Values compared as strings and booleans, never as DOM nodes.
   Run: node --max-old-space-size=256 --test test/flight-search-dates.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
const at = (host, pathname, brand, search = '') => {
  window.location = {
    hostname: host, pathname, search, hash: '', href: `https://${host}${pathname}${search}`, origin: `https://${host}`,
  };
  document.head.innerHTML = brand ? `<meta name="brand" content="${brand}">` : '';
  document.documentElement.lang = pathname.split('/')[2] || 'en';
};
at('main--lh-com--moved-permanently.aem.page', '/de/en/homepage', null);
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
window.history = { replaceState: () => {} };
globalThis.window = window;
globalThis.document = document;
globalThis.Event = window.Event;
beforeEach(() => {
  globalThis.fetch = async () => new Response('{}', { status: 404, headers: { 'content-type': 'application/json' } });
});

const { default: decorate } = await import('../blocks/flight-search/flight-search.js');

const tick = () => new Promise((r) => { setImmediate(r); });
const flush = () => Array.from({ length: 20 }).reduce((p) => p.then(tick), Promise.resolve());
const built = async (rows = []) => {
  const block = document.createElement('div');
  block.className = 'flight-search';
  [['Default origin', 'Frankfurt (FRA)'], ...rows].forEach(([k, v]) => {
    const row = document.createElement('div');
    row.innerHTML = `<div>${k}</div><div>${v}</div>`;
    block.append(row);
  });
  document.body.replaceChildren(block);
  decorate(block);
  await flush();
  return block;
};
const key = (node, k, extra = {}) => {
  const e = new window.Event('keydown', { bubbles: true, cancelable: true });
  e.key = k;
  Object.assign(e, extra);
  node.dispatchEvent(e);
  return e;
};
const parts = (block, name) => {
  const field = block.querySelector(`.flight-search-date.flight-search-${name}`);
  return {
    field,
    native: field.querySelector('input[type="date"]'),
    shown: field.querySelector('input.flight-search-date-value'),
  };
};

test('one Tab stop per date: a readonly field named by its label; the date input out of the Tab order', async () => {
  const block = await built();
  ['departure', 'return'].forEach((name) => {
    const { native, shown } = parts(block, name);
    assert.ok(shown, `${name}: the field`);
    assert.equal(shown.type, 'text');
    assert.equal(shown.readOnly, true);
    assert.equal(shown.hasAttribute('tabindex'), false, 'in the Tab order');
    assert.equal(native.getAttribute('tabindex'), '-1');
    assert.equal(native.getAttribute('aria-hidden'), 'true');
    assert.equal(native.name, name, 'the value stays in the date input');
    const label = document.getElementById(shown.getAttribute('aria-labelledby'));
    assert.equal(label ? label.textContent : '', name === 'departure' ? 'Departure' : 'Return');
  });
  const stops = [...block.querySelectorAll('.flight-search-dates input, .flight-search-dates button')]
    .filter((e) => e.getAttribute('tabindex') !== '-1' && !e.disabled);
  assert.equal(stops.length, 2, 'two stops for the two dates');
});

test('Enter, Space, Alt+Down and a click open the calendar; other keys do nothing', async () => {
  const block = await built();
  const { native, shown } = parts(block, 'departure');
  let opened = 0;
  native.showPicker = () => { opened += 1; };
  assert.equal(key(shown, 'Enter').defaultPrevented, true);
  key(shown, ' ');
  key(shown, 'ArrowDown', { altKey: true });
  shown.click();
  assert.equal(opened, 4);
  assert.equal(key(shown, 'Tab').defaultPrevented, false, 'Tab moves on');
  key(shown, 'a');
  assert.equal(opened, 4);
});

test('without showPicker (an older browser) a click still reaches the date input', async () => {
  const block = await built();
  const { native, shown } = parts(block, 'departure');
  let clicked = 0;
  native.showPicker = undefined;
  native.click = () => { clicked += 1; };
  shown.click();
  assert.equal(clicked, 1);
});

test('the chosen date shows in the page\'s language; Delete clears it; the return follows the departure', async () => {
  at('main--lh-com--moved-permanently.aem.page', '/de/de/homepage', null);
  let block = await built();
  let dep = parts(block, 'departure');
  const ret = parts(block, 'return');
  dep.native.value = '2026-11-21';
  dep.native.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(dep.shown.value, '21.11.2026');
  ret.native.value = '2026-11-28';
  ret.native.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(ret.shown.value, '28.11.2026');
  dep.native.value = '2026-12-01';
  dep.native.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(ret.native.value, '', 'a return before the departure goes');
  assert.equal(ret.shown.value, '');
  key(dep.shown, 'Delete');
  assert.equal(dep.native.value, '');
  assert.equal(dep.shown.value, '');
  at('main--lh-com--moved-permanently.aem.page', '/gb/en/homepage', null);
  block = await built();
  dep = parts(block, 'departure');
  dep.native.value = '2026-11-21';
  dep.native.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(dep.shown.value, '21/11/2026', 'en-GB');
  at('brussels.turnsthe.page', '/be/fr/homepage', 'brussels');
  block = await built();
  dep = parts(block, 'departure');
  dep.native.value = '2026-11-21';
  dep.native.dispatchEvent(new window.Event('change', { bubbles: true }));
  assert.equal(dep.shown.value, '21/11/2026', 'fr');
});

test('a date from the page URL shows in its field', async () => {
  at('main--lh-com--moved-permanently.aem.page', '/de/en/homepage', null, '?DepartureDate=2030-05-04&ReturnDate=2030-05-11');
  const block = await built();
  assert.equal(parts(block, 'departure').native.value, '2030-05-04');
  assert.equal(parts(block, 'departure').shown.value, '04/05/2030');
  assert.equal(parts(block, 'return').shown.value, '11/05/2030');
  at('main--lh-com--moved-permanently.aem.page', '/de/en/homepage', null);
});
