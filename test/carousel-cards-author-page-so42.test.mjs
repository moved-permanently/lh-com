/* eslint-disable max-len */
/* Standing order 42, item 2: lufthansa.com's "Our Authors" cards on author pages (a section with style author) from
   1025px: 61px more under the portrait and 62px under the text, as www's cards there. Not on the Insights hubs (no
   author section), where www's cards are as tall as ours. Gate: /de/en/articles/authors/florian-tomberg 1440
   7.5 -> 3.0 %, 390 and the hubs (explore-flying, explore-the-world) unchanged; the 19 other author pages rendered with
   and without, no breakage. Run: node --test test/carousel-cards-author-page-so42.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/carousel-cards/carousel-cards.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('author pages only, from 1025px: the portrait 61px and the text 62px above the card foot', () => {
  const sel = 'body.brand-lufthansa main:has(> .section.author) .carousel-cards.authors .carousel-cards-slide:not(.carousel-cards-wide)';
  assert.ok(css.includes(`@media (width >= 1025px) { ${sel} .carousel-cards-image { padding-bottom: 61px; } ${sel} .carousel-cards-body { padding-bottom: 62px; } }`));
});

test('the shared author cards keep their own padding', () => {
  assert.ok(css.includes('.carousel-cards.authors .carousel-cards-slide:not(.carousel-cards-wide) .carousel-cards-image { padding: 10px 10px 0; }'));
  assert.ok(css.includes('.carousel-cards.authors .carousel-cards-slide:not(.carousel-cards-wide) .carousel-cards-body { padding: 0 10px 20px; }'));
});
