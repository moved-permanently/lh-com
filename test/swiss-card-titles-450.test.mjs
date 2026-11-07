/* eslint-disable max-len */
/* SWISS's card titles tracked as www's teaser headings (brief 450): 0.3 px (www's .teaser-heading
   letter-spacing on the travel regulations, fleet and legal captures); the headings' 0.7 px made
   "Einreisebestimmungen" wider than its card (261 px on www) and broke it.
   Run: node --max-old-space-size=512 --test test/swiss-card-titles-450.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('SWISS\'s theme: the carousel-cards titles 0.3 px apart, their long words whole from 768 px', () => {
  const css = fs.readFileSync(new URL('../styles/themes/swiss.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  assert.ok(css.includes('body.brand-swiss .carousel-cards .carousel-cards-body :is(h1, h2, h3, h4, h5, h6) { letter-spacing: 0.3px; }'));
  assert.ok(css.includes('@media (width >= 768px) { body.brand-swiss .carousel-cards .carousel-cards-body :is(h1, h2, h3, h4, h5, h6) { overflow-wrap: normal; } }'), 'a long word whole from 768 px');
});
