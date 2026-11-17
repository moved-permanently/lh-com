/* eslint-disable max-len */
/* Standing order 48 of 2026-11-17 (delta-so48-rows.txt):
   - lufthansa.com info pages from 768px: a grey band's plain h2 runs the column's full width (munich-fair 1440
     12.84 -> 10.01 %, the other recorded page-widths unchanged);
   - brusselsairlines.com articles on phones: gallery captions 11px under the picture and upright (bike-the-city 390
     23.86 -> 22.88, sun-in-march 33.46 -> 31.91);
   - lufthansa.com articles on phones: "Back to overview" 7px closer after the article-end teaser (orders 46-48).
   Run: node --max-old-space-size=256 --test test/grey-heading-brussels-captions-so48.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (f) => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('lufthansa.com: a grey band heading on info pages runs the full width from 768px', () => {
  assert.ok(read('styles/styles.css').includes('@media (width >= 768px) { body.brand-lufthansa main:has(.subpage-nav) > .section.grey:not(.subpage-nav-container) > .default-content-wrapper > h2:not([class*="heading-"]) { margin-right: 0; } }'));
});

test('lufthansa.com articles: Back to overview 7px closer after the article-end teaser on phones', () => {
  assert.ok(read('styles/styles.css').includes('@media (width < 768px) { body.brand-lufthansa main:has(.article-header) .columns-media-wrapper + .default-content-wrapper > p.link-wrapper:first-child:has(> a[href$="/articles"]) { margin-top: -7px; } }'));
});

test('Brussels: article gallery captions on phones 11px under the picture, upright', () => {
  const css = read('styles/themes/brussels.css');
  assert.ok(css.includes('@media (width < 768px) { body.brand-brussels main:has(.article-header) .columns-media .columns-media-row p.caption { margin-top: 11px; } body.brand-brussels main:has(.article-header) .columns-media .columns-media-row p.caption > em:only-child { font-style: normal; } }'));
});
