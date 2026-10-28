/* eslint-disable no-console, max-len, no-await-in-loop, no-restricted-syntax, import/no-relative-packages -- dev tooling; the columns are lh-edge's */
/**
 * Whether lh-edge can use the lean indexes (src/market-lean.js): per lean index its total
 * against the full index it mirrors (lh-edge uses it only while they are equal), on a host.
 * --paths <file>: writes the paths to reindex (every row of the full indexes) for the lean
 * indexes to fill.
 *
 * Usage: node tools/markets/check-lean-indexes.mjs [--host https://main--lh-com--moved-permanently.aem.live] [--paths file]
 */
import fs from 'node:fs';
import { leanModelPath, leanLlmsPath } from '../workers/lh-edge/src/market-lean.js';

const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const host = opt('host', 'https://main--lh-com--moved-permanently.aem.live');
const ROOTS = ['de/en', 'de/de', 'at/de', 'gb/en'];
const total = async (p) => {
  const r = await fetch(`${host}${p}?limit=1&offset=1000000`);
  return r.ok ? (await r.json()).total : `HTTP ${r.status}`;
};
let ready = true;
const paths = [];
for (const r of [...ROOTS, null]) {
  const full = r ? `/${r}/search-index.json` : '/market-pages.json';
  const want = await total(full);
  for (const lean of [leanModelPath(r), leanLlmsPath(r)]) {
    const have = await total(lean);
    const ok = have === want;
    ready &&= ok;
    console.log(`${ok ? 'ok     ' : 'not yet'} ${lean}: ${have} rows, ${full}: ${want}`);
  }
  if (opt('paths')) {
    const rows = (await (await fetch(`${host}${full}?limit=10000`)).json()).data || [];
    rows.forEach((x) => paths.push(x.path));
  }
}
if (opt('paths')) {
  fs.writeFileSync(opt('paths'), `${[...new Set(paths)].sort().join('\n')}\n`);
  console.log(`${new Set(paths).size} paths -> ${opt('paths')}`);
}
console.log(ready ? 'lean indexes complete: lh-edge reads them' : 'lean indexes not complete: lh-edge reads the full indexes');
process.exit(ready ? 0 : 1);
