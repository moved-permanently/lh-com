/* eslint-disable max-len */
/* Standing order 23 of 2026-11-14, item 2: www's settled recording of Discover's offers page has all
   591 offers drawn (discover-snapshots-004, 60,750 px at 1440); our grid draws 48 at a time as it is
   scrolled. With PARITY_SETTLE_GRID=1 tools/parity/capture.js scrolls to the page's end until the
   offers grid has drawn every offer (its "show more" box hidden and the tile count unchanged three
   times, at most 400 rounds), then back to the top, before it waits for the images and shoots; the
   capture json's waits.grid says how many tiles and rounds. Without the variable: as before.
   Run: node --test test/parity-capture-settle-grid-so23.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const src = fs.readFileSync(new URL('../tools/parity/capture.js', import.meta.url), 'utf8');

test('capture.js settles the offers grid with PARITY_SETTLE_GRID, after the scroll and before the images', () => {
  assert.match(src, /const SETTLE_GRID = Boolean\(process\.env\.PARITY_SETTLE_GRID\);/);
  const scroll = src.indexOf('await scrollThrough(page);');
  const settle = src.indexOf('if (SETTLE_GRID) waits.grid = await settleGrid(page);');
  const images = src.indexOf('waits.images = await waitForImages(page);');
  assert.ok(scroll > 0 && settle > scroll && images > settle);
});

test('settleGrid: to the end until the "show more" box is hidden and the tiles stay the same three times', () => {
  const fn = src.slice(src.indexOf('async function settleGrid'), src.indexOf('async function settleGrid') + 1200);
  assert.match(fn, /\.destination-finder-more/);
  assert.match(fn, /\.destination-finder-tile/);
  assert.match(fn, /rounds < 400 && same < 3/);
  assert.match(fn, /window\.scrollTo\(0, 0\)/);
});
