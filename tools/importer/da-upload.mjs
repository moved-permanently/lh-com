/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, no-continue */
/**
 * Uploads local content documents to Document Authoring and previews them on
 * main--lh-com--moved-permanently.aem.page. Preview only, never publishes.
 *
 * Only documents that belong to the site are sent: pages in the migration scope
 * (tools/importer/transformers/scope-paths.js) and the per-locale nav, footer and
 * fragments. Local images referenced as /media-da/... are uploaded once and linked
 * from content.da.live. State: tools/importer/da-upload-state.json.
 *
 * Usage: node tools/importer/da-upload.mjs (--path /de/en/homepage ... | --list paths.txt)
 *          [--no-preview] [--dry-run] [--force]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ORG = 'moved-permanently';
const SITE = 'lh-com';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const has = (n) => argv.includes(`--${n}`);
const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
const stateFile = path.join(root, 'tools/importer/da-upload-state.json');
const state = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : { docs: {}, media: {} };
const save = () => fs.writeFileSync(stateFile, `${JSON.stringify(state, null, 1)}\n`);

const { default: SCOPE } = await import(path.join(root, 'tools/importer/transformers/scope-paths.js'));
const LOCALE_DOC = /^\/(de\/en|de\/de|at\/de|gb\/en)\/(nav|footer|fragments\/[a-z0-9-]+)$/;
const allowed = (p) => SCOPE.has(p) || LOCALE_DOC.test(p);

const listFile = opt('list');
const paths = (listFile ? fs.readFileSync(path.resolve(root, listFile), 'utf8').split(/\r?\n/) : argv.flatMap((a, i) => (a === '--path' ? [argv[i + 1]] : [])))
  .map((p) => p.trim().replace(/^https:\/\/www\.lufthansa\.com/, '').replace(/\.plain\.html$|\.html$/, '').replace(/\/$/, ''))
  .filter(Boolean);

function curl(args) {
  const out = execFileSync('curl', ['-s', '-w', '\n%{http_code}', ...args], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  const i = out.lastIndexOf('\n');
  return { body: out.slice(0, i), status: Number(out.slice(i + 1)) };
}
const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });

const tmp = fs.mkdtempSync('/tmp/da-upload-');
let uploaded = 0;
let previewed = 0;
const failures = [];

for (const p of paths) {
  if (!allowed(p)) { failures.push(`${p}: not in scope, skipped`); continue; }
  const file = path.join(root, 'content', `${p}.plain.html`);
  if (!fs.existsSync(file)) { failures.push(`${p}: no local document`); continue; }
  const stat = fs.statSync(file);
  const known = state.docs[p];
  const fresh = known && known.uploaded && known.mtime === stat.mtimeMs;

  let html = fs.readFileSync(file, 'utf8');
  // local images → uploaded once to DA, referenced from content.da.live
  const media = [...new Set([...html.matchAll(/["(](\/media-da\/[^"')\s]+)/g)].map((m) => m[1]))];
  for (const m of media) {
    if (state.media[m] && !has('force')) continue;
    const local = path.join(root, 'content', m);
    if (!fs.existsSync(local)) { failures.push(`${p}: missing image ${m}`); continue; }
    if (has('dry-run')) { console.log(`would upload ${m}`); continue; }
    const r = curl(['-X', 'POST', '-F', `data=@${local}`, `https://admin.da.live/source/${ORG}/${SITE}${m}`]);
    if (r.status >= 300) { failures.push(`${m}: DA ${r.status}`); continue; }
    state.media[m] = { at: new Date().toISOString() };
    await sleep(300);
  }
  html = html.replace(/(["(])\/media-da\//g, `$1https://content.da.live/${ORG}/${SITE}/media-da/`);

  if (!fresh || has('force')) {
    const doc = path.join(tmp, 'doc.html');
    fs.writeFileSync(doc, `<body><header></header><main>${html}</main><footer></footer></body>`);
    if (has('dry-run')) {
      console.log(`would upload ${p} (${html.length} B, ${media.length} images)`);
    } else {
      const r = curl(['-X', 'POST', '-F', `data=@${doc};type=text/html`, `https://admin.da.live/source/${ORG}/${SITE}${p}.html`]);
      if (r.status >= 300) {
        failures.push(`${p}: DA ${r.status} ${r.body.slice(0, 120)}`);
        if (r.status === 401 || r.status === 403) break;
        continue;
      }
      state.docs[p] = { ...state.docs[p], uploaded: new Date().toISOString(), mtime: stat.mtimeMs };
      uploaded += 1;
      save();
      await sleep(400);
    }
  }

  if (!has('no-preview') && !has('dry-run') && (!fresh || !state.docs[p]?.preview || has('force'))) {
    const r = curl(['-X', 'POST', `https://admin.hlx.page/preview/${ORG}/${SITE}/main${p}`]);
    if (r.status >= 300) {
      failures.push(`${p}: preview ${r.status} ${r.body.slice(0, 120)}`);
    } else {
      state.docs[p] = { ...state.docs[p], preview: new Date().toISOString() };
      previewed += 1;
      save();
    }
    await sleep(600);
  }
}
save();
console.log(`da-upload: ${uploaded} uploaded, ${previewed} previewed, ${failures.length} problems`);
failures.slice(0, 30).forEach((f) => console.log(`  ${f}`));
