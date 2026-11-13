/* eslint-disable max-len */
/* The brief after 594: the uploader's allowlist for lh-austrian (tools/importer/sites/lh-austrian.json) allows the
   footer disclaimer's dialog documents (content-593-austrian-gc-dialogs.txt, /<cc>/<ll>/fragments/modals/<label>), so
   their next upload needs no local edit; nothing deeper, nothing outside a root.
   Run: node --max-old-space-size=256 --test test/austrian-dialog-allowlist-594.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { allowlistAllowed } from '../tools/importer/da-upload-sites.mjs';

const read = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8');
const allowed = allowlistAllowed(JSON.parse(read('../tools/importer/sites/lh-austrian.json')));
const dialogs = read('../tools/reports/parity-2026-11-09/content-593-austrian-gc-dialogs.txt')
  .split('\n').filter((l) => l.startsWith('/')).map((l) => l.split('\t')[0]);

test('all 60 dialog documents of content-593-austrian-gc-dialogs.txt are allowed', () => {
  assert.equal(dialogs.length, 60);
  assert.deepEqual(dialogs.filter((p) => !allowed(p)), []);
});

test('nothing deeper, nothing outside a root, nothing under /lhg/; the pages as before', () => {
  ['/at/en/fragments/modals/a/b', '/fragments/modals/general-conditions', '/at/en/fragments/other/x', '/lhg/de/fragments/modals/x'].forEach((p) => assert.ok(!allowed(p), p));
  assert.ok(allowed('/at/en/homepage'));
});

test('the brief after 595: /it/it/form-confirmation (reimport-593-austrian-pages.txt) is allowed', () => {
  assert.ok(allowed('/it/it/form-confirmation'));
});
