/* eslint-disable no-console, max-len, import/prefer-default-export -- tooling */
/**
 * Post-import step for another site's document tree (brief 95; da-upload.mjs --site): lh-com's
 * import scripts resolve every relative URL against https://www.lufthansa.com (LIVE_ORIGIN of the
 * cleanup and nav importers), so on a brand site's pages its own links and images come out as
 * www.lufthansa.com URLs. This step
 * 1. checks that the recorded source pages hold no absolute www.lufthansa.com URL of their own
 *    (else it stops: a real Lufthansa link could not be told apart),
 * 2. turns https://www.lufthansa.com/<x> into https://<source host>/<x> (links, images, text),
 * 3. makes links to pages of the site (its allowlist tools/importer/sites/<site>.json) relative,
 *    and relative links to pages it does not have absolute on the source host,
 *    locale roots /<cc>/<ll> to /<cc>/<ll>/homepage.
 * Idempotent. Usage: node tools/importer/site-postprocess.mjs --site lh-discover
 *   --source-host www.discover-airlines.com [--content-dir dir] [--dry-run]
 *   [--snapshots dir --real-placeholder host]
 * --snapshots: the source pages the import read (default tools/importer/bd-snapshots/<host>);
 * --real-placeholder: the host the source pages' own lufthansa.com URLs were given before the
 * import (discover-import.mjs: www.lufthansa-com.invalid, so the importers leave them alone and
 * step 2 can't take them for the importers' own URLs); turned back into https://www.lufthansa.com
 * after step 2.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);

/** The changed document and what changed. */
export function postprocess(html, { sourceHost, sitePaths }) {
  let out = html.replace(/https:\/\/www\.lufthansa\.com(?=[/"'?#)\s]|$)/g, `https://${sourceHost}`);
  const hosts = out.split(`https://${sourceHost}`).length - html.split(`https://${sourceHost}`).length;
  let relative = 0;
  const esc = sourceHost.replace(/\./g, '\\.');
  out = out.replace(new RegExp(`href="https://${esc}(/[a-z]{2}/[a-z]{2}(?:/[^"?#]*)?)([?#][^"]*)?"`, 'g'), (m, p, rest = '') => {
    const page = p.replace(/\.html$/, '').replace(/\/$/, '');
    const target = /^\/[a-z]{2}\/[a-z]{2}$/.test(page) ? `${page}/homepage` : page;
    if (!sitePaths.has(target)) return m;
    relative += 1;
    return `href="${target}${rest}"`;
  });
  // relative links to pages the site does not have (lh-com's scope made them relative) go to
  // the source site
  let absolute = 0;
  out = out.replace(/href="(\/[a-z]{2}\/[a-z]{2}(?:\/[^"?#]*)?)([?#][^"]*)?"/g, (m, p, rest = '') => {
    if (sitePaths.has(p.replace(/\/$/, ''))) return m;
    absolute += 1;
    return `href="https://${sourceHost}${p}${rest}"`;
  });
  return {
    html: out, hosts, relative, absolute,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const site = opt('site');
  const sourceHost = opt('source-host');
  if (!site || site === 'lh-com' || !sourceHost) throw new Error('--site <other site> --source-host <host> required');
  const dir = path.resolve(root, opt('content-dir') || `content-sites/${site}/content`);
  const list = JSON.parse(fs.readFileSync(path.join(root, `tools/importer/sites/${site}.json`), 'utf8'));
  const sitePaths = new Set(list.paths);
  const snapshots = path.resolve(root, opt('snapshots') || path.join('tools/importer/bd-snapshots', sourceHost));
  const placeholder = opt('real-placeholder');
  const walk = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])) : []);
  const own = walk(snapshots).filter((f) => f.endsWith('.html')).filter((f) => fs.readFileSync(f, 'utf8').includes('https://www.lufthansa.com'));
  if (own.length) throw new Error(`source pages with their own www.lufthansa.com URLs (cannot map): ${own.map((f) => path.relative(snapshots, f)).join(', ')}`);
  let changed = 0;
  walk(dir).filter((f) => f.endsWith('.plain.html')).forEach((f) => {
    const before = fs.readFileSync(f, 'utf8');
    const r = postprocess(before, { sourceHost, sitePaths });
    // the source pages' own Lufthansa URLs, kept apart during the import
    if (placeholder) r.html = r.html.split(`https://${placeholder}`).join('https://www.lufthansa.com');
    if (r.html === before) return;
    changed += 1;
    console.log(`${path.relative(dir, f)}: ${r.hosts} URLs to ${sourceHost}, ${r.relative} links to site pages made relative, ${r.absolute} to pages it lacks made absolute`);
    if (!argv.includes('--dry-run')) fs.writeFileSync(f, r.html);
  });
  console.log(`site-postprocess: ${changed} documents changed${argv.includes('--dry-run') ? ' (dry run)' : ''}`);
}
