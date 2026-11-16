/* eslint-disable max-len */
/* Standing order 54, item 4 (places 205 and 207 to 210, the Air Dolomiti homepages): the destinations slider ends as
   www's MiniCardSlider. www's newsletter heading stands 113 px under the cards' labels at 1440 (ours 79); at 390 its
   "vedi tutte" link 56 px under the labels and the heading 111 px under the link (ours 49 and 64). Below 1025 px the
   link 7 px lower and 98 px under it; from 1025 px (the link beside the heading) the section 82 px under the slider.
   Run: node --max-old-space-size=256 --test test/airdolomiti-destinations-end-so54.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('below 1025 px: the destinations link 7 px lower and www\'s space under it', () => {
  assert.ok(css.includes('@media (width < 1025px) { body.brand-airdolomiti main > .section > .carousel-cards-wrapper:has(> .carousel-cards.destinations) + .default-content-wrapper { margin-top: -27px; margin-bottom: 98px; } }'));
});

test('from 1025 px: the section 82 px under the slider, the link still placed from the section\'s end', () => {
  assert.ok(css.includes('@media (width >= 1025px) { body.brand-airdolomiti main > .section:has(> .carousel-cards-wrapper > .carousel-cards.destinations) { margin-bottom: 82px; } }'));
  assert.ok(css.includes('body.brand-airdolomiti main > .section > .carousel-cards-wrapper:has(> .carousel-cards.destinations) + .default-content-wrapper { top: auto; bottom: 630px; }'));
});

test('the promo slider\'s link keeps its -34 / 52 px', () => {
  assert.ok(css.includes('body.brand-airdolomiti main > .section > .carousel-cards-wrapper:has(> .carousel-cards:is(.promo, .destinations)) + .default-content-wrapper { margin-top: -34px; margin-bottom: 52px; }'));
});
