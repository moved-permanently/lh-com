/* eslint-disable no-console, no-restricted-syntax, max-len, import/extensions -- tooling */
/**
 * A sweep over Air Dolomiti batches already imported (lh-airdolomiti), after importer fixes:
 *  1. import every batch again from its snapshots (no capture; the importer writes a document
 *     only when its content changed);
 *  2. the files those imports found missing (airdolomiti-assets.mjs --download: one GET every
 *     5-10 s; --upload), then the imports once more;
 *  3. upload and preview the batches' documents (da-upload.mjs --site lh-airdolomiti sends only
 *     the documents that changed);
 *  4. the documents sent opened on the preview host (cargo-render-check.mjs) and the given pages
 *     compared with www (airdolomiti-check.mjs);
 *  5. the record: content-sites/lh-airdolomiti/runs/<name>.txt and its public copy
 *     tools/importer/airdolomiti-runs/<name>.txt, the documents sent (to publish again).
 * A step that answers a block (exit 2) stops the sweep: run it again after the 30 minutes.
 * Nothing is published.
 *
 * Usage: node tools/importer/airdolomiti-sweep.mjs --batches 1-24 --name sweep-2 --why "…" [--check <url> ...]
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const opt = (k) => (argv.includes(`--${k}`) ? argv[argv.indexOf(`--${k}`) + 1] : null);
const [from, to] = (opt('batches') || '').split('-').map(Number);
const name = opt('name');
if (!from || !to || !name) { console.log('usage: --batches 1-24 --name sweep-2 --why "…" [--check <url> ...]'); process.exit(1); }
const checks = argv.flatMap((a, i) => (argv[i - 1] === '--check' ? [a] : []));
const W = path.join(root, 'content-sites/lh-airdolomiti');
const RUNS = path.join(W, 'runs');
const PUBLIC = path.join(root, 'tools/importer/airdolomiti-runs');
const STATE = path.join(root, 'tools/importer/da-upload-state-lh-airdolomiti.json');
const tool = (f) => path.join(root, 'tools/importer', f);
const readJson = (f, d) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d);

function step(label, file, args, { capture = false } = {}) {
  console.log(`\n== ${name}: ${label}`);
  const r = spawnSync('node', [tool(file), ...args], { cwd: root, stdio: capture ? 'pipe' : 'inherit', encoding: 'utf8' });
  if (r.status === 2) { console.error(`${name}: stopped at "${label}" (blocked): again after 30 minutes`); process.exit(2); }
  if (r.status !== 0) { console.error(`${name}: "${label}" failed (${r.status}) ${capture ? (r.stderr || '').slice(-400) : ''}`); process.exit(1); }
  return r.stdout || '';
}

const batches = [];
for (let b = from; b <= to; b += 1) batches.push(b);
const importAll = (label) => batches.map((b) => {
  const part = `${name}-b${b}`;
  step(`${label} batch ${b}`, 'airdolomiti-import.mjs', ['--list', path.join(W, 'batches', `batch-${String(b).padStart(2, '0')}.txt`), '--name', part], { capture: true });
  return readJson(path.join(RUNS, `${part}-import.json`), {});
});

let reports = importAll('import');
if (reports.some((r) => Object.values(r).some((x) => (x.missing || []).length))) {
  step('files: download', 'airdolomiti-assets.mjs', ['--download']);
  step('files: upload and preview', 'airdolomiti-assets.mjs', ['--upload']);
  reports = importAll('import with the files');
}
const docs = [...new Set(reports.flatMap((r) => Object.values(r).filter((x) => x.doc && !x.skipped).map((x) => x.doc)))];

const before = readJson(STATE, { docs: {} }).docs;
const upload = path.join(RUNS, `${name}-upload.txt`);
fs.writeFileSync(upload, `${docs.join('\n')}\n`);
step('upload and preview (changed documents only)', 'da-upload.mjs', ['--site', 'lh-airdolomiti', '--list', upload]);
const after = readJson(STATE, { docs: {} }).docs;
const sent = docs.filter((d) => after[d] && (!before[d] || after[d].uploaded !== before[d].uploaded));
console.log(`${sent.length} of ${docs.length} documents changed and were sent`);

const pathsFile = path.join(RUNS, `${name}-urls.txt`);
fs.writeFileSync(pathsFile, `${sent.map((d) => d.replace(/\/index$/, '/') || '/').join('\n')}\n`);
console.log(`\n== ${name}: render check on the preview host`);
const rc = sent.length ? spawnSync('node', [tool('cargo-render-check.mjs'), 'https://main--lh-airdolomiti--moved-permanently.aem.page', pathsFile], { cwd: root, encoding: 'utf8' }) : { stdout: '' };
fs.writeFileSync(path.join(RUNS, `${name}-render.txt`), rc.stdout || '');
const bad = (rc.stdout || '').split('\n').filter((l) => l && !/bad=- header=true footer=true .*brokenLocalImgs=0 errors=-$/.test(l));
console.log(bad.length ? bad.join('\n') : `all ${sent.length} documents render`);

const check = checks.length ? step('check pages against www', 'airdolomiti-check.mjs', ['--name', name, ...checks], { capture: true }).split('\n').filter((l) => / -> /.test(l)) : [];
const detail = readJson(path.join(RUNS, `${name}-check.json`), {});
const differs = checks.length ? Object.entries(detail).map(([u, r]) => {
  const parts = [];
  if (r.text.missing.length) parts.push(`text missing: ${r.text.missing.map((t) => `"${t.slice(0, 80)}"`).join('; ')}`);
  if (r.images.missing.length) parts.push(`images missing: ${r.images.missing.map((i) => i.split('/').pop()).join(', ')}`);
  if ((r.images.broken || []).length) parts.push(`images broken on www too (404, left out): ${r.images.broken.map((i) => i.split('/').pop()).join(', ')}`);
  if (r.links.missing.length) parts.push(`links missing: ${r.links.missing.join(', ')}`);
  return parts.length ? `#   ${u}: ${parts.join(' | ')}` : `#   ${u}: no text, image or link of www's missing`;
}) : [];

const record = [
  `# lh-airdolomiti ${name}: documents of batches ${from}-${to} that changed, uploaded to DA moved-permanently/lh-airdolomiti and previewed on main--lh-airdolomiti--moved-permanently.aem.page on ${new Date().toISOString().slice(0, 16)}Z; not published`,
  `# why: ${opt('why') || 'importer fixes'}`,
  `# documents (${sent.length}, to publish again):`, ...sent,
  `# render check: ${bad.length ? `${bad.length} problems:\n${bad.map((b) => `#   ${b}`).join('\n')}` : `all ${sent.length} documents render`}`,
  ...(checks.length ? ['# check against www (text, images, links):', ...check.map((c) => `#   ${c}`), ...differs] : []),
];
fs.writeFileSync(path.join(RUNS, `${name}.txt`), `${record.join('\n')}\n`);
fs.mkdirSync(PUBLIC, { recursive: true });
fs.writeFileSync(path.join(PUBLIC, `${name}.txt`), `${record.join('\n')}\n`);
console.log(`\n${name} previewed: ${sent.length} documents, content-sites/lh-airdolomiti/runs/${name}.txt`);
