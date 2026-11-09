/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, no-continue, max-len */
/* eslint-disable import/extensions -- the site rules module */
/**
 * Uploads local content documents to Document Authoring and previews them on
 * main--<site>--moved-permanently.aem.page. Preview only, never publishes.
 *
 * --site (default lh-com) chooses the DA site; --content-dir another document tree (default
 * content/ for lh-com, content-sites/<site>/content/ otherwise). The rules per site are in
 * da-upload-sites.mjs: lh-com as below; another site only the paths of its allowlist
 * tools/importer/sites/<site>.json, its own state file, no author edits.
 *
 * Only documents that belong to the site are sent: pages in the migration scope
 * (tools/importer/transformers/scope-paths.js) and the per-locale nav, footer and
 * fragments (never anything under /lhg/, which left the replica). The login and profile app shells
 * (/{cc}/{ll}/login, /{cc}/{ll}/profile/...) are built elsewhere and refused (exception: a site's
 * own pages at exactly those paths, its allowlist's ownPages: lh-b2b's sign-in and profile).
 * A document is <path>.plain.html (sent in DA's source shape) or, without one, a full DA document
 * <path>.html (sent byte for byte: the global tree /gc/<ll> comes so). Nothing under /gc/ is ever
 * previewed, with or without --no-preview (da-upload-sites.mjs mayPreview).
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
 *          [--no-preview] [--dry-run] [--force] [--budget 500] [--site lh-com] [--content-dir dir]
 *          [--state <name>] (a state file of its own: da-upload-state-<site>-<name>.json)
 *          [--keep-www <path prefix,…>] (links under these paths may go back to www: the check
 *          below leaves them out, e.g. SWISS's /digitalassistant/, which the replica does not
 *          serve)
 *          [--sink <dir>] (offline: each upload body written to <dir>/<path>.html, the state in
 *          <dir>/da-upload-state.json; no request to DA, admin.hlx.page or any host, no preview)
 *          [--slug-map <file>] (another copy of the site's slug map, e.g. a test copy with flags on)
 *          [--keep-paths] (write at exactly the listed path, no slug mapping: the guard refuses a
 *          localized slug of an active entry)
 *
 * One slug in every language (tools/slugs/README.md, slug-write.mjs): the local documents stay keyed
 * by the www path; each is written at writeTarget(path) (the canonical path for an active alias of
 * the site's map tools/slugs/<site>.json; no map, or its flags off: the path as it is), its internal
 * links through the map (own-links.mjs withCanonicalLinks), its author's hold found at the canonical
 * path too (holdAt). A write to a localized slug of an active entry is refused with the canonical
 * path. A page of a mapped root the map does not know is listed in the unmapped report
 * (tools/reports/slugs/unmapped-<site>.json, or $SLUG_REPORT; merged per path) and moves to its
 * English slug only where its document names its English page (primary-language-url) and its root's
 * flag is on.
 *
 * Test mode (the test runner's NODE_TEST_CONTEXT, or DA_UPLOAD_TEST): refused without --dry-run or
 * --sink, before anything is read or sent (incident of 2026-11-09: a test reached the real uploader).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  siteSettings, mayPreview, readDocument, uploadBody, mediaStep,
} from './da-upload-sites.mjs';
import { linksTakenBack, withCanonicalLinks } from './own-links.mjs';
import {
  slugMapOf, writeTarget, slugRefusal, holdAt, unmappedEntry,
} from './slug-write.mjs';

const started = Date.now();
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const has = (n) => argv.includes(`--${n}`);
const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
// a test never reaches the real uploader: under the test runner (or DA_UPLOAD_TEST) only --dry-run or --sink
if ((process.env.NODE_TEST_CONTEXT || process.env.DA_UPLOAD_TEST) && !has('dry-run') && !opt('sink')) {
  console.error('da-upload: test mode: da-upload runs only with --dry-run or --sink (NODE_TEST_CONTEXT or DA_UPLOAD_TEST is set), nothing done');
  process.exit(2);
}
const sink = opt('sink') ? path.resolve(opt('sink')) : null;
const keepWww = (opt('keep-www') || '').split(',').map((x) => x.trim()).filter(Boolean);
const loadScope = async () => (await import(path.join(root, 'tools/importer/transformers/scope-paths.js'))).default;
const settings = await siteSettings(root, loadScope, {
  site: opt('site') || undefined, contentDir: opt('content-dir') || undefined, stateEnv: process.env.DA_UPLOAD_STATE, stateName: opt('state') || undefined,
});
const {
  org: ORG, site: SITE, contentDir, allowed, appShell, authorEdits: AUTHOR_EDITS,
} = settings;
// --sink: the state beside the bodies, never the site's
const stateFile = sink ? path.join(sink, 'da-upload-state.json') : settings.stateFile;
if (sink) fs.mkdirSync(sink, { recursive: true });
// the site's slug map (none for TAP, Air Dolomiti, ITA); --keep-paths writes at the listed path, the guard still checks it
const GUARD = slugMapOf(SITE, { file: opt('slug-map') || undefined });
const SLUGS = has('keep-paths') ? null : GUARD;
const unmapped = [];
const state = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : { docs: {}, media: {} };
state.docs ||= {};
state.media ||= {};
const save = () => { if (!has('dry-run')) fs.writeFileSync(stateFile, `${JSON.stringify(state, null, 1)}\n`); };
const budget = Number(opt('budget')) || 0;
const margin = Math.min(30, budget / 10);

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

// pages of mapped roots the slug map does not know, merged per path into the site's report
const slugReport = () => {
  if (!unmapped.length) return;
  const file = process.env.SLUG_REPORT ? path.resolve(process.env.SLUG_REPORT) : path.join(root, 'tools/reports/slugs', `unmapped-${SITE}.json`);
  const before = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { site: SITE, pages: {} };
  unmapped.forEach((u) => {
    before.pages[u.path] = {
      source: u.source, verified: u.verified, target: u.target, seen: new Date().toISOString(),
    };
  });
  before.updated = new Date().toISOString();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(before, null, 1)}\n`);
  console.log(`unmapped: ${unmapped.length} page(s) the slug map does not know (${unmapped.filter((u) => u.verified).length} verified), ${path.relative(root, file)}`);
};

let finished = false;
function finish(stop) {
  if (finished) return;
  finished = true;
  save();
  slugReport();
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
  if (appShell(p)) { problem(`${p}: app shell (login/profile, built elsewhere), refused`); continue; }
  if (!allowed(p)) { problem(`${p}: not in scope, skipped`); continue; }
  const localDoc = readDocument(contentDir, p);
  if (!localDoc) { problem(`${p}: no local document`); continue; }
  // the page's path in DA: its canonical path for an active alias of the site's slug map
  let target = writeTarget(p, SLUGS);
  const unknown = SLUGS ? unmappedEntry(p, localDoc.text, SLUGS) : null;
  if (unknown) {
    unmapped.push(unknown);
    target = unknown.target;
  }
  if (target !== p && appShell(target)) { problem(`${p}: app shell at ${target} (login/profile, built elsewhere), refused`); continue; }
  const refusal = slugRefusal(target, GUARD);
  if (refusal) { problem(refusal); continue; }
  // two local documents for one page (its www slug and its canonical path): neither wins silently
  if (target !== p && readDocument(contentDir, target)) { problem(`${p}: its page ${target} has a document of its own in ${path.relative(root, contentDir) || contentDir}: two documents for one page, refused`); continue; }
  const edit = holdAt(target, p, AUTHOR_EDITS, SLUGS);
  if (edit?.skip) { problem(`${target}: author-owned (author-edits.json), not uploaded`); continue; }
  const stat = fs.statSync(localDoc.file);
  const known = state.docs[target];
  const editKey = edit ? JSON.stringify(edit.replace || []) : undefined;

  let html = localDoc.text;
  if (edit) {
    const lost = (edit.replace || [])
      .filter(([from, to]) => !html.includes(from) && !html.includes(to));
    if (lost.length) {
      problem(`${p}: author edit no longer applies (${lost[0][0].slice(0, 60)}), not uploaded`);
      continue;
    }
    (edit.replace || []).forEach(([from, to]) => { html = html.split(from).join(to); });
  }
  // internal links through the slug map (active entries only); the moves are part of the state, so a
  // round that switches a flag on sends the pages that link to a moved page again
  const linked = withCanonicalLinks(html, SLUGS);
  html = linked.doc;
  const slugKey = linked.links.length ? JSON.stringify(linked.links) : undefined;
  const fresh = known && known.uploaded && known.mtime === stat.mtimeMs && known.edits === editKey && known.slugs === slugKey;
  // local images → uploaded once to DA, referenced from content.da.live
  const media = [...new Set([...html.matchAll(/["(](\/media-da\/[^"')\s]+)/g)].map((m) => m[1]))];
  for (const m of media) {
    const local = path.join(contentDir, m);
    // a picture with no local file that DA has already (another tree's upload, DA's copy of an
    // earlier import): no problem, noted as DA's (brief 468)
    const inDa = () => curl(['-o', '/dev/null', `https://admin.da.live/source/${ORG}/${SITE}${m}`]).status === 200;
    // --sink: no request at all, a picture counts as known
    const step = sink ? 'known' : mediaStep({
      known: Boolean(state.media[m]), force: has('force'), localExists: fs.existsSync(local), inDa,
    });
    if (step === 'known') continue;
    if (step === 'in-da') { state.media[m] = { at: new Date().toISOString(), inDa: true }; continue; }
    if (step === 'missing') { problem(`${p}: missing image ${m} (not in DA either)`); continue; }
    if (has('dry-run')) { console.log(`would upload ${m}`); continue; }
    const r = curl(['-X', 'POST', '-F', `data=@${local}`, `https://admin.da.live/source/${ORG}/${SITE}${m}`]);
    if (r.status < 200 || r.status >= 300) { problem(`${m}: DA ${r.status} ${r.body.slice(0, 120)}`); continue; }
    state.media[m] = { at: new Date().toISOString() };
    await sleep(300);
  }
  html = html.replace(/(["(])\/media-da\//g, `$1https://content.da.live/${ORG}/${SITE}/media-da/`);

  if (!fresh || has('force')) {
    // a brand site's document whose DA version links a site page relative that the local one
    // links on www (another session changed it in DA, e.g. ITA's footers' /<root>/profile/...):
    // not uploaded, the local copy is older than DA (lh-com as before, no check)
    if (SITE !== 'lh-com' && !sink) {
      const current = curl([`https://admin.da.live/source/${ORG}/${SITE}${target}.html`]);
      const back = current.status === 200 ? linksTakenBack(current.body, html, keepWww) : [];
      if (back.length) {
        problem(`${target}: would take ${back.length} link(s) DA has relative back to www (${back[0]}): local copy older than DA, not uploaded`);
        continue;
      }
    }
    const doc = path.join(tmp, 'doc.html');
    fs.writeFileSync(doc, uploadBody(localDoc.kind, html));
    const where = target === p ? p : `${target} (www ${p})`;
    if (has('dry-run')) {
      console.log(`would upload ${where} (${html.length} B, ${media.length} images)`);
    } else {
      if (sink) {
        const out = path.join(sink, `${target.slice(1)}.html`);
        fs.mkdirSync(path.dirname(out), { recursive: true });
        fs.copyFileSync(doc, out);
      } else {
        const r = curl(['-X', 'POST', '-F', `data=@${doc};type=text/html`, `https://admin.da.live/source/${ORG}/${SITE}${target}.html`]);
        if (r.status < 200 || r.status >= 300) {
          problem(`${target}: DA ${r.status} ${r.body.slice(0, 120)}`);
          if (r.status === 401 || r.status === 403) { stop = `DA ${r.status}`; break; }
          continue;
        }
      }
      if (target !== p) console.log(`  ${p} written at ${target}`);
      state.docs[target] = {
        ...state.docs[target], uploaded: new Date().toISOString(), mtime: stat.mtimeMs, edits: editKey, slugs: slugKey, ...(target !== p ? { www: p } : {}),
      };
      uploaded += 1;
      save();
      if (!sink) await sleep(400);
    }
  }

  // a preview is done only when it succeeded after the last upload
  const d = state.docs[target];
  const previewDone = d?.uploaded && d.preview && d.preview >= d.uploaded && !d.previewError;
  if (!has('no-preview') && !sink && mayPreview(target) && !has('dry-run') && d?.uploaded && (!previewDone || has('force'))) {
    const r = curl(['-X', 'POST', `https://admin.hlx.page/preview/${ORG}/${SITE}/main${target}`]);
    if (r.status < 200 || r.status >= 300) {
      const why = `${r.status} ${r.body.slice(0, 120)}`;
      problem(`${target}: preview ${why}`);
      state.docs[target] = { ...d, previewError: why, previewErrorAt: new Date().toISOString() };
    } else {
      const { previewError, previewErrorAt, ...rest } = d;
      state.docs[target] = { ...rest, preview: new Date().toISOString() };
      previewed += 1;
    }
    save();
    await sleep(600);
  }
}
finish(stop);
