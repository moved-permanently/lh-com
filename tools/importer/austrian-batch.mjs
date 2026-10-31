/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, max-len, import/extensions -- tooling */
/**
 * One or more lh-ita batches end to end (content-sites/lh-austrian/runs/batch-NN.txt, austrian-plan.mjs),
 * as batch 1 was done by hand:
 *  1. capture: the batch's URLs without a snapshot (own or the Studio's, austrian-studio.mjs) through
 *     one warm Bright Data session (bd-session.mjs, /at/en/homepage first, a page every 6-10 s,
 *     1440 screenshot); the homepage of each root of the batch first, for its nav and footer;
 *  2. import (austrian-import.mjs: markets, nav and footer rows, link-outs, forms, relative DAM links);
 *  3. the nav and footer documents of the batch's roots (austrian-nav.mjs --root);
 *  4. DAM files (austrian-dam.mjs --list --download --upload --switch --report): copies in DA within
 *     the Edge Delivery limits, the rest for AEM;
 *  5. upload and preview (da-upload.mjs --site lh-ita), the batch check (austrian-check.mjs);
 *  6. one line "batch N previewed: <documents> documents, <path list file>" (or "imported, not
 *     previewed" and runs/pending-upload.txt when DA does not take the upload) and the files for AEM
 *     (runs/batch-NN-aem.tsv: page, edsDamPath, www path, bytes).
 * Bright Data steps stop at a block (exit 2): the runner waits 30 minutes, then goes on where it
 * stopped. Pages still without a snapshot after two sessions are imported in a later batch run.
 * Never publishes. Log: runs/austrian-batch.log (appended).
 *
 * Usage: node tools/importer/austrian-batch.mjs --from 2 --to 12
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const HOST = 'https://www.austrian.com';
const W = path.join(root, 'content-sites/lh-austrian');
const RUNS = path.join(W, 'runs');
const SNAP = path.join(root, 'tools/importer/bd-snapshots/www.austrian.com');
const LOG = path.join(RUNS, 'austrian-batch.log');
const PAUSE = 30 * 60 * 1000;
const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });
const log = (s) => {
  const line = `${new Date().toISOString()} ${s}`;
  console.log(line);
  fs.appendFileSync(LOG, `${line}\n`);
};
// the last block a run before this one recorded (its 30 minutes hold for this run too)
let lastBlock = (fs.existsSync(LOG) ? fs.readFileSync(LOG, 'utf8').split('\n') : [])
  .filter((l) => /: BLOCKED /.test(l)).map((l) => Date.parse(l.slice(0, 24)) || 0).reduce((a, b) => Math.max(a, b), 0);

/** A tool run (node, from the repository); its exit code and output. */
function run(args, { env = {}, timeout = 3 * 3600 * 1000 } = {}) {
  const r = spawnSync('node', args, {
    cwd: root, env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: '/ms-playwright', ...env }, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, timeout,
  });
  const out = `${r.stdout || ''}${r.stderr || ''}`.split('\n').filter((l) => l && !/MODULE_TYPELESS|Reparsing|To eliminate|trace-warnings|Connecting to Bright/.test(l));
  return { code: r.status, out };
}

/** A Bright Data step: waits out the 30 minutes after a block, records a new one. */
async function bd(args, label) {
  const wait = lastBlock + PAUSE - Date.now();
  if (wait > 0) {
    log(`${label}: waiting ${Math.ceil(wait / 60000)} min after the block at ${new Date(lastBlock).toISOString()}`);
    await sleep(wait);
  }
  const r = run(args);
  // a challenge or "Access Denied" on the warm-up page comes as a thrown error (exit 1)
  if (r.code === 2 || r.out.some((l) => /BLOCKED|; stopping|403 at|behind the challenge/.test(l))) {
    lastBlock = Date.now();
    log(`${label}: BLOCKED (${r.out.filter((l) => /BLOCKED|403|429|challenge/.test(l)).slice(-1)[0] || 'exit 2'}); 30 min stop`);
    return false;
  }
  if (r.code !== 0) log(`${label}: exit ${r.code}: ${r.out.slice(-3).join(' | ')}`);
  return true;
}

const snapOf = (u) => path.join(SNAP, `${new URL(u).pathname}.html`);

async function batch(n) {
  const name = `batch-${String(n).padStart(2, '0')}`;
  const list = path.join(RUNS, `${name}.txt`);
  if (!fs.existsSync(list)) { log(`${name}: no list`); return false; }
  const urls = fs.readFileSync(list, 'utf8').split('\n').map((u) => u.trim()).filter(Boolean);
  const roots = [...new Set(urls.map((u) => new URL(u).pathname.split('/').slice(1, 3).join('/')))];
  // 1. the gaps (the roots' homepages first: their nav and footer)
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const gaps = [...roots.map((r) => `${HOST}/${r}/homepage`), ...urls].filter((u, i, a) => a.indexOf(u) === i && !fs.existsSync(snapOf(u)));
    if (!gaps.length) break;
    const gapList = path.join(RUNS, `${name}-capture.txt`);
    fs.writeFileSync(gapList, `${gaps.join('\n')}\n`);
    log(`${name}: capturing ${gaps.length} pages without a snapshot`);
    await bd(['tools/importer/bd-session.mjs', '--list', gapList, '--anchor', `${HOST}/at/en/homepage`, '--state', path.join(W, 'bd-session-state.json'), '--pages-dir', path.join(W, 'pages'),
      '--widths', '1440', '--min-delay', '8000', '--max-delay', '10000', '--batch', '60', '--wait-until', 'domcontentloaded', '--format', 'jpg'], `${name} capture`);
  }
  const missing = urls.filter((u) => !fs.existsSync(snapOf(u)));
  if (missing.length) log(`${name}: still without a snapshot (404s, error pages or a block): ${missing.map((u) => new URL(u).pathname).join(' ')}`);
  // 2. import
  const imp = run(['tools/importer/austrian-import.mjs', '--list', list]);
  log(`${name}: import ${imp.out.filter((l) => /^batch|documents;/.test(l)).join(' | ')}`);
  const uploadList = path.join(RUNS, `${name}-upload.txt`);
  if (!fs.existsSync(uploadList)) { log(`${name}: import made no upload list`); return false; }
  // 3. nav and footer of the batch's roots (the sites allowlist gets them)
  const sites = path.join(root, 'tools/importer/sites/lh-austrian.json');
  const allow = JSON.parse(fs.readFileSync(sites, 'utf8'));
  const navDocs = [];
  roots.forEach((r) => {
    if (!fs.existsSync(path.join(SNAP, r, 'homepage.html'))) return;
    const nav = run(['tools/importer/austrian-nav.mjs', '--root', r]);
    if (nav.code === 0) navDocs.push(`/${r}/nav`, `/${r}/footer`);
  });
  allow.paths = [...new Set([...allow.paths, ...navDocs])];
  fs.writeFileSync(sites, `${JSON.stringify(allow, null, 1)}\n`);
  // 4. DAM files
  run(['tools/importer/austrian-dam.mjs', '--list']);
  await bd(['tools/importer/austrian-dam.mjs', '--download', '--min-delay', '8000', '--max-delay', '10000'], `${name} DAM`);
  const up = run(['tools/importer/austrian-dam.mjs', '--upload']);
  log(`${name}: DAM ${up.out.filter((l) => /upload:/.test(l)).join(' ')}`);
  const sw = run(['tools/importer/austrian-dam.mjs', '--switch', '--report']);
  log(`${name}: DAM ${sw.out.filter((l) => /switch|austrian-dam:/.test(l)).join(' | ')}`);
  // 5. upload and preview: the batch's documents, nav and footer, documents the DAM switch changed
  const docs = fs.readFileSync(uploadList, 'utf8').split('\n').filter(Boolean);
  const switched = fs.existsSync(path.join(RUNS, 'dam-switch-upload.txt')) ? fs.readFileSync(path.join(RUNS, 'dam-switch-upload.txt'), 'utf8').split('\n').filter(Boolean) : [];
  const all = [...new Set([...docs, ...navDocs, ...switched])];
  const full = path.join(RUNS, `${name}-preview.txt`);
  fs.writeFileSync(full, `${all.join('\n')}\n`);
  const da = run(['tools/importer/da-upload.mjs', '--site', 'lh-austrian', '--list', full]);
  log(`${name}: ${(da.out.find((l) => l.startsWith('da-upload: ')) || da.out.slice(-1)[0])}`);
  da.out.filter((l) => /^\s+\//.test(l)).forEach((l) => log(`${name}: problem ${l.trim()}`));
  const previewed = Number((((da.out.find((l) => l.startsWith('da-upload: ')) || da.out.slice(-1)[0]) || '').match(/(\d+) previewed/) || [])[1] || 0);
  if (previewed) {
    const check = run(['tools/importer/austrian-check.mjs', '--list', full]);
    check.out.slice(0, 2).forEach((l) => log(`${name}: ${l}`));
    check.out.slice(2).forEach((l) => log(`${name}: check ${l.trim()}`));
  }
  // 6. the files for AEM of the batch's pages
  const report = fs.existsSync(path.join(RUNS, 'dam-report.json')) ? JSON.parse(fs.readFileSync(path.join(RUNS, 'dam-report.json'), 'utf8')) : [];
  const docSet = new Set(docs);
  const aem = report.filter((x) => x.status === 'aem' && x.pages.some((p) => docSet.has(p)));
  fs.writeFileSync(path.join(RUNS, `${name}-aem.tsv`), `page\tedsDamPath\twww path\tbytes\n${aem.map((x) => `${x.pages.filter((p) => docSet.has(p)).join(' ')}\t${x.eds}\t${x.www}\t${x.bytes ?? x.note ?? ''}`).join('\n')}\n`);
  if (previewed) {
    console.log(`batch ${n} previewed: ${previewed} documents, ${path.relative(root, list)}`);
    fs.appendFileSync(LOG, `batch ${n} previewed: ${previewed} documents, ${path.relative(root, list)}; for AEM ${aem.length}\n`);
  } else {
    // DA did not take the upload (401 while the permission is off): built and checked locally, the
    // batch waits in runs/pending-upload.txt for da-upload.mjs once DA answers
    fs.appendFileSync(path.join(RUNS, 'pending-upload.txt'), `${name}\n`);
    console.log(`batch ${n} imported, not previewed (DA did not take the upload): ${all.length} documents, ${path.relative(root, list)}`);
    fs.appendFileSync(LOG, `batch ${n} imported, not previewed: ${all.length} documents; for AEM ${aem.length}\n`);
  }
  return true;
}

const from = Number(opt('from', 2));
const to = Number(opt('to', from));
for (let n = from; n <= to; n += 1) await batch(n);
