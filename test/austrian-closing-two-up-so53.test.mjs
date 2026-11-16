/* eslint-disable max-len */
/* Standing order 53, item 1 (places 152 and 156, /at/en/baggage and /at/de/gepaeck at 390): a two-up teaser grid that
   closes the page, stacked below 768 px. www's stylesheet keeps the teaser's 4.4rem under the last card, plus 1.2rem +
   1.2rem for the empty second column of a single-card row, on top of the column view's 3.2rem padding. www's footer is
   149 px under the lone card (austrian-parity-019 and -003), ours 80. Below 768 px: 76 px under such a grid, 100 when its
   last row has one card. 768 px and up, three-column grids and phone sliders as before.
   Run: node --max-old-space-size=256 --test test/austrian-closing-two-up-so53.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const END = 'body.brand-austrian main > .section:not(.grey):last-child > .carousel-cards-wrapper:last-child';

test('below 768 px a page-closing two-up grid: the teaser\'s 44 px under the column view\'s 32', () => {
  assert.ok(css.includes(`@media (width < 768px) { ${END}:has(> .carousel-cards.grid.two-up:not(.phone-slider)) { padding-bottom: 76px; }`));
});

test('a lone card in its last row: the empty column\'s 24 px too', () => {
  assert.ok(css.includes(`${END}:has(> .carousel-cards.grid.two-up:not(.phone-slider) .carousel-cards-slide:nth-child(odd):last-child) { padding-bottom: 100px; } }`));
});

test('the column view\'s 32 px at every width stays, and no other page-end rule sets 76 or 100 px', () => {
  assert.ok(css.includes(`${END}:has(> .carousel-cards.grid) { padding-bottom: 32px; }`));
  const rules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].filter((m) => /padding-bottom: (76|100)px/.test(m[2]));
  assert.equal(rules.length, 2);
  rules.forEach((m) => assert.ok(m[1].includes('.two-up:not(.phone-slider)'), m[1]));
});
