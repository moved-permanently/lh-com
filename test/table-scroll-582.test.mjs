/* eslint-disable max-len */
/* Brief 582, rule 6: below 768px www keeps a wide table's columns about 200 px wide and scrolls it sideways
   (/de/en/data-collection-usa, green-fare at 390); ours squeezed the columns and broke the words. lufthansa.com,
   tables of four columns or more: the table's minimum width by its widest row (cells ignore min-width).
   Run: node --max-old-space-size=256 --test test/table-scroll-582.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/table-striped/table-striped.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const T = 'body.brand-lufthansa .table-striped:not(.matrix) table';

test('below 768px: 200 px per column for tables of four or more columns', () => {
  assert.ok(css.includes(`@media (width < 768px) { ${T}:has(tr > :nth-child(4)) { min-width: 800px; } ${T}:has(tr > :nth-child(5)) { min-width: 1000px; } ${T}:has(tr > :nth-child(6)) { min-width: 1200px; } }`));
});
