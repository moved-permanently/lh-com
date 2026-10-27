/* eslint-disable no-console, max-len, no-await-in-loop, no-restricted-syntax, import/extensions -- dev tooling */
/**
 * Asks a host of lh-edge for every URL of www's sitemaps of market roots (the dataset
 * tools/source-export/feeds/sitemaps: the root's paths in page groups and its market-only list)
 * and records what answers: status, lh-edge's route, the canonical. Each URL that is not 200 gets
 * a reason from the replica's documents: the language version has no document at that path
 * (not migrated: /lhg/, login and profile, pages out of scope), the path is one the language index
 * leaves out (confirmation pages, support/search), or `markets` excludes the country.
 * The host: lh-edge with the market roots served (wrangler dev against the preview origin,
 * --header X-LH-Public-Host: lhedge.bbird.live, or lhedge.bbird.live after a publish).
 * Usage: node tools/markets/check-market-route.mjs --base http://localhost:8787 --root ch/en --root ch/de
 *          [--links /ch/en/homepage --links /ch/en/nav.plain.html]
 *          [--header 'x-lh-public-host: lhedge.bbird.live'] [--out report.json] [--concurrency 4]
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';
import { LOCALE_TABLE, LANGUAGE_VERSIONS } from '../../scripts/locale-table.js';
import { isIndexedPath, marketsOf } from './seed-markets.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DATA = path.join(root, 'tools/source-export/feeds/sitemaps');

/** www's paths of a root (its sitemap: page groups and market-only URLs), sorted. */
export function wwwPaths(rootKey, groups, marketOnly) {
  const out = new Set();
  // a group can hold several URLs of one root (a list)
  groups.forEach((g) => { [g.paths[rootKey] || []].flat().forEach((p) => out.add(p)); });
  (marketOnly[rootKey] || []).forEach(([p]) => out.add(p));
  return [...out].sort();
}

/** Why a market path has no page: from the language version's local documents. */
export function reason(p, rootKey, docExists = (x) => fs.existsSync(path.join(root, 'content', `${x}.plain.html`)), readDoc = (x) => fs.readFileSync(path.join(root, 'content', `${x}.plain.html`), 'utf8')) {
  const version = LANGUAGE_VERSIONS[LOCALE_TABLE[rootKey].lang];
  const suffix = p.slice(rootKey.length + 1);
  const lp = `/${version}${suffix}`;
  if (/^\/(login|profile)(\/|$)/.test(suffix)) return 'login or profile (left alone)';
  if (docExists(`/${rootKey}${suffix}`)) return 'own document (not in the preview yet?)';
  if (!docExists(lp)) return `no ${version} document`;
  if (!isIndexedPath(lp, version)) return `${version} page, left out of its index`;
  const m = marketsOf(readDoc(lp));
  if (m) return `markets ${m}`;
  return `${version} document exists (index row missing?)`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const argv = process.argv.slice(2);
  const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
  const all = (n) => argv.flatMap((a, i) => (a === `--${n}` ? [argv[i + 1]] : []));
  const base = opt('base') || 'http://localhost:8787';
  const headers = Object.fromEntries(all('header').map((h) => [h.split(':')[0].trim(), h.split(':').slice(1).join(':').trim()]));
  const concurrency = Number(opt('concurrency')) || 4;
  const { groups } = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(DATA, 'groups.json.gz'))));
  const marketOnly = JSON.parse(fs.readFileSync(path.join(DATA, 'market-only.json'), 'utf8')).roots;
  /** GETs paths (no redirects followed): [{path, status, route, location, canonical, links}]. */
  const check = async (paths) => {
    const results = [];
    let next = 0;
    const worker = async () => {
      while (next < paths.length) {
        const p = paths[next];
        next += 1;
        let r;
        try {
          const resp = await fetch(`${base}${p}`, { headers, redirect: 'manual' });
          const html = resp.status === 200 ? await resp.text() : (await resp.arrayBuffer(), '');
          r = {
            path: p,
            status: resp.status,
            route: resp.headers.get('x-lh-edge-route') || 'pass-through',
            location: resp.headers.get('location') || '',
            canonical: (html.match(/<link rel="canonical" href="([^"]+)"/) || [])[1] || '',
            links: [...html.matchAll(/<a href="(\/[^"#?]*)/g)].map((m) => m[1]),
          };
        } catch (e) {
          r = { path: p, status: 0, error: e.message };
        }
        results.push(r);
      }
    };
    await Promise.all(Array.from({ length: concurrency }, worker));
    return results.sort((a, b) => a.path.localeCompare(b.path));
  };
  const by = (results, k) => results.reduce((m, r) => ({ ...m, [r[k]]: (m[r[k]] || 0) + 1 }), {});
  const report = {};
  for (const rootKey of all('root')) {
    const paths = wwwPaths(rootKey, groups, marketOnly);
    const results = (await check(paths)).map(({ links, ...r }) => (r.status === 200 ? r : { ...r, reason: reason(r.path, rootKey) }));
    const reasons = results.filter((r) => r.reason).reduce((m, r) => ({ ...m, [r.reason]: (m[r.reason] || 0) + 1 }), {});
    const badCanonical = results.filter((r) => r.status === 200 && !r.canonical.endsWith(r.path)).length;
    report[rootKey] = {
      urls: paths.length, status: by(results, 'status'), route: by(results, 'route'), reasons, badCanonical, results,
    };
    console.log(`${rootKey}: ${paths.length} www URLs; status ${JSON.stringify(by(results, 'status'))}; routes ${JSON.stringify(by(results, 'route'))}; canonical not the URL: ${badCanonical}`);
    Object.entries(reasons).forEach(([k, n]) => console.log(`  not 200, ${k}: ${n}`));
  }
  // --links <page>: every root-relative link of the page (its header and footer are loaded by the
  // browser: --links /ch/en/nav.plain.html checks those)
  for (const page of all('links')) {
    const [doc] = await check([page]);
    const links = [...new Set(doc.links || [])].sort();
    const results = await check(links);
    const bad = results.filter((r) => ![200, 301, 302].includes(r.status) || (r.status !== 200 && !r.location.startsWith('/') && !/^https:\/\/www\.lufthansa\.com\//.test(r.location)));
    report[`links ${page}`] = {
      status: doc.status, links: links.length, statuses: by(results, 'status'), bad: bad.map(({ links: l, ...r }) => r),
    };
    console.log(`links of ${page} (${doc.status}): ${links.length} links; status ${JSON.stringify(by(results, 'status'))}; into other roots: ${links.filter((l) => !l.startsWith(page.split('/').slice(0, 3).join('/'))).length}`);
    bad.forEach((r) => console.log(`  ${r.status} ${r.path}${r.location ? ` -> ${r.location}` : ''}`));
  }
  if (opt('out')) fs.writeFileSync(opt('out'), `${JSON.stringify(report, null, 1)}\n`);
}
