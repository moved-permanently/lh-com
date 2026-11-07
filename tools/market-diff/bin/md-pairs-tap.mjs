/* eslint-disable max-len, no-await-in-loop, no-console, no-continue, no-restricted-syntax, object-curly-newline -- dev tooling */
// market-diff pair list for TAP (www.flytap.com, roots <ll>-<cc>): every page of a market root that lh-edge's TAP market
// route answers from the root's language version (tools/workers/lh-edge/src/tap-markets.js): the version's pages index
// (/<version>/pages-index.json on our origin) has the page and its `markets` allows the country, the root has no own page
// of the path (scripts/tap-markets.js rows: own pages; the origin's market-pages index: own documents) and the path is not
// one the root lacks (scripts/tap-markets.js rows: lacks). TAP has one URL per
// page and root (same slug as the version), so the root URL is /<root><path>.
// usage: node bin/md-pairs-tap.mjs --lhcom <lh-com export> --out <dir> [--origin https://main--lh-tap--moved-permanently.aem.live]
// Writes pairs.tsv, urls.txt, pairs-summary.json as md-pairs.mjs.
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const LHCOM = path.resolve(opt('lhcom', ''));
const OUT = path.resolve(opt('out', '.'));
const ORIGIN = opt('origin', 'https://main--lh-tap--moved-permanently.aem.live');
fs.mkdirSync(path.join(OUT, 'data'), { recursive: true });
const { TAP_MARKETS, TAP_LIVE_MARKETS } = await import(path.join(LHCOM, 'scripts/tap-markets.js'));
const { marketAllows } = await import(path.join(LHCOM, 'scripts/market-rules.js'));
const live = new Set(Array.isArray(TAP_LIVE_MARKETS) ? TAP_LIVE_MARKETS : Object.keys(TAP_MARKETS));

async function index(version) {
  const file = path.join(OUT, 'data', `${version}_pages-index.json`);
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  const rows = [];
  for (let offset = 0; ; offset += 1000) {
    const r = await fetch(`${ORIGIN}/${version}/pages-index.json?limit=1000&offset=${offset}`);
    if (!r.ok) throw new Error(`${version}: ${r.status}`);
    const j = await r.json();
    rows.push(...j.data);
    if (j.data.length < 1000) break;
  }
  fs.writeFileSync(file, JSON.stringify(rows));
  return rows;
}
// the roots' own documents (helix-query market-pages on our origin; paged by 200, a bigger page answers 413)
async function marketPages() {
  const file = path.join(OUT, 'data', 'market-pages.json');
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  const rows = [];
  for (let offset = 0; ; offset += 200) {
    const r = await fetch(`${ORIGIN}/market-pages.json?limit=200&offset=${offset}`);
    if (r.status === 404) break;
    if (!r.ok) throw new Error(`market-pages: ${r.status}`);
    const j = await r.json();
    rows.push(...j.data);
    if (j.data.length < 200 || rows.length >= (j.total || 0)) break;
  }
  fs.writeFileSync(file, JSON.stringify(rows));
  return rows;
}
const ownDocs = new Set((await marketPages()).map((r) => r.path));
const pairs = [];
const count = { roots: 0, pairs: 0, own: 0, ownDocs: 0, lacks: 0, notAllowed: 0 };
for (const [root, row] of Object.entries(TAP_MARKETS)) {
  if (!live.has(root)) continue;
  count.roots += 1;
  const [, cc, version, , , , own, lacks] = row;
  const ownSet = new Set(own || []);
  const lackSet = new Set(lacks || []);
  for (const r of await index(version)) {
    const rest = r.path.slice(version.length + 1);
    if (!rest || rest === '/' || /\/(nav|footer)$|\/fragments\//.test(rest)) continue;
    if (ownSet.has(rest)) { count.own += 1; continue; }
    if (ownDocs.has(`/${root}${rest}`)) { count.ownDocs += 1; continue; }
    if (lackSet.has(rest)) { count.lacks += 1; continue; }
    if (r.markets && !marketAllows(r.markets, cc)) { count.notAllowed += 1; continue; }
    pairs.push([root, version, `/${root}${rest}`, `/${version}${rest}`, rest, 'version']);
  }
}
count.pairs = pairs.length;
fs.writeFileSync(path.join(OUT, 'pairs.tsv'), `root\tversion\troot_path\tversion_path\trest\tsource\n${pairs.map((p) => p.join('\t')).join('\n')}\n`);
const vUrls = [...new Set(pairs.map((p) => p[3]))];
const rUrls = [...new Set(pairs.map((p) => p[2]))];
fs.writeFileSync(path.join(OUT, 'urls.txt'), `${[...vUrls, ...rUrls].join('\n')}\n`);
Object.assign(count, { versionPages: vUrls.length, rootPages: rUrls.length, requests: vUrls.length + rUrls.length });
fs.writeFileSync(path.join(OUT, 'pairs-summary.json'), `${JSON.stringify(count, null, 1)}\n`);
console.log(JSON.stringify(count));
