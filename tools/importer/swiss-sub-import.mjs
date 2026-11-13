/* eslint-disable no-console, max-len, import/extensions, import/no-extraneous-dependencies -- tooling */
/**
 * Imports SWISS's sub-sites (lh-swiss: www.swiss.com's corporate site /corporate/<ll>/, en de fr,
 * and medical services /medicalservices/<ll>/, en de) offline from the capture's snapshots
 * (swiss-snapshots-025 to 027, placed in content-sites/lh-swiss-sub/snapshots-src/www.swiss.com)
 * into content-sites/lh-swiss-sub/content, next to swiss-import.mjs (the main site's ch/<ll> roots,
 * ema-cashub's), whose page steps it takes as they are: the offline CSP, the placeholders and link
 * outs, the tab sets, the forms (withItaForm: ids swiss-<page>, their success pages), the form
 * messages in the page's language, the metadata (nav and footer of the sub-site's language:
 * /corporate/de/nav). Its own steps (exported, test/swiss-sub-import.test.mjs):
 * - withoutSubSiteChrome: the snapshot's own header, breadcrumb, footer and dialogs go before the
 *   import (the sub-site's nav and footer documents carry them: swiss-sub-nav.mjs);
 * - withSearchResults: www's on-site search (onsitesearchresult) becomes lh-com's search-results
 *   block on the sub-site language's own index (/corporate/<ll>/search-index.json, helix-query.yaml);
 * - subSiteLinks: links to the sub-sites' pages relative (the captured pages; others to www),
 *   links to the main site's pages relative where lh-swiss has them (tools/importer/sites/
 *   lh-swiss.json), the rest absolute on www (site-postprocess.mjs postprocess);
 * - the DAM links site-relative (swiss-dam.mjs relativeDamLinks), www.lufthansa.com's own URLs
 *   put back after the import (swiss-import.mjs PLACEHOLDER).
 * The bulk importer's reports go to content-sites/lh-swiss-sub/reports (never lh-com's tree).
 * Writes runs/<name>-import.json (path -> template) and runs/<name>-upload.txt.
 *
 * Usage: node tools/importer/swiss-sub-import.mjs --list content-sites/lh-swiss-sub/runs/batch-01.txt [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  PLACEHOLDER, LINK_OUT, withPlaceholder, withLinkOuts, withTabMarkers, splitTabSections, withoutPlaceholders,
  withoutLoads, withTeaserColumns, withItaForm, withPageLanguageMessages, withItaMetadata, withOwnSuccess, divEnd,
} from './swiss-import.mjs';
import { relativeDamLinks } from './swiss-dam.mjs';
import { postprocess } from './site-postprocess.mjs';
import { SUB_SITES } from '../../scripts/site-languages.js';
import collapseDocs from './collapse-docs.mjs';
import { withRestoredNbsp } from './nbsp-guard.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const HOST = 'www.swiss.com';
export const W = path.join(root, 'content-sites/lh-swiss-sub');
const SNAP = path.join(W, 'snapshots-src', HOST);
const MAPPED = path.join(W, 'snapshots');
// EXCAT_IMPORT_SCRIPTS: the network-blocked copy (tools/importer/offline-importer.mjs); imports read snapshots only
const CI = process.env.EXCAT_IMPORT_SCRIPTS || '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts';
// the sub-sites' path prefixes (scripts/site-languages.js SUB_SITES)
export const SUB_SITE_NAMES = SUB_SITES.swiss.map((s) => s.name);
const SUB_PATH = new RegExp(`^/(?:${SUB_SITE_NAMES.join('|')})/[a-z]{2}(?:/|$)`);
// a link to a sub-site's page (www's absolute or relative spelling)
const SUB_LINK = new RegExp(`href="(?:https://(?:www\\.)?swiss\\.com)?(/(?:${SUB_SITE_NAMES.join('|')})/[^"?#]*?)(?:\\.html)?/?([?#][^"]*)?"`, 'g');

/** The html without the div (or element) that opens at each match of `open` (by div depth). */
function withoutDivs(html, open) {
  let out = html;
  for (let i = out.search(open); i >= 0; i = out.search(open)) out = `${out.slice(0, i)}${out.slice(divEnd(out, i))}`;
  return out;
}

/**
 * The snapshot without the sub-site's chrome: its header, the breadcrumb, the footer, the skip
 * links, the language dialogs (maui-modal) and the empty message box; the page's h1 and content
 * stay. The nav and footer documents carry the header and footer (swiss-sub-nav.mjs).
 */
export function withoutSubSiteChrome(html) {
  let out = html
    .replace(/<header\b[^>]*>[\s\S]*?<\/header>/g, '')
    .replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/g, '')
    .replace(/<maui-modal\b[^>]*class="[^"]*country-language-selector-modal[\s\S]*?<\/maui-modal>/g, '');
  out = withoutDivs(out, /<div class="skiplinks[ "]/);
  out = withoutDivs(out, /<div class="container-fluid container">\s*<div class="maui-breadcrumb/);
  out = withoutDivs(out, /<div class="dcep-general-message-box"[^>]*>\s*<\/div>/);
  // the form's jQuery UI date picker, appended to the body and hidden on www, is no content
  out = withoutDivs(out, /<div id="ui-datepicker-div"/);
  return out;
}

/**
 * One h1 a page: the first stays; www writes its teaser headings as h1 too (heading-copytext-large
 * teaser-heading, 40 corporate pages): those become h3, their ids and style markers kept.
 */
export function withOneH1(doc) {
  let seen = false;
  return doc.replace(/<h1(\s[^>]*)?>([\s\S]*?)<\/h1>/g, (m, attrs, inner) => {
    if (!seen) { seen = true; return m; }
    return `<h3${attrs || ''}>${inner}</h3>`;
  });
}

/**
 * www's on-site search (the onsitesearchresult component, its results drawn in the browser) as
 * lh-com's search-results block on the sub-site language's own query index (helix-query.yaml
 * search-<sub-site>-<ll>): a marker paragraph the import keeps, turned into the block after it.
 */
export const SEARCH_MARK = '@@search-results@@';
export function withSearchResults(html) {
  return html.replace(/<div class="onsitesearchresult[ "][\s\S]*?(?=<div class="[a-z]|<\/div>\s*<\/div>\s*<\/div>\s*$)/, '')
    .replace(/(<div class="container-content">)/, (m) => (/class="onsitesearchresult/.test(html) ? `${m}<div class="text section"><div class="richtext"><p>${SEARCH_MARK}</p></div></div>` : m));
}
export function searchResultsBlock(doc, p) {
  if (!doc.includes(SEARCH_MARK)) return doc;
  const [, sub, ll] = p.split('/');
  return doc.replace(new RegExp(`<p>${SEARCH_MARK}(?:\\s*\\{[^}]*\\})?</p>`), `<div class="search-results"><div><div>/${sub}/${ll}/search-index.json</div></div></div>`);
}

/**
 * The document's links: to a captured page of the sub-sites relative (www's absolute or relative
 * spelling), to the main site's pages relative where lh-swiss has them (sitePaths: its allowlist),
 * the rest absolute on www (postprocess); a sub-site path the capture lacks stays on www.
 */
export function subSiteLinks(doc, { subPages, sitePaths, mapHosts = true }) {
  // the import's www.lufthansa.com URLs on www.swiss.com first (and the main site's links);
  // mapHosts false: a document read from www's markup itself (the nav and footer), whose
  // www.lufthansa.com links are Lufthansa's
  const mapped = postprocess(doc, { sourceHost: HOST, sitePaths, mapHosts }).html;
  return mapped.replace(SUB_LINK, (m, p, rest = '') => {
    if (!SUB_PATH.test(p)) return m;
    // a sub-site's /<sub>/<ll>: its homepage document (the magazine's front page is itself a page)
    const page = /^\/[a-z]+\/[a-z]{2}$/.test(p) && !subPages.has(p) ? `${p}/homepage` : p;
    return subPages.has(page) ? `href="${page}${rest}"` : `href="https://${HOST}${p}${rest}"`;
  });
}

const EMPTY_CELLS = '<div></div>'.repeat(7);

/**
 * A form's success row from its :redirect where that is a sub-site page (the corporate forms'
 * /corporate/<ll>/...-success.html; swiss-import.mjs successOf reads the main site's
 * /content/lx/markets/ ones), before the form row; withOwnSuccess drops it when the site lacks the
 * page. A form with a success row, or without such a redirect, as it is.
 */
export function withSubSuccess(doc, html) {
  if (!/<div class="form[ "]/.test(doc) || /<div>config<\/div><div>success<\/div>/.test(doc)) return doc;
  const redirect = (String(html || '').match(/name=":redirect"[^>]*value="([^"]+)"|value="([^"]+)"[^>]*name=":redirect"/) || []).slice(1).find(Boolean) || '';
  const to = redirect.replace(/\.html$/, '');
  if (!SUB_PATH.test(to)) return doc;
  const row = `<div><div><a href="${to}">${to}</a></div><div>config</div><div>success</div>${EMPTY_CELLS}</div>`;
  return doc.replace(/<div><div>[^<]*<\/div><div>config<\/div><div>form<\/div>/, (m) => `${row}${m}`);
}

/** www's broken links to /<sub-site>/null/<ll>.html (medical services' header image) unwrapped. */
export const withoutNullLinks = (doc) => doc.replace(/<a href="(?:https:\/\/www\.swiss\.com)?\/(?:corporate|medicalservices)\/null\/[^"]*">([\s\S]*?)<\/a>/g, '$1');

/** The capture's pages: www paths of the snapshots under snapshots-src (sub-site paths only). */
export function capturedPages(dir = SNAP) {
  const out = new Set();
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
    const f = path.join(d, e.name);
    if (e.isDirectory()) walk(f);
    else if (e.name.endsWith('.html')) out.add(`/${path.relative(dir, f).replace(/\.html$/, '')}`);
  });
  if (fs.existsSync(dir)) walk(dir);
  return new Set([...out].filter((p) => SUB_PATH.test(p)));
}

/** The template: the sub-sites' pages are all information pages (lh-com's info import). */
export const templateOf = () => 'info';

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
  const started = Date.now();
  const list = opt('list');
  const name = path.basename(list).replace(/\.txt$/, '');
  const urls = fs.readFileSync(path.resolve(root, list), 'utf8').split('\n').map((u) => u.trim()).filter(Boolean);
  const { stripScripts } = await import(path.join(CI, '../../excat-scrape-webpage/scripts/strip-scripts.js'));
  const out = {};
  const missing = [];
  urls.forEach((u) => {
    const p = new URL(u).pathname;
    const f = path.join(SNAP, `${p}.html`);
    if (!fs.existsSync(f)) { missing.push(p); return; }
    const html = fs.readFileSync(f, 'utf8');
    const copy = path.join(MAPPED, HOST, `${p}.html`);
    fs.mkdirSync(path.dirname(copy), { recursive: true });
    const mapped = withoutLoads(withTabMarkers(withTeaserColumns(withLinkOuts(withoutPlaceholders(withSearchResults(withoutSubSiteChrome(withPlaceholder(stripScripts(html))))), p))))
      .replace(/<output[^>]*class="screen-reader-announcer"[^>]*>[\s\S]*?<\/output>/g, '');
    fs.writeFileSync(copy, mapped);
    out[p] = templateOf(p, html);
  });
  console.log(`${name}: ${Object.keys(out).length} pages; no snapshot: ${missing.length ? missing.join(' ') : 'none'}`);
  if (argv.includes('--dry-run')) process.exit(0);
  const listFile = path.join(W, `urls-${name}-info.txt`);
  fs.writeFileSync(listFile, `${Object.keys(out).map((p) => `https://${HOST}${p}`).join('\n')}\n`);
  const log = execFileSync('node', [`${CI}/run-bulk-import.js`, '--import-script', 'tools/importer/import-info.bundle.js', '--urls', listFile, '--force', '--html-dir', MAPPED], {
    cwd: root, env: { ...process.env, WORKSPACE_PATH: W, BD_ENDPOINT: '' }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024,
  });
  log.split('\n').filter((x) => /Snapshot import failed|falling through to live/i.test(x)).forEach((x) => console.log(`WARNING (live fallback): ${x.trim()}`));
  console.log(`info: ${log.split('\n').filter((x) => /imported|failed|error/i.test(x) && !/wss:|endpoint/i.test(x)).slice(-2).join(' | ')}`);
  // the bulk importer's reports (tools/importer/reports/<path>) to the workspace
  const REPORTS = path.join(root, 'tools/importer/reports');
  Object.keys(out).forEach((p) => {
    const from = path.join(REPORTS, `${p}.report.json`);
    if (!fs.existsSync(from) || fs.statSync(from).mtimeMs < started) return;
    const to = path.join(W, 'reports', `${p}.report.json`);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.renameSync(from, to);
    for (let d = path.dirname(from); d.startsWith(`${REPORTS}/`) && fs.existsSync(d) && !fs.readdirSync(d).length; d = path.dirname(d)) fs.rmdirSync(d);
  });
  const allow = JSON.parse(fs.readFileSync(path.join(root, 'tools/importer/sites/lh-swiss.json'), 'utf8'));
  const sitePaths = new Set(allow.paths);
  const subPages = capturedPages();
  const made = Object.keys(out).filter((p) => fs.existsSync(path.join(W, 'content', `${p}.plain.html`)));
  made.forEach((p) => {
    const f = path.join(W, 'content', `${p}.plain.html`);
    const snapHtml = fs.readFileSync(path.join(SNAP, `${p}.html`), 'utf8');
    let doc = fs.readFileSync(f, 'utf8');
    doc = splitTabSections(withItaMetadata(withPageLanguageMessages(withSubSuccess(withItaForm(doc, p, snapHtml), snapHtml), p), p, snapHtml));
    doc = withoutNullLinks(doc);
    doc = withOneH1(searchResultsBlock(doc, p));
    // (the DAM links site-relative after the page links: postprocess makes relative links absolute
    // on www where the site has no page of that path)
    doc = relativeDamLinks(subSiteLinks(doc.split(`https://${LINK_OUT}`).join(`https://${HOST}`), { subPages, sitePaths }))
      .split(`https://${PLACEHOLDER}`).join('https://www.lufthansa.com');
    // a form sends the visitor to its confirmation page on the sub-site, never to www's
    doc = withOwnSuccess(doc, (t) => subPages.has(t));
    fs.writeFileSync(f, doc);
  });
  fs.writeFileSync(path.join(W, 'runs', `${name}-upload.txt`), `${made.join('\n')}\n`);
  // the last step: no import writes style markers (token-free styling, tools/importer/marker-collapse.mjs)
  collapseDocs(withRestoredNbsp(made.map((p) => path.join(W, 'content', `${p}.plain.html`)), fs), { brand: 'swiss', content: path.join(W, 'content') });
  fs.writeFileSync(path.join(W, 'runs', `${name}-import.json`), `${JSON.stringify({ templates: out, documents: made, missing }, null, 1)}\n`);
  console.log(`${made.length} documents; upload list runs/${name}-upload.txt`);
}
