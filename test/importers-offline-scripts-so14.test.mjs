/* eslint-disable max-len */
/* Standing order 14 of 2026-11-13: eight site importers named excat's bulk importer by its install path, so they could
   not run on the network-blocked copy (tools/importer/offline-importer.mjs), as discover-import.mjs and
   import-batch.mjs can: the stock importer's snapshot render loads a snapshot's absolute resources from the airline's
   host. Each takes EXCAT_IMPORT_SCRIPTS now. Standing order 15: through tools/importer/bulk-importer.mjs, whose default
   is the offline copy (test/bulk-importer-default-so15.test.mjs).
   Run: node --test test/importers-offline-scripts-so14.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const IMPORTERS = ['ita-import', 'b2b-import', 'austrian-import', 'brussels-import', 'swiss-import', 'swiss-market-import', 'swiss-magazine-import', 'swiss-sub-import', 'discover-import', 'import-batch'];

test('every site importer takes the bulk importer from bulk-importer.mjs, which honours EXCAT_IMPORT_SCRIPTS', () => {
  const chooser = fs.readFileSync(new URL('../tools/importer/bulk-importer.mjs', import.meta.url), 'utf8');
  assert.match(chooser, /if \(env\.EXCAT_IMPORT_SCRIPTS\) return env\.EXCAT_IMPORT_SCRIPTS;/);
  IMPORTERS.forEach((name) => {
    const src = fs.readFileSync(new URL(`../tools/importer/${name}.mjs`, import.meta.url), 'utf8');
    assert.match(src, /const CI = \(\) => bulkImporterScripts\(\);/, name);
  });
});

test('no importer names the install path on its own', () => {
  fs.readdirSync(new URL('../tools/importer/', import.meta.url)).filter((f) => f.endsWith('.mjs') && f !== 'bulk-importer.mjs').forEach((f) => {
    const src = fs.readFileSync(new URL(`../tools/importer/${f}`, import.meta.url), 'utf8');
    assert.doesNotMatch(src, /const CI = '\/home\/node\/\.excat-marketplaces/, f);
  });
});
