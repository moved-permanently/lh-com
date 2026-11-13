/* eslint-disable max-len */
/* Standing order 10 of 2026-11-12, item 3 (Discover): pictures in an accordion panel (families' "Baggage regulations for
   children": two pictures in a two-column view under the text) sit in www's column view: at 1440 93 px from the text's
   last line to the pictures and 76 px from them to the next item's rule (ours 54 and 21), at 390 the stacked pictures
   46 px apart (ours 24), 73 px under the text and 57 over the next item (ours 54 and 21). The panel's picture grid now
   has that spacing. Measured on the 26 recorded Discover pages (52 page-widths, full chrome, against a fresh baseline):
   families de/de 1440 28.66 -> 14.04, 390 25.21 -> 17.78, de/en 35.55 -> 28.41, 24.77 -> 17.41; nothing else moved but the
   homepage, which a paired run put 1.0 better at 390, and the offers page, whose capture flips between 2,300 and 20,000 px
   with or without the rule.
   Run: node --test test/discover-panel-grids-so10.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/discover.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('Discover: an accordion panel\'s picture grid spaced as www\'s column view', () => {
  assert.ok(css.includes('body.brand-discover .accordion-columns .accordion-columns-grid { row-gap: 46px; margin-top: 55px; margin-bottom: 36px; }'));
  assert.ok(css.includes('@media (width >= 768px) { body.brand-discover .accordion-columns .accordion-columns-grid { row-gap: 32px; margin-top: 75px; margin-bottom: 55px; } }'));
});
