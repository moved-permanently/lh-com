/* eslint-disable max-len */
/* lufthansa.com: a teaser grid right after a heading on phones (brief 467). Below 768 px our grid
   started 60 px under the heading (the heading's 28 px margin and the grids' 32 px top padding,
   measured at 1440), www's 40 px (its column view has no top padding on phones, its items 12 px):
   /de/en/baggage's three grids 34 px low each at 390. A grid (not overlay, not spacious) right
   after a default-content wrapper that ends with a heading now starts 12 px under it below
   768 px; after a text, at 768 and 1440, and in other brands as before.
   Brief 556: lh-parity-004a's recordings at 390 (gb/en baggage, de/de gepaeck) put the first picture
   13 to 14 px nearer the heading than the 12 px did, on all three grids: no top padding.
   Run: node --max-old-space-size=256 --test test/grid-under-heading-467.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/cards-teaser/cards-teaser.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('below 768 px, a grid right after a heading: no top padding', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-lufthansa main .default-content-wrapper:has(> :is(h2, h3, h4, h5, h6):last-child) + .cards-teaser-wrapper > .cards-teaser:not(.overlay, .spacious) > ul { padding-top: 0; } }'));
});
