/* eslint-disable no-console -- tooling */
/**
 * A copy of excat's bulk importer that cannot reach the network (brief 156: imports read
 * snapshots only). run-bulk-import.js tries the live page first unless its workspace is flagged
 * bot-protected, and a snapshot's absolute resources load while it renders; the copy
 *  - aborts every request of the page that renders a snapshot (page.route, before setContent),
 *  - drops the snapshot's resource hints first (prefetch, preload, modulepreload, preconnect,
 *    dns-prefetch, prerender): Chromium fetches hints past the routing (standing order 17: three
 *    info snapshots opened 88 connections to shop.lufthansa.com, the booking app's prefetches),
 *  - starts its browser behind a dead local proxy (127.0.0.1:9; loopback stays direct), so whatever
 *    still gets past the routing fails on this machine,
 *  - throws instead of any live page.goto (no live fetch, also not after a failed snapshot).
 * The workspace must still carry .migration/project.json {"botProtected": true} and --html-dir
 * must be the parent of the <host>/ folders (tools/importer/bd-snapshots).
 *
 * Usage: node tools/importer/offline-importer.mjs [dir]   (default /tmp/excat-offline)
 *   prints the scripts directory; use it as EXCAT_IMPORT_SCRIPTS for discover-import.mjs and
 *   import-batch.mjs.
 *   EXCAT_IMPORT_SCRIPTS_SOURCE: the importer scripts to copy (default excat's install); their
 *   utils are three folders up, as the scripts import them (../../../utils).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const srcScripts = path.resolve(process.env.EXCAT_IMPORT_SCRIPTS_SOURCE || '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts');
const SRC = path.resolve(srcScripts, '../../..');
const dest = path.resolve(process.argv[2] || '/tmp/excat-offline');
const scripts = path.join(dest, 'skills/excat-content-import/scripts');
fs.mkdirSync(scripts, { recursive: true });
fs.mkdirSync(path.join(dest, 'utils'), { recursive: true });
execFileSync('tar', ['cf', path.join(dest, 'scripts.tar'), '--exclude=node_modules', '-C', srcScripts, '.']);
execFileSync('tar', ['xf', path.join(dest, 'scripts.tar'), '-C', scripts]);
fs.rmSync(path.join(dest, 'scripts.tar'));
fs.cpSync(path.join(SRC, 'utils'), path.join(dest, 'utils'), { recursive: true });
[path.join(scripts, 'node_modules'), path.join(dest, 'node_modules')].forEach((link) => {
  fs.rmSync(link, { force: true, recursive: true });
  fs.symlinkSync(path.join(srcScripts, 'node_modules'), link);
});
const file = path.join(scripts, 'run-bulk-import.js');
let s = fs.readFileSync(file, 'utf8');
const SET = "      await page.setContent(savedHtml, { waitUntil: 'domcontentloaded', timeout: PAGE_TIMEOUT });";
if (!s.includes(SET)) throw new Error('run-bulk-import.js changed: setContent line not found, patch by hand');
// the copy's regular expression literal for the hints (as source text)
const HINTS = String.raw`/<link\b[^>]*\brel\s*=\s*["']?[^"'>]*\b(?:prefetch|preload|modulepreload|preconnect|dns-prefetch|prerender)\b[^>]*>/gi`;
s = s.replace(SET, [
  '      // offline copy (tools/importer/offline-importer.mjs): no request leaves the browser, no resource hints, a dead proxy',
  "      await page.route('**/*', (route) => route.abort());",
  '      // resource hints are fetched past the routing: the snapshot without them',
  `      const hintless = savedHtml.replace(${HINTS}, '');`,
  SET.replace('setContent(savedHtml', 'setContent(hintless'),
].join('\n'));
const ARGS = '  const args = [\n';
if (!s.includes(ARGS)) throw new Error('run-bulk-import.js changed: launch arguments not found, patch by hand');
s = s.replace(ARGS, `${ARGS}    '--proxy-server=http://127.0.0.1:9',\n`);
const gotos = (s.match(/await page\.goto\(url,/g) || []).length;
if (!gotos) throw new Error('run-bulk-import.js changed: no page.goto(url, found');
s = s.replace(/await page\.goto\(url,/g, "(() => { throw new Error('offline importer: live fetch disabled'); })(); await page.goto(url,");
fs.writeFileSync(file, s);
console.log(scripts);
