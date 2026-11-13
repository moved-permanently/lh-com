/* eslint-disable max-len */
/* The standing order after 570 item 1: Austrian /at/de/bearbeitungsgebuehren, +4.8 % at 390 on austrian.turnsthe.page. www's
   contact table (maui-table, rendered: austrian-parity-003) keeps a 200 px minimum per cell (its shadow CSS:
   .cell-content { min-width: 200px }, unset only for .equal-width) and scrolls sideways (.table-overflow { overflow: auto
   }); ours, lufthansa.com's equal fixed columns, fitted three columns into 346 px, broke words ("Telefonnu-mmer") and made
   the rows tall. No rendered recording of any brand shows equalcolumns or equal-width (81 tables: Austrian, Brussels,
   SWISS); the Studio's snapshots carry equalcolumns="" that the live page does not apply. The Austrian theme draws a
   table-striped table as www's: columns by their content, 200 px at least, the block scrolls (as before).
   With the rule added on the live pages: bearbeitungsgebuehren 390 +4.8 -> -2.1 % (the table 600 x 384, scrolling), 1440
   unchanged (+0.8 %); private-check-in-counter unchanged in height at both widths (its table 400 px wide at 390).
   Run: node --max-old-space-size=256 --test test/austrian-table-min-width-570.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('an Austrian table-striped table: columns by content, cells 200 px at least', () => {
  assert.match(css, /body\.brand-austrian \.table-striped table \{ table-layout: auto; \}/);
  assert.match(css, /body\.brand-austrian \.table-striped :is\(td, th\) \{ min-width: 200px; \}/);
});

test('the block still scrolls (table-striped.css), lufthansa.com as before', () => {
  const block = fs.readFileSync(new URL('../blocks/table-striped/table-striped.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.match(block, /\.table-striped \{[^}]*overflow: auto;/);
  assert.match(block, /\.table-striped table \{[^}]*table-layout: fixed;/);
});
