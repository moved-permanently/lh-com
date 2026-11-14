/* eslint-disable max-len */
/* Standing order 25 of 2026-11-14, item 1: Discover's offers cards keep their text 13 px in from the
   card's edges, as www's (ours 10). On the German phone page www then wraps "Hin- und Rückflug ab"
   onto two lines in every card, as ours now does: de/de at 390 108,518 -> 115,213 px (www 115,419),
   gated with discover-snapshots-006's German answer against discover-snapshots-004 (1 better, 3
   within). Discover only; the other grids keep 10 px.
   Run: node --test test/discover-grid-padding-so25.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/destination-finder/finder-compare.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const grid = fs.readFileSync(new URL('../blocks/destination-finder/destination-finder.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('Discover: the card text 13 px in from the edges', () => {
  assert.ok(css.includes('body.brand-discover .destination-finder.grid .destination-finder-tile-body { padding-inline: 13px; }'));
});

test('the other grids as before (10 px)', () => {
  assert.ok(grid.includes('.destination-finder.grid .destination-finder-tile-body { display: flex; flex: 1 1 auto; flex-direction: column; padding: 10px 10px 16px; }'));
});
