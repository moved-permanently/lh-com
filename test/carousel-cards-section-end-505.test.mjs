/* eslint-disable max-len */
/* Brief 505, after the push: the harness's previewed /de/en/miles-and-more (reimport-497) ends 94 px short at 1440;
   48 of it the draft method had hidden (an empty last section where the metadata block was dropped). www's "This might
   also interest you" cards are a column view of their own, padded 3.2rem below: 72 px from the last card's border to
   the footer, ours 40 (the padded section's own). /de/en/food-and-beverages the same where its two-up cards end their
   section before the FAQ (the drift steps from +19 to -13 px). So from 768 px a Carousel Cards block that ends a
   campaign-section has 32 px under it, whatever is before it (stopover's rule had it only after running text; its 32 px
   above stays there).
   Run: node --test test/carousel-cards-section-end-505.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('styles/styles.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('Carousel Cards ending a campaign-section, from 768 px: the column view\'s 32 px under it', () => {
  // in the same (width >= 768px) block as stopover's padding-top (test/carousel-cards-after-text-505.test.mjs pins the block)
  assert.ok(css.includes('.carousel-cards-wrapper > .carousel-cards { padding-top: 32px; } body.brand-lufthansa main > .section.campaign-section > .carousel-cards-wrapper:last-child > .carousel-cards { padding-bottom: 32px; } }'));
});

test('stopover\'s 32 px above stays limited to cards after running text', () => {
  assert.ok(css.includes('body.brand-lufthansa main > .section.campaign-section > .default-content-wrapper:has(> p:last-child:not(.spacer)) + .carousel-cards-wrapper > .carousel-cards { padding-top: 32px; }'));
  assert.ok(!css.includes('+ .carousel-cards-wrapper:last-child > .carousel-cards { padding-bottom: 32px; }'), 'the bottom padding no longer needs text before the cards');
});
