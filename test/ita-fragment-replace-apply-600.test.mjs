/* eslint-disable max-len, import/extensions -- dev tooling */
/* tools/importer/ita-fragment-replace-apply.mjs (standing order 17 of 2026-11-14, item 1): exact strings replaced in DA's
   copies as they are, byte for byte reversible. Per document a list of rows { from, to, count }: each `from` found
   exactly `count` times becomes `to`; refused, the document left as it is, when another number is found or `to` is in
   the document already (so a second run changes nothing and --revert can tell every replaced place). --revert: each
   `to` found `count` times back to `from`, refused when `from` is there. Run: node --test test/ita-fragment-replace-apply-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { applyReplacements, revertReplacements } from '../tools/importer/ita-fragment-replace-apply.mjs';

const rows = [
  { from: '<strong>Folding stroller<br></strong>Yes', to: '<strong>Folding stroller</strong><br>Yes', count: 2 },
  { from: '<td><strong>Baggage</strong><br>No baggage<br><br><br></td>', to: '<td><p><strong>Baggage</strong><br>No baggage</p><p>{spacer-54}</p></td>', count: 1 },
];
const doc = '<main><table><tr><td><strong>Baggage</strong><br>No baggage<br><br><br></td></tr><tr><td><strong>Folding stroller<br></strong>Yes, in the hold</td></tr><tr><td><strong>Folding stroller<br></strong>Yes, in cabin</td></tr></table></main>';

test('every row replaced, every other byte as DA\'s', () => {
  const r = applyReplacements(doc, rows);
  assert.deepEqual(r.problems, []);
  assert.equal(r.html, '<main><table><tr><td><p><strong>Baggage</strong><br>No baggage</p><p>{spacer-54}</p></td></tr><tr><td><strong>Folding stroller</strong><br>Yes, in the hold</td></tr><tr><td><strong>Folding stroller</strong><br>Yes, in cabin</td></tr></table></main>');
});

test('reverted byte for byte', () => {
  const r = applyReplacements(doc, rows);
  const back = revertReplacements(r.html, rows);
  assert.deepEqual(back.problems, []);
  assert.equal(back.html, doc);
});

test('refused, the document as it was: another count, or the result there already (a second run)', () => {
  const short = applyReplacements(doc, [{ ...rows[0], count: 3 }]);
  assert.equal(short.html, doc);
  assert.match(short.problems[0], /2 found, 3 expected/);
  const once = applyReplacements(doc, rows).html;
  const again = applyReplacements(once, rows);
  assert.equal(again.html, once);
  assert.ok(again.problems.length);
  const mixed = `${doc}<strong>Folding stroller</strong><br>Yes`;
  assert.match(applyReplacements(mixed, rows).problems.join(), /there already/);
});

test('a revert refused on a document that still holds a row\'s original', () => {
  const r = revertReplacements(doc, rows);
  assert.equal(r.html, doc);
  assert.ok(r.problems.length);
});

test('rows applied one after another: a later row may not undo or overlap an earlier one', () => {
  const overlap = [rows[0], { from: '</strong><br>Yes', to: '</strong> Yes', count: 2 }];
  assert.match(applyReplacements(doc, overlap).problems.join(), /overlap/);
});
