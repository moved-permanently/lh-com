/* eslint-disable no-console, max-len -- dev tooling */
/**
 * All markets, package 1 part a: the inventory of www's market-language roots, from the sitemap
 * dataset tools/source-export/feeds/sitemaps (see its README; nothing is fetched).
 *
 * - per root: the URLs of its own sitemaps (<loc>), URLs seen only as alternates, page groups,
 *   market-only URLs (in no group), AEM configuration pages (/configuration/), URLs only in the
 *   stale leftover files;
 * - per language: each root's path set (its sitemap URLs without /<cc>/<ll>, configuration pages
 *   and stale-only URLs left out) against the language's reference: en de/en, de de/de, every other
 *   language the paths at least half of its roots have. Shared: the same path; missing: a
 *   reference path the root does not list; market-only: a path the reference does not have,
 *   split into "the same page under another slug" (its page group has a reference path) and
 *   "own page";
 * - the roots that appear only as alternates, and what the dataset says about their URLs.
 * Writes tools/reports/markets/inventory.md and .json. Usage: node tools/markets/inventory.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DATA = path.join(root, 'tools/source-export/feeds/sitemaps');
const read = (f) => JSON.parse(fs.readFileSync(path.join(DATA, f), 'utf8'));
const { roots } = read('roots.json');
const { groups } = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(DATA, 'groups.json.gz'))).toString('utf8'));
const marketOnly = read('market-only.json').roots;
const stats = read('stats.json');

export const REFERENCE = { en: 'de/en', de: 'de/de' };
export const REPLICA = ['de/en', 'de/de', 'at/de', 'gb/en'];
const CONFIG = /\/configuration\//;
const stale = new Set((stats.urlsOnlyInStaleFiles || []).map((u) => (typeof u === 'string' ? u : u.path || u.url)).map((u) => String(u).replace(/^https:\/\/www\.lufthansa\.com/, '')));
const tail = (p, r) => p.slice(r.length + 1) || '/';

/** Per root: its sitemap paths (in a group with a lastmod, or market-only) and their groups. */
function rootPaths() {
  const byRoot = new Map(roots.map((r) => [r.root, { locs: new Map(), alternateOnly: 0 }]));
  groups.forEach((g) => {
    Object.entries(g.paths).forEach(([r, p]) => {
      const entry = byRoot.get(r);
      if (!entry) return;
      (Array.isArray(p) ? p : [p]).forEach((one) => {
        if (g.lastmod && g.lastmod[r]) entry.locs.set(one, g.id);
        else entry.alternateOnly += 1;
      });
    });
  });
  Object.entries(marketOnly).forEach(([r, list]) => {
    const entry = byRoot.get(r);
    if (entry) list.forEach(([p]) => entry.locs.set(p, null));
  });
  return byRoot;
}

const byRoot = rootPaths();

/** The path set of a root (tails), without configuration pages and stale-only URLs. */
function pathSet(r) {
  const out = new Map();
  [...byRoot.get(r).locs].forEach(([p, gid]) => {
    if (CONFIG.test(p) || stale.has(p)) return;
    out.set(tail(p, r), gid);
  });
  return out;
}

const languages = [...new Set(roots.map((r) => r.ll))].sort();
const rootsOf = (ll) => roots.filter((r) => r.ll === ll && r.ownSitemap).map((r) => r.root).sort();

/** The reference path set of a language (tails): de/en, de/de, or the majority of its roots. */
function referenceOf(ll) {
  if (REFERENCE[ll]) return { name: REFERENCE[ll], paths: pathSet(REFERENCE[ll]) };
  const list = rootsOf(ll);
  const counts = new Map();
  list.forEach((r) => pathSet(r).forEach((gid, t) => counts.set(t, (counts.get(t) || 0) + 1)));
  const paths = new Map();
  counts.forEach((n, t) => { if (n >= list.length / 2) paths.set(t, null); });
  return { name: `majority of ${list.length} ${ll} roots`, paths };
}

const languageReports = languages.map((ll) => {
  const list = rootsOf(ll);
  if (!list.length) return { language: ll, roots: [] };
  const ref = referenceOf(ll);
  // the groups of the reference, to tell a page under another slug from an own page
  const refGroups = new Set();
  if (REFERENCE[ll]) ref.paths.forEach((gid) => { if (gid !== null) refGroups.add(gid); });
  else list.forEach((r) => pathSet(r).forEach((gid, t) => { if (ref.paths.has(t) && gid !== null) refGroups.add(gid); }));
  const rows = list.map((r) => {
    const set = pathSet(r);
    let shared = 0;
    let otherSlug = 0;
    const own = [];
    set.forEach((gid, t) => {
      if (ref.paths.has(t)) shared += 1;
      else if (gid !== null && refGroups.has(gid)) otherSlug += 1;
      else own.push(t);
    });
    const missing = [...ref.paths.keys()].filter((t) => !set.has(t)).length;
    const info = roots.find((x) => x.root === r);
    return {
      root: r,
      urls: info.urlCount,
      config: [...byRoot.get(r).locs.keys()].filter((p) => CONFIG.test(p)).length,
      staleOnly: [...byRoot.get(r).locs.keys()].filter((p) => stale.has(p)).length,
      pages: set.size,
      shared,
      otherSlug,
      own: own.length,
      ownMarketOnly: (marketOnly[r] || []).filter(([p]) => !CONFIG.test(p) && !stale.has(p)).length,
      missing,
      ownSample: own.slice(0, 8),
      replica: REPLICA.includes(r),
    };
  });
  return {
    language: ll, reference: ref.name, referencePages: ref.paths.size, roots: rows,
  };
});

const alternateOnly = roots.filter((r) => !r.ownSitemap).map((r) => ({
  root: r.root, hreflang: r.hreflang, urls: r.alternateOnlyCount, groups: r.groupCount,
}));

const sum = (list, k) => list.reduce((n, x) => n + (x[k] || 0), 0);
const allRows = languageReports.flatMap((l) => l.roots);
const summary = {
  roots: roots.length,
  withSitemap: roots.filter((r) => r.ownSitemap).length,
  alternateOnly: alternateOnly.length,
  countries: new Set(roots.filter((r) => r.ownSitemap).map((r) => r.cc)).size,
  languages: languageReports.filter((l) => l.roots.length).map((l) => ({ language: l.language, roots: l.roots.length })),
  urls: sum(roots, 'urlCount'),
  pages: sum(allRows, 'pages'),
  configPages: sum(allRows, 'config'),
  staleOnly: sum(allRows, 'staleOnly'),
  groups: groups.length,
  marketOnlyUrls: stats.marketOnlyUrls,
  notReplica: allRows.filter((r) => !r.replica).length,
};

const out = path.join(root, 'tools/reports/markets');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'inventory.json'), `${JSON.stringify({
  generated: new Date().toISOString(), dataset: { source: 'tools/source-export/feeds/sitemaps', fetched: read('roots.json').fetched }, summary, languages: languageReports, alternateOnly,
}, null, 1)}\n`);

const pct = (a, b) => (b ? `${Math.round((100 * a) / b)} %` : '-');
const lines = ['# All markets: inventory of www\'s market-language roots', '',
  `${new Date().toISOString().slice(0, 10)}, from the sitemap dataset of ${read('roots.json').fetched || '2026-10-27'} (tools/source-export/feeds/sitemaps; nothing fetched). Paths are compared without the /<cc>/<ll> prefix; AEM configuration pages (/configuration/…) and URLs only in the stale leftover files are counted apart and left out of the path sets.`, '',
  '## Summary', '',
  `- ${summary.roots} roots: ${summary.withSitemap} with their own sitemaps in ${summary.countries} countries, ${summary.alternateOnly} only as alternates. The replica has 4 (de/en, de/de, at/de, gb/en); ${summary.notReplica} roots with sitemaps are not on Edge Delivery.`,
  `- ${summary.urls} sitemap URLs; without ${summary.configPages} configuration pages and ${summary.staleOnly} stale-only URLs, ${summary.pages} pages.`,
  `- ${summary.groups} page groups (one page in several roots) and ${summary.marketOnlyUrls} market-only URLs.`,
  `- Roots per language: ${summary.languages.map((l) => `${l.language} ${l.roots}`).join(', ')}.`, '',
  '## Per language', '',
  'Shared: the same path as the reference. Other slug: the same page (page group) under another path. Own: a page the reference does not have (of them, market-only: in no page group). Missing: reference paths the root does not list.', ''];
languageReports.filter((l) => l.roots.length).forEach((l) => {
  lines.push(
    `### ${l.language} (${l.roots.length} roots; reference ${l.reference}, ${l.referencePages} pages)`,
    '',
    '| Root | Sitemap URLs | Config | Stale only | Pages | Shared | Other slug | Own (market-only) | Missing |',
    '| --- | --- | --- | --- | --- | --- | --- | --- | --- |',
    ...l.roots.map((r) => `| ${r.root}${r.replica ? ' (replica)' : ''} | ${r.urls} | ${r.config} | ${r.staleOnly} | ${r.pages} | ${r.shared} (${pct(r.shared, r.pages)}) | ${r.otherSlug} | ${r.own} (${r.ownMarketOnly}) | ${r.missing} |`),
    '',
  );
});
lines.push(
  '## Roots only as alternates',
  '',
  `${alternateOnly.length} roots have no sitemap file and appear only as hreflang alternates. The dataset has no answer of their URLs (they were never fetched: www's sitemaps never list them as a page); README: they are the targets of language-only hreflang values (en, de, zh …), www's language fallbacks without a market. Also: /null/null/home and /null/null/oneTrip in two groups.`,
  '',
  '| Root | hreflang | URLs (alternates) | Page groups |',
  '| --- | --- | --- | --- |',
  ...alternateOnly.map((r) => `| ${r.root} | ${r.hreflang.join(', ')} | ${r.urls} | ${r.groups} |`),
  '',
);
fs.writeFileSync(path.join(out, 'inventory.md'), lines.join('\n'));
console.log(`inventory: ${summary.roots} roots (${summary.withSitemap} with sitemaps, ${summary.alternateOnly} alternates only), ${summary.pages} pages`);
