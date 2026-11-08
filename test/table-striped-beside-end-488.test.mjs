/* eslint-disable max-len */
/* Brief 488 item 1: table-striped option beside-end below 768 px (/de/en/100-years/fleet: Focke-Wulf,
   "Big birds across the Atlantic", the three-engine globetrotter). The block puts the partner first in
   its markup and reorders it with `order`, which only works in the grid from 768 px; below that the
   picture sat right on its table (0 px). www (lh-parity-002c, 390): the table first, the picture
   74 px under the table's box, the table 96 px under the text (Focke-Wulf: text to 4847, table
   4943-5785, picture from 5859; ours had the text 67 px above the picture).
   Run: node --test test/table-striped-beside-end-488.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('blocks/table-striped/table-striped.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const mq = css.indexOf('@media (width >= 768px) { .table-striped:is(.beside, .beside-end) {');
const below = css.slice(0, mq);
const from768 = css.slice(mq);

test('below 768 px: beside-end stacks the table first (96 px under the text), the partner 74 px under it', () => {
  assert.ok(mq > 0, 'the 768 px block');
  assert.ok(below.includes('.table-striped.beside-end { display: flex; flex-direction: column; }'), 'a flex column, so order applies');
  assert.ok(below.includes('.table-striped.beside-end > .table-striped-aside { order: 1; margin-top: 74px; }'));
  assert.ok(below.includes('.table-striped.beside-end > .table-striped-main > .table-striped-table:first-child { margin-top: 29px; }'), 'the table 96 px under the text (67 + 29)');
});

test('from 768 px: the grid as before, the partner at the column top', () => {
  assert.match(from768, /\.table-striped:is\(\.beside, \.beside-end\) \{ display: grid;/);
  assert.match(from768, /\.table-striped\.beside-end > \.table-striped-aside \{ order: 1; margin-top: 0; \}/);
});
