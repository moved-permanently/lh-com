/* eslint-disable max-len, import/extensions */
/* Austrian's tab sets on phones (standing order 33, item 2): www's maui-tab-control-responsive opens no panel on a 390 first
   load (austrian-parity-019 travel-id, austrian-parity-020 austrian-app, online-check-in, unterhaltung-an-bord: none of
   the four opens an item). Brand austrian is now one of section-tabs.js's CLOSED_BRANDS, so below 768 px every accordion
   item starts closed; a page's "Tabs open | first" and a set's ", open first" still open the first. 390 against the first
   loads: austrian-app +9.33 -> +0.55 %, online-check-in +9.90 -> -1.69 %, unterhaltung-an-bord +56.6 -> +5.20 % (its film
   carousel note, an owner decision); travel-id unchanged (its own "Tabs open | none"); 1440 unchanged to the px.
   Run: node --max-old-space-size=512 --test test/austrian-tabs-closed-phones-so33.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head><meta name="brand" content="austrian"></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.matchMedia = () => ({
  matches: false, addEventListener: () => {}, addListener: () => {}, removeEventListener: () => {},
});
window.location = {
  hostname: 'austrian.turnsthe.page', pathname: '/at/en/austrian-app', search: '', hash: '', href: 'https://austrian.turnsthe.page/at/en/austrian-app', origin: 'https://austrian.turnsthe.page', toString() { return this.href; },
};
Object.defineProperty(window, 'origin', { value: 'https://austrian.turnsthe.page', configurable: true });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
globalThis.KeyboardEvent = window.KeyboardEvent || window.Event;

const { default: decorateSectionTabs } = await import('../scripts/section-tabs.js');

const page = (tabs = '1', meta = '') => {
  document.head.querySelector('meta[name="tabs-open"]')?.remove();
  if (meta) document.head.insertAdjacentHTML('beforeend', `<meta name="tabs-open" content="${meta}">`);
  const main = document.createElement('main');
  main.innerHTML = ['Check-in', 'Boarding pass', 'Seat'].map((t) => `<div class="section" data-section-status="initialized" data-tab="${t}" data-tabs="${tabs}"><div class="default-content-wrapper"><h2>${t}</h2></div></div>`).join('');
  document.body.replaceChildren(main);
  decorateSectionTabs(main);
  return [...main.querySelectorAll('.section-tab-toggle')].map((t) => t.getAttribute('aria-expanded'));
};

test('brand austrian on a phone: every item starts closed, as www\'s first loads', () => {
  assert.deepEqual(page(), ['false', 'false', 'false']);
});

test('a page\'s "Tabs open | first" and a set\'s ", open first" still open the first', () => {
  assert.deepEqual(page('1', 'first'), ['true', 'false', 'false']);
  assert.deepEqual(page('1, open first'), ['true', 'false', 'false']);
});
