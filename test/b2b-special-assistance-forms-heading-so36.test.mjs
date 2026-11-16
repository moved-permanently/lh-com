/* eslint-disable max-len, import/extensions -- dev tooling */
/* Group for Business (ema-lufthansa, standing order 36 of 2026-11-16, item 3): special-assistance-and-services, the grey
   band's "Forms" heading as heading-small, as www's (b2b-parity-005 at 390: +1.99 -> +1.51 %;
   delta-so36-b2b-special-assistance-forms-heading.txt).
   Run: node --test test/b2b-special-assistance-forms-heading-so36.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';
import { HEADING_SIZES } from '../scripts/style-markers.js';

const R = '../tools/reports/parity-2026-11-09/';
const data = JSON.parse(fs.readFileSync(new URL(`${R}delta-so36-b2b-special-assistance-forms-heading.json`, import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL(`${R}delta-so36-b2b-special-assistance-forms-heading.txt`, import.meta.url), 'utf8');
const PATHS = ['/de/en/program/experts/special-assistance-and-services', '/xx/en/program/experts/special-assistance-and-services'];

test('one row per document: the marker after "Forms", nothing else', () => {
  assert.deepEqual(Object.keys(data).sort(), [...PATHS].sort());
  PATHS.forEach((p) => {
    assert.equal(data[p].length, 1);
    const [r] = data[p];
    assert.equal(r.count, 1);
    assert.equal(r.from, '<h2 id="forms">Forms</h2>');
    assert.equal(r.to, '<h2 id="forms">Forms {heading-small}</h2>');
  });
  assert.ok(HEADING_SIZES.includes('heading-small'));
});

test('the list: both documents READY, naming the recording and the backup', () => {
  assert.deepEqual(readyPaths(list).sort(), [...PATHS].sort());
  assert.match(list.split('\n')[0], /b2b-parity-005/);
  assert.match(list.split('\n')[0], /\.token-free-backup\/2026-11-b2b-so36-special-assistance-forms-heading\//);
});
