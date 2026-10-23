/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, no-continue */
/**
 * Uploads local content documents to Document Authoring and previews them on
 * main--lh-com--moved-permanently.aem.page. Preview only, never publishes.
 *
 * Only documents that belong to the site are sent: pages in the migration scope
 * (tools/importer/transformers/scope-paths.js) and the per-locale nav, footer and
 * fragments (incl. the AirCore fragments). The login and profile app shells
 * (/{cc}/{ll}/login, /{cc}/{ll}/profile/...) are built elsewhere and always refused.
 * Local images referenced as /media-da/... are uploaded once and linked from
 * content.da.live. State: tools/importer/da-upload-state.json (or $DA_UPLOAD_STATE).
 *
 * A preview older than the document's last upload (or a failed one, previewError) is not done:
 * the next run previews the document again even when its upload is unchanged.
 * Problems are printed as they happen and again in the summary. On SIGTERM/SIGINT (callers wrap
 * the run in `timeout`) or when --budget <seconds> is nearly used up (no new document is started
 * in the last min(30, budget/10) seconds), the state is saved and the summary printed.
 *
 * Usage: node tools/importer/da-upload.mjs (--path /de/en/homepage ... | --list paths.txt)
 *          [--no-preview] [--dry-run] [--force] [--budget 500]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ORG = 'moved-permanently';
const SITE = 'lh-com';
const started = Date.now();
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const has = (n) => argv.includes(`--${n}`);
const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
const stateFile = process.env.DA_UPLOAD_STATE
  ? path.resolve(process.env.DA_UPLOAD_STATE)
  : path.join(root, 'tools/importer/da-upload-state.json');
const state = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : { docs: {}, media: {} };
state.docs ||= {};
state.media ||= {};
const save = () => { if (!has('dry-run')) fs.writeFileSync(stateFile, `${JSON.stringify(state, null, 1)}\n`); };
const budget = Number(opt('budget')) || 0;
const margin = Math.min(30, budget / 10);

const { default: SCOPE } = await import(path.join(root, 'tools/importer/transformers/scope-paths.js'));
// documents authors edited in DA: the edits are re-applied to every upload (or the doc is skipped)
const editsFile = path.join(root, 'tools/importer/author-edits.json');
const AUTHOR_EDITS = fs.existsSync(editsFile) ? JSON.parse(fs.readFileSync(editsFile, 'utf8')) : {};
const LOCALE_DOC = /^\/(?:(de\/en|de\/de|at\/de|gb\/en)\/(nav|footer|fragments\/[a-z0-9-]+)|lhg\/[a-z]{2}\/[a-z]{2}\/fragments\/[a-z0-9-]+)$/;
// app shells (login, profile) are built elsewhere: never uploaded, even if listed
const APP_SHELL = /^\/[a-z]{2}\/[a-z]{2}\/(?:login|profile)(?:\/|$)/;
const allowed = (p) => SCOPE.has(p) || LOCALE_DOC.test(p);

const listFile = opt('list');
const paths = (listFile ? fs.readFileSync(path.resolve(root, listFile), 'utf8').split(/\r?\n/) : argv.flatMap((a, i) => (a === '--path' ? [argv[i + 1]] : [])))
  .map((p) => p.trim().replace(/^https:\/\/www\.lufthansa\.com/, '').replace(/\.plain\.html$|\.html$/, '').replace(/\/$/, ''))
  .filter(Boolean);

function curl(args) {
  let out;
  try {
    out = execFileSync('curl', ['-s', '-w', '\n%{http_code}', ...args], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  } catch (e) {
    // curl failed (network error) or was killed with us by `timeout`: report, do not crash
    const why = e.signal ? `curl killed (${e.signal})` : `curl exit ${e.status}`;
    return { body: why, status: 0 };
  }
  const i = out.lastIndexOf('\n');
  return { body: out.slice(0, i), status: Number(out.slice(i + 1)) };
}
const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });

const tmp = fs.mkdtempSync('/tmp/da-upload-');
let uploaded = 0;
let previewed = 0;
let done = 0;
const failures = [];
const problem = (msg) => { failures.push(msg); console.log(`  ${msg}`); };

let finished = false;
function finish(stop) {
  if (finished) return;
  finished = true;
  save();
  fs.rmSync(tmp, { recursive: true, force: true });
  const rest = paths.length - done;
  const stopped = stop ? `, stopped (${stop}) with ${rest} of ${paths.length} documents not done` : '';
  console.log(`da-upload: ${uploaded} uploaded, ${previewed} previewed, ${failures.length} problems${stopped}`);
  failures.slice(0, 30).forEach((f) => console.log(`  ${f}`));
  if (failures.length > 30) console.log(`  ... ${failures.length - 30} more`);
}
['SIGTERM', 'SIGINT'].forEach((sig) => process.on(sig, () => {
  finish(sig);
  process.exit(0);
}));

let stop = null;
for (const p of paths) {
  // let a pending SIGTERM/SIGINT run its handler between documents (curl calls are synchronous)
  await new Promise((r) => { setImmediate(r); });
  if (budget && (Date.now() - started) / 1000 > budget - margin) { stop = `budget ${budget}s`; break; }
  done += 1;
  if (APP_SHELL.test(p)) { problem(`${p}: app shell (login/profile, built elsewhere), refused`); continue; }
  if (!allowed(p)) { problem(`${p}: not in scope, skipped`); continue; }
  const file = path.join(root, 'content', `${p}.plain.html`);
  if (!fs.existsSync(file)) { problem(`${p}: no local document`); continue; }
  const edit = AUTHOR_EDITS[p];
  if (edit?.skip) { problem(`${p}: author-owned (author-edits.json), not uploaded`); continue; }
  const stat = fs.statSync(file);
  const known = state.docs[p];
  const editKey = edit ? JSON.stringify(edit.replace || []) : undefined;
  const fresh = known && known.uploaded && known.mtime === stat.mtimeMs && known.edits === editKey;

  let html = fs.readFileSync(file, 'utf8');
  if (edit) {
    const lost = (edit.replace || [])
      .filter(([from, to]) => !html.includes(from) && !html.includes(to));
    if (lost.length) {
      problem(`${p}: author edit no longer applies (${lost[0][0].slice(0, 60)}), not uploaded`);
      continue;
    }
    (edit.replace || []).forEach(([from, to]) => { html = html.split(from).join(to); });
  }
  // local images → uploaded once to DA, referenced from content.da.live
  const media = [...new Set([...html.matchAll(/["(](\/media-da\/[^"')\s]+)/g)].map((m) => m[1]))];
  for (const m of media) {
    if (state.media[m] && !has('force')) continue;
    const local = path.join(root, 'content', m);
    if (!fs.existsSync(local)) { problem(`${p}: missing image ${m}`); continue; }
    if (has('dry-run')) { console.log(`would upload ${m}`); continue; }
    const r = curl(['-X', 'POST', '-F', `data=@${local}`, `https://admin.da.live/source/${ORG}/${SITE}${m}`]);
    if (r.status < 200 || r.status >= 300) { problem(`${m}: DA ${r.status} ${r.body.slice(0, 120)}`); continue; }
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
      if (r.status < 200 || r.status >= 300) {
        problem(`${p}: DA ${r.status} ${r.body.slice(0, 120)}`);
        if (r.status === 401 || r.status === 403) { stop = `DA ${r.status}`; break; }
        continue;
      }
      state.docs[p] = {
        ...state.docs[p], uploaded: new Date().toISOString(), mtime: stat.mtimeMs, edits: editKey,
      };
      uploaded += 1;
      save();
      await sleep(400);
    }
  }

  // a preview is done only when it succeeded after the last upload
  const d = state.docs[p];
  const previewDone = d?.uploaded && d.preview && d.preview >= d.uploaded && !d.previewError;
  if (!has('no-preview') && !has('dry-run') && d?.uploaded && (!previewDone || has('force'))) {
    const r = curl(['-X', 'POST', `https://admin.hlx.page/preview/${ORG}/${SITE}/main${p}`]);
    if (r.status < 200 || r.status >= 300) {
      const why = `${r.status} ${r.body.slice(0, 120)}`;
      problem(`${p}: preview ${why}`);
      state.docs[p] = { ...d, previewError: why, previewErrorAt: new Date().toISOString() };
    } else {
      const { previewError, previewErrorAt, ...rest } = d;
      state.docs[p] = { ...rest, preview: new Date().toISOString() };
      previewed += 1;
    }
    save();
    await sleep(600);
  }
}
finish(stop);
