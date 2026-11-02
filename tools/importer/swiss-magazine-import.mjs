/* eslint-disable no-console, max-len, import/extensions, import/no-extraneous-dependencies -- tooling */
/**
 * Imports SWISS's magazine (lh-swiss: www.swiss.com/magazine/<ll>/, de and en) offline from the
 * capture's snapshots (swiss-snapshots-033 onwards, placed in
 * content-sites/lh-swiss-mag/snapshots-src/www.swiss.com) into content-sites/lh-swiss-mag/content,
 * next to swiss-sub-import.mjs (the corporate site and medical services), with
 * tools/importer/import-magazine.js (bundled: import-magazine.bundle.js). Its own steps (exported,
 * test/swiss-magazine-import.test.mjs):
 * - the documents' paths: import-magazine.js docName of www's (leading, trailing or double hyphens
 *   out); redirectRows: www's path -> the document's, where they differ;
 * - magazineLinks: links to the magazine's captured pages relative under the document's path, the
 *   main site's where lh-swiss has them (swiss-sub-import.mjs subSiteLinks), the rest on www;
 * - the images from lh-swiss's DA (swiss-sub-dam.mjs withDaImages), the DAM links site-relative
 *   (swiss-dam.mjs relativeDamLinks), www.lufthansa.com's own URLs put back after the import.
 * The capture's pages outside the magazine (/ch/<ll>/... probes: ema-cashub's) are not imported.
 * The bulk importer's reports go to content-sites/lh-swiss-mag/reports (never lh-com's tree).
 * Writes runs/<name>-import.json (path -> document) and runs/<name>-upload.txt.
 *
 * Usage: node tools/importer/swiss-magazine-import.mjs --list content-sites/lh-swiss-mag/runs/batch-033.txt [--dry-run]
 *        (a list of www URLs; without one: every captured magazine page)
 *        node tools/importer/swiss-magazine-import.mjs --lists   (tools/reports/lh-swiss-mag-*.tsv)
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PLACEHOLDER, withPlaceholder } from './swiss-import.mjs';
import { relativeDamLinks } from './swiss-dam.mjs';
import { subSiteLinks } from './swiss-sub-import.mjs';
import { withDaImages } from './swiss-sub-dam.mjs';
import { docName } from './import-magazine.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const HOST = 'www.swiss.com';
export const W = path.join(root, 'content-sites/lh-swiss-mag');
const SNAP = path.join(W, 'snapshots-src', HOST);
const MAPPED = path.join(W, 'snapshots');
const CI = '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts';
export const MAGAZINE_PATH = /^\/magazine\/(de|en)(\/|$)/;

/** The capture's magazine pages: www paths of the snapshots under snapshots-src. */
export function capturedMagazine(dir = SNAP) {
  const out = new Set();
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f);
    else if (e.name.endsWith('.html')) out.add(`/${path.relative(dir, f).replace(/\.html$/, '')}`);
  });
  if (fs.existsSync(dir)) walk(dir);
  return new Set([...out].filter((p) => MAGAZINE_PATH.test(p)));
}

/** www path -> the document's path, for the pages whose document path differs (redirect rows). */
export const redirectRows = (pages) => [...pages].sort().filter((p) => docName(p) !== p).map((p) => [p, docName(p)]);

/**
 * The document's links: to a captured magazine page relative, under its document's path (www's
 * absolute or relative spelling; its front page /magazine/<ll> as it is); the main site's
 * relative where lh-swiss has it; the rest absolute on www (subSiteLinks).
 */
export function magazineLinks(doc, { pages, sitePaths, mapHosts = true }) {
  const linked = subSiteLinks(doc, { subPages: pages, sitePaths, mapHosts });
  return linked.replace(/href="(\/magazine\/[^"?#]+)([?#][^"]*)?"/g, (m, p, rest = '') => (pages.has(p) ? `href="${docName(p)}${rest}"` : m));
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
  const started = Date.now();
  const pages = capturedMagazine();
  if (argv.includes('--lists')) {
    // the lists (tools/reports): the redirect rows, the linked magazine pages the capture lacks,
    // the capture's pages outside the magazine (not imported)
    const REP = path.join(root, 'tools/reports');
    const rows = [['/magazine', '/magazine/de'], ...redirectRows(pages)];
    fs.writeFileSync(path.join(REP, 'lh-swiss-mag-redirects.tsv'), `Source\tDestination\n${rows.map((r) => r.join('\t')).join('\n')}\n`);
    const linked = new Map();
    const docs = path.join(W, 'content');
    const walk = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])) : []);
    walk(docs).filter((f) => f.endsWith('.plain.html')).forEach((f) => {
      const d = `/${path.relative(docs, f).replace(/\.plain\.html$/, '')}`;
      [...fs.readFileSync(f, 'utf8').matchAll(/href="https:\/\/www\.swiss\.com(\/magazine\/[^"?#]+)/g)].forEach(([, p]) => {
        if (!MAGAZINE_PATH.test(p) || pages.has(p)) return;
        if (!linked.has(p)) linked.set(p, new Set());
        linked.get(p).add(d);
      });
    });
    const missing = [...linked].sort(([a], [b]) => a.localeCompare(b));
    fs.writeFileSync(path.join(REP, 'lh-swiss-mag-missing-pages.tsv'), `www url\tlinking documents\tfirst documents\n${missing.map(([p, ds]) => [`https://${HOST}${p}`, ds.size, [...ds].sort().slice(0, 3).join(' ')].join('\t')).join('\n')}\n`);
    const others = [];
    const walkSnap = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walkSnap(path.join(d, e.name)) : [path.join(d, e.name)])) : []);
    walkSnap(SNAP).filter((f) => f.endsWith('.html')).forEach((f) => {
      const p = `/${path.relative(SNAP, f).replace(/\.html$/, '')}`;
      if (!MAGAZINE_PATH.test(p)) others.push(p);
    });
    fs.writeFileSync(path.join(REP, 'lh-swiss-mag-not-imported.tsv'), `www url\twhy\n${others.sort().map((p) => `https://${HOST}${p}\tthe main site's page (ema-cashub's ch/<ll>), not the magazine's`).join('\n')}\n`);
    console.log(`lists: ${rows.length} redirect rows, ${missing.length} linked pages the capture lacks, ${others.length} pages outside the magazine`);
    process.exit(0);
  }
  const list = opt('list');
  const name = list ? path.basename(list).replace(/\.txt$/, '') : 'all';
  const urls = list
    ? fs.readFileSync(path.resolve(root, list), 'utf8').split('\n').map((u) => u.trim()).filter(Boolean)
    : [...pages].sort().map((p) => `https://${HOST}${p}`);
  const { stripScripts } = await import(path.join(CI, '../../excat-scrape-webpage/scripts/strip-scripts.js'));
  const out = {};
  const missing = [];
  const outside = [];
  urls.forEach((u) => {
    const p = new URL(u).pathname.replace(/\.html$/, '');
    if (!MAGAZINE_PATH.test(p)) { outside.push(p); return; }
    const f = path.join(SNAP, `${p}.html`);
    if (!fs.existsSync(f)) { missing.push(p); return; }
    const copy = path.join(MAPPED, HOST, `${p}.html`);
    fs.mkdirSync(path.dirname(copy), { recursive: true });
    fs.writeFileSync(copy, withPlaceholder(stripScripts(fs.readFileSync(f, 'utf8'))));
    out[p] = docName(p);
  });
  console.log(`${name}: ${Object.keys(out).length} pages; no snapshot: ${missing.length ? missing.join(' ') : 'none'}; outside the magazine: ${outside.length ? outside.join(' ') : 'none'}`);
  if (argv.includes('--dry-run')) process.exit(0);
  const listFile = path.join(W, `urls-${name}.txt`);
  fs.writeFileSync(listFile, `${Object.keys(out).map((p) => `https://${HOST}${p}`).join('\n')}\n`);
  const log = execFileSync('node', [`${CI}/run-bulk-import.js`, '--import-script', 'tools/importer/import-magazine.bundle.js', '--urls', listFile, '--force', '--html-dir', MAPPED], {
    cwd: root, env: { ...process.env, WORKSPACE_PATH: W, BD_ENDPOINT: '' }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024,
  });
  log.split('\n').filter((x) => /Snapshot import failed|falling through to live/i.test(x)).forEach((x) => console.log(`WARNING (live fallback): ${x.trim()}`));
  console.log(`magazine: ${log.split('\n').filter((x) => /imported|failed|error/i.test(x) && !/wss:|endpoint/i.test(x)).slice(-2).join(' | ')}`);
  // the bulk importer's reports (tools/importer/reports/<path>) to the workspace
  const REPORTS = path.join(root, 'tools/importer/reports');
  Object.values(out).forEach((d) => {
    const from = path.join(REPORTS, `${d}.report.json`);
    if (!fs.existsSync(from) || fs.statSync(from).mtimeMs < started) return;
    const to = path.join(W, 'reports', `${d}.report.json`);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.renameSync(from, to);
    for (let dir = path.dirname(from); dir.startsWith(`${REPORTS}/`) && fs.existsSync(dir) && !fs.readdirSync(dir).length; dir = path.dirname(dir)) fs.rmdirSync(dir);
  });
  const allow = JSON.parse(fs.readFileSync(path.join(root, 'tools/importer/sites/lh-swiss.json'), 'utf8'));
  const sitePaths = new Set(allow.paths);
  const made = Object.values(out).filter((d) => fs.existsSync(path.join(W, 'content', `${d}.plain.html`)));
  made.forEach((d) => {
    const f = path.join(W, 'content', `${d}.plain.html`);
    let doc = fs.readFileSync(f, 'utf8');
    // (the DAM links site-relative after the page links: postprocess makes relative links absolute
    // on www where the site has no page of that path)
    doc = relativeDamLinks(magazineLinks(doc, { pages, sitePaths })).split(`https://${PLACEHOLDER}`).join('https://www.lufthansa.com');
    fs.writeFileSync(f, withDaImages(doc));
  });
  fs.mkdirSync(path.join(W, 'runs'), { recursive: true });
  fs.writeFileSync(path.join(W, 'runs', `${name}-upload.txt`), `${made.join('\n')}\n`);
  fs.writeFileSync(path.join(W, 'runs', `${name}-import.json`), `${JSON.stringify({
    documents: out, made, missing, outside,
  }, null, 1)}\n`);
  console.log(`${made.length} documents; upload list runs/${name}-upload.txt`);
}
