/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, no-continue, no-loop-func, max-len, import/extensions, no-use-before-define -- tooling */
/**
 * SWISS's DAM files (lh-swiss, as brussels-dam.mjs for lh-brussels): the /content/dam and
 * /etc/designs files lh-swiss's documents show or link (their images, the PDFs and videos they
 * link, the posters of their videos, and the files given with --extra, e.g. a video's subtitle
 * tracks) as copies in lh-swiss's DA under their Edge Delivery names (scripts/dam-path.js
 * edsDamPath, as tools/importer/dam-copy.mjs does for lh-com). The documents show the images from
 * DA (content.da.live) and link the other copies site-relative, so neither the import nor the
 * preview loads anything from www.swiss.com.
 *
 *   --list      the files (www path, Edge Delivery name, pages) -> content-sites/lh-swiss/runs/dam-files.json
 *               (an image shown in several widths: the widest rendition, stored under its asset's name)
 *   --download  plain GETs to www.swiss.com, one file at a time, 5-7 s apart (no page is loaded);
 *               stops at the first 403, 429, 503 or challenge (exit 2) and lists the rest. Files Edge
 *               Delivery can't hold (mp4 over 36 MiB, every .vtt, PDFs over 20 MB) are recorded for
 *               the AEM publish tier with their size from a one-byte GET (Range: bytes=0-0), not
 *               downloaded; --aem <www path>=<bytes|note> records one without a request. Images over
 *               20 MB are recompressed at upload to a JPEG under 20 MB at the same pixel size
 *               (ImageMagick). A file the repository has (etc/designs/lx: www's logo, favicon) is
 *               taken from there. Cache: content-sites/lh-swiss/dam-cache/<www path>
 *   --upload    upload to lh-swiss's DA and preview (never live), 4 at a time
 *   --switch    the documents' images in DA come from DA, their links to the other files become
 *               site-relative edsDamPath links (in DA or for AEM), video links get their subtitle
 *               tracks (www's video viewer, recorded for AEM): runs/dam-switch-upload.txt; with
 *               --pending also the images not fetched yet show from their place in DA (the preview
 *               asks nothing of www; each shows once its copy is uploaded and the page previewed)
 *   --known    every .vtt and the mp4s and PDFs over the limits the groundwork measured
 *               (lists/media.tsv) recorded for AEM with their size, no request
 *   --report    content-sites/lh-swiss/runs/dam-report.json and a summary
 * State: content-sites/lh-swiss/dam-state.json. Options: --extra <www path> (repeatable),
 *   --min-delay / --max-delay <ms> (the download's pace, default and least 5000 / 7000).
 * Usage: node tools/importer/swiss-dam.mjs --list | --known | --download | --upload | --switch [--pending] | --report
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { edsDamPath, parseDamPath } from '../../scripts/dam-path.js';
import { trackLang } from '../../scripts/track-lang.js';

const run = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const has = (n) => argv.includes(`--${n}`);
const all = (n) => argv.flatMap((a, i) => (a === `--${n}` ? [argv[i + 1]] : []));
const ORG = 'moved-permanently';
const SITE = 'lh-swiss';
const HOST = 'https://www.swiss.com';
const W = path.join(root, 'content-sites/lh-swiss');
const DOCS = path.join(W, 'content');
const LIST = path.join(W, 'runs/dam-files.json');
const STATE = path.join(W, 'dam-state.json');
const CACHE = path.join(W, 'dam-cache');
const MB = 1024 * 1024;
// what Edge Delivery holds (the rest goes to the AEM publish tier); images over it are recompressed
export const LIMITS = {
  jpg: 20 * MB, jpeg: 20 * MB, png: 20 * MB, gif: 20 * MB, svg: 20 * MB, webp: 20 * MB, pdf: 20 * MB, mp4: 36 * MB,
};
const TYPES = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', svg: 'image/svg+xml', webp: 'image/webp', pdf: 'application/pdf', mp4: 'video/mp4', vtt: 'text/vtt',
};
const IMAGE = /^(jpe?g|png)$/;
const extOf = (p) => (p.match(/\.([a-z0-9]+)$/i) || [])[1]?.toLowerCase() || '';

/** The width of a rendition path (x.jpg.transform/lh-dcep-transform-width-2560/img.jpg), else 0. */
const widthOf = (www) => parseDamPath(www)?.rendition?.width || 0;

/** The file's own path: a rendition (x.jpg.transform/.../img.jpg) is its asset's copy. */
export const assetOf = (www) => {
  const parsed = parseDamPath(www);
  if (!(parsed && parsed.valid && parsed.rendition)) return www;
  // an asset without a file extension (lh's LH-PETC-bag-illustration): named with its
  // rendition's, as Edge Delivery serves images only with one
  return /\.[a-z0-9]+$/i.test(parsed.asset.split('/').pop()) ? parsed.asset : `${parsed.asset}.${parsed.rendition.ext}`;
};

const decode = (s) => { try { return decodeURIComponent(s); } catch (e) { return s; } };

/**
 * The www files of a document: [www path, kind] (links to /content/dam files; its images under
 * /content/dam and /etc/designs, the posters of its videos among them).
 */
export function damFiles(doc) {
  const out = [];
  [...doc.matchAll(/href="(?:https:\/\/www\.swiss\.com)?(\/content\/dam\/[^"#?]+)/g)].forEach((m) => out.push([decode(m[1]), 'link']));
  const posters = new Set([...doc.matchAll(/<img src="(?:https:\/\/www\.swiss\.com)?(\/content\/dam\/[^"?]+)"[^>]*>(?:(?!<\/div>)[\s\S])*?\.mp4"/g)].map((m) => decode(m[1])));
  // (www's URL, or its copy's place in DA once --switch has run: its Edge Delivery name, which
  // list() maps back to www's path through the page's snapshot)
  [...doc.matchAll(/<img src="https:\/\/(?:www\.swiss\.com|content\.da\.live\/moved-permanently\/lh-swiss)(\/(?:content\/dam|etc\/designs)\/[^"?]+)"/g)].forEach((m) => {
    const www = decode(m[1]);
    if (!/\/undefined\.transform\//.test(www)) out.push([www, posters.has(www) ? 'poster' : 'image']);
  });
  return out;
}

/**
 * www's own names of a snapshot's DAM files by their Edge Delivery name (edsDamPath of the asset):
 * capitals, underscores, spaces and parentheses as www writes them, the only names www serves its
 * files under (DA-normalised ones answered 404 or 403 on www: swiss-dam-001, the magazine's list).
 */
export function ownNames(snapHtml) {
  const own = new Map();
  const set = (raw) => { const www = decode(raw); own.set(edsDamPath(assetOf(www)), www); };
  [...snapHtml.matchAll(/(?:https:\/\/www\.swiss\.com)?(\/content\/dam\/[^"'?#\s)&,]+)/g)].forEach((m) => set(m[1]));
  // names with spaces or parentheses ("260408 SWISS Air Rail EN.mp4", "01-Check-in EN(1440x720).png",
  // "..._Inbound_3-(1).jpg"): up to the file's extension (the first scan stops at a space or ")";
  // requesting the Edge Delivery name instead answered 403 on www, 2026-11-02)
  [...snapHtml.matchAll(/(\/content\/dam\/[^"'?#&,<>]+?\.(?:jpe?g|png|svg|gif|webp|pdf|mp4|vtt))(?=["'?#)&,<\s]|\.transform)/gi)]
    .filter((m) => /[\s()]/.test(m[1]))
    .forEach((m) => set(m[1]));
  return own;
}

const walk = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])) : []);
const readJson = (f, d) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d);
const state = readJson(STATE, {});
const save = () => fs.writeFileSync(STATE, `${JSON.stringify(state, null, 1)}\n`);
const cacheFile = (www) => path.join(CACHE, www.replace(/^\/content\/dam\//, ''));

function list() {
  const files = new Map();
  // an image is one file per Edge Delivery name (its widest rendition: renditions share the
  // asset's name; a document switched to DA names it by that name only)
  const keyOf = (www, kind) => (kind === 'link' || kind === 'track' || kind === 'extra' ? www : `image:${edsDamPath(assetOf(www))}`);
  const named = (x) => x.www === x.eds;
  const add = (www, page, kind) => {
    const key = keyOf(www, kind);
    const had = files.get(key);
    if (!had) {
      files.set(key, {
        www, asset: assetOf(www), eds: edsDamPath(assetOf(www)), kind, pages: new Set(),
      });
    } else if (key.startsWith('image:') && !['cached', 'aem'].includes(state[had.www]?.status)
      && (['cached', 'aem'].includes(state[www]?.status) || named(had) || (www !== edsDamPath(assetOf(www)) && widthOf(www) > widthOf(had.www)))) {
      // (a rendition already fetched is the asset's copy; www's own path over the Edge Delivery
      // name; else the widest)
      Object.assign(had, { www, asset: assetOf(www) });
    }
    if (page) files.get(key).pages.add(page);
  };
  // the documents link the Edge Delivery names (swiss-import.mjs writes relativeDamLinks): www's own
  // path (capitals, underscores, spaces) comes from the page's snapshot, the file with that name
  const SNAPS = path.join(root, 'tools/importer/bd-snapshots/www.swiss.com');
  walk(DOCS).filter((f) => f.endsWith('.plain.html')).forEach((f) => {
    const p = `/${path.relative(DOCS, f).replace(/\.plain\.html$/, '')}`;
    const snap = path.join(SNAPS, `${p}.html`);
    const snapHtml = fs.existsSync(snap) ? fs.readFileSync(snap, 'utf8') : '';
    const own = ownNames(snapHtml);
    const linked = damFiles(fs.readFileSync(f, 'utf8')).map(([link, kind]) => [own.get(edsDamPath(assetOf(link))) || link, kind]);
    linked.forEach(([www, kind]) => add(www, p, kind));
    // the subtitle tracks of the page's videos (www's video viewer): for AEM with their video
    const tracks = tracksOf(snapHtml);
    linked.filter(([www]) => /\.mp4$/i.test(www)).forEach(([www]) => {
      const t = tracks[www] || Object.entries(tracks).find(([v]) => edsDamPath(v) === edsDamPath(www))?.[1];
      // (a video without subtitles names Lufthansa's global tree, /content/sn/gc/<ll>: no file;
      // its nl one answered 403, 2026-11-01)
      if (t) [t.cc, t.ad].filter((v) => v && /^\/content\/dam\/.+\.vtt$/i.test(v)).forEach((v) => add(v, p, 'track'));
    });
  });
  all('extra').forEach((www) => add(www, null, 'extra'));
  // files the documents don't link but their pages show on www (runs/dam-extra.tsv: www path, pages:
  // the moving image's video of the hero on the homepage and the flight pages, which
  // hero-card-overlay doesn't play)
  const extra = path.join(W, 'runs/dam-extra.tsv');
  if (fs.existsSync(extra)) {
    fs.readFileSync(extra, 'utf8').split('\n').slice(1).filter(Boolean)
      .forEach((l) => {
        const [www, pages = ''] = l.split('\t');
        add(www, null, 'extra');
        pages.split(' ').filter(Boolean).forEach((p) => files.get(keyOf(www, 'extra')).pages.add(p));
      });
  }
  const out = [...files.values()].map((x) => ({ ...x, pages: [...x.pages].sort() }));
  // two www paths under one Edge Delivery name would overwrite each other in DA
  const byName = new Map();
  out.forEach((x) => byName.set(x.eds, [...(byName.get(x.eds) || []), x.www]));
  const clashes = [...byName.entries()].filter(([, l]) => new Set(l.map(assetOf)).size > 1);
  // (a linked file and an image of the same asset are the same file)
  // (www's lhg-power-of-attorney-form-en.pdf, which answers 404, and -form--en.pdf: both linked as
  // www has them; the copy in DA under the shared name is the one of the first)
  if (clashes.length) console.warn(`swiss-dam list: Edge Delivery name collisions (one copy each): ${JSON.stringify(clashes)}`);
  fs.writeFileSync(LIST, `${JSON.stringify(out, null, 1)}\n`);
  console.log(`swiss-dam list: ${out.length} files (${out.filter((x) => x.kind === 'image').length} images, ${out.filter((x) => x.kind === 'link').length} linked, ${out.filter((x) => x.kind === 'poster').length} posters, ${out.filter((x) => x.kind === 'track').length} tracks, ${out.filter((x) => x.kind === 'extra').length} extra) on ${new Set(out.flatMap((x) => x.pages)).size} pages`);
}

/** Over what Edge Delivery holds and not an image (those are recompressed): for AEM. */
const forAem = (www, bytes) => extOf(www) === 'vtt' || (!IMAGE.test(extOf(www)) && bytes > (LIMITS[extOf(www)] ?? 0));

// the browser a visitor uses (www answers files to it; no cookies, no page load)
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36';
const REPO_COPIES = { '/etc/designs/lx/': 'etc/designs/lx/' };

/** A block's answer: 403, 429, 503, Cloudflare's challenge (cf-mitigated) or an HTML page for a file. */
export function isBlock(status, headers, www) {
  if ([403, 429, 503].includes(status)) return true;
  if ((headers.get('cf-mitigated') || '').includes('challenge')) return true;
  return status === 200 && /text\/html/i.test(headers.get('content-type') || '') && !/\.html?$/i.test(www);
}

async function download() {
  const files = readJson(LIST, []);
  // --aem <www path>=<bytes|note>: a file known to be for AEM (on AEM already, or its size given): not fetched
  all('aem').forEach((a) => {
    const [www, note] = a.split('=');
    if (!state[www] || state[www].status !== 'aem') state[www] = { status: 'aem', ...(Number(note) ? { bytes: Number(note) } : { note }), at: new Date().toISOString() };
  });
  save();
  // done: in the cache, for AEM, or www's own answer (www-404: a file www lacks)
  const done = (s) => s && (['cached', 'aem'].includes(s.status) || /^www-/.test(s.status));
  // a file the repository holds (www's logo and icons in etc/designs/lx): copied, not requested
  files.filter((x) => !done(state[x.www])).forEach((x) => {
    const prefix = Object.keys(REPO_COPIES).find((p) => x.www.startsWith(p));
    const own = prefix && path.join(root, REPO_COPIES[prefix], x.www.slice(prefix.length));
    if (!own || !fs.existsSync(own)) return;
    fs.mkdirSync(path.dirname(cacheFile(x.www)), { recursive: true });
    fs.copyFileSync(own, cacheFile(x.www));
    state[x.www] = {
      status: 'cached', bytes: fs.statSync(own).size, source: path.relative(root, own), at: new Date().toISOString(),
    };
  });
  save();
  const todo = files.filter((x) => !done(state[x.www]));
  if (!todo.length) { console.log('swiss-dam download: nothing to do'); return 0; }
  // --min-delay / --max-delay (ms): the pace, never under 5 s between two requests
  const minDelay = Math.max(5000, Number(all('min-delay')[0] || 5000));
  const maxDelay = Math.max(minDelay, Number(all('max-delay')[0] || 7000));
  const pause = () => new Promise((res) => { setTimeout(res, minDelay + Math.floor(Math.random() * (maxDelay - minDelay))); });
  const get = async (url, headers = {}) => {
    try {
      return await fetch(url, {
        headers: {
          'User-Agent': UA, Accept: '*/*', Referer: `${HOST}/`, ...headers,
        },
        redirect: 'manual',
        signal: AbortSignal.timeout(120000),
      });
    } catch (e) {
      return { error: e.message.split('\n')[0] };
    }
  };
  let blocked = null;
  let fetched = 0;
  for (const x of todo) {
    if (fetched) await pause();
    fetched += 1;
    const url = `${HOST}${x.www.split('/').map((seg) => encodeURIComponent(seg)).join('/')}`;
    // a video or a PDF: first its size from a one-byte GET (Range: bytes=0-0, Content-Range); over
    // what Edge Delivery holds it is recorded for AEM without the download
    if (extOf(x.www) === 'mp4' || extOf(x.www) === 'pdf' || extOf(x.www) === 'vtt') {
      const r = await get(url, { Range: 'bytes=0-0' });
      if (r.error) { blocked = `fetch failed (${r.error})`; state[x.www] = { status: 'fetch-failed', error: r.error, at: new Date().toISOString() }; break; }
      await r.arrayBuffer().catch(() => null);
      if (isBlock(r.status, r.headers, x.www)) { blocked = `${r.status}${r.headers.get('cf-mitigated') ? ' challenge' : ''}`; state[x.www] = { status: `blocked-${r.status}`, at: new Date().toISOString() }; break; }
      const total = Number(((r.headers.get('content-range') || '').match(/\/(\d+)$/) || [])[1]) || Number(r.headers.get('content-length')) || 0;
      if ([200, 206].includes(r.status) && (extOf(x.www) === 'vtt' || total > LIMITS[extOf(x.www)])) {
        state[x.www] = {
          status: 'aem', bytes: total, wwwBytes: total, note: 'size from Content-Range, not downloaded', at: new Date().toISOString(),
        };
        console.log(`${r.status} ${total}B ${x.www} (for AEM, not downloaded)`);
        save();
        continue;
      }
      if (![200, 206].includes(r.status)) {
        state[x.www] = { status: `www-${r.status}`, at: new Date().toISOString() };
        console.log(`${r.status} ${x.www}`);
        save();
        continue;
      }
      await pause();
    }
    const r = await get(url);
    if (r.error) { blocked = `fetch failed (${r.error})`; state[x.www] = { status: 'fetch-failed', error: r.error, at: new Date().toISOString() }; break; }
    if (isBlock(r.status, r.headers, x.www)) {
      await r.arrayBuffer().catch(() => null);
      blocked = `${r.status}${r.headers.get('cf-mitigated') ? ' challenge' : ''}`;
      state[x.www] = { status: `blocked-${r.status}`, at: new Date().toISOString() };
      break;
    }
    if (r.status !== 200) {
      await r.arrayBuffer().catch(() => null);
      // a redirect (an offers image www lacks answers 302 to a stand-in) or a 404: www's own answer
      state[x.www] = { status: `www-${r.status}`, location: r.headers.get('location') || undefined, at: new Date().toISOString() };
      console.log(`${r.status} ${x.www}`);
      save();
      continue;
    }
    const buf = Buffer.from(await r.arrayBuffer());
    const file = cacheFile(x.www);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, buf);
    state[x.www] = {
      status: forAem(x.www, buf.length) ? 'aem' : 'cached', bytes: buf.length, wwwBytes: buf.length, type: r.headers.get('content-type') || '', at: new Date().toISOString(),
    };
    console.log(`200 ${buf.length}B ${x.www}${state[x.www].status === 'aem' ? ' (for AEM)' : ''}`);
    save();
  }
  save();
  if (blocked) {
    const rest = files.filter((x) => !done(state[x.www])).map((x) => x.www);
    fs.writeFileSync(path.join(W, 'runs/dam-not-fetched.txt'), `${rest.join('\n')}\n`);
    console.error(`swiss-dam: BLOCKED (${blocked}) at the file after ${fetched - 1} requests; stopping. ${rest.length} files not fetched: runs/dam-not-fetched.txt`);
    return 2;
  }
  return 0;
}

/** An image over Edge Delivery's 20 MB: recompressed (JPEG, same pixel size) until it fits. */
async function fitImage(www) {
  const s = state[www];
  const file = cacheFile(www);
  if (!IMAGE.test(extOf(www)) || s.bytes <= LIMITS[extOf(www)]) return;
  const out = `${file}.fit.jpg`;
  for (const quality of [90, 85, 80, 75]) {
    await run('convert', [file, '-strip', '-quality', String(quality), out]);
    const bytes = fs.statSync(out).size;
    const { stdout } = await run('identify', ['-format', '%wx%h', out]);
    const { stdout: was } = await run('identify', ['-format', '%wx%h', file]);
    if (bytes <= 19 * MB) {
      Object.assign(s, {
        fitted: path.basename(out), bytes, quality, pixels: stdout.trim(), wwwPixels: was.trim(),
      });
      console.log(`fitted ${www}: ${s.wwwBytes}B ${was.trim()} -> ${bytes}B ${stdout.trim()} (JPEG quality ${quality}, metadata stripped)`);
      save();
      return;
    }
  }
  throw new Error(`${www}: still over 19 MB at quality 75`);
}

async function curl(args) {
  try {
    const { stdout } = await run('curl', ['-s', '-w', '\n%{http_code}', ...args], { maxBuffer: 16 * MB });
    const i = stdout.lastIndexOf('\n');
    return { body: stdout.slice(0, i), status: Number(stdout.slice(i + 1)) };
  } catch (e) {
    return { body: String(e.message), status: 0 };
  }
}

async function upload() {
  const files = readJson(LIST, []);
  // (renditions of one asset share its file: the one copy per Edge Delivery name)
  const seen = new Set();
  const todo = files.filter((x) => state[x.www]?.status === 'cached' && !(state[x.www].preview && !state[x.www].previewError))
    .filter((x) => !seen.has(x.eds) && seen.add(x.eds));
  for (const x of todo) await fitImage(x.www);
  let done = 0;
  const problems = [];
  for (let i = 0; i < todo.length; i += 4) {
    await Promise.all(todo.slice(i, i + 4).map(async (x) => {
      const s = state[x.www];
      const file = s.fitted ? path.join(path.dirname(cacheFile(x.www)), s.fitted) : cacheFile(x.www);
      const ext = s.fitted ? 'jpg' : (extOf(x.asset) || extOf(x.www));
      const up = await curl(['-X', 'POST', '-F', `data=@"${file}";type=${TYPES[ext]}`, `https://admin.da.live/source/${ORG}/${SITE}${x.eds}`]);
      if (up.status < 200 || up.status >= 300) { s.uploadError = up.status; problems.push(`${x.www}: DA ${up.status}`); return; }
      s.uploaded = new Date().toISOString();
      delete s.uploadError;
      const pr = await curl(['-X', 'POST', `https://admin.hlx.page/preview/${ORG}/${SITE}/main${x.eds}`]);
      if (pr.status === 200) { s.preview = new Date().toISOString(); delete s.previewError; done += 1; } else { s.previewError = pr.status; problems.push(`${x.www}: preview ${pr.status} ${pr.body.replace(/\s+/g, ' ').slice(0, 120)}`); }
    }));
    save();
  }
  console.log(`swiss-dam upload: ${done}/${todo.length} uploaded and previewed, ${problems.length} problems`);
  problems.forEach((p) => console.log(`  ${p}`));
}

/**
 * The files the groundwork measured (lists/media.tsv: kind, url, status, bytes, goes_to): every .vtt
 * and each mp4 or PDF over what Edge Delivery holds is recorded for AEM with that size, no request.
 */
function known() {
  const f = path.join(W, 'lists/media.tsv');
  if (!fs.existsSync(f)) return;
  const [head, ...lines] = fs.readFileSync(f, 'utf8').trim().split('\n');
  const keys = head.split('\t');
  const sizes = new Map(lines.map((l) => Object.fromEntries(l.split('\t').map((v, i) => [keys[i], v]))).map((r) => [r.url, Number(r.bytes) || 0]));
  let n = 0;
  readJson(LIST, []).forEach((x) => {
    if (['cached', 'aem'].includes(state[x.www]?.status) || (!sizes.has(x.www) && extOf(x.www) !== 'vtt')) return;
    const bytes = sizes.get(x.www);
    if (extOf(x.www) !== 'vtt' && !(bytes > (LIMITS[extOf(x.www)] ?? Infinity))) return;
    state[x.www] = {
      status: 'aem', ...(bytes ? { bytes, wwwBytes: bytes } : {}), note: 'size from the groundwork (lists/media.tsv), not requested', at: new Date().toISOString(),
    };
    n += 1;
  });
  save();
  console.log(`swiss-dam known: ${n} files for AEM from the groundwork's sizes`);
}

function report() {
  const files = readJson(LIST, []);
  const rows = files.map((x) => ({ ...x, ...(state[x.www] || { status: 'pending' }) }));
  fs.writeFileSync(path.join(W, 'runs/dam-report.json'), `${JSON.stringify(rows, null, 1)}\n`);
  const count = (f) => rows.filter(f).length;
  console.log(`swiss-dam: ${rows.length} files; in DA and previewed ${count((r) => r.preview && !r.previewError)}, for AEM ${count((r) => r.status === 'aem')}, other ${count((r) => !r.preview && r.status !== 'aem')}`);
  // (renditions of an asset whose copy is in DA under another rendition's entry count as other)
  rows.filter((r) => !r.preview && r.status !== 'aem').forEach((r) => console.log(`  ${r.status} ${r.www}`));
}

const DA_CONTENT = `https://content.da.live/${ORG}/${SITE}`;
const WWW_DAM = /href="(?:https:\/\/www\.swiss\.com)?(\/content\/dam\/[^"#?]+)"/g;

/** The documents' links to www's DAM files as site-relative links to their copies (edsDamPath). */
export function relativeDamLinks(doc, keep = () => true) {
  return doc.replace(WWW_DAM, (m, p) => {
    const www = decodeURIComponent(p);
    if (!keep(www)) return m;
    return `href="${edsDamPath(assetOf(www))}"`;
  });
}

/** www's video viewers of a page: videoSrc -> {cc, ad} (their subtitle tracks). */
export function tracksOf(html) {
  const out = {};
  [...String(html || '').matchAll(/data-dcep="([^"]*videoSrc[^"]*)"/g)].forEach((m) => {
    const cfg = m[1].replace(/&quot;/g, '"');
    const get = (k) => (cfg.match(new RegExp(`"${k}":\\s*"([^"]*)"`)) || [])[1] || '';
    const video = get('videoSrc');
    if (video) out[video] = { cc: get('closedCaptionsSrc'), ad: get('audioDescriptionSrc') };
  });
  return out;
}

const TRACK_LABELS = { en: ['Subtitles', 'Audio description'], de: ['Untertitel', 'Audiodeskription'] };

/**
 * A document's video links followed by their subtitle tracks (as lh-com's video pages:
 * <a href=".mp4">…</a> <a href=".vtt">Subtitles</a> <a href=".vtt">Audio description</a>), for
 * the tracks www's viewer names and `accept` takes; tracks already there are kept. Each label is
 * in the track's language (scripts/track-lang.js: the file name's, else the page's `lang`).
 */
export function withTracks(doc, tracks, lang, accept = () => true) {
  const labels = (t) => TRACK_LABELS[trackLang(t, lang)] || TRACK_LABELS.en;
  return doc.replace(/(<a href="([^"]+\.mp4)">[^<]*<\/a>)((?:\s*<a href="[^"]+\.vtt">[^<]*<\/a>)*)/g, (m, link, href, existing) => {
    const video = Object.keys(tracks).find((v) => href === v || href.endsWith(edsDamPath(v)) || href.endsWith(v));
    if (!video || existing) return m;
    const { cc, ad } = tracks[video];
    const add = [[cc, 0], [ad, 1]].filter(([t]) => t && accept(t))
      .map(([t, i]) => ` <a href="${edsDamPath(t)}">${labels(t)[i]}</a>`);
    return `${link}${add.join('')}`;
  });
}

/**
 * A document without the images www no longer has (gone: their Edge Delivery names; www answers
 * 404, no other rendition of the picture at hand): the picture goes, and its paragraph when it
 * held only the picture; a block's cell stays (empty).
 */
export function withoutGoneImages(doc, gone) {
  if (!gone.size) return doc;
  const isGone = (src) => {
    let p = src.replace(/^https:\/\/(?:www\.swiss\.com|content\.da\.live\/moved-permanently\/lh-swiss)/, '').split('?')[0];
    try { p = decodeURIComponent(p); } catch (e) { /* as it is */ }
    return gone.has(p) || gone.has(edsDamPath(assetOf(p)));
  };
  const img = '<img src="([^"]+)"[^>]*>';
  return doc
    .replace(new RegExp(`<p><picture>(?:(?!</picture>)[\\s\\S])*?${img}</picture></p>`, 'g'), (m, src) => (isGone(src) ? '' : m))
    .replace(new RegExp(`<picture>(?:(?!</picture>)[\\s\\S])*?${img}</picture>`, 'g'), (m, src) => (isGone(src) ? '' : m))
    .replace(new RegExp(`<p>${img}</p>`, 'g'), (m, src) => (isGone(src) ? '' : m))
    .replace(new RegExp(img, 'g'), (m, src) => (isGone(src) ? '' : m));
}

/**
 * The documents switched to the copies: links to www's DAM files that are in DA (previewed) or
 * for AEM become site-relative edsDamPath links; the posters in DA are taken from DA
 * (content.da.live); video links get their tracks recorded for AEM. Writes the changed documents
 * to content-sites/lh-swiss/runs/dam-switch-upload.txt (for da-upload.mjs).
 */
function switchLinks() {
  const files = readJson(LIST, []);
  const inDa = (www) => state[www]?.preview && !state[www].previewError;
  const ready = (www) => inDa(www) || state[www]?.status === 'aem';
  // an image (any rendition of its asset) whose copy is in DA: shown from DA; with --pending also
  // an image not fetched yet (a block stopped the downloads): its copy's place in DA, so the
  // preview requests nothing from www (the image shows once its copy is uploaded and the page
  // previewed again)
  const pending = (www) => has('pending') && !state[www]?.status?.startsWith('www-') && state[www]?.status !== 'aem';
  const shown = new Map(files.filter((x) => ['image', 'poster'].includes(x.kind) && (inDa(x.www) || pending(x.www))).map((x) => [x.asset, x.eds]));
  const SNAP = path.join(root, 'tools/importer/bd-snapshots/www.swiss.com');
  const gone = new Set(files.filter((x) => ['image', 'poster'].includes(x.kind) && state[x.www]?.status === 'www-404').map((x) => x.eds));
  const changed = [];
  walk(DOCS).filter((f) => f.endsWith('.plain.html')).forEach((f) => {
    const p = `/${path.relative(DOCS, f).replace(/\.plain\.html$/, '')}`;
    const before = fs.readFileSync(f, 'utf8');
    let doc = relativeDamLinks(before, ready);
    // a file www itself answers 404 for: the link stays www's own (as on Discover), not a copy
    files.filter((x) => /^www-4/.test(state[x.www]?.status || '')).forEach((x) => {
      doc = doc.split(`href="${x.eds}"`).join(`href="${HOST}${x.www.split('/').map((seg) => encodeURIComponent(seg)).join('/')}"`);
    });
    doc = doc.replace(/<img src="(?:https:\/\/www\.swiss\.com)?(\/(?:content\/dam|etc\/designs)\/[^"?]+)"/g, (m, src) => {
      const eds = shown.get(assetOf(decode(src)));
      return eds ? `<img src="${DA_CONTENT}${eds}"` : m;
    });
    // the images www no longer has (a capture's not-fetched list: 404)
    doc = withoutGoneImages(doc, gone);
    const snap = path.join(SNAP, `${p}.html`);
    if (fs.existsSync(snap)) doc = withTracks(doc, tracksOf(fs.readFileSync(snap, 'utf8')), p.split('/')[2], ready);
    if (doc === before) return;
    fs.writeFileSync(f, doc);
    changed.push(p);
  });
  fs.writeFileSync(path.join(W, 'runs/dam-switch-upload.txt'), `${changed.join('\n')}\n`);
  console.log(`swiss-dam switch: ${changed.length} documents changed (runs/dam-switch-upload.txt)`);
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  let code = 0;
  if (has('list')) list();
  if (has('known')) known();
  if (has('download')) code = await download();
  if (has('upload')) await upload();
  if (has('switch')) switchLinks();
  if (has('report')) report();
  process.exit(code);
}
