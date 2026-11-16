/* eslint-disable max-len */
/* Standing order 39, item 2: an Insights article's author quote on phones has 16px on both sides, as www's .author-quote
   .mx-3. Ours had the left only, so its text ran a line shorter (flying-high-christoph-quarch 390 9.3 -> 5.6 %). From
   768px the margins are as before. The 10 recorded articles with a quote are closer or within 0.1; the 591 unrecorded
   ones were rendered with and without at 390 and 1440 (no breakage).
   Run: node --test test/article-quote-phone-so39.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('article author quotes: 16px on the right too below 768px', () => {
  assert.ok(css.includes('@media (width < 768px) { main:has(.article-header) .default-content-wrapper > blockquote { margin-right: 16px; } }'));
  assert.ok(css.includes('main:has(.article-header) .default-content-wrapper > blockquote { box-sizing: border-box; max-width: 622px; margin: 60px 0 60px 16px; padding: 0; }'));
});
