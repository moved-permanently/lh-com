/* eslint-disable max-len */
/* The brief after 527, item 2 (Austrian against the recordings, austrian.turnsthe.page): below 768 px a two-up card grid right
   after another (www's two-column views of boxed teasers, one view per row: /at/en/book/additional-services/extra-services'
   five, check-in's and familien's two) is 42 px further from it on www than ours on every recorded case: the pictures' pitch
   across the break www 598 / 625 / 571 px, ours 548 / 575 / 521 (the card itself 8 px taller on www, inside the break 42
   more: the next view's own row padding). 12 Austrian documents have such pairs (42 pairs). Now the later grid gets those
   42 px on top of the gap it has.
   Run: node --max-old-space-size=256 --test test/austrian-two-up-rows-530.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('below 768 px a two-up grid right after another: 42 px more above it', () => {
  assert.match(css, /@media \(width < 768px\) \{ body\.brand-austrian \.carousel-cards-wrapper:has\(> \.carousel-cards\.grid\.two-up\) \+ \.carousel-cards-wrapper > \.carousel-cards\.grid\.two-up \{ padding-top: 42px; \} \}/);
});
