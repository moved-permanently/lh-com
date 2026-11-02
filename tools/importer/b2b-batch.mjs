/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, max-len, import/extensions -- tooling */
/**
 * lh-b2b's batches end to end (content-sites/lh-b2b/runs/batch-NN.txt, b2b-plan.mjs), as
 * brussels-batch.mjs, in three steps so that every document links every other one relative before
 * it goes to DA:
 *   --import <from>-<to>   the batches' pages imported from their snapshots (b2b-import.mjs), the
 *                          nav and footer of de/en and de/de (b2b-nav.mjs);
 *   --links                the links between the site's pages relative in every document
 *                          (own-links.mjs, after all imports: a page imported later than the page
 *                          linking it);
 *   --dam                  the DAM files (b2b-dam.mjs --list --download --upload --switch --report):
 *                          copies in DA within the Edge Delivery limits, the rest for AEM;
 *   --upload <from>-<to>   per batch its documents (with nav and footer in batch 1 and 2) uploaded
 *                          and previewed (da-upload.mjs --site lh-b2b), the previews checked (200,
 *                          the document's H1), one line "batch N previewed: X documents,
 *                          content-sites/lh-b2b/runs/batch-N.txt" and the files for AEM
 *                          (runs/batch-NN-aem.tsv: page, edsDamPath, www path, bytes).
 * Bright Data (the DAM downloads) stops at a block (exit 2): 30 minutes, then on. Never publishes.
 * Log: content-sites/lh-b2b/runs/b2b-batch.log (appended).
 *
 * Usage: node tools/importer/b2b-batch.mjs --import 1-16 | --links | --dam | --upload 1-16
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
const W = path.join(root, 'content-sites/lh-b2b');
const RUNS = path.join(W, 'runs');
const LOG = path.join(RUNS, 'b2b-batch.log');
const PREVIEW = 'https://main--lh-b2b--moved-permanently.aem.page';
const PAUSE = 30 * 60 * 1000;
const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });
const log = (s) => {
  const line = `${new Date().toISOString()} ${s}`;
  console.log(line);
  fs.appendFileSync(LOG, `${line}\n`);
};
const range = (s) => {
  const [a, b] = String(s || '').split('-').map(Number);
  return Array.from({ length: (b || a) - a + 1 }, (_, i) => a + i);
};
const nameOf = (n) => `batch-${String(n).padStart(2, '0')}`;
const lines = (f) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split('\n').map((x) => x.trim()).filter(Boolean) : []);

/** A tool run (node, from the repository); its exit code and output. */
function run(args, { timeout = 3 * 3600 * 1000 } = {}) {
  const r = spawnSync('node', args, {
    cwd: root, env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: '/ms-playwright' }, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, timeout,
  });
  const out = `${r.stdout || ''}${r.stderr || ''}`.split('\n').filter((l) => l && !/MODULE_TYPELESS|Reparsing|To eliminate|trace-warnings|Connecting to Bright/.test(l));
  return { code: r.status, out };
}

function importBatch(n) {
  const name = nameOf(n);
  const list = path.join(RUNS, `${name}.txt`);
  if (!fs.existsSync(list)) { log(`${name}: no list`); return; }
  const imp = run(['tools/importer/b2b-import.mjs', '--list', list]);
  log(`${name}: import ${imp.out.filter((l) => /^batch|documents;|WARNING|no snapshot/.test(l)).join(' | ')}`);
  if (n === 1 || n === 2) {
    const key = n === 1 ? 'de/en' : 'de/de';
    const nav = run(['tools/importer/b2b-nav.mjs', '--root', key]);
    log(`${name}: ${nav.out.slice(-1)[0]}`);
    const sites = path.join(root, 'tools/importer/sites/lh-b2b.json');
    const allow = JSON.parse(fs.readFileSync(sites, 'utf8'));
    allow.paths = [...new Set([...allow.paths, `/${key}/nav`, `/${key}/footer`])];
    fs.writeFileSync(sites, `${JSON.stringify(allow, null, 1)}\n`);
  }
}

async function dam() {
  run(['tools/importer/b2b-dam.mjs', '--list']).out.slice(-1).forEach((l) => log(`DAM ${l}`));
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const r = run(['tools/importer/b2b-dam.mjs', '--download', '--min-delay', '8000', '--max-delay', '10000']);
    r.out.filter((l) => /stopping|nothing to do|blocked/i.test(l)).forEach((l) => log(`DAM ${l}`));
    if (r.code !== 2) break;
    log('DAM: blocked; 30 min stop');
    await sleep(PAUSE);
  }
  run(['tools/importer/b2b-dam.mjs', '--upload']).out.filter((l) => /upload:|DA |preview /.test(l)).forEach((l) => log(`DAM ${l}`));
  run(['tools/importer/b2b-dam.mjs', '--switch', '--report']).out.filter((l) => /switch|b2b-dam:/.test(l)).forEach((l) => log(`DAM ${l}`));
}

/** The previews of a list: 200, and the document's first H1 in the preview's .plain.html. */
async function check(paths) {
  const bad = [];
  let i = 0;
  async function worker() {
    while (i < paths.length) {
      const p = paths[i];
      i += 1;
      const r = await fetch(`${PREVIEW}${p}.plain.html`).catch((e) => ({ status: 0, error: e.message }));
      const text = r.text ? await r.text() : '';
      const local = path.join(W, 'content', `${p}.plain.html`);
      // the H1's text (the preview writes entities its own way: &amp; or &#x26;)
      const h1Of = (h) => ((h.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '').replace(/<[^>]+>/g, '').replace(/&amp;|&#x26;/g, '&').replace(/&nbsp;|&#xa0;/g, ' ').replace(/\s+/g, ' ').trim();
      const h1 = h1Of(fs.existsSync(local) ? fs.readFileSync(local, 'utf8') : '');
      if (r.status !== 200) bad.push(`${p} ${r.status}`);
      else if (h1 && h1Of(text) !== h1) bad.push(`${p} H1 differs`);
    }
  }
  await Promise.all([1, 2, 3, 4].map(worker));
  return bad;
}

async function upload(n) {
  const name = nameOf(n);
  const docs = lines(path.join(RUNS, `${name}-upload.txt`));
  if (!docs.length) { log(`${name}: nothing imported`); return; }
  const navRoot = { 1: 'de/en', 2: 'de/de' }[n];
  const extra = navRoot ? [`/${navRoot}/nav`, `/${navRoot}/footer`] : [];
  const all = [...new Set([...docs, ...extra])];
  const full = path.join(RUNS, `${name}-preview.txt`);
  fs.writeFileSync(full, `${all.join('\n')}\n`);
  let summary = '';
  for (let pass = 0; pass < 3; pass += 1) {
    const da = run(['tools/importer/da-upload.mjs', '--site', 'lh-b2b', '--list', full, '--budget', '540'], { timeout: 600 * 1000 });
    summary = da.out.find((l) => l.startsWith('da-upload: ')) || da.out.slice(-1)[0] || '';
    log(`${name}: ${summary}`);
    da.out.filter((l) => /^\s+\//.test(l)).forEach((l) => log(`${name}: problem ${l.trim()}`));
    if (!/not done/.test(summary)) break;
  }
  const bad = await check(all);
  bad.forEach((b) => log(`${name}: check ${b}`));
  const report = fs.existsSync(path.join(RUNS, 'dam-report.json')) ? JSON.parse(fs.readFileSync(path.join(RUNS, 'dam-report.json'), 'utf8')) : [];
  const docSet = new Set(docs);
  const aem = report.filter((x) => x.status === 'aem' && x.pages.some((p) => docSet.has(p)));
  fs.writeFileSync(path.join(RUNS, `${name}-aem.tsv`), `page\tedsDamPath\twww path\tbytes\tnote\n${aem.map((x) => `${x.pages.filter((p) => docSet.has(p)).join(' ')}\t${x.eds}\t${x.www}\t${x.bytes ?? ''}\t${x.note ?? ''}`).join('\n')}\n`);
  const ok = all.length - bad.length;
  const line = `batch ${n} previewed: ${ok} documents, content-sites/lh-b2b/runs/${name}.txt${bad.length ? ` (${bad.length} not: ${bad.join(', ')})` : ''}; for AEM ${aem.length}`;
  console.log(line);
  fs.appendFileSync(LOG, `${line}\n`);
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  if (opt('import')) range(opt('import')).forEach(importBatch);
  if (argv.includes('--links')) {
    // aliases: www's path of a renamed document ("--", capitals, "_": b2b-scope.mjs docName) on any
    // root the site serves it on, as the documents link it -> the document's name there
    const { ownPages, sitePath } = await import('./own-links.mjs');
    const { docName } = await import('./b2b-scope.mjs');
    const pages = ownPages('lh-b2b');
    const aliases = {};
    const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
    walk(path.join(W, 'content')).filter((f) => f.endsWith('.plain.html')).forEach((f) => {
      [...fs.readFileSync(f, 'utf8').matchAll(/href="https:\/\/business\.lufthansagroup\.com(\/[^"#?]*)/g)].forEach(([, raw]) => {
        const p = sitePath(raw);
        if (!pages.has(p) && pages.has(docName(p))) aliases[p] = docName(p);
      });
    });
    fs.writeFileSync(path.join(root, 'tools/importer/sites/lh-b2b-aliases.json'), `${JSON.stringify(Object.fromEntries(Object.entries(aliases).sort()), null, 1)}\n`);
    log(`links: ${Object.keys(aliases).length} aliases (www paths of renamed documents)`);
    const r = run(['tools/importer/own-links.mjs', '--site', 'lh-b2b', '--host', 'business.lufthansagroup.com', '--write']);
    r.out.slice(-4).forEach((l) => log(`links ${l}`));
  }
  if (argv.includes('--dam')) await dam();
  if (opt('upload')) for (const n of range(opt('upload'))) await upload(n);
}
