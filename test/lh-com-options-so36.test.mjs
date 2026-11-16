/* eslint-disable max-len */
/* Standing order 36 of 2026-11-16, item 3: two block options, each set by one row (delta-so36-lh-com-rows.txt):
   - Columns Media wide-rows: from 768px the rows 24px further apart (/de/en/lufthansa-aviation-group 1440 15.74 -> 5.37 %);
   - Table Striped wide-columns: below 768px a two- or three-column table keeps www's 200px columns and scrolls
     (/de/en/lounge-companions 390 14.26 -> 7.08 %); four or more columns keep the 800 / 1000 / 1200px rule.
   Run: node --max-old-space-size=256 --test test/lh-com-options-so36.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (f) => fs.readFileSync(new URL(`../blocks/${f}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const cm = read('columns-media/columns-media.css');
const ts = read('table-striped/table-striped.css');

test('Columns Media wide-rows: 24px between rows from 768px', () => {
  assert.ok(cm.includes('@media (width >= 768px) { body.brand-lufthansa .columns-media.wide-rows > .columns-media-row + .columns-media-row { margin-top: 24px; } }'));
});

test('Table Striped wide-columns: 400 / 600px below 768px, not for four or more columns', () => {
  const t = 'body.brand-lufthansa .table-striped.wide-columns:not(.matrix) table';
  assert.ok(ts.includes(`@media (width < 768px) { ${t}:has(tr > :nth-child(2)):not(:has(tr > :nth-child(4))) { min-width: 400px; } ${t}:has(tr > :nth-child(3)):not(:has(tr > :nth-child(4))) { min-width: 600px; } }`));
  assert.ok(ts.includes('body.brand-lufthansa .table-striped:not(.matrix) table:has(tr > :nth-child(4)) { min-width: 800px; }'));
});
