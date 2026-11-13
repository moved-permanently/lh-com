/* eslint-disable max-len */
/* Brief 582 item d: what accordion-columns' 12px title padding hid on faq-saf. With www's 20px inset the titles wrap
   line for line as www's (35 lines, ours 33 before), and the page showed the two section gaps it had made up for: the
   first question 16px lower than www's at 390 (8 at 1440: our 48px section gap after a title-only section, www the
   title's own margin) and the space under the last question. The first one is a rule (a section ending with its H1
   right before a section opening with an accordion: no section gap); the end gap is not (12 pages, mixed: net +6.5
   points at 390, 1440 mostly worse). The inset then takes option faq too, not faq limited-width.
   Run: node --max-old-space-size=256 --test test/accordion-under-title-582.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const flat = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('a title-only section right before an accordion section: no section gap', () => {
  assert.ok(flat('../styles/styles.css').includes('body.brand-lufthansa main > .section:has(> .default-content-wrapper:last-child > h1:last-child):has(+ .section > .accordion-columns-wrapper:first-child) { margin-bottom: 0; }'));
});

test('the phone inset for option spaced and option faq, not faq limited-width', () => {
  const css = flat('../blocks/accordion-columns/accordion-columns.css');
  assert.ok(css.includes('body.brand-lufthansa .accordion-columns:is(.spaced, .faq:not(.limited-width)) .accordion-columns-title { padding-right: 56px; padding-left: 20px; }'));
});
