/* eslint-disable max-len */
/* Standing order 25 of 2026-11-14, item 4: Discover's search bar (blocks/search-bar, now under the FAQs of
   its customer service pages) as www's dcep-search-bar there: the same pill as the results page's field,
   400 px wide (discover-parity-001: 400 x 51 px, filled, a thin blue edge). gate.mjs on the four
   customer service page-widths: 4 within (the field was already in place; this is its look).
   Run: node --test test/discover-search-bar-so25.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/discover.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('Discover: the search bar a 400 px pill like the results page\'s field', () => {
  assert.ok(css.includes('body.brand-discover .search-bar .search-bar-form { align-items: center; box-sizing: border-box; max-width: 400px; height: var(--discover-field-height); padding: 0 6px 0 var(--discover-field-inline); border: var(--discover-field-border); border-radius: var(--discover-field-radius); background-color: var(--discover-field-fill); }'));
});
