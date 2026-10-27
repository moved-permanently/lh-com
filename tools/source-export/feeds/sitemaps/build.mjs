#!/usr/bin/env node
/* eslint-disable no-console, no-restricted-syntax, no-continue, max-len */
// Builds the compact sitemap dataset (roots.json, groups.json.gz, market-only.json, stats.json)
// from the raw www.lufthansa.com sitemap files. Plain Node (>= 18), no dependencies.
//
//   node build.mjs <raw-dir> <manifest.json> [out-dir]
//
// <raw-dir> holds sitemap_lh.xml.gz (the index) and the sitemap_lh_<cc>_<ll>[_<n>].xml.gz files
// exactly as fetched. <manifest.json> lists every request (file, url, status, bytes, sha256,
// source); files with a status other than 200 are reported as gaps. Output goes to out-dir
// (default: the folder of this script).

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const [rawDir, manifestFile, outArg] = process.argv.slice(2);
if (!rawDir || !manifestFile) {
  console.error('usage: node build.mjs <raw-dir> <manifest.json> [out-dir]');
  process.exit(1);
}
const outDir = outArg || path.dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
const HOST = 'https://www.lufthansa.com';
const ROOT_RE = /^\/([a-z]{2})\/([a-z]{2})(?=\/|$)/;

const read = (file) => {
  const buf = fs.readFileSync(path.join(rawDir, file));
  return (buf[0] === 0x1f && buf[1] === 0x8b ? zlib.gunzipSync(buf) : buf).toString('utf8');
};
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&apos;/g, "'");
const rootOf = (p) => {
  const m = ROOT_RE.exec(p);
  return m ? `${m[1]}/${m[2]}` : null;
};

// --- index -----------------------------------------------------------------------------------
const indexXml = read('sitemap_lh.xml.gz');
const indexFiles = [...indexXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decode(m[1]).split('/').pop());
const indexSet = new Set(indexFiles);

// --- parse every fetched sitemap -------------------------------------------------------------
const ok = manifest.items.filter((it) => it.file !== 'sitemap_lh.xml.gz' && it.status === 200);
// A probe (a file not listed in the index) that answers 404 marks the end of a root's numbered
// files, or a root without a sitemap file; only other failures are gaps.
const probeEnd = (it) => it.source === 'probe' && it.status === 404;
const gaps = manifest.items.filter((it) => it.status !== 200 && !probeEnd(it));
const probedWithoutFile = manifest.items.filter((it) => probeEnd(it) && /^sitemap_lh_[a-z]+_[a-z]+\.xml\.gz$/.test(it.file))
  .map((it) => it.file.replace(/^sitemap_lh_([a-z]+)_([a-z]+)\.xml\.gz$/, '$1/$2'));

// Files whose Last-Modified is more than 14 days older than the newest file are leftovers
// (www no longer rewrites them); URLs found only there may be gone.
const lmTime = (it) => (it.lastModified ? Date.parse(it.lastModified) : NaN);
const newest = Math.max(...ok.map(lmTime).filter((t) => !Number.isNaN(t)));
const staleFiles = new Set(ok.filter((it) => newest - lmTime(it) > 14 * 864e5).map((it) => it.file));
const urls = new Map(); // path -> { lastmod, files:Set, alts:Int32Array (sorted ids) }
// Paths get integer ids so the 46 million alternate links fit in memory.
const ids = new Map();
const pathOf = [];
// Substrings keep the whole file's XML alive in V8; copy every string that is kept.
const own = (str) => Buffer.from(str, 'utf8').toString('utf8');
const idOf = (p) => {
  let i = ids.get(p);
  if (i === undefined) {
    i = pathOf.length;
    const copy = own(p);
    ids.set(copy, i);
    pathOf.push(copy);
  }
  return i;
};
const canon = (p) => pathOf[idOf(p)];
const has = (arr, x) => {
  let lo = 0;
  let hi = arr.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (arr[mid] === x) return true;
    if (arr[mid] < x) lo = mid + 1; else hi = mid - 1;
  }
  return false;
};
const altInfo = new Map(); // path -> Set(hreflang) as announced by alternates
const foreignHosts = new Map();
const nonRoot = new Set();
const fileRoot = new Map(); // file -> cc/ll from its name
const stats = {
  files: ok.length, urlEntries: 0, alternateLinks: 0, duplicateLocs: 0, selfAlternates: 0,
};

const toPath = (href) => {
  if (!href.startsWith(HOST)) {
    const host = href.replace(/^https?:\/\//, '').split('/')[0];
    foreignHosts.set(own(host), (foreignHosts.get(host) || 0) + 1);
    return null;
  }
  const p = href.slice(HOST.length) || '/';
  if (!rootOf(p)) nonRoot.add(own(p));
  return p;
};

for (const it of ok) {
  const m = /^sitemap_lh_([a-z]+)_([a-z]+)(?:_\d+)?\.xml\.gz$/.exec(it.file);
  if (m) fileRoot.set(it.file, `${m[1]}/${m[2]}`);
  const xml = read(it.file);
  for (const um of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const body = um[1];
    const loc = /<loc>([^<]+)<\/loc>/.exec(body);
    if (!loc) continue;
    const lp = toPath(decode(loc[1].trim()));
    if (!lp) continue;
    const p = canon(lp);
    stats.urlEntries += 1;
    let u = urls.get(p);
    if (!u) {
      u = { files: new Set(), alts: new Int32Array(0) };
      urls.set(p, u);
    } else stats.duplicateLocs += 1;
    u.files.add(it.file);
    const [, lm] = /<lastmod>([^<]+)<\/lastmod>/.exec(body) || [];
    if (lm && (!u.lastmod || lm > u.lastmod)) u.lastmod = own(lm);
    const altIds = [...u.alts];
    for (const [, attrs] of body.matchAll(/<xhtml:link\b([^>]*)\/?>/g)) {
      const href = /href="([^"]*)"/.exec(attrs);
      const hl = /hreflang="([^"]*)"/.exec(attrs);
      if (!href) continue;
      stats.alternateLinks += 1;
      const rawAp = toPath(decode(href[1]));
      if (!rawAp) continue;
      const ap = canon(rawAp);
      if (ap === p) stats.selfAlternates += 1;
      altIds.push(idOf(ap));
      if (hl) {
        if (!altInfo.has(ap)) altInfo.set(ap, new Set());
        const set = altInfo.get(ap);
        if (!set.has(hl[1])) set.add(own(hl[1]));
      }
    }
    u.alts = Int32Array.from(new Set(altIds)).sort();
  }
}

// --- union-find over loc <-> alternate edges ----------------------------------------------------
const parent = new Map();
const find = (x) => {
  let r = x;
  while (parent.get(r) !== r) r = parent.get(r);
  let c = x;
  while (parent.get(c) !== r) {
    const n = parent.get(c);
    parent.set(c, r);
    c = n;
  }
  return r;
};
const add = (x) => { if (!parent.has(x)) parent.set(x, x); };
const union = (a, b) => {
  add(a); add(b);
  const ra = find(a);
  const rb = find(b);
  if (ra !== rb) parent.set(ra, rb);
};
let asymmetric = 0;
const asymmetricSample = []; // [url, alternate that does not list url back]
for (const [p, u] of urls) {
  add(p);
  const pid = idOf(p);
  for (const aid of u.alts) {
    if (aid === pid) continue;
    const a = pathOf[aid];
    union(p, a);
    const back = urls.get(a);
    if (back && !has(back.alts, pid)) {
      asymmetric += 1;
      if (asymmetricSample.length < 20) asymmetricSample.push([p, a]);
    }
  }
}

const comps = new Map();
for (const p of parent.keys()) {
  const r = find(p);
  if (!comps.has(r)) comps.set(r, []);
  comps.get(r).push(p);
}

// --- roots -----------------------------------------------------------------------------------
const roots = new Map();
const R = (root) => {
  if (!roots.has(root)) {
    const [cc, ll] = root.split('/');
    roots.set(root, {
      root,
      cc,
      ll,
      hreflang: new Set(),
      sitemapFiles: [],
      inIndex: false,
      urlCount: 0,
      alternateOnlyCount: 0,
      groupCount: 0,
      marketOnlyCount: 0,
    });
  }
  return roots.get(root);
};
for (const [file, root] of fileRoot) R(root).sitemapFiles.push(file);
for (const f of indexFiles) {
  const m = /^sitemap_lh_([a-z]+)_([a-z]+)(?:_\d+)?\.xml\.gz$/.exec(f);
  if (m) R(`${m[1]}/${m[2]}`).inIndex = true;
}
for (const p of parent.keys()) {
  const root = rootOf(p);
  if (!root) continue;
  const r = R(root);
  if (urls.has(p)) r.urlCount += 1; else r.alternateOnlyCount += 1;
  for (const h of altInfo.get(p) || []) r.hreflang.add(h);
}

// --- groups and market-only pages ------------------------------------------------------------
const groups = [];
const marketOnly = {};
let conflictGroups = 0;
for (const members of comps.values()) {
  if (members.length === 1) {
    const p = members[0];
    const root = rootOf(p) || '(none)';
    (marketOnly[root] ||= []).push(urls.get(p)?.lastmod ? [p, urls.get(p).lastmod] : [p]);
    if (roots.has(root)) roots.get(root).marketOnlyCount += 1;
    continue;
  }
  members.sort();
  const paths = {};
  const lastmod = {};
  let conflict = false;
  for (const p of members) {
    const root = rootOf(p) || '(none)';
    if (paths[root] === undefined) paths[root] = p;
    else {
      conflict = true;
      paths[root] = [].concat(paths[root], p);
    }
    const lm = urls.get(p)?.lastmod;
    if (lm) {
      if (lastmod[root] === undefined) lastmod[root] = lm;
      else lastmod[root] = [].concat(lastmod[root], lm);
    }
  }
  if (conflict) conflictGroups += 1;
  const key = [].concat(paths['de/en'] ?? paths['de/de'] ?? members[0])[0];
  groups.push({
    key, size: members.length, paths, lastmod,
  });
  for (const root of Object.keys(paths)) if (roots.has(root)) roots.get(root).groupCount += 1;
}
groups.sort((a, b) => a.key.localeCompare(b.key, 'en'));
groups.forEach((g, i) => { g.id = i; });
for (const k of Object.keys(marketOnly)) marketOnly[k].sort((a, b) => (a[0] < b[0] ? -1 : 1));

// --- language-only and mismatching hreflang values -------------------------------------------
const hreflangMismatch = {}; // language-only values ("en") and values whose language or region differs from the path
for (const [p, set] of altInfo) {
  const root = rootOf(p);
  if (!root) continue;
  const [cc, ll] = root.split('/');
  for (const h of set) {
    const [lang, region] = h.toLowerCase().split('-');
    const okLang = lang === ll || (ll === 'hk' && lang === 'zh');
    if (!okLang || (region && region !== cc) || !region) {
      const k = `${h} -> ${root}`;
      hreflangMismatch[k] = (hreflangMismatch[k] || 0) + 1;
    }
  }
}

const rootsOut = [...roots.values()].sort((a, b) => (a.root < b.root ? -1 : 1)).map((r) => ({
  ...r,
  hreflang: [...r.hreflang].sort(),
  sitemapFiles: r.sitemapFiles.sort((a, b) => a.localeCompare(b, 'en', { numeric: true })),
  ownSitemap: r.sitemapFiles.length > 0,
}));

const byLang = {};
for (const [root, list] of Object.entries(marketOnly)) {
  const ll = root.split('/')[1] || root;
  byLang[ll] = (byLang[ll] || 0) + list.length;
}

const summary = {
  source: `${HOST}/sitemap/sitemap_lh.xml.gz`,
  fetchStarted: manifest.started,
  fetchEnded: manifest.ended,
  indexEntries: indexFiles.length,
  filesFetchedOk: ok.length,
  filesFromIndex: ok.filter((it) => indexSet.has(it.file)).length,
  filesFoundByProbe: ok.filter((it) => !indexSet.has(it.file)).length,
  gaps: gaps.map((g) => ({ file: g.file, status: g.status, source: g.source })),
  probeRequests: manifest.items.filter((it) => it.source === 'probe').length,
  probe404s: manifest.items.filter(probeEnd).length,
  rootsProbedWithoutSitemapFile: probedWithoutFile.sort(),
  urlEntries: stats.urlEntries,
  distinctLocs: urls.size,
  duplicateLocs: stats.duplicateLocs,
  alternateLinks: stats.alternateLinks,
  selfAlternates: stats.selfAlternates,
  staleFiles: [...staleFiles].sort(),
  urlsOnlyInStaleFiles: [...urls].filter(([, u]) => [...u.files].every((f) => staleFiles.has(f))).map(([p]) => p).sort(),
  asymmetricAlternates: asymmetric,
  asymmetricSample,
  distinctUrls: parent.size,
  alternateOnlyUrls: parent.size - urls.size,
  roots: rootsOut.length,
  rootsWithOwnSitemap: rootsOut.filter((r) => r.ownSitemap).length,
  rootsInIndex: rootsOut.filter((r) => r.inIndex).length,
  rootsOnlyAsAlternates: rootsOut.filter((r) => !r.ownSitemap).map((r) => r.root),
  rootsWithSitemapNotInIndex: rootsOut.filter((r) => r.ownSitemap && !r.inIndex).map((r) => r.root),
  groups: groups.length,
  groupsWithTwoUrlsInOneRoot: conflictGroups,
  marketOnlyUrls: Object.values(marketOnly).reduce((n, l) => n + l.length, 0),
  marketOnlyByLanguage: byLang,
  nonRootPaths: [...nonRoot].sort(),
  foreignHosts: Object.fromEntries(foreignHosts),
  hreflangNotMatchingPath: hreflangMismatch,
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, 'roots.json'), `${JSON.stringify({
  source: summary.source, fetched: manifest.started, roots: rootsOut,
}, null, 1)}\n`);
fs.writeFileSync(path.join(outDir, 'groups.json.gz'), zlib.gzipSync(JSON.stringify({
  source: summary.source, fetched: manifest.started, groups,
}), { level: 9 }));
fs.writeFileSync(path.join(outDir, 'market-only.json'), `${JSON.stringify({
  source: summary.source, fetched: manifest.started, roots: marketOnly,
}, null, 1)}\n`);
fs.writeFileSync(path.join(outDir, 'stats.json'), `${JSON.stringify(summary, null, 1)}\n`);
console.log(JSON.stringify({ ...summary, rootsOnlyAsAlternates: summary.rootsOnlyAsAlternates.length, nonRootPaths: summary.nonRootPaths.length }, null, 1));
