/* eslint-disable no-console, max-len, import/extensions -- dev tooling */
/**
 * www's market-neutral pages (brief 267: xx/en, xx/de, the locale table's NEUTRAL_VERSIONS) as
 * documents lh-edge's market route serves to the market roots that show them on www:
 * - `markets` from www's sitemap dataset: the countries whose market root (scripts/locale-table.js,
 *   documents language) has the page in its page group; every one of them: no row (every
 *   market), most of them: an exclude list of the others, else an include list;
 * - links into the neutral root: relative where it has the document, else the language version's
 *   page of the same page group where the replica has it, else on www.
 * Usage: node tools/markets/neutral-docs.mjs --page /xx/en/319 … [--dry]
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { LOCALE_TABLE, LANGUAGE_VERSIONS, NEUTRAL_VERSIONS } from '../../scripts/locale-table.js';
import { withMarketsRow } from './seed-markets.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** The market countries of a language (its market roots in the table), sorted. */
export function marketCountries(lang, table = LOCALE_TABLE) {
  return [...new Set(Object.entries(table).filter(([, r]) => r.lang === lang && r.documents === 'language').map(([, r]) => r.country))].sort();
}

/** The `markets` value of a page shown by `have` of the language's market countries `all`: '' (every one). */
export function neutralMarkets(have, all) {
  const set = new Set(have);
  const shown = all.filter((c) => set.has(c));
  const missing = all.filter((c) => !set.has(c));
  if (!missing.length) return '';
  if (shown.length * 2 >= all.length) return missing.map((c) => `-${c}`).join(', ');
  return shown.join(', ');
}

/**
 * A neutral document's links: into its root relative where `own(path)` has the document, else
 * the language version's page of the group (`version(path)` -> path or null), else on www.
 */
export function neutralLinks(html, neutralRoot, own, version) {
  const prefix = neutralRoot.replace('/', '\\/');
  const re = new RegExp(`href="(?:https://www\\.lufthansa\\.com)?(/${prefix}(?=[/"?#])[^"]*)"`, 'g');
  const counts = { own: 0, version: 0, www: 0 };
  const out = html.replace(re, (m, p) => {
    const [target, tail = ''] = p.replace(/&amp;/g, '&').split(/(?=[?#])/);
    const clean = target.replace(/\/$/, '');
    if (own(clean)) { counts.own += 1; return `href="${p}"`; }
    const v = version(clean);
    if (v) { counts.version += 1; return `href="${v}${tail.replace(/&/g, '&amp;')}"`; }
    counts.www += 1;
    return `href="https://www.lufthansa.com${p}"`;
  });
  return { html: out, counts };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const argv = process.argv.slice(2);
  const pages = argv.flatMap((a, i) => (a === '--page' ? [argv[i + 1]] : []));
  const exists = (p) => fs.existsSync(path.join(root, 'content', `${p}.plain.html`));
  const { groups } = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(root, 'tools/source-export/feeds/sitemaps/groups.json.gz'))).toString('utf8'));
  const flat = (v) => [v || []].flat();
  const groupOf = new Map();
  groups.forEach((g) => Object.values(g.paths).forEach((v) => flat(v).forEach((p) => groupOf.set(p, g))));
  const summary = { every: 0, exclude: 0, include: 0 };
  pages.forEach((page) => {
    const [, cc, ll] = page.split('/');
    const neutralRoot = `${cc}/${ll}`;
    if (!Object.values(NEUTRAL_VERSIONS).includes(neutralRoot)) throw new Error(`${page}: not a neutral version's page`);
    const file = path.join(root, 'content', `${page}.plain.html`);
    let html = fs.readFileSync(file, 'utf8');
    const g = groupOf.get(page);
    const all = marketCountries(ll);
    const have = g ? Object.keys(g.paths).filter((k) => LOCALE_TABLE[k]?.documents === 'language' && LOCALE_TABLE[k].lang === ll).map((k) => LOCALE_TABLE[k].country) : all;
    const value = neutralMarkets(have, all);
    if (value) {
      const next = withMarketsRow(html, value);
      if (next === null) throw new Error(`${page}: no metadata block`);
      html = next;
    }
    let kind = 'include';
    if (!value) kind = 'every';
    else if (value.startsWith('-')) kind = 'exclude';
    summary[kind] += 1;
    const languageVersion = LANGUAGE_VERSIONS[ll];
    const version = (p) => {
      const v = flat(groupOf.get(p)?.paths[languageVersion]).find(exists);
      return v || null;
    };
    const r = neutralLinks(html, neutralRoot, exists, version);
    if (!argv.includes('--dry')) fs.writeFileSync(file, r.html);
    console.log(`${page}: markets "${value}" (${have.length} of ${all.length}); links ${JSON.stringify(r.counts)}`);
  });
  console.log(`neutral-docs: ${pages.length} documents; every market ${summary.every}, exclude lists ${summary.exclude}, include lists ${summary.include}`);
}
