/* eslint-disable no-console */
/**
 * Imports pages of a template from their Bright Data snapshots only (never the live site:
 * a URL without a snapshot is skipped, so the importer cannot open its own session).
 * Progress: tools/importer/import-progress.json (url → {template, status, at}).
 *
 * Usage: node tools/importer/import-batch.mjs <template> [--locale de/en] [--batch 40]
 *          [--url <url> ...] [--force]
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CI = '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts';
const argv = process.argv.slice(2);
const template = argv[0];
const opt = (name, def) => (argv.includes(`--${name}`) ? argv[argv.indexOf(`--${name}`) + 1] : def);
const urlArgs = argv.flatMap((a, i) => (a === '--url' ? [argv[i + 1]] : []));
const locale = opt('locale');
const batch = Number(opt('batch', 40));
const force = argv.includes('--force');

const progressFile = path.join(root, 'tools/importer/import-progress.json');
const progress = fs.existsSync(progressFile) ? JSON.parse(fs.readFileSync(progressFile, 'utf8')) : {};
const { templates } = JSON.parse(fs.readFileSync(path.join(root, 'tools/importer/page-templates.json'), 'utf8'));
const t = templates.find((x) => x.name === template);
if (!t) throw new Error(`unknown template ${template}`);

const snapshot = (u) => path.join(root, 'tools/importer/bd-snapshots', `${new URL(u).hostname}${new URL(u).pathname.replace(/\/$/, '')}.html`);
const plain = (u) => path.join(root, 'content', `${new URL(u).pathname.replace(/\/$/, '')}.plain.html`);
const inLocale = (u) => !locale || new URL(u).pathname.replace(/^\/lhg/, '').startsWith(`/${locale}/`) || new URL(u).pathname.replace(/^\/lhg/, '') === `/${locale}`;

const candidates = (urlArgs.length ? urlArgs : t.urls).filter(inLocale);
const noSnapshot = candidates.filter((u) => !fs.existsSync(snapshot(u)));
const todo = candidates
  .filter((u) => fs.existsSync(snapshot(u)))
  .filter((u) => force || progress[u]?.status !== 'ok')
  .slice(0, batch);

if (!todo.length) {
  console.log(`${template}: nothing to import (${noSnapshot.length} without snapshot)`);
  process.exit(0);
}

const bundle = path.join(root, `tools/importer/import-${template}.bundle.js`);
const urlsFile = path.join(root, `tools/importer/urls-${template}.txt`);
fs.writeFileSync(urlsFile, `${todo.join('\n')}\n`);
const run = spawnSync('node', [`${CI}/run-bulk-import.js`, '--import-script', bundle, '--urls', urlsFile, '--force'], {
  cwd: root, encoding: 'utf8', timeout: 540000, maxBuffer: 64 * 1024 * 1024,
});
if (run.status !== 0) console.error((run.stderr || '').split('\n').slice(-15).join('\n'));

let ok = 0;
todo.forEach((u) => {
  const fresh = fs.existsSync(plain(u)) && fs.statSync(plain(u)).mtimeMs > Date.now() - 600000;
  progress[u] = { template, status: fresh ? 'ok' : 'failed', at: new Date().toISOString() };
  if (fresh) ok += 1;
});
fs.writeFileSync(progressFile, `${JSON.stringify(progress, null, 1)}\n`);

const counts = {};
Object.entries(progress).filter(([, p]) => p.status === 'ok').forEach(([u]) => {
  const p = new URL(u).pathname;
  const key = p.startsWith('/lhg/') ? 'aircore' : p.split('/').slice(1, 3).join('/');
  counts[key] = (counts[key] || 0) + 1;
});
console.log(`${template}: ${ok}/${todo.length} imported, ${noSnapshot.length} without snapshot; totals ${JSON.stringify(counts)}`);
