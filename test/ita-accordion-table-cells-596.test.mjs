/* eslint-disable max-len */
/* ITA row 49 (standing order 12 of 2026-11-13, item 1, a code cause): on phones www's fare tables in an accordion
   (maui-table cells: /it/en/book-and-prepare/other-requests/families-and-children/baggage-and-strollers, ita-parity-005)
   pad the header cell 24 px / 16 px and every other cell 32 px / 16 px; the accordion-columns block pads its table cells
   16 px / 12 px below 768 px (32 px / 20 px from 768, as www there). On phones ITA's accordion table cells take www's
   padding: strollers 390 6333 -> 7005 (www 7882, -19.65 -> -11.13 %); the 38 other recorded ITA pages unchanged at 390
   (their accordion tables closed at load or none), and 1440 as before.
   Run: node --test test/ita-accordion-table-cells-596.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const TH = 'body.brand-ita .accordion-columns .accordion-columns-table th';
const TD = 'body.brand-ita .accordion-columns .accordion-columns-table td';

const ruleIn = (block, sel) => {
  const i = block.indexOf(`${sel} {`);
  return i < 0 ? null : block.slice(i, block.indexOf('}', i));
};

test('below 768 px: header cells 24 px / 16 px, the other cells 32 px / 16 px', () => {
  const q = css.indexOf(`@media (width < 768px) { ${TH} {`);
  assert.ok(q >= 0, 'the rules, below 768 px');
  const block = css.slice(q, css.indexOf('} }', q) + 3);
  assert.match(ruleIn(block, TH) || '', /padding: 24px 16px;/);
  assert.match(ruleIn(block, TD) || '', /padding: 32px 16px;/);
});

test('not from 768 px (the block\'s 32 px / 20 px there stays)', () => {
  const q = css.indexOf(`@media (width < 768px) { ${TH} {`);
  const outside = css.slice(0, q) + css.slice(css.indexOf('} }', q) + 3);
  assert.ok(!outside.includes(`${TH} {`) && !outside.includes(`${TD} {`));
});
