/* eslint-disable max-len, no-console, no-continue, no-restricted-syntax -- dev tooling */
// A www URL list in md-pairs.mjs's shape (root, key, leave_out, loc) from saved XML sitemaps (.xml or .xml.gz):
// every <loc> whose path starts with a root (/<cc>/<ll>/, or /<ll>-<cc>/ with --root-style ll-cc).
// For sites without such a list (Discover, TAP's market sitemaps).
// usage: node bin/md-www-urls-sitemaps.mjs (--dir <folder with sitemaps> | --json <file>) --out <file.tsv> [--root-style ll-cc]
// --json: saved sitemaps read as {"sm:<key>": {"locs": [...]}, ...}
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const DIR = opt('dir') ? path.resolve(opt('dir')) : '';
const OUT = opt('out');
const LLCC = opt('root-style', 'cc/ll') === 'll-cc';
const LEAVE = [
  [/^\/(homepage|search|login)$/, 'homepage/search/login'],
  [/\/(nav|footer)$/, 'nav/footer'],
  [/^\/profile(\/|$)/, 'profile app shell'],
  [/\/fragments\//, 'fragment'],
  [/confirmation|thank-you/, 'form confirmation'],
  [/^\/configuration(\/|$)/, 'AEM configuration'],
];
const files = [];
const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
  const p = path.join(d, e.name);
  if (e.isDirectory()) walk(p); else if (/\.xml(\.gz)?$/.test(e.name)) files.push(p);
});
const JSON_IN = opt('json');
if (!JSON_IN) walk(DIR);
const seen = new Set();
const rows = [];
for (const f of files) {
  let xml = fs.readFileSync(f);
  if (f.endsWith('.gz')) xml = zlib.gunzipSync(xml);
  for (const m of xml.toString('utf8').matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
    let u;
    try { u = new URL(m[1].replace(/&amp;/g, '&')); } catch (e) { continue; }
    const re = LLCC ? /^\/([a-z]{2}-[a-z]{2})(\/.*)?$/ : /^\/([a-z]{2}\/[a-z]{2})(\/.*)?$/;
    const mm = u.pathname.replace(/\.html$/, '').match(re);
    if (!mm || seen.has(u.pathname)) continue;
    seen.add(u.pathname);
    const key = (mm[2] || '/').replace(/\/$/, '') || '/';
    rows.push([mm[1], key, (LEAVE.find(([r]) => r.test(key)) || [null, ''])[1], u.href]);
  }
}
if (JSON_IN) {
  const j = JSON.parse(fs.readFileSync(JSON_IN, 'utf8'));
  const locs = Object.entries(j).filter(([k]) => !/index/.test(k)).flatMap(([, v]) => v.locs || []);
  for (const loc of locs) {
    let u;
    try { u = new URL(loc); } catch (e) { continue; }
    const re = LLCC ? /^\/([a-z]{2}-[a-z]{2})(\/.*)?$/ : /^\/([a-z]{2}\/[a-z]{2})(\/.*)?$/;
    const mm = u.pathname.replace(/\.html$/, '').match(re);
    if (!mm || seen.has(u.pathname)) continue;
    seen.add(u.pathname);
    const key = (mm[2] || '/').replace(/\/$/, '') || '/';
    rows.push([mm[1], key, (LEAVE.find(([r]) => r.test(key)) || [null, ''])[1], u.href]);
  }
}
rows.sort((a, b) => (a[0] + a[1]).localeCompare(b[0] + b[1]));
fs.writeFileSync(OUT, `root\tkey\tleave_out\tloc\n${rows.map((r) => r.join('\t')).join('\n')}\n`);
console.log(files.length, 'sitemaps,', rows.length, 'urls,', rows.filter((r) => !r[2]).length, 'in scope');
