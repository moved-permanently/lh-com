/* eslint-disable max-len, import/extensions */
/* TAP's category tab sets on phones (TAP row 148; tap-parity-009 /en-pt/stopover/partners and tap-parity-004 get-inspired at
   390): www's CategoryAccordion keeps its pills below lg, the first category shown under them; ours made the set an
   accordion of closed toggles (brand tap's tab sets closed on phones, from www's content tabs). A set named "categories"
   on brand tap now stays tabs below 768 px (section-tabs.js TAB_SETS_ON_PHONES): its tab list, one panel shown, no
   toggles shown. Every other set and brand as before.
   Run: node --max-old-space-size=512 --test test/tap-category-tabs-phones-588.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head><meta name="brand" content="tap"></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.matchMedia = () => ({
  matches: false, addEventListener: () => {}, addListener: () => {}, removeEventListener: () => {},
});
window.location = {
  hostname: 'tap.turnsthe.page', pathname: '/en-pt/stopover/partners', search: '', hash: '', href: 'https://tap.turnsthe.page/en-pt/stopover/partners', origin: 'https://tap.turnsthe.page', toString() { return this.href; },
};
Object.defineProperty(window, 'origin', { value: 'https://tap.turnsthe.page', configurable: true });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
globalThis.KeyboardEvent = window.KeyboardEvent || window.Event;

const { default: decorateSectionTabs } = await import('../scripts/section-tabs.js');

const page = (name) => {
  const main = document.createElement('main');
  main.innerHTML = ['Azores', 'Alentejo', 'Algarve'].map((t) => `<div class="section" data-section-status="initialized" data-tab="${t}" data-tabs="${name}"><div class="default-content-wrapper"><h2>${t}</h2></div></div>`).join('');
  document.body.replaceChildren(main);
  return main;
};

test('brand tap, a "categories" set on a phone: the tab list, the first panel shown, no toggle shown', () => {
  const main = page('categories');
  decorateSectionTabs(main);
  assert.ok(main.querySelector('.section.section-tabs.section-tabs-always'));
  const panels = [...main.querySelectorAll('.section-tab-panel')];
  assert.deepEqual(panels.map((x) => x.classList.contains('section-tab-always')), [true, true, true]);
  assert.deepEqual(panels.map((x) => x.hidden), [false, true, true]);
  assert.deepEqual(panels.map((x) => x.classList.contains('section-tab-closed')), [false, false, false]);
  const tabs = [...main.querySelectorAll('[role="tab"]')];
  tabs[2].dispatchEvent(new window.Event('click'));
  assert.deepEqual(panels.map((x) => x.hidden), [true, true, false], 'a tab shows its panel');
});

test('brand tap, another set on a phone: closed accordion items as before', () => {
  const main = page('1');
  decorateSectionTabs(main);
  assert.equal(main.querySelector('.section-tabs-always'), null);
  const panels = [...main.querySelectorAll('.section-tab-panel')];
  assert.deepEqual(panels.map((x) => x.classList.contains('section-tab-closed')), [true, true, true]);
});
