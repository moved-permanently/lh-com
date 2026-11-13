/* eslint-disable max-len */
/* ITA's tables as www's maui-table renders them (the standing order of 2026-11-10, item 6; ita-parity-004
   /it/en/local-page/verona at 390: ours 3,804 px against www's 3,536, +7.6 %). www's flight table keeps each cell 200 px
   at least (maui-table's .cell-content min-width, its first column x 38 to 238 at 390) and scrolls sideways; ours,
   lufthansa.com's equal fixed columns, fitted four columns into 346 px and broke the words ("Flig ht", "Dep artu re").
   As Austrian's 93374199: columns by their content, 200 px at least, the block scrolls as before.
   Run: node --test test/ita-table-min-width-567.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('an ITA table-striped table: columns by content, cells 200 px at least', () => {
  assert.match(css, /body\.brand-ita \.table-striped table \{ table-layout: auto; \}/);
  assert.match(css, /body\.brand-ita \.table-striped :is\(td, th\) \{ min-width: 200px; \}/);
});

test('the block still scrolls (table-striped.css)', () => {
  const block = fs.readFileSync(new URL('../blocks/table-striped/table-striped.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.match(block, /\.table-striped \{[^}]*overflow: auto;/);
});
