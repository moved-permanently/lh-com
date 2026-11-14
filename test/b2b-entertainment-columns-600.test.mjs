/* eslint-disable max-len, import/extensions -- dev tooling */
/* Group for Business de/en entertainment-on-board's "In-Flight Entertainment System" as www's (ema-lufthansa, standing order
   20 of 2026-11-14, item 2): b2b-parity-007 at 1440 (its own load) sets the section's text and picture side by side under the
   full-width heading; DA's copy has them one under the other (+29.71 %). delta-so20-b2b-entertainment-columns.txt with
   tools/importer/columns-wrap-apply.mjs, option headingAbove: 1440 2506 -> 1838 (www 1932, -4.87 %); 390 unchanged (the
   columns stack). Run: node --test test/b2b-entertainment-columns-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';

const PATH = '/de/en/program/experts/on-board/entertainment-on-board';
const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/b2b-entertainment-columns-so20.json', import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so20-b2b-entertainment-columns.txt', import.meta.url), 'utf8');

test('the row: the section by its heading, the heading kept above the row', () => {
  assert.deepEqual(Object.keys(data), [PATH]);
  assert.deepEqual(data[PATH], { heading: 'In-Flight Entertainment System', headingAbove: true });
});

test('the list: READY, status first, the header naming the tool, its data and www\'s heights', () => {
  assert.deepEqual(readyPaths(list), [PATH]);
  assert.match(list.split('\n')[0], /node tools\/importer\/columns-wrap-apply\.mjs --data tools\/reports\/parity-2026-11-09\/b2b-entertainment-columns-so20\.json/);
  assert.match(list.split('\n')[0], /Expected change only/);
  assert.match(list.split('\n')[2], /^READY\t.*1932/);
});
