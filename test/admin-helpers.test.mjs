/* The admin apps' API origin (tools/admin/shared/helpers.js): Blackbird's lh-backends by default
   (one constant, flipped at the switch to the second Cloudflare account), ?api= only for a local
   Worker or lh-backends on either account's workers.dev. Run: node --test test/*.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_API, resolveApiBase } from '../tools/admin/shared/helpers.js';

test('default: Blackbird\'s lh-backends (for now)', () => {
  assert.equal(DEFAULT_API, 'https://lh-backends.aem-poc-lab.workers.dev');
  assert.equal(resolveApiBase(''), DEFAULT_API);
});

test('?api=: a local Worker or lh-backends on either account; anything else the default', () => {
  [
    ['?api=https://lh-backends.benpeter.workers.dev', 'https://lh-backends.benpeter.workers.dev'],
    ['?api=https://lh-backends.aem-poc-lab.workers.dev/', 'https://lh-backends.aem-poc-lab.workers.dev'],
    ['?api=https://pr-12-lh-backends.benpeter.workers.dev', 'https://pr-12-lh-backends.benpeter.workers.dev'],
    ['?api=http://localhost:8787', 'http://localhost:8787'],
  ].forEach(([q, want]) => assert.equal(resolveApiBase(q), want, q));
  ['?api=https://lh-backends.evil.workers.dev', '?api=https://lh-backends.benpeter.workers.dev.evil.example', '?api=http://lh-backends.benpeter.workers.dev',
    '?api=https://lh-backends.benpeter.workers.dev/x', '?api=https://user@lh-backends.benpeter.workers.dev'].forEach((q) => assert.equal(resolveApiBase(q), DEFAULT_API, q));
});
