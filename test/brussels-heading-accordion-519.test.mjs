/* eslint-disable max-len */
/* The brief after 517, item 3 (Brussels against the recordings, brussels.turnsthe.page): an accordion straight under a section
   heading (www's "Good to know" / "Bon à savoir" questions): at 1440 www's first question sits 61 px under the heading's
   text (special-meals, both of its accordions), ours 48: the heading's 26 px margin, www 40. On 7 of the 8 recorded cases of
   an h2 directly followed by an accordion (special-meals 2, upgrades en and fr, cancel-and-refund-requests,
   travel-regulations, our-payment-methods) ours is 14 or 15 px short there; at 390 even (0, +1, -1 px). An h3 before an
   accordion is even at 1440 too (problems-with-your-baggage).
   Run: node --max-old-space-size=256 --test test/brussels-heading-accordion-519.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('from 768 px a section heading straight above an accordion keeps 40 px under it', () => {
  assert.match(css, /@media \(width >= 768px\) \{ body\.brand-brussels main \.default-content-wrapper:has\(\+ \.accordion-columns-wrapper\) > h2:last-child \{ margin-bottom: 40px; \} \}/);
});
