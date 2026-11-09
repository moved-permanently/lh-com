/* eslint-disable max-len -- dev tooling */
/* A test never reaches the real uploader (incident of 2026-11-09 03:04 UTC, the brief after 516: a test ran
   tools/importer/da-upload.mjs with an option the uploader did not know yet and it uploaded and previewed two test
   documents). Under the test runner (node --test sets NODE_TEST_CONTEXT for every child process) or with DA_UPLOAD_TEST set,
   da-upload.mjs refuses to start without --dry-run or --sink, before it reads a document or opens a connection; with one of
   them it runs. The path here is outside every allowlist, so even an uploader without the refusal does nothing remote.
   Run: node --test test/da-upload-test-mode.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'da-test-mode-'));
const args = ['tools/importer/da-upload.mjs', '--site', 'lh-austrian', '--content-dir', tmp, '--path', '/at/de/not-a-page-of-this-test'];
const run = (extra, env = {}) => spawnSync('node', [...args, ...extra], { cwd: root, encoding: 'utf8', env: { ...process.env, ...env } });

test('under the test runner: refused without --dry-run or --sink, nothing done', () => {
  assert.ok(process.env.NODE_TEST_CONTEXT, 'the runner sets NODE_TEST_CONTEXT');
  const r = run([]);
  assert.equal(r.status, 2);
  assert.match(r.stdout + r.stderr, /test mode: da-upload runs only with --dry-run or --sink/);
  assert.doesNotMatch(r.stdout, /not in scope/);
});

test('DA_UPLOAD_TEST outside the runner: refused the same way', () => {
  const r = run([], { NODE_TEST_CONTEXT: '', DA_UPLOAD_TEST: '1' });
  assert.equal(r.status, 2);
  assert.match(r.stdout + r.stderr, /test mode/);
});

test('with --dry-run or --sink it runs (the path is skipped as out of scope)', () => {
  assert.match(run(['--dry-run']).stdout, /not in scope, skipped/);
  assert.match(run(['--sink', path.join(tmp, 'sink')]).stdout, /not in scope, skipped/);
});
