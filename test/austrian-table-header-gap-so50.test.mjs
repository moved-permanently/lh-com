/* eslint-disable max-len */
/* Standing order 50, item 2: the white band between an Austrian header row's rule and the first body row. www's maui-table
   draws the header, a 1 px rule, then 48 px of white above the first row, at 1440 and 390 (austrian-parity-003 /
   private-check-in-counter, austrian-parity-015 / accessible-travel, read down www's full-page pictures); ours drew the
   same rule at the same place with 40 px under it (option header's border on the first row's cells). +8 px a drawn table:
   private-check-in-counter 1440 -0.27 -> -0.13 %, 390 +0.06 -> +0.17 %; accessible-travel's table scrolls in its 840 px
   box, as www's, and does not move. All 243 page-widths of the 81 served Austrian documents with option header move by
   8 px per drawn, uncapped table and by nothing else (scroll widths unchanged).
   Run: node --max-old-space-size=256 --test test/austrian-table-header-gap-so50.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('option header on Austrian tables: 48 px of white above the first body row, as www\'s maui-table', () => {
  assert.ok(css.includes('body.brand-austrian .table-striped.header tbody tr:first-child > * { border-top-width: 48px; }'));
});

test('the rule changes the band\'s width only (the header row\'s type and padding stay the block\'s)', () => {
  assert.ok(!/body\.brand-austrian \.table-striped\.header thead th \{/.test(css));
});
