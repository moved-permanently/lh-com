/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, no-continue, max-len, no-nested-ternary, import/extensions, import/prefer-default-export, import/no-extraneous-dependencies -- tooling */
/**
 * Lufthansa Cargo's files (lh-cargo): the images, documents and videos its imported pages use,
 * copied into lh-cargo's DA (as ita-dam.mjs does for lh-ita).
 *
 *   --list      the files of the given snapshots (images of the content, header and footer; the
 *               same-origin documents of doc-heads.tsv; the videos of video-heads.tsv) ->
 *               content-sites/lh-cargo/assets/files.json (www URL -> kind, local name, size)
 *   --download  www.lufthansa-cargo.com's files through ONE warm Bright Data session (the
 *               project is bot-protected: .migration/project.json): /en/home first, then each
 *               file fetched inside that page (same origin, one GET), one request every 5-10 s,
 *               one at a time. Stops at the first 403, 429 or challenge and refuses to start
 *               again for 30 minutes (state.blockedAt). static.lufthansa-cargo.com's videos
 *               (Azure, no challenge) with curl at the same pace. Files Edge Delivery can't
 *               hold (mp4 over 36 MB, .vtt, PDFs over 20 MB) are never downloaded: their pages
 *               link the file on the source.
 *   --upload    documents and videos to lh-cargo's DA under their Edge Delivery names
 *               (/documents/<name>.<ext>) and previewed (never published); images are sent
 *               by da-upload.mjs with the pages that use them (/media-da/cargo/...).
 * Cache: content-sites/lh-cargo/assets/cache/<sha1 of the URL>; state:
 * content-sites/lh-cargo/assets/state.json. Images land in content-sites/lh-cargo/content/media-da/cargo/
 * (copied there by cargo-import.mjs when a page uses them).
 *
 * Usage: node tools/importer/cargo-assets.mjs --list [--snapshots dir] | --download [--max 400] | --upload
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const has = (n) => argv.includes(`--${n}`);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
export const HOST = 'https://www.lufthansa-cargo.com';
export const STATIC_HOST = 'https://static.lufthansa-cargo.com';
const ORG = 'moved-permanently';
const SITE = 'lh-cargo';
const W = path.join(root, 'content-sites/lh-cargo');
const DELIVERY = path.join(W, 'delivery');
const OUT = path.join(W, 'assets');
const LIST = path.join(OUT, 'files.json');
const STATE = path.join(OUT, 'state.json');
const CACHE = path.join(OUT, 'cache');
const MB = 1024 * 1024;
/** What Edge Delivery holds; larger files stay links to the source. */
export const LIMITS = { pdf: 20 * MB, mp4: 36 * MB, image: 20 * MB };
const CHALLENGE = /just a moment|checking your browser|attention required|verifying you are human|performing security verification|^blocked$/i;
const PAUSE_AFTER_BLOCK = 30 * 60 * 1000;
const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });
const pause = () => sleep(5000 + Math.floor(Math.random() * 5000));
const sha1 = (s) => crypto.createHash('sha1').update(s).digest('hex');

const EXT = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg', 'application/pdf': 'pdf', 'video/mp4': 'mp4', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
};

/** A www file URL as the key: absolute, without the cache-busting query (?t=, ?download=true). */
export function fileKey(src) {
  // template leftovers of the snapshots ("' + news.image + '", "+image+") are no URLs; '+' alone is a space
  if (!src || /^(data:|#|javascript:)/i.test(src) || /['{}]|\s\+|\+\s|\+image\+/.test(src)) return null;
  let u;
  try { u = new URL(src.replace(/&amp;/g, '&'), `${HOST}/`); } catch (e) { return null; }
  if (u.origin === STATIC_HOST && /\.mp4$/i.test(u.pathname)) return `${u.origin}${u.pathname}`;
  if (!/^(www\.)?lufthansa-cargo\.com$/.test(u.hostname)) return null;
  if (!/^\/(documents|o\/eportal-theme|image)\//.test(u.pathname)) return null;
  return `${HOST}${u.pathname}`;
}

/** The readable file name of a www file URL ('Lufthansa+Cargo+Guide.pdf' -> 'lufthansa-cargo-guide'). */
export function baseName(key) {
  const parts = new URL(key).pathname.split('/').filter(Boolean).map((p) => decodeURIComponent(p.replace(/\+/g, ' ')));
  // /documents/<group>/<folder>/<title>/<uuid> and /documents/d/guest/<name>
  const named = parts.filter((p) => !/^[0-9a-f]{8}-[0-9a-f-]{27,}$/i.test(p) && !/^\d+$/.test(p) && !['documents', 'd', 'guest'].includes(p));
  const name = (named.pop() || parts.pop() || 'file').replace(/\.[a-z0-9]{2,4}$/i, '');
  return name.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/, '') || 'file';
}

/** Edge Delivery name of a downloaded file: images /media-da/cargo/<name>-<hash>.<ext>, the rest /documents/<name>.<ext>. */
export function edsName(key, kind, type) {
  const named = new URL(key).pathname.split('/').map((p) => (p.match(/\.([a-z0-9]{2,4})$/i) || [])[1]).filter(Boolean).pop();
  const ext = EXT[(type || '').split(';')[0]] || named?.toLowerCase() || 'bin';
  const name = baseName(key);
  if (kind === 'image') return `/media-da/cargo/${name}-${sha1(key).slice(0, 8)}.${ext}`;
  return `/documents/${name}-${sha1(key).slice(0, 6)}.${ext}`;
}

const readJson = (f, d) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d);
const writeJson = (f, v) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, `${JSON.stringify(v, null, 1)}\n`); };
const tsv = (f) => {
  if (!fs.existsSync(f)) return [];
  const [head, ...rows] = fs.readFileSync(f, 'utf8').split(/\r?\n/).filter(Boolean).map((l) => l.split('\t'));
  return rows.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] || ''])));
};

async function list() {
  const { parseHTML } = await import('linkedom');
  const snapDir = path.resolve(root, opt('snapshots', path.join(DELIVERY, 'snapshots/www.lufthansa-cargo.com')));
  const files = readJson(LIST, {});
  const add = (key, kind, page, extra = {}) => {
    if (!key) return;
    const f = files[key] || { kind, pages: [] };
    if (!f.pages.includes(page)) f.pages.push(page);
    files[key] = { ...f, ...extra };
  };
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
  for (const f of walk(snapDir).filter((x) => x.endsWith('.html'))) {
    const page = `/${path.relative(snapDir, f).replace(/\.html$/, '')}`;
    const { document } = parseHTML(fs.readFileSync(f, 'utf8'));
    const areas = ['#content.pagebody', '#banner', '#footer'].map((s) => document.querySelector(s)).filter(Boolean);
    areas.forEach((area) => {
      area.querySelectorAll('img[src]').forEach((img) => add(fileKey(img.getAttribute('src')), 'image', page));
      area.querySelectorAll('[data-desktop]').forEach((n) => add(fileKey(n.getAttribute('data-desktop')), 'image', page));
      area.querySelectorAll('[style*="background-image"]').forEach((n) => {
        const m = (n.getAttribute('style') || '').match(/url\((?:&quot;|["'])?([^"')&]+)/);
        if (m) add(fileKey(m[1]), 'image', page);
      });
      area.querySelectorAll('video[poster]').forEach((v) => add(fileKey(v.getAttribute('poster')), 'image', page));
    });
  }
  // documents (HEAD results of the delivery: size and type) and videos
  tsv(path.join(DELIVERY, 'doc-heads.tsv')).forEach((r) => {
    const key = fileKey(r.path);
    if (!key || files[key]?.kind === 'image') return;
    if (r.http !== '200') { files[key] = { ...(files[key] || { pages: [] }), kind: 'document', broken: `HTTP ${r.http} on www` }; return; }
    const type = (r.content_type || '').split(';')[0];
    files[key] = {
      ...(files[key] || { pages: [] }), kind: /^image\//.test(type) ? 'image' : 'document', type, bytes: Number(r.content_length) || undefined, www: r.path,
    };
  });
  tsv(path.join(DELIVERY, 'video-heads.tsv')).forEach((r) => {
    const key = fileKey(r.url);
    if (key) {
      files[key] = {
        ...(files[key] || { pages: [] }), kind: 'video', type: r.content_type, bytes: Number(r.content_length) || undefined,
      };
    }
  });
  Object.entries(files).forEach(([key, f]) => {
    const limit = f.kind === 'video' ? LIMITS.mp4 : (f.kind === 'image' ? LIMITS.image : LIMITS.pdf);
    if (f.bytes && f.bytes > limit) f.linkSource = `${(f.bytes / MB).toFixed(1)} MB: over Edge Delivery's ${limit / MB} MB, linked on the source`;
    // spreadsheets: Edge Delivery's preview refuses them as files (415), they stay on the source
    else if (/spreadsheet|excel/.test(f.type || '')) f.linkSource = 'spreadsheet: Edge Delivery serves no .xlsx files, linked on the source';
    else delete f.linkSource;
    f.eds = f.linkSource || f.broken ? null : edsName(key, f.kind, f.type);
  });
  writeJson(LIST, files);
  const kinds = {};
  Object.values(files).forEach((f) => { kinds[f.kind] = (kinds[f.kind] || 0) + 1; });
  console.log(`${Object.keys(files).length} files`, kinds, `link to source: ${Object.values(files).filter((f) => f.linkSource).length}`);
}

async function download() {
  const files = readJson(LIST, null);
  if (!files) throw new Error('run --list first');
  const state = readJson(STATE, { done: {} });
  if (state.blockedAt && Date.now() - Date.parse(state.blockedAt) < PAUSE_AFTER_BLOCK) {
    console.error(`blocked at ${state.blockedAt}: no requests before ${new Date(Date.parse(state.blockedAt) + PAUSE_AFTER_BLOCK).toISOString()}`);
    process.exit(2);
  }
  const project = readJson(path.join(root, '.migration/project.json'), {});
  if (project.botProtected !== true) throw new Error('.migration/project.json: botProtected must be true before any request to the source');
  fs.mkdirSync(CACHE, { recursive: true });
  const max = Number(opt('max', 400));
  const todo = Object.entries(files).filter(([k, f]) => f.eds && !state.done[k]);
  const www = todo.filter(([k]) => k.startsWith(HOST)).slice(0, max);
  const vids = todo.filter(([k]) => k.startsWith(STATIC_HOST));
  console.log(`to download: ${www.length} from www, ${vids.length} videos from static`);
  const record = (key, r) => { state.done[key] = r; writeJson(STATE, state); };
  let blocked = false;
  if (www.length) {
    const EXCAT = process.env.EXCAT_ROOT || '/home/node/.excat-marketplaces/excat-marketplace';
    const { connectBrowser } = await import(path.join(EXCAT, 'excat/skills/excat-scrape-webpage/scripts/browser-source.js'));
    const browser = await connectBrowser('bd');
    try {
      const page = await browser.newPage();
      const open = async () => {
        let status = null;
        page.once('response', (r) => { status = r.status(); });
        try { await page.goto(`${HOST}/en/home`, { timeout: 90000, waitUntil: 'domcontentloaded' }); } catch (e) { console.error(`navigation interrupted (${e.message.split('\n')[0]})`); }
        const title = await page.title().catch(() => '');
        if (CHALLENGE.test(title) || status === 403 || status === 429) { console.error(`BLOCKED at /en/home (${status} ${title})`); return false; }
        console.log(`anchor /en/home ${status} "${title}"`);
        return true;
      };
      if (!await open()) blocked = true;
      for (const [key, f] of www) {
        if (blocked) break;
        await pause();
        const got = await page.evaluate(async (u) => {
          const r = await fetch(u, { credentials: 'include' });
          const b = new Uint8Array(await r.arrayBuffer());
          let s = '';
          for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
          return { status: r.status, type: r.headers.get('content-type') || '', b64: btoa(s) };
        }, f.www ? `${HOST}${f.www}` : key).catch((e) => ({ status: 0, error: e.message.split('\n')[0] }));
        const buf = Buffer.from(got.b64 || '', 'base64');
        const htmlBody = /text\/html/.test(got.type) ? buf.toString('utf8', 0, 4000) : '';
        if (got.status === 403 || got.status === 429 || (htmlBody && CHALLENGE.test((htmlBody.match(/<title>([^<]*)/i) || [])[1] || ''))) {
          blocked = true;
          state.blockedAt = new Date().toISOString();
          writeJson(STATE, state);
          console.error(`BLOCKED at ${key} (${got.status})`);
          break;
        }
        if (got.status === 0) { console.error(`${key}: ${got.error}`); if (!await open()) { blocked = true; } continue; }
        if (got.status !== 200 || htmlBody) { record(key, { status: got.status, type: got.type }); console.log(`${got.status} ${got.type} ${key}`); continue; }
        fs.writeFileSync(path.join(CACHE, sha1(key)), buf);
        record(key, {
          status: 200, type: got.type, bytes: buf.length, at: new Date().toISOString(),
        });
        console.log(`200 ${buf.length}B ${got.type} ${key}`);
      }
    } finally {
      await browser.close().catch(() => {});
    }
  }
  for (const [key] of blocked ? [] : vids) {
    await pause();
    const out = path.join(CACHE, sha1(key));
    try {
      execFileSync('curl', ['-sS', '-f', '-o', out, key], { stdio: 'inherit' });
      record(key, {
        status: 200, type: 'video/mp4', bytes: fs.statSync(out).size, at: new Date().toISOString(),
      });
      console.log(`200 ${fs.statSync(out).size}B ${key}`);
    } catch (e) { console.error(`${key}: ${e.message.split('\n')[0]}`); }
  }
  // images into the document tree, where da-upload.mjs finds them
  let placed = 0;
  Object.entries(files).forEach(([key, f]) => {
    const d = state.done[key];
    if (!d || d.status !== 200 || f.kind !== 'image' || !f.eds) return;
    const eds = edsName(key, 'image', d.type);
    f.eds = eds;
    const dest = path.join(W, 'content', eds);
    if (fs.existsSync(dest)) return;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(path.join(CACHE, sha1(key)), dest);
    placed += 1;
  });
  writeJson(LIST, files);
  console.log(`images placed: ${placed}${blocked ? ' (stopped: blocked, wait 30 minutes)' : ''}`);
  process.exit(blocked ? 2 : 0);
}

function upload() {
  const files = readJson(LIST, {});
  const state = readJson(STATE, { done: {} });
  state.uploaded ||= {};
  for (const [key, f] of Object.entries(files)) {
    const d = state.done[key];
    if (f.kind === 'image' || !f.eds || !d || d.status !== 200 || state.uploaded[key]?.preview) continue;
    const local = path.join(CACHE, sha1(key));
    const type = (d.type || f.type || 'application/octet-stream').split(';')[0];
    const up = execFileSync('curl', ['-sS', '-o', '/dev/null', '-w', '%{http_code}', '-X', 'POST', '-F', `data=@${local};type=${type}`, `https://admin.da.live/source/${ORG}/${SITE}${f.eds}`]).toString();
    if (!/^2/.test(up)) { console.error(`${f.eds}: DA ${up}`); if (/^40[13]$/.test(up)) break; continue; }
    const pv = execFileSync('curl', ['-sS', '-o', '/dev/null', '-w', '%{http_code}', '-X', 'POST', `https://admin.hlx.page/preview/${ORG}/${SITE}/main${f.eds}`]).toString();
    state.uploaded[key] = {
      eds: f.eds, da: up, preview: /^2/.test(pv) ? new Date().toISOString() : null, previewStatus: pv,
    };
    writeJson(STATE, state);
    console.log(`${f.eds}: DA ${up}, preview ${pv}`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (has('list')) await list();
  else if (has('download')) await download();
  else if (has('upload')) upload();
  else console.log('usage: --list | --download | --upload');
}
