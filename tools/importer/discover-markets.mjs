/* eslint-disable no-console, max-len, import/extensions -- tooling */
/**
 * lh-discover's markets rows against www: a language document (de/en, de/de, xx/fr) is answered
 * on the market roots of its language that its `markets` metadata allows (lh-edge's market route,
 * scripts/market-rules.js; no row: all of them). www's sitemaps (tools/importer/discover-scope.mjs
 * recordedSitemaps) say which roots have the page. Lists every document whose roots differ, with
 * the row www's roots give (countries, the language version's own included, as the existing rows:
 * "de, ca"), and the documents in no sitemap (form thank-you and error pages: discover-import.mjs
 * THANK_YOU_404 / ERROR_404 hold www's answers for those).
 *
 * Usage: node tools/importer/discover-markets.mjs [--json]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { recordedSitemaps, ROOTS, LANGUAGE_VERSIONS } from './discover-scope.mjs';
import { marketAllows } from '../../scripts/market-rules.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** The page suffixes of the sitemaps: suffix -> Set of roots. */
export function listedRoots(sitemaps) {
  const listed = new Map();
  Object.entries(sitemaps).forEach(([key, urls]) => urls.forEach((u) => {
    const p = new URL(u).pathname.replace(/\.html$/, '').replace(/\/$/, '');
    const suffix = p.slice(key.length + 1);
    if (!listed.has(suffix)) listed.set(suffix, new Set());
    listed.get(suffix).add(key);
  }));
  return listed;
}

/**
 * The documents whose served roots differ from www's: [{doc, markets, www, served, want}]
 * (docs: [{version, suffix, markets}], markets null without a row), and those in no sitemap.
 */
export function marketsGaps(docs, listed, roots = ROOTS) {
  const gaps = [];
  const unlisted = [];
  docs.forEach(({ version, suffix, markets }) => {
    const lang = version.split('/')[1];
    const ofLang = roots.filter((r) => r.endsWith(`/${lang}`));
    const www = ofLang.filter((r) => listed.get(suffix)?.has(r));
    const served = ofLang.filter((r) => r === version || marketAllows(markets || '', r.split('/')[0]));
    const doc = `/${version}${suffix}`;
    if (!www.length) unlisted.push({ doc, markets, served });
    else if (served.join() !== www.join()) {
      gaps.push({
        doc, markets, www, served, want: [...new Set(www.map((r) => r.split('/')[0]))].join(', '),
      });
    }
  });
  return { gaps, unlisted };
}

/** lh-discover's language documents with their markets rows (not nav, footer, fragments). */
export function languageDocs(content = path.join(root, 'content-sites/lh-discover/content')) {
  const walk = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])) : []);
  return Object.values(LANGUAGE_VERSIONS).flatMap((version) => walk(path.join(content, version))
    .filter((f) => f.endsWith('.plain.html'))
    .map((f) => ({ f, suffix: `/${path.relative(path.join(content, version), f).replace(/\.plain\.html$/, '')}` }))
    .filter(({ suffix }) => !/^\/(nav|footer)$|\/fragments\//.test(suffix))
    .map(({ f, suffix }) => ({
      version, suffix, markets: (fs.readFileSync(f, 'utf8').match(/<div>Markets<\/div><div>([^<]*)<\/div>/i) || [])[1] ?? null,
    })));
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const { gaps, unlisted } = marketsGaps(languageDocs(), listedRoots(recordedSitemaps()));
  if (process.argv.includes('--json')) console.log(JSON.stringify({ gaps, unlisted }, null, 1));
  else {
    gaps.forEach((g) => console.log(`${g.doc}: markets ${g.markets ?? '(none)'}, served ${g.served.join(' ')}; www ${g.www.join(' ')}: markets ${g.want}`));
    console.log(`${gaps.length} documents differ from www's sitemaps; ${unlisted.length} in no sitemap (--json lists them)`);
  }
}
