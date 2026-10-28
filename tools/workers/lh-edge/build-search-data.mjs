/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, import/no-relative-packages, max-len
   -- dev tooling */
/**
 * Builds the site search's prebuilt data (src/search-data.js) for the four live locales from
 * their search indexes on the origin, into a directory (the content of the branch
 * `search-data`): search-data/<cc>-<ll>/{meta,vocab,p-<k>,t-<k>}.txt and README.md. Run by
 * .github/workflows/search-data.yaml; the workflow commits the directory only when it differs.
 *
 * Usage: node tools/workers/lh-edge/build-search-data.mjs --out <dir> [--origin https://main--lh-com--moved-permanently.aem.live]
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { buildSearchData, SEARCH_DATA_FORMAT } from './src/search-data.js';
import { LIVE_ROOTS } from '../../../scripts/locale.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const out = opt('out');
const origin = opt('origin', 'https://main--lh-com--moved-permanently.aem.live');
if (!out) {
  console.error('--out <dir> is required');
  process.exit(2);
}
// the scoring code the data is built with (src/search-data.js SEARCH_CODE must be the same)
const code = crypto.createHash('sha256').update(fs.readFileSync(path.join(here, '../../../scripts/site-search.js'))).digest('hex').slice(0, 16);

/** Every row of a locale's search index, paged as lh-edge reads it. */
async function rowsOf(locale) {
  const rows = [];
  for (let offset = 0; offset < 50000; offset += 1000) {
    const resp = await fetch(`${origin}/${locale}/search-index.json?limit=1000&offset=${offset}`);
    if (!resp.ok) throw new Error(`${locale}: HTTP ${resp.status}`);
    const sheet = await resp.json();
    const data = Array.isArray(sheet.data) ? sheet.data : [];
    rows.push(...data);
    if (data.length < 1000 || rows.length >= (sheet.total || 0)) break;
  }
  return rows;
}

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'search-data'), { recursive: true });
const summary = [];
for (const locale of LIVE_ROOTS) {
  const rows = await rowsOf(locale);
  const files = buildSearchData(rows, code);
  const dir = path.join(out, 'search-data', locale.replace('/', '-'));
  fs.mkdirSync(dir, { recursive: true });
  Object.entries(files).forEach(([name, text]) => fs.writeFileSync(path.join(dir, name), text));
  const meta = JSON.parse(files['meta.txt']);
  summary.push(`${locale}: ${rows.length} rows, ${meta.docs.length} searchable, ${meta.words} words, ${Object.keys(files).length} files`);
}
fs.writeFileSync(path.join(out, 'README.md'), `# search-data

Generated, do not edit. The site search's prebuilt data for lh-edge (\`tools/workers/lh-edge/src/search-data.js\`
on main): per live locale the searchable pages, their words and where the words stand, and the texts for the
excerpts, built from the locale's search index by \`tools/workers/lh-edge/build-search-data.mjs\`.

Built by the GitHub Action \`.github/workflows/search-data.yaml\` (every 10 minutes, or by hand: Actions,
"Search data", Run workflow); it replaces this branch (one commit) only when the data changed. lh-edge uses
a locale's data only while it matches the live search index; otherwise it reads the index as before.
Format ${SEARCH_DATA_FORMAT}, scoring code ${code}.
`);
console.log(summary.join('\n'));
