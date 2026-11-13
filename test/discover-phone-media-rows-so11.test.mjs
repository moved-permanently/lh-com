/* eslint-disable max-len */
/* Standing order 11 of 2026-11-12, item 3 (Discover): on phones a Columns Media block's rows are www's column views
   stacked one under the other; after a row with a picture www's next view starts about 26 px under it, ours 66 (the
   block's row gap). Measured on the 26 recorded Discover pages at 390 (full chrome, paired with a fresh baseline):
   with every row 26 px apart 4 better, 3 worse (families +3.4 / +2.7, customer-service +1.1: rows of two texts);
   after a row with a picture only: punta-cana 33.90 -> 18.17 and 40.74 -> 29.55, entertainment 31.25 -> 26.21 and
   21.86 -> 20.09, the rest unchanged (the offers page's capture flips on its own).
   Run: node --test test/discover-phone-media-rows-so11.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/discover.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('Discover on phones: a Columns Media row after a row with a picture 26 px under it', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-discover main .columns-media > .columns-media-row:has(> .columns-media-media) + .columns-media-row { margin-top: -40px; } }'));
});
