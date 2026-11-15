/* eslint-disable max-len, import/extensions -- dev tooling */
/* Group for Business /de/en/program (ema-lufthansa, standing order 23 of 2026-11-15, item 1): www's space above the grey
   "Our bonus programs" band and before the footer (b2b-parity-007, both widths): ema-test's order 21 row took the intro's
   60 px separator and the end Spacer out; www keeps 37 and 16 of them. delta-so23-b2b-program-band-space.txt with
   tools/importer/ita-fragment-insert-apply.mjs: a {spacer-12} at the intro's end (with the paragraph's 24 px margin 37) and
   a section with {spacer-3} before the metadata (with the section gap 16). 1440 2009 -> 2059 (www 2057), 390 2394 -> 2444
   (www 2449). Run: node --test test/b2b-program-band-space-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyFragments, readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';
import { SEPARATOR } from '../scripts/style-markers.js';

const PATH = '/de/en/program';
const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so23-b2b-program-band-space.json', import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so23-b2b-program-band-space.txt', import.meta.url), 'utf8');

test('two spacers, known markers, each place once; a second run changes nothing', () => {
  const rows = data[PATH];
  assert.equal(rows.length, 2);
  rows.forEach((r) => assert.ok(SEPARATOR.test(r.html.replace(/[\s\S]*<p>|<\/p>[\s\S]*/g, '')), r.html));
  const doc = `<main><div><p>intro</p>${rows[0].before}x</h2></div>${rows[1].before}<div></div></div></main>`;
  const r = applyFragments(doc, rows);
  assert.deepEqual(r.problems, []);
  rows.forEach((row) => assert.ok(r.html.includes(`${row.html}${row.before}`)));
  assert.ok(applyFragments(r.html, rows).problems.length);
});

test('the list: READY, status first, the header naming the tool, its data and www\'s heights', () => {
  assert.deepEqual(readyPaths(list), [PATH]);
  assert.match(list.split('\n')[0], /node tools\/importer\/ita-fragment-insert-apply\.mjs --data tools\/reports\/parity-2026-11-09\/delta-so23-b2b-program-band-space\.json/);
  assert.match(list.split('\n')[0], /Expected change only/);
  assert.match(list.split('\n')[2], /^READY\t.*2057 \/ 2449/);
});
