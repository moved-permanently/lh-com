/* The admin apps' API origin (tools/admin/shared/helpers.js): the second Cloudflare account's
   lh-backends by default, Blackbird's on the old bbird.live hosts; ?api= only for a local Worker or
   lh-backends on either account's workers.dev. Run: node --test test/*.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_API, API_BBIRD, defaultApi, resolveApiBase,
} from '../tools/admin/shared/helpers.js';

test('default: the second account\'s lh-backends; Blackbird\'s on the bbird.live hosts', () => {
  assert.equal(DEFAULT_API, 'https://lh-backends.benpeter.workers.dev');
  assert.equal(API_BBIRD, 'https://lh-backends.aem-poc-lab.workers.dev');
  ['main--lh-com--moved-permanently.aem.page', 'main--lh-com--moved-permanently.aem.live', 'main--lh-com--moved-permanently.preview.da.live', 'da.live', 'localhost', 'lufthansa.turnsthe.page', '']
    .forEach((h) => assert.equal(defaultApi(h), DEFAULT_API, h));
  ['lhcom.bbird.live', 'lhedge.bbird.live'].forEach((h) => assert.equal(defaultApi(h), API_BBIRD, h));
  assert.equal(defaultApi('bbird.live.example.com'), DEFAULT_API);
  assert.equal(resolveApiBase(''), DEFAULT_API);
  assert.equal(resolveApiBase('', 'lhcom.bbird.live'), API_BBIRD);
});

test('?api=: a local Worker or lh-backends on either account; anything else the host\'s default', () => {
  [
    ['?api=https://lh-backends.benpeter.workers.dev', 'https://lh-backends.benpeter.workers.dev'],
    ['?api=https://lh-backends.aem-poc-lab.workers.dev/', 'https://lh-backends.aem-poc-lab.workers.dev'],
    ['?api=https://pr-12-lh-backends.benpeter.workers.dev', 'https://pr-12-lh-backends.benpeter.workers.dev'],
    ['?api=http://localhost:8787', 'http://localhost:8787'],
  ].forEach(([q, want]) => assert.equal(resolveApiBase(q), want, q));
  ['?api=https://lh-backends.evil.workers.dev', '?api=https://lh-backends.benpeter.workers.dev.evil.example', '?api=http://lh-backends.benpeter.workers.dev',
    '?api=https://lh-backends.benpeter.workers.dev/x', '?api=https://user@lh-backends.benpeter.workers.dev'].forEach((q) => {
    assert.equal(resolveApiBase(q), DEFAULT_API, q);
    assert.equal(resolveApiBase(q, 'lhcom.bbird.live'), API_BBIRD, `${q} on lhcom`);
  });
});
