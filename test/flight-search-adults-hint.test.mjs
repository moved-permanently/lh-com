/* The passenger picker's adults: no hint by default, in every language. www shows none under the
   adults on lufthansa.com's four roots and on ITA's, Austrian's, Brussels', Discover's and Air
   Dolomiti's sites (checked 2026-11-01); an `Adults hint` row with a text adds one, an empty one
   (lufthansa.com's documents) leaves it out as the default does. The other hints stay.
   Run: node --max-old-space-size=512 --test test/flight-search-adults-hint.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
const at = (host, pathname) => {
  window.location = {
    hostname: host, pathname, search: '', hash: '', href: `https://${host}${pathname}`, origin: `https://${host}`,
  };
};
at('main--lh-ita--moved-permanently.aem.page', '/it/en/homepage');
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
globalThis.Event = window.Event;
beforeEach(() => {
  globalThis.fetch = async () => new Response('{}', { status: 404, headers: { 'content-type': 'application/json' } });
});

const { PASSENGER_LABELS, createPassengerPicker } = await import('../blocks/flight-search/passenger-picker.js');
const { default: decorate } = await import('../blocks/flight-search/flight-search.js');

const tick = () => new Promise((r) => { setImmediate(r); });
const flush = () => Array.from({ length: 20 }).reduce((p) => p.then(tick), Promise.resolve());
const blockOf = (rows) => {
  const block = document.createElement('div');
  block.className = 'flight-search';
  [['Passenger picker', 'yes'], ...rows].forEach(([k, v]) => {
    const row = document.createElement('div');
    row.innerHTML = `<div>${k}</div><div>${v}</div>`;
    block.append(row);
  });
  document.body.replaceChildren(block);
  return block;
};
const hintOf = (root, type) => {
  const hint = root.querySelector(`.flight-search-passenger-${type} .flight-search-passenger-hint`);
  return hint && hint.textContent;
};

test('every language: no adults hint; the children\'s and infants\' hints stay', () => {
  Object.entries(PASSENGER_LABELS).forEach(([lang, labels]) => {
    assert.equal(labels['adults hint'], '', lang);
    assert.ok(labels['children hint'], lang);
    assert.ok(labels['infants hint'], lang);
  });
});

test('the picker with the built-in texts: the adults without a hint', () => {
  const { element } = createPassengerPicker({ labels: PASSENGER_LABELS.it, cabins: ['E'], value: { adults: 1, cabin: 'E' } });
  assert.equal(hintOf(element, 'adults'), null);
  assert.equal(hintOf(element, 'children'), PASSENGER_LABELS.it['children hint']);
  assert.equal(hintOf(element, 'infants'), PASSENGER_LABELS.it['infants hint']);
});

test('a block without an Adults hint row (the brands\' documents): no adults hint', async () => {
  const block = blockOf([['Traveller label', 'Economy, 1 traveller']]);
  decorate(block);
  await flush();
  assert.ok(block.querySelector('.flight-search-passenger-adults'));
  assert.equal(hintOf(block, 'adults'), null);
  assert.equal(hintOf(block, 'children'), PASSENGER_LABELS.en['children hint']);
});

test('an Adults hint row with a text adds it; an empty one leaves it out', async () => {
  const hinted = blockOf([['Adults hint', '12+']]);
  decorate(hinted);
  await flush();
  assert.equal(hintOf(hinted, 'adults'), '12+');
  const empty = blockOf([['Adults hint', '']]);
  decorate(empty);
  await flush();
  assert.equal(hintOf(empty, 'adults'), null);
});
