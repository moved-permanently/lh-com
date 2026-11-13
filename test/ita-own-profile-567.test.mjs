/* eslint-disable max-len, import/extensions -- dev tooling */
/* ITA's Miles & More pages are ITA's own content (the brief after 566, ITA rows 21 and 22): accordions and the sidebar,
   no login. Their path is the profile app shell's (/{cc}/{ll}/profile/...), which the DA upload refuses unless the site's
   allowlist lists the page in ownPages (as lh-b2b's sign-in and profile). The nine language pages (it/en and its eight
   twins, ita-snapshots-019: 8 of 8 HTTP 200) are in lh-ita.json's paths and ownPages: allowed, not an app shell.
   Run: node --test test/ita-own-profile-567.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { siteSettings, APP_SHELL } from '../tools/importer/da-upload-sites.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const PAGES = ['it/en', 'br/pt', 'de/de', 'es/es', 'fr/fr', 'gr/el', 'it/it', 'jp/ja', 'nl/nl'].map((r) => `/${r}/profile/miles-and-more`);

test('the nine Miles & More pages are lh-ita\'s own: allowed, not refused as the profile app shell', async () => {
  const { allowed, appShell } = await siteSettings(root, async () => new Set(), { site: 'lh-ita' });
  PAGES.forEach((p) => {
    assert.ok(APP_SHELL.test(p), `${p} has the app shell's path`);
    assert.ok(allowed(p), `${p} allowed`);
    assert.equal(appShell(p), false, `${p} not refused`);
  });
});

test('other profile paths of the site stay refused', async () => {
  const { appShell } = await siteSettings(root, async () => new Set(), { site: 'lh-ita' });
  ['/it/en/profile', '/it/en/profile/miles-and-more/statement', '/it/en/login', '/us/en/profile/miles-and-more'].forEach((p) => assert.equal(appShell(p), true, p));
});
