/* eslint-disable max-len */
/* The brief after 517, item 3 (Austrian against the recordings, austrian.turnsthe.page): an accordion in a text column (parser
   option spaced) sits 45 px under the text before it on www.austrian.com at 1440 (the last text line's foot to the first
   question's text: gesundes-reisen 45, bearbeitungsgebuehren 45), as at 390; ours 84 to 86 px from 768 px: lh-com's spaced
   rule adds 40 px above there (lufthansa.com's maui-collapsible margin 4rem). Below the accordion ours already matches
   (79 / 80 px). On the 8 recorded documents with such accordions (gesundes-reisen 6, travelling-with-animals 8, missing-baggage
   3, bearbeitungsgebuehren 2, faq, online-check-in, international-lounges, doctor-on-board-news) every one 36 to 48 px low.
   Run: node --max-old-space-size=256 --test test/austrian-spaced-accordion-519.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const block = fs.readFileSync(new URL('../blocks/accordion-columns/accordion-columns.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('Austrian\'s spaced accordion: none of lh-com\'s 40 px above from 768 px', () => {
  assert.match(css, /@media \(width >= 768px\) \{ body\.brand-austrian \.accordion-columns\.spaced \{ padding-top: 0; \} \}/);
});

test('lh-com\'s rule unchanged (lufthansa.com keeps its 40 px), and the space below as it was', () => {
  assert.match(block, /@media \(width >= 768px\) \{ \.accordion-columns\.spaced \{ padding-top: 40px; \} \}/);
  assert.match(block, /\.accordion-columns\.spaced \{ padding-bottom: 40px; \}/);
  assert.doesNotMatch(css, /\.accordion-columns\.spaced \{[^}]*padding-bottom/);
});
