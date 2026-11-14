/* eslint-disable max-len */
/* Standing order 23 of 2026-11-14, item 2: Discover's offers page gated again, its grid answered
   from the same day's price recording (discover-snapshots-005, tools/parity PARITY_ANSWERS) and
   settled (all 591 offers), against www's settled recording (discover-snapshots-004). The offers'
   order, names and prices match; www's cards are shorter: the "Compare cities" control 10 px over
   the card's bottom edge (ours 20), from 768 px the card 20 px shorter (rows 400 px apart on www,
   ours 420: 63,569 px against 60,839 at 1440), on phones 5 px shorter (rows 358 / 363). Discover
   only (SWISS's grid has the same control and its own recordings).
   Run: node --test test/discover-grid-compare-so23.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/destination-finder/finder-compare.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('Discover: the compare control 10 px over the card\'s bottom, the card 67 px under its price on phones', () => {
  assert.ok(css.includes('body.brand-discover .destination-finder .destination-finder-compare { bottom: 10px; }'));
  assert.ok(css.includes('body.brand-discover .destination-finder.grid .destination-finder-tile-compare .destination-finder-tile-body { padding-bottom: calc(10px + 24px + 33px); }'));
});

test('Discover from 768 px: 52 px under the price', () => {
  assert.ok(css.includes('@media (width >= 768px) { body.brand-discover .destination-finder.grid .destination-finder-tile-compare .destination-finder-tile-body { padding-bottom: calc(10px + 24px + 18px); } }'));
});

test('the other grids with the control (SWISS) as before', () => {
  assert.ok(css.includes('.destination-finder.grid .destination-finder-tile-compare .destination-finder-tile-body { padding-bottom: calc(20px + 24px + 28px); }'));
  assert.ok(css.includes('.destination-finder .destination-finder-compare { position: absolute; bottom: 20px;'));
});
