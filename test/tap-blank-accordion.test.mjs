/* eslint-disable max-len */
/* The brief after 484, item C: TAP's empty line <p><sub>{blank}</sub></p> showed its word in Accordion Columns panels (336 of
   the 487: 63 fragments and 16 pages, e.g. /fr-fr/destinations/inspirez-vous) once a panel opens; the theme hid it in cards
   only, with p:has(> sub:only-child), which in panels would hide real subscript paragraphs too (an agency's note). Now
   scripts.js marks the paragraph p.blank-line (its word removed, aria-hidden) and tap.css draws it 24 px high in panels.
   Run: node --max-old-space-size=256 --test test/tap-blank-accordion.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BLANK_LINE } from '../scripts/style-markers.js';

const read = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8');

test('the marker: a paragraph of only {blank}; a real subscript is no marker', () => {
  assert.ok(BLANK_LINE.test('{blank}'));
  assert.ok(BLANK_LINE.test(' {blank} '));
  assert.ok(!BLANK_LINE.test('(1)'));
  assert.ok(!BLANK_LINE.test('Si votre réservation a été effectuée via une agence {blank}'));
});

test('scripts.js: p.blank-line, the word removed, hidden from assistive tech', () => {
  const js = read('../scripts/scripts.js').replace(/\s+/g, ' ');
  assert.match(js, /if \(BLANK_LINE\.test\(p\.textContent\) && p\.querySelector\(':scope > sub'\)\) \{ p\.querySelector\(':scope > sub'\)\.textContent = ''; p\.classList\.add\('blank-line'\); p\.setAttribute\('aria-hidden', 'true'\); return; \}/);
});

test('tap.css: the line in Accordion Columns panels, 24 px', () => {
  const css = read('../styles/themes/tap.css').replace(/\s+/g, ' ');
  assert.match(css, /body\.brand-tap main \.accordion-columns p\.blank-line \{ height: 24px; margin: 0; overflow: hidden; line-height: 24px; \}/);
});
