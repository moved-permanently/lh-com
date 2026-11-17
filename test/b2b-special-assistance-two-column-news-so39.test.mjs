/* eslint-disable max-len, import/extensions -- dev tooling */
/* Group for Business (ema-lufthansa, standing order 39 of 2026-11-17): special-assistance-and-services' twelve news items as
   Columns Media rows, text | picture, as www's two-column views (delta-so39-b2b-special-assistance-two-column-news.txt;
   b2b-parity-017: 1440 +100.00 -> -5.42 %, 390 equal).
   Run: node --test test/b2b-special-assistance-two-column-news-so39.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';

const R = '../tools/reports/parity-2026-11-09/';
const data = JSON.parse(fs.readFileSync(new URL(`${R}delta-so39-b2b-special-assistance-two-column-news.json`, import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL(`${R}delta-so39-b2b-special-assistance-two-column-news.txt`, import.meta.url), 'utf8');
const PATHS = ['/de/en/program/experts/special-assistance-and-services', '/xx/en/program/experts/special-assistance-and-services'];

test('twelve rows per document: one news item, wrapped as text | picture, nothing else changed', () => {
  assert.deepEqual(Object.keys(data).sort(), [...PATHS].sort());
  PATHS.forEach((p) => {
    assert.equal(data[p].length, 12);
    data[p].forEach((r) => {
      assert.equal(r.count, 1);
      assert.match(r.from, /^<h2 id="[^"]+">/);
      assert.match(r.from, /<p><picture>.*<\/picture><\/p>$/s);
      const cut = r.from.lastIndexOf('<p><picture>');
      assert.equal(r.to, `<div class="columns-media"><div><div>${r.from.slice(0, cut)}</div><div>${r.from.slice(cut)}</div></div></div>`);
    });
  });
});

test('the list: both READY, naming the recording and the backup', () => {
  assert.deepEqual(readyPaths(list).sort(), [...PATHS].sort());
  assert.match(list.split('\n')[0], /529a4fcb4fdbe169d08677e538c9bd71ad2ed58346df19fa01ffe87fe5a7893f/);
  assert.match(list.split('\n')[0], /\.token-free-backup\/2026-11-b2b-so39-special-assistance-two-column-news\//);
});
