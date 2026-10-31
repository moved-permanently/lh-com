/* eslint-disable max-len */
/* Site search titles (scripts/site-search.js headline): " | Lufthansa" and every brand's suffix
   (scripts/brands.js: ITA Airways, Discover Airlines, Austrian Airlines, Lufthansa Cargo, Air
   Dolomiti) are stripped; lh-com's titles as before. Run: node --max-old-space-size=512 --test test/site-search-brands.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { headline } from '../scripts/site-search.js';
import { BRANDS } from '../scripts/brands.js';

test('headline: Lufthansa\'s suffix as before, every brand\'s too', () => {
  assert.equal(headline('Baggage | Lufthansa'), 'Baggage');
  assert.equal(headline('Gepäck | lufthansa '), 'Gepäck');
  assert.equal(headline('Bagagli | ITA Airways'), 'Bagagli');
  assert.equal(headline('Ocean Blue | Discover Airlines'), 'Ocean Blue');
  assert.equal(headline('Flüge | Austrian Airlines'), 'Flüge');
  assert.equal(headline('td.Flash | Lufthansa Cargo'), 'td.Flash', 'the longer name, not " Cargo" left over');
  assert.equal(headline('Voli | Air Dolomiti'), 'Voli');
  Object.values(BRANDS).forEach((b) => assert.equal(headline(`X | ${b.name}`), 'X', b.name));
});

test('headline: other titles unchanged', () => {
  assert.equal(headline('Lufthansa Cargo'), 'Lufthansa Cargo');
  assert.equal(headline('Miles & More | Partner'), 'Miles & More | Partner');
  assert.equal(headline('ITA Airways and Lufthansa'), 'ITA Airways and Lufthansa');
  assert.equal(headline(''), '');
  assert.equal(headline(undefined), '');
});
