/* eslint-disable max-len, no-console, prefer-destructuring -- dev tooling */
// lufthansa.com's www URL list in md-pairs.mjs's shape (root, key, leave_out, loc), from the sitemap dataset in lh-com
// tools/source-export/feeds/sitemaps (groups.json.gz: every <loc> and hreflang alternate, market-only.json: URLs in no
// group). Leave-out rules: the pages lh-edge never answers from a language version or that are not content pages
// (homepage, nav, footer, search, login, profile, fragments, confirmations, AEM configuration, AirCore /lhg/).
// usage: node bin/md-www-urls-lh.mjs --lhcom <lh-com export> --out <file.tsv>
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const dir = path.join(path.resolve(opt('lhcom')), 'tools/source-export/feeds/sitemaps');
const OUT = opt('out');
const LEAVE = [
  [/^\/(homepage|search|login)$/, 'homepage/search/login'],
  [/\/(nav|footer)$/, 'nav/footer'],
  [/^\/profile(\/|$)/, 'profile app shell'],
  [/\/fragments\//, 'fragment'],
  [/confirmation|thank-you/, 'form confirmation'],
  [/^\/configuration(\/|$)/, 'AEM configuration'],
  [/^\/lhg(\/|$)/, 'AirCore'],
];
const groups = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(dir, 'groups.json.gz')))).groups;
const marketOnly = JSON.parse(fs.readFileSync(path.join(dir, 'market-only.json'), 'utf8')).roots;
const seen = new Set();
const rows = [];
const add = (root, p) => {
  if (!p || seen.has(p)) return;
  seen.add(p);
  const key = p.slice(root.length + 1) || '/';
  const leave = (LEAVE.find(([re]) => re.test(key)) || [null, ''])[1];
  rows.push([root, key, leave, `https://www.lufthansa.com${p}`]);
};
groups.forEach((g) => Object.entries(g.paths).forEach(([root, p]) => [p].flat().forEach((x) => add(root, x))));
Object.entries(marketOnly).forEach(([root, list]) => list.forEach(([p]) => add(root, p)));
rows.sort((a, b) => (a[0] + a[1]).localeCompare(b[0] + b[1]));
fs.writeFileSync(OUT, `root\tkey\tleave_out\tloc\n${rows.map((r) => r.join('\t')).join('\n')}\n`);
console.log(rows.length, 'urls,', rows.filter((r) => !r[2]).length, 'in scope');
