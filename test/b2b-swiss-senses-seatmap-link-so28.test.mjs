/* eslint-disable max-len, import/extensions -- dev tooling */
/* Group for Business (ema-lufthansa, standing order 28 of 2026-11-15, item 3): de/de swiss-senses intermediaries' seat-map
   download as a text link, as www's and its siblings' (delta-so28-b2b-swiss-senses-seatmap-link.txt): the <strong> wrapper
   removed, nothing else. 390 7271 -> 7193 (www 7117, +2.16 -> +1.07 %). Run: node --test test/b2b-swiss-senses-seatmap-link-so28.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';
import { applyReplacements, revertReplacements } from '../tools/importer/ita-fragment-replace-apply.mjs';

const R = '../tools/reports/parity-2026-11-09/';
const data = JSON.parse(fs.readFileSync(new URL(`${R}delta-so28-b2b-swiss-senses-seatmap-link.json`, import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL(`${R}delta-so28-b2b-swiss-senses-seatmap-link.txt`, import.meta.url), 'utf8');
const PATH = '/de/de/travel-solutions/swiss-senses/intermediaries-start-of-booking';

test('only the link\'s bold wrapper goes; the link, its text and target stay', () => {
  const [r] = data[PATH];
  assert.equal(r.to, r.from.replace('<p><strong>', '<p>').replace('</strong></p>', '</p>'));
  assert.match(r.to, /seatmap-a350-900-de\.pdf/);
  const doc = `<main><div><p>x</p>${r.from}</div></main>`;
  const a = applyReplacements(doc, [r]);
  assert.deepEqual(a.problems, []);
  assert.equal(revertReplacements(a.html, [r]).html, doc);
  assert.ok(applyReplacements(a.html, [r]).problems.length);
});

test('the list: READY, naming the tool and the backup', () => {
  assert.deepEqual(readyPaths(list), [PATH]);
  assert.match(list.split('\n')[0], /ita-fragment-replace-apply\.mjs --data tools\/reports\/parity-2026-11-09\/delta-so28-b2b-swiss-senses-seatmap-link\.json/);
  assert.match(list.split('\n')[0], /\.token-free-backup\/2026-11-b2b-so28-swiss-senses-seatmap-link\//);
});
