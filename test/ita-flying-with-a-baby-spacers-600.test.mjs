/* eslint-disable max-len, import/extensions -- dev tooling */
/* ITA flying-with-a-baby's two spacers from 768 px (standing order 16 of 2026-11-14, item 3): delta-so16-ita-flying-with-a-
   baby-spacers.txt with tools/importer/ita-fragment-insert-apply.mjs. Each spacer is a separator marker scripts/style-markers.js
   reads (from 768 px only), placed right before its heading once; the list is READY, status first.
   Run: node --test test/ita-flying-with-a-baby-spacers-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyFragments, readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';
import { SEPARATOR } from '../scripts/style-markers.js';

const PATH = '/it/en/book-and-prepare/other-requests/families-and-children/flying-with-a-baby';
const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so16-ita-flying-with-a-baby-spacers.json', import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so16-ita-flying-with-a-baby-spacers.txt', import.meta.url), 'utf8');

test('two separator markers from 768 px, each before its heading', () => {
  const rows = data[PATH];
  assert.equal(rows.length, 2);
  rows.forEach((r) => {
    const m = r.html.match(/^<p>(.*)<\/p>$/);
    assert.ok(m, r.html);
    const sep = m[1].match(SEPARATOR);
    assert.ok(sep && sep[1] === 'spacer' && sep[3], `a spacer from 768 px: ${m[1]}`);
    assert.match(r.before, /^<h2 id="[a-z0-9-]+">$/);
  });
  const doc = `<main><div><p>x</p>${rows[0].before}Important</h2></div><div>${rows[1].before}Related</h2></div></main>`;
  const r = applyFragments(doc, rows);
  assert.deepEqual(r.problems, []);
  assert.equal(r.html, doc.replace(rows[0].before, rows[0].html + rows[0].before).replace(rows[1].before, rows[1].html + rows[1].before));
  assert.ok(applyFragments(r.html, rows).problems.length, 'a second run changes nothing');
});

test('the list: READY, status first, the header naming the tool and its data', () => {
  assert.deepEqual(readyPaths(list), [PATH]);
  assert.match(list.split('\n')[0], /node tools\/importer\/ita-fragment-insert-apply\.mjs --data tools\/reports\/parity-2026-11-09\/delta-so16-ita-flying-with-a-baby-spacers\.json/);
});
