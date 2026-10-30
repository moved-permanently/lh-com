/* The admin apps' API origin (tools/admin/shared/helpers.js): the account's lh-backends on every
   host; ?api= only for a local Worker or lh-backends on its workers.dev. Run: node --test test/*.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_API, defaultApi, resolveApiBase,
} from '../tools/admin/shared/helpers.js';

test('default: the account\'s lh-backends on every host', () => {
  assert.equal(DEFAULT_API, 'https://lh-backends.benpeter.workers.dev');
  ['main--lh-com--moved-permanently.aem.page', 'main--lh-com--moved-permanently.aem.live', 'main--lh-com--moved-permanently.preview.da.live', 'da.live', 'localhost', 'lufthansa.turnsthe.page', 'lhcom.bbird.live', '']
    .forEach((h) => assert.equal(defaultApi(h), DEFAULT_API, h));
  assert.equal(resolveApiBase(''), DEFAULT_API);
  assert.equal(resolveApiBase('', 'lufthansa.turnsthe.page'), DEFAULT_API);
});

test('?api=: a local Worker or lh-backends on the account\'s workers.dev; anything else the default', () => {
  [
    ['?api=https://lh-backends.benpeter.workers.dev', 'https://lh-backends.benpeter.workers.dev'],
    ['?api=https://pr-12-lh-backends.benpeter.workers.dev', 'https://pr-12-lh-backends.benpeter.workers.dev'],
    ['?api=http://localhost:8787', 'http://localhost:8787'],
  ].forEach(([q, want]) => assert.equal(resolveApiBase(q), want, q));
  // the retired first account's Worker included
  ['?api=https://lh-backends.aem-poc-lab.workers.dev/', '?api=https://lh-backends.evil.workers.dev', '?api=https://lh-backends.benpeter.workers.dev.evil.example', '?api=http://lh-backends.benpeter.workers.dev',
    '?api=https://lh-backends.benpeter.workers.dev/x', '?api=https://user@lh-backends.benpeter.workers.dev'].forEach((q) => {
    assert.equal(resolveApiBase(q), DEFAULT_API, q);
  });
});
