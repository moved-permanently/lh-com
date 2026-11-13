/* eslint-disable max-len, import/extensions */
/* TAP row 150, it-it's inspiration page (/it-it/destinazioni/ispirati, live since 01:03 CET 2026-11-12): its slug was
   missing from INSPIRATION_SLUGS, so its category fragments built no country picker (row 137) and every country of the
   shown category stood one under the other: 8,450 px at 1440 and, since row 148 shows the first category on phones,
   8,427 at 390, where en-pt, pt-pt and fr-fr are 5,557 to 5,698 and 4,996 to 5,202. With the slug 5,626 and 5,039.
   Every root with an inspiration page in the imports: en-pt, pt-pt, pt-br, es-es, fr-fr, de-de, it-it.
   Run: node --max-old-space-size=512 --test test/tap-inspire-it-588.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body><main></main></body></html>');
window.location = { pathname: '/it-it/destinazioni/ispirati', hash: '' };
globalThis.window = window;
globalThis.document = document;

const tap = await import('../blocks/accordion-columns/accordion-columns-tap.js');

test('every imported inspiration page is one, it-it\'s too', () => {
  ['/en-pt/destinations/get-inspired', '/pt-pt/destinos/inspire-se', '/pt-br/destinos/inspire-se', '/es-es/destinos/inspirate', '/fr-fr/destinations/inspirez-vous', '/de-de/reiseziele/inspirieren', '/it-it/destinazioni/ispirati'].forEach((p) => assert.ok(tap.isInspirationPage(p), p));
});

test('a category fragment of it-it\'s page builds its country picker', () => {
  const main = document.createElement('main');
  main.innerHTML = '<div class="section"><div class="default-content-wrapper"><h3>Italia</h3></div><div class="accordion-columns-wrapper"><div class="accordion-columns faq">a</div></div>'
    + '<div class="default-content-wrapper"><h3>Brasile</h3></div><div class="accordion-columns-wrapper"><div class="accordion-columns faq">b</div></div></div>';
  tap.default(main.querySelector('.accordion-columns'));
  assert.deepEqual([...main.querySelectorAll('.faq-picker-tabs [role="tab"]')].map((t) => t.textContent), ['Italia', 'Brasile']);
});
