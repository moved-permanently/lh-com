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

// the destination field's label: its text transparent (its place and its name for screen readers kept; www shows the
// word inside the empty field, destination-finder.js sets it as the placeholder)
test('lufthansa.com: the destination field\'s label transparent, the placeholder in the label\'s grey', () => {
  assert.ok(df.includes(`${L} .destination-finder-destination label { color: transparent; }`));
  assert.ok(df.includes(`${L} .destination-finder-destination input::placeholder { color: var(--lh-grey-7); opacity: 1; }`));
});

// standing order 28: phones as www's first loads (lh-parity-006, each width its own load: 29 market pages). www keeps
// 48 px under the price for the compare control (card-empty-space) but 28 in Japanese, Korean and Chinese (rows 353 / 333
// px apart; lh-parity-004a's 390 was a resize from 1440, 28 everywhere); the control runs to 6 px from the card's right
// edge (x 32-182 in a 22-188 card), so "Compare cities" stays on one line; ours wrapped and stood over the price
test('lufthansa.com phones: the control to 12 px from the card\'s edge, 66 px under the price (46 in ja, ko, zh)', () => {
  const media = (fc.match(/@media \(width < 768px\) \{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g) || []).find((m) => m.includes('body.brand-lufthansa')) || '';
  assert.ok(media.includes('body.brand-lufthansa .destination-finder .destination-finder-compare { max-width: calc(100% - 12px); }'));
  assert.ok(media.includes(`${L} .destination-finder-tile-compare .destination-finder-tile-body { padding-bottom: calc(10px + 24px + 32px); }`));
  assert.ok(media.includes(`:is(:lang(ja), :lang(ko), :lang(zh)) ${L} .destination-finder-tile-compare .destination-finder-tile-body { padding-bottom: calc(10px + 24px + 12px); }`));
});
