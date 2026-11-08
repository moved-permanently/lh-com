/* eslint-disable max-len */
/* The brief after 475, item 4 (fly-with-austrian at 390, austrian-parity-001): www stacks the nine reason cards (only "This
   may also interest you" is a phone slider, which a re-import with the Austrian importer already gives: data-import-phone-slider).
   Stacked, www's teasers are 68 px apart (the teaser's 4.4rem + the column-view item's 1.2rem margin and 1.2rem padding below
   768 px) and the next three-column view 77 px below; ours 40 and 64 (the block's lufthansa.com values): 35 px short per card.
   Run: node --max-old-space-size=256 --test test/austrian-stacked-cards.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('below 768 px stacked grid cards 68 px apart, the next grid 77 px below', () => {
  assert.match(css, /@media \(width < 768px\) \{ body\.brand-austrian \.carousel-cards\.grid:not\(\.phone-slider\) \.carousel-cards-track \{ gap: 68px; \} body\.brand-austrian \.carousel-cards-wrapper \+ \.carousel-cards-wrapper > \.carousel-cards\.grid:not\(\.phone-slider\) \{ margin-top: 77px; \} \}/);
});
