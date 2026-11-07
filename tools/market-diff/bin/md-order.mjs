/* eslint-disable import/extensions, max-len, no-console, no-nested-ternary, object-curly-newline -- dev tooling */
// market-diff fetch order: turns a pair list into md-fetch.mjs's URL list, grouped by page (the version page, then every
// root of that page), so that a run that stops part way leaves complete pages behind, and ordered by value: service,
// legal, contact and offer pages first, short codes next, editorial pages (articles, news) last.
//
// usage: node bin/md-order.mjs --pairs <pairs.tsv> --out <urls.txt> [--pilot <n pages>] [--only <regex on rest>]
//          [--roots <root,root,...>] [--editorial <regex>] [--pairs-out <pairs.tsv of the selection>]
// --pilot n: only the first n pages (all their roots), for a first run whose results are checked before the full run.
// --editorial: rest paths that count as editorial (default: /articles/, /news/, /magazine/, /stories/, /blog/,
//              /inspiration/, /press/).
import fs from 'node:fs';
import readText from '../lib/files.mjs';

const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const lines = readText(opt('pairs')).split('\n').filter((l) => l.trim() && !l.startsWith('#'));
const headLine = lines.shift();
const head = headLine.split('\t');
let pairs = lines.map((l) => Object.fromEntries(l.split('\t').map((v, i) => [head[i], v])));
const ONLY = opt('only') ? new RegExp(opt('only')) : null;
const ROOTS = opt('roots') ? new Set(opt('roots').split(',')) : null;
const EDITORIAL = new RegExp(opt('editorial', '^/(articles|news|magazine|stories|blog|inspiration|press)(/|$)'));
const SHORT = /^\/[0-9]{1,3}[a-z0-9]{0,2}$/;
if (ONLY) pairs = pairs.filter((p) => ONLY.test(p.rest));
if (ROOTS) pairs = pairs.filter((p) => ROOTS.has(p.root));
const tier = (rest) => (EDITORIAL.test(rest) ? 3 : SHORT.test(rest) ? 2 : 1);
const pages = new Map();
pairs.forEach((p) => {
  const k = `${p.version}|${p.rest}`;
  if (!pages.has(k)) pages.set(k, { tier: tier(p.rest), version: p.version, rest: p.rest, versionPath: p.version_path, pairs: [] });
  pages.get(k).pairs.push(p);
});
let list = [...pages.values()].sort((a, b) => a.tier - b.tier || a.rest.localeCompare(b.rest) || a.version.localeCompare(b.version));
if (opt('pilot')) list = list.slice(0, Number(opt('pilot')));
const urls = [];
const seen = new Set();
const add = (u) => { if (!seen.has(u)) { seen.add(u); urls.push(u); } };
list.forEach((pg) => { add(pg.versionPath); pg.pairs.sort((a, b) => a.root.localeCompare(b.root)).forEach((p) => add(p.root_path)); });
fs.writeFileSync(opt('out'), `${urls.join('\n')}\n`);
if (opt('pairs-out')) {
  const cols = head;
  fs.writeFileSync(opt('pairs-out'), `${headLine}\n${list.flatMap((pg) => pg.pairs).map((p) => cols.map((c) => p[c]).join('\t')).join('\n')}\n`);
}
const byTier = list.reduce((m, pg) => { m[pg.tier] = (m[pg.tier] || 0) + pg.pairs.length; return m; }, {});
console.log(JSON.stringify({ pages: list.length, pairs: list.reduce((n, pg) => n + pg.pairs.length, 0), urls: urls.length, pairsByTier: { service: byTier[1] || 0, shortCodes: byTier[2] || 0, editorial: byTier[3] || 0 } }));
