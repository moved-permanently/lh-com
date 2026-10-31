/* eslint-disable no-console, no-restricted-syntax, max-len, import/extensions -- tooling */
/**
 * One Air Dolomiti batch (lh-airdolomiti), capture to preview, with the Air Dolomiti tools in order:
 *  1. capture its pages (airdolomiti-capture.mjs: Bright Data, one page every 5-10 s);
 *  2. the language's nav and footer when its homepage is captured (airdolomiti-nav.mjs --lang);
 *  3. import (airdolomiti-import.mjs; it lists the files the pages use), their files
 *     (airdolomiti-assets.mjs --download: one GET every 5-10 s; --upload: PDFs to DA, previewed),
 *     import again with the files (and once more after the originals of resized images that
 *     answer 404, found by that import);
 *  4. upload and preview the documents, the language's nav and footer (da-upload.mjs --site
 *     lh-airdolomiti; only changed documents are sent) and the redirects of what is imported
 *     (airdolomiti-paths.mjs: tools/importer/airdolomiti-redirects.json);
 *  5. every document opened on the preview host (cargo-render-check.mjs: blocks, H1, header,
 *     footer, language, images) and three pages of different types compared with www
 *     (airdolomiti-check.mjs: text, images, links);
 *  6. the record: content-sites/lh-airdolomiti/runs/batch-<n>.txt and its public copy
 *     tools/importer/airdolomiti-runs/batch-<n>.txt.
 * A step that answers a block (exit 2) stops the batch: run it again after the 30 minutes.
 * Nothing is published.
 *
 * Usage: node tools/importer/airdolomiti-batch.mjs --batch 2
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { langOf, sourceKey } from './airdolomiti-paths.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const n = Number(argv.includes('--batch') ? argv[argv.indexOf('--batch') + 1] : 0);
if (!n) { console.log('usage: --batch <n>'); process.exit(1); }
const W = path.join(root, 'content-sites/lh-airdolomiti');
const RUNS = path.join(W, 'runs');
const PUBLIC = path.join(root, 'tools/importer/airdolomiti-runs');
const list = path.join(W, 'batches', `batch-${String(n).padStart(2, '0')}.txt`);
const name = `batch-${n}`;
const tool = (f) => path.join(root, 'tools/importer', f);
const readJson = (f, d) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d);
const urls = fs.readFileSync(list, 'utf8').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
const lang = langOf(urls[0]);
const prefix = lang === 'it' ? '' : `/${lang}`;
const HOMES = { it: 'https://www.airdolomiti.it', en: 'https://www.airdolomiti.eu', de: 'https://www.airdolomiti.de' };

function step(label, file, args, { capture = false } = {}) {
  console.log(`\n== ${name}: ${label}`);
  const r = spawnSync('node', [tool(file), ...args], { cwd: root, stdio: capture ? 'pipe' : 'inherit', encoding: 'utf8' });
  if (r.status === 2) { console.error(`${name}: stopped at "${label}" (blocked): again after 30 minutes`); process.exit(2); }
  if (r.status !== 0) { console.error(`${name}: "${label}" failed (${r.status}) ${capture ? (r.stderr || '').slice(-400) : ''}`); process.exit(1); }
  return r.stdout || '';
}

step('capture', 'airdolomiti-capture.mjs', ['--list', list]);
const capture = readJson(path.join(W, 'capture-state.json'), {});
const homeCaptured = capture[sourceKey(HOMES[lang])] && capture[sourceKey(HOMES[lang])].status === 'ok';
step('paths', 'airdolomiti-paths.mjs', []);
step('import (first pass)', 'airdolomiti-import.mjs', ['--list', list, '--name', name]);
if (homeCaptured) step(`nav and footer (${lang})`, 'airdolomiti-nav.mjs', ['--lang', lang]);
step('files: download', 'airdolomiti-assets.mjs', ['--download']);
step('files: upload and preview', 'airdolomiti-assets.mjs', ['--upload']);
step('import', 'airdolomiti-import.mjs', ['--list', list, '--name', name]);
// files this import found only now (the originals of resized images that answer 404 on www):
// downloaded and uploaded, then the import once more
if (Object.values(readJson(path.join(RUNS, `${name}-import.json`), {})).some((r) => (r.missing || []).length)) {
  step('files: download (originals)', 'airdolomiti-assets.mjs', ['--download']);
  step('files: upload and preview (originals)', 'airdolomiti-assets.mjs', ['--upload']);
  step('import (with the originals)', 'airdolomiti-import.mjs', ['--list', list, '--name', name]);
}
if (homeCaptured) step(`nav and footer (${lang})`, 'airdolomiti-nav.mjs', ['--lang', lang]);

const report = readJson(path.join(RUNS, `${name}-import.json`), {});
const docs = Object.values(report).filter((r) => r.doc && !r.skipped).map((r) => r.doc);
const navDocs = fs.existsSync(path.join(W, 'content', `${prefix}/nav.plain.html`)) ? [`${prefix}/nav`, `${prefix}/footer`] : [];
const upload = path.join(RUNS, `${name}-upload.txt`);
fs.writeFileSync(upload, `${[...docs, ...navDocs].join('\n')}\n`);
step('upload and preview', 'da-upload.mjs', ['--site', 'lh-airdolomiti', '--list', upload]);
step('redirects', 'airdolomiti-paths.mjs', []);

// every document on the preview host (the homepages answer at /, /en/, /de/)
const pathsFile = path.join(RUNS, `${name}-urls.txt`);
fs.writeFileSync(pathsFile, `${docs.map((d) => d.replace(/\/index$/, '/') || '/').join('\n')}\n`);
console.log(`\n== ${name}: render check on the preview host`);
const rc = spawnSync('node', [tool('cargo-render-check.mjs'), 'https://main--lh-airdolomiti--moved-permanently.aem.page', pathsFile], { cwd: root, encoding: 'utf8' });
fs.writeFileSync(path.join(RUNS, `${name}-render.txt`), rc.stdout || '');
const bad = (rc.stdout || '').split('\n').filter((l) => l && !/bad=- header=true footer=true .*brokenLocalImgs=0 errors=-$/.test(l));
console.log(bad.length ? bad.join('\n') : `all ${docs.length} documents render`);

// three pages of different types against www
const types = {};
const rows = fs.readFileSync(path.join(W, 'delivery/batches.tsv'), 'utf8').split(/\r?\n/).slice(1).map((l) => l.split('\t'));
rows.forEach(([, , u, t]) => { if (u) types[sourceKey(u)] = t; });
const imported = urls.filter((u) => report[u] && report[u].doc && !report[u].skipped);
const picks = [];
const seenTypes = new Set();
imported.forEach((u) => { const t = types[sourceKey(u)] || 'page'; if (picks.length < 3 && !seenTypes.has(t)) { seenTypes.add(t); picks.push(u); } });
[imported[Math.floor(imported.length / 2)], imported[imported.length - 1]].forEach((u) => { if (u && picks.length < 3 && !picks.includes(u)) picks.push(u); });
const check = step('check 3 pages against www', 'airdolomiti-check.mjs', ['--name', name, ...picks], { capture: true }).split('\n').filter((l) => / -> /.test(l));
console.log(check.join('\n'));
const detail = readJson(path.join(RUNS, `${name}-check.json`), {});
const differs = Object.entries(detail).map(([u, r]) => {
  const parts = [];
  if (r.text.missing.length) parts.push(`text missing: ${r.text.missing.map((t) => `"${t.slice(0, 80)}"`).join('; ')}`);
  if (r.images.missing.length) parts.push(`images missing: ${r.images.missing.map((i) => i.split('/').pop()).join(', ')}`);
  if ((r.images.broken || []).length) parts.push(`images broken on www too (404, left out): ${r.images.broken.map((i) => i.split('/').pop()).join(', ')}`);
  if (r.links.missing.length) parts.push(`links missing: ${r.links.missing.join(', ')}`);
  return parts.length ? `#   ${u}: ${parts.join(' | ')}` : `#   ${u}: no text, image or link of www's missing`;
});

// the record
const skipped = Object.entries(report).filter(([, r]) => r.skipped).map(([u, r]) => `${u}: ${r.skipped}`);
const generic = [...new Set(Object.values(report).flatMap((r) => r.generic || []))];
const record = [
  `# lh-airdolomiti ${name} (${lang}): uploaded to DA moved-permanently/lh-airdolomiti and previewed on main--lh-airdolomiti--moved-permanently.aem.page on ${new Date().toISOString().slice(0, 16)}Z; not published`,
  `# documents (${docs.length}${navDocs.length ? ` + ${navDocs.join(', ')}` : ''}):`, ...docs, ...navDocs,
  `# not imported (${skipped.length}):`, ...skipped.map((s) => `#   ${s}`),
  `# blocks without a handler (their content generically): ${generic.join(', ') || 'none'}`,
  `# render check: ${bad.length ? `${bad.length} problems:\n${bad.map((b) => `#   ${b}`).join('\n')}` : `all ${docs.length} documents render`}`,
  '# check against www (text, images, links):', ...check.map((c) => `#   ${c}`), ...differs,
];
fs.writeFileSync(path.join(RUNS, `${name}.txt`), `${record.join('\n')}\n`);
fs.mkdirSync(PUBLIC, { recursive: true });
fs.writeFileSync(path.join(PUBLIC, `${name}.txt`), `${record.join('\n')}\n`);
console.log(`\nbatch ${n} previewed: ${docs.length} documents, content-sites/lh-airdolomiti/runs/${name}.txt`);
