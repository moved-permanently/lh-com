/* Score bars (blocks/score-bars): before/after values. Run: node --test test/ */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePair, band, colour } from '../blocks/score-bars/score-bars.js';

test('a score pair', () => {
  const { before, after } = parsePair('4 → 83');
  assert.deepEqual(before, {
    label: '4', pct: 4, adjusted: null, adjustedLabel: null,
  });
  assert.deepEqual(after, {
    label: '83', pct: 83, adjusted: null, adjustedLabel: null,
  });
  assert.equal(parsePair('92 -> 96').after.pct, 96);
});

test('a score with the value without a penalty in brackets', () => {
  const { before, after } = parsePair('100 → 63 (100)');
  assert.equal(before.adjusted, null);
  assert.deepEqual(after, {
    label: '63', pct: 63, adjusted: 100, adjustedLabel: '100',
  });
  assert.equal(parsePair('61 (92) → 61 (92)').before.adjusted, 92);
});

test('fractions are drawn as their share', () => {
  const { before, after } = parsePair('0/3 → 3/3');
  assert.deepEqual(before, {
    label: '0/3', pct: 0, adjusted: null, adjustedLabel: null,
  });
  assert.equal(after.label, '3/3');
  assert.equal(after.pct, 100);
  assert.equal(Math.round(parsePair('10/36 → 36/36').before.pct), 28);
});

test('anything else is not a pair', () => {
  ['', 'n/a', '4', '4 → ', 'a → b', '4 → 5 → 6'].forEach((t) => assert.equal(parsePair(t), null, t));
});

test('bands as in PageSpeed Insights', () => {
  assert.equal(band(100), 'pass');
  assert.equal(band(90), 'pass');
  assert.equal(band(89), 'average');
  assert.equal(band(50), 'average');
  assert.equal(band(49), 'fail');
  assert.equal(band(0), 'fail');
});

test('a bar is coloured by its score without the penalty', () => {
  const { before, after } = parsePair('100 → 63 (100)');
  assert.equal(colour(before), 'pass');
  assert.equal(colour(after), 'pass');
  assert.equal(colour(parsePair('40 (70) → 30').before), 'average');
  assert.equal(colour(parsePair('40 → 30 (45)').after), 'fail');
  assert.equal(colour(parsePair('4 → 83').after), 'average');
});
