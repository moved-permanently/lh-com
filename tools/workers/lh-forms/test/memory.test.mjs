/*
 * Memory: an 18.5 MB submission (5 x 3.7 MB, the files' total MAIL_FILES.maxTotal) through the
 * handler and the message build fits a Worker isolate's 128 MB. The probe runs in a child process
 * with a 128 MB heap (memory-probe.mjs); the live heap plus external memory, array buffers
 * included, must stay under 128 MiB. 2026-10-31: about 87 MB (15 MB of it the probe's own request).
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('an 18.5 MB submission is sent within a Worker\'s 128 MB', () => {
  const out = execFileSync(process.execPath, [
    '--max-old-space-size=128', '--expose-gc', '--import', './test/cloudflare-workers-shim.mjs', 'memory-probe.mjs', '18500000',
  ], { cwd: dir, encoding: 'utf8', timeout: 240000 });
  const result = JSON.parse(out.trim().split('\n').pop());
  assert.equal(result.status, 200);
  assert.equal(result.ok, true);
  assert.equal(result.total, 18500000);
  // base64 of the files plus the message's JSON: under the Email Service's 25 MiB
  assert.ok(result.sentBytes < 25 * 1024 * 1024, String(result.sentBytes));
  assert.ok(result.peak < 128 * 1024 * 1024, `peak ${result.peak}`);
});
