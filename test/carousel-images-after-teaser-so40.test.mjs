/* eslint-disable max-len */
/* Standing order 40, item 1: on lufthansa.com phones a slider right under a teaser card in its section stands 35px
   lower, as www's (the 100-years campaigns pages' poster slider: www 85px from the card's subheading to the first
   poster at 390, ours 50). Below 768px only: the rule from 768px measured worse (campaigns 1440 4.9 -> 9.3).
   Gate: /de/en/100-years/campaigns 390 10.4 -> 9.9 %; the 24 unrecorded documents with the pattern rendered with and
   without, no breakage. Run: node --test test/carousel-images-after-teaser-so40.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/carousel-images/carousel-images.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('a slider under a teaser card: 59px above it on phones', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-lufthansa main .cards-teaser-wrapper + .carousel-images-wrapper { margin-top: 59px; } }'));
  assert.ok(!/@media \(width >= 768px\) \{[^}]*\.cards-teaser-wrapper \+ \.carousel-images-wrapper/.test(css));
});
