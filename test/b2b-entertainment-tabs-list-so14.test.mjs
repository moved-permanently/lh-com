/* eslint-disable max-len */
/* Standing order 14 of 2026-11-13, item 2: the list for the one B2B page-width more than 10 % off www's height at 390
   (xx/en entertainment-on-board, no tab sections in our document): a header naming the expected change, one READY row
   with its measured result.
   Run: node --test test/b2b-entertainment-tabs-list-so14.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const list = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/reimport-so14-b2b-entertainment-on-board-tabs.txt', import.meta.url), 'utf8');

test('the list: its expected change first, one row, better at 390, on HOLD since order 15', () => {
  assert.match(list.split('\n')[0], /^# Expected change: \/xx\/en\/program\/experts\/on-board\/entertainment-on-board gets its airline tab set/);
  const rows = list.split('\n').filter((l) => l.startsWith('/')).map((l) => l.split('\t'));
  assert.equal(rows.length, 1);
  const [p, rec, , result, verdict] = rows[0];
  assert.equal(p, '/xx/en/program/experts/on-board/entertainment-on-board');
  assert.equal(rec, 'b2b-parity-004');
  const [, a, b] = result.match(/390 ([\d.]+) -> ([\d.]+)/);
  assert.ok(Number(b) < Number(a));
  // standing order 15: HOLD, superseded by the delta on DA's copy (delta-so15-b2b-entertainment-tabs.txt)
  assert.match(verdict, /^HOLD \(superseded by delta-so15-b2b-entertainment-tabs\.txt/);
});
