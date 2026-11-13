/* eslint-disable max-len */
/* Standing order 14 of 2026-11-13: eight site importers named excat's bulk importer by its install path, so they could
   not run on the network-blocked copy (tools/importer/offline-importer.mjs), as discover-import.mjs and
   import-batch.mjs can: the stock importer's snapshot render loads a snapshot's absolute resources from the airline's
   host. Each takes EXCAT_IMPORT_SCRIPTS now, the install path when it is unset (as before).
   Run: node --test test/importers-offline-scripts-so14.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const IMPORTERS = ['ita-import', 'b2b-import', 'austrian-import', 'brussels-import', 'swiss-import', 'swiss-market-import', 'swiss-magazine-import', 'swiss-sub-import', 'discover-import', 'import-batch'];

test('every site importer takes EXCAT_IMPORT_SCRIPTS, the install path only as the default', () => {
  IMPORTERS.forEach((name) => {
    const src = fs.readFileSync(new URL(`../tools/importer/${name}.mjs`, import.meta.url), 'utf8');
    assert.match(src, /const CI = process\.env\.EXCAT_IMPORT_SCRIPTS \|\| '\/home\/node\/\.excat-marketplaces\/excat-marketplace\/excat\/skills\/excat-content-import\/scripts';/, name);
  });
});

test('no other importer names the install path on its own', () => {
  fs.readdirSync(new URL('../tools/importer/', import.meta.url)).filter((f) => f.endsWith('.mjs')).forEach((f) => {
    const src = fs.readFileSync(new URL(`../tools/importer/${f}`, import.meta.url), 'utf8');
    assert.doesNotMatch(src, /const CI = '\/home\/node\/\.excat-marketplaces/, f);
  });
});
