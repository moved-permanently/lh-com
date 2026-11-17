/* eslint-disable max-len, import/extensions -- dev tooling */
/* Group for Business (ema-lufthansa, standing order 40 of 2026-11-17): special-assistance-and-services' gaps between news
   items as www's 105 px from 768 px ({spacer-47 from-768} before the six dividers between two news items;
   delta-so40-b2b-special-assistance-news-gaps.txt: 1440 -5.42 -> -0.32 %, 390 equal, full Chrome, b2b-parity-017).
   Run: node --test test/b2b-special-assistance-news-gaps-so40.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';

const R = '../tools/reports/parity-2026-11-09/';
const data = JSON.parse(fs.readFileSync(new URL(`${R}delta-so40-b2b-special-assistance-news-gaps.json`, import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL(`${R}delta-so40-b2b-special-assistance-news-gaps.txt`, import.meta.url), 'utf8');
const PATHS = ['/de/en/program/experts/special-assistance-and-services', '/xx/en/program/experts/special-assistance-and-services'];

test('one row per document: the desktop spacer before each divider between two news items, six of them', () => {
  assert.deepEqual(Object.keys(data).sort(), [...PATHS].sort());
  PATHS.forEach((p) => {
    assert.equal(data[p].length, 1);
    const [r] = data[p];
    assert.equal(r.count, 6);
    assert.ok(r.from.endsWith('<div class="divider"><div><div></div></div></div><div class="columns-media">'));
    assert.equal(r.to, r.from.replace('<div class="divider">', '<p>{spacer-47 from-768}</p><div class="divider">'));
  });
});

test('the list: both READY, naming the recording and the backup', () => {
  assert.deepEqual(readyPaths(list).sort(), [...PATHS].sort());
  assert.match(list, /529a4fcb4fdbe169d08677e538c9bd71ad2ed58346df19fa01ffe87fe5a7893f/);
  assert.match(list, /\.token-free-backup\/2026-11-b2b-so40-special-assistance-news-gaps\//);
});
