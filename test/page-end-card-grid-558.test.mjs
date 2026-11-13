/* eslint-disable max-len */
/* lufthansa.com on phones: a padded campaign section that ends the page with a Carousel Cards grid (brief 558 item 4,
   /<root>/lufthansa-travel-classes' "Discover more" cards on de/en, de/de, at/de, gb/en, the only such documents
   among the hub, campaign and info pages): www's footer starts 81 px under the last card's text at 390
   (lh-parity-004a), ours 49. Below 768 px 32 px under such a grid; phone-slider grids and 768 px up as before.
   Run: node --max-old-space-size=256 --test test/page-end-card-grid-558.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/carousel-cards/carousel-cards.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('below 768 px a page-ending card grid in a padded campaign section: 32 px under it', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-lufthansa main > .section.campaign-section.padded:last-of-type > .carousel-cards-wrapper:last-child > .carousel-cards.grid:not(.phone-slider) { margin-bottom: 32px; } }'));
});
