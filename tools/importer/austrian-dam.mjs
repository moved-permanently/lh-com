/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, no-continue, no-loop-func, max-len, import/extensions, no-use-before-define -- tooling */
/**
 * ITA's DAM files (lh-ita, as discover-dam.mjs for lh-discover): the /content/dam files lh-ita's documents link to (the
 * PDFs and videos they link, the posters of their videos, and the files given with --extra, e.g.
 * a video's subtitle tracks) as copies in lh-ita's DA under their Edge Delivery names
 * (scripts/dam-path.js edsDamPath, as tools/importer/dam-copy.mjs does for lh-com); lh-edge's DAM
 * route would answer www's DAM URLs from them on an ITA host (then AEM); on the preview the documents
 * link the copies site-relative.
 *
 *   --list      the files (www path, Edge Delivery name, pages) -> content-sites/lh-austrian/runs/dam-files.json
 *   --download  through ONE warm Bright Data session (the ITA homepage /at/en/homepage first, then each file
 *               fetched inside that page, same origin, one GET, no HEAD), one request every 3-5 s;
 *               stops at the first 403, 429 or challenge (exit 2). Files Edge Delivery can't hold
 *               (mp4 over 36 MB, every .vtt, PDFs over 20 MB) are recorded for the AEM publish tier
 *               with their size, not uploaded; --aem <www path>=<bytes|note> records one without a
 *               request (on AEM already, or its size known). Images over 20 MB are recompressed at
 *               upload to a JPEG under 20 MB at the same pixel size (ImageMagick).
 *               Cache: content-sites/lh-austrian/dam-cache/<www path>
 *   --upload    upload to lh-ita's DA and preview (never live), 4 at a time
 *   --switch    the documents' links to those files become site-relative edsDamPath links (in DA or
 *               for AEM), the posters in DA are taken from DA, video links get their subtitle
 *               tracks (www's video viewer, recorded for AEM): runs/dam-switch-upload.txt
 *   --report    content-sites/lh-austrian/runs/dam-report.json and a summary
 * State: content-sites/lh-austrian/dam-state.json. Options: --extra <www path> (repeatable),
 *   --min-delay / --max-delay <ms> (the download's pace, default 3000 / 5000).
 * Usage: node tools/importer/austrian-dam.mjs --list | --download | --upload | --report
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
const SITE = 'lh-austrian';
const HOST = 'https://www.austrian.com';
const W = path.join(root, 'content-sites/lh-austrian');
const DOCS = path.join(W, 'content');
const LIST = path.join(W, 'runs/dam-files.json');
const STATE = path.join(W, 'dam-state.json');
const CACHE = path.join(W, 'dam-cache');
const MB = 1024 * 1024;
// what Edge Delivery holds (the rest goes to the AEM publish tier); images over it are recompressed
export const LIMITS = {
  jpg: 20 * MB, jpeg: 20 * MB, png: 20 * MB, pdf: 20 * MB, mp4: 36 * MB,
};
const TYPES = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', pdf: 'application/pdf', mp4: 'video/mp4', vtt: 'text/vtt',
};
const IMAGE = /^(jpe?g|png)$/;
const extOf = (p) => (p.match(/\.([a-z0-9]+)$/i) || [])[1]?.toLowerCase() || '';
const CHALLENGE = /just a moment|checking your browser|attention required|verifying you are human|performing security verification|access denied|^blocked$/i;

/** The file's own path: a rendition (x.jpg.transform/.../img.jpg) is its asset's copy. */
export const assetOf = (www) => {
  const parsed = parseDamPath(www);
  return parsed && parsed.valid && parsed.rendition ? parsed.asset : www;
};

/** The /content/dam files of a document: [www path, kind] (links, and the posters of its videos). */
export function damFiles(doc) {
  const out = [];
  [...doc.matchAll(/href="(?:https:\/\/www\.austrian\.com)?(\/content\/dam\/[^"#?]+)/g)].forEach((m) => out.push([decodeURIComponent(m[1]), 'link']));
  [...doc.matchAll(/<img src="(?:https:\/\/www\.austrian\.com)?(\/content\/dam\/[^"?]+)"[^>]*>(?:(?!<\/div>)[\s\S])*?\.mp4"/g)].forEach((m) => out.push([decodeURIComponent(m[1]), 'poster']));
  return out;
}

const walk = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])) : []);
const readJson = (f, d) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d);
const state = readJson(STATE, {});
const save = () => fs.writeFileSync(STATE, `${JSON.stringify(state, null, 1)}\n`);
const cacheFile = (www) => path.join(CACHE, www.replace(/^\/content\/dam\//, ''));

function list() {
  const files = new Map();
  const add = (www, page, kind) => {
    if (!files.has(www)) {
      files.set(www, {
        www, asset: assetOf(www), eds: edsDamPath(assetOf(www)), kind, pages: new Set(),
      });
    }
    if (page) files.get(www).pages.add(page);
  };
  // the documents link the Edge Delivery names (austrian-import.mjs writes relativeDamLinks): www's own
  // path (capitals, underscores, spaces) comes from the page's snapshot, the file with that name
  const SNAPS = path.join(root, 'tools/importer/bd-snapshots/www.austrian.com');
  walk(DOCS).filter((f) => f.endsWith('.plain.html')).forEach((f) => {
    const p = `/${path.relative(DOCS, f).replace(/\.plain\.html$/, '')}`;
    const snap = path.join(SNAPS, `${p}.html`);
    const own = new Map();
    const snapHtml = fs.existsSync(snap) ? fs.readFileSync(snap, 'utf8') : '';
    const decode = (s) => { try { return decodeURIComponent(s); } catch (e) { return s; } };
    [...snapHtml.matchAll(/(?:https:\/\/www\.austrian\.com)?(\/content\/dam\/[^"'?#\s)&,]+)/g)]
      .forEach((m) => { const www = decode(m[1]); own.set(edsDamPath(assetOf(www)), www); });
    const linked = damFiles(fs.readFileSync(f, 'utf8')).map(([link, kind]) => [own.get(edsDamPath(assetOf(link))) || link, kind]);
    linked.forEach(([www, kind]) => add(www, p, kind));
    // the subtitle tracks of the page's videos (www's video viewer): for AEM with their video
    const tracks = tracksOf(snapHtml);
    linked.filter(([www]) => /\.mp4$/i.test(www)).forEach(([www]) => {
      const t = tracks[www] || Object.entries(tracks).find(([v]) => edsDamPath(v) === edsDamPath(www))?.[1];
      if (t) [t.cc, t.ad].filter(Boolean).forEach((v) => add(v, p, 'track'));
    });
  });
  all('extra').forEach((www) => add(www, null, 'extra'));
  const out = [...files.values()].map((x) => ({ ...x, pages: [...x.pages].sort() }));
  // two www paths under one Edge Delivery name would overwrite each other in DA
  const byName = new Map();
  out.forEach((x) => byName.set(x.eds, [...(byName.get(x.eds) || []), x.www]));
  const clashes = [...byName.entries()].filter(([, l]) => new Set(l.map(assetOf)).size > 1);
  if (clashes.length) throw new Error(`Edge Delivery name collisions: ${JSON.stringify(clashes)}`);
  fs.writeFileSync(LIST, `${JSON.stringify(out, null, 1)}\n`);
  console.log(`austrian-dam list: ${out.length} files (${out.filter((x) => x.kind === 'link').length} linked, ${out.filter((x) => x.kind === 'poster').length} posters, ${out.filter((x) => x.kind === 'extra').length} extra) on ${new Set(out.flatMap((x) => x.pages)).size} pages`);
}

/** Over what Edge Delivery holds and not an image (those are recompressed): for AEM. */
const forAem = (www, bytes) => extOf(www) === 'vtt' || (!IMAGE.test(extOf(www)) && bytes > (LIMITS[extOf(www)] ?? 0));

async function download() {
  const files = readJson(LIST, []);
  // --aem <www path>=<bytes|note>: a file known to be for AEM (on AEM already, or its size given): not fetched
  all('aem').forEach((a) => {
    const [www, note] = a.split('=');
    if (!state[www] || state[www].status !== 'aem') state[www] = { status: 'aem', ...(Number(note) ? { bytes: Number(note) } : { note }), at: new Date().toISOString() };
  });
  save();
  // --skip <www path prefix>: files not requested in this run (a folder www refuses to the session)
  const skip = all('skip');
  // done: in the cache, for AEM, or www's own answer (www-404: a file www lacks)
  const done = (s) => s && (['cached', 'aem'].includes(s.status) || /^www-/.test(s.status));
  const todo = files.filter((x) => !done(state[x.www]) && !skip.some((p) => x.www.startsWith(p)));
  if (!todo.length) { console.log('austrian-dam download: nothing to do'); return 0; }
  const EXCAT = process.env.EXCAT_ROOT || '/home/node/.excat-marketplaces/excat-marketplace';
  const { connectBrowser } = await import(path.join(EXCAT, 'excat/skills/excat-scrape-webpage/scripts/browser-source.js'));
  const hard = setTimeout(() => { console.error('austrian-dam: hard timeout'); process.exit(124); }, 120000 + todo.length * 90000);
  hard.unref();
  let blocked = false;
  const browser = await connectBrowser('bd');
  try {
    const page = await browser.newPage();
    try { await page.goto(`${HOST}/at/en/homepage`, { timeout: 90000, waitUntil: 'domcontentloaded' }); } catch (e) { console.error(`austrian-dam: navigation interrupted (${e.message.split('\n')[0]})`); }
    const title = async () => page.title().catch(() => 'just a moment');
    for (let i = 0; i < 60 && (CHALLENGE.test(await title()) || !(await title())); i += 1) await page.waitForTimeout(1000);
    if (CHALLENGE.test(await title())) throw new Error('homepage still behind the challenge');
    await page.waitForTimeout(2000);
    // --min-delay / --max-delay (ms): the pace (default one request every 3-5 s)
    const [minDelay, maxDelay] = [Number(all('min-delay')[0] || 3000), Number(all('max-delay')[0] || 5000)];
    const pause = () => page.waitForTimeout(minDelay + Math.floor(Math.random() * Math.max(0, maxDelay - minDelay)));
    for (const x of todo) {
      const url = `${HOST}${x.www.split('/').map((seg) => encodeURIComponent(seg)).join('/')}`;
      // a video: first its size from a one-byte GET (Range: bytes=0-0, Content-Range); over what
      // Edge Delivery holds it is recorded for AEM without the download (a whole video read inside
      // the page closed the remote browser, 2026-10-30)
      if (extOf(x.www) === 'mp4') {
        const size = await page.evaluate(async (u) => {
          const r = await fetch(u, { credentials: 'include', headers: { Range: 'bytes=0-0' } });
          await r.arrayBuffer();
          const total = ((r.headers.get('content-range') || '').match(/\/(\d+)$/) || [])[1];
          return { status: r.status, total: Number(total) || Number(r.headers.get('content-length')) || 0 };
        }, url).catch((e) => ({ status: 0, error: e.message.split('\n')[0] }));
        if (size.status === 403 || size.status === 429) {
          // still a stop, but not asked again (2026-10-31: 403 for the two chat assistant videos'
          // one-byte GETs, other videos answered): the page links www's file
          state[x.www] = {
            ...state[x.www], status: size.status === 403 ? 'www-403-range' : `blocked-${size.status}`, at: new Date().toISOString(),
          };
          blocked = true;
          console.error(`austrian-dam: ${size.status} at ${x.www}; stopping`);
          break;
        }
        if ((size.status === 206 || size.status === 200) && size.total > LIMITS.mp4) {
          state[x.www] = {
            status: 'aem', bytes: size.total, wwwBytes: size.total, note: 'size from Content-Range, not downloaded', at: new Date().toISOString(),
          };
          console.log(`${size.status} ${size.total}B ${x.www} (for AEM, not downloaded)`);
          save();
          await pause();
          continue;
        }
        await pause();
      }
      // one GET per file, no HEAD (2026-10-29: www answered a HEAD of a large video with 403)
      const got = await page.evaluate(async (u) => {
        const r = await fetch(u, { credentials: 'include' });
        const type = r.headers.get('content-type') || '';
        if (r.status !== 200) return { status: r.status, type, b64: '' };
        const bytes = new Uint8Array(await r.arrayBuffer());
        let b = '';
        for (let i = 0; i < bytes.length; i += 0x8000) b += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
        return { status: r.status, type, b64: btoa(b) };
      }, url).catch((e) => ({
        status: 0, type: '', b64: '', error: e.message.split('\n')[0],
      }));
      if (got.error) {
        state[x.www] = { status: 'fetch-failed', error: got.error, at: new Date().toISOString() };
        blocked = true;
        console.error(`austrian-dam: fetch failed at ${x.www} (${got.error}); stopping`);
        break;
      }
      // a block: 403, 429 (a challenge page comes as one of them); a 404 is a file www lacks
      if (got.status === 403 || got.status === 429) {
        state[x.www] = { ...state[x.www], status: `blocked-${got.status}`, at: new Date().toISOString() };
        blocked = true;
        console.error(`austrian-dam: ${got.status} at ${x.www}; stopping`);
        break;
      }
      if (got.status !== 200) {
        state[x.www] = { status: `www-${got.status}`, at: new Date().toISOString() };
        console.log(`${got.status} ${x.www}`);
        save();
        await pause();
        continue;
      }
      const buf = Buffer.from(got.b64, 'base64');
      const file = cacheFile(x.www);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, buf);
      state[x.www] = {
        status: forAem(x.www, buf.length) ? 'aem' : 'cached', bytes: buf.length, wwwBytes: buf.length, type: got.type, at: new Date().toISOString(),
      };
      console.log(`200 ${buf.length}B ${x.www}${state[x.www].status === 'aem' ? ' (for AEM)' : ''}`);
      save();
      await pause();
    }
  } finally {
    await browser.close();
  }
  save();
  return blocked ? 2 : 0;
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
  const todo = files.filter((x) => state[x.www]?.status === 'cached' && !(state[x.www].preview && !state[x.www].previewError));
  for (const x of todo) await fitImage(x.www);
  let done = 0;
  const problems = [];
  for (let i = 0; i < todo.length; i += 4) {
    await Promise.all(todo.slice(i, i + 4).map(async (x) => {
      const s = state[x.www];
      const file = s.fitted ? path.join(path.dirname(cacheFile(x.www)), s.fitted) : cacheFile(x.www);
      const ext = s.fitted ? 'jpg' : extOf(x.asset);
      const up = await curl(['-X', 'POST', '-F', `data=@"${file}";type=${TYPES[ext]}`, `https://admin.da.live/source/${ORG}/${SITE}${x.eds}`]);
      if (up.status < 200 || up.status >= 300) { s.uploadError = up.status; problems.push(`${x.www}: DA ${up.status}`); return; }
      s.uploaded = new Date().toISOString();
      delete s.uploadError;
      const pr = await curl(['-X', 'POST', `https://admin.hlx.page/preview/${ORG}/${SITE}/main${x.eds}`]);
      if (pr.status === 200) { s.preview = new Date().toISOString(); delete s.previewError; done += 1; } else { s.previewError = pr.status; problems.push(`${x.www}: preview ${pr.status} ${pr.body.replace(/\s+/g, ' ').slice(0, 120)}`); }
    }));
    save();
  }
  console.log(`austrian-dam upload: ${done}/${todo.length} uploaded and previewed, ${problems.length} problems`);
  problems.forEach((p) => console.log(`  ${p}`));
}

function report() {
  const files = readJson(LIST, []);
  const rows = files.map((x) => ({ ...x, ...(state[x.www] || { status: 'pending' }) }));
  fs.writeFileSync(path.join(W, 'runs/dam-report.json'), `${JSON.stringify(rows, null, 1)}\n`);
  const count = (f) => rows.filter(f).length;
  console.log(`austrian-dam: ${rows.length} files; in DA and previewed ${count((r) => r.preview && !r.previewError)}, for AEM ${count((r) => r.status === 'aem')}, other ${count((r) => !r.preview && r.status !== 'aem')}`);
  rows.filter((r) => !r.preview && r.status !== 'aem').forEach((r) => console.log(`  ${r.status} ${r.www}`));
}

const DA_CONTENT = `https://content.da.live/${ORG}/${SITE}`;
const WWW_DAM = /href="(?:https:\/\/www\.austrian\.com)?(\/content\/dam\/[^"#?]+)"/g;

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
 * The documents switched to the copies: links to www's DAM files that are in DA (previewed) or
 * for AEM become site-relative edsDamPath links; the posters in DA are taken from DA
 * (content.da.live); video links get their tracks recorded for AEM. Writes the changed documents
 * to content-sites/lh-austrian/runs/dam-switch-upload.txt (for da-upload.mjs).
 */
function switchLinks() {
  const files = readJson(LIST, []);
  const inDa = (www) => state[www]?.preview && !state[www].previewError;
  const ready = (www) => inDa(www) || state[www]?.status === 'aem';
  const posters = new Set(files.filter((x) => x.kind === 'poster').map((x) => x.www));
  const SNAP = path.join(root, 'tools/importer/bd-snapshots/www.austrian.com');
  const changed = [];
  walk(DOCS).filter((f) => f.endsWith('.plain.html')).forEach((f) => {
    const p = `/${path.relative(DOCS, f).replace(/\.plain\.html$/, '')}`;
    const before = fs.readFileSync(f, 'utf8');
    let doc = relativeDamLinks(before, ready);
    // a file www itself answers 404 for: the link stays www's own (as on Discover), not a copy
    files.filter((x) => /^www-4/.test(state[x.www]?.status || '')).forEach((x) => {
      doc = doc.split(`href="${x.eds}"`).join(`href="${HOST}${x.www.split('/').map((seg) => encodeURIComponent(seg)).join('/')}"`);
    });
    doc = doc.replace(/<img src="(?:https:\/\/www\.austrian\.com)?(\/content\/dam\/[^"?]+)"/g, (m, src) => {
      const www = decodeURIComponent(src);
      return posters.has(www) && inDa(www) ? `<img src="${DA_CONTENT}${edsDamPath(assetOf(www))}"` : m;
    });
    const snap = path.join(SNAP, `${p}.html`);
    if (fs.existsSync(snap)) doc = withTracks(doc, tracksOf(fs.readFileSync(snap, 'utf8')), p.split('/')[2], ready);
    if (doc === before) return;
    fs.writeFileSync(f, doc);
    changed.push(p);
  });
  fs.writeFileSync(path.join(W, 'runs/dam-switch-upload.txt'), `${changed.join('\n')}\n`);
  console.log(`austrian-dam switch: ${changed.length} documents changed (runs/dam-switch-upload.txt)`);
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  let code = 0;
  if (has('list')) list();
  if (has('download')) code = await download();
  if (has('upload')) await upload();
  if (has('switch')) switchLinks();
  if (has('report')) report();
  process.exit(code);
}
