/* eslint-disable no-console -- tooling */
/**
 * A copy of excat's bulk importer that cannot reach the network (brief 156: imports read
 * snapshots only). run-bulk-import.js tries the live page first unless its workspace is flagged
 * bot-protected, and a snapshot's absolute resources load while it renders; the copy
 *  - aborts every request of the page that renders a snapshot (page.route, before setContent),
 *  - throws instead of any live page.goto (no live fetch, also not after a failed snapshot).
 * The workspace must still carry .migration/project.json {"botProtected": true} and --html-dir
 * must be the parent of the <host>/ folders (tools/importer/bd-snapshots).
 *
 * Usage: node tools/importer/offline-importer.mjs [dir]   (default /tmp/excat-offline)
 *   prints the scripts directory; use it as EXCAT_IMPORT_SCRIPTS for discover-import.mjs and
 *   import-batch.mjs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const SRC = '/home/node/.excat-marketplaces/excat-marketplace/excat';
const dest = path.resolve(process.argv[2] || '/tmp/excat-offline');
const scripts = path.join(dest, 'skills/excat-content-import/scripts');
const srcScripts = path.join(SRC, 'skills/excat-content-import/scripts');
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
s = s.replace(SET, `      // offline copy (tools/importer/offline-importer.mjs): no request leaves the browser\n      await page.route('**/*', (route) => route.abort());\n${SET}`);
const gotos = (s.match(/await page\.goto\(url,/g) || []).length;
if (!gotos) throw new Error('run-bulk-import.js changed: no page.goto(url, found');
s = s.replace(/await page\.goto\(url,/g, "(() => { throw new Error('offline importer: live fetch disabled'); })(); await page.goto(url,");
fs.writeFileSync(file, s);
console.log(scripts);
