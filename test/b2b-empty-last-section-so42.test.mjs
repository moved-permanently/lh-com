/* eslint-disable max-len, import/extensions -- dev tooling */
/* Group for Business (ema-lufthansa, standing order 42 of 2026-11-17): served pages that end with an empty section,
   the metadata block moved into the last content section (delta-so42-b2b-empty-last-section.txt).
   Run: node --test test/b2b-empty-last-section-so42.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';

const R = '../tools/reports/parity-2026-11-09/';
const data = JSON.parse(fs.readFileSync(new URL(`${R}delta-so42-b2b-empty-last-section.json`, import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL(`${R}delta-so42-b2b-empty-last-section.txt`, import.meta.url), 'utf8');
const rows = list.split('\n').filter((l) => l && !l.startsWith('#')).map((l) => l.split('\t'));

test('every document gets the same single row: the section break before the metadata goes', () => {
  assert.equal(Object.keys(data).length, 91);
  Object.values(data).forEach((r) => {
    assert.deepEqual(r, [{ from: '</div>\n<div><div class="metadata">', to: '<div class="metadata">', count: 1 }]);
  });
});

test('the list: 91 HOLD rows, the delta\'s documents, and the five pages whose end gap it is OUT', () => {
  const hold = rows.filter((r) => r[0] === 'HOLD').map((r) => r[1]).sort();
  const out = rows.filter((r) => r[0] === 'OUT').map((r) => r[1]);
  assert.deepEqual(hold, Object.keys(data).sort());
  assert.equal(out.length, 5);
  out.forEach((p) => assert.equal(data[p], undefined));
  assert.ok(out.includes('/de/en/program/experts/airlines-at-a-glance/discover-airlines'));
  rows.forEach((r) => assert.equal(r.length, 8));
});

test('nothing is READY until the dry run against DA has run; the backup is named', () => {
  assert.deepEqual(readyPaths(list), []);
  assert.match(list, /\.token-free-backup\/2026-11-b2b-so42-empty-last-section\//);
  assert.match(list, /dry run byte for byte against DA's copies has not run/);
});
