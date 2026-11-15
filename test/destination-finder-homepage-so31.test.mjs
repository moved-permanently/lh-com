/* eslint-disable max-len */
/* Standing order 31, item 4: lufthansa.com's homepage widget "Flight offers from" (destination-finder without option
   grid, on the 232 market homepages). www's trip buttons sit 20px lower under the origin (1440: 92px from the
   heading's top, ours 71; 390: 19px), and on phones, where the heading wraps, the origin is 18px further under "Flight
   offers from". Gate (injected, recordings): /de/en/homepage 7.7 / 9.2 -> 6.4 / 7.4 % at 1440 / 390. The offers grid
   (option grid) and the brand sites as before.
   Run: node --test test/destination-finder-homepage-so31.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/destination-finder/destination-finder.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('lufthansa.com\'s homepage widget: the trip buttons 50px under the origin, the wrapped heading 18px apart on phones', () => {
  assert.ok(css.includes('body.brand-lufthansa .destination-finder:not(.grid) .destination-finder-trip-types { margin-top: 50px; }'));
  assert.ok(css.includes('@media (width < 768px) { body.brand-lufthansa .destination-finder:not(.grid) .destination-finder-heading { row-gap: 18px; } }'));
  assert.ok(css.includes('.destination-finder .destination-finder-trip-types { min-width: 0; margin: 30px 0 0;'), 'the default as before');
});
