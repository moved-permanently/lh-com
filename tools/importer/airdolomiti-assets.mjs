/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, no-continue, max-len, import/extensions, import/no-extraneous-dependencies -- tooling */
/**
 * Air Dolomiti's files (lh-airdolomiti): the images and documents its imported pages use
 * (content-sites/lh-airdolomiti/assets/files.json, written by airdolomiti-import.mjs and
 * airdolomiti-nav.mjs), copied into lh-airdolomiti's DA.
 *
 *   --download  per source host (cms.airdolomiti.it, www.airdolomiti.it) through ONE Bright Data
 *               session (.migration/project.json botProtected): the host's first file opened
 *               (its answer kept), then the others fetched inside that page (same origin, one GET
 *               each), one every 5-10 s, one at a time. Stops at the first 403, 429 or challenge
 *               (30 minutes' stop shared with airdolomiti-capture.mjs). Files Edge Delivery can't
 *               hold (images or PDFs over 20 MB, mp4 over 36 MB, other types) stay links to the
 *               source; SVG images become PNGs.
 *   --upload    documents to lh-airdolomiti's DA under /documents/<name>.<ext>, previewed (never
 *               published); images go with the pages that use them (da-upload.mjs, /media-da/airdolomiti/).
 * Cache content-sites/lh-airdolomiti/assets/cache/<sha1 of the URL>, state assets/state.json.
 *
 * Usage: node tools/importer/airdolomiti-assets.mjs --download | --upload
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { blockedUntil, recordBlock, connectSource } from './airdolomiti-capture.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const has = (n) => argv.includes(`--${n}`);
const W = path.join(root, 'content-sites/lh-airdolomiti');
const A = path.join(W, 'assets');
const LIST = path.join(A, 'files.json');
const STATE = path.join(A, 'state.json');
const CACHE = path.join(A, 'cache');
const MB = 1024 * 1024;
const CHALLENGE = /just a moment|checking your browser|attention required|verifying you are human|performing security verification|access denied|^blocked$/i;
const sleep = (ms) => new Promise((r) => { setTimeout(r, ms); });
const pause = () => sleep(5000 + Math.floor(Math.random() * 5000));
const sha1 = (s) => crypto.createHash('sha1').update(s).digest('hex');
const readJson = (f, d) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d);
const writeJson = (f, v) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, `${JSON.stringify(v, null, 1)}\n`); };
const EXT = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg', 'application/pdf': 'pdf', 'video/mp4': 'mp4',
};
const SERVED = /^(image\/(jpeg|png|webp|gif|svg\+xml)|application\/pdf|video\/mp4)$/;

/** A readable name of a file URL ('/2025/06/Monaco-Banner-D.jpg' -> 'monaco-banner-d'). */
const baseName = (url) => decodeURIComponent(new URL(url).pathname.split('/').pop() || 'file').replace(/\.[a-z0-9]{2,4}$/i, '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 60)
  .replace(/-+$/, '') || 'file';

/** The Edge Delivery name of a downloaded file, or why it stays a link to the source. */
function settle(key, f, d) {
  const type = (d.type || '').split(';')[0];
  const limit = type === 'video/mp4' ? 36 * MB : 20 * MB;
  delete f.linkSource;
  if (!SERVED.test(type)) f.linkSource = `${type || 'unknown type'}: Edge Delivery serves no such file, linked on the source`;
  else if (d.bytes > limit) f.linkSource = `${(d.bytes / MB).toFixed(1)} MB: over Edge Delivery's ${limit / MB} MB, linked on the source`;
  f.type = type;
  f.bytes = d.bytes;
  if (f.linkSource) { f.eds = null; return; }
  const image = /^image\//.test(type);
  const svg = type === 'image/svg+xml';
  f.kind = image ? 'image' : 'document';
  f.eds = image
    ? `/media-da/airdolomiti/${baseName(key)}-${sha1(key).slice(0, 8)}.${svg ? 'png' : EXT[type]}`
    : `/documents/${baseName(key)}-${sha1(key).slice(0, 6)}.${EXT[type]}`;
}

async function download() {
  const until = blockedUntil();
  if (until) { console.error(`blocked: no requests to the source before ${until.toISOString()}`); process.exit(2); }
  if (readJson(path.join(root, '.migration/project.json'), {}).botProtected !== true) throw new Error('.migration/project.json: botProtected must be true before any request to the source');
  const files = readJson(LIST, {});
  const state = readJson(STATE, { done: {} });
  fs.mkdirSync(CACHE, { recursive: true });
  const todo = Object.keys(files).filter((k) => !state.done[k] && /^https:\/\/(cms|www)\.airdolomiti\.(it|eu|de)\//.test(k));
  const byHost = {};
  todo.forEach((k) => { (byHost[new URL(k).origin] ||= []).push(k); });
  console.log(`to download: ${todo.length} (${Object.entries(byHost).map(([h, l]) => `${h} ${l.length}`).join(', ')})`);
  if (!todo.length) return 0;
  let browser = await connectSource();
  let exit = 0;
  const record = (key, d) => {
    state.done[key] = d;
    if (d.status === 200) settle(key, files[key], d);
    writeJson(STATE, state);
  };
  try {
    for (const keys of Object.values(byHost)) {
      if (exit) break;
      let page = await browser.newPage();
      // the host's first file opened: its answer is the first download, and the page the origin
      const open = async (key) => {
        let resp = null;
        try { resp = await page.goto(key, { timeout: 60000, waitUntil: 'load' }); } catch (e) { return { error: e.message.split('\n')[0] }; }
        const title = await page.title().catch(() => '');
        const status = resp ? resp.status() : 0;
        if (CHALLENGE.test(title) || status === 403 || status === 429) return { blocked: `${status} ${title}` };
        const buf = resp ? await resp.body().catch(() => null) : null;
        return { status, type: resp ? resp.headers()['content-type'] || '' : '', buf };
      };
      let first = await open(keys[0]);
      if (first.error && /closed|disconnected/i.test(first.error)) {
        await browser.close().catch(() => {});
        browser = await connectSource();
        page = await browser.newPage();
        first = await open(keys[0]);
      }
      if (first.blocked) { recordBlock(`${keys[0]} ${first.blocked}`); console.error(`BLOCKED at ${keys[0]} (${first.blocked})`); exit = 2; break; }
      if (first.buf && first.status === 200) {
        fs.writeFileSync(path.join(CACHE, sha1(keys[0])), first.buf);
        record(keys[0], {
          status: 200, type: first.type, bytes: first.buf.length, at: new Date().toISOString(),
        });
      } else record(keys[0], { status: first.status || 0, type: first.type || '', error: first.error });
      console.log(`${first.status} ${first.buf ? first.buf.length : 0}B ${keys[0]} (opened)`);
      for (const key of keys.slice(1)) {
        await pause();
        const got = await page.evaluate(async (u) => {
          const r = await fetch(u);
          const b = new Uint8Array(await r.arrayBuffer());
          let s = '';
          for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
          return { status: r.status, type: r.headers.get('content-type') || '', b64: btoa(s) };
        }, key).catch((e) => ({ status: 0, error: e.message.split('\n')[0] }));
        const buf = Buffer.from(got.b64 || '', 'base64');
        const htmlBody = /text\/html/.test(got.type) ? buf.toString('utf8', 0, 3000) : '';
        if (got.status === 429 || (got.status === 403 && (!htmlBody || CHALLENGE.test(htmlBody))) || (htmlBody && CHALLENGE.test((htmlBody.match(/<title>([^<]*)/i) || [])[1] || ''))) {
          recordBlock(`${key} ${got.status} ${htmlBody.replace(/\s+/g, ' ').slice(0, 160)}`);
          console.error(`BLOCKED at ${key} (${got.status})`);
          exit = 2;
          break;
        }
        if (got.status === 0) { console.error(`${key}: ${got.error}`); continue; }
        if (got.status === 200 && !htmlBody) {
          fs.writeFileSync(path.join(CACHE, sha1(key)), buf);
          record(key, {
            status: 200, type: got.type, bytes: buf.length, at: new Date().toISOString(),
          });
        } else record(key, { status: got.status, type: got.type });
        console.log(`${got.status} ${buf.length}B ${got.type.split(';')[0]} ${key}`);
      }
      await page.close().catch(() => {});
    }
  } finally {
    await browser.close().catch(() => {});
  }
  // SVG images as PNGs next to them in the cache (Edge Delivery's documents hold raster images)
  const sharp = (await import('sharp')).default;
  for (const [key, f] of Object.entries(files)) {
    const d = state.done[key];
    if (!d || d.status !== 200 || f.type !== 'image/svg+xml') continue;
    const src = path.join(CACHE, sha1(key));
    const tmp = `${src}.png`;
    if (fs.existsSync(tmp)) continue;
    await sharp(fs.readFileSync(src), { density: 192 }).png().toFile(tmp).catch((e) => console.error(`${key}: ${e.message}`));
    if (fs.existsSync(tmp)) fs.copyFileSync(tmp, src);
  }
  writeJson(LIST, files);
  return exit;
}

function upload() {
  const files = readJson(LIST, {});
  const state = readJson(STATE, { done: {} });
  state.uploaded ||= {};
  for (const [key, f] of Object.entries(files)) {
    const d = state.done[key];
    if (f.kind === 'image' || !f.eds || !d || d.status !== 200 || state.uploaded[key]?.preview || state.uploaded[key]?.refused) continue;
    const local = path.join(CACHE, sha1(key));
    const up = execFileSync('curl', ['-sS', '-o', '/dev/null', '-w', '%{http_code}', '-X', 'POST', '-F', `data=@${local};type=${f.type}`, `https://admin.da.live/source/moved-permanently/lh-airdolomiti${f.eds}`]).toString();
    if (!/^2/.test(up)) { console.error(`${f.eds}: DA ${up}`); if (/^40[13]$/.test(up)) break; continue; }
    const out = execFileSync('curl', ['-sS', '-D', '-', '-o', '/dev/null', '-w', '\n%{http_code}', '-X', 'POST', `https://admin.hlx.page/preview/moved-permanently/lh-airdolomiti/main${f.eds}`]).toString();
    const pv = out.trim().split('\n').pop();
    const why = (out.match(/^x-error:\s*(.*)$/mi) || [])[1]?.trim() || '';
    state.uploaded[key] = {
      eds: f.eds, da: up, preview: /^2/.test(pv) ? new Date().toISOString() : null, previewStatus: pv, ...(why ? { previewError: why } : {}),
    };
    if (/^4(09|15)$/.test(pv)) { state.uploaded[key].refused = true; f.linkSource = `Edge Delivery's preview refused it (${pv} ${why})`.trim(); f.eds = null; }
    writeJson(STATE, state);
    console.log(`${f.eds || key}: DA ${up}, preview ${pv}${why ? ` (${why})` : ''}`);
  }
  writeJson(LIST, files);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (has('download')) process.exit(await download());
  else if (has('upload')) upload();
  else console.log('usage: --download | --upload');
}
