/* eslint-disable max-len */
/* Brief 500 item 2, /de/en/100-years/campaigns at 390 (27.6 %, the worst campaign page-width): a picture www draws
   narrower than its column (brief 488's markers: a [empty | picture] view in the column, a picture-only sidebar) is a
   nested column view on www; below 768 px it stacks across the column with the nested view's padding above it. Ours
   had only the text's 24 px: the "Fliegt..." poster 43 px higher than www's (80 px under the text's last line, ours 37),
   the three-quarters picture 18 px (57, ours 39). Below 768 px: 67 / 42 px above them (the text's margin collapses in).
   Run: node --test test/columns-media-narrow-pictures-500.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('blocks/columns-media/columns-media.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('below 768 px: a half-width picture 67 px, a three-quarters one 42 px under the text', () => {
  assert.ok(css.includes('@media (width < 768px) { .columns-media .columns-media-row > div > p:is(.cell-half-start, .cell-half-end) { margin-top: 67px; } .columns-media .columns-media-row > div > p.cell-three-quarters { margin-top: 42px; } }'));
});

test('from 768 px: the widths as before (brief 488)', () => {
  assert.ok(css.includes('.columns-media .columns-media-row > div > p:is(.cell-half-start, .cell-half-end) { width: calc(50% - 10px); }'));
});
