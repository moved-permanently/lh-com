/* eslint-disable max-len */
/* The form block's date masks (blocks/form/form-rules.js applyDateMask, isValidMaskedDate):
   typed digits get the mask's literals. A mask that ends in a literal (lh-swiss's Korean forms,
   "YYYY. MM. DD.", 13 characters) gets it once every digit slot is filled, so the full value
   validates (before, the field held 12 characters and always answered the format error); a
   deletion leaves the trailing literal off, so Backspace can take the last digit; the masks
   with literals in the middle only (DD.MM.YYYY, DD/MM/YYYY, YYYY/MM/DD) as before.
   Run: node --max-old-space-size=512 --test test/form-date-mask.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyDateMask, isValidMaskedDate, validateValue } from '../blocks/form/form-rules.js';

const KO = 'YYYY. MM. DD.';

test('a mask with a trailing literal: all digits give the full masked value, and it validates', () => {
  assert.equal(applyDateMask('20260515', KO), '2026. 05. 15.');
  assert.equal(applyDateMask('2026. 05. 15', KO), '2026. 05. 15.', 'the value typed so far, the last digit added');
  assert.equal(applyDateMask('2026. 05. 15.', KO), '2026. 05. 15.', 'a full value stays as it is');
  assert.equal(applyDateMask('2026. 05. 15.', KO).length, KO.length);
  assert.ok(isValidMaskedDate(applyDateMask('20260515', KO), KO));
  assert.ok(!isValidMaskedDate('2026. 05. 15', KO), 'without the trailing literal: not the full mask');
  assert.ok(!isValidMaskedDate(applyDateMask('20260231', KO), KO), 'no 31 February');
  const field = { type: 'date', required: true, rules: { mask: KO } };
  assert.equal(validateValue(field, applyDateMask('20260515', KO)), '', 'no error');
  assert.equal(validateValue(field, '2026. 05. 15'), 'badDate', 'the 12 characters the field held before');
});

test('while typing, a mask with a trailing literal behaves as the others: literals before the next digit only', () => {
  assert.equal(applyDateMask('2026', KO), '2026');
  assert.equal(applyDateMask('20260', KO), '2026. 0');
  assert.equal(applyDateMask('2026051', KO), '2026. 05. 1');
  assert.equal(applyDateMask('', KO), '');
  assert.equal(applyDateMask('2026051512', KO), '2026. 05. 15.', 'digits beyond the mask are dropped');
});

test('a deletion leaves the trailing literal off (Backspace after the full value takes the dot, then the digit)', () => {
  assert.equal(applyDateMask('2026. 05. 15', KO, { deleting: true }), '2026. 05. 15');
  assert.equal(applyDateMask('2026. 05. 1', KO, { deleting: true }), '2026. 05. 1');
  assert.equal(applyDateMask('2026. 05. 15', KO, { deleting: false }), '2026. 05. 15.');
});

test('masks with literals in the middle only, as before', () => {
  assert.equal(applyDateMask('15102022', 'DD.MM.YYYY'), '15.10.2022');
  assert.equal(applyDateMask('1510', 'DD.MM.YYYY'), '15.10');
  assert.equal(applyDateMask('151', 'DD/MM/YYYY'), '15/1');
  assert.equal(applyDateMask('20260515', 'YYYY/MM/DD'), '2026/05/15');
  assert.equal(applyDateMask('15102022', 'DD.MM.YYYY', { deleting: true }), '15.10.2022');
  assert.ok(isValidMaskedDate('15.10.2022', 'DD.MM.YYYY'));
  assert.ok(isValidMaskedDate('2026/05/15', 'YYYY/MM/DD'));
  assert.ok(!isValidMaskedDate('15.10.202', 'DD.MM.YYYY'));
});

test('form.js: the input listener tells a deletion apart; the trailing literal is added when the field is left', () => {
  const js = fs.readFileSync('blocks/form/form.js', 'utf8');
  assert.match(js, /applyDateMask\(control\.value, mask, \{ deleting: \/\^delete\/\.test\(e\.inputType \|\| ''\) \}\)/);
  assert.match(js, /control\.addEventListener\('blur', \(\) => \{\s*const masked = applyDateMask\(control\.value, mask\);/);
});
