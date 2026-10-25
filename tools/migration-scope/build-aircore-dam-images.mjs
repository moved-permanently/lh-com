#!/usr/bin/env node
// Lists every /content/dam/ URL that the imported /lhg/ (AirCore) pages load, from their live
// captures: the rendered DOM snapshots (img src and srcset, inline styles and CSS backgrounds,
// preloads, meta og:image) and the recorded heads (JSON-LD). Writes aircore-dam-images.csv:
// path, asset (the part before .transform/), width, format, pages.
// node tools/migration-scope/build-aircore-dam-images.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SNAPSHOTS = path.join(ROOT, 'tools/importer/bd-snapshots/www.lufthansa.com');
const HEADS = path.join(ROOT, 'tools/source-export/heads');
const OUT = path.join(ROOT, 'tools/migration-scope/aircore-dam-images.csv');

// a URL ends at a quote, whitespace, a closing parenthesis, an entity, a comma (srcset)
// or a backslash
const DAM = /\/content\/dam\/[^"'\s)&;<>,\\]+/g;

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(dir, e.name);
  return e.isDirectory() ? walk(p) : [p];
});

const byPath = new Map();
const add = (url, page) => {
  if (!byPath.has(url)) byPath.set(url, new Set());
  byPath.get(url).add(page);
};

const sources = [
  ...walk(path.join(SNAPSHOTS, 'lhg')).filter((f) => f.endsWith('.html'))
    .map((f) => [f, f.slice(SNAPSHOTS.length).replace(/\.html$/, '')]),
  ...(fs.existsSync(path.join(HEADS, 'lhg')) ? walk(path.join(HEADS, 'lhg')) : [])
    .filter((f) => f.endsWith('.json'))
    .map((f) => [f, f.slice(HEADS.length).replace(/\.json$/, '')]),
];
const pages = new Set();
sources.forEach(([file, page]) => {
  pages.add(page);
  const text = fs.readFileSync(file, 'utf8').replace(/\\\//g, '/');
  (text.match(DAM) || []).forEach((url) => add(url, page));
});

const rows = [...byPath.entries()].map(([url, set]) => {
  const t = url.match(/^(.*?)\.transform\/[^/]*?(?:width-(\d+))?\/img\.([a-z0-9]+)$/i);
  const asset = t ? t[1] : url;
  const width = t ? (t[2] || '') : '';
  const format = (t ? t[3] : (url.match(/\.([a-z0-9]+)$/i) || [])[1] || '').toLowerCase();
  return [url, asset, width, format, [...set].sort().join(' ')];
}).sort((a, b) => a[1].localeCompare(b[1]) || Number(a[2]) - Number(b[2])
  || a[0].localeCompare(b[0]));

const csv = (v) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
fs.writeFileSync(OUT, `${['path', 'asset', 'width', 'format', 'pages'].join(',')}\n${
  rows.map((r) => r.map(csv).join(',')).join('\n')}\n`);
// eslint-disable-next-line no-console
console.log(`${rows.length} paths, ${new Set(rows.map((r) => r[1])).size} assets, ${pages.size} pages -> ${path.relative(ROOT, OUT)}`);
