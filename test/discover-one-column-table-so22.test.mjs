/* eslint-disable max-len */
/* Standing order 22 of 2026-11-14: Discover's one-column tables (Business Class's benefit lists in its
   two tab panels) as www's maui-table: rows 99 px (37 px over the line, 38 under it); the 67 px under
   the line stay for the tables with columns (www's empty footnote line there: baggage's allowance
   table, standing order 9). discover-parity-003: www's stripes 99 px apart, ours 132, so the 840 px
   box showed 6 of 16 rows. Census of the recorded Discover pages: business-class de/de, de/en only.
   Run: node --test test/discover-one-column-table-so22.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/discover.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('Discover: a one-column table\'s cells 37 / 38 px around the line', () => {
  assert.ok(css.includes('body.brand-discover .table-striped table:not(:has(tr > :nth-child(2))) tbody td { padding-top: 37px; padding-bottom: 38px; }'));
});

test('Discover: the tables with columns keep 40 / 67 px', () => {
  assert.ok(css.includes('body.brand-discover .table-striped tbody td { padding-top: 40px; padding-bottom: 67px; }'));
});
