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
 *        node tools/importer/swiss-magazine-import.mjs --relink  (after a later archive: the earlier
 *        documents' links to its pages relative)
 *        node tools/importer/swiss-magazine-import.mjs --relink-docs  (the documents as DA has them,
 *        content-sites/lh-swiss/content/magazine: relinkDocument; writes the changed ones and
 *        content-sites/lh-swiss/runs/magazine-relink.txt)
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { PLACEHOLDER, withPlaceholder } from './swiss-import.mjs';
import { relativeDamLinks } from './swiss-dam.mjs';
import { subSiteLinks } from './swiss-sub-import.mjs';
import { withDaImages } from './swiss-sub-dam.mjs';
import { docName } from './import-magazine.js';
import collapseDocs from './collapse-docs.mjs';

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

/**
 * Does www leave the page's main container empty (an empty article fragment, no teasers: en's
 * rethinking-old-seat-covers)? Such a page is held, not imported as a blank document.
 */
export function emptyOnWww(html) {
  const start = html.search(/<div class="main-container[ "]/);
  if (start < 0) return true;
  const end = html.indexOf('<div class="footercontainer', start);
  const main = html.slice(start, end < 0 ? undefined : end);
  if (/<img\b|<iframe\b/.test(main)) return false;
  return !main.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|\s+/g, '').length;
}

/** www path -> the document's path, for the pages whose document path differs (redirect rows). */
export const redirectRows = (pages) => [...pages].sort().filter((p) => docName(p) !== p).map((p) => [p, docName(p)]);

/**
 * The document's links: to a captured magazine page relative, under its document's path (www's
 * absolute or relative spelling; its front page /magazine/<ll> as it is); the main site's
 * relative where lh-swiss has it; the rest absolute on www (subSiteLinks).
 */
export function magazineLinks(doc, { pages, sitePaths, mapHosts = true }) {
  // (the documents' own paths count as captured: a second pass keeps their relative links)
  const subPages = new Set([...pages, ...[...pages].map(docName)]);
  // www.swiss.com.cn (SWISS's China host, the same pages: the capture rendered 34 magazine pages
  // for it) as www.swiss.com; the replica's China alias (swiss-cn) keeps relative links on itself
  const dotCom = doc.replace(/href="https?:\/\/www\.swiss\.com\.cn(?=[/"?#])/g, 'href="https://www.swiss.com');
  const linked = subSiteLinks(dotCom, { subPages, sitePaths, mapHosts });
  return linked.replace(/href="(\/magazine\/[^"?#]+)([?#][^"]*)?"/g, (m, p, rest = '') => (pages.has(p) ? `href="${docName(p)}${rest}"` : m));
}

/**
 * The magazine's pictures www no longer has (404 for the original and every rendition tried,
 * 2026-11-04): the documents drop them, the rest of the page as www shows it.
 */
export const GONE_PICTURES = [
  '230926_amman/3-checkflight-flight-radar.png',
  'milestones-20-years-of-swiss/2022-synhelion-sun-rise.png',
  'cargo/when-animals-go-on-a-journey/capture.png',
  'agi-portrait-high-12d08c7dce6-8709786-4.jpeg',
];

/**
 * A document without the gone pictures: a carousel slide (its row: the picture and its caption)
 * out; elsewhere the picture (and its paragraph when nothing else is in it).
 */
export function dropGonePictures(doc, gone = GONE_PICTURES) {
  if (!gone.some((g) => doc.includes(g))) return doc;
  const { document } = parseHTML(`<html><body>${doc}</body></html>`);
  document.querySelectorAll('img').forEach((img) => {
    if (!gone.some((g) => (img.getAttribute('src') || '').includes(g))) return;
    let block = img.parentElement;
    while (block && !(block.tagName === 'DIV' && block.getAttribute('class'))) block = block.parentElement;
    if (block && block.getAttribute('class').split(/\s+/)[0] === 'carousel-images') {
      const row = [...block.children].find((r) => r.contains(img));
      if (row) { row.remove(); return; }
    }
    const pic = img.closest('picture') || img;
    const p = pic.parentElement && pic.parentElement.tagName === 'P' ? pic.parentElement : null;
    pic.remove();
    if (p && !p.textContent.trim() && !p.children.length) p.remove();
  });
  return document.body.innerHTML;
}

// www's broken author links: its AEM paths of magazine pages (/content/swiss-magazine/<ll>/…, also
// on www.swiss.com) and its editor's links to an outside site (/editor.html/content/dam/…/<domain>)
const CONTENT_LINK = /^(?:https?:\/\/www\.swiss\.com)?\/content\/swiss-magazine\/(de|en)\/([^?#"]+)/;
const EDITOR_LINK = /^\/editor\.html\/content\/dam\/.*\/((?:[a-z0-9-]+\.)+[a-z]{2,})\/?$/i;

/**
 * www's broken author links as the public page they mean: a magazine page by its document path,
 * an outside site by its domain; without one, the link's text.
 */
export function authorLinks(doc, { docs }) {
  return doc.replace(/<a href="([^"]*)"([^>]*)>([\s\S]*?)<\/a>/g, (m, href, attrs, text) => {
    const c = href.match(CONTENT_LINK);
    if (c) {
      let rest = c[2];
      try { rest = decodeURIComponent(rest); } catch (e) { /* as it is */ }
      const target = docName(`/magazine/${c[1]}/${rest}`.replace(/\/+$/, ''));
      return docs.has(target) ? `<a href="${target}"${attrs}>${text}</a>` : text;
    }
    const e = href.match(EDITOR_LINK);
    if (e) return `<a href="https://${e[1].toLowerCase()}"${attrs}>${text}</a>`;
    return m;
  });
}

/**
 * A document's leftovers fixed (brief 341): the gone pictures out, www's broken author links,
 * its www.swiss.com links relative where the replica has the page (a magazine page by its document
 * path, the sub-sites' documents, the main site's allowlist: magazineLinks), the rest on www.
 */
export function relinkDocument(doc, { docs, sitePaths }) {
  const fixed = authorLinks(dropGonePictures(doc), { docs });
  const magazine = fixed.replace(/href="https?:\/\/www\.swiss\.com(\/magazine\/(?:de|en)\/[^"?#]+)([?#][^"]*)?"/g, (m, p, rest = '') => (docs.has(docName(p)) ? `href="${docName(p)}${rest}"` : m));
  return magazineLinks(magazine, { pages: docs, sitePaths });
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
  const started = Date.now();
  if (argv.includes('--relink-docs')) {
    // the documents as DA has them (content-sites/lh-swiss/content: the magazine, the sub-sites)
    const C = path.join(root, 'content-sites/lh-swiss/content');
    const walkDocs = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walkDocs(path.join(d, e.name)) : [path.join(d, e.name)])) : []);
    const all = ['magazine', 'corporate', 'medicalservices'].flatMap((s) => walkDocs(path.join(C, s))).filter((f) => f.endsWith('.plain.html'))
      .map((f) => `/${path.relative(C, f).replace(/\.plain\.html$/, '')}`);
    const docs = new Set(all);
    const sitePaths = new Set(JSON.parse(fs.readFileSync(path.join(root, 'tools/importer/sites/lh-swiss.json'), 'utf8')).paths);
    const changed = [];
    all.filter((d) => MAGAZINE_PATH.test(d)).forEach((d) => {
      const file = path.join(C, `${d}.plain.html`);
      const html = fs.readFileSync(file, 'utf8');
      const out = relinkDocument(html, { docs, sitePaths });
      if (out === html) return;
      if (!argv.includes('--dry-run')) fs.writeFileSync(file, out);
      changed.push(d);
    });
    if (!argv.includes('--dry-run')) fs.writeFileSync(path.join(root, 'content-sites/lh-swiss/runs/magazine-relink.txt'), changed.length ? `${changed.join('\n')}\n` : '');
    console.log(`relink-docs: ${changed.length} of ${all.filter((d) => MAGAZINE_PATH.test(d)).length} magazine documents changed`);
    process.exit(0);
  }
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
      if (!MAGAZINE_PATH.test(p)) others.push([p, 'the main site\'s page (ema-cashub\'s ch/<ll>), not the magazine\'s']);
      else if (emptyOnWww(fs.readFileSync(f, 'utf8'))) others.push([p, 'www\'s page is empty (no article, no teasers): held']);
    });
    fs.writeFileSync(path.join(REP, 'lh-swiss-mag-not-imported.tsv'), `www url\twhy\n${others.sort(([a], [b]) => a.localeCompare(b)).map(([p, why]) => `https://${HOST}${p}\t${why}`).join('\n')}\n`);
    console.log(`lists: ${rows.length} redirect rows, ${missing.length} linked pages the capture lacks, ${others.length} pages not imported (outside the magazine or empty on www)`);
    process.exit(0);
  }
  if (argv.includes('--relink')) {
    // the documents made before a later archive: their links to its pages relative now
    // (magazineLinks again; nav and footer as www's own markup) -> runs/relink-upload.txt
    const allow = JSON.parse(fs.readFileSync(path.join(root, 'tools/importer/sites/lh-swiss.json'), 'utf8'));
    const sitePaths = new Set(allow.paths);
    const docs = path.join(W, 'content');
    const walk = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])) : []);
    const changed = [];
    walk(docs).filter((f) => f.endsWith('.plain.html')).forEach((f) => {
      const d = `/${path.relative(docs, f).replace(/\.plain\.html$/, '')}`;
      const doc = fs.readFileSync(f, 'utf8');
      const next = magazineLinks(doc, { pages, sitePaths, mapHosts: !/\/(nav|footer)$/.test(d) });
      if (next !== doc) { fs.writeFileSync(f, next); changed.push(d); }
    });
    fs.writeFileSync(path.join(W, 'runs', 'relink-upload.txt'), `${changed.sort().join('\n')}\n`);
    console.log(`relink: ${changed.length} documents changed (runs/relink-upload.txt)`);
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
  // pages www leaves empty (emptyOnWww): held
  const empty = [];
  urls.forEach((u) => {
    const p = new URL(u).pathname.replace(/\.html$/, '');
    if (!MAGAZINE_PATH.test(p)) { outside.push(p); return; }
    const f = path.join(SNAP, `${p}.html`);
    if (!fs.existsSync(f)) { missing.push(p); return; }
    const html = fs.readFileSync(f, 'utf8');
    if (emptyOnWww(html)) { empty.push(p); return; }
    const copy = path.join(MAPPED, HOST, `${p}.html`);
    fs.mkdirSync(path.dirname(copy), { recursive: true });
    fs.writeFileSync(copy, withPlaceholder(stripScripts(html)));
    out[p] = docName(p);
  });
  console.log(`${name}: ${Object.keys(out).length} pages; no snapshot: ${missing.length ? missing.join(' ') : 'none'}; outside the magazine: ${outside.length ? outside.join(' ') : 'none'}; empty on www (held): ${empty.length ? empty.join(' ') : 'none'}`);
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
  // the last step: no import writes style markers (token-free styling, tools/importer/marker-collapse.mjs)
  collapseDocs(made.map((d) => path.join(W, 'content', `${d}.plain.html`)), { brand: 'swiss', content: path.join(W, 'content') });
  fs.writeFileSync(path.join(W, 'runs', `${name}-import.json`), `${JSON.stringify({
    documents: out, made, missing, outside, empty,
  }, null, 1)}\n`);
  console.log(`${made.length} documents; upload list runs/${name}-upload.txt`);
}
