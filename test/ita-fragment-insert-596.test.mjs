/* eslint-disable max-len, import/extensions -- dev tooling */
/* An element inside a block, into DA's copy (standing order 12 of 2026-11-13, item 1, ITA row 50: /it/en/world-of-ita-
   airways/travel-classes/business-class-medium-haul, ita-parity-005, -2.67 % at 1440): www's "Short haul" tab ends with
   a "Please Note:" box, its heading over "The adjacent empty seat is not available ..."; DA's copy (both market
   variants of the tabs block) has the paragraph without the heading, which the "Medium haul" tab has. tools/importer/
   ita-fragment-insert-apply.mjs puts `html` right before each exact occurrence of `before` (an element's whole HTML);
   there must be `count` of them; refused, the document as it was, when another number is found or `html` already
   stands before one of them (a second run changes nothing).
   Run: node --test test/ita-fragment-insert-596.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyFragments } from '../tools/importer/ita-fragment-insert-apply.mjs';

const NOTE = '<p>The adjacent empty seat is not available on Airbus A220 aircraft or on flights operated by partner airlines.</p>';
const tabs = (m) => `<div><div class="profile-tabs content"><div><div>Short haul</div><div><h2>All the benefits</h2><p>Elevate your journey.</p>${NOTE}</div><div>short-haul</div></div><div><div>Medium haul</div><div><h3>Please Note:</h3><p>Highlighted services.</p></div><div>medium-haul</div></div></div><div class="section-metadata"><div><div><p>markets</p></div><div><p>${m}</p></div></div></div></div>`;
const DA = `<body><header></header><main>${tabs('-au/en')}${tabs('au/en')}<div><h2>Airbus A321neo</h2></div></main><footer></footer></body>`;
const ROW = { before: NOTE, html: '<h3>Please Note:</h3>', count: 2 };

test('the heading right before each of the paragraphs; every other byte as DA\'s', () => {
  const r = applyFragments(DA, [ROW]);
  assert.deepEqual(r.problems, []);
  assert.equal(r.html, DA.split(NOTE).join(`<h3>Please Note:</h3>${NOTE}`));
});

test('refused, the document as it was: another number of paragraphs, or the heading there already', () => {
  const one = DA.replace(tabs('au/en'), '');
  const r1 = applyFragments(one, [ROW]);
  assert.ok(r1.problems.length, 'one paragraph, two expected');
  assert.equal(r1.html, one);
  const once = applyFragments(DA, [ROW]).html;
  const r2 = applyFragments(once, [ROW]);
  assert.ok(r2.problems.length, 'a second run');
  assert.equal(r2.html, once);
});

test('the data and the list agree: the row READY, its header naming the tool and the expected change', () => {
  const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/ita-fragments-596.json', import.meta.url), 'utf8'));
  const lines = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/reimport-596-ita-short-haul-note.txt', import.meta.url), 'utf8').split('\n');
  assert.match(lines[0], /node tools\/importer\/ita-fragment-insert-apply\.mjs --data tools\/reports\/parity-2026-11-09\/ita-fragments-596\.json/);
  assert.match(lines[0], /Expected change only/);
  const rows = lines.filter((l) => l && !l.startsWith('#')).map((l) => l.split('\t'));
  assert.deepEqual(rows.map((r) => r[0]), Object.keys(data));
  rows.forEach((r) => assert.match(r[r.length - 1], /^READY\b/));
  assert.deepEqual(data['/it/en/world-of-ita-airways/travel-classes/business-class-medium-haul'], [ROW]);
});
