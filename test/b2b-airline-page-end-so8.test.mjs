/* eslint-disable max-len */
/* Standing order 8 of 2026-11-12, item 3 (the Group for Business ranking): the airline pages (airlines-at-a-glance,
   21 of the 86 recorded B2B pages, their title's section H1 compact) end with a card grid in www's column view: 21 px
   from the cards to the footer at 390, 40 at 1440 (the view's bottom padding); ours had the section gap, 48 at both.
   Measured on our host against the recordings (full chrome): the 40 airline page-widths 39 better, none worse by more
   than 0.12. Only there: pages of other templates that end with cards read worse with it (lhg-history, experts:
   ours already shorter than www's). On phones also the title right after the logo's view as www's: 64 px under the view's
   end (ours 40), the cards 25 under the title (ours 44); the 21 airline pages at 390 with both 318.7 -> 181.4 summed,
   19 better, none worse (not after another view: austrian-airlines', eurowings' and discover's titles follow a text
   view, measured worse with it).
   Run: node --test test/b2b-airline-page-end-so8.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/b2b.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('an airline page ending with a card grid: 20 px to the footer, 40 from 768 px', () => {
  assert.ok(css.includes('body.brand-b2b main > .section.h1-compact:last-child:has(> .carousel-cards-wrapper:last-child) { margin-bottom: 20px; }'));
  assert.ok(css.includes('@media (width >= 768px) { body.brand-b2b main > .section.h1-compact:last-child:has(> .carousel-cards-wrapper:last-child) { margin-bottom: 40px; } }'));
});

test('on phones the airline title 64 px under the logo\'s view, the cards 25 px under the title', () => {
  const pre = 'body.brand-b2b main > .section.h1-compact > .breadcrumb-wrapper + .default-content-wrapper + .columns-media-wrapper + .default-content-wrapper';
  // the title's margin only after the logo's view; the cards 25 px under the title after any view (standing order 11:
  // austrian-airlines', eurowings' and discover-airlines' titles follow a text view, 7 page-widths at 390 better, the
  // 21 airline pages at 390 181.4 -> 108.5 summed, none worse)
  assert.ok(css.includes(`@media (width < 768px) { ${pre}:has(+ .carousel-cards-wrapper) > p.column-mark.column-end-outer:first-child + h1:last-child { margin-top: 44px; } body.brand-b2b main > .section.h1-compact > .default-content-wrapper:has(> p.column-mark.column-end-outer:first-child + h1:last-child) + .carousel-cards-wrapper { margin-top: 25px; } }`));
});
