/* eslint-disable max-len */
/* Standing order 11 of 2026-11-12, item 3 (Discover): the price calendar (/de/de and /de/en book/flights/flight-search)
   ends with the flight search; www's footer starts about 46 px under its box at 1440, ours 20 (the last section has no
   gap of its own there). From 768 px the last section ending with the flight search keeps 54 px under it: 1440 22.13 ->
   13.83 and 21.16 -> 13.18; at 390 the section gap is there already (a 34 px trial made 390 worse), so not there.
   Standing order 12: the selector names the section's class (test/discover-flight-search-end-so12.test.mjs).
   Run: node --test test/discover-flight-search-end-so11.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/discover.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('Discover from 768 px: 54 px under a page-ending flight search', () => {
  assert.ok(css.includes('@media (width >= 768px) { body.brand-discover main > .section.flight-search-container:last-child:has(> .flight-search-wrapper:last-child) { margin-bottom: 54px; } }'));
});
