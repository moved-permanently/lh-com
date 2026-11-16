/* eslint-disable max-len, import/extensions -- dev tooling */
/* Brussels (ema-lufthansa, standing order 34 of 2026-11-16, item 3): student-fares' "Fly, collect and redeem" band heading in
   www's heading-medium (delta-so34-brussels-student-fares-band-heading.txt). 1440 5259 -> 5222 (www 5153), 390 7736 -> 7683
   (www 7722, 0.33 points further: within the band-end gate). Run: node --test test/brussels-student-fares-band-heading-so34.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';
import { applyReplacements, revertReplacements } from '../tools/importer/ita-fragment-replace-apply.mjs';
import { HEADING_SIZES } from '../scripts/style-markers.js';

const R = '../tools/reports/parity-2026-11-09/';
const data = JSON.parse(fs.readFileSync(new URL(`${R}delta-so34-brussels-student-fares-band-heading.json`, import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL(`${R}delta-so34-brussels-student-fares-band-heading.txt`, import.meta.url), 'utf8');
const PATH = '/be/en/local-page/student-fares';

test('one row: only the heading-medium marker at the end of the band heading, a size the site knows', () => {
  const [r] = data[PATH];
  assert.equal(r.to, r.from.replace('</h1>', ' {heading-medium}</h1>'));
  assert.ok(HEADING_SIZES.includes('heading-medium'));
});

test('applied once, the revert gives the document back, a second run is refused', () => {
  const doc = `<main><div><h1 id="x"${data[PATH][0].from}<p>t</p></div></main>`;
  const done = applyReplacements(doc, data[PATH]);
  assert.deepEqual(done.problems, []);
  assert.equal(revertReplacements(done.html, data[PATH]).html, doc);
  assert.ok(applyReplacements(done.html, data[PATH]).problems.length);
});

test('the list: READY, naming the tool and the backup', () => {
  assert.deepEqual(readyPaths(list), [PATH]);
  assert.match(list.split('\n')[0], /\.token-free-backup\/2026-11-brussels-so34-student-fares-band-heading\//);
});
