/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, max-len, import/extensions -- tooling */
/**
 * One or more lh-swiss batches end to end (content-sites/lh-swiss/runs/batch-NN.txt, batch-c1.txt,
 * batch-x01.txt: swiss-plan.mjs), as brussels-batch.mjs does for lh-brussels, from the Studio's
 * snapshots only (swiss-studio.mjs --place; no page of www.swiss.com is loaded):
 *  1. import (swiss-import.mjs: markets, nav and footer rows, link-outs, forms, relative DAM links);
 *     a page without a snapshot is listed, not captured;
 *  2. the nav and footer documents of the batch's roots (swiss-nav.mjs --root), rebuilt each batch
 *     so their links to the pages imported so far are relative;
 *  3. DAM files (swiss-dam.mjs --list --known --download --upload --switch --report): plain GETs
 *     to www.swiss.com one at a time, 5-7 s apart; after the first 403, 429 or challenge (this run's
 *     or one the DAM state records) no further file is requested, the images not fetched show from
 *     their place in DA (--pending) and runs/batch-N-not-fetched.tsv lists the batch's files for the
 *     capture; copies in DA within the Edge Delivery limits, the rest for AEM (sizes from the
 *     groundwork's lists/media.tsv where www was not asked);
 *  4. upload and preview (da-upload.mjs --site lh-swiss): the batch's documents, nav and footer, the
 *     documents of earlier batches whose links to this batch's pages became relative, those the DAM
 *     switch changed; the batch check (swiss-check.mjs);
 *  5. one line "batch N previewed: <documents> documents, <path list file>" (or "imported, not
 *     previewed" and runs/pending-upload.txt when DA does not take the upload) and the files for AEM
 *     (runs/batch-N-aem.tsv: page, edsDamPath, www path, bytes).
 * Never publishes. Log: runs/swiss-batch.log (appended).
 *
 * Usage: node tools/importer/swiss-batch.mjs --batches 01,02,c1,x01
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const W = path.join(root, 'content-sites/lh-swiss');
const RUNS = path.join(W, 'runs');
const DOCS = path.join(W, 'content');
const SNAP = path.join(root, 'tools/importer/bd-snapshots/www.swiss.com');
const LOG = path.join(RUNS, 'swiss-batch.log');
const log = (s) => {
  const line = `${new Date().toISOString()} ${s}`;
  console.log(line);
  fs.appendFileSync(LOG, `${line}\n`);
};
// a block of the DAM downloads (in this run or recorded in the DAM state by an earlier one): no
// further request to www; the images not fetched show from their place in DA (swiss-dam --pending)
const DAM_STATE = path.join(W, 'dam-state.json');
let damBlocked = fs.existsSync(DAM_STATE) && Object.values(JSON.parse(fs.readFileSync(DAM_STATE, 'utf8'))).some((v) => /^blocked-|^fetch-failed/.test(v.status || ''));

/** A tool run (node, from the repository); its exit code and output. */
function run(args, { timeout = 6 * 3600 * 1000 } = {}) {
  const r = spawnSync('node', args, {
    cwd: root, env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: '/ms-playwright' }, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, timeout,
  });
  const out = `${r.stdout || ''}${r.stderr || ''}`.split('\n').filter((l) => l && !/MODULE_TYPELESS|Reparsing|To eliminate|trace-warnings/.test(l));
  return { code: r.status, out };
}

const walk = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])) : []);
/** The documents and their content (to find those a step changed). */
const docsNow = () => new Map(walk(DOCS).filter((f) => f.endsWith('.plain.html')).map((f) => [`/${path.relative(DOCS, f).replace(/\.plain\.html$/, '')}`, fs.readFileSync(f, 'utf8')]));

async function batch(n) {
  const name = `batch-${n}`;
  const list = path.join(RUNS, `${name}.txt`);
  if (!fs.existsSync(list)) { log(`${name}: no list`); return false; }
  const urls = fs.readFileSync(list, 'utf8').split('\n').map((u) => u.trim()).filter(Boolean);
  const roots = [...new Set(urls.map((u) => new URL(u).pathname.split('/').slice(1, 3).join('/')))];
  const missing = urls.filter((u) => !fs.existsSync(path.join(SNAP, `${new URL(u).pathname}.html`)));
  if (missing.length) log(`${name}: without a snapshot (not captured, for the report): ${missing.map((u) => new URL(u).pathname).join(' ')}`);
  const before = docsNow();
  // 1. import
  const imp = run(['tools/importer/swiss-import.mjs', '--list', list]);
  log(`${name}: import ${imp.out.filter((l) => /^batch|documents;|WARNING/.test(l)).join(' | ')}`);
  const uploadList = path.join(RUNS, `${name}-upload.txt`);
  if (imp.code !== 0 || !fs.existsSync(uploadList)) { log(`${name}: import failed (exit ${imp.code}): ${imp.out.slice(-3).join(' | ')}`); return false; }
  // 2. nav and footer of the batch's roots (the sites allowlist gets them)
  const sites = path.join(root, 'tools/importer/sites/lh-swiss.json');
  const allow = JSON.parse(fs.readFileSync(sites, 'utf8'));
  const navDocs = [];
  roots.forEach((r) => {
    if (!fs.existsSync(path.join(SNAP, r, 'homepage.html'))) return;
    const nav = run(['tools/importer/swiss-nav.mjs', '--root', r]);
    if (nav.code === 0) navDocs.push(`/${r}/nav`, `/${r}/footer`);
    else log(`${name}: nav ${r} exit ${nav.code}: ${nav.out.slice(-2).join(' | ')}`);
  });
  allow.paths = [...new Set([...allow.paths, ...navDocs])];
  fs.writeFileSync(sites, `${JSON.stringify(allow, null, 1)}\n`);
  // 3. DAM files
  // without the batch's list the switch would leave www's image URLs in the documents (and the
  // preview would load them from www): the batch stops before its upload
  const listed = run(['tools/importer/swiss-dam.mjs', '--list', '--known']);
  if (listed.code !== 0) { log(`${name}: DAM list failed (exit ${listed.code}): ${listed.out.filter((l) => /Error/.test(l)).slice(-1)[0] || listed.out.slice(-1)[0]}; not uploaded`); return false; }
  if (!damBlocked) {
    const dl = run(['tools/importer/swiss-dam.mjs', '--download']);
    const tail = dl.out.filter((l) => /BLOCKED|nothing to do/.test(l));
    if (dl.code === 2) {
      damBlocked = true;
      log(`${name}: DAM ${tail.join(' ')}; no further file is requested in this run`);
    } else {
      log(`${name}: DAM download ${dl.out.filter((l) => /^200 /.test(l)).length} files${tail.length ? ` (${tail.join(' ')})` : ''}${dl.code ? `, exit ${dl.code}: ${dl.out.slice(-2).join(' | ')}` : ''}`);
    }
  }
  const up = run(['tools/importer/swiss-dam.mjs', '--upload']);
  log(`${name}: DAM ${up.out.filter((l) => /upload:/.test(l)).join(' ')}`);
  up.out.filter((l) => /^ {2}\//.test(l)).slice(0, 20).forEach((l) => log(`${name}: DAM problem ${l.trim()}`));
  const sw = run(['tools/importer/swiss-dam.mjs', '--switch', '--report', ...(damBlocked ? ['--pending'] : [])]);
  log(`${name}: DAM ${sw.out.filter((l) => /switch|swiss-dam:/.test(l)).join(' | ')}`);
  // 4. upload and preview: the batch's documents, nav and footer, earlier documents this run changed
  const docs = fs.readFileSync(uploadList, 'utf8').split('\n').filter(Boolean);
  const after = docsNow();
  const changed = [...after.keys()].filter((p) => before.has(p) && before.get(p) !== after.get(p) && allow.paths.includes(p));
  const all = [...new Set([...docs, ...navDocs, ...changed])];
  const full = path.join(RUNS, `${name}-preview.txt`);
  fs.writeFileSync(full, `${all.join('\n')}\n`);
  const da = run(['tools/importer/da-upload.mjs', '--site', 'lh-swiss', '--list', full]);
  const summary = da.out.find((l) => l.startsWith('da-upload: ')) || da.out.slice(-1)[0] || '';
  log(`${name}: ${summary}`);
  da.out.filter((l) => /^\s+\//.test(l)).forEach((l) => log(`${name}: problem ${l.trim()}`));
  const previewed = Number((summary.match(/(\d+) previewed/) || [])[1] || 0);
  if (previewed) {
    const check = run(['tools/importer/swiss-check.mjs', '--list', full]);
    check.out.slice(0, 2).forEach((l) => log(`${name}: ${l}`));
    check.out.slice(2).forEach((l) => log(`${name}: check ${l.trim()}`));
  }
  // 5. the files for AEM of the batch's pages
  const report = fs.existsSync(path.join(RUNS, 'dam-report.json')) ? JSON.parse(fs.readFileSync(path.join(RUNS, 'dam-report.json'), 'utf8')) : [];
  const docSet = new Set(docs);
  const aem = report.filter((x) => x.status === 'aem' && x.pages.some((p) => docSet.has(p)));
  fs.writeFileSync(path.join(RUNS, `${name}-aem.tsv`), `page\tedsDamPath\twww path\tbytes\n${aem.map((x) => `${x.pages.filter((p) => docSet.has(p)).join(' ')}\t${x.eds}\t${x.www}\t${x.bytes ?? x.note ?? ''}`).join('\n')}\n`);
  // the batch's paths (documents and nav, footer) for the report; the batch's files not fetched
  fs.writeFileSync(path.join(RUNS, `${name}-paths.txt`), `${all.join('\n')}\n`);
  const notFetched = report.filter((x) => !['cached', 'aem'].includes(x.status) && !/^www-/.test(x.status || '') && x.pages.some((p) => docSet.has(p) || navDocs.includes(p)));
  fs.writeFileSync(path.join(RUNS, `${name}-not-fetched.tsv`), `www path\tedsDamPath\tkind\tpages\n${notFetched.map((x) => `${x.www}\t${x.eds}\t${x.kind}\t${x.pages.join(' ')}`).join('\n')}\n`);
  if (previewed) {
    console.log(`batch ${n} previewed: ${previewed} documents, content-sites/lh-swiss/runs/${name}.txt`);
    fs.appendFileSync(LOG, `batch ${n} previewed: ${previewed} documents, content-sites/lh-swiss/runs/${name}.txt; for AEM ${aem.length}\n`);
  } else {
    fs.appendFileSync(path.join(RUNS, 'pending-upload.txt'), `${name}\n`);
    console.log(`batch ${n} imported, not previewed (DA did not take the upload): ${all.length} documents, content-sites/lh-swiss/runs/${name}.txt`);
    fs.appendFileSync(LOG, `batch ${n} imported, not previewed: ${all.length} documents; for AEM ${aem.length}\n`);
  }
  return true;
}

for (const n of opt('batches', '').split(',').map((x) => x.trim()).filter(Boolean)) await batch(n);
