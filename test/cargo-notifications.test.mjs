/* eslint-disable import/extensions */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { berlinToUtc } from '../tools/importer/cargo-notifications.mjs';

test('www\'s notification dates (Berlin time) as ISO UTC: summer and winter time, English and German', () => {
  assert.equal(berlinToUtc('16 Sep 26, 11:07'), '2026-09-16T09:07:00.000Z');
  assert.equal(berlinToUtc('16 Sep 26 | 11:07'), '2026-09-16T09:07:00.000Z');
  assert.equal(berlinToUtc('16 Jan 26, 11:07'), '2026-01-16T10:07:00.000Z');
  assert.equal(berlinToUtc('16 Sept. 26, 11:07'), '2026-09-16T09:07:00.000Z');
  assert.equal(berlinToUtc('3 Dez. 25, 08:00'), '2025-12-03T07:00:00.000Z');
  assert.equal(berlinToUtc('soon'), '');
});
