/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, no-continue */
/* eslint-disable import/extensions */
/* eslint-disable import/no-extraneous-dependencies -- sharp is a dev tool dependency */
/**
 * Post-import step: makes imported documents fit the Edge Delivery preview limits.
 * Run after every import batch on the documents the batch wrote (or --all). Idempotent.
 *
 *  1. Documents with more than 200 images: long list sections move into fragment documents
 *     /{lhg/}{cc}/{ll}/fragments/{page}-{group}[-{n}] (tools/importer/split-fragments.mjs),
 *     the page links them (fragment auto-block). Fragments are processed like documents.
 *  2. Images: AEM renditions (…/x.jpg.transform/lh-dcep-transform-width-N/img.jpg, N ≤ 2560)
 *     stay remote. Every other www.lufthansa.com image (original DAM assets, PNG, WebP,
 *     /aircore/ images, SVG) is downloaded once into tools/source-export/media-cache/ (at most
 *     2 requests per second) and measured. SVGs over 40 KB are rasterized to PNG (2x their
 *     intrinsic size, at least 400 px wide, transparency kept); rasters wider than 2560 px or
 *     larger than 5 MB are resized to 2560 px wide (JPEG q82, or PNG when transparent). The
 *     result goes to content/media-da/{md5}.{ext} and the document references
 *     /media-da/{md5}.{ext} (tools/importer/da-upload.mjs uploads those to DA).
 *     Manifest: tools/importer/media-manifest.json (url → cache file, size, decision, local file).
 *  3. Checks: no document over 200 images, no remaining SVG over 40 KB, no measured image over
 *     20 MB or wider than 2560 px. Images on other hosts are listed as unchecked.
 *
 * Usage: node tools/importer/postprocess-media.mjs (--all | <path> ...) [--dry-run]
 *          [--no-download] [--retry-errors] [--json <report.json>]
 *   <path>: /de/en/flights, de/en/flights, content/de/en/flights.plain.html or a lufthansa URL
 *   --all: .plain.html documents except drafts/**, media-da/** and lhg/**
 *   --dry-run: documents and content/media-da stay untouched (cache and manifest are kept)
 * Prints one line per document; exit code 1 when a check fails.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { splitDocument, countImages, LIMIT } from './split-fragments.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CONTENT = path.join(root, 'content');
const CACHE = path.join(root, 'tools/source-export/media-cache');
const MEDIA_DIR = path.join(CONTENT, 'media-da');
const MANIFEST = path.join(root, 'tools/importer/media-manifest.json');
const SNAPSHOTS = path.join(root, 'tools/importer/bd-snapshots/www.lufthansa.com');
// /lhg/: the AirCore pages left the replica on 2026-10-25
const EXCLUDE = [/^\/drafts\//, /^\/lhg\//, /^\/media-da\//];

const MAX_WIDTH = 2560;
const MAX_TRANSFORM_WIDTH = 2560;
const SVG_MAX_BYTES = 40 * 1024;
const RASTER_MAX_BYTES = 5 * 1024 * 1024;
const HARD_MAX_BYTES = 20 * 1024 * 1024;
const MIN_REQUEST_GAP_MS = 500; // 2 requests per second
const STATIC_PATHS = /^\/(content\/dam|aircore|etc\/designs)\//;
const VERSION = 1; // bump to redo conversions

const argv = process.argv.slice(2);
const has = (n) => argv.includes(`--${n}`);
const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
const dryRun = has('dry-run');

const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : {};
// the cache and the manifest are written in --dry-run too: nothing is ever downloaded twice
const saveManifest = () => {
  const sorted = Object.fromEntries(Object.keys(manifest).sort().map((k) => [k, manifest[k]]));
  const tmp = `${MANIFEST}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, `${JSON.stringify(sorted, null, 1)}\n`);
  fs.renameSync(tmp, MANIFEST);
};

/* ------------------------------------------------------------------ documents ---------- */

function docPathOf(arg) {
  let p = arg.trim();
  if (!p) return null;
  p = p.replace(/^https?:\/\/[^/]+/, '');
  p = p.replace(/^.*?content\//, '/').replace(/\.plain\.html$|\.html$/, '').replace(/\/$/, '');
  return p.startsWith('/') ? p : `/${p}`;
}

function allDocs(dir = CONTENT, base = '') {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = `${base}/${e.name}`;
    if (e.isDirectory()) out.push(...allDocs(path.join(dir, e.name), rel));
    else if (e.name.endsWith('.plain.html')) out.push(rel.replace(/\.plain\.html$/, ''));
  }
  return out;
}

const docFile = (p) => path.join(CONTENT, `${p}.plain.html`);

function writeIfChanged(file, html) {
  if (fs.existsSync(file) && fs.readFileSync(file, 'utf8') === html) return false;
  if (dryRun) return true;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, html);
  fs.renameSync(tmp, file);
  return true;
}

/* ------------------------------------------------------------------ images -------------- */

const decodeAttr = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const md5 = (s) => crypto.createHash('md5').update(s).digest('hex');

/** Every image reference of a document: [{ raw, url }] (raw = attribute value as written). */
function imageRefs(html) {
  const refs = [];
  for (const m of html.matchAll(/<img\b[^>]*?\ssrc="([^"]*)"/gi)) refs.push({ raw: m[1], url: decodeAttr(m[1]) });
  for (const m of html.matchAll(/<source\b[^>]*?\ssrcset="([^"]*)"/gi)) {
    decodeAttr(m[1]).split(',').map((s) => s.trim().split(/\s+/)[0]).filter(Boolean)
      .forEach((url) => refs.push({ raw: null, url }));
  }
  return refs;
}

function classify(url) {
  if (url.startsWith('/media-da/')) return 'local';
  let u;
  try { u = new URL(url, 'https://www.lufthansa.com/'); } catch (e) { return 'other'; }
  if (u.hostname !== 'www.lufthansa.com') return 'other';
  const t = u.pathname.match(/\.transform\/[^/]*?width-(\d+)\//);
  if (t && Number(t[1]) <= MAX_TRANSFORM_WIDTH) return 'rendition';
  if (STATIC_PATHS.test(u.pathname)) return 'static';
  return 'other';
}

let lastRequest = 0;
async function download(url) {
  const wait = lastRequest + MIN_REQUEST_GAP_MS - Date.now();
  if (wait > 0) await new Promise((r) => { setTimeout(r, wait); });
  lastRequest = Date.now();
  const resp = await fetch(url, { headers: { Accept: 'image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.5' }, redirect: 'follow' });
  const buf = Buffer.from(await resp.arrayBuffer());
  return { status: resp.status, type: resp.headers.get('content-type') || '', buf };
}

const EXT = {
  jpeg: 'jpg', png: 'png', webp: 'webp', gif: 'gif', svg: 'svg', tiff: 'tif', avif: 'avif', heif: 'heic',
};

/** Downloads (once) and measures a static image; returns its manifest entry. */
async function measure(url) {
  const known = manifest[url];
  const fresh = known && known.cache && known.version === VERSION;
  if (fresh && fs.existsSync(path.join(root, known.cache))) return known;
  if (known && known.status && known.status !== 200 && !has('retry-errors')) return known;
  let buf;
  let type = '';
  let status = 200;
  const cached = known && known.cache && path.join(root, known.cache);
  if (cached && fs.existsSync(cached)) {
    buf = fs.readFileSync(cached);
  } else {
    if (has('no-download')) return { url, status: 0, error: 'not downloaded (--no-download)' };
    try {
      ({ status, type, buf } = await download(url));
    } catch (e) {
      return { url, status: 0, error: `download failed: ${e.message}` };
    }
    if (status !== 200) {
      manifest[url] = { status, error: `HTTP ${status}`, checkedAt: new Date().toISOString() };
      return manifest[url];
    }
  }
  let meta = {};
  try {
    meta = await sharp(buf, { limitInputPixels: false }).metadata();
  } catch (e) {
    meta = {};
  }
  const format = meta.format || (/svg/.test(type) ? 'svg' : '');
  const ext = EXT[format] || path.extname(new URL(url).pathname).slice(1).toLowerCase() || 'bin';
  const cacheRel = path.relative(root, path.join(CACHE, `${md5(url)}.${ext}`));
  if (!fs.existsSync(path.join(root, cacheRel))) {
    fs.mkdirSync(CACHE, { recursive: true });
    fs.writeFileSync(path.join(root, cacheRel), buf);
  }
  manifest[url] = {
    ...(manifest[url] || {}),
    status: 200,
    version: VERSION,
    cache: cacheRel,
    format,
    bytes: buf.length,
    width: meta.width || null,
    height: meta.height || null,
    hasAlpha: Boolean(meta.hasAlpha),
    checkedAt: new Date().toISOString(),
  };
  return manifest[url];
}

/**
 * The 2560 px AEM rendition of a DAM original ({asset}.transform/lh-dcep-transform-width-2560/
 * img.jpg) when it answers 200 with an image, else null. Checked once (manifest .rendition).
 */
async function renditionFallback(url) {
  const entry = manifest[url];
  if (!entry || !/\/content\/dam\//.test(url) || /\.transform\//.test(url)) return null;
  if (entry.rendition !== undefined && !has('retry-errors')) return entry.rendition;
  const candidate = `${url.replace(/[?#].*$/, '')}.transform/lh-dcep-transform-width-2560/img.jpg`;
  if (has('no-download')) return null;
  let rendition = null;
  try {
    const { status, type, buf } = await download(candidate);
    if (status === 200 && /^image\//.test(type) && buf.length < HARD_MAX_BYTES) rendition = candidate;
  } catch (e) {
    rendition = null;
  }
  entry.rendition = rendition;
  return rendition;
}

/** Why an image must be converted ('' when it may stay as it is). */
function problem(entry) {
  if (!entry || entry.status !== 200) return '';
  if (entry.format === 'svg') return entry.bytes > SVG_MAX_BYTES ? 'svg-over-40kb' : '';
  if ((entry.width || 0) > MAX_WIDTH) return 'wider-than-2560';
  if (entry.bytes > RASTER_MAX_BYTES) return 'over-5mb';
  return '';
}

async function isOpaque(buf) {
  try {
    const stats = await sharp(buf, { limitInputPixels: false }).stats();
    return stats.isOpaque;
  } catch (e) {
    return true;
  }
}

/** Converts a cached image; returns { local, bytes, width, height, format }. */
async function convert(entry) {
  const buf = fs.readFileSync(path.join(root, entry.cache));
  let out;
  let ext;
  if (entry.format === 'svg') {
    const intrinsic = entry.width || 200;
    const target = Math.min(MAX_WIDTH, Math.max(400, intrinsic * 2));
    const density = Math.min(2400, Math.max(1, (72 * target) / intrinsic));
    out = await sharp(buf, { density, limitInputPixels: false })
      .resize({ width: target, withoutEnlargement: false })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer();
    ext = 'png';
  } else {
    const base = () => sharp(buf, { limitInputPixels: false, animated: false }).rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true });
    const transparent = entry.hasAlpha && !(await isOpaque(buf));
    if (transparent) {
      out = await base().png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
      if (out.length > RASTER_MAX_BYTES) {
        out = await base().png({ compressionLevel: 9, palette: true, quality: 90 }).toBuffer();
      }
      ext = 'png';
    } else {
      out = await base().flatten({ background: '#ffffff' }).jpeg({ quality: 82, mozjpeg: true, progressive: true }).toBuffer();
      ext = 'jpg';
    }
  }
  const meta = await sharp(out).metadata();
  const name = `${md5(out)}.${ext}`;
  if (!dryRun) {
    fs.mkdirSync(MEDIA_DIR, { recursive: true });
    const file = path.join(MEDIA_DIR, name);
    if (!fs.existsSync(file)) fs.writeFileSync(file, out);
  }
  return {
    local: `/media-da/${name}`, bytes: out.length, width: meta.width, height: meta.height, format: meta.format,
  };
}

/** Measures a local /media-da/ file. */
async function measureLocal(url) {
  const file = path.join(CONTENT, url);
  if (!fs.existsSync(file)) return { status: 404, error: 'missing local file' };
  const buf = fs.readFileSync(file);
  let meta = {};
  try { meta = await sharp(buf).metadata(); } catch (e) { meta = {}; }
  return {
    status: 200,
    format: meta.format,
    bytes: buf.length,
    width: meta.width,
    height: meta.height,
    hasAlpha: Boolean(meta.hasAlpha),
    cache: path.relative(root, file),
  };
}

/** Processes the images of one document; returns its new HTML and statistics. */
async function processImages(html) {
  const stats = {
    rasterized: [],
    resized: [],
    replaced: [],
    unchecked: [],
    errors: [],
    violations: [],
    maxWidth: 0,
    maxBytes: 0,
  };
  let out = html;
  const refs = imageRefs(html);
  const seen = new Map();
  for (const ref of refs) {
    if (seen.has(ref.url)) continue;
    const kind = classify(ref.url);
    let entry = null;
    if (kind === 'rendition') { seen.set(ref.url, null); continue; }
    if (kind === 'other') {
      stats.unchecked.push(ref.url);
      seen.set(ref.url, null);
      continue;
    }
    if (kind === 'local') entry = await measureLocal(ref.url);
    else entry = await measure(ref.url);
    // a DAM original the live site never serves (403/404) while its AEM rendition exists:
    // the importer picked the original; the 2560 rendition stays remote instead
    if (kind === 'static' && entry && entry.status >= 400 && entry.status < 500) {
      const rendition = await renditionFallback(ref.url);
      if (rendition) {
        if (ref.raw !== null) out = out.split(`src="${ref.raw}"`).join(`src="${rendition}"`);
        stats.replaced.push({ url: ref.url, rendition, status: entry.status });
        seen.set(ref.url, null);
        continue;
      }
    }
    seen.set(ref.url, entry);
    if (!entry || entry.status !== 200) {
      stats.errors.push(`${ref.url}: ${(entry && entry.error) || 'not measured'}`);
      continue;
    }
    const why = problem(entry);
    let final = entry;
    if (why) {
      let converted = kind !== 'local' && entry.converted && entry.converted.version === VERSION
        && fs.existsSync(path.join(CONTENT, entry.converted.local)) ? entry.converted : null;
      if (!converted) {
        try {
          converted = { ...(await convert(entry)), version: VERSION, reason: why };
        } catch (e) {
          stats.errors.push(`${ref.url}: conversion failed: ${e.message}`);
          stats.violations.push(`${why}, not converted: ${ref.url}`);
          continue;
        }
        if (kind !== 'local') manifest[ref.url].converted = converted;
      }
      if (ref.raw !== null) out = out.split(`src="${ref.raw}"`).join(`src="${converted.local}"`);
      const record = {
        url: ref.url, local: converted.local, from: `${entry.width}px ${entry.bytes}B`, to: `${converted.width}px ${converted.bytes}B`,
      };
      if (entry.format === 'svg') stats.rasterized.push(record);
      else stats.resized.push(record);
      final = { ...converted, format: converted.format };
    }
    stats.maxWidth = Math.max(stats.maxWidth, final.width || 0);
    stats.maxBytes = Math.max(stats.maxBytes, final.bytes || 0);
    if (final.format === 'svg' && final.bytes > SVG_MAX_BYTES) stats.violations.push(`SVG over 40 KB: ${ref.url}`);
    if (final.bytes > HARD_MAX_BYTES) stats.violations.push(`over 20 MB: ${ref.url}`);
    if ((final.width || 0) > MAX_WIDTH && final.format !== 'svg') stats.violations.push(`wider than 2560: ${ref.url}`);
  }
  return { html: out, stats };
}

/* ------------------------------------------------------------------ main ---------------- */

const requested = has('all')
  ? allDocs().filter((p) => !EXCLUDE.some((re) => re.test(p)))
  : argv.filter((a, i) => !a.startsWith('--') && !['--json'].includes(argv[i - 1])).map(docPathOf).filter(Boolean);
if (!requested.length) {
  console.log('usage: node tools/importer/postprocess-media.mjs (--all | <path> ...) [--dry-run] [--no-download]');
  process.exit(2);
}

const report = [];
let failed = 0;
const queue = [...new Set(requested)];
const done = new Set();
while (queue.length) {
  const docPath = queue.shift();
  if (done.has(docPath)) continue;
  done.add(docPath);
  const file = docFile(docPath);
  if (!fs.existsSync(file)) {
    console.log(`${docPath}: no document`);
    continue;
  }
  const original = fs.readFileSync(file, 'utf8');
  const before = countImages(original);
  let html = original;
  const fragments = [];
  let splitError = '';
  if (before > LIMIT) {
    const rawFile = path.join(SNAPSHOTS, `${docPath}.html`);
    const rawHtml = fs.existsSync(rawFile) ? fs.readFileSync(rawFile, 'utf8') : '';
    const split = splitDocument(html, docPath, { rawHtml });
    splitError = split.error || '';
    if (!split.error) {
      html = split.html;
      split.fragments.forEach((f) => {
        const changed = writeIfChanged(docFile(f.path), f.html);
        fragments.push({ path: f.path, images: f.images, changed });
        if (!done.has(f.path)) queue.unshift(f.path);
      });
    }
  }
  const { html: processed, stats } = await processImages(html);
  const changed = writeIfChanged(file, processed);
  saveManifest();
  const after = countImages(processed);
  const violations = [...stats.violations];
  if (after > LIMIT) violations.push(`${after} images (limit ${LIMIT})${splitError ? `: ${splitError}` : ''}`);
  if (violations.length) failed += 1;
  const entry = {
    path: docPath,
    before,
    after,
    changed,
    fragments,
    rasterized: stats.rasterized,
    resized: stats.resized,
    replaced: stats.replaced,
    maxWidth: stats.maxWidth,
    maxBytes: stats.maxBytes,
    unchecked: stats.unchecked,
    errors: stats.errors,
    violations,
  };
  report.push(entry);
  const parts = [`${docPath}: images ${before} -> ${after}`];
  if (fragments.length) parts.push(`fragments ${fragments.map((f) => `${f.path.split('/').pop()}(${f.images})`).join(' ')}`);
  if (stats.rasterized.length) parts.push(`svg rasterized ${stats.rasterized.length}`);
  if (stats.resized.length) parts.push(`resized ${stats.resized.length}`);
  if (stats.replaced.length) parts.push(`broken original -> rendition ${stats.replaced.length}`);
  if (stats.unchecked.length) parts.push(`unchecked ${stats.unchecked.length}`);
  if (stats.errors.length) parts.push(`errors ${stats.errors.length}`);
  if (violations.length) parts.push(`FAIL ${violations.join('; ')}`);
  console.log(parts.join(' | '));
}

const json = opt('json');
if (json) fs.writeFileSync(path.resolve(root, json), `${JSON.stringify(report, null, 1)}\n`);
const totals = report.reduce((t, r) => ({
  docs: t.docs + 1,
  changed: t.changed + (r.changed ? 1 : 0),
  rasterized: t.rasterized + r.rasterized.length,
  resized: t.resized + r.resized.length,
  fragments: t.fragments + r.fragments.length,
}), {
  docs: 0, changed: 0, rasterized: 0, resized: 0, fragments: 0,
});
console.log(`postprocess-media: ${totals.docs} documents, ${totals.changed} changed, ${totals.rasterized} SVG rasterized, ${totals.resized} resized, ${totals.fragments} fragments, ${failed} failing${dryRun ? ' (dry run)' : ''}`);
process.exit(failed ? 1 : 0);
