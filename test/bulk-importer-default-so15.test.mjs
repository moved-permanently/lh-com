/* eslint-disable max-len, import/extensions */
/* Standing order 15 of 2026-11-13, item 1: since 983412fa the site importers took EXCAT_IMPORT_SCRIPTS, but unset they
   still ran excat's stock bulk importer, whose snapshot render loads a snapshot's absolute resources (pictures, scripts)
   from wherever they point, airline hosts among them. tools/importer/bulk-importer.mjs picks the importer for all of
   them: EXCAT_IMPORT_SCRIPTS when set; the stock importer only on the explicit opt-in EXCAT_IMPORT_STOCK=1; else the
   network-blocked copy (offline-importer.mjs: every request of the render aborted, no live page), built when missing
   or older than the stock importer.
   Run: node --test test/bulk-importer-default-so15.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { bulkImporterScripts, STOCK_SCRIPTS, OFFLINE_MARK } from '../tools/importer/bulk-importer.mjs';

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'bulk-'));
const fakeStock = (dir) => {
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'run-bulk-import.js'), 'stock');
  return dir;
};

test('EXCAT_IMPORT_SCRIPTS wins; the stock importer only on EXCAT_IMPORT_STOCK=1', () => {
  assert.equal(bulkImporterScripts({ env: { EXCAT_IMPORT_SCRIPTS: '/x/scripts' }, build: () => assert.fail('no build') }), '/x/scripts');
  assert.equal(bulkImporterScripts({ env: { EXCAT_IMPORT_STOCK: '1' }, build: () => assert.fail('no build') }), STOCK_SCRIPTS);
  assert.match(STOCK_SCRIPTS, /excat-content-import\/scripts$/);
});

test('by default the offline copy, built when missing, reused when current, rebuilt when the stock importer is newer', () => {
  const root = tmp();
  const stock = fakeStock(path.join(root, 'stock'));
  const dir = path.join(root, 'offline');
  const scripts = path.join(dir, 'skills/excat-content-import/scripts');
  const builds = [];
  const build = (d, src) => {
    builds.push([d, src]);
    fs.mkdirSync(scripts, { recursive: true });
    fs.writeFileSync(path.join(scripts, 'run-bulk-import.js'), `x ${OFFLINE_MARK} y`);
  };
  const env = { EXCAT_OFFLINE_DIR: dir, EXCAT_IMPORT_SCRIPTS_SOURCE: stock };
  assert.equal(bulkImporterScripts({ env, build }), scripts);
  assert.deepEqual(builds, [[dir, stock]]);
  assert.equal(bulkImporterScripts({ env, build }), scripts);
  assert.equal(builds.length, 1, 'a current copy is reused');
  const later = new Date(Date.now() + 60000);
  fs.utimesSync(path.join(stock, 'run-bulk-import.js'), later, later);
  bulkImporterScripts({ env, build });
  assert.equal(builds.length, 2, 'rebuilt after the stock importer changed');
  fs.writeFileSync(path.join(scripts, 'run-bulk-import.js'), 'not patched');
  fs.utimesSync(path.join(scripts, 'run-bulk-import.js'), new Date(Date.now() + 120000), new Date(Date.now() + 120000));
  bulkImporterScripts({ env, build });
  assert.equal(builds.length, 3, 'a copy without the offline patch is rebuilt');
  fs.rmSync(root, { recursive: true, force: true });
});

test('offline-importer.mjs writes the mark the check looks for', () => {
  const src = fs.readFileSync(new URL('../tools/importer/offline-importer.mjs', import.meta.url), 'utf8');
  assert.ok(src.includes(OFFLINE_MARK));
});

const IMPORTERS = ['ita-import', 'b2b-import', 'austrian-import', 'brussels-import', 'swiss-import', 'swiss-market-import', 'swiss-magazine-import', 'swiss-sub-import', 'discover-import', 'import-batch'];

test('every site importer and the info import take the importer from bulk-importer.mjs', () => {
  IMPORTERS.forEach((name) => {
    const src = fs.readFileSync(new URL(`../tools/importer/${name}.mjs`, import.meta.url), 'utf8');
    assert.match(src, /import \{ bulkImporterScripts \} from '\.\/bulk-importer\.mjs';/, name);
    assert.match(src, /const CI = \(\) => bulkImporterScripts\(\);/, name);
    assert.doesNotMatch(src, /\bCI\b(?!\(\)| = \(\) =>)/, `${name}: CI only called (no build at import)`);
    assert.doesNotMatch(src, /excat-marketplace\/excat\/skills\/excat-content-import\/scripts/, `${name}: no install path of its own`);
  });
});
