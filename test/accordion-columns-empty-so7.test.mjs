/* eslint-disable max-len */
/* Standing order 7 of 2026-11-12, item 3 (the Group for Business ranking): the import writes an empty accordion-columns
   block (no row: <div class="accordion-columns"></div>) where www's page has an empty collapsible component (48 in 39 of
   lh-b2b's imported documents; 14 of the 86 recorded B2B pages in DA's copies of 2026-11-11, the Allegris and SWISS Senses
   start-of-booking pages among them). The block renders nothing, but its wrapper takes the space between blocks (40 px
   after the breadcrumb: SWISS Senses de/en's title 13 px under www's; 24 px further down). An empty block takes no
   space. Measured on our host (full chrome, the 16 recorded page-widths of those pages): 6 better (by 0.6 to 2.3), none
   worse by more than 0.1. Group for Business only (styles/themes/b2b.css): other sites' empty ones (Austrian's tariff pages) have no recording.
   Run: node --test test/accordion-columns-empty-so7.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/b2b.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('B2B: an accordion-columns block without rows: its wrapper takes no space', () => {
  assert.ok(css.includes('body.brand-b2b main .accordion-columns-wrapper:has(> .accordion-columns:empty) { display: none; }'));
});
