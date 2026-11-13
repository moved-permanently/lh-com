/* eslint-disable max-len, import/extensions -- dev tooling */
/* An element back into DA's copy as it is (standing order 8 of 2026-11-12, item 1, ITA row 39: entry-exit-system's
   "What data is collected?", lost by the import beside the icon teasers; DA's copy has market sections a re-import
   would drop). tools/importer/ita-insert-apply.mjs puts the given HTML right before the section-level element whose
   text starts with `before`, once; nothing else changes. It refuses when that element is not found or found twice, or
   when the text to insert is in the document already (a second run changes nothing).
   Run: node --test test/ita-insert-apply-591.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyInserts } from '../tools/importer/ita-insert-apply.mjs';

const DA = '<body><header></header><main><div><h2>How it works</h2><div class="columns-media title-large"><div><div><h3>01</h3></div></div></div></div><div><div class="cards-icon-text partner"><div><div><picture><img src="a.svg" alt=""></picture></div><div>Information in the travel document</div></div></div><h2>Important information</h2></div></main><footer></footer></body>';
const ROW = { before: 'Information in the travel document', html: '<h2 id="what-data-is-collected">What data is collected?</h2>', text: 'What data is collected?' };

test('the HTML right before the element, nothing else changed', () => {
  const r = applyInserts(DA, [ROW]);
  assert.deepEqual(r.problems, []);
  assert.equal(r.html, DA.replace('<div><div class="cards-icon-text partner">', '<div><h2 id="what-data-is-collected">What data is collected?</h2><div class="cards-icon-text partner">'));
});

test('refused: the element not found, found twice, or the text there already', () => {
  assert.ok(applyInserts(DA, [{ ...ROW, before: 'Nothing like this' }]).problems.length);
  const twice = DA.replace('<h2>Important information</h2>', '<div class="cards-icon-text partner"><div><div>Information in the travel document</div></div></div>');
  assert.ok(applyInserts(twice, [ROW]).problems.length);
  const once = applyInserts(DA, [ROW]).html;
  const again = applyInserts(once, [ROW]);
  assert.ok(again.problems.length);
  assert.equal(again.html, once);
});

test('the data and the list agree: each path a READY row', () => {
  const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/ita-inserts-591.json', import.meta.url), 'utf8'));
  const rows = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/reimport-591-ita-row-39.txt', import.meta.url), 'utf8').split('\n').filter((l) => l && !l.startsWith('#')).map((l) => l.split('\t'));
  Object.keys(data).forEach((p) => {
    const row = rows.find((r) => r[0] === p);
    assert.ok(row, p);
    assert.match(row[row.length - 1], /^READY\b/);
  });
});
