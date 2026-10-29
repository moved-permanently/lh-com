/* eslint-disable no-console, max-len, import/prefer-default-export -- tooling */
/**
 * Discover Airlines' full site (brief 124): www.discover-airlines.com's sitemaps (the index
 * sitemap_four_y.xml.gz and its 9 market files, recorded with bd-fetch.mjs into
 * tools/source-export/bundles) into the scope of lh-discover, as option B builds ch:
 * - per root: its sitemap URLs, the page paths without /<cc>/<ll>;
 * - left out by rule: configuration pages, error pages, feedbackai questionnaires, pages with
 *   Templates, test, _deact, descoped or draft in their path, /lhg/, login and profile;
 * - the language documents (de/en, de/de, xx/fr: every page of the language's largest root),
 *   the market roots' own pages (a path no root of its language's language version has).
 * Writes content-sites/lh-discover/scope.json (gitignored: content-sites/) and prints the numbers.
 * App shells (book/my-bookings pages that are only a booking app) are found after the capture.
 *
 * Usage: node tools/importer/discover-scope.mjs [--bundles bd-2026-10-29T...ndjson ...]
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const ROOTS = ['de/en', 'de/de', 'xx/fr', 'us/en', 'ca/en', 'xx/en', 'us/de', 'xx/de', 'ca/fr'];
export const LANGUAGE_VERSIONS = { en: 'de/en', de: 'de/de', fr: 'xx/fr' };

/** Why a page path is left out, or ''. */
export function leftOut(p) {
  const rest = p.replace(/^\/[a-z]{2}\/[a-z]{2}/, '');
  if (/^\/lhg(\/|$)/.test(p)) return '/lhg/';
  if (/(^|\/)(login|profile)(\/|$)/i.test(rest)) return 'login or profile (left alone)';
  if (/^\/(configuration|config)(\/|$)/i.test(rest) || /\/configuration(\/|$)/i.test(rest)) return 'configuration page';
  if (/(^|\/)(error|404|500|errorpage|error-page)[^/]*$/i.test(rest)) return 'error page';
  if (/feedbackai/i.test(rest)) return 'feedbackai questionnaire (the feedback block covers it)';
  if (/templates|(^|[/_-])test([/_-]|$)|_deact|descoped|draft/i.test(rest)) return 'template, test, deactivated, descoped or draft';
  return '';
}

const bundleFiles = () => {
  const dir = path.join(root, 'tools/source-export/bundles');
  return fs.readdirSync(dir).filter((f) => f.startsWith('bd-')).map((f) => path.join(dir, f));
};

/** The recorded sitemap files: {root: [urls]} (the newest answer of each file). */
export function recordedSitemaps(files = bundleFiles()) {
  const byFile = new Map();
  files.forEach((f) => fs.readFileSync(f, 'utf8').trim().split('\n').forEach((line) => {
    const l = JSON.parse(line);
    const m = l.url.match(/sitemap_four_y_([a-z]{2})_([a-z]{2})\.xml\.gz$/);
    if (!m || l.status !== 200) return;
    const b = l.base64 ? Buffer.from(l.text, 'base64') : Buffer.from(l.text || '');
    const xml = (b[0] === 0x1f && b[1] === 0x8b ? zlib.gunzipSync(b) : b).toString('utf8');
    byFile.set(`${m[1]}/${m[2]}`, xml);
  }));
  return Object.fromEntries([...byFile].map(([r, xml]) => [r, [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1])]));
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const maps = recordedSitemaps();
  const out = { recorded: new Date().toISOString(), roots: {} };
  const kept = {};
  ROOTS.forEach((r) => {
    const urls = maps[r] || [];
    const paths = urls.map((u) => new URL(u).pathname.replace(/\.html$/, '').replace(/\/$/, ''));
    const reasons = {};
    const keep = [];
    paths.forEach((p) => {
      const why = leftOut(p);
      if (why) (reasons[why] ||= []).push(p); else keep.push(p);
    });
    kept[r] = keep;
    out.roots[r] = { urls: urls.length, keep: keep.length, leftOut: reasons };
  });
  // suffixes (the page path without /<cc>/<ll>) per root; a market root's own pages: suffixes its
  // language version doesn't have
  const suffixes = (r) => new Set(kept[r].map((p) => p.slice(r.length + 1) || '/'));
  ROOTS.forEach((r) => {
    const lang = r.split('/')[1];
    const version = LANGUAGE_VERSIONS[lang];
    const mine = suffixes(r);
    out.roots[r].suffixes = [...mine].sort();
    if (version !== r) {
      const v = suffixes(version);
      out.roots[r].own = [...mine].filter((s) => !v.has(s) && s !== '/homepage').sort();
      out.roots[r].missing = [...v].filter((s) => !mine.has(s)).sort();
    }
  });
  const all = new Set(ROOTS.flatMap((r) => [...suffixes(r)]));
  out.distinctSuffixes = all.size;
  fs.mkdirSync(path.join(root, 'content-sites/lh-discover'), { recursive: true });
  fs.writeFileSync(path.join(root, 'content-sites/lh-discover/scope.json'), `${JSON.stringify(out, null, 1)}\n`);
  ROOTS.forEach((r) => {
    const x = out.roots[r];
    const lo = Object.entries(x.leftOut).map(([k, v]) => `${k} ${v.length}`).join('; ');
    console.log(`${r}: ${x.urls} URLs, ${x.keep} kept${lo ? ` (left out: ${lo})` : ''}${x.own ? `; own ${x.own.length}: ${x.own.join(' ')}; missing from the language version's ${x.missing.length}` : ''}`);
  });
  console.log(`distinct page paths (without /<cc>/<ll>): ${all.size}; total URLs ${ROOTS.reduce((s, r) => s + out.roots[r].urls, 0)}`);
}
