/* eslint-disable max-len -- dev tooling */
/* The importers in a clean clone without the excat plugin (brief 427): the go-live child's clone has
   no /home/node/.excat-marketplaces, and b2b-import.mjs (like four other importers) loaded the
   plugin's strip-scripts.js when imported, so test/b2b-parity-418.test.mjs failed there
   (ERR_MODULE_NOT_FOUND) while it passed here. tools/importer/excat-plugin.mjs loads it when it is
   there (EXCAT_MARKETPLACE, default the marketplace's checkout); without it the importers still
   import for their pure functions, and stripScripts says what is missing when called.
   Run: node --max-old-space-size=512 --test test/importers-without-plugin.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const root = new URL('..', import.meta.url);
const IMPORTERS = ['austrian-import', 'b2b-import', 'brussels-import', 'ita-import', 'swiss-import'];
const withoutPlugin = (code) => execFileSync(process.execPath, ['--input-type=module', '-e', code], {
  cwd: root, encoding: 'utf8', env: { ...process.env, EXCAT_MARKETPLACE: '/nonexistent-excat-marketplace' },
});

test('each importer imports without the excat plugin (its pure functions for the tests)', () => {
  IMPORTERS.forEach((name) => {
    const out = withoutPlugin(`const m = await import('./tools/importer/${name}.mjs'); console.log(Object.keys(m).length > 0);`);
    assert.equal(out.trim(), 'true', name);
  });
});

test('without the plugin stripScripts names the missing file when called; with it the plugin\'s own', () => {
  const out = withoutPlugin(`const { stripScripts, hasStripScripts } = await import('./tools/importer/excat-plugin.mjs');
try { stripScripts('<p></p>'); console.log('no error'); } catch (e) { console.log(hasStripScripts, e.message); }`);
  assert.match(out, /^false stripScripts: .*\/nonexistent-excat-marketplace\/excat\/skills\/excat-scrape-webpage\/scripts\/strip-scripts\.js is not on this machine/);
});

test('the importers load strip-scripts.js only through excat-plugin.mjs', () => {
  IMPORTERS.forEach((name) => {
    const src = fs.readFileSync(new URL(`tools/importer/${name}.mjs`, root), 'utf8');
    assert.doesNotMatch(src, /await import\(path\.join\(CI, '\.\.\/\.\.\/excat-scrape-webpage\/scripts\/strip-scripts\.js'\)\)/, name);
    assert.match(src, /^import \{ stripScripts \} from '\.\/excat-plugin\.mjs';$/m, name);
  });
});
