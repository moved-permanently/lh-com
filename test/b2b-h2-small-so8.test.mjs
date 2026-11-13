/* eslint-disable max-len, import/extensions */
/* Standing order 8 of 2026-11-12, item 3: www's section H2s in heading-small on the 12 recorded Allegris and SWISS
   Senses start-of-booking pages as their marker in DA's copies (reimport-so8-b2b-h2-small.txt, heading-size-marks-apply.mjs):
   8 READY, 4 HOLD; the data are H2s in heading-small with the documents' full texts (the recordings cut them).
   Run: node --test test/b2b-h2-small-so8.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { listPaths } from '../tools/importer/heading-size-marks-apply.mjs';

const read = (f) => fs.readFileSync(new URL(`../tools/reports/parity-2026-11-09/${f}`, import.meta.url), 'utf8');

test('the list: 8 READY of 12; the data H2s in heading-small on listed pages', () => {
  const list = read('reimport-so8-b2b-h2-small.txt');
  const data = JSON.parse(read('b2b-h2-small-so8.json'));
  const all = list.split('\n').filter((l) => l.startsWith('/')).map((l) => l.split('\t')[0]);
  assert.ok(all.length === 12 && listPaths(list).length === 8);
  assert.ok(data.length === 27 && data.every((r) => r.level === 2 && r.size === 'heading-small' && all.includes(r.path)));
  assert.ok(data.some((r) => r.text === 'Rebookings and refunds of advance seat reservations in Lufthansa Allegris First Class and Business Class'), 'full texts');
});
