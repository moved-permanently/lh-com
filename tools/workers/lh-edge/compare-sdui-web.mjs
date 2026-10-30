/* eslint-disable no-console, max-len, no-await-in-loop, no-restricted-syntax, import/extensions -- dev tooling */
/**
 * Web pages as SDUI (brief 78 part 2) against www's recordings
 * (tools/source-export/feeds/ams-rest/sdui-web/: an article and a FAQ content page, four spellings
 * each): status, cache-control and the JSON, normalised as sdui-web-diff.mjs describes; the parts
 * the replica's blocks don't have are listed there (MISSING). Also checks that the short spelling
 * answers HTML and a multiwidth page 404.
 * Usage: node tools/workers/lh-edge/compare-sdui-web.mjs [--host https://lufthansa-edge.turnsthe.page | --local]
 *   --local: the worker in Node against the live origin (before a deploy)
 * Report: tools/reports/lh-edge/compare-sdui-web.md
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compareAnswer, MISSING } from './sdui-web-diff.mjs';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '../../..');
const FIX = path.join(root, 'tools/source-export/feeds/ams-rest/sdui-web');
const argv = process.argv.slice(2);
const local = argv.includes('--local');
const HOST = (argv.includes('--host') ? argv[argv.indexOf('--host') + 1] : 'https://lufthansa-edge.turnsthe.page').replace(/\/$/, '');
const PAGES = {
  '7people': '/content/lh/markets/de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history',
  'faq-refund': '/content/lh/markets/de/en/support/faq/faq-refund',
};
const SPELLINGS = ['.sdui', '.ios.sdui', '.v2.sdui', '.nocache.v2.sdui'];

let get = (u) => fetch(`${HOST}${u}`, { cache: 'no-store', redirect: 'manual' });
if (local) {
  const { default: worker } = await import('./src/index.js');
  const env = { ORIGIN: 'main--lh-com--moved-permanently.aem.live', PUBLIC_HOST: 'lh-edge.local', EDGE_TTL: '60' };
  get = (u) => worker.fetch(new Request(`https://lh-edge.local${u}`), env, {});
}

const lines = [];
let equal = 0;
let total = 0;
for (const [name, full] of Object.entries(PAGES)) {
  for (const sp of SPELLINGS) {
    total += 1;
    const www = JSON.parse(fs.readFileSync(path.join(FIX, `sdui-web-${name}${sp}.json`), 'utf8'));
    const resp = await get(`${full}${sp}`);
    const cc = resp.headers.get('cache-control');
    const wantCc = sp.includes('nocache') ? 'max-age=600' : null;
    if (resp.status !== 200) {
      lines.push(`- ${name}${sp}: ${resp.status}${MISSING[name] ? ` — ${MISSING[name]}` : ''}`);
      continue; // eslint-disable-line no-continue
    }
    const { differences, picks, counts } = compareAnswer(www, await resp.json());
    const ok = !differences.length && cc === wantCc;
    if (ok) equal += 1;
    lines.push(`- ${name}${sp}: ${ok ? 'equal' : `${differences.length} differences`} (cache-control ${cc || 'none'}${cc === wantCc ? '' : `, www ${wantCc || 'none'}`}); normalised: ${Object.entries(counts).map(([k, n]) => `${k} ${n}`).join(', ')}`);
    if (picks) lines.push(`  - related article picks: www ${JSON.stringify(picks.www)}, replica ${JSON.stringify(picks.edge)}`);
    differences.slice(0, 8).forEach((d) => lines.push(`  - ${d.kind} ${d.path}: www ${JSON.stringify(d.www)?.slice(0, 120)} / replica ${JSON.stringify(d.edge)?.slice(0, 120)}`));
  }
}
const short = await get('/de/en/articles/explore-flying/7-people-who-shaped-lufthansa-history.v2.sdui');
lines.push(`- short spelling /de/en/…/7-people-who-shaped-lufthansa-history.v2.sdui: ${short.status} ${short.headers.get('content-type')}`);
const multi = await get('/content/lh/markets/de/en/baggage.v2.sdui');
lines.push(`- multiwidth page /content/lh/markets/de/en/baggage.v2.sdui: ${multi.status}`);
const home = await get('/content/lh/markets/de/en/homepage.sdui');
lines.push(`- homepage /content/lh/markets/de/en/homepage.sdui: ${home.status}`);

const head = `${equal}/${total} recorded web answers equal (deliberate differences aside, sdui-web-diff.mjs)`;
console.log([head, ...lines].join('\n'));
fs.writeFileSync(path.join(root, 'tools/reports/lh-edge/compare-sdui-web.md'), `# Web pages as SDUI: ${local ? 'the worker in Node (live origin)' : HOST} vs www\n\n${new Date().toISOString()}\n\n${head}.\n\n${lines.join('\n')}\n`);
