/* eslint-disable no-console, max-len, import/no-extraneous-dependencies, import/no-relative-packages -- dev tooling; js-yaml is a dev dependency, the columns are lh-edge's */
/**
 * The lean query indexes of lh-edge's market model (src/market-lean.js) in helix-query.yaml:
 * per root with its own index (search-<cc>-<ll>) and for the market roots' own pages
 * (market-pages), the same include and exclude (so their totals match the full indexes', which
 * lh-edge checks before it uses one) and only the columns it reads:
 * - market-model-*: markets, robots, primary-language-url, lastModified (the market route,
 *   hreflang, sitemaps);
 * - market-llms-*: title, description, markets and the llms columns (llms.txt).
 * The property definitions are copied from the full index, so the values are the same.
 *
 * Usage: node tools/markets/lean-indexes.mjs           (dry run: prints the definitions)
 *        node tools/markets/lean-indexes.mjs --apply   (appends the missing ones to helix-query.yaml)
 *        node tools/markets/lean-indexes.mjs --check   (exit 1 when they differ from the full indexes)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';
import { MODEL_COLUMNS, LLMS_COLUMNS } from '../workers/lh-edge/src/market-lean.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const FILE = path.join(root, 'helix-query.yaml');
export const ROOTS = ['de/en', 'de/de', 'at/de', 'gb/en'];
// the columns lh-edge reads, kept in its module (its tests run without this tool's dependencies)
export { MODEL_COLUMNS, LLMS_COLUMNS };

const name = (kind, r) => `market-${kind}-${r ? r.replace('/', '-') : 'own'}`;
const target = (kind, r) => `/market-${kind}/${r ? r.replace('/', '-') : 'own'}.json`;

/** The lean definitions from the full ones: {name: definition}. */
export function leanDefinitions(indices) {
  const out = {};
  [...ROOTS, null].forEach((r) => {
    const full = indices[r ? `search-${r.replace('/', '-')}` : 'market-pages'];
    if (!full) throw new Error(`no full index for ${r || 'market pages'}`);
    [['model', MODEL_COLUMNS], ['llms', LLMS_COLUMNS]].forEach(([kind, cols]) => {
      const properties = {};
      cols.forEach((c) => {
        // the language versions have markets; at/de, gb/en and market-pages define it as de/en does
        const def = full.properties[c] || indices['search-de-en'].properties[c];
        if (!def) throw new Error(`${c}: no definition`);
        properties[c] = def;
      });
      out[name(kind, r)] = {
        include: full.include, ...(full.exclude ? { exclude: full.exclude } : {}), target: target(kind, r), properties,
      };
    });
  });
  return out;
}

const text = (defs) => yaml.dump({ indices: defs }, { lineWidth: 200, noRefs: true, quotingType: '"' })
  .split('\n').slice(1).join('\n');

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const source = fs.readFileSync(FILE, 'utf8');
  const { indices } = yaml.load(source);
  const defs = leanDefinitions(indices);
  const missing = Object.fromEntries(Object.entries(defs).filter(([k]) => !indices[k]));
  if (process.argv.includes('--check')) {
    const differ = Object.keys(defs).filter((k) => JSON.stringify(indices[k]) !== JSON.stringify(defs[k]));
    console.log(differ.length ? `differ or missing: ${differ.join(', ')}` : `${Object.keys(defs).length} lean indexes as the full ones`);
    process.exit(differ.length ? 1 : 0);
  }
  const block = `
  # Market model (lh-edge src/market-lean.js, tools/markets/lean-indexes.mjs): the columns
  # lh-edge's market route, hreflang, sitemaps (market-model-*) and llms.txt (market-llms-*) read,
  # without the search columns: the search indexes are 4 to 5 MB, too much to read per request on
  # Workers Free (10 ms of CPU). Same include and exclude as search-<cc>-<ll> and market-pages (lh-edge uses a
  # lean index only while its total equals the full index's); the definitions are the full ones'.
${text(missing)}`;
  if (!Object.keys(missing).length) {
    console.log('helix-query.yaml has every lean index');
  } else if (process.argv.includes('--apply')) {
    fs.writeFileSync(FILE, `${source.replace(/\n*$/, '\n')}${block.replace(/\n*$/, '\n')}`);
    console.log(`helix-query.yaml: ${Object.keys(missing).length} lean indexes added: ${Object.keys(missing).join(', ')}`);
  } else {
    console.log(block);
  }
}
