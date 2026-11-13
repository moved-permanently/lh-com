/* eslint-disable max-len, import/extensions */
/* Standing order 16 of 2026-11-13, item 3: the lhg-history title-view list (title-view-apply.mjs): its expected change
   first, the command, READY / HOLD as the numbers say (0.5 per width).
   Run: node --test test/b2b-lhg-history-title-view-list-so16.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const list = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so16-b2b-lhg-history-title-view.txt', import.meta.url), 'utf8');

test('the list: expected change, the command, READY / HOLD by the 0.5 gate', () => {
  assert.match(list.split('\n')[0], /^# Expected change: lhg-history's title opens a column view as on www/);
  assert.ok(list.includes('node tools/importer/title-view-apply.mjs --list tools/reports/parity-2026-11-09/delta-so16-b2b-lhg-history-title-view.txt'));
  const rows = list.split('\n').filter((l) => l.startsWith('/')).map((l) => l.split('\t'));
  assert.equal(rows.length, 2);
  rows.forEach(([p, , , result, verdict]) => {
    const [[a, b], [c, d]] = [...result.matchAll(/([\d.]+) -> ([\d.]+)/g)].map((m) => [Number(m[1]), Number(m[2])]);
    assert.equal(verdict.startsWith('HOLD'), b - a > 0.5 || d - c > 0.5, p);
  });
  assert.equal(rows.find((r) => r[0] === '/de/en/about-us/lhg-history')[4], 'READY');
});
