/* eslint-disable max-len, import/extensions -- dev tooling */
/* ITA (ema-lufthansa, standing order 31 of 2026-11-16, item 1): travel-insurance's empty line after the General Terms
   paragraph ("Travel Guard.&nbsp;<br> &nbsp;" in www's markup, ita-parity-010), lost in DA's copy, as a {spacer-26} paragraph
   (delta-so31-ita-travel-insurance-empty-line.txt). 390 3972 -> 3999 (www 4059), 1440 3084 -> 3111 (www 3091).
   Run: node --test test/ita-travel-insurance-empty-line-so31.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';
import { applyReplacements, revertReplacements } from '../tools/importer/ita-fragment-replace-apply.mjs';
import { SEPARATOR } from '../scripts/style-markers.js';

const R = '../tools/reports/parity-2026-11-09/';
const data = JSON.parse(fs.readFileSync(new URL(`${R}delta-so31-ita-travel-insurance-empty-line.json`, import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL(`${R}delta-so31-ita-travel-insurance-empty-line.txt`, import.meta.url), 'utf8');
const PATH = '/it/en/manage-my-bookings/extra-services/travel-insurance';

test('one row: only the spacer paragraph between the General Terms paragraph and the link', () => {
  const [r] = data[PATH];
  assert.equal(data[PATH].length, 1);
  assert.equal(r.to.replace('<p>{spacer-26}</p>', ''), r.from);
  assert.ok(r.from.startsWith('partner, Travel Guard.<br></p>'));
  assert.match('{spacer-26}', SEPARATOR);
});

test('applied once, the revert gives the document back, a second run is refused', () => {
  const doc = `<main><div><p>Travel Care travel insurance is available through the direct sales channels of Lufthansa Group’s ${data[PATH][0].from}://x">ITA Airways Travel Program</a></p></div></main>`;
  const done = applyReplacements(doc, data[PATH]);
  assert.deepEqual(done.problems, []);
  assert.equal(revertReplacements(done.html, data[PATH]).html, doc);
  assert.ok(applyReplacements(done.html, data[PATH]).problems.length);
});

test('the list: READY, naming the tool, the recording and the backup', () => {
  assert.deepEqual(readyPaths(list), [PATH]);
  assert.match(list.split('\n')[0], /ita-fragment-replace-apply\.mjs --data tools\/reports\/parity-2026-11-09\/delta-so31-ita-travel-insurance-empty-line\.json/);
  assert.match(list.split('\n')[0], /f4562b540bb25093e1f1b802a82a786223e2218968bf10a3d03928c50516df5e/);
  assert.match(list.split('\n')[0], /\.token-free-backup\/2026-11-ita-so31-travel-insurance-empty-line\//);
});
