/* eslint-disable no-console */
/**
 * Serves a source export (tools/importer/SOURCE-EXPORT.md) under the live paths, so the
 * import and the parity harness can run against http://localhost:4100/de/en/homepage
 * exactly as against https://www.lufthansa.com/de/en/homepage.
 * Paths not in the export (images, clientlibs, fonts) redirect to www.lufthansa.com,
 * which serves static files to any client.
 *
 * Usage: node tools/importer/serve-export.mjs [--src tools/source-export] [--out <dir>] [--port 4100]
 *        node tools/importer/serve-export.mjs --unpack [--src ...] [--out <dir>]
 *          expand bundles/*.ndjson and bundles/*.ndjson.gz into <out>/pages/ and <out>/sitemaps/
 * --out (default: --src) keeps the unpacked files outside a tracked export, for example
 *   --src tools/source-export/articles --out tools/source-export/articles-unpacked (ignored by git);
 *   <out>/www.lufthansa.com links to pages/, so import-batch.mjs --export <out> reads the pages
 *   as snapshots.
 */
import fs from 'node:fs';
import zlib from 'node:zlib';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const opt = (name, def) => (argv.includes(`--${name}`) ? argv[argv.indexOf(`--${name}`) + 1] : def);
const src = path.resolve(root, opt('src', 'tools/source-export'));
const out = path.resolve(root, opt('out', path.relative(root, src)));
const port = Number(opt('port', 4100));
const LIVE = 'https://www.lufthansa.com';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.gz': 'application/gzip',
};

/** Maps a URL path to its file in the export; null when it is not exported. */
function fileFor(urlPath) {
  const clean = decodeURIComponent(urlPath).replace(/\/+$/, '') || '/';
  if (clean.includes('..')) return null;
  const candidates = clean.startsWith('/sitemap/')
    ? [path.join(out, 'sitemaps', path.basename(clean))]
    : [path.join(out, 'pages', clean), path.join(out, 'pages', `${clean.replace(/\.html$/, '')}.html`)];
  return candidates.find((f) => fs.existsSync(f) && fs.statSync(f).isFile()) || null;
}

/** Expands bundles written by export-in-browser.js into pages/ and sitemaps/. */
function unpack() {
  const dir = path.join(src, 'bundles');
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => /\.ndjson(\.gz)?$/.test(f)).sort() : [];
  const read = (f) => {
    const buf = fs.readFileSync(path.join(dir, f));
    return (f.endsWith('.gz') ? zlib.gunzipSync(buf) : buf).toString('utf8');
  };
  let written = 0;
  // later bundles win (a page fetched a second time after a failed fetch)
  files.forEach((f) => read(f).split('\n').filter(Boolean).forEach((line) => {
    const r = JSON.parse(line);
    if (r.status !== 200) return;
    const { pathname } = new URL(r.url);
    const isSitemap = r.kind === 'sitemap';
    let rel = isSitemap ? path.join('sitemaps', path.basename(pathname)) : path.join('pages', pathname);
    if (!isSitemap && !/\.(json|xml)$/.test(pathname)) rel = `${rel.replace(/\/$/, '')}.html`;
    const target = path.join(out, rel);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, r.base64 ? Buffer.from(r.text, 'base64') : r.text);
    written += 1;
  }));
  const link = path.join(out, new URL(LIVE).hostname);
  if (!fs.existsSync(link) && fs.existsSync(path.join(out, 'pages'))) fs.symlinkSync('pages', link);
  console.log(`unpacked ${written} files from ${files.length} bundles into ${path.relative(root, out)}`);
}

if (argv.includes('--unpack')) {
  unpack();
} else {
  http.createServer((req, res) => {
    const { pathname, search } = new URL(req.url, `http://localhost:${port}`);
    const file = fileFor(pathname);
    if (file) {
      res.writeHead(200, { 'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream' });
      fs.createReadStream(file).pipe(res);
    } else {
      res.writeHead(302, { Location: `${LIVE}${pathname}${search}` });
      res.end();
    }
  }).listen(port, () => console.log(`serving ${path.relative(root, out)} on http://localhost:${port}`));
}
