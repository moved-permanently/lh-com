/* eslint-disable max-len, import/extensions */
/* TAP's stopover partner regions (TAP row 147; tap-parity-009 /en-pt/stopover/partners at 1440): www's region panel lists
   the region's subcategories (Best offers, Restaurants and others, Hotels, Activities, Tours, Procurement and Services) as
   vertical tabs beside the chosen one's partners, one subcategory at a time (the FAQ picker's second level, as the
   inspiration pages' countries, row 137). Our region fragments (an H3 and a FAQ block per subcategory) showed every
   subcategory one under the other. A FAQ block in a fragment of a stopover partners page now builds that fragment's
   subcategory picker (accordion-columns-tap.js buildSubPicker); the Miles&Go partners page keeps its two-level picker.
   Run: node --max-old-space-size=512 --test test/tap-stopover-regions-588.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body><main></main></body></html>');
window.location = { pathname: '/en-pt/stopover/partners', hash: '' };
globalThis.window = window;
globalThis.document = document;

const tap = await import('../blocks/accordion-columns/accordion-columns-tap.js');

const fragment = () => {
  const main = document.createElement('main');
  main.innerHTML = '<div class="section">'
    + '<div class="default-content-wrapper"><h3 id="best-offers">Best offers</h3></div><div class="accordion-columns-wrapper"><div class="accordion-columns faq">a</div></div>'
    + '<div class="default-content-wrapper"><h3 id="hotels">Hotels</h3></div><div class="accordion-columns-wrapper"><div class="accordion-columns faq">b</div></div>'
    + '</div>';
  return main;
};

test('the stopover partners pages of the eight languages; Miles&Go\'s partners page is not one', () => {
  ['/en-pt/stopover/partners', '/pt-pt/stopover/parceiros', '/pt-br/stopover/parceiros', '/es-es/stopover/socios', '/fr-fr/stopover/partenaires', '/de-de/stopover/partner', '/it-it/stopover/partner', '/pl-pl/stopover/partnerzy'].forEach((p) => assert.ok(tap.isStopoverPartnersPage(p), p));
  assert.ok(!tap.isStopoverPartnersPage('/en-pt/miles-and-go/partners'));
  assert.ok(!tap.isStopoverPartnersPage('/en-pt/stopover'));
  assert.ok(tap.isPickerPage('/en-pt/miles-and-go/partners'), 'Miles&Go\'s picker as before');
  assert.ok(!tap.isPickerPage('/en-pt/stopover/partners'));
});

test('decorateTapFaq: in a region fragment the subcategory picker, the first subcategory shown; never on the page\'s own main', () => {
  const main = fragment();
  tap.default(main.querySelector('.accordion-columns'));
  const tabs = [...main.querySelectorAll('.faq-picker-tabs [role="tab"]')];
  assert.deepEqual(tabs.map((t) => t.textContent), ['Best offers', 'Hotels']);
  assert.deepEqual([...main.querySelectorAll('.faq-picker-questions > [role="tabpanel"]')].map((x) => x.hidden), [false, true]);
  const page = document.querySelector('main');
  page.innerHTML = fragment().innerHTML;
  tap.default(page.querySelector('.accordion-columns'));
  assert.ok(!page.querySelector('.faq-picker-tabs'), 'not in the page\'s main');
});
