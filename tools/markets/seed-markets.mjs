/* eslint-disable no-console, max-len, no-await-in-loop, no-restricted-syntax, no-continue, import/extensions -- dev tooling */
/**
 * Seeds the page metadata field `markets` once, from www's sitemap dataset
 * (tools/source-export/feeds/sitemaps): a page of a language version (de/en, de/de) that most
 * market roots of its language don't have on www (mostly Germany-only pages) gets an include list
 * of the countries whose root has it (`de` first, then a-z), e.g. `de, at`. lh-edge's market
 * route serves a language page for a market root only when `markets` allows that country (empty:
 * every market of the language). From then on authors keep the field in DA (AUTHORING.md).
 *
 * "Has it": the root's sitemap lists the page in the page's group (another slug counts), or the
 * page is in the root's market-only list. A page the dataset doesn't know (no www URL) is left
 * alone and listed. A page that already has a `markets` row is left alone.
 *
 * Dry run by default: the counts and every page with its value (--out writes them as JSON).
 * --apply: per page a labelled DA version ("before seed-markets <date>"), the row added to the
 * local document (content/<path>.plain.html, the copy the preview renders), upload and preview
 * with tools/importer/da-upload.mjs, then a read-back from DA that must hold the row and lose no
 * heading, paragraph, image or block of the DA copy from before (tools/loc/review-lib.mjs). A
 * page whose DA copy holds content the local document lacks is not written (listed). Preview
 * only, never publishes.
 * Usage: node tools/markets/seed-markets.mjs [--lang en|de] [--out file.json] [--apply [--limit n]]
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { LOCALE_TABLE, LANGUAGE_VERSIONS } from '../../scripts/locale-table.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DATA = path.join(root, 'tools/source-export/feeds/sitemaps');

/** The paths the language index lists (helix-query.yaml search-<cc>-<ll>): no nav, footer, fragments … */
export const isIndexedPath = (p, langRoot) => p.startsWith(`/${langRoot}/`)
  && !new RegExp(`^/${langRoot}/(nav|footer)$|^/${langRoot}/(fragments|drafts|articles/config|support/search)/|/(confirmation|[^/]*-confirmation)$`).test(p);

/** The value of the field for a list of countries: `de` (the language version's) first, then a-z. */
export const marketsValue = (countries, own) => [...new Set(countries)]
  .sort((a, b) => (a === own ? -1 : 0) - (b === own ? -1 : 0) || a.localeCompare(b)).join(', ');

/**
 * The seed: {markets: n, pages: [{path, value, have, of}], unknown: [paths], kept: [paths]}.
 * pages: the language version's documents (paths); roots, groups, marketOnly: the dataset.
 * existing(path) -> the page's current `markets` value or ''.
 */
export function seed({
  langRoot, pages, roots, groups, marketOnly, existing = () => '',
}) {
  const [own, lang] = langRoot.split('/');
  const markets = roots.filter((r) => r.ll === lang && r.ownSitemap && r.root !== langRoot).map((r) => r.root);
  const marketSet = new Set(markets);
  const byPath = new Map();
  groups.forEach((g) => { if (g.paths[langRoot]) byPath.set(g.paths[langRoot], g); });
  const only = new Set((marketOnly[langRoot] || []).map(([p]) => p));
  const out = {
    markets: markets.length, pages: [], unknown: [], kept: [],
  };
  pages.forEach((p) => {
    if (!isIndexedPath(p, langRoot)) return;
    const g = byPath.get(p);
    let have;
    if (g) have = Object.keys(g.paths).filter((k) => marketSet.has(k));
    else if (only.has(p)) have = [];
    else { out.unknown.push(p); return; }
    if (have.length * 2 >= markets.length) return;
    if (existing(p)) { out.kept.push(p); return; }
    out.pages.push({
      path: p, value: marketsValue([own, ...have.map((k) => k.split('/')[0])], own), have: have.length, of: markets.length,
    });
  });
  return out;
}

/** The document with a `markets` row in its metadata block (added at the end), or null without one. */
export function withMarketsRow(html, value) {
  const i = html.indexOf('<div class="metadata">');
  if (i < 0) return null;
  // the metadata block's end: its own </div> after the rows
  let depth = 0;
  const re = /<div\b[^>]*>|<\/div>/g;
  re.lastIndex = i;
  let m = re.exec(html);
  while (m) {
    depth += m[0] === '</div>' ? -1 : 1;
    if (depth === 0) break;
    m = re.exec(html);
  }
  if (!m) return null;
  const row = `<div><div>Markets</div><div>${value}</div></div>`;
  return `${html.slice(0, m.index)}${row}${html.slice(m.index)}`;
}

/** The current `markets` value of a document ('' without one). */
export function marketsOf(html) {
  const m = String(html).match(/<div><div>(?:<p>)?Markets(?:<\/p>)?<\/div><div>(?:<p>)?([^<]*)(?:<\/p>)?<\/div><\/div>/i);
  return m ? m[1].trim() : '';
}

function localPages(langRoot) {
  const dir = path.join(root, 'content', langRoot);
  const out = [];
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f);
    else if (e.name.endsWith('.plain.html')) out.push(`/${path.relative(path.join(root, 'content'), f).replace(/\.plain\.html$/, '')}`);
  });
  walk(dir);
  return out.sort();
}

async function apply(list, { today, limit }) {
  const { daClient } = await import('../loc/slug-step.mjs');
  const { missingItems } = await import('../loc/review-lib.mjs');
  const da = daClient();
  const results = [];
  for (const { path: p, value } of list.slice(0, limit || list.length)) {
    const file = path.join(root, 'content', `${p}.plain.html`);
    const local = fs.readFileSync(file, 'utf8');
    const before = await da.get(p);
    if (!before) { results.push({ path: p, status: 'not in DA' }); continue; }
    if (marketsOf(before)) { results.push({ path: p, status: `DA already has markets ${marketsOf(before)}` }); continue; }
    const next = withMarketsRow(local, value);
    if (!next) { results.push({ path: p, status: 'no metadata block' }); continue; }
    // the DA copy must not hold content the local document lacks (an author edit would be lost)
    const lost = missingItems(before, `<body><main>${next}</main></body>`);
    if (lost.length) { results.push({ path: p, status: `DA holds ${lost.length} items the local copy lacks: not written`, lost: lost.slice(0, 3) }); continue; }
    await da.version(p, `before seed-markets ${today}`);
    fs.writeFileSync(file, next);
    const out = execFileSync('node', [path.join(root, 'tools/importer/da-upload.mjs'), '--path', p], { encoding: 'utf8' });
    const back = await da.get(p);
    const missing = back ? missingItems(before, back) : ['no read-back'];
    const ok = back && marketsOf(back) === value && !missing.length && /1 uploaded, 1 previewed, 0 problems/.test(out);
    results.push({ path: p, status: ok ? 'written, previewed' : `CHECK: ${out.trim().split('\n').pop()}; markets ${back ? marketsOf(back) : '-'}; ${missing.length} missing` });
    console.log(`${ok ? 'ok   ' : 'CHECK'} ${p}: markets ${value}`);
  }
  return results;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const argv = process.argv.slice(2);
  const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
  const langs = opt('lang') ? [opt('lang')] : Object.keys(LANGUAGE_VERSIONS);
  const { roots } = JSON.parse(fs.readFileSync(path.join(DATA, 'roots.json'), 'utf8'));
  const { groups } = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(DATA, 'groups.json.gz'))));
  const marketOnly = JSON.parse(fs.readFileSync(path.join(DATA, 'market-only.json'), 'utf8')).roots;
  const report = {};
  for (const lang of langs) {
    const langRoot = LANGUAGE_VERSIONS[lang];
    if (!LOCALE_TABLE[langRoot]) throw new Error(`${lang}: no language version`);
    const r = seed({
      langRoot, pages: localPages(langRoot), roots, groups, marketOnly, existing: (p) => marketsOf(fs.readFileSync(path.join(root, 'content', `${p}.plain.html`), 'utf8')),
    });
    report[langRoot] = r;
    const ch = r.pages.filter((x) => !x.value.split(', ').includes('ch')).length;
    console.log(`${langRoot}: ${r.markets} market roots of the language; ${r.pages.length} pages get markets (${ch} of them without ch), ${r.kept.length} already set, ${r.unknown.length} unknown to www's dataset (left alone)`);
    if (argv.includes('--apply')) {
      r.results = await apply(r.pages, { today: new Date().toISOString().slice(0, 10), limit: Number(opt('limit')) || 0 });
      const bad = r.results.filter((x) => x.status !== 'written, previewed');
      console.log(`${langRoot}: ${r.results.length - bad.length} written and previewed, ${bad.length} not`);
      bad.forEach((x) => console.log(`  ${x.path}: ${x.status}`));
    }
  }
  if (opt('out')) fs.writeFileSync(opt('out'), `${JSON.stringify(report, null, 1)}\n`);
  if (!argv.includes('--apply')) console.log('seed-markets: dry run (add --apply to write)');
}
