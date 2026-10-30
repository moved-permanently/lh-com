/* eslint-disable no-console, max-len, import/prefer-default-export, import/extensions -- tooling */
/**
 * ITA Airways' site (lh-ita): www.ita-airways.com's sitemap (the index /sitemap/sitemap_ita.xml.gz
 * and its market files, recorded with bd-fetch.mjs into tools/source-export/bundles) into the
 * scope of lh-ita, as discover-scope.mjs does for lh-discover:
 * - pages by root (/<cc>/<ll>), from the URLs' own paths; prod-www.ita-airways.com (five xx
 *   files write it) counts as www;
 * - left out by rule: AirCore (/aircore/, ITA's second sitemap, never read), login and profile app
 *   shells, /configuration/, feedbackai, descoped-local-page, drafts, error pages, templates, test
 *   and deactivated pages;
 * - the language documents: every page of the language's reference root (LANGUAGE_VERSIONS); a
 *   market root's page with the same path is that document's `markets` entry; a market root's own
 *   pages (a path its reference root lacks) are listed;
 * - the nav and footer targets of each reference root (from its captured homepage, ita-nav.mjs
 *   navTargets) that the sitemap misses: added to the root's pages (e.g. it/en /legal/imprint).
 * Writes content-sites/lh-ita/scope.json (gitignored: content-sites/) and prints the numbers.
 *
 * Usage: node tools/importer/ita-scope.mjs [--bundles bd-2026-10-30T...ndjson ...]
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { navTargets } from './ita-nav.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const HOST = 'www.ita-airways.com';
// the reference root of each language: its pages are the language documents
export const LANGUAGE_VERSIONS = {
  en: 'it/en', it: 'it/it', fr: 'fr/fr', es: 'es/es', de: 'de/de', nl: 'nl/nl', pt: 'br/pt', el: 'gr/el', ja: 'jp/ja',
};
export const REFERENCE_ROOTS = Object.values(LANGUAGE_VERSIONS);
const SNAP = path.join(root, 'tools/importer/bd-snapshots', HOST);

/** Why a page path is left out, or ''. */
export function leftOut(p) {
  if (/^\/aircore(\/|$)/.test(p)) return 'AirCore';
  if (!/^\/[a-z]{2}\/[a-z]{2}(\/|$)/.test(p)) return 'no market root';
  const rest = p.replace(/^\/[a-z]{2}\/[a-z]{2}/, '');
  if (/^\/(login|profile)(\/|$)/i.test(rest)) return 'login or profile app shell';
  // the login page in the other languages (www's hreflang group of /profile/login: the login widget)
  if (/^\/(iscrizione|connexion|inicio-de-sesion|registo)$/i.test(rest)) return 'login or profile app shell';
  if (/(^|\/)configuration(\/|$)/i.test(rest)) return 'configuration page';
  if (/feedbackai/i.test(rest)) return 'feedbackai questionnaire';
  if (/descoped-local-page/i.test(rest)) return 'descoped-local-page';
  if (/(^|\/)drafts?(\/|$)/i.test(rest)) return 'draft';
  if (/(^|\/)(error|404|500|errorpage|error-page)[^/]*$/i.test(rest)) return 'error page';
  if (/templates|(^|[/_-])test([/_-]|$)|_deact/i.test(rest)) return 'template, test or deactivated';
  // the homepage's irregularity teaser is a fragment the sitemap lists (no page body)
  if (/^\/homepage\/teasers(\/|$)/.test(rest)) return 'homepage teaser fragment';
  // www answers 403 every time on these (a rule on the paths, not a rate limit)
  if (/^\/it\/it\/local-page\/(ministero-interno-amministrazione-centrale|ministero-istruzione-merito)$/.test(p)) return 'answers 403 every time';
  return '';
}

/** A sitemap URL's page path (www and prod-www alike), without .html and a trailing slash. */
export const pagePath = (u) => {
  const url = new URL(u.trim().replace(/&amp;/g, '&'));
  if (!/^(www|prod-www)\.ita-airways\.com$/.test(url.hostname)) return null;
  return decodeURIComponent(url.pathname).replace(/\.html$/, '').replace(/\/$/, '') || '/';
};

const bundleFiles = () => {
  const dir = path.join(root, 'tools/source-export/bundles');
  return fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.startsWith('bd-')).map((f) => path.join(dir, f)) : [];
};

/** The recorded ITA sitemap files: {file url: [loc]} (the newest answer of each file). */
export function recordedSitemaps(files = bundleFiles()) {
  const byFile = new Map();
  files.forEach((f) => fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean)
    .forEach((line) => {
      const l = JSON.parse(line);
      if (!/ita-airways\.com\/sitemap\/[^/]+\.xml(\.gz)?$/.test(l.url) || l.status !== 200) return;
      const b = l.base64 ? Buffer.from(l.text, 'base64') : Buffer.from(l.text || '');
      const xml = (b[0] === 0x1f && b[1] === 0x8b ? zlib.gunzipSync(b) : b).toString('utf8');
      byFile.set(l.url, xml);
    }));
  return Object.fromEntries([...byFile].map(([u, xml]) => [u, [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((x) => x[1])]));
}

/** The page lists of the index's market files (the index itself and AirCore left out). */
export function sitemapPages(maps) {
  const pages = new Set();
  const prodWww = new Set();
  Object.entries(maps).forEach(([file, locs]) => {
    if (/sitemap_ita\.xml(\.gz)?$/.test(file)) return; // the index: its <loc>s are the files
    locs.forEach((u) => {
      const p = pagePath(u);
      if (!p) return;
      if (/\/\/prod-www\./.test(u)) prodWww.add(file);
      pages.add(p);
    });
  });
  return { pages: [...pages], prodWww: [...prodWww] };
}

/**
 * The scope from the sitemap's page paths: per root its kept suffixes (the path without /<cc>/<ll>)
 * and the left-out ones by reason, per reference root its documents with their markets, per
 * market root its own pages.
 */
export function buildScope(paths, extra = {}) {
  const roots = {};
  paths.forEach((p) => {
    const why = leftOut(p);
    const r = (p.match(/^\/([a-z]{2}\/[a-z]{2})(?=\/|$)/) || [])[1] || '-';
    roots[r] ||= { keep: new Set(), leftOut: {} };
    if (why) (roots[r].leftOut[why] ||= []).push(p); else roots[r].keep.add(p.slice(r.length + 1) || '/homepage');
  });
  // nav and footer targets the sitemap misses (only pages of the root itself)
  const added = {};
  Object.entries(extra).forEach(([r, list]) => {
    roots[r] ||= { keep: new Set(), leftOut: {} };
    list.forEach((p) => {
      if (leftOut(p) || !p.startsWith(`/${r}/`)) return;
      const s = p.slice(r.length + 1);
      if (!roots[r].keep.has(s)) { roots[r].keep.add(s); (added[r] ||= []).push(s); }
    });
  });
  const out = { roots: {}, documents: {}, added };
  Object.entries(roots).sort().forEach(([r, x]) => {
    const lang = r.split('/')[1];
    const version = LANGUAGE_VERSIONS[lang];
    out.roots[r] = {
      keep: x.keep.size,
      leftOut: Object.fromEntries(Object.entries(x.leftOut).map(([k, v]) => [k, v.length])),
      version: version || null,
      suffixes: [...x.keep].sort(),
    };
  });
  // the language documents: the reference root's pages, with the market roots that have them
  REFERENCE_ROOTS.forEach((ref) => {
    const lang = ref.split('/')[1];
    (out.roots[ref]?.suffixes || []).forEach((s) => {
      const markets = Object.keys(out.roots).filter((r) => r !== ref && r.split('/')[1] === lang && out.roots[r].suffixes.includes(s));
      out.documents[`/${ref}${s}`] = { markets };
    });
  });
  Object.entries(out.roots).forEach(([r, x]) => {
    if (!x.version || x.version === r) return;
    const v = new Set(out.roots[x.version]?.suffixes || []);
    x.own = x.suffixes.filter((s) => !v.has(s));
  });
  return out;
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const bundles = argv.flatMap((a, i) => (a === '--bundles' ? [path.resolve(root, 'tools/source-export/bundles', argv[i + 1])] : []));
  const maps = recordedSitemaps(bundles.length ? bundles : undefined);
  const { pages, prodWww } = sitemapPages(maps);
  // the nav and footer targets of each reference root's captured homepage
  const extra = {};
  const noHomepage = [];
  REFERENCE_ROOTS.forEach((r) => {
    const f = path.join(SNAP, r, 'homepage.html');
    if (!fs.existsSync(f)) { noHomepage.push(r); return; }
    extra[r] = navTargets(fs.readFileSync(f, 'utf8'));
  });
  const scope = buildScope(pages, extra);
  const out = {
    recorded: new Date().toISOString(), files: Object.keys(maps).length, prodWww, noHomepage, ...scope,
  };
  fs.mkdirSync(path.join(root, 'content-sites/lh-ita'), { recursive: true });
  fs.writeFileSync(path.join(root, 'content-sites/lh-ita/scope.json'), `${JSON.stringify(out, null, 1)}\n`);
  console.log(`${Object.keys(maps).length} sitemap files (prod-www host in ${prodWww.length}), ${pages.length} page URLs`);
  Object.entries(out.roots).forEach(([r, x]) => {
    const lo = Object.entries(x.leftOut).map(([k, v]) => `${k} ${v}`).join('; ');
    console.log(`${r}: ${x.keep} kept${lo ? ` (left out: ${lo})` : ''}${x.own ? `; own ${x.own.length}` : ''}${out.added[r] ? `; nav/footer targets added ${out.added[r].length}: ${out.added[r].join(' ')}` : ''}`);
  });
  console.log(`language documents: ${Object.keys(out.documents).length}; reference roots without a captured homepage (no nav/footer targets yet): ${noHomepage.join(' ') || 'none'}`);
}
