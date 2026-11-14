/* eslint-disable max-len */
/* ITA row 56 (ema-lufthansa, standing order 18 of 2026-11-14, item 3): an accordion panel made only of tables (baggage-and-
   strollers' fare tables, ita-parity-005) as www's ITA maui-table: the header row white between two 1 px lines (#d1d1d5),
   144 px tall, its cells in www's column header type (.az.columnheader: 22 px, line height 110 %, light), 32 px of white
   before the first body row; from 768 px 80 px under the panel's last table (ours 24). In a cell a paragraph right before a
   spacer has no margin (www's empty lines follow the text). Strollers 1440 4237 -> 4412 (www 4446, -4.70 -> -0.76 %), 390
   7530 -> 7893 (www 7882, -4.47 -> +0.14 %); checked-baggage and electronic-devices (the other recorded pages with accordion
   tables) unchanged. Run: node --test test/ita-fare-tables-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const PANEL = 'body.brand-ita .accordion-columns .accordion-columns-intro:has(> .accordion-columns-table + .accordion-columns-table):not(:has(> :not(.accordion-columns-table)))';
const T = `${PANEL} > .accordion-columns-table`;
const rule = (sel, from = 0) => {
  const q = css.indexOf(`${sel} {`, from);
  return q < 0 ? '' : css.slice(q, css.indexOf('}', q));
};

test('the header row white, 144 px between two lines, in www\'s column header type', () => {
  assert.match(rule(`${T} thead tr`), /background-color: transparent;/);
  const th = rule(`${T} th`);
  ['height: 144px;', 'box-shadow: inset 0 1px 0 #d1d1d5, inset 0 -1px 0 #d1d1d5;', 'font-size: 22px;', 'font-weight: 300;', 'line-height: 1.1;'].forEach((d) => assert.ok(th.includes(d), d));
});

test('32 px of white before the first body row', () => {
  assert.match(rule(`${T} thead + tbody tr:first-child > *`), /border-top: 32px solid var\(--background-color, #fff\);/);
});

test('from 768 px 80 px under the panel\'s last table', () => {
  // the panel has row 50's 768 px grid block too: one of its 768 px blocks holds the space
  const blocks = css.split(`@media (width >= 768px) { ${PANEL} {`).slice(1).map((s) => s.slice(0, s.indexOf('}')));
  assert.ok(blocks.length >= 1, 'the 768 px query');
  assert.ok(blocks.some((b) => b.includes('padding-bottom: 56px;')), 'padding-bottom: 56px');
});

test('a cell\'s paragraph right before a spacer has no margin', () => {
  assert.match(rule('body.brand-ita main :is(td, th) > p:has(+ p.spacer)'), /margin-bottom: 0;/);
});
