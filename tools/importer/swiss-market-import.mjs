/* eslint-disable no-console, max-len, import/extensions, import/no-extraneous-dependencies -- tooling */
/**
 * SWISS's market roots (lh-swiss: the countries of www.swiss.com in a language lh-swiss has; the
 * capture's swiss-snapshots-030 to 032, placed in content-sites/lh-swiss-mk/snapshots-src/www.swiss.com)
 * offline into content-sites/lh-swiss-mk/content, next to swiss-import.mjs (ema-cashub's: ch/<ll>,
 * the language versions) and with its page steps as they are: each root's homepage and own pages
 * (pages only the market versions have) as the root's own documents; their other pages answer
 * from ch/<ll>'s documents through lh-edge's market route once the root is in the table
 * (scripts/brands.js SWISS_MARKETS, behind SWISS_MARKETS_LIVE). Its own steps (exported,
 * test/swiss-market-import.test.mjs):
 * - marketOriginOf / withMarketOrigin: the flight search's default origin, the homepage's own
 *   (www's field value and code: "Frankfurt (FRA)");
 * - servedPaths: the pages a root has on the site: its own documents, and ch/<ll>'s pages whose
 *   markets row lists it (runs/markets.json: each ch document's markets, read from lh-swiss's
 *   preview); links to them relative, every other link absolute on www (swiss-sub-import.mjs
 *   subSiteLinks: the sub-sites' captured pages relative too);
 * - the images from their place in lh-swiss's DA (swiss-sub-dam.mjs withDaImages).
 * Writes runs/<name>-upload.txt and runs/<name>-import.json.
 *
 * Usage: node tools/importer/swiss-market-import.mjs --list content-sites/lh-swiss-mk/runs/batch-NN.txt [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  PLACEHOLDER, LINK_OUT, withPlaceholder, withLinkOuts, withTabMarkers, splitTabSections, withoutPlaceholders,
  withoutLoads, withTeaserColumns, withCheckinTabs, withOffersGridConfig, withItaForm, withPageLanguageMessages,
  withItaMetadata, withOwnSuccess, withFlightSearch, withCheckinHandoff, withHeroVideo, withFlightSearchVideo,
  withFlightSearchTeaser, withOwnFlightSearchLinks, templateOf, divEnd, docName,
} from './swiss-import.mjs';
import { relativeDamLinks } from './swiss-dam.mjs';
import { subSiteLinks, capturedPages, withOneH1 } from './swiss-sub-import.mjs';
import { withDaImages } from './swiss-sub-dam.mjs';
import { BRAND_SITES, SWISS_OWN_ROOTS } from '../../scripts/brands.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const HOST = 'www.swiss.com';
export const W = path.join(root, 'content-sites/lh-swiss-mk');
const SNAP = path.join(W, 'snapshots-src', HOST);
const MAPPED = path.join(W, 'snapshots');
const SUB_SNAP = path.join(root, 'content-sites/lh-swiss-sub/snapshots-src', HOST);
const CI = '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts';

const decode = (s) => String(s || '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'");

// the fare teaser's recommendations: their origin's name and code (configured on www)
const teaserOrigin = (html) => {
  const pairs = [...String(html || '').matchAll(/OriginCode=([A-Z]{3})[^"]*"[^>]*class="fareteaser-recommendation-od-link"[^>]*>\s*<div class="fareteaser-recommendation-origin">([^<]+)<\/div>/g)]
    .map((m) => `${decode(m[2]).trim()} (${m[1]})`);
  if (!pairs.length) return '';
  const count = pairs.reduce((c, x) => ({ ...c, [x]: (c[x] || 0) + 1 }), {});
  return Object.entries(count).sort((a, b) => b[1] - a[1])[0][0];
};
const FINDER_ORIGIN = /(<div class="destination-finder[^"]*">(?:(?!<div class="(?!destination-finder))[\s\S])*?<div><div>Default origin<\/div><div>)([^<]+)(<\/div><\/div>)/;

// the fare teaser's configured origin (fareTeaserManualTravels: the most frequent), a code
const teaserCode = (html) => {
  const codes = [...decode(html).matchAll(/"origin":"([A-Z]{3})"/g)].map((m) => m[1]);
  if (!codes.length) return '';
  const count = codes.reduce((c, x) => ({ ...c, [x]: (c[x] || 0) + 1 }), {});
  return Object.entries(count).sort((a, b) => b[1] - a[1])[0][0];
};

/**
 * The root's default origin: the fare teaser's most frequent recommendation origin, "Frankfurt
 * (FRA)"; a fare teaser the browser draws (no recommendations in the snapshot) its configured code
 * alone, "FRA" (the blocks name it); else ''. Never the destination finder's parsed value (www
 * configures none there: lh-com's parser writes its list's first airport, "Bastia (BIA)") or www's
 * origin field (the capture session's airport, de/de: "Prague - Ruzyně Airport").
 */
// eslint-disable-next-line no-unused-vars -- (doc: the signature withMarketOrigin calls)
export function marketOriginOf(html, doc = '') {
  return teaserOrigin(html) || teaserCode(html);
}

/**
 * The flight-search blocks (their Shop row: swiss-import.mjs withFlightSearch) with the root's
 * default origin after it where they have none; the destination finder's the same.
 */
export function withMarketOrigin(doc, html) {
  const origin = marketOriginOf(html, doc);
  if (!origin) return doc;
  return doc.replace(new RegExp(FINDER_ORIGIN.source, 'g'), (m, a, v, b) => `${a}${origin}${b}`).replace(/(<div class="flight-search(?: [^"]*)?"><div><div>Shop<\/div><div><a href="[^"]*">[^<]*<\/a><\/div><\/div>)(?!<div><div>Default origin)/g, `$1<div><div>Default origin</div><div>${origin}</div></div>`);
}

/**
 * The pages roots have on the site: own (their documents' paths), the language versions'
 * documents (sitePaths, ch/<ll>) and, per market root, ch/<ll>'s pages whose markets lists it
 * (markets: {"/ch/en/x": ["de/en", ...]}); an empty markets row every market root of the
 * language (roots: the market roots), as lh-edge reads it. A Set of paths.
 */
export function servedPaths({
  own, sitePaths, markets, roots = [],
}) {
  const out = new Set([...own, ...sitePaths]);
  Object.entries(markets).forEach(([p, listed]) => {
    if (!Array.isArray(listed)) return;
    const m = p.match(/^\/ch\/([a-z]{2})(\/.*)$/);
    if (!m) return;
    (listed.length ? listed : roots).filter((r) => r.endsWith(`/${m[1]}`)).forEach((r) => out.add(`/${r}${m[2]}`));
  });
  return out;
}

/** The snapshot without the form's jQuery UI date picker (hidden on www, no content). */
export function withoutDatepicker(html) {
  let out = html;
  for (let i = out.search(/<div id="ui-datepicker-div"/); i >= 0; i = out.search(/<div id="ui-datepicker-div"/)) out = `${out.slice(0, i)}${out.slice(divEnd(out, i))}`;
  return out;
}

/**
 * Is a www path one of the site's pages: a page of a language lh-swiss has (a market root's own
 * page), or of an own root (scripts/brands.js SWISS_OWN_ROOTS: kr/ko, all of whose pages are its
 * own documents)?
 */
export const onSite = (p) => Object.prototype.hasOwnProperty.call(BRAND_SITES.swiss.versions, p.split('/')[2])
  || Object.prototype.hasOwnProperty.call(SWISS_OWN_ROOTS, p.split('/').slice(1, 3).join('/'));

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
  const started = Date.now();
  const list = opt('list');
  const name = path.basename(list).replace(/\.txt$/, '');
  const urls = fs.readFileSync(path.resolve(root, list), 'utf8').split('\n').map((u) => u.trim()).filter(Boolean);
  const { stripScripts } = await import(path.join(CI, '../../excat-scrape-webpage/scripts/strip-scripts.js'));
  const byTemplate = {};
  const out = {};
  const missing = [];
  urls.forEach((u) => {
    const p = new URL(u).pathname;
    const f = path.join(SNAP, `${p}.html`);
    if (!fs.existsSync(f)) { missing.push(p); return; }
    const html = fs.readFileSync(f, 'utf8');
    const t = templateOf(p, html);
    const copy = path.join(MAPPED, HOST, `${p}.html`);
    fs.mkdirSync(path.dirname(copy), { recursive: true });
    const mapped = withOffersGridConfig(withoutLoads(withTabMarkers(withTeaserColumns(withCheckinTabs(withLinkOuts(withoutPlaceholders(withPlaceholder(withoutDatepicker(stripScripts(html)))), p))))))
      .replace(/<output[^>]*class="screen-reader-announcer"[^>]*>[\s\S]*?<\/output>/g, '');
    fs.writeFileSync(copy, mapped);
    (byTemplate[t] ||= []).push(u);
    out[p] = t;
  });
  console.log(`${name}: ${Object.entries(byTemplate).map(([t, l]) => `${t} ${l.length}`).join(', ')}; no snapshot: ${missing.length ? missing.join(' ') : 'none'}`);
  if (argv.includes('--dry-run')) process.exit(0);
  // the bulk importer writes its reports into lh-com's tree (tools/importer/reports/<path>), where
  // lh-com has reports of its own at the market roots' paths (/de/en/..., /at/de/...): set aside
  // before the import, put back after it (as swiss-import.mjs)
  const REPORTS = path.join(root, 'tools/importer/reports');
  const ASIDE = path.join(W, 'reports-aside');
  const aside = Object.keys(out).filter((p) => fs.existsSync(path.join(REPORTS, `${p}.report.json`)));
  aside.forEach((p) => {
    fs.mkdirSync(path.dirname(path.join(ASIDE, `${p}.report.json`)), { recursive: true });
    fs.copyFileSync(path.join(REPORTS, `${p}.report.json`), path.join(ASIDE, `${p}.report.json`));
  });
  Object.entries(byTemplate).forEach(([t, l]) => {
    const listFile = path.join(W, `urls-${name}-${t}.txt`);
    fs.writeFileSync(listFile, `${l.join('\n')}\n`);
    const log = execFileSync('node', [`${CI}/run-bulk-import.js`, '--import-script', `tools/importer/import-${t}.bundle.js`, '--urls', listFile, '--force', '--html-dir', MAPPED], {
      cwd: root, env: { ...process.env, WORKSPACE_PATH: W, BD_ENDPOINT: '' }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024,
    });
    log.split('\n').filter((x) => /Snapshot import failed|falling through to live/i.test(x)).forEach((x) => console.log(`WARNING (live fallback): ${x.trim()}`));
  });
  // a path the bulk importer writes without the characters Edge Delivery refuses ('&')
  const bulkName = (p) => p.split('/').map((seg) => seg.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-{2,}/g, '-').replace(/^-|-$/g, '')).join('/');
  // this batch's reports to the workspace, lh-com's set-aside ones back
  Object.keys(out).forEach((p) => {
    const from = path.join(REPORTS, `${p}.report.json`);
    [p, bulkName(p)].filter((x, i, a) => a.indexOf(x) === i).forEach((x) => {
      const made = path.join(REPORTS, `${x}.report.json`);
      if (!fs.existsSync(made) || fs.statSync(made).mtimeMs < started) return;
      const to = path.join(W, 'reports', `${x}.report.json`);
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.renameSync(made, to);
      for (let d = path.dirname(made); d.startsWith(`${REPORTS}/`) && fs.existsSync(d) && !fs.readdirSync(d).length; d = path.dirname(d)) fs.rmdirSync(d);
    });
    if (aside.includes(p)) {
      fs.mkdirSync(path.dirname(from), { recursive: true });
      fs.renameSync(path.join(ASIDE, `${p}.report.json`), from);
    }
    for (let d = path.dirname(from); d.startsWith(`${REPORTS}/`) && fs.existsSync(d) && !fs.readdirSync(d).length; d = path.dirname(d)) fs.rmdirSync(d);
  });
  const allow = JSON.parse(fs.readFileSync(path.join(root, 'tools/importer/sites/lh-swiss.json'), 'utf8'));
  const marketsFile = path.join(W, 'runs/markets.json');
  const markets = fs.existsSync(marketsFile) ? JSON.parse(fs.readFileSync(marketsFile, 'utf8')) : {};
  // the roots' own pages: the snapshots of the languages lh-swiss has (the others wait)
  const walk = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)])) : []);
  const own = walk(SNAP).filter((f) => f.endsWith('.html')).map((f) => `/${path.relative(SNAP, f).replace(/\.html$/, '')}`)
    .filter(onSite);
  // the market roots: the imported languages' homepages
  const marketRoots = own.filter((x) => x.endsWith('/homepage')).map((x) => x.split('/').slice(1, 3).join('/'));
  const served = servedPaths({
    own, sitePaths: new Set(allow.paths), markets, roots: marketRoots,
  });
  const subPages = capturedPages(SUB_SNAP);
  // a www path Edge Delivery refuses ("&"): the bulk importer writes it without the character
  // ("baggage-other-fees"); the document is named as swiss-import.mjs names it (docName:
  // "baggage-and-other-fees") and its www path a row of runs/redirects.tsv
  const redirects = [];
  Object.keys(out).filter((p) => docName(p) !== p).forEach((p) => {
    const from = path.join(W, 'content', `${bulkName(p)}.plain.html`);
    const to = path.join(W, 'content', `${docName(p)}.plain.html`);
    if (fs.existsSync(from) && from !== to) fs.renameSync(from, to);
    if (fs.existsSync(to)) redirects.push([p, docName(p)]);
  });
  if (redirects.length) {
    const file = path.join(W, 'runs/redirects.tsv');
    const had = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split('\n').filter(Boolean) : ['Source\tDestination'];
    fs.writeFileSync(file, `${[...new Set([...had, ...redirects.map((r) => r.join('\t'))])].join('\n')}\n`);
  }
  const made = Object.keys(out).filter((p) => fs.existsSync(path.join(W, 'content', `${docName(p)}.plain.html`)));
  made.forEach((p) => {
    const f = path.join(W, 'content', `${docName(p)}.plain.html`);
    const snapHtml = fs.readFileSync(path.join(SNAP, `${p}.html`), 'utf8');
    let doc = fs.readFileSync(f, 'utf8');
    doc = withItaForm(doc, p, snapHtml);
    doc = withPageLanguageMessages(doc, p);
    doc = withMarketOrigin(withFlightSearch(doc, p), snapHtml);
    doc = withItaMetadata(withCheckinHandoff(doc, p), p, snapHtml, []);
    doc = splitTabSections(withFlightSearchTeaser(withFlightSearchVideo(withHeroVideo(doc, snapHtml), snapHtml), snapHtml));
    // one h1 a page (www writes some of its subheadings as h1: h3, swiss-sub-import.mjs)
    doc = withOneH1(withOwnFlightSearchLinks(doc, p));
    // links: the root's pages and the language versions' relative, the rest on www; the DAM links
    // site-relative after them; www.lufthansa.com's own URLs back
    doc = relativeDamLinks(subSiteLinks(doc.split(`https://${LINK_OUT}`).join(`https://${HOST}`), { subPages, sitePaths: served }))
      .split(`https://${PLACEHOLDER}`).join('https://www.lufthansa.com');
    doc = withDaImages(withOwnSuccess(doc, (t) => served.has(t)));
    fs.writeFileSync(f, doc);
  });
  fs.mkdirSync(path.join(W, 'runs'), { recursive: true });
  fs.writeFileSync(path.join(W, 'runs', `${name}-upload.txt`), `${made.map(docName).join('\n')}\n`);
  fs.writeFileSync(path.join(W, 'runs', `${name}-import.json`), `${JSON.stringify({ templates: out, documents: made, missing }, null, 1)}\n`);
  console.log(`${made.length} documents; upload list runs/${name}-upload.txt`);
}
