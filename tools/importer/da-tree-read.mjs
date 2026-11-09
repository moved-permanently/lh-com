/* eslint-disable no-console, no-await-in-loop, no-continue, max-len -- dev tooling */
/**
 * A DA site's whole tree, read only: every folder listed (admin.da.live/list, continuation tokens followed), every
 * .html document's source saved as <out>/<path>.plain.html (DA's <body>…</body>, byte for byte), for the collapse
 * CLI's --check (the harness pages' census: harness-pass-<brand>.md). GET requests only; the credentials are the
 * environment's. Never writes to DA and never previews; tests don't call it.
 * Skipped: /.token-free-backup/ (the passes' backups) and --skip prefixes. Resumes: a document already saved with
 * the same lastModified (<out>/.da-tree.json) isn't read again.
 *
 * Usage: node tools/importer/da-tree-read.mjs --site lh-tap --out work/census/lh-tap [--org moved-permanently]
 *   [--root /de-de] [--skip /drafts,/config] [--parallel 4] [--pause 100]
 *   Writes <out>/.da-tree.json (path, lastModified, bytes, status per document) and prints the totals.
 */
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const org = opt('org', 'moved-permanently');
const site = opt('site');
const out = opt('out');
const root = (opt('root', '') || '').replace(/\/$/, '');
// a pass's backups are read only when asked for (--root /.token-free-backup/<pass>)
const skip = [...(root.startsWith('/.token-free-backup') ? [] : ['/.token-free-backup']), ...(opt('skip', '') || '').split(',').filter(Boolean)];
const parallel = Number(opt('parallel', 4));
const pause = Number(opt('pause', 100));
if (!site || !out) {
  console.error('usage: da-tree-read.mjs --site <site> --out <dir> [--root /path] [--skip /a,/b] [--parallel 4] [--pause 100]');
  process.exit(2);
}
const API = 'https://admin.da.live';
const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });

/** GET with retries (the network may drop): the response, or null after the last try. */
async function get(url, headers = {}) {
  for (let i = 0; i < 5; i += 1) {
    try {
      const r = await fetch(url, { method: 'GET', headers });
      if (r.status === 200 || r.status === 404) return r;
      if (r.status === 401 || r.status === 403) { console.error(`${r.status} on ${url}: no read access`); process.exit(3); }
    } catch (e) { /* retried */ }
    await sleep(1000 * 2 ** i);
  }
  return null;
}

async function list(dir) {
  const items = [];
  let token = null;
  do {
    const r = await get(`${API}/list/${org}/${site}${dir}`, token ? { 'da-continuation-token': token } : {});
    if (!r) throw new Error(`list failed: ${dir}`);
    if (r.status === 404) return items;
    items.push(...await r.json());
    token = r.headers.get('da-continuation-token');
  } while (token);
  return items;
}

const statePath = path.join(out, '.da-tree.json');
fs.mkdirSync(out, { recursive: true });
const state = fs.existsSync(statePath) ? JSON.parse(fs.readFileSync(statePath, 'utf8')) : {};
const docs = [];
const dirs = [root];
while (dirs.length) {
  const dir = dirs.shift();
  (await list(dir)).forEach((it) => {
    const p = it.path.replace(`/${org}/${site}`, '');
    if (skip.some((s) => p === s || p.startsWith(`${s}/`) || p.startsWith(`${s}.`))) return;
    if (!it.ext) dirs.push(p);
    else if (it.ext === 'html') docs.push({ path: p.replace(/\.html$/, ''), lastModified: it.lastModified });
  });
}
console.log(`${site}: ${docs.length} documents listed`);
let read = 0; let kept = 0; let failed = 0;
const queue = [...docs];
await Promise.all(Array.from({ length: parallel }, async () => {
  while (queue.length) {
    const d = queue.shift();
    const file = path.join(out, `${d.path}.plain.html`);
    if (state[d.path]?.lastModified === d.lastModified && state[d.path].status === 200 && fs.existsSync(file)) { kept += 1; continue; }
    const r = await get(`${API}/source/${org}/${site}${d.path}.html`);
    if (!r || r.status !== 200) { failed += 1; state[d.path] = { lastModified: d.lastModified, status: r ? r.status : 0 }; continue; }
    const body = await r.text();
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, body);
    state[d.path] = { lastModified: d.lastModified, status: 200, bytes: Buffer.byteLength(body) };
    read += 1;
    if (read % 200 === 0) { fs.writeFileSync(statePath, JSON.stringify(state)); console.log(`  ${read} read`); }
    await sleep(pause);
  }
}));
fs.writeFileSync(statePath, JSON.stringify(state));
const bytes = Object.values(state).reduce((s, x) => s + (x.bytes || 0), 0);
console.log(`${site}: ${docs.length} documents, ${read} read, ${kept} unchanged, ${failed} failed, ${(bytes / 1048576).toFixed(1)} MB`);
process.exit(failed ? 1 : 0);
