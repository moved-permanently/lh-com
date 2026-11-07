/* eslint-disable max-len */
/* SWISS's card titles tracked as www's teaser headings (brief 450): 0.3 px (www's .teaser-heading
   letter-spacing on the travel regulations, fleet and legal captures); the headings' 0.7 px made
   "Einreisebestimmungen" wider than its card and broke it; the grid cards' text 261 px as www's
   (18 px padding inside the 1 px border, for the subpixels).
   Run: node --max-old-space-size=512 --test test/swiss-card-titles-450.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('SWISS\'s theme: the carousel-cards titles 0.3 px apart, the grid cards\' text as wide as www\'s', () => {
  const css = fs.readFileSync(new URL('../styles/themes/swiss.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  assert.ok(css.includes('body.brand-swiss .carousel-cards .carousel-cards-body :is(h1, h2, h3, h4, h5, h6) { letter-spacing: 0.3px; }'));
  assert.ok(css.includes('body.brand-swiss .carousel-cards:is(.grid, .four-up) .carousel-cards-slide:not(.carousel-cards-wide) .carousel-cards-body { padding-inline: 18px; }'), 'the text 261 px wide in a 301 px card, as www');
  assert.doesNotMatch(css, /overflow-wrap|word-break|hyphens/, 'no wrapping in the theme (test/heading-wrap.test.mjs)');
});
