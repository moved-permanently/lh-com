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
  withFlightSearchTeaser, withOwnFlightSearchLinks, templateOf, divEnd,
} from './swiss-import.mjs';
import { relativeDamLinks } from './swiss-dam.mjs';
import { subSiteLinks, capturedPages } from './swiss-sub-import.mjs';
import { withDaImages } from './swiss-sub-dam.mjs';
import { BRAND_SITES } from '../../scripts/brands.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const HOST = 'www.swiss.com';
export const W = path.join(root, 'content-sites/lh-swiss-mk');
const SNAP = path.join(W, 'snapshots-src', HOST);
const MAPPED = path.join(W, 'snapshots');
const SUB_SNAP = path.join(root, 'content-sites/lh-swiss-sub/snapshots-src', HOST);
const CI = '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts';

const decode = (s) => String(s || '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'");

/**
 * The homepage's flight search origin: its origin field's value (the city in the root's
 * language) and code (the most frequent origin of its fare teasers), "Frankfurt (FRA)"; else ''.
 */
export function marketOriginOf(html) {
  const s = String(html || '');
  const field = s.match(/name="flightQuery\.flightSegments\[0\]\.originCode"[^>]*value="([^"]+)"|value="([^"]+)"[^>]*name="flightQuery\.flightSegments\[0\]\.originCode"/);
  const name = decode(field && (field[1] || field[2])).trim();
  const codes = [...decode(s).matchAll(/"origin":"([A-Z]{3})"/g)].map((m) => m[1]);
  if (!name || !codes.length) return '';
  const count = codes.reduce((c, x) => ({ ...c, [x]: (c[x] || 0) + 1 }), {});
  const code = Object.entries(count).sort((a, b) => b[1] - a[1])[0][0];
  return `${name} (${code})`;
}

/**
 * The flight-search blocks (their Shop row: swiss-import.mjs withFlightSearch) with the root's
 * default origin after it where they have none.
 */
export function withMarketOrigin(doc, html) {
  const origin = marketOriginOf(html);
  if (!origin) return doc;
  return doc.replace(/(<div class="flight-search(?: [^"]*)?"><div><div>Shop<\/div><div><a href="[^"]*">[^<]*<\/a><\/div><\/div>)(?!<div><div>Default origin)/g, `$1<div><div>Default origin</div><div>${origin}</div></div>`);
}

/**
 * The pages roots have on the site: own (their documents' paths), the language versions'
 * documents (sitePaths, ch/<ll>) and, per market root, ch/<ll>'s pages whose markets lists it
 * (markets: {"/ch/en/x": ["de/en", ...]}). A Set of paths.
 */
export function servedPaths({ own, sitePaths, markets }) {
  const out = new Set([...own, ...sitePaths]);
  Object.entries(markets).forEach(([p, roots]) => {
    if (!Array.isArray(roots)) return;
    const m = p.match(/^\/ch\/([a-z]{2})(\/.*)$/);
    if (!m) return;
    roots.filter((r) => r.endsWith(`/${m[1]}`)).forEach((r) => out.add(`/${r}${m[2]}`));
  });
  return out;
}

/** The snapshot without the form's jQuery UI date picker (hidden on www, no content). */
export function withoutDatepicker(html) {
  let out = html;
  for (let i = out.search(/<div id="ui-datepicker-div"/); i >= 0; i = out.search(/<div id="ui-datepicker-div"/)) out = `${out.slice(0, i)}${out.slice(divEnd(out, i))}`;
  return out;
}

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
  // this batch's reports to the workspace, lh-com's set-aside ones back
  Object.keys(out).forEach((p) => {
    const from = path.join(REPORTS, `${p}.report.json`);
    if (fs.existsSync(from) && fs.statSync(from).mtimeMs >= started) {
      const to = path.join(W, 'reports', `${p}.report.json`);
      fs.mkdirSync(path.dirname(to), { recursive: true });
      fs.renameSync(from, to);
    }
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
    .filter((p) => Object.prototype.hasOwnProperty.call(BRAND_SITES.swiss.versions, p.split('/')[2]));
  const served = servedPaths({ own, sitePaths: new Set(allow.paths), markets });
  const subPages = capturedPages(SUB_SNAP);
  const made = Object.keys(out).filter((p) => fs.existsSync(path.join(W, 'content', `${p}.plain.html`)));
  made.forEach((p) => {
    const f = path.join(W, 'content', `${p}.plain.html`);
    const snapHtml = fs.readFileSync(path.join(SNAP, `${p}.html`), 'utf8');
    let doc = fs.readFileSync(f, 'utf8');
    doc = withItaForm(doc, p, snapHtml);
    doc = withPageLanguageMessages(doc, p);
    doc = withMarketOrigin(withFlightSearch(doc, p), snapHtml);
    doc = withItaMetadata(withCheckinHandoff(doc, p), p, snapHtml, []);
    doc = splitTabSections(withFlightSearchTeaser(withFlightSearchVideo(withHeroVideo(doc, snapHtml), snapHtml), snapHtml));
    doc = withOwnFlightSearchLinks(doc, p);
    // links: the root's pages and the language versions' relative, the rest on www; the DAM links
    // site-relative after them; www.lufthansa.com's own URLs back
    doc = relativeDamLinks(subSiteLinks(doc.split(`https://${LINK_OUT}`).join(`https://${HOST}`), { subPages, sitePaths: served }))
      .split(`https://${PLACEHOLDER}`).join('https://www.lufthansa.com');
    doc = withDaImages(withOwnSuccess(doc, (t) => served.has(t)));
    fs.writeFileSync(f, doc);
  });
  fs.mkdirSync(path.join(W, 'runs'), { recursive: true });
  fs.writeFileSync(path.join(W, 'runs', `${name}-upload.txt`), `${made.join('\n')}\n`);
  fs.writeFileSync(path.join(W, 'runs', `${name}-import.json`), `${JSON.stringify({ templates: out, documents: made, missing }, null, 1)}\n`);
  console.log(`${made.length} documents; upload list runs/${name}-upload.txt`);
}
