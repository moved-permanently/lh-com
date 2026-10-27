/* eslint-disable max-len, import/extensions */
/* tools/importer/da-upload.mjs --site / --content-dir (da-upload-sites.mjs): lh-com unchanged,
   other sites by their allowlist, the refusals for every site. Run: node --test test/*.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  siteSettings, lhComAllowed, allowlistAllowed, APP_SHELL, NEVER,
} from '../tools/importer/da-upload-sites.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SCOPE = new Set(['/de/en/homepage', '/de/en/baggage', '/lhg/de/en/x']);
const loadScope = async () => SCOPE;

test('lh-com is the default: content/, its state file, its scope and families, author edits', async () => {
  const s = await siteSettings(root, loadScope, {});
  assert.equal(s.site, 'lh-com');
  assert.equal(s.org, 'moved-permanently');
  assert.equal(s.contentDir, path.join(root, 'content'));
  assert.equal(s.stateFile, path.join(root, 'tools/importer/da-upload-state.json'));
  assert.ok(s.lhCom);
  assert.equal(typeof s.authorEdits, 'object');
  ['/de/en/homepage', '/de/en/nav', '/gb/en/footer', '/de/de/fragments/stage-promotions', '/content/mobile/lh/en/homepage', '/data/lufthansa-group/x', '/xf/lh/markets/de/x', '/drafts/page-check/test-page']
    .forEach((p) => assert.ok(s.allowed(p), p));
  ['/de/en/not-in-scope', '/lhg/de/en/x', '/drafts/other', '/fr/fr/nav', '/ch/en/not-in-scope'].forEach((p) => assert.ok(!s.allowed(p), p));
  // a root of the locale table (pilot ch): its nav, footer and fragments
  ['/ch/en/nav', '/ch/de/footer'].forEach((p) => assert.ok(s.allowed(p), p));
  const env = await siteSettings(root, loadScope, { stateEnv: '/tmp/x-state.json' });
  assert.equal(env.stateFile, '/tmp/x-state.json', '$DA_UPLOAD_STATE as before');
});

test('another site: its own tree and state, only its allowlist, no lh-com scope or author edits', async () => {
  const s = await siteSettings(root, async () => { throw new Error('lh-com scope must not be loaded'); }, { site: 'lh-discover' });
  assert.equal(s.contentDir, path.join(root, 'content-sites/lh-discover/content'));
  assert.equal(s.stateFile, path.join(root, 'tools/importer/da-upload-state-lh-discover.json'));
  assert.deepEqual(s.authorEdits, {});
  assert.ok(!s.lhCom);
  assert.ok(s.allowed('/de/en/homepage'));
  assert.ok(s.allowed('/de/de/nav'));
  assert.ok(!s.allowed('/de/en/baggage-of-lufthansa'), 'not in its allowlist');
  assert.ok(!s.allowed('/drafts/page-check/test-page'), 'lh-com families are lh-com only');
  const custom = await siteSettings(root, loadScope, { site: 'lh-discover', contentDir: 'some/dir', stateEnv: '/tmp/ignored.json' });
  assert.equal(custom.contentDir, path.join(root, 'some/dir'));
  assert.equal(custom.stateFile, path.join(root, 'tools/importer/da-upload-state-lh-discover.json'), 'other sites never share a state file');
  await assert.rejects(siteSettings(root, loadScope, { site: 'no-such-site' }), /no allowlist/);
  await assert.rejects(siteSettings(root, loadScope, { site: '../x' }), /not a site name/);
});

test('refusals for every site: /lhg/ and the login/profile shells', () => {
  const list = allowlistAllowed({ paths: ['/lhg/de/en/x', '/de/en/x'], patterns: ['^/lhg/.*$'] });
  assert.ok(!list('/lhg/de/en/x'), 'an allowlist cannot allow /lhg/');
  assert.ok(list('/de/en/x'));
  assert.ok(!lhComAllowed(SCOPE)('/lhg/de/en/x'), 'not even when in the scope');
  assert.ok(APP_SHELL.test('/de/en/login') && APP_SHELL.test('/de/de/profile/miles'));
  assert.ok(NEVER.test('/lhg') && !NEVER.test('/lhgx'));
  // the upload script applies APP_SHELL before the site's rules (da-upload.mjs)
  const src = fs.readFileSync(path.join(root, 'tools/importer/da-upload.mjs'), 'utf8');
  assert.ok(src.indexOf('APP_SHELL.test(p)') < src.indexOf('!allowed(p)'));
  assert.ok(os.tmpdir());
});
