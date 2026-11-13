/* eslint-disable no-console -- tooling */
/**
 * Which excat bulk importer (run-bulk-import.js's scripts directory) the site importers and the info import run
 * (standing order 15 of 2026-11-13): the stock importer's snapshot render loads a snapshot's absolute resources
 * (pictures, scripts) from wherever they point, airline hosts among them, so the default is the network-blocked copy
 * (tools/importer/offline-importer.mjs: every request of the render aborted, no live page).
 * - EXCAT_IMPORT_SCRIPTS: that directory, as given;
 * - EXCAT_IMPORT_STOCK=1: the stock importer (the explicit opt-in);
 * - else the offline copy in EXCAT_OFFLINE_DIR (default /tmp/excat-offline), built from EXCAT_IMPORT_SCRIPTS_SOURCE
 *   (default the stock importer) when missing, not patched, or older than its source.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const STOCK_SCRIPTS = '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts';
/** The comment offline-importer.mjs writes into the copy's run-bulk-import.js. */
export const OFFLINE_MARK = 'offline copy (tools/importer/offline-importer.mjs): no request leaves the browser';

const here = path.dirname(fileURLToPath(import.meta.url));

/** Builds the offline copy into dir from the scripts in src (offline-importer.mjs). */
function buildOffline(dir, src) {
  console.log(`bulk importer: building the offline copy in ${dir}`);
  execFileSync(process.execPath, [path.join(here, 'offline-importer.mjs'), dir], {
    env: { ...process.env, EXCAT_IMPORT_SCRIPTS_SOURCE: src },
    stdio: ['ignore', 'ignore', 'inherit'],
  });
}

const mtime = (f) => (fs.existsSync(f) ? fs.statSync(f).mtimeMs : 0);

/**
 * @param {{env?: Object, build?: Function}} [options] for tests: the environment and the builder
 * @returns {string} the scripts directory holding run-bulk-import.js
 */
export function bulkImporterScripts({ env = process.env, build = buildOffline } = {}) {
  if (env.EXCAT_IMPORT_SCRIPTS) return env.EXCAT_IMPORT_SCRIPTS;
  if (env.EXCAT_IMPORT_STOCK === '1') return STOCK_SCRIPTS;
  const src = env.EXCAT_IMPORT_SCRIPTS_SOURCE || STOCK_SCRIPTS;
  const dir = env.EXCAT_OFFLINE_DIR || '/tmp/excat-offline';
  const scripts = path.join(dir, 'skills/excat-content-import/scripts');
  const runner = path.join(scripts, 'run-bulk-import.js');
  const current = fs.existsSync(runner) && fs.readFileSync(runner, 'utf8').includes(OFFLINE_MARK)
    && mtime(runner) >= mtime(path.join(src, 'run-bulk-import.js'));
  if (!current) build(dir, src);
  return scripts;
}
