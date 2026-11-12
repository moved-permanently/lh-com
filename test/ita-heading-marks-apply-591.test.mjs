/* eslint-disable max-len, import/extensions -- dev tooling */
/* Heading size markers into DA's copy as it is (standing order 8 of 2026-11-12, item 2, the next worst single ITA page:
   /it/en/support/utilities/contact -7.8 % at 1440, -10.0 % at 390, ita-parity-005): www's 26 country headings in the
   column views are heading-medium (36 px at 1440); the collapse leaves them unmarked and ITA row 31 shows an unmarked
   Columns Media H2 at heading-small's 28 px (rows-for-ema-test.md row 6 for the import). DA's copy holds the block twice
   (market variants), so a delta: tools/importer/ita-heading-marks-apply.mjs puts " {heading-medium}" at the end of every
   heading of the given level inside the given blocks (a heading with a marker of its own left as it is), when there
   are as many as expected; nothing else changes; refused otherwise, or when one has the marker already.
   Run: node --test test/ita-heading-marks-apply-591.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyMarks } from '../tools/importer/ita-heading-marks-apply.mjs';

const cm = (heads) => `<div class="columns-media padded"><div>${heads.map((h) => `<div><h2 id="${h.toLowerCase()}">${h}</h2><p>Every day</p></div>`).join('')}</div></div>`;
const DA = `<body><header></header><main><div><h1>Contact</h1>${cm(['Albania', 'Argentina'])}</div><div><h2 id="more">More help</h2>${cm(['Brazil'])}</div></main><footer></footer></body>`;
const ROW = {
  block: 'columns-media', level: 'h2', mark: 'heading-medium', count: 3,
};

test('every H2 in the blocks gets the marker; the H1 and the H2 outside the blocks as they were', () => {
  const r = applyMarks(DA, [ROW]);
  assert.deepEqual(r.problems, []);
  assert.equal(r.html, DA.replace('>Albania</h2>', '>Albania {heading-medium}</h2>').replace('>Argentina</h2>', '>Argentina {heading-medium}</h2>').replace('>Brazil</h2>', '>Brazil {heading-medium}</h2>'));
});

test('refused: another number of headings, or one marked already', () => {
  assert.ok(applyMarks(DA, [{ ...ROW, count: 2 }]).problems.length);
  const once = applyMarks(DA, [ROW]).html;
  const again = applyMarks(once, [ROW]);
  assert.ok(again.problems.length);
  assert.equal(again.html, once);
});

test('the data and the list agree: each path a READY row', () => {
  const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/ita-heading-marks-591.json', import.meta.url), 'utf8'));
  const rows = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/reimport-591-ita-contact-headings.txt', import.meta.url), 'utf8').split('\n').filter((l) => l && !l.startsWith('#')).map((l) => l.split('\t'));
  Object.keys(data).forEach((p) => {
    const row = rows.find((r) => r[0] === p);
    assert.ok(row, p);
    assert.match(row[row.length - 1], /^READY\b/);
  });
});
