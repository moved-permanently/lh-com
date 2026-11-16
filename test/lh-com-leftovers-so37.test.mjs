/* eslint-disable max-len */
/* Standing order 37 of 2026-11-16, item 2 (delta-so37-lh-com-rows.txt):
   - Carousel Lightbox: a wide slideshow right under its heading 25px under it and 50px to the next heading
     (/de/en/discover-lufthansa/lufthansa-fleet/351 1440 11.76 -> 7.22 %, 390 13.68 -> 8.66 %);
   - section style gap-after-small-768: gap-after-small's 24px from 768px only, set by one row
     (/de/en/advance-seat-reservations-terms-and-conditions 1440 6.23 -> 2.17 %, 390 unchanged).
   Run: node --max-old-space-size=256 --test test/lh-com-leftovers-so37.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (f) => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('a wide slideshow under its heading: 25px / 50px on lufthansa.com', () => {
  assert.ok(read('blocks/carousel-lightbox/carousel-lightbox.css').includes('body.brand-lufthansa .carousel-lightbox.wide:not(:has(.carousel-lightbox-intro)) { margin-top: 25px; margin-bottom: 50px; }'));
});

test('section style gap-after-small-768: 24px from 768px', () => {
  assert.ok(read('styles/styles.css').includes('@media (width >= 768px) { body.brand-lufthansa main > .section.gap-after-small-768 { margin-bottom: 24px; } }'));
});
