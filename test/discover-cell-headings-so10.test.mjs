/* eslint-disable max-len, import/extensions */
/* Standing order 10 of 2026-11-12, item 3 (Discover): www's column-view headlines in heading-small that our documents
   have in a Columns Media cell, as their marker in DA's copies (reimport-so10-discover-cell-headings.txt,
   heading-size-marks-apply.mjs): 5 READY, 1 HOLD (entertainment de/en, 1440 +0.64). THEMES.discover keeps no such
   size in a cell (that measurement had the same page worse), so a re-import drops them.
   Run: node --test test/discover-cell-headings-so10.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { listPaths } from '../tools/importer/heading-size-marks-apply.mjs';
import { themeFor } from '../scripts/style-markers.js';

const read = (f) => fs.readFileSync(new URL(`../tools/reports/parity-2026-11-09/${f}`, import.meta.url), 'utf8');

test('the list: 5 READY of 6, the data heading-small on listed pages; Discover keeps no size in a cell', () => {
  const list = read('reimport-so10-discover-cell-headings.txt');
  const data = JSON.parse(read('discover-cell-headings-so10.json'));
  const all = list.split('\n').filter((l) => l.startsWith('/')).map((l) => l.split('\t')[0]);
  assert.ok(all.length === 6 && listPaths(list).length === 5);
  assert.ok(data.length === 18 && data.every((r) => r.size === 'heading-small' && all.includes(r.path)));
  assert.ok(!themeFor('discover').keepSizesIn);
});
