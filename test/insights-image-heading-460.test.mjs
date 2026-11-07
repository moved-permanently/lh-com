/* eslint-disable max-len */
/* Insights articles: an image right before a heading (brief 460, item 3). www's image component
   keeps .image-wrapper { margin-bottom: 3.6rem } before the next headline component: the image's
   end to the heading's ink 45 px at 1440 and 390 (know-before-you-go-berlin, -algiers,
   essentials-future-of-flying, essentials-barcelona-facts), here 29 (the paragraph's 24 px): each
   such pair moved the rest of the article 16 px up. lufthansa.com only.
   Run: node --max-old-space-size=256 --test test/insights-image-heading-460.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('an article image before a heading 40 px above it', () => {
  assert.ok(css.includes('body.brand-lufthansa main:has(.article-header) .default-content-wrapper > p:is(:has(> picture), :has(> a > picture)):has(+ :is(h2, h3, h4, h5, h6)) { margin-bottom: 40px; }'));
});
