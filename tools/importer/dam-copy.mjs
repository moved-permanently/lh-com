/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, no-continue, max-len */
/**
 * Copies www's DAM assets into Document Authoring under their old paths (/content/dam/..., with
 * the names of scripts/dam-path.js edsDamPath) and previews them (preview only, never live), so
 * lh-edge's /content/dam route can answer www's DAM URLs (feeds package 4).
 *
 * Assets: tools/source-export/feeds/dam/dam-assets.csv (renditions reduced to their asset), the
 * lounge images (lh/images/lounges/<loungeid>-square.jpg for every loungeid in the recorded
 * lounge search answers, tools/source-export/api/bd-record-api/*.ndjson, and fallback-square.jpg).
 *
 *   --names     write scripts/dam-collisions.js (www paths that would share one name: the second
 *               and later ones get "-2", "-3" before the extension) and the asset table
 *               tools/reports/dam/dam-assets.json; also run by --download and --upload
 *   --download  fetch the originals from www.lufthansa.com (no redirects followed: a redirect is
 *               www's missing-image fallback, recorded, not copied), at most 2 at a time, into
 *               tools/source-export/dam-cache/<decoded www path> (the AirCore originals are taken
 *               from tools/source-export/aircore-images/ when they are there)
 *   --upload    upload to DA and preview, 6 at a time (Document Authoring and admin, not www);
 *               files outside Edge Delivery's media limits are listed, not uploaded: jpg, jpeg,
 *               png and pdf up to 20 MB, mp4 up to 36 MB, svg up to 40 KB; vtt and txt are not
 *               delivered by Edge Delivery at all
 *   --report    tools/reports/dam/dam-copy.md and .json
 * State: tools/importer/dam-copy-state.json. Options: --limit N, --budget <seconds>, --only <path>.
 * Usage: node tools/importer/dam-copy.mjs --download | --upload | --report | --names
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { edsDamName, parseDamPath } from '../../scripts/dam-path.js';

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const has = (n) => argv.includes(`--${n}`);
const opt = (n) => (has(n) ? argv[argv.indexOf(`--${n}`) + 1] : null);
const ORG = 'moved-permanently';
const SITE = 'lh-com';
const LIVE = 'https://www.lufthansa.com';
const LIST = path.join(root, 'tools/source-export/feeds/dam/dam-assets.csv');
const LOUNGE_ANSWERS = path.join(root, 'tools/source-export/api/bd-record-api');
const CACHE = path.join(root, 'tools/source-export/dam-cache');
const AIRCORE_CACHE = path.join(root, 'tools/source-export/aircore-images');
const STATE = path.join(root, 'tools/importer/dam-copy-state.json');
const COLLISIONS = path.join(root, 'scripts/dam-collisions.js');
const REPORTS = path.join(root, 'tools/reports/dam');
const limit = Number(opt('limit')) || Infinity;
const budget = (Number(opt('budget')) || 0) * 1000;
const started = Date.now();
const outOfTime = () => budget && Date.now() - started > budget;

const MB = 1024 * 1024;
const LIMITS = {
  jpg: 20 * MB, jpeg: 20 * MB, png: 20 * MB, pdf: 20 * MB, mp4: 36 * MB, svg: 40 * 1024,
};
const TYPES = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', pdf: 'application/pdf', mp4: 'video/mp4', svg: 'image/svg+xml',
};
const extOf = (p) => (p.match(/\.([a-z0-9]+)$/i) || [])[1]?.toLowerCase() || '';

const state = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : {};

/** The asset list: www path (decoded, NFC) -> sources. */
function assets() {
  const list = new Map();
  const add = (p, source) => {
    const { asset } = parseDamPath(p);
    const key = asset.normalize('NFC');
    if (!list.has(key)) list.set(key, new Set());
    list.get(key).add(source);
  };
  const [head, ...lines] = fs.readFileSync(LIST, 'utf8').trim().split('\n');
  const cols = head.split(',');
  lines.forEach((l) => {
    const cells = l.match(/("([^"]|"")*"|[^,]*)(,|$)/g).map((c) => c.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"'));
    const row = Object.fromEntries(cols.map((c, i) => [c, cells[i] || '']));
    row.sources.split(' ').filter(Boolean).forEach((s) => add(row.asset, s));
  });
  // lounge images: every loungeid of the recorded search answers, and the fallback
  const ids = new Set();
  if (fs.existsSync(LOUNGE_ANSWERS)) {
    fs.readdirSync(LOUNGE_ANSWERS).filter((f) => f.endsWith('.ndjson')).forEach((f) => {
      fs.readFileSync(path.join(LOUNGE_ANSWERS, f), 'utf8').split('\n').filter(Boolean).forEach((line) => {
        const r = JSON.parse(line);
        if (!/\/catalogs\/lounges\/[A-Z]+\/[A-Z]+$/.test(r.url)) return;
        (JSON.parse(r.text).lounges || []).forEach((x) => { if (x && x.loungeid) ids.add(String(x.loungeid)); });
      });
    });
  }
  [...ids].sort().forEach((id) => add(`/content/dam/lh/images/lounges/${id}-square.jpg`, 'lounges'));
  add('/content/dam/lh/images/lounges/fallback-square.jpg', 'lounges');
  // where www redirects an asset of the list (its missing-image fallback), the target is copied
  Object.values(state).forEach((s) => {
    const m = String(s.wwwRedirect || '').match(/^https:\/\/www\.lufthansa\.com(\/content\/dam\/[^?#]+)$/);
    if (m) add(m[1], 'www-fallback');
  });
  return list;
}

/** Names, with the second and later www paths of one name renamed. */
function names(list) {
  const byName = new Map();
  const collisions = {};
  [...list.keys()].sort().forEach((p) => {
    let name = edsDamName(p);
    if (byName.has(name)) {
      const first = byName.get(name);
      const dot = name.lastIndexOf('.');
      let n = 2;
      let next;
      do {
        next = `${name.slice(0, dot)}-${n}${name.slice(dot)}`;
        n += 1;
      } while (byName.has(next));
      collisions[p] = next;
      console.log(`collision: ${p} and ${first} -> ${name}; ${p} gets ${next}`);
      name = next;
    }
    byName.set(name, p);
  });
  const sorted = Object.fromEntries(Object.entries(collisions).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(COLLISIONS, `/* eslint-disable */
// Generated by tools/importer/dam-copy.mjs; do not edit by hand.
// www DAM path -> its own name on lh-com, where two www paths would get the same name.
export default ${JSON.stringify(sorted, null, 2)};
`);
  return { byName, collisions: sorted };
}

const save = () => fs.writeFileSync(STATE, `${JSON.stringify(Object.fromEntries(Object.entries(state).sort(([a], [b]) => a.localeCompare(b))), null, 1)}\n`);
const cacheFile = (p) => path.join(CACHE, p.replace(/^\/content\/dam\//, ''));
const aircoreFile = (p) => path.join(AIRCORE_CACHE, p.replace(/^\/content\/dam\//, ''));

async function curl(args) {
  try {
    const { stdout } = await run('curl', ['-s', '-w', '\n%{http_code}\t%{content_type}\t%{redirect_url}', ...args], { maxBuffer: 16 * MB });
    const i = stdout.lastIndexOf('\n');
    const [status, type, redirect] = stdout.slice(i + 1).split('\t');
    return {
      body: stdout.slice(0, i), status: Number(status), type, redirect,
    };
  } catch (e) {
    return {
      body: String(e.message), status: 0, type: '', redirect: '',
    };
  }
}

/** Runs fn over items, n at a time. */
async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(Array.from({ length: n }, async () => {
    while (i < items.length && !outOfTime()) {
      const item = items[i];
      i += 1;
      await fn(item);
    }
  }));
}

async function download(list) {
  const todo = [...list.keys()].filter((p) => {
    const s = state[p] || {};
    return !s.file && !s.wwwStatus && (!opt('only') || p === opt('only'));
  }).slice(0, limit);
  let done = 0;
  await pool(todo, 2, async (p) => {
    const s = state[p] || {};
    state[p] = s;
    const file = cacheFile(p);
    if (fs.existsSync(aircoreFile(p)) && fs.statSync(aircoreFile(p)).size > 0) {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.copyFileSync(aircoreFile(p), file);
    }
    if (!fs.existsSync(file) || !fs.statSync(file).size) {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      const tmp = `${file}.part`;
      const r = await curl(['--max-time', '600', '-o', tmp, `${LIVE}${encodeURI(p)}`]);
      if (r.status !== 200) {
        if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
        s.wwwStatus = r.status;
        if (r.redirect) s.wwwRedirect = r.redirect;
        console.log(`  ${p}: ${r.status}${r.redirect ? ` -> ${r.redirect}` : ''}`);
        return;
      }
      fs.renameSync(tmp, file);
      s.type = r.type;
    }
    s.file = path.relative(root, file);
    s.bytes = fs.statSync(file).size;
    done += 1;
    if (done % 50 === 0) {
      save();
      console.log(`  ${done}/${todo.length} downloaded`);
    }
  });
  save();
  const have = [...list.keys()].filter((p) => state[p] && state[p].file).length;
  console.log(`dam-copy download: ${done} this run; ${have}/${list.size} in the cache, ${[...list.keys()].filter((p) => state[p] && state[p].wwwStatus).length} not fetched`);
}

/** Why an asset is not uploaded ('' when it is). */
function notDeliverable(p, s) {
  const ext = extOf(p);
  if (!(ext in LIMITS)) return `.${ext} is not a file type Edge Delivery delivers`;
  if (s.bytes > LIMITS[ext]) return `${(s.bytes / MB).toFixed(1)} MB, over Edge Delivery's ${LIMITS[ext] >= MB ? `${LIMITS[ext] / MB} MB` : `${LIMITS[ext] / 1024} KB`} limit for .${ext}`;
  return '';
}

async function upload(list, byName) {
  const nameOf = new Map([...byName.entries()].map(([n, p]) => [p, n]));
  const todo = [...list.keys()].filter((p) => {
    const s = state[p] || {};
    return s.file && !(s.preview && !s.previewError && s.uploadedName === nameOf.get(p)) && (!opt('only') || p === opt('only'));
  }).slice(0, limit);
  let done = 0;
  const problems = [];
  await pool(todo, 6, async (p) => {
    const s = state[p];
    const why = notDeliverable(p, s);
    if (why) { s.skipped = why; return; }
    delete s.skipped;
    const name = nameOf.get(p);
    if (/^\/lhg(\/|$)/.test(name) || !name.startsWith('/content/dam/')) { problems.push(`${p}: refused target ${name}`); return; }
    if (s.uploadedName !== name) {
      // a copy under a name admin refused to preview (an earlier naming rule) is replaced: the
      // misnamed document is removed from DA (it was never previewed)
      if (s.uploadedName && s.previewError) {
        const d = await curl(['-X', 'DELETE', `https://admin.da.live/source/${ORG}/${SITE}${s.uploadedName}`]);
        if (d.status >= 200 && d.status < 300) s.removed = [...(s.removed || []), s.uploadedName];
        else problems.push(`${p}: could not remove ${s.uploadedName} (${d.status})`);
      }
      // the file name quoted: curl -F reads "," and ";" in a bare name as separators
      const file = path.join(root, s.file).replace(/["\\]/g, '\\$&');
      const r = await curl(['-X', 'POST', '-F', `data=@"${file}";type=${TYPES[extOf(p)]}`, `https://admin.da.live/source/${ORG}/${SITE}${name}`]);
      if (r.status < 200 || r.status >= 300) { s.uploadError = r.status; problems.push(`${p}: upload ${r.status} ${r.body.slice(0, 100)}`); return; }
      delete s.uploadError;
      s.uploadedName = name;
      s.uploaded = new Date().toISOString();
    }
    const pr = await curl(['-X', 'POST', `https://admin.hlx.page/preview/${ORG}/${SITE}/main${name}`]);
    if (pr.status >= 200 && pr.status < 300) {
      s.preview = new Date().toISOString();
      delete s.previewError;
    } else {
      s.previewError = pr.status;
      problems.push(`${p}: preview ${pr.status} ${pr.body.replace(/\s+/g, ' ').slice(0, 120)}`);
    }
    done += 1;
    if (done % 50 === 0) {
      save();
      console.log(`  ${done}/${todo.length} uploaded and previewed`);
    }
  });
  save();
  const ok = [...list.keys()].filter((p) => state[p] && state[p].preview && !state[p].previewError).length;
  console.log(`dam-copy upload: ${done} this run; ${ok}/${list.size} copied and previewed, ${problems.length} problems`);
  problems.slice(0, 30).forEach((x) => console.log(`  ${x}`));
}

function report(list, byName, collisions) {
  const nameOf = new Map([...byName.entries()].map(([n, p]) => [p, n]));
  const rows = [...list.entries()].map(([p, sources]) => {
    const s = state[p] || {};
    let status = 'pending';
    if (s.preview && !s.previewError) status = 'copied';
    else if (s.skipped) status = 'not deliverable';
    else if (s.wwwStatus === 302 || s.wwwStatus === 301) status = 'www fallback';
    else if (s.wwwStatus === 403) status = 'blocked by www';
    else if (s.wwwStatus) status = 'not on www';
    else if (s.uploadError || s.previewError) status = 'upload or preview failed';
    return {
      www: p, eds: nameOf.get(p), sources: [...sources].sort(), status, bytes: s.bytes || 0, why: s.skipped || (s.wwwStatus ? `www ${s.wwwStatus}${s.wwwRedirect ? ` -> ${s.wwwRedirect}` : ''}` : '') || (s.uploadError ? `upload ${s.uploadError}` : '') || (s.previewError ? `preview ${s.previewError}` : ''),
    };
  });
  const count = (f) => rows.filter(f).length;
  const bySource = {};
  rows.forEach((r) => r.sources.forEach((src) => {
    bySource[src] ||= {};
    bySource[src][r.status] = (bySource[src][r.status] || 0) + 1;
  }));
  const out = {
    checkedAt: new Date().toISOString(),
    assets: rows.length,
    copied: count((r) => r.status === 'copied'),
    notDeliverable: count((r) => r.status === 'not deliverable'),
    notOnWww: count((r) => r.status === 'not on www'),
    wwwFallback: count((r) => r.status === 'www fallback'),
    blockedByWww: count((r) => r.status === 'blocked by www'),
    removedMisnamed: Object.values(state).reduce((n, x) => n + (x.removed || []).length, 0),
    failed: count((r) => r.status === 'upload or preview failed'),
    pending: count((r) => r.status === 'pending'),
    bySource,
    collisions,
    problems: rows.filter((r) => !['copied', 'pending'].includes(r.status)),
    loungeIds: [...list.keys()].filter((k) => /\/lh\/images\/lounges\/\d+-square\.jpg$/.test(k)).length,
  };
  fs.mkdirSync(REPORTS, { recursive: true });
  fs.writeFileSync(path.join(REPORTS, 'dam-copy.json'), `${JSON.stringify(out, null, 1)}\n`);
  const md = [
    '# www DAM assets copied into Document Authoring', '', out.checkedAt, '',
    `${out.assets} assets: ${out.copied} copied and previewed, ${out.wwwFallback} answered by www with its missing-image fallback (302; lh-edge answers the same, the targets are copied), ${out.notOnWww} not found on www (404), ${out.blockedByWww} refused by www to scripts (403 Cloudflare challenge: the videos and subtitles), ${out.notDeliverable} not deliverable by Edge Delivery, ${out.failed} upload or preview failed, ${out.pending} pending.`, '',
    'Not deliverable at all: .vtt and .txt (Edge Delivery delivers HTML, JSON, MP4, PDF, SVG, JPG, PNG, AVIF and WEBP); size limits: images and PDF 20 MB, MP4 36 MB, SVG 40 KB.', '',
    `Misnamed copies replaced: ${out.removedMisnamed} (folders with "--" or "," that admin refuses to preview, renamed by the folder rule and the old DA documents removed).`, '',
    '| source | status counts |', '|---|---|',
    ...Object.entries(bySource).sort().map(([src, c]) => `| ${src} | ${Object.entries(c).map(([k, v]) => `${k} ${v}`).join(', ')} |`), '',
    '## Collisions (two www paths, one Edge Delivery name)', '',
    ...(Object.keys(collisions).length ? ['| www path | name on lh-com |', '|---|---|', ...Object.entries(collisions).map(([w, e]) => `| \`${w}\` | \`${e}\` |`)] : ['None.']), '',
    '## Not copied', '',
    '| www path | why | sources |', '|---|---|---|',
    ...out.problems.map((r) => `| \`${r.www}\` | ${r.why} | ${r.sources.join(' ')} |`), '',
  ];
  fs.writeFileSync(path.join(REPORTS, 'dam-copy.md'), md.join('\n'));
  console.log(`dam-copy report: ${md[4]}`);
}

const list = assets();
const { byName, collisions } = names(list);
console.log(`dam-copy: ${list.size} assets, ${Object.keys(collisions).length} collisions`);
if (has('download')) await download(list);
if (has('upload')) await upload(list, byName);
if (has('report') || has('download') || has('upload')) report(list, byName, collisions);
