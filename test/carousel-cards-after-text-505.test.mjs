/* eslint-disable max-len */
/* Brief 505 item 2, /de/en/book-and-manage/stopover at 1440 (27.1 %): the four step cards ("1. Flight search") are a
   four-column view of their own on www after the intro text, padded 3.2rem above and below; ours (Carousel Cards grid
   four-up) sat right under the text's wrapper gap: 31 px higher than www's, the next section 33 px higher. A Carousel
   Cards block right after running text in a campaign-section has 32 px above it from 768 px, and 32 px under it where
   it ends its section. Not on phones and not on insights-flow pages: there it measured worse (tags/munich's cards sit
   in the text's own column view; stopover 15.2 -> 15.9 % at 390).
   Run: node --test test/carousel-cards-after-text-505.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('styles/styles.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-lufthansa main > .section.campaign-section > .default-content-wrapper:has(> p:last-child:not(.spacer)) + .carousel-cards-wrapper > .carousel-cards';

// the 32 px under it at the section's end since apply whatever is before the cards (test/carousel-cards-section-end-505.test.mjs)
test('Carousel Cards after running text in a campaign-section, from 768 px: the column view\'s 32 px above', () => {
  assert.ok(css.includes(`@media (width >= 768px) { ${SEL} { padding-top: 32px; } body.brand-lufthansa main > .section.campaign-section > .carousel-cards-wrapper:last-child > .carousel-cards { padding-bottom: 32px; } }`));
});
