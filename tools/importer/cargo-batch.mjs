/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, max-len, import/extensions, import/no-extraneous-dependencies -- tooling */
/**
 * One Lufthansa Cargo batch (lh-cargo), start to preview, with the Cargo tools in order:
 *  1. capture its pages (cargo-capture.mjs: Bright Data, one page every 5-10 s);
 *  2. import them (cargo-import.mjs) and resolve the unknown addresses they link (www addresses
 *     neither in the page list nor known as out of scope, no files, no articles; cargo-capture.mjs
 *     --resolve, same pace); then the paths (cargo-paths.mjs: www's redirects to pages in scope);
 *  3. their files (cargo-assets.mjs --list --pages, --download: same pace; --upload: documents
 *     and videos to DA, previewed);
 *  4. import again (now with the files) and the documents earlier batches link differently now
 *     (--also <file>: their source URLs); upload and preview (da-upload.mjs --site lh-cargo, only
 *     documents that changed); the redirects (cargo-paths.mjs: tools/importer/cargo-redirects.json);
 *  5. every document opened on the preview host (blocks loaded, H1, header, footer, images) and
 *     compared with its snapshot (cargo-check.mjs: text, images, links; under 90% of the text named);
 *  6. content-sites/lh-cargo/runs/batch-<n>.txt: the documents and files previewed.
 * A step that answers a block (exit 2) stops the batch; run it again after the 30 minutes.
 * Nothing is published.
 *
 * Usage: node tools/importer/cargo-batch.mjs --batch 2 [--also content-sites/lh-cargo/runs/x.txt] [--skip-capture]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { sourcePath } from './cargo-paths.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
const n = Number(opt('batch'));
if (!n) { console.log('usage: --batch <n>'); process.exit(1); }
const W = path.join(root, 'content-sites/lh-cargo');
const RUNS = path.join(W, 'runs');
const list = path.join(W, 'batches', `batch-${String(n).padStart(2, '0')}.txt`);
const name = `batch-${n}`;
const readJson = (f, d) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d);
const lines = (f) => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter(Boolean) : []);
const tool = (file) => path.join(root, 'tools/importer', file);

function step(label, file, args) {
  console.log(`\n== ${name}: ${label}`);
  const r = spawnSync('node', [tool(file), ...args], { cwd: root, stdio: 'inherit' });
  if (r.status === 2) { console.error(`${name}: stopped at "${label}" (blocked): again after 30 minutes`); process.exit(2); }
  if (r.status !== 0) { console.error(`${name}: "${label}" failed (${r.status})`); process.exit(1); }
}

/** The addresses the batch's documents link that www may still send somewhere in scope. */
function unknownAddresses() {
  const known = new Set();
  [path.join(W, 'delivery/urls-all.tsv'), tool('cargo-extra-urls.tsv')].forEach((f) => lines(f).slice(1).forEach((l) => known.add(sourcePath(l.split('\t')[0]))));
  const capture = readJson(path.join(W, 'capture-state.json'), {});
  const report = readJson(path.join(RUNS, `${name}-import.json`), {});
  const out = new Set();
  Object.values(report).forEach((r) => (r.linkedOut || []).forEach((p) => {
    if (known.has(p) || capture[p] || /^\/(documents|o|c|image|web|group|api)\//.test(p) || p.includes('/-/') || p === '/') return;
    // the language versions of a known out-of-scope address (portal tools) stay links without a request
    const bare = p.replace(/^\/(en|de)(?=\/)/, '');
    if (known.has(`/en${bare}`) || known.has(`/de${bare}`)) return;
    out.add(p);
  }));
  return [...out].sort();
}

const also = opt('also') ? lines(path.resolve(root, opt('also'))) : [];
const importList = path.join(RUNS, `${name}-import-list.txt`);
fs.mkdirSync(RUNS, { recursive: true });
fs.writeFileSync(importList, `${[...lines(list), ...also].join('\n')}\n`);

if (!argv.includes('--skip-capture')) step('capture', 'cargo-capture.mjs', ['--list', list]);
step('paths', 'cargo-paths.mjs', []);
step('import (first pass)', 'cargo-import.mjs', ['--list', importList, '--name', name]);
const unknown = unknownAddresses();
if (unknown.length) {
  const f = path.join(RUNS, `${name}-resolve.txt`);
  fs.writeFileSync(f, `${unknown.join('\n')}\n`);
  step(`resolve ${unknown.length} addresses`, 'cargo-capture.mjs', ['--resolve', f]);
}
step('files: list', 'cargo-assets.mjs', ['--list', '--snapshots', 'content-sites/lh-cargo/delivery/snapshots/www.lufthansa-cargo.com', '--snapshots', 'content-sites/lh-cargo/snapshots/www.lufthansa-cargo.com', '--pages', importList]);
step('files: download', 'cargo-assets.mjs', ['--download', '--max', '2000']);
step('files: upload and preview', 'cargo-assets.mjs', ['--upload']);
step('paths', 'cargo-paths.mjs', []);
step('import', 'cargo-import.mjs', ['--list', importList, '--name', name]);
step('nav and footer', 'cargo-nav.mjs', []);

// the documents to send: the batch's, the earlier ones that changed, nav and footer when they changed
const report = readJson(path.join(RUNS, `${name}-import.json`), {});
const docs = Object.values(report).filter((r) => r.eds && !r.skipped).map((r) => r.eds);
const upload = path.join(RUNS, `${name}-upload.txt`);
fs.writeFileSync(upload, `${[...new Set([...docs, '/en/nav', '/en/footer', '/de/nav', '/de/footer'])].join('\n')}\n`);
step('upload and preview', 'da-upload.mjs', ['--site', 'lh-cargo', '--list', upload]);
step('redirects', 'cargo-paths.mjs', []);

// every document of the batch on the preview host
const ownDocs = Object.entries(report).filter(([s, r]) => r.eds && !r.skipped && lines(list).some((u) => sourcePath(u) === s)).map(([, r]) => r.eds);
const checkList = path.join(RUNS, `${name}-paths.txt`);
fs.writeFileSync(checkList, `${ownDocs.join('\n')}\n`);
console.log(`\n== ${name}: render check on the preview host`);
const check = spawnSync('node', [tool('cargo-render-check.mjs'), 'https://main--lh-cargo--moved-permanently.aem.page', checkList], { cwd: root, encoding: 'utf8' });
fs.writeFileSync(path.join(RUNS, `${name}-render.txt`), check.stdout || '');
const bad = (check.stdout || '').split('\n').filter((l) => l && !/bad=- header=true footer=true .*brokenLocalImgs=0 errors=-$/.test(l));
console.log(bad.length ? bad.join('\n') : `all ${ownDocs.length} documents render`);

// every document of the batch against its snapshot: text, images, links (cargo-check.mjs)
const cmp = spawnSync('node', [tool('cargo-check.mjs'), '--name', name, '--pages', list], { cwd: root, encoding: 'utf8' });
const thin = (cmp.stdout || '').split('\n').map((l) => l.match(/^(\S+) -> \S+: text (\d+)\/(\d+)/)).filter((m) => m && Number(m[3]) >= 5 && Number(m[2]) / Number(m[3]) < 0.9)
  .map((m) => `${m[1]}: text ${m[2]}/${m[3]}`);
console.log(thin.length ? `text under 90% of www's:\n${thin.join('\n')}` : 'text: every document keeps at least 90% of www\'s text blocks');

// the record
const state = readJson(path.join(W, 'assets/state.json'), { uploaded: {} });
const filesNow = Object.values(state.uploaded || {}).filter((u) => u.preview);
const updated = Object.entries(report).filter(([s, r]) => r.changed === 'changed' && !lines(list).some((u) => sourcePath(u) === s)).map(([, r]) => r.eds);
const skipped = Object.entries(report).filter(([, r]) => r.skipped).map(([s, r]) => `${s}: ${r.skipped}`);
const record = [
  `# lh-cargo ${name}: uploaded to DA moved-permanently/lh-cargo and previewed on main--lh-cargo--moved-permanently.aem.page on ${new Date().toISOString().slice(0, 16)}Z; not published`,
  `# documents of the batch (${ownDocs.length}):`, ...ownDocs,
  `# documents of earlier batches whose links changed (${updated.length}):`, ...updated,
  '# nav and footer (sent again only when changed): /en/nav /en/footer /de/nav /de/footer',
  `# files under /documents/ previewed so far (${filesNow.length}): see content-sites/lh-cargo/assets/state.json`,
  `# not imported (${skipped.length}):`, ...skipped,
  `# render check: ${bad.length ? `${bad.length} problems, ${name}-render.txt` : 'all documents render'}`,
  `# check against www (${name}-check.json): ${thin.length ? `text under 90%: ${thin.join('; ')}` : 'every document keeps at least 90% of the text blocks'}`,
];
fs.writeFileSync(path.join(RUNS, `${name}.txt`), `${record.join('\n')}\n`);
const byLang = (l) => ownDocs.filter((d) => d.startsWith(`/${l}/`)).length;
console.log(`\n${name} previewed: ${ownDocs.length} documents (en ${byLang('en')}, de ${byLang('de')}; ${updated.length} earlier documents updated), content-sites/lh-cargo/runs/${name}.txt`);
execFileSync('git', ['status', '--short', 'tools/importer/cargo-redirects.json'], { cwd: root, stdio: 'inherit' });
