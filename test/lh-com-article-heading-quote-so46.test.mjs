/* eslint-disable max-len */
/* Standing order 46 of 2026-11-17 (delta-so46-rows.txt), Insights articles:
   - from 768px a plain h2 in the article body runs the article card (allegris-premium-economy-san-diego 1440
     7.29 -> 5.20 %, at/de and de/de);
   - an author quote right after a stacked Columns Media keeps www's space under the captions
     (what-i-learned-living-in-barcelona 1440 7.72 -> 5.34, 390 13.86 -> 13.00).
   Run: node --max-old-space-size=256 --test test/lh-com-article-heading-quote-so46.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (f) => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('articles: a plain body h2 runs the article card from 768px', () => {
  assert.ok(read('styles/styles.css').includes('@media (width >= 768px) { body.brand-lufthansa main:has(.article-header) > .section:not(.related-articles-container, :has(> .carousel-cards-wrapper > .carousel-cards:not(.article))) > .default-content-wrapper > h2:not([class*="heading-"]) { max-width: 83.333%; } }'));
});

test('articles: a quote after stacked pictures keeps www space under the captions', () => {
  const css = read('styles/styles.css');
  const q = 'body.brand-lufthansa main:has(.article-header) .columns-media-wrapper:has(> .columns-media.stacked) + .default-content-wrapper > blockquote:first-child';
  assert.ok(css.includes(`${q} { margin-top: 79px; }`));
  assert.ok(css.includes(`@media (width >= 768px) { ${q} { margin-top: 119px; } }`));
});
