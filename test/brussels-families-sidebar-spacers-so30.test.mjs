/* eslint-disable max-len, import/extensions -- dev tooling */
/* Brussels (ema-lufthansa, standing order 30 of 2026-11-16, item 4): be/en and be/fr families-and-children, www's two empty
   sidebar lines (dropped by the import's marker collapse) as spacers in the sidebar's cell (delta-so30-brussels-families-sidebar-spacers.txt):
   {spacer-40} between the title and the intro, {spacer-45} after it. be/en 1702 / 3541 -> 1809 / 3644 (www 1814 / 3640),
   be/fr 1780 / 3685 -> 1887 / 3788 (www 1892 / 3804). Run: node --test test/brussels-families-sidebar-spacers-so30.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';
import { applyReplacements, revertReplacements } from '../tools/importer/ita-fragment-replace-apply.mjs';
import { SEPARATOR } from '../scripts/style-markers.js';

const R = '../tools/reports/parity-2026-11-09/';
const data = JSON.parse(fs.readFileSync(new URL(`${R}delta-so30-brussels-families-sidebar-spacers.json`, import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL(`${R}delta-so30-brussels-families-sidebar-spacers.txt`, import.meta.url), 'utf8');
const PATHS = ['/be/en/special-care/families-and-children', '/be/fr/special-care/families-and-children'];

test('one row per page: only the two spacer paragraphs added, both markers the site knows', () => {
  PATHS.forEach((p) => {
    const [r] = data[p];
    assert.equal(data[p].length, 1);
    assert.equal(r.to.replace('<p>{spacer-40}</p>', '').replace('<p>{spacer-45}</p>', ''), r.from);
    assert.ok(r.to.indexOf('{spacer-40}') < r.to.indexOf('{spacer-45}'));
    assert.match('{spacer-40}', SEPARATOR);
    assert.match('{spacer-45}', SEPARATOR);
  });
});

test('applied once, the revert gives the document back, a second run is refused', () => {
  PATHS.forEach((p) => {
    const doc = `<main><div><div class="columns-media sidebar in-column"><div><div><h1 id="x">T${data[p][0].from}<p>after</p></main>`;
    const done = applyReplacements(doc, data[p]);
    assert.deepEqual(done.problems, []);
    assert.equal(revertReplacements(done.html, data[p]).html, doc);
    assert.ok(applyReplacements(done.html, data[p]).problems.length);
  });
});

test('the list: both pages READY, naming the tool and the backup', () => {
  assert.deepEqual(readyPaths(list), PATHS);
  assert.match(list.split('\n')[0], /ita-fragment-replace-apply\.mjs --data tools\/reports\/parity-2026-11-09\/delta-so30-brussels-families-sidebar-spacers\.json/);
  assert.match(list.split('\n')[0], /\.token-free-backup\/2026-11-brussels-so30-families-sidebar-spacers\//);
});
