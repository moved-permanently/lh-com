/* eslint-disable max-len, import/extensions -- dev tooling */
/* ITA corporate-b2b's teaser cards as low as www's (standing order 17 of 2026-11-14, item 1):
   delta-so17-ita-corporate-b2b-cards-gap.txt with tools/importer/ita-fragment-insert-apply.mjs. www keeps 57 px from the
   intro to the cards at 1440, ours 25 (the cards' pictures are www's size, 407 x 203); phones match www already, so the
   spacer is from 768 px only. Run: node --test test/ita-corporate-b2b-cards-gap-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyFragments, readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';
import { SEPARATOR } from '../scripts/style-markers.js';

const PATH = '/it/en/corporate-b2b';
const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so17-ita-corporate-b2b-cards-gap.json', import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so17-ita-corporate-b2b-cards-gap.txt', import.meta.url), 'utf8');

test('one spacer from 768 px right before the cards block, a known marker', () => {
  const [row] = data[PATH];
  assert.equal(data[PATH].length, 1);
  const m = row.html.match(/^<p>(\{spacer-\d+ from-768\})<\/p>$/);
  assert.ok(m && SEPARATOR.test(m[1]), row.html);
  const doc = '<main><div><p>Discover the ITA Airways solutions...</p><div class="carousel-cards grid"><div>x</div></div></div></main>';
  const r = applyFragments(doc, data[PATH]);
  assert.deepEqual(r.problems, []);
  assert.ok(r.html.includes(`solutions...</p>${row.html}<div class="carousel-cards grid">`));
  assert.ok(applyFragments(r.html, data[PATH]).problems.length, 'a second run changes nothing');
});

test('the list: READY, status first, the header naming the tool and its data, www\'s heights in the row', () => {
  assert.deepEqual(readyPaths(list), [PATH]);
  assert.match(list.split('\n')[0], /node tools\/importer\/ita-fragment-insert-apply\.mjs --data tools\/reports\/parity-2026-11-09\/delta-so17-ita-corporate-b2b-cards-gap\.json/);
  assert.match(list.split('\n')[0], /Expected change only/);
  assert.match(list.split('\n')[2], /^READY\t.*1492 \/ 2586/);
});
