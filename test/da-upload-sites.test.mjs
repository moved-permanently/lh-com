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
  // a path that is no root of the table (/it/it/nav until batch 17): its nav not
  ['/de/en/not-in-scope', '/lhg/de/en/x', '/drafts/other', '/zz/it/nav', '/ch/en/not-listed'].forEach((p) => assert.ok(!s.allowed(p), p));
  // a root of the locale table (pilot ch; batch 17's it/it, 21's pl/pl): its nav, footer and fragments
  ['/ch/en/nav', '/ch/de/footer', '/ch/de/fragments/stage-promotions', '/fr/fr/nav', '/ch/fr/footer', '/it/it/nav', '/pl/pl/footer'].forEach((p) => assert.ok(s.allowed(p), p));
  // the explicit paths of tools/importer/sites/lh-com.json (the ch pilot), exactly these
  ['/ch/en/homepage', '/ch/de/event/exklusives-event-angebot-dxb-1'].forEach((p) => assert.ok(s.allowed(p), p));
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

test('--state <name>: a run of its own keeps a state file of its own (lh-tap market roots)', async () => {
  const s = await siteSettings(root, loadScope, { site: 'lh-tap', stateName: 'markets' });
  assert.equal(s.stateFile, path.join(root, 'tools/importer/da-upload-state-lh-tap-markets.json'));
  assert.equal(s.contentDir, path.join(root, 'content-sites/lh-tap/content'), 'the same tree and allowlist');
  const plain = await siteSettings(root, loadScope, { site: 'lh-tap' });
  assert.equal(plain.stateFile, path.join(root, 'tools/importer/da-upload-state-lh-tap.json'), 'without it as before');
  const com = await siteSettings(root, loadScope, { stateName: 'pilot' });
  assert.equal(com.stateFile, path.join(root, 'tools/importer/da-upload-state-pilot.json'));
  await assert.rejects(siteSettings(root, loadScope, { site: 'lh-tap', stateName: '../x' }), /not a state name/);
  const src = fs.readFileSync(path.join(root, 'tools/importer/da-upload.mjs'), 'utf8');
  assert.match(src, /stateName: opt\('state'\)/, 'da-upload.mjs passes --state on');
});

test('refusals for every site: /lhg/ and the login/profile shells', () => {
  const list = allowlistAllowed({ paths: ['/lhg/de/en/x', '/de/en/x'], patterns: ['^/lhg/.*$'] });
  assert.ok(!list('/lhg/de/en/x'), 'an allowlist cannot allow /lhg/');
  assert.ok(list('/de/en/x'));
  assert.ok(!lhComAllowed(SCOPE)('/lhg/de/en/x'), 'not even when in the scope');
  assert.ok(APP_SHELL.test('/de/en/login') && APP_SHELL.test('/de/de/profile/miles'));
  assert.ok(NEVER.test('/lhg') && !NEVER.test('/lhgx'));
  // the upload script applies the site's app shell refusal before the site's rules (da-upload.mjs)
  const src = fs.readFileSync(path.join(root, 'tools/importer/da-upload.mjs'), 'utf8');
  assert.ok(src.indexOf('appShell(p)') > 0 && src.indexOf('appShell(p)') < src.indexOf('!allowed(p)'));
  assert.ok(os.tmpdir());
});

test('a site\'s own login and profile pages (allowlist ownPages, exact paths): lh-b2b\'s sign-in and member pages; everyone else refuses them', async () => {
  const com = await siteSettings(root, loadScope, {});
  assert.ok(com.appShell('/de/en/login') && com.appShell('/de/de/profile/miles'), 'lh-com: its app shells');
  const discover = await siteSettings(root, loadScope, { site: 'lh-discover' });
  assert.ok(discover.appShell('/de/en/login'), 'a site without ownPages: as before');
  const b2b = await siteSettings(root, loadScope, { site: 'lh-b2b' });
  ['/de/en/login', '/de/de/login', '/de/en/profile', '/de/de/profile'].forEach((p) => {
    assert.ok(!b2b.appShell(p), `${p}: lh-b2b's own page`);
    assert.ok(b2b.allowed(p), `${p}: in lh-b2b's allowlist`);
  });
  assert.ok(b2b.appShell('/de/en/profile/miles') && b2b.appShell('/gb/en/login'), 'exact paths only');
  ['/de/en/login-internal', '/de/en/home', '/de/en/fund', '/de/en/history', '/de/en/usermanagement', '/de/en/reports', '/de/en/lhghome', '/de/en/experts-members']
    .forEach((p) => assert.ok(b2b.allowed(p) && b2b.allowed(p.replace('/de/en/', '/de/de/')), p));
  // ownPages lifts the refusal only: a path there must be an app shell path
  const list = JSON.parse(fs.readFileSync(path.join(root, 'tools/importer/sites/lh-b2b.json'), 'utf8'));
  list.ownPages.forEach((p) => assert.ok(APP_SHELL.test(p), p));
});
