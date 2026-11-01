/* eslint-disable max-len */
/* The flight-search block with lufthansa.com's picker rows (blocks/flight-search/flight-search.js,
   picker-options.js): on gb/en the `Young adults | GB`, `Fare preference | yes` and empty
   `Adults hint` rows give the young adults' stepper, the fare selection and no adults hint, and
   the search hands off what www's sends (B15 after the adult, farePreference after the cabin); on
   de/de the same document shows no young adults. A block without the rows (ITA's, Austrian's,
   Brussels', Discover's documents) keeps its panel and handoff.
   Run: node --max-old-space-size=512 --test test/flight-search-picker-options-block.test.mjs */
/* global globalThis */
import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
const at = (host, pathname) => {
  window.location = {
    hostname: host, pathname, search: '', hash: '', href: `https://${host}${pathname}`, origin: `https://${host}`,
  };
};
at('main--lh-com--moved-permanently.aem.page', '/gb/en/homepage');
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
globalThis.Event = window.Event;
let submitted;
window.HTMLElement.prototype.submit = function submit() {
  submitted.push({
    action: this.getAttribute('action') || this.action,
    fields: Object.fromEntries([...this.querySelectorAll('input')].map((i) => [i.name, i.value])),
  });
};
beforeEach(() => {
  submitted = [];
  globalThis.fetch = async () => new Response('{}', { status: 404, headers: { 'content-type': 'application/json' } });
});

const { default: decorate } = await import('../blocks/flight-search/flight-search.js');
const WWW = JSON.parse(fs.readFileSync(new URL('./fixtures/lh-shop-handoff/www-searches.json', import.meta.url)));

const tick = () => new Promise((r) => { setImmediate(r); });
const flush = () => Array.from({ length: 20 }).reduce((p) => p.then(tick), Promise.resolve());

const LH_ROWS = [['Young adults', 'GB'], ['Fare preference', 'yes'], ['Adults hint', '']];
const blockOf = (rows) => {
  const block = document.createElement('div');
  block.className = 'flight-search';
  [['Default origin', 'London (LHR)'], ['Default destination', 'New York (NYC)'], ['Passenger picker', 'yes'], ...rows].forEach(([k, v]) => {
    const row = document.createElement('div');
    row.innerHTML = `<div>${k}</div><div>${v}</div>`;
    block.append(row);
  });
  document.body.replaceChildren(block);
  return block;
};
const search = async (rows, steps = () => {}) => {
  const block = blockOf(rows);
  decorate(block);
  await flush();
  steps(block);
  const form = block.querySelector('form');
  const date = form.querySelector('input[type="date"], input[name="departureDate"], .flight-search-date input');
  date.value = '2026-11-21';
  form.dataset.tripType = 'ONE_WAY';
  form.dispatchEvent(new window.Event('submit', { cancelable: true }));
  await flush();
  return { block, handoff: submitted[0] };
};
const more = (block, type) => block.querySelector(`.flight-search-passenger-${type} .flight-search-passenger-more`);
const choose = (block, code) => {
  const radio = block.querySelector(`.flight-search-fare input[value="${code}"]`);
  radio.checked = true;
  radio.dispatchEvent(new window.Event('change', { bubbles: true }));
};

test('gb/en with the rows: young adults, the fare selection, no adults hint', async () => {
  at('main--lh-com--moved-permanently.aem.page', '/gb/en/homepage');
  const block = blockOf(LH_ROWS);
  decorate(block);
  await flush();
  assert.ok(block.querySelector('.flight-search-passenger-young-adults'));
  assert.ok(block.querySelector('.flight-search-fare'));
  assert.equal(block.querySelector('.flight-search-passenger-adults .flight-search-passenger-hint'), null);
});

test('gb/en: one young adult, a child and coupon hand off as www\'s search', async () => {
  at('main--lh-com--moved-permanently.aem.page', '/gb/en/homepage');
  const www = WWW['gb-en-young-adult-child-coupon'];
  const { handoff } = await search(LH_ROWS, (block) => {
    more(block, 'young-adults').click();
    more(block, 'children').click();
    choose(block, 'COUPON');
  });
  assert.equal(handoff.action, www.action);
  assert.equal(handoff.fields.search, www.fields.search);
});

test('de/de with the same rows: no young adults (GB only), the fare selection', async () => {
  at('main--lh-com--moved-permanently.aem.page', '/de/de/homepage');
  const block = blockOf(LH_ROWS);
  decorate(block);
  await flush();
  assert.equal(block.querySelector('.flight-search-passenger-young-adults'), null);
  assert.ok(block.querySelector('.flight-search-fare'));
});

test('without the rows: the panel and the handoff as before', async () => {
  at('main--lh-com--moved-permanently.aem.page', '/gb/en/homepage');
  const { block, handoff } = await search([], (b) => more(b, 'children').click());
  assert.equal(block.querySelector('.flight-search-passenger-young-adults'), null);
  assert.equal(block.querySelector('.flight-search-fare'), null);
  assert.ok(block.querySelector('.flight-search-passenger-adults .flight-search-passenger-hint'));
  const s = JSON.parse(handoff.fields.search);
  assert.deepEqual(s.travelers.map((t) => t.passengerTypeCode), ['ADT', 'CHD']);
  assert.deepEqual(Object.keys(s), ['itineraries', 'travelers', 'cabin', 'portalFacts']);
});
