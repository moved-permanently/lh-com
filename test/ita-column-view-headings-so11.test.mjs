/* eslint-disable max-len, import/extensions */
/* Standing order 11 of 2026-11-12, item 1: ITA's column-view headings on ita-parity-002 / -005, the documents a re-import
   with order 10's markers would change, as DA's copy plus the delta (reimport-so11-ita-column-view-headings.txt,
   heading-size-marks-apply.mjs): 8 READY, 2 HOLD; contact is not listed (its markers are in DA already).
   Run: node --test test/ita-column-view-headings-so11.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { listPaths } from '../tools/importer/heading-size-marks-apply.mjs';

const read = (f) => fs.readFileSync(new URL(`../tools/reports/parity-2026-11-09/${f}`, import.meta.url), 'utf8');

test('the list: 8 READY of 10, contact not in it; the data heading-medium / heading-small on listed pages', () => {
  const list = read('reimport-so11-ita-column-view-headings.txt');
  const data = JSON.parse(read('ita-column-view-headings-so11.json'));
  const all = list.split('\n').filter((l) => l.startsWith('/')).map((l) => l.split('\t')[0]);
  assert.ok(all.length === 10 && listPaths(list).length === 8);
  assert.ok(!all.includes('/it/en/support/utilities/contact'));
  assert.ok(data.length === 19 && data.every((r) => ['heading-medium', 'heading-small'].includes(r.size) && all.includes(r.path)));
});
