/* eslint-disable max-len, import/extensions */
/* TAP's inspiration countries beside their articles (the standing order of the night of 2026-11-10, item e; TAP row 137;
   tap-parity-004 /en-pt/destinations/get-inspired at 1440): www lists a category's countries on the left (its FAQ picker's
   second level: vertical tabs, the chosen one green) beside the chosen country's articles, one country at a time. Our
   category fragments (an H3 and a FAQ block per country) showed every country one under the other. A FAQ block in a
   fragment of an inspiration page now builds that fragment's subcategory picker (accordion-columns-tap.js buildSubPicker:
   the FAQ page's classes and look, tabs and a select); the FAQ and partners pages as before.
   Run: node --max-old-space-size=512 --test test/tap-inspire-countries-585.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body><main></main></body></html>');
window.location = { pathname: '/en-pt/destinations/get-inspired', hash: '' };
globalThis.window = window;
globalThis.document = document;

const tap = await import('../blocks/accordion-columns/accordion-columns-tap.js');

const fragment = () => {
  const main = document.createElement('main');
  main.innerHTML = '<div class="section">'
    + '<div class="default-content-wrapper"><h3 id="germany">Germany</h3></div><div class="accordion-columns-wrapper"><div class="accordion-columns faq">a</div></div>'
    + '<div class="default-content-wrapper"><h3 id="brazil">Brazil</h3></div><div class="accordion-columns-wrapper"><div class="accordion-columns faq">b</div></div>'
    + '</div>';
  return main;
};

test('the inspiration slugs; the FAQ and partners pages are not among them', () => {
  ['/en-pt/destinations/get-inspired', '/pt-pt/destinos/inspire-se', '/es-es/destinos/inspirate', '/fr-fr/destinations/inspirez-vous', '/de-de/reiseziele/inspirieren'].forEach((p) => assert.ok(tap.isInspirationPage(p), p));
  assert.ok(!tap.isInspirationPage('/en-pt/help/frequently-asked-questions'));
  assert.ok(!tap.isInspirationPage('/en-pt/miles-and-go/partners'));
});

test('a fragment\'s countries as vertical tabs and a select beside their questions, the first shown', () => {
  const main = fragment();
  tap.buildSubPicker(main);
  const tabs = [...main.querySelectorAll('.faq-picker-tabs [role="tab"]')];
  assert.deepEqual(tabs.map((t) => t.textContent), ['Germany', 'Brazil']);
  assert.deepEqual(tabs.map((t) => t.getAttribute('aria-selected')), ['true', 'false']);
  assert.equal(main.querySelectorAll('.faq-picker-select option').length, 2);
  const panels = [...main.querySelectorAll('.faq-picker-questions > [role="tabpanel"]')];
  assert.equal(panels.length, 2);
  assert.deepEqual(panels.map((x) => x.hidden), [false, true]);
  assert.ok(main.querySelector('.section.faq-picker-section'));
  tabs[1].dispatchEvent(new window.Event('click'));
  assert.deepEqual(panels.map((x) => x.hidden), [true, false], 'a click shows its country');
  tap.buildSubPicker(main);
  assert.equal(main.querySelectorAll('.faq-picker-tabs').length, 1, 'once');
});

test('decorateTapFaq: in a fragment of an inspiration page the subcategory picker, never on the page\'s own main', () => {
  const main = fragment();
  tap.default(main.querySelector('.accordion-columns'));
  assert.ok(main.querySelector('.faq-picker-tabs'), 'in the fragment');
  const page = document.querySelector('main');
  page.innerHTML = fragment().innerHTML;
  tap.default(page.querySelector('.accordion-columns'));
  assert.ok(!page.querySelector('.faq-picker-tabs'), 'not in the page\'s main');
});
