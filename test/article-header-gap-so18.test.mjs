/* eslint-disable max-len */
/* Standing order 18 of 2026-11-14, item 2: lufthansa.com's Insights articles. The article header's section
   (full-bleed: breadcrumb, article header) ends 48 px above the body (the section gap; the price bar's empty section
   between them collapses into it); www's body starts 8 to 10 px higher (the drift steps of 24 article page-widths,
   logs/p4/so18). The header section and the price bar's section keep 40 px. From 768 px a body section ending in
   text and the next one opening with a stacked Columns Media are 16 px further apart than the section gap (www 67 px,
   ours 51; 5 articles at 1440). Gate on the 82 recorded insights page-widths, local render before / after: 390 25
   better by more than 0.5, none worse (one row's +1.26 was capture variance: the rules cannot reach that page, a
   recapture gave the base number); 1440 26 better, none worse. The header rule alone at 1440 made 9 worse: the
   second rule takes away the drift it uncovered.
   Run: node --test test/article-header-gap-so18.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('an article\'s header section and the price bar\'s section after it keep 40 px', () => {
  assert.ok(css.includes('body.brand-lufthansa main:has(.article-header) > .section.full-bleed, body.brand-lufthansa main:has(.article-header) > .section.full-bleed + .section.price-bar-container { margin-bottom: 40px; }'));
});

test('from 768 px: text, then a section opening with a stacked Columns Media, 16 px more than the section gap', () => {
  assert.ok(css.includes('@media (width >= 768px) { body.brand-lufthansa main:has(.article-header) > .section:has(> .default-content-wrapper:last-child) + .section:has(> .columns-media-wrapper:first-child > .columns-media.stacked) { margin-top: calc(var(--section-gap) + 16px); } }'));
});
