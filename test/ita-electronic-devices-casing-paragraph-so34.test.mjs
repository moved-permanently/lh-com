/* eslint-disable max-len, import/extensions -- dev tooling */
/* ITA (ema-lufthansa, standing order 34 of 2026-11-16, item 2): electronic-devices-and-batteries, www's paragraph on batteries
   in one casing (added on www after the import; ita-parity-012) before "Guide to calculating battery power"
   (delta-so34-ita-electronic-devices-casing-paragraph.txt; READY in standing order 35 against ita-parity-013's 1440 first load).
   Run: node --test test/ita-electronic-devices-casing-paragraph-so34.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';

const R = '../tools/reports/parity-2026-11-09/';
const data = JSON.parse(fs.readFileSync(new URL(`${R}delta-so34-ita-electronic-devices-casing-paragraph.json`, import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL(`${R}delta-so34-ita-electronic-devices-casing-paragraph.txt`, import.meta.url), 'utf8');
const PATH = '/it/en/book-and-prepare/travel-information/baggage/electronic-devices-and-batteries';

test('one insert: www\'s paragraph, as one paragraph, before the guide heading', () => {
  const [r] = data[PATH];
  assert.equal(data[PATH].length, 1);
  assert.equal(r.before, '<p><strong>Guide to calculating battery power</strong></p>');
  assert.ok(r.html.startsWith('<p>When multiple batteries are contained within a single outer case,'));
  assert.ok(r.html.endsWith('</p>'));
  assert.equal(r.html.split('<p>').length, 2);
});

// standing order 35: the owner follows www, and ita-parity-013's 1440 first load gates it: READY
test('the list: READY, naming both recordings and the backup', () => {
  assert.deepEqual(readyPaths(list), [PATH]);
  assert.match(list.split('\n')[0], /836f7c11623455762b6a8e47f4a1aab0b6800597cc8d7752282dbc86f2294991/);
  assert.match(list.split('\n')[0], /\.token-free-backup\/2026-11-ita-so34-electronic-devices-casing-paragraph\//);
});
