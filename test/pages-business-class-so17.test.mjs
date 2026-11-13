/* Standing order 17 of 2026-11-13, item 2: the business-class move is live on de/en, de/de, at/de and gb/en (the old
   paths answer 301 to /<cc>/<ll>/prepare-for-your-trip/travel-classes/business-class; www moved them, lh-snapshots-111;
   move-so15-business-class-lh-com.txt). tools/migration-scope/pages.csv's business-class row names the four new paths;
   no row keeps an old one. The short- and medium-haul page stays where it is.
   Run: node --max-old-space-size=256 --test test/pages-business-class-so17.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const csv = fs.readFileSync(new URL('../tools/migration-scope/pages.csv', import.meta.url), 'utf8').trim().split('\n');
const ROOTS = ['de/en', 'de/de', 'at/de', 'gb/en'];

test('the business-class row: the four moved paths, in the columns\' order', () => {
  const moved = ROOTS.map((r) => `/${r}/prepare-for-your-trip/travel-classes/business-class`);
  const row = csv.find((l) => l.split(',')[1] === moved[0]);
  assert.ok(row, 'the row');
  assert.deepEqual(row.split(','), ['info', ...moved]);
  assert.equal(csv.filter((l) => l.includes('/travel-classes/business-class,') || l.endsWith('/travel-classes/business-class')).length, 1, 'once');
});

test('no old business-class path left; the short- and medium-haul row as it was', () => {
  ROOTS.forEach((r) => assert.ok(!csv.some((l) => l.split(',').includes(`/${r}/business-class`)), `/${r}/business-class`));
  assert.ok(csv.includes('info,/de/en/business-class-on-short-and-medium-haul,/de/de/business-class-auf-kurz-und-mittelstrecken,/at/de/business-class-auf-kurz-und-mittelstrecken,/gb/en/business-class-on-short-and-medium-haul'));
});
