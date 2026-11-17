/* eslint-disable max-len */
/* Standing order 53 of 2026-11-17 (ema-adobe, item 2): the 100 Years fleet's aircraft rows (text | picture above a spec
   table) from 768px. www sets the text in a third of the row (410 px at 1440) and the picture with its table in two
   thirds (834 px); ours split the row in halves. A picture | table row (no picture above the table) keeps the halves.
   /de/en/100-years/fleet 1440 11.4 -> 7.4 % (lh-parity-002).
   Run: node --max-old-space-size=256 --test test/fleet-table-columns-so53.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/table-striped/table-striped.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('from 768px: text beside a picture-topped table in a third, the picture and table in two thirds', () => {
  assert.ok(css.includes('@media (width >= 768px) { body.brand-lufthansa .table-striped.beside:has(.table-striped-above) { grid-template-columns: minmax(0, 410fr) minmax(0, 834fr); } body.brand-lufthansa .table-striped.beside-end:has(.table-striped-above) { grid-template-columns: minmax(0, 834fr) minmax(0, 410fr); } }'));
});

test('the halves stay for rows without a picture above the table, and on phones', () => {
  assert.ok(css.includes('.table-striped:is(.beside, .beside-end) { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr));'));
  assert.ok(!/@media \(width < 768px\) \{[^@]*table-striped-above\) \{ grid-template-columns/.test(css));
});
