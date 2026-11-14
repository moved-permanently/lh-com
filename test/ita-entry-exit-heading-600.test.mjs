/* eslint-disable max-len, import/extensions -- dev tooling */
/* ITA entry-exit-system's "What data is collected?" as www's heading-large H2 (standing order 16 of 2026-11-14, item 3):
   delta-so16-ita-entry-exit-heading.txt with tools/importer/ita-fragment-insert-apply.mjs. The row's place is the `</h2>`
   that the icon list block follows; the marker is one scripts/style-markers.js knows; the list is READY, status first.
   Run: node --test test/ita-entry-exit-heading-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyFragments, readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';
import { HEADING_SIZES } from '../scripts/style-markers.js';

const PATH = '/it/en/book-and-prepare/travel-information/entry-regulations/entry-regulations-schengen/entry-exit-system';
const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so16-ita-entry-exit-heading.json', import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so16-ita-entry-exit-heading.txt', import.meta.url), 'utf8');

test('the marker lands at the end of the heading, every other byte as DA\'s', () => {
  const [row] = data[PATH];
  assert.ok(HEADING_SIZES.includes(row.html.trim().replace(/^\{|\}$/g, '')), 'a known heading size');
  const doc = `<main><div><h2 id="what-data-is-collected">What data is collected?${row.before}><div>x</div></div></div></main>`;
  const r = applyFragments(doc, data[PATH]);
  assert.deepEqual(r.problems, []);
  assert.ok(r.html.includes('What data is collected? {heading-large}</h2><div class="cards-icon-text partner">'));
  assert.ok(applyFragments(r.html, data[PATH]).problems.length, 'a second run changes nothing');
});

test('the list: the row READY, status first, the header naming the tool and its data', () => {
  assert.deepEqual(readyPaths(list), [PATH]);
  assert.match(list.split('\n')[0], /node tools\/importer\/ita-fragment-insert-apply\.mjs --data tools\/reports\/parity-2026-11-09\/delta-so16-ita-entry-exit-heading\.json/);
  assert.match(list.split('\n')[0], /Expected change only/);
});
