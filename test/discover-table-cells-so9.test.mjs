/* eslint-disable max-len */
/* Standing order 9 of 2026-11-12, item 3 (Discover): www's table cells (maui-table-cell, theme four_y: 36 px padding,
   an empty footnote line under the text) are 166 px tall on baggage's allowance table at 1440 (two paragraphs:
   "Baggage" / "1 x 23 kg ..."), ours 140 (32 px padding, 28 between the paragraphs): the table 75 px short, the rest
   of the page with it (baggage de/de and de/en 1440 28.8 / 28.9 %). Ours now: 40 px over the text, 67 under it, 10
   between the paragraphs (166). Measured on the six recorded Discover pages with tables (12 page-widths, full chrome):
   baggage 1440 28.80 -> 23.44 and 28.94 -> 24.23, the rest unchanged (their tables in closed panels or at 390 not
   drawn this way).
   Run: node --test test/discover-table-cells-so9.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/discover.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('Discover table cells: 40 px over the text, 67 under it, 10 px between paragraphs', () => {
  assert.ok(css.includes('body.brand-discover .table-striped tbody td { padding-top: 40px; padding-bottom: 67px; }'));
  assert.ok(css.includes('body.brand-discover .table-striped tbody td > p { margin-bottom: 10px; }'));
  assert.ok(css.includes('body.brand-discover .table-striped tbody td > p:last-child { margin-bottom: 0; }'));
});

/* Standing order 10: on phones www's tables keep about 200 px a column and scroll sideways (baggage at 390: "Economy |
   Premium Economy" in view, Business beyond); ours squeezed three columns into 350 px and broke the words
   ("Econom y"), the table 120 px too tall. A table of three or more columns 600 px wide below 768 px (its box
   scrolls: table-striped.css): baggage 390 27.32 -> 14.25 and 28.95 -> 15.46, the other four table pages unchanged. */
test('Discover on phones: a table of three or more columns at www\'s 200 px a column, scrolling sideways', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-discover .table-striped:not(.matrix) table:has(tr > :nth-child(3)) { min-width: 600px; } }'));
});
