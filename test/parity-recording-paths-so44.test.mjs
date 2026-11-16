/* Standing order 44 of 2026-11-16: recordings under another path
   (tools/parity/recording-paths.json).
   Run: node --max-old-space-size=256 --test test/parity-recording-paths-so44.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { publishedPath, recordedPaths } = require('../tools/parity/lib.js');

test('the lounge roots were recorded under during-your-trip/lounges', () => {
  assert.equal(publishedPath('/de/en/during-your-trip/lounges'), '/de/en/lounges');
  assert.deepEqual(recordedPaths('/gb/en/lounges'), ['/gb/en/lounges', '/gb/en/during-your-trip/lounges']);
});

test('other paths map to themselves', () => {
  assert.equal(publishedPath('/de/en/passenger-rights'), '/de/en/passenger-rights');
  assert.deepEqual(recordedPaths('/de/en/passenger-rights'), ['/de/en/passenger-rights']);
});
