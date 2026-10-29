/* eslint-disable no-console, no-await-in-loop, no-restricted-syntax, max-len -- dev tooling */
/**
 * Builds the sitemap index ahead (src/sitemap-index.js) for every host of wrangler.toml that
 * serves market roots (PILOT_HOSTS, PILOT_COUNTRIES_BY_HOST), with lh-edge's own code and vars,
 * from the origin: sitemap-index/<key>.xml and <key>.gz.bin per distinct index, and README.md, in
 * a directory (the content of the branch `sitemap-index`). Run by
 * .github/workflows/sitemap-index.yaml; the workflow commits the directory only when it differs.
 *
 * Usage: node tools/workers/lh-edge/build-sitemap-index.mjs --out <dir>
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import {
  servedMarketRoots, sitemapIndexSources, sitemapIndexOf,
} from './src/markets.js';
import { sitemapIndexKey, storedNames } from './src/sitemap-index.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const out = argv.includes('--out') ? argv[argv.indexOf('--out') + 1] : null;
if (!out) {
  console.error('--out <dir> is required');
  process.exit(2);
}

/** wrangler.toml's [vars] (one `NAME = "value"` per line). */
function wranglerVars(text) {
  const vars = {};
  let inVars = false;
  text.split('\n').forEach((line) => {
    if (/^\s*\[/.test(line)) inVars = /^\s*\[vars\]\s*$/.test(line);
    const m = inVars && line.match(/^([A-Z][A-Z0-9_]*)\s*=\s*"((?:[^"\\]|\\.)*)"/);
    if (m) vars[m[1]] = m[2].replace(/\\(.)/g, '$1');
  });
  return vars;
}

const env = wranglerVars(fs.readFileSync(path.join(here, 'wrangler.toml'), 'utf8'));
const list = (v) => String(v || '').split(/[\s,;]+/).map((h) => h.split('=')[0].trim()).filter(Boolean);
const hosts = [...new Set([...list(env.PILOT_HOSTS), ...list(env.PILOT_COUNTRIES_BY_HOST)])];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(path.join(out, 'sitemap-index'), { recursive: true });
const built = new Map();
// hosts without market roots (the China hosts today) answer the static index: nothing to store
const serving = hosts.map((host) => [host, servedMarketRoots(new Request(`https://${host}/sitemap/sitemap_lh.xml`), env)])
  .filter(([, roots]) => roots.length);
for (const [host, roots] of serving) {
  const request = new Request(`https://${host}/sitemap/sitemap_lh.xml`);
  const sources = await sitemapIndexSources(request, env, roots);
  if (!sources) throw new Error(`${host}: no static index on the origin`);
  const key = await sitemapIndexKey(sources, env, roots);
  if (!built.has(key)) {
    const xml = sitemapIndexOf(sources, env);
    const names = storedNames(key);
    fs.writeFileSync(path.join(out, 'sitemap-index', names.xml), xml);
    fs.writeFileSync(path.join(out, 'sitemap-index', names.gz), zlib.gzipSync(xml));
    built.set(key, {
      hosts: [], roots: roots.length, files: sources.names.flat().length, bytes: Buffer.byteLength(xml),
    });
  }
  built.get(key).hosts.push(host);
}
const lines = [...built].map(([key, b]) => `- \`${key}\`: ${b.hosts.join(', ')}; ${b.roots} roots, ${b.files} market files, ${b.bytes} bytes`);
fs.writeFileSync(path.join(out, 'README.md'), `# sitemap-index

Generated, do not edit. lh-edge's sitemap index (\`/sitemap/sitemap_lh.xml\` and \`.xml.gz\`) built ahead
(\`tools/workers/lh-edge/src/sitemap-index.js\` on main), per distinct index of the hosts that serve market roots,
under the key of what it is made of; lh-edge serves a file while its key is the one it works out.
Built by \`tools/workers/lh-edge/build-sitemap-index.mjs\` from the origin ${env.ORIGIN}.

${lines.join('\n')}
`);
console.log(lines.join('\n'));
