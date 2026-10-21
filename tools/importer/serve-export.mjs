/* eslint-disable no-console */
/**
 * Serves a source export (tools/importer/SOURCE-EXPORT.md) under the live paths, so the
 * import and the parity harness can run against http://localhost:4100/de/en/homepage
 * exactly as against https://www.lufthansa.com/de/en/homepage.
 * Paths not in the export (images, clientlibs, fonts) redirect to www.lufthansa.com,
 * which serves static files to any client.
 *
 * Usage: node tools/importer/serve-export.mjs [--src tools/source-export] [--port 4100]
 *        node tools/importer/serve-export.mjs --unpack   expand bundles/*.ndjson into pages/
 */
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const opt = (name, def) => (argv.includes(`--${name}`) ? argv[argv.indexOf(`--${name}`) + 1] : def);
const src = path.resolve(root, opt('src', 'tools/source-export'));
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
  const candidates = clean.startsWith('/sitemap/') || clean.startsWith('/aircore/sitemaps/')
    ? [path.join(src, 'sitemaps', path.basename(clean))]
    : [path.join(src, 'pages', clean), path.join(src, 'pages', `${clean.replace(/\.html$/, '')}.html`)];
  return candidates.find((f) => fs.existsSync(f) && fs.statSync(f).isFile()) || null;
}

/** Expands bundles written by export-in-browser.js into pages/ and sitemaps/. */
function unpack() {
  const dir = path.join(src, 'bundles');
  const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.ndjson')) : [];
  let written = 0;
  files.forEach((f) => fs.readFileSync(path.join(dir, f), 'utf8').split('\n').filter(Boolean).forEach((line) => {
    const r = JSON.parse(line);
    if (r.status !== 200) return;
    const { pathname } = new URL(r.url);
    const isSitemap = r.kind === 'sitemap';
    let rel = isSitemap ? path.join('sitemaps', path.basename(pathname)) : path.join('pages', pathname);
    if (!isSitemap && !/\.(json|xml)$/.test(pathname)) rel = `${rel.replace(/\/$/, '')}.html`;
    const target = path.join(src, rel);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, r.base64 ? Buffer.from(r.text, 'base64') : r.text);
    written += 1;
  }));
  console.log(`unpacked ${written} files from ${files.length} bundles into ${path.relative(root, src)}`);
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
  }).listen(port, () => console.log(`serving ${path.relative(root, src)} on http://localhost:${port}`));
}
