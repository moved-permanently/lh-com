/* eslint-disable max-len -- dev tooling */
/* Brief 505 (the parity re-check's open row, Brussels overview pages): www.brusselsairlines.com's overview pages (an
   intro in a sidebar, then the teaser card grids: /be/en/special-care/special-assistance, /be/fr/special-care/pets …)
   leave 103 to 118 px from the intro to the first card at 1440 on 11 of the 16 recorded pages (390: 109 to 132), ours
   68 (390: 54). The first card grid right after a sidebar intro gets www's space: 40 px more from 768 px, 64 below (80 / 60 px: the margins collapse)
   (measured on the recordings; meals and lounges are 74 to 92 px on www, families-and-children 149 to 155: no one
   rule fits those, the median it is). The space below the last grid varies on www (52 to 233 px): not ruled.
   Run: node --test test/brussels-overview-gap-505.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('the first card grid after a sidebar intro: 80 px on phones, 60 px from 768 px, 40 / 64 more than the grid margin of today (Brussels only)', () => {
  assert.match(css, /body\.brand-brussels main > \.section > \.columns-media-wrapper:has\(> \.columns-media\.sidebar\) \+ \.carousel-cards-wrapper > \.carousel-cards\.grid \{ margin-top: 80px; \}/);
  assert.match(css, /@media \(width >= 768px\) \{[^@]*body\.brand-brussels main > \.section > \.columns-media-wrapper:has\(> \.columns-media\.sidebar\) \+ \.carousel-cards-wrapper > \.carousel-cards\.grid \{ margin-top: 60px; \}/);
});
