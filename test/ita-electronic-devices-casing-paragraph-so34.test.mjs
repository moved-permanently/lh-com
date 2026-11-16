/* eslint-disable max-len, import/extensions -- dev tooling */
/* ITA (ema-lufthansa, standing order 34 of 2026-11-16, item 2): electronic-devices-and-batteries, www's paragraph on batteries
   in one casing (added on www after the import; ita-parity-012) before "Guide to calculating battery power"
   (delta-so34-ita-electronic-devices-casing-paragraph.txt, HOLD: the owner's call and a 1440 first load).
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

test('the list: HOLD, naming the tool and the backup', () => {
  assert.deepEqual(readyPaths(list), []);
  assert.ok(list.split('\n').some((l) => l.startsWith(`HOLD\t${PATH}\t`)));
  assert.match(list.split('\n')[0], /\.token-free-backup\/2026-11-ita-so34-electronic-devices-casing-paragraph\//);
});
