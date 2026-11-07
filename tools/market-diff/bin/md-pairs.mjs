/* eslint-disable max-len, no-await-in-loop, no-console, no-continue, no-loop-func, no-restricted-syntax, object-curly-newline, prefer-destructuring -- dev tooling */
// market-diff pair list: every page www publishes under a market root that our replica answers from ANOTHER document
// (the language version's, the rest-of-world root's, a donor root's or the neutral version's), as lh-edge's market route
// decides it. Uses lh-edge's own code (tools/workers/lh-edge/src/markets.js serves, donorOf, LANGUAGE_ONLY and the site
// tables of src/sites.js) on a model built from our replica's indexes, so the rule cannot drift from what is served.
//
// usage: node bin/md-pairs.mjs --lhcom <lh-com export> --site <lh-com|discover|ita|austrian|brussels|b2b|swiss>
//          --www-urls <tsv> --out <dir> [--origin https://main--lh-<x>--moved-permanently.aem.live] [--www-host <host>]
//          [--long-xx /content/lh/markets]   (lh-com: ask www for xx/<ll> pages by their long path; www geo-redirects /xx/)
// --www-urls: TSV with a header and the columns root, key (path after the root), leave_out (empty = in scope), loc,
//             or 'version-index' (every page of the language version under every market root: Group for Business);
//             a brand's www URL list (root, key, leave_out, loc) has that shape; bin/md-www-urls-lh.mjs writes it for
//             lufthansa.com from the sitemap groups; bin/md-www-urls-sitemaps.mjs from saved sitemaps (Discover).
// Writes <out>/pairs.tsv (root, version, root_path, version_path, rest, source), <out>/urls.txt (version pages first),
// <out>/not-served.tsv (www pages of market roots our replica does not answer at all) and <out>/pairs-summary.json.
// Index reads go to our own origin (aem.live) only, cached in <out>/data/.
import fs from 'node:fs';
import path from 'node:path';

const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const LHCOM = path.resolve(opt('lhcom', ''));
const SITE = opt('site');
const WWW_URLS = opt('www-urls');
const OUT = path.resolve(opt('out', '.'));
const SITE_REPO = SITE === 'lh-com' ? 'lh-com' : `lh-${SITE}`;
const ORIGIN = opt('origin', `https://main--${SITE_REPO}--moved-permanently.aem.live`);
const LONG_XX = opt('long-xx', '');
if (!SITE || !WWW_URLS || !opt('lhcom')) { console.error('usage: md-pairs.mjs --lhcom <dir> --site <site> --www-urls <tsv> --out <dir>'); process.exit(1); }
fs.mkdirSync(path.join(OUT, 'data'), { recursive: true });

const src = path.join(LHCOM, 'tools/workers/lh-edge/src');
const { SITES, LH_TABLES, SITE_INDEX_PATHS = {}, MARKET_INDEX_EXCLUDED_ROOTS = [] } = await import(path.join(src, 'sites.js'));
const M = await import(path.join(src, 'markets.js'));
const t = SITE === 'lh-com' ? LH_TABLES : SITES[SITE];
if (!t) { console.error(`unknown site ${SITE}`); process.exit(1); }

/** Every row of an index sheet on our origin (paged; cached in data/). */
async function sheet(p) {
  const file = path.join(OUT, 'data', `${p.replace(/^\//, '').replace(/\//g, '_')}`);
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  const rows = [];
  for (let offset = 0; ; offset += 1000) {
    const r = await fetch(`${ORIGIN}${p}?limit=1000&offset=${offset}`, { headers: { 'user-agent': 'market-diff/1 (curl-like)' } });
    if (r.status === 404) break;
    if (!r.ok) throw new Error(`${p}: ${r.status}`);
    const j = await r.json();
    const data = j.data || (j[Object.keys(j).find((k) => j[k]?.data)] || {}).data || [];
    rows.push(...data);
    if (data.length < 1000 || rows.length >= (j.total || 0)) break;
  }
  fs.writeFileSync(file, JSON.stringify(rows));
  return rows;
}

const roots = t.marketRoots.filter((k) => t.table[k].status === 'live');
const ownRows = await sheet(M.MARKET_INDEX);
// SWISS: market roots that helix-query.yaml's market-pages index leaves out keep their own pages in their own
// /<root>/search-index.json (lh-edge src/sites.js MARKET_INDEX_EXCLUDED_ROOTS, MARKET_EXTRA_INDEXES)
if (SITE === 'swiss') {
  for (const r of roots.filter((x) => MARKET_INDEX_EXCLUDED_ROOTS.includes(x))) ownRows.push(...await sheet(`/${r}/search-index.json`).catch(() => []));
}
const own = new Map(ownRows.map((r) => [r.path, r]));
// a site's language-version index (SWISS: /ch/<ll>/language-index.json, src/sites.js SITE_INDEX_PATHS)
const indexPath = (v) => (SITE_INDEX_PATHS[SITE] ? SITE_INDEX_PATHS[SITE](v) : `/${v}/search-index.json`);
const versions = {};
for (const [lang, v] of Object.entries(t.versions)) {
  const rows = await sheet(indexPath(v));
  versions[lang] = { root: v, index: new Map(rows.map((r) => [r.path, r])) };
}
const restIdx = {};
for (const [lang, v] of Object.entries(t.restOfWorld || {})) {
  const rows = await sheet(indexPath(v)).catch(() => []);
  restIdx[lang] = new Map(rows.map((r) => [r.path, r]));
}
const model = { roots, own, versions, site: t };

let urls;
if (WWW_URLS === 'version-index') {
  // no www list (Group for Business has no sitemap; www answers every version path on every market root): every page of
  // the root's language version, under the root
  urls = [];
  for (const root of roots) {
    const v = versions[t.table[root].lang];
    v.index.forEach((r, p) => urls.push({ root, key: p.slice(v.root.length + 1) || '/', leave_out: '', loc: `https://${opt('www-host', '')}/${root}${p.slice(v.root.length + 1)}` }));
  }
} else {
  const lines = fs.readFileSync(WWW_URLS, 'utf8').split('\n').filter(Boolean);
  const head = lines.shift().split('\t');
  urls = lines.map((l) => Object.fromEntries(l.split('\t').map((v, i) => [head[i], v])));
}
const wwwPath = (root, rest) => (LONG_XX && root.startsWith('xx/') ? `${LONG_XX}/${root}${rest}` : `/${root}${rest}`);
const SKIP = /^\/homepage$|\/(nav|footer)$|\/fragments\//;

const pairs = [];
const notServed = [];
const count = { www: 0, marketRootUrls: 0, leftOut: 0, own: 0, languageOnly: 0, pairs: 0, notServed: 0, bySource: {} };
for (const u of urls) {
  count.www += 1;
  const root = u.root;
  if (!roots.includes(root)) continue;
  count.marketRootUrls += 1;
  if (u.leave_out) { count.leftOut += 1; continue; }
  const rest = u.key.replace(/\/$/, '') || '/';
  if (rest === '/' || SKIP.test(rest)) { count.languageOnly += 1; continue; }
  if (own.has(`/${root}${rest}`)) { count.own += 1; continue; }
  if (M.LANGUAGE_ONLY.test(rest)) { count.languageOnly += 1; continue; }
  const { lang } = t.table[root];
  const cc = root.split('/')[0];
  const from = t.versions[lang];
  const v = versions[lang];
  const row = v.index.get(`/${from}${rest}`);
  const indexed = Boolean(row);
  const serves = indexed && M.serves(model, root, rest);
  const donor = !serves ? M.donorOf(model, t, root, rest) : null;
  let source = null;
  let kind = null;
  if (serves) {
    const leftOut = Boolean(row.markets && !M.marketAllows(row.markets, cc));
    const rw = (t.restOfWorld || {})[lang];
    if (leftOut && rw && rw !== root) { source = rw; kind = 'rest-of-world'; } else { source = from; kind = 'version'; }
  } else if (donor) { source = donor; kind = 'donor'; } else if (!indexed) {
    const neutral = (t.neutral || {})[lang];
    const n = neutral && own.get(`/${neutral}${rest}`);
    if (n && (!n.markets || M.marketAllows(n.markets, cc))) { source = neutral; kind = 'neutral'; }
  }
  if (!source) { notServed.push([root, rest, u.loc || '']); count.notServed += 1; continue; }
  pairs.push([root, source, wwwPath(root, rest), wwwPath(source, rest), rest, kind]);
  count.pairs += 1;
  count.bySource[kind] = (count.bySource[kind] || 0) + 1;
}
fs.writeFileSync(path.join(OUT, 'pairs.tsv'), `root\tversion\troot_path\tversion_path\trest\tsource\n${pairs.map((p) => p.join('\t')).join('\n')}\n`);
fs.writeFileSync(path.join(OUT, 'not-served.tsv'), `root\trest\tloc\n${notServed.map((p) => p.join('\t')).join('\n')}\n`);
const vUrls = [...new Set(pairs.map((p) => p[3]))];
const rUrls = [...new Set(pairs.map((p) => p[2]))];
fs.writeFileSync(path.join(OUT, 'urls.txt'), `${[...vUrls, ...rUrls].join('\n')}\n`);
count.versionPages = vUrls.length;
count.rootPages = rUrls.length;
count.requests = vUrls.length + rUrls.length;
count.roots = new Set(pairs.map((p) => p[0])).size;
fs.writeFileSync(path.join(OUT, 'pairs-summary.json'), `${JSON.stringify(count, null, 1)}\n`);
console.log(JSON.stringify(count));
