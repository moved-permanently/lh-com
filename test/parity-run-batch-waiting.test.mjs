/* The parity batch runner's capture rule (tools/parity/lib.js needsCapture, used by run-batch.js):
   a source screenshot that is provided as a file (srcPng) is never captured, also while the file is
   not there yet ("missing": the page waits, the replica side is still captured and the compare
   runs once the file lands); before, a missing srcPng was "captured" with no URL, failed twice and
   failed the page. Captures still pending or failed once are run; ok ones and ones that used up
   their attempts are not.
   Run: node --max-old-space-size=256 --test test/parity-run-batch-waiting.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { needsCapture, MAX_ATTEMPTS } = require('../tools/parity/lib.js');

test('a provided or missing srcPng is never captured; pending and once-failed captures are', () => {
  assert.equal(MAX_ATTEMPTS, 2);
  assert.equal(needsCapture({ out: '/x/screenshot.png', status: 'missing', error: 'srcPng not found' }), false);
  assert.equal(needsCapture({ out: '/x/screenshot.png', status: 'provided' }), false);
  assert.equal(needsCapture({ url: 'https://example.com/a', status: 'pending', attempts: 0 }), true);
  assert.equal(needsCapture({ url: 'https://example.com/a', status: 'failed', attempts: 1 }), true);
  assert.equal(needsCapture({ url: 'https://example.com/a', status: 'failed', attempts: 2 }), false);
  assert.equal(needsCapture({ url: 'https://example.com/a', status: 'ok', attempts: 1 }), false);
  assert.equal(needsCapture({ status: 'pending', attempts: 0 }), false, 'nothing to capture without a URL');
  assert.equal(needsCapture(undefined), false);
});

test('run-batch.js takes the rule from lib.js', async () => {
  const fs = await import('node:fs');
  const src = fs.readFileSync('tools/parity/run-batch.js', 'utf8');
  assert.match(src, /needsCapture[,\s][\s\S]*?require\('\.\/lib\.js'\)/);
  assert.doesNotMatch(src, /const needsCapture = /);
});
