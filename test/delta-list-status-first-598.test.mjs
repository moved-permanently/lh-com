/* eslint-disable max-len, import/extensions -- dev tooling */
/* Delta lists with READY/HOLD as their first column (standing order 14 of 2026-11-13: "READY/HOLD as the first column")
   next to the older layout (the path first, the status in the last column). tools/importer/ita-fragment-insert-apply.mjs's
   readyPaths takes the paths of the READY rows from either layout; HOLD rows and comment lines never.
   Run: node --test test/delta-list-status-first-598.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';

test('status first: READY rows only, the path from the second column', () => {
  const list = '# header\n# status\tpath\t...\nREADY\t/ch/en/a\t390\tx\nHOLD\t/ch/de/b\t390\ty\n';
  assert.deepEqual(readyPaths(list), ['/ch/en/a']);
});

test('the older layout: the path first, READY in a later column', () => {
  const list = '# header\n/it/en/a\tita-parity-005\tchange\tREADY (-2.67 -> -1.65 %)\n/it/en/b\tita-parity-005\tnone\tHOLD (reason)\n';
  assert.deepEqual(readyPaths(list), ['/it/en/a']);
});

test('the list of ITA row 50 reads as before', async () => {
  const fs = await import('node:fs');
  const text = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/reimport-596-ita-short-haul-note.txt', import.meta.url), 'utf8');
  assert.deepEqual(readyPaths(text), ['/it/en/world-of-ita-airways/travel-classes/business-class-medium-haul']);
});
