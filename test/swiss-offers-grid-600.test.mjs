/* eslint-disable max-len, import/extensions */
/* SWISS row 54 (ema-lufthansa, standing order 18 of 2026-11-14, item 2): the offers grid as www's SWISS grid (swiss-parity-008,
   /ch/en/offers, 498 cards from Zurich). www's tile: 222 x 378 px with a 1 px border, the rows 20 px apart (398 a row at 1440,
   358 at 390); "Compare cities" under the price 14 px over the tile's foot; the price red (#c00), its label 16/22 px bold, the
   price 20 px (the SWISS fare teaser's). Ours had no compare, 12 px between rows and Discover's price type: 371 / 312 px a row.
   Counted with the recording's 498 cards answered in the measuring browser (www's fares service is blocked there):
   1440 47396 -> 50791 (www 51105, -7.26 -> -0.61 %), 390 79127 -> 90709 (www 90776, -12.83 -> -0.07 %). The only recorded
   SWISS page with the grid; the homepages' slider unchanged. Run: node --test test/swiss-offers-grid-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BRANDS } from '../scripts/brands.js';

const css = fs.readFileSync(new URL('../styles/themes/swiss.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const G = 'body.brand-swiss .destination-finder.grid';
const rule = (sel, from = 0) => {
  const q = css.indexOf(`${sel} {`, from);
  return q < 0 ? '' : css.slice(q, css.indexOf('}', q));
};

test('SWISS has the grid\'s Compare cities', () => {
  assert.equal(BRANDS.swiss.gridCompare, true);
});

test('the tile as www\'s: rows 20 px apart, the price type of the SWISS fare teaser', () => {
  assert.match(rule(`${G} .destination-finder-grid`), /row-gap: 20px;/);
  assert.match(rule(`${G} .destination-finder-tile-offer`), /color: #c00;/);
  const label = rule(`${G} .destination-finder-tile-price-label`);
  ['font-size: 16px;', 'font-weight: 700;', 'line-height: 22px;'].forEach((d) => assert.ok(label.includes(d), d));
  const price = rule(`${G} .destination-finder-tile-price`);
  ['font-size: 20px;', 'line-height: 22px;'].forEach((d) => assert.ok(price.includes(d), d));
});

test('Compare cities 14 px over the foot; the room kept for it 55 px on phones, 40 from 768 px', () => {
  assert.match(rule(`${G} .destination-finder-compare`), /bottom: 14px;/);
  const body = `${G} .destination-finder-tile-compare .destination-finder-tile-body`;
  assert.match(rule(body), /padding-bottom: 55px;/);
  const q = css.indexOf(`@media (width >= 768px) { ${body} {`);
  assert.ok(q >= 0, 'the 768 px query');
  assert.match(rule(body, q), /padding-bottom: 40px;/);
});
