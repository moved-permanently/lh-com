/* eslint-disable max-len */
/* Standing order 18, item 2: the Brussels overview hubs' card rows. On www the hubs whose intro sidebar opens a one-column
   view straight in the page container (pets, baggage, plan-your-trip: .onecolumn without .section, the column view 40 /
   20 px padding) put their rows of cards 97 px apart (shadow to picture), ours 81; meals' intro sits in an AEM section
   (.onecolumn.section, 32 / 32 px) and its rows are 81 apart, as ours. The documents tell them apart already: the
   importer gives the first kind's sidebar the option in-column (standing order after 570), meals' sidebar has none. So
   no new marker: from 768 px a card grid after another in a section with an in-column sidebar is 101 px under it
   (85 before). Measured on the 32 recorded Brussels pages at 1440: pets -2.43 -> -1.50 %, baggage -2.42 -> -1.50,
   plan-your-trip -1.17 -> -0.18, the rest unchanged (meals too). The 18 px more under the last row (www 126, ours 108)
   is not taken: it moved lounges +0.22 -> +1.56. Reads brussels.css as written.
   Run: node --max-old-space-size=256 --test test/brussels-hub-card-rows-so18.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('from 768 px a card grid after another in an in-column hub 101 px under it', () => {
  assert.ok(css.includes('@media (width >= 768px) { body.brand-brussels main > .section:has(> .columns-media-wrapper > .columns-media.sidebar.in-column) > .carousel-cards-wrapper + .carousel-cards-wrapper > .carousel-cards.grid { margin-top: 101px; } }'));
});

test('the other grids as before (85 px)', () => {
  assert.ok(css.includes('body.brand-brussels .carousel-cards-wrapper + .carousel-cards-wrapper > .carousel-cards.grid { margin-top: 85px; }'));
});
