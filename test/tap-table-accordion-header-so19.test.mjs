/* eslint-disable max-len */
/* Standing order 19, item 3 (TAP row 159): a rich-text table's accordion headers on phones (row 146's accordion per value
   column below 1024 px). www's header is 66 px high with its 4 px top border (the label 20 px under the border, the next
   header 82 px further, /en-pt/miles-and-go/use-miles/fees at 390, tap-parity-009); ours 60 (16 px padding): every
   table of three headers 18 px short. Header padding 20px 16px. Measured on the 25 recorded TAP pages at 390: fees
   -1.62 -> +0.17 %, by-flying -1.07 -> +0.10, lounges -0.67 -> -0.16, hold-baggage -0.25 -> +0.05, wheelchair +0.73
   -> +0.95; the others unchanged (from 1024 px the cards, as before). Reads the block CSS as written.
   Run: node --max-old-space-size=256 --test test/tap-table-accordion-header-so19.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/table-striped/table-striped.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('the accordion header 20 px over and under its label, 16 px at the sides', () => {
  const at = css.indexOf('.table-striped.columns .table-striped-acc-toggle {');
  assert.ok(at >= 0);
  const rule = css.slice(at, css.indexOf('}', at));
  assert.match(rule, /padding: 20px 16px;/);
  assert.match(rule, /min-height: 56px;/);
});
