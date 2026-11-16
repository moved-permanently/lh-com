/* eslint-disable max-len, import/extensions -- dev tooling */
/* ITA (ema-lufthansa, standing order 29 of 2026-11-16, item 2): it/en checked-baggage's excess-baggage charges in www's two
   route tabs (delta-so29-ita-checked-baggage-route-tabs.txt): the section shown on it/en split before its second accordion
   set, both halves with their markets row, Tab (www's label) and Tabs "excess-baggage". 1440 4120 -> 4047 (www 4065),
   390 5072 -> 5097 (www 5234). Run: node --test test/ita-checked-baggage-route-tabs-so29.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';
import { applyReplacements, revertReplacements } from '../tools/importer/ita-fragment-replace-apply.mjs';

const R = '../tools/reports/parity-2026-11-09/';
const data = JSON.parse(fs.readFileSync(new URL(`${R}delta-so29-ita-checked-baggage-route-tabs.json`, import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL(`${R}delta-so29-ita-checked-baggage-route-tabs.txt`, import.meta.url), 'utf8');
const PATH = '/it/en/book-and-prepare/travel-information/baggage/checked-baggage';
const A = 'ALL ROUTES (EXCLUDING NORTH AMERICA, SOUTH AMERICA AND SUB-SAHARAN AFRICA)';
const B = 'NORTH AMERICA, SOUTH AMERICA AND SUB-SAHARAN AFRICA ONLY';
const tab = (label) => `<div><div><p>Tab</p></div><div><p>${label}</p></div></div><div><div><p>Tabs</p></div><div><p>excess-baggage</p></div></div>`;

test('two rows: the set boundary closes panel A (its markets row and Tab A) and opens panel B; panel B gets Tab B', () => {
  const [a, b] = data[PATH];
  assert.equal(data[PATH].length, 2);
  assert.ok(a.to.includes(tab(A)) && a.to.includes('</div><div><div class="accordion-columns faq">'));
  assert.ok(a.to.includes('<p>markets</p>') && b.to.includes('<p>markets</p>'), 'both halves keep the markets row');
  assert.ok(b.to.includes(tab(B)));
  // nothing but the inserted section metadata and the section break
  assert.equal(a.to.replace(/<div class="section-metadata">.*?<\/div><\/div><\/div><\/div><div>/, ''), a.from);
  assert.equal(b.to.replace(tab(B), ''), b.from);
});

test('applied to a document holding both strings once; the revert gives it back; a second run is refused', () => {
  const [a, b] = data[PATH];
  const doc = `<main><div><h2>x</h2></div>${a.from}<p>between</p>${b.from}</main>`;
  const done = applyReplacements(doc, data[PATH]);
  assert.deepEqual(done.problems, []);
  assert.equal(revertReplacements(done.html, data[PATH]).html, doc);
  assert.ok(applyReplacements(done.html, data[PATH]).problems.length);
});

test('the list: READY, naming the tool and the backup', () => {
  assert.deepEqual(readyPaths(list), [PATH]);
  assert.match(list.split('\n')[0], /ita-fragment-replace-apply\.mjs --data tools\/reports\/parity-2026-11-09\/delta-so29-ita-checked-baggage-route-tabs\.json/);
  assert.match(list.split('\n')[0], /\.token-free-backup\/2026-11-ita-so29-checked-baggage-route-tabs\//);
});
