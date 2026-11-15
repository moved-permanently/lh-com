/* eslint-disable max-len */
/* Standing order 27 of 2026-11-15, item 1: lufthansa.com's offers grid at 1440 as www's (lh-parity-004a/004b against
   our pages answered by lufthansa-api-001 and -002): the filter column 291 px with the card columns 943 px (ours 1fr /
   3fr: 308 and 926), the cards 10 px apart sideways (ours 12; www's edges 408-638, 646-876, 884-1115, 1123-1353), the
   price 21 px (ours 24: its digits 15 px high against 17), 43 px under the price for the compare control (ours 46), so
   the rows stay 394-395 px apart with the wider, taller pictures. gate.mjs on /gb/en/flights, /de/en/flights,
   /de/de/fluege and /at/de/fluege at 1440: 4 better. From 1025 px (www's four columns); phones and tablets as before;
   lufthansa.com only (body.brand-lufthansa).
   Run: node --test test/lh-com-grid-columns-so27.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (f) => fs.readFileSync(new URL(`../blocks/destination-finder/${f}`, import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const df = read('destination-finder.css');
const fc = read('finder-compare.css');
const L = 'body.brand-lufthansa .destination-finder.grid';

test('lufthansa.com from 1025 px: www\'s columns, card gap and price size', () => {
  assert.ok(df.includes(`@media (width >= 1025px) { ${L} .destination-finder-layout { grid-template-columns: minmax(0, 291fr) minmax(0, 943fr); } ${L} .destination-finder-grid { column-gap: 10px; } ${L} .destination-finder-tile-price { font-size: 21px; } }`));
});

test('lufthansa.com from 1025 px: 43 px under the price, after the all-widths 46', () => {
  const all = `${L} .destination-finder-tile-compare .destination-finder-tile-body { padding-bottom: calc(10px + 24px + 12px); }`;
  const wide = `@media (width >= 1025px) { ${L} .destination-finder-tile-compare .destination-finder-tile-body { padding-bottom: calc(10px + 24px + 9px); } }`;
  assert.ok(fc.includes(all));
  assert.ok(fc.includes(wide));
  assert.ok(fc.indexOf(wide) > fc.indexOf(all));
});
