/* eslint-disable max-len */
/* The brief after 521, item 2 (Austrian against the recordings): a page whose title stands alone in the first section and whose
   next section opens with a card grid (www's .contentpage h1, then a column view of boxed teasers: /at/de/check-in,
   /at/de/familien and their nine language copies each, 20 documents). www has the column view's 3.2rem padding between
   them: the title's text to the first card's picture 107 px at 1440 and 91 px at 390; ours 75 and 61 (the rule for a
   grid after text in the same section, test/austrian-title-cards-spacing.test.mjs, does not reach a grid that opens the
   next section). Now that grid keeps the column view's 32 px above it.
   Run: node --max-old-space-size=256 --test test/austrian-title-cards-522.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('a card grid opening the section after the page title\'s own section: the column view\'s 32 px above it', () => {
  assert.match(css, /body\.brand-austrian main > \.section:has\(> \.default-content-wrapper:last-child > h1:only-child\) \+ \.section:not\(\.grey\) > \.carousel-cards-wrapper:first-child:has\(> \.carousel-cards\.grid\) \{ padding-top: 32px; \}/);
});
