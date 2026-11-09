/* eslint-disable no-console, max-len, no-await-in-loop, no-restricted-syntax, no-continue, import/extensions, import/prefer-default-export -- tooling */
/**
 * Token-free styling, step 4's census (tools/reports/token-free/step4-preconditions.md): the style markers still on a
 * site's pages as Edge Delivery serves them, preview (aem.page) and live (aem.live), read from each page's
 * .plain.html on our own hosts only (main--<site>--moved-permanently.aem.page / .aem.live), one request at a time with
 * a pause. Read-only. Prints per site and environment the pages read, those with markers, and per family
 * (marker-families.mjs) what is left; --out writes the details (every page with markers, its families).
 *
 * The paths: --paths <file>; else the site's sitemap where it has one (lh-com: /sitemap/sitemap_lh.xml and its
 * locale sitemaps on aem.live); else the documents the site's upload state has previewed
 * (tools/importer/da-upload-state[-<site>].json: the brand sites publish no sitemap or index).
 *
 * Usage: node tools/importer/marker-census.mjs --site lh-ita [--site lh-com …] [--env page,live] [--paths file]
 *   [--limit 200] [--pause 250] [--out census.json]
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { countMarkers } from './marker-families.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ORG = 'moved-permanently';
const origin = (site, env) => `https://main--${site}--${ORG}.aem.${env}`;
const pause = (ms) => new Promise((r) => { setTimeout(r, ms); });
// one request, 20 s at most, one retry (a hung request would stop the census)
async function get(url) {
  for (let i = 0; i < 2; i += 1) {
    try { return await fetch(url, { signal: AbortSignal.timeout(20000) }); } catch (e) { await pause(1000); }
  }
  return { ok: false, status: 0 };
}

/** A response's text, gunzipped where a sitemap comes gzipped without saying so. */
async function textOf(res) {
  const buf = Buffer.from(await res.arrayBuffer());
  return (buf[0] === 0x1f && buf[1] === 0x8b ? zlib.gunzipSync(buf) : buf).toString('utf8');
}

/** The paths of a sitemap (an index's sitemaps followed), or [] when there is none. */
async function sitemapPaths(site, wait) {
  const start = site === 'lh-com' ? '/sitemap/sitemap_lh.xml' : '/sitemap.xml';
  const seen = new Set(); const out = new Set();
  const read = async (url) => {
    if (seen.has(url)) return;
    seen.add(url);
    const res = await get(url); await pause(wait);
    if (!res.ok) return;
    const xml = await textOf(res);
    const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
    for (const loc of locs) {
      const u = new URL(loc);
      if (/\.xml(\.gz)?$/.test(u.pathname)) await read(`${origin(site, 'live')}${u.pathname.replace(/\.gz$/, '')}`);
      else out.add(u.pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/');
    }
  };
  await read(`${origin(site, 'live')}${start}`);
  return [...out];
}

/** The documents a site's upload state has previewed. */
function statePaths(site) {
  const f = path.join(root, 'tools/importer', site === 'lh-com' ? 'da-upload-state.json' : `da-upload-state-${site}.json`);
  if (!fs.existsSync(f)) return [];
  const { docs = {} } = JSON.parse(fs.readFileSync(f, 'utf8'));
  return Object.entries(docs).filter(([, d]) => d.preview).map(([p]) => p);
}

/** The text of a .plain.html (tags out, the entities markers can contain decoded). */
const plainText = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&#x26;|&amp;/g, '&').replace(/&#x3C;|&lt;/g, '<').replace(/&#x3E;|&gt;/g, '>');

/**
 * One site's census.
 * @param {string} site
 * @param {{envs: string[], paths?: string[], limit?: number, wait: number}} opts
 */
export async function census(site, {
  envs, paths, limit, wait,
}) {
  let list = paths;
  let source = 'paths file';
  if (!list) {
    list = await sitemapPaths(site, wait); source = 'sitemap';
    if (!list.length) { list = statePaths(site); source = 'upload state (previewed documents)'; }
  }
  if (limit) list = list.slice(0, limit);
  const result = {
    site, source, paths: list.length, envs: {},
  };
  for (const env of envs) {
    const r = {
      read: 0, missing: 0, withMarkers: 0, families: {}, pages: [],
    };
    for (const [i, p] of list.entries()) {
      if (i && i % 250 === 0) process.stderr.write(`${site} ${env}: ${i} of ${list.length}\n`);
      const res = await get(`${origin(site, env)}${p === '/' ? '/index' : p}.plain.html`);
      await pause(wait);
      if (!res.ok) { r.missing += 1; continue; }
      r.read += 1;
      const fam = countMarkers(plainText(await res.text()));
      const n = Object.values(fam).reduce((a, b) => a + b, 0);
      if (!n) continue;
      r.withMarkers += 1;
      Object.entries(fam).forEach(([k, v]) => { r.families[k] = (r.families[k] || 0) + v; });
      r.pages.push({ path: p, markers: n, families: fam });
    }
    process.stderr.write(`${site} ${env}: ${r.read + r.missing} of ${list.length}\n`);
    r.pages.sort((a, b) => b.markers - a.markers);
    result.envs[env] = r;
  }
  return result;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const argv = process.argv.slice(2);
  const all = (n) => argv.flatMap((a, i) => (a === `--${n}` ? [argv[i + 1]] : []));
  const opt = (n, d) => all(n)[0] ?? d;
  const sites = all('site').flatMap((s) => s.split(','));
  if (!sites.length) { console.error('usage: marker-census.mjs --site <site> [--env page,live] [--paths file] [--limit n] [--pause ms] [--out file]'); process.exit(2); }
  const envs = opt('env', 'page,live').split(',');
  const paths = opt('paths') ? fs.readFileSync(opt('paths'), 'utf8').split('\n').map((l) => l.trim()).filter((l) => l.startsWith('/')) : undefined;
  const results = [];
  for (const site of sites) {
    const r = await census(site, {
      envs, paths, limit: Number(opt('limit', 0)) || undefined, wait: Number(opt('pause', 250)),
    });
    results.push(r);
    Object.entries(r.envs).forEach(([env, e]) => {
      const fams = Object.entries(e.families).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k} ${v}`).join(', ');
      console.log(`${site} ${env} (${r.source}, ${r.paths} paths): read ${e.read}, missing ${e.missing}, with markers ${e.withMarkers}${fams ? `: ${fams}` : ''}`);
    });
  }
  if (opt('out')) fs.writeFileSync(opt('out'), JSON.stringify(results, null, 1));
}
