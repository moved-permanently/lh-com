/* eslint-disable max-len, import/extensions -- dev tooling */
/* Brussels (ema-lufthansa, standing order 25 of 2026-11-15, item 3): three HOLD rows whose difference is one located space
   get a spacer where it is (delta-so25-brussels-spacers.txt with tools/importer/ita-fragment-insert-apply.mjs):
   farealert/unsubscribe-failure {spacer-11} at its end (1440 907 -> 939, www 940; 390 1328 -> 1357, www 1358), the legal
   notices hub {spacer-77 from-768} and {spacer-23 below-768} at its end (1330 -> 1428 and 1827 -> 1867, www's), be/fr
   travel-classes {spacer-24 from-768} before its sidebar block (1303 -> 1336, www 1336; phones unchanged).
   Run: node --test test/brussels-spacers-so25-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyFragments, readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';
import { SEPARATOR } from '../scripts/style-markers.js';

const PATHS = ['/be/en/farealert/unsubscribe-failure', '/be/en/legal-notices', '/be/fr/travel-classes'];
const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so25-brussels-spacers.json', import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so25-brussels-spacers.txt', import.meta.url), 'utf8');

test('the three pages, each row known spacer markers only, placed once; a second run changes nothing', () => {
  assert.deepEqual(Object.keys(data).sort(), [...PATHS].sort());
  PATHS.forEach((p) => {
    const rows = data[p];
    assert.equal(rows.length, 1);
    const marks = [...rows[0].html.matchAll(/<p>([^<]*)<\/p>/g)].map((m) => m[1]);
    assert.ok(marks.length >= 1);
    marks.forEach((m) => assert.ok(SEPARATOR.test(m), m));
    assert.equal(rows[0].html, marks.map((m) => `<p>${m}</p>`).join(''), 'nothing but the spacer paragraphs');
    const doc = `<main><div><h1>t</h1><p>x</p>${rows[0].before}<div><div>k</div><div>v</div></div></div></div></main>`;
    const r = applyFragments(doc, rows);
    assert.deepEqual(r.problems, []);
    assert.ok(r.html.includes(`${rows[0].html}${rows[0].before}`));
    assert.ok(applyFragments(r.html, rows).problems.length);
  });
  assert.deepEqual(data['/be/en/legal-notices'][0].html.match(/from-768|below-768/g), ['from-768', 'below-768']);
});

test('the list: three READY rows, the header naming the tool and its data', () => {
  assert.deepEqual(readyPaths(list).sort(), [...PATHS].sort());
  assert.match(list.split('\n')[0], /node tools\/importer\/ita-fragment-insert-apply\.mjs --data tools\/reports\/parity-2026-11-09\/delta-so25-brussels-spacers\.json/);
  assert.match(list.split('\n')[0], /Expected change only/);
});
