/* eslint-disable no-console, max-len, import/prefer-default-export, import/extensions, no-use-before-define, import/no-extraneous-dependencies -- tooling */
/**
 * Imports one batch of SWISS's pages (lh-swiss) offline from their snapshots
 * (tools/importer/bd-snapshots/www.swiss.com: the Studio's capture, swiss-studio.mjs)
 * with lh-com's import scripts into content-sites/lh-swiss/content, built as brussels-import.mjs:
 * per page the template whose components it has (templateOf), then site-postprocess.mjs (the
 * www.lufthansa.com URLs of lh-com's importers back to www.swiss.com, links between the site's
 * pages relative), after adding the batch's documents to the allowlist
 * tools/importer/sites/lh-swiss.json. Per document (one per language page, option B):
 * - widgets a service answers on www become a link to the page on www (withLinkOuts, class C):
 *   the FAQ search bar, the "fly more sustainably" PNR search, the
 *   passenger receipt portal, the rebook pages' booking login (dcep-login-form) and ch/de's refund
 *   login (dcep-voucher-exchange) with their intro text, iframes the embed block doesn't play (www's
 *   AR viewer); the embed block plays YouTube, the in-flight entertainment widgets, the eJournals
 *   newsstand and the Google Maps embed;
 * - left out (withoutPlaceholders): the empty inpagewidget and ghost placeholders and the
 *   homepage's Travel ID personalisation (ppfi-web-component);
 * - articles (template article) import with lh-com's insights template (article-header,
 *   price-bar), slideshows with fleet (carousel-lightbox);
 * - the core forms get a form config row with a proposed lh-forms id swiss-<page> (withForm;
 *   preview only until lh-forms knows them);
 * - the flight search hands off to shop.swiss.com from Zurich (withFlightSearch);
 * - the check-in entry becomes the booking-lookup block (withCheckinTabs), its hand-off the page
 *   on www (withCheckinHandoff); the booking login's "Enter booking code" opens the page on www;
 * - two-column teaser rows import as carousel-cards (withTeaserColumns);
 * - metadata (withItaMetadata): the root's nav and footer, `markets` (scope.json), www's noindex;
 * - a path Edge Delivery refuses (capitals, "&", double, leading or trailing hyphens) becomes its
 *   document name (docName) and a row of content-sites/lh-swiss/runs/redirects.tsv;
 * - links to www's DAM files become site-relative edsDamPath links (swiss-dam.mjs).
 * Writes content-sites/lh-swiss/runs/<name>-import.json: path -> template.
 *
 * Usage: node tools/importer/swiss-import.mjs --list content-sites/lh-swiss/runs/batch-01.txt [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import {
  ownPages, ownAliases, ownServed, withOwnLinks, onlyBatch,
} from './own-links.mjs';
import { relativeDamLinks } from './swiss-dam.mjs';
import { edsDamPath } from '../../scripts/dam-path.js';
import { withLocalImages } from './swiss-nav.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
const HOST = 'www.swiss.com';
const W = path.join(root, 'content-sites/lh-swiss');
const SNAP = path.join(root, 'tools/importer/bd-snapshots', HOST);
const CI = '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts';
// the source pages' own lufthansa.com URLs on a placeholder host during the import (as Discover)
export const PLACEHOLDER = 'www.lufthansa-com.invalid';
const MAPPED = path.join(W, 'snapshots');
const { stripScripts } = await import(path.join(CI, '../../excat-scrape-webpage/scripts/strip-scripts.js'));
export const withPlaceholder = (html) => html.replace(/(?:https?:)?\/\/(?:www\.)?lufthansa\.com(?![\w.-])/gi, `https://${PLACEHOLDER}`);

// links out to the page on www (a widget a service answers there): on this host during the import
export const LINK_OUT = 'link-out.invalid';
// the iframes the embed block plays (scripts/media.js embedFor)
const EMBEDDED = /^https:\/\/(?:(?:www\.)?(?:youtube(?:-nocookie)?\.com|(?:lufthansa|swiss)-inflightentertainment\.com)\/|box\.media-carrier\.de\/|www\.google\.com\/maps\/embed\?pb=)/;
const text = (h) => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
// the page's visible H1, else its title without the brand ("Culinary Journey | SWISS")
const h1Of = (html) => text((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/g) || []).map((x) => x).find((x) => !/sr-only/.test(x)) || '')
  || text((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '').replace(/\s*\|\s*SWISS\s*$/, '');

/**
 * A snapshot whose live widgets are a link to the page on www (class C): the PNR search and the
 * passenger receipt portal (labelled with the page's H1), the booking logins (their intro text and
 * the H1), the FAQ search bar (with its own label; lh-swiss has no search index yet), iframes the
 * embed block doesn't play (with their title, else the H1). The check-in deadline search
 * (checkin-deadlines) and the culinary hub (micro-frontend) are lh-com blocks.
 */
export function withLinkOuts(html, p) {
  const linkOut = (label) => `<div class="text section"><div class="richtext"><p><a href="https://${LINK_OUT}${p}">${label}</a></p></div></div>`;
  let out = html;
  // the "fly more sustainably" PNR search (pnr-search-module micro-frontend in a wrapper)
  const pnr = out.search(/<div class="wrapper section">\s*<pnr-search-module/);
  if (pnr >= 0) out = `${out.slice(0, pnr)}${linkOut(h1Of(html) || HOST)}${out.slice(divEnd(out, pnr))}`;
  out = editDivs(out, '<div class="dcep-search-bar', (el) => linkOut((el.match(/<label[^>]*>([^<]+)<\/label>/) || [])[1] || h1Of(html) || HOST));
  // the passenger receipt portal (a micro-frontend lh-com has no entry for)
  const pax = out.search(/<div class="wrapper section">\s*<passenger-receipt-portal/);
  if (pax >= 0) out = `${out.slice(0, pax)}${linkOut(h1Of(html) || HOST)}${out.slice(divEnd(out, pax))}`;
  // the booking logins (the rebook pages' dcep-login-form, ch/de's refund dcep-voucher-exchange):
  // their intro text, then the link to the page on www
  const login = (el) => {
    const intro = (el.match(/<div class="richtext[^"]*">([\s\S]*?)<\/div>/) || [])[1] || '';
    return `<div class="text section"><div class="richtext">${intro.trim()}<p><a href="https://${LINK_OUT}${p}">${h1Of(html) || HOST}</a></p></div></div>`;
  };
  out = editDivs(editDivs(out, '<div class="loginform', login), '<div class="voucherexchange', login);
  return out.replace(/<div class="iframe[ "][^>]*>\s*<div class="iframe-wrapper[^>]*>\s*<iframe\b([^>]*)>[\s\S]*?<\/iframe>\s*<\/div>\s*<\/div>/g, (m, attrs) => {
    const src = (attrs.match(/\ssrc="([^"]+)"/) || [])[1] || '';
    if (EMBEDDED.test(src)) return m;
    const label = (attrs.match(/\stitle="([^"]+)"/) || [])[1] || h1Of(html) || HOST;
    return `<div class="iframe-link-out"><p><a href="https://${LINK_OUT}${p}">${label}</a></p></div>`;
  });
}

// the components a tab panel holds that become blocks (a set with one of them: Tab sections; a
// set of text only stays lh-com's profile-tabs)
const TAB_BLOCKS = /class="(?:twocolumn|threecolumn|fourcolumn|accordion|table|sidebar|teaser|imagelinklist|video|videoViewer|iframe|carousel|slideshow)[ "]/;
const marker = (label) => `<div class="text section"><div class="richtext"><p>${label}</p></div></div>`;

/**
 * A snapshot whose tab sets that hold blocks (www's maui-tab-control-responsive with column
 * views, accordions, tables ...) are their panels one after the other, a marker paragraph before
 * each (@@tab@@<set>@@<label>@@) and after the set (@@tabs-end@@): splitTabSections makes the
 * document's Tab sections of them (scripts/section-tabs.js). Text-only sets as they are.
 */
export function withTabMarkers(html) {
  let n = 0;
  return editDivs(html, '<div class="tabs panelcontainer', (el) => {
    const panels = [...el.matchAll(/<maui-tab-control-panel-responsive\b([^>]*)>([\s\S]*?)<\/maui-tab-control-panel-responsive>/g)]
      .map((m) => [((m[1].match(/\sname="([^"]*)"/) || [])[1] || '').replace(/\s+/g, ' ').trim(), m[2]]);
    if (!panels.length || !panels.some(([, body]) => TAB_BLOCKS.test(body))) return el;
    n += 1;
    return `${panels.map(([label, body]) => `${marker(`@@tab@@${n}@@${label.replace(/@/g, '')}@@`)}${body}`).join('')}${marker('@@tabs-end@@')}`;
  });
}

const TAB_MARK = /^@@tab@@(\d+)@@(.*)@@$/;
const END_MARK = '@@tabs-end@@';

/**
 * The document's tab markers (withTabMarkers) as sections: the content before a set, a section
 * per panel with the section metadata Tab (its label) and Tabs (the set's number), the content
 * after it; a section's own metadata stays with its parts outside the set. A marker the import
 * put inside a block cannot split its section: it goes, the panels stay one after the other.
 */
export function splitTabSections(doc) {
  if (!doc.includes('@@tab')) return doc;
  const { document } = parseHTML(`<html><body>${doc}</body></html>`);
  const metaRows = (rows) => `<div class="section-metadata">${rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('')}</div>`;
  const out = [...document.body.children].map((section) => {
    const kids = [...section.children];
    const isMark = (c) => c.tagName === 'P' && (TAB_MARK.test(c.textContent.trim()) || c.textContent.trim() === END_MARK);
    if (!kids.some(isMark)) return section.outerHTML;
    const own = kids.find((c) => c.classList.contains('section-metadata'));
    const parts = [{ tab: null, html: [] }];
    kids.filter((c) => c !== own).forEach((c) => {
      const line = c.tagName === 'P' ? c.textContent.trim() : '';
      const m = line.match(TAB_MARK);
      if (m) parts.push({ tab: m[2].trim(), set: m[1], html: [] });
      else if (line === END_MARK) parts.push({ tab: null, html: [] });
      else parts.at(-1).html.push(c.outerHTML);
    });
    return parts.filter((p) => p.tab || p.html.length).map((p) => {
      let tail = own ? own.outerHTML : '';
      if (p.tab) tail = metaRows([['Tab', p.tab], ['Tabs', p.set]]);
      return `<div>${p.html.join('')}${tail}</div>`;
    }).join('\n');
  }).join('\n');
  // markers inside a block (no split there): the text goes
  return out.replace(/<p>@@tab@@\d+@@[^<]*@@<\/p>|<p>@@tabs-end@@<\/p>/g, '');
}

/**
 * A snapshot without www's empty placeholders: the inpagewidget and ghost components (no content
 * in the server HTML) and the homepage's Travel ID personalisation (ppfi-web-component in its
 * wrapper), left out as on the other brands.
 */
export function withoutPlaceholders(html) {
  let out = editDivs(html, '<div class="inpagewidget', () => '');
  out = editDivs(out, '<div class="ghost', () => '');
  for (let i = out.search(/<div class="wrapper section">\s*<div[^>]*data-dcep="[^"]*ppfi/); i >= 0; i = out.search(/<div class="wrapper section">\s*<div[^>]*data-dcep="[^"]*ppfi/)) {
    out = `${out.slice(0, i)}${out.slice(divEnd(out, i))}`;
  }
  return out;
}

/**
 * A snapshot that loads nothing while it is imported: the import browser renders it with
 * setContent, and its absolute www.swiss.com URLs (about 40 images per page) would be fetched
 * from www. A Content-Security-Policy meta tag refuses every subresource (images, styles, fonts,
 * frames, requests) and allows only the importer's inline script; the URLs stay in the markup.
 */
export const OFFLINE_CSP = "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval'; style-src 'unsafe-inline'; img-src data: blob:; font-src data:";
export const withoutLoads = (html) => html.replace(/<head(\s[^>]*)?>/i, (m) => `${m}<meta http-equiv="Content-Security-Policy" content="${OFFLINE_CSP}">`);

/** The end (index after its closing tag) of the div that opens at `start`, by div depth. */
export function divEnd(html, start) {
  const re = /<div\b|<\/div>/g;
  re.lastIndex = start;
  let depth = 0;
  let m = re.exec(html);
  while (m) {
    depth += m[0] === '</div>' ? -1 : 1;
    if (depth === 0) return m.index + m[0].length;
    m = re.exec(html);
  }
  return html.length;
}

/** The html with each div whose opening tag starts with `open` given to `edit` (its outer html). */
function editDivs(html, open, edit) {
  let out = '';
  let from = 0;
  let i = html.indexOf(open, from);
  while (i >= 0) {
    const end = divEnd(html, i);
    out += html.slice(from, i) + edit(html.slice(i, end));
    from = end;
    i = html.indexOf(open, from);
  }
  return out + html.slice(from);
}

/**
 * A snapshot whose check-in entry sits in a tabs container as on lufthansa.com (ITA's
 * .checkinpassengerreceiptentry stands alone; lh-com's app-entry importer reads it from
 * ".tabs:has(.checkinpassengerreceiptentry)" into the booking-lookup block). Only the entry's
 * markup changes (a wrapper div), the rest of the snapshot stays as captured.
 */
export function withCheckinTabs(html) {
  if (/class="tabs[ "][^>]*>\s*<div class="checkinpassengerreceiptentry/.test(html)) return html;
  return editDivs(html, '<div class="checkinpassengerreceiptentry', (el) => `<div class="tabs section">${el}</div>`);
}

/**
 * A snapshot whose teaser rows in a two-column view (www's "Related", "This might also interest
 * you": two teasers side by side) are a three-column view, which lh-com's info importer makes a
 * carousel-cards block (".threecolumn:has(.teaser)"; its two-column views with teasers are left
 * to the text flow, where the teasers stack). Column views nested in it are left as they are.
 */
export const withTeaserColumns = (html) => editDivs(html, '<div class="twocolumn', (el) => {
  if (!el.includes('class="teaser') || /<div class="(?:two|three|four)column/.test(el.slice(1))) return el;
  return el.replace('<div class="twocolumn', '<div class="threecolumn').replace('data-identifier="twocolumn"', 'data-identifier="threecolumn"');
});

// the booking-lookup's hand-off: www's check-in app is not reachable from the replica (and its
// target is not in the page), so a valid search opens the same page on www, nothing in the URL
export const withCheckinHandoff = (doc, p) => doc
  // the login widget's "Enter booking code" (lh-com: its own dialog) opens the page on www
  .split('href="#booking-code"').join(`href="https://${HOST}${p}"`).replace(/<div class="booking-lookup(?: [^"]*)?">/g, (m) => (/Submit URL/.test(doc) ? m : `${m}<div><div>Submit URL</div><div>https://${HOST}${p}</div></div>`));

// the core forms: a proposed lh-forms id per page name (swiss-<page>; lh-forms does not know
// them yet, so the form pages stay on preview)
export const formIdOf = (p) => `swiss-${p.split('/').pop().replace(/[^a-z0-9-]/gi, '-').toLowerCase()}`;
const CONFIG_ROW = /<div><div>(?:(?!<\/div><div>)[\s\S])*?<\/div><div>config<\/div><div>(?:form|success|error)<\/div>(?:<div><\/div>){7}<\/div>/g;
const ERROR_ROW = /<div><div>(?:(?!<\/div><div>)[\s\S])*?<\/div><div>config<\/div><div>error<\/div>(?:<div><\/div>){7}<\/div>/g;
const configRow = (name, value) => `<div><div>${value}</div><div>config</div><div>${name}</div>${'<div></div>'.repeat(7)}</div>`;
const linkRow = (name, href) => configRow(name, `<a href="${href}">${href}</a>`);

/** www's confirmation page of a form (its :redirect) as the public path on the site. */
export function successOf(html) {
  const redirect = (String(html || '').match(/name=":redirect"[^>]*value="([^"]+)"|value="([^"]+)"[^>]*name=":redirect"/) || []).slice(1).find(Boolean) || '';
  const m = redirect.match(/^\/content\/lx\/markets(\/[a-z]{2}\/[a-z]{2})(\/.+?)(?:\.html)?$/);
  return m ? `${m[1]}${m[2]}` : '';
}

/**
 * A SWISS form document with its form config row (the proposed lh-forms id) and its success
 * row (www's confirmation page; lh-com's parser only maps /content/lh/markets/ paths); the
 * parser's error row stays. Others as they are.
 */
export function withItaForm(doc, p, html = '') {
  if (!/<div class="form[ "]/.test(doc)) return doc;
  const id = formIdOf(p);
  const success = successOf(html);
  const rows = [...doc.matchAll(CONFIG_ROW)].map((m) => m[0]);
  const has = (name) => rows.some((r) => r.includes(`<div>config</div><div>${name}</div>`));
  let out = doc;
  if (has('form')) out = out.replace(rows.find((r) => r.includes('<div>config</div><div>form</div>')), configRow('form', id));
  const add = [has('form') ? '' : configRow('form', id), success && !has('success') ? linkRow('success', success) : ''].join('');
  const first = [...out.matchAll(CONFIG_ROW)][0];
  if (add && first) out = `${out.slice(0, first.index)}${add}${out.slice(first.index)}`;
  // no error row (www's /error.html answers 404 here: the block shows its message in place); the
  // drop zones whose accept is no type list ("pdf, png, jpg") get the four types and the full
  // not-allowed set (lh-forms' FILE_RULES for these forms)
  return out.replace(ERROR_ROW, '')
    .replace(/accept=(?:Approved file formats: pdf, png and jpg\.|pdf, png, jpg)(?=<br>)/g, 'accept=image/png, image/jpeg, image/jpg, application/pdf')
    .replace(/(max-size=2048000<br> not-allowed=)#(?=<\/div>)/g, '$1#$$%^*()[]');
}

/** Metadata rows (name, value) added to the document's metadata block (made when it has none). */
export function withMetadataRows(doc, rows) {
  const add = rows.filter(([name]) => !new RegExp(`<div><div>${name}</div>`, 'i').test(doc));
  if (!add.length) return doc;
  const cells = add.map(([n, v]) => `<div><div>${n}</div><div>${v}</div></div>`).join('');
  if (doc.includes('<div class="metadata">')) return doc.replace('<div class="metadata">', `<div class="metadata">${cells}`);
  return `${doc.trimEnd()}\n<div><div class="metadata">${cells}</div></div>\n`;
}

/** The document's metadata: nav and footer of its root, its markets, www's noindex. */
export function withItaMetadata(doc, p, html, markets = []) {
  const key = p.split('/').slice(1, 3).join('/');
  const rows = [['nav', `/${key}/nav`], ['footer', `/${key}/footer`]];
  if (markets.length) rows.push(['markets', markets.join(', ')]);
  const robots = ((html || '').match(/<meta name="robots" content="([^"]*)"/i) || [])[1] || '';
  if (/noindex/i.test(robots)) rows.push(['Robots', robots.split(',').map((x) => x.trim()).filter(Boolean).join(', ')]);
  return withMetadataRows(doc, rows);
}

// the flight search hands the search to SWISS's shop (www's flight manager hands off to
// shop.swiss.com, the same booking platform as Lufthansa's) and starts from Zurich
export const SHOP = 'https://shop.swiss.com/booking/availability';
// the market's airport per root, named in the root's language (the homepages' flight search)
const DEFAULT_ORIGIN = { 'ch/en': 'Zurich (ZRH)', 'ch/de': 'Zürich (ZRH)' };

/** The document's flight-search blocks with the Shop row and the market's default origin. */
export function withFlightSearch(doc, p) {
  const key = p.split('/').slice(1, 3).join('/');
  return doc.replace(/<div class="flight-search(?: [^"]*)?">/g, (m) => {
    const rows = [`<div><div>Shop</div><div><a href="${SHOP}">${SHOP}</a></div></div>`];
    if (DEFAULT_ORIGIN[key]) rows.push(`<div><div>Default origin</div><div>${DEFAULT_ORIGIN[key]}</div></div>`);
    return `${m}${rows.join('')}`;
  });
}

/**
 * The document name of a www path Edge Delivery refuses: lower case, "&" as "and", underscores and
 * other characters as hyphens, single hyphens, none at a segment's start or end.
 */
export const docName = (p) => p.split('/').map((seg) => seg.toLowerCase().replace(/&/g, '-and-').replace(/[^a-z0-9-]/g, '-')
  .replace(/-{2,}/g, '-')
  .replace(/^-|-$/g, '')).join('/');

const REDIRECTS = path.join(W, 'runs/redirects.tsv');

/** The redirect rows (www path, document path) for the paths renamed, added to runs/redirects.tsv. */
export function withRedirects(paths) {
  const rows = fs.existsSync(REDIRECTS) ? fs.readFileSync(REDIRECTS, 'utf8').trim().split('\n').slice(1)
    .filter(Boolean) : [];
  const have = new Set(rows.map((r) => r.split('\t')[0]));
  paths.filter((p) => !have.has(p)).forEach((p) => rows.push(`${p}\t${docName(p)}`));
  fs.mkdirSync(path.dirname(REDIRECTS), { recursive: true });
  fs.writeFileSync(REDIRECTS, `${['source\tdestination', ...rows.sort()].join('\n')}\n`);
}

/**
 * The hero's video: www's moving image (data-dcep movingImage: imageUrl, videoUrl) of the hero's
 * picture as a link after the picture (blocks/hero-card-overlay plays it), at its /content/dam
 * path (scripts/dam-path.js edsDamPath: the AEM sandbox holds the large ones under that name).
 * A hero with a video link already, or whose picture has no video on www: as it is.
 */
export function withHeroVideo(doc, html) {
  const pairs = [...String(html || '').replace(/&quot;/g, '"').matchAll(/"imageUrl"\s*:\s*"([^"]+)"\s*,\s*"videoUrl"\s*:\s*"([^"]+\.mp4)"/g)]
    .map((m) => [edsDamPath(m[1]), edsDamPath(m[2])]);
  if (!pairs.length) return doc;
  return doc.replace(/(<div class="hero-card-overlay(?: [^"]*)?"><div><div>)([\s\S]*?<\/picture>)(?!<p><a href="[^"]+\.mp4")/, (m, open, pic) => {
    const src = (pic.match(/<img src="([^"]+)"/) || [])[1] || '';
    const pair = pairs.find(([img]) => src.split('?')[0].endsWith(img));
    return pair ? `${open}${pic}<p><a href="${pair[1]}">${pair[1]}</a></p>` : m;
  });
}

/**
 * The flight search's moving image (www's flight manager with a promotion teaser: its
 * linkModeConfig.movingImage, the Bengaluru video on nine pilot pages) as the block's Background
 * image and Background video rows (blocks/flight-search plays it behind the search), the video at
 * its /content/dam path (the AEM sandbox's name). A page with a hero (the homepages: the hero
 * plays it), a flight search with a Background image already, or no moving image: as it is.
 */
export function withFlightSearchVideo(doc, html) {
  if (!/<div class="flight-search(?: [^"]*)?">/.test(doc) || doc.includes('class="hero-card-overlay')) return doc;
  const m = String(html || '').replace(/&quot;/g, '"')
    .match(/"promotionTeaser"\s*:\s*\{[\s\S]*?"movingImage"\s*:\s*\{\s*"imageUrl"\s*:\s*"([^"]+)"\s*,\s*"videoUrl"\s*:\s*"([^"]+\.mp4)"/);
  if (!m) return doc;
  const video = edsDamPath(m[2]);
  return doc.replace(/(<div class="flight-search(?: [^"]*)?">)(?!<div><div>Background image<\/div>)/, (open) => `${open}<div><div>Background image</div><div><picture><img src="https://${HOST}${m[1]}" alt=""></picture></div></div><div><div>Background video</div><div><a href="${video}">${video}</a></div></div>`);
}

/** The template of a page from its path and snapshot. */
export function templateOf(p, html) {
  if (/^\/[a-z]{2}\/[a-z]{2}\/homepage$/.test(p)) return 'homepage';
  // articles and the article hub: lh-com's insights template (article-header, price-bar)
  if (/<meta name="template" content="article"/.test(html) || /class="dcep-blog-overview/.test(html)) return 'insights';
  if (/class="topoffersdestinationfinder/.test(html)) return 'hub';
  if (/class="flightstatustimetable/.test(html)) return 'flight-status';
  if (/class="slideshow/.test(html)) return 'fleet';
  // the culinary journey (www's <culinary-hub> micro-frontend): the micro-frontend block, as Discover
  if (/<culinary-hub[\s>]/.test(html)) return 'mfe';
  if (/checkinpassengerreceiptentry|class="[^"]*dcep-quick-actions/.test(html)) return 'app-entry';
  return 'info';
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const started = Date.now();
  const list = opt('list');
  const name = path.basename(list).replace(/\.txt$/, '');
  const urls = fs.readFileSync(path.resolve(root, list), 'utf8').split('\n').map((u) => u.trim()).filter(Boolean);
  const scopeFile = path.join(W, 'scope.json');
  const scope = fs.existsSync(scopeFile) ? JSON.parse(fs.readFileSync(scopeFile, 'utf8')) : { documents: {} };
  const byTemplate = {};
  const missing = [];
  const out = {};
  const linkOuts = [];
  urls.forEach((u) => {
    const p = new URL(u).pathname;
    const f = path.join(SNAP, `${p}.html`);
    if (!fs.existsSync(f)) { missing.push(p); return; }
    const html = fs.readFileSync(f, 'utf8');
    const t = templateOf(p, html);
    const copy = path.join(MAPPED, HOST, `${p}.html`);
    fs.mkdirSync(path.dirname(copy), { recursive: true });
    // (the help centre app's screen-reader announcement "Help page loaded." is no page text;
    // the Studio's snapshots keep www's scripts, which must not run in the import browser)
    // (the form's jQuery UI date picker, appended to the body and hidden on www, is no content)
    const mapped = withoutLoads(withTabMarkers(withTeaserColumns(withCheckinTabs(withLinkOuts(withoutPlaceholders(withPlaceholder(editDivs(stripScripts(html), '<div id="ui-datepicker-div"', () => ''))), p)))))
      .replace(/<output[^>]*class="screen-reader-announcer"[^>]*>[\s\S]*?<\/output>/g, '');
    if (mapped.includes(`https://${LINK_OUT}`)) linkOuts.push(p);
    fs.writeFileSync(copy, mapped);
    (byTemplate[t] ||= []).push(u);
    out[p] = t;
  });
  console.log(`${name}: ${Object.entries(byTemplate).map(([t, l]) => `${t} ${l.length}`).join(', ')}; no snapshot: ${missing.length ? missing.join(' ') : 'none'}`);
  if (!argv.includes('--dry-run')) {
    // the bulk importer loads a page live (page.goto) unless its workspace is flagged protected:
    // the flag first, so every page comes from its snapshot and nothing is requested from www
    // (without it the first pages of a new workspace went to www live until one was refused)
    const flag = path.join(W, '.migration/project.json');
    const flags = fs.existsSync(flag) ? JSON.parse(fs.readFileSync(flag, 'utf8')) : {};
    if (flags.botProtected !== true) {
      fs.mkdirSync(path.dirname(flag), { recursive: true });
      fs.writeFileSync(flag, `${JSON.stringify({ ...flags, botProtected: true }, null, 2)}\n`);
    }
    // the bulk importer writes its reports into lh-com's tree (tools/importer/reports/<path>),
    // where lh-com has reports of its own at paths SWISS has too (/ch/en/..., /ch/de/...):
    // those are set aside before the import and put back after it
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
        // no Bright Data fallback from inside the import (BD_ENDPOINT empty): pages come from snapshots
        cwd: root, env: { ...process.env, WORKSPACE_PATH: W, BD_ENDPOINT: '' }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024,
      });
      // a snapshot import that failed falls through to a live load of www: name every one
      log.split('\n').filter((x) => /Snapshot import failed|falling through to live/i.test(x)).forEach((x) => console.log(`WARNING (live fallback): ${x.trim()}`));
      const lines = log.split('\n').filter((x) => /imported|failed|error/i.test(x) && !/wss:|endpoint/i.test(x));
      console.log(`${t}: ${lines.slice(-2).join(' | ')}`);
    });
    // this batch's reports go to content-sites/lh-swiss/reports; lh-com's set-aside ones come back
    Object.keys(out).forEach((p) => {
      const from = path.join(REPORTS, `${p}.report.json`);
      // (a renamed path's report is at its document name)
      [p, docName(p)].map((x) => path.join(REPORTS, `${x}.report.json`)).filter((f, i, a) => a.indexOf(f) === i).forEach((f) => {
        if (!fs.existsSync(f) || fs.statSync(f).mtimeMs < started) return;
        const to = path.join(W, 'reports', path.relative(REPORTS, f));
        fs.mkdirSync(path.dirname(to), { recursive: true });
        fs.renameSync(f, to);
        for (let d = path.dirname(f); d.startsWith(`${REPORTS}/`) && fs.existsSync(d) && !fs.readdirSync(d).length; d = path.dirname(d)) fs.rmdirSync(d);
      });
      if (aside.includes(p)) {
        fs.mkdirSync(path.dirname(from), { recursive: true });
        fs.renameSync(path.join(ASIDE, `${p}.report.json`), from);
        return;
      }
      // and the folders it leaves empty
      for (let d = path.dirname(from); d.startsWith(`${REPORTS}/`) && fs.existsSync(d) && !fs.readdirSync(d).length; d = path.dirname(d)) fs.rmdirSync(d);
    });
    const sites = path.join(root, 'tools/importer/sites/lh-swiss.json');
    const allow = JSON.parse(fs.readFileSync(sites, 'utf8'));
    const made = Object.keys(out).map(docName).filter((p) => fs.existsSync(path.join(W, 'content', `${p}.plain.html`)));
    withRedirects(Object.keys(out).filter((p) => docName(p) !== p && made.includes(docName(p))));
    allow.paths = [...new Set([...allow.paths, ...made])];
    if (linkOuts.length) allow.linkOuts = [...new Set([...(allow.linkOuts || []), ...linkOuts.map(docName)])];
    fs.writeFileSync(sites, `${JSON.stringify(allow, null, 1)}\n`);
    made.forEach((p) => {
      const f = path.join(W, 'content', `${p}.plain.html`);
      const doc = fs.readFileSync(f, 'utf8');
      const src = Object.keys(out).find((k) => docName(k) === p);
      const markets = scope.documents[src]?.markets || [];
      const snapHtml = fs.readFileSync(path.join(SNAP, `${src}.html`), 'utf8');
      const next = splitTabSections(withFlightSearchVideo(withHeroVideo(withItaMetadata(withCheckinHandoff(withFlightSearch(withItaForm(doc, p, snapHtml), p), p), p, snapHtml, markets), snapHtml), snapHtml));
      if (next !== doc) fs.writeFileSync(f, next);
    });
    const mapOnly = path.join(W, 'runs', `${name}-upload.txt`);
    fs.writeFileSync(mapOnly, `${made.join('\n')}\n`);
    // site-postprocess's step 3 rewrites every document: outside the batch only links made
    // relative stay (onlyBatch), so a run never takes an earlier or another session's link back
    // to www
    const post = onlyBatch('lh-swiss', new Set(made), () => execFileSync('node', ['tools/importer/site-postprocess.mjs', '--site', 'lh-swiss', '--source-host', HOST, '--snapshots', path.join(MAPPED, HOST), '--real-placeholder', PLACEHOLDER, '--map-only', mapOnly], { cwd: root, encoding: 'utf8' }));
    console.log(post.result.trim().split('\n').slice(-3).join('\n'));
    console.log(`site-postprocess: ${post.restored.length} documents outside the batch left as they were`);
    // links to the site's pages relative (own-links.mjs: its documents and the market roots'
    // pages lh-edge answers from them), after site-postprocess (which knows only the pages
    // imported so far)
    const pages = ownPages('lh-swiss');
    const aliases = ownAliases('lh-swiss');
    // the login and profile pages and the cockpit deep link the replica serves (lh-swiss.json served)
    const served = ownServed('lh-swiss');
    // a link-out document keeps its link to its own page on www
    const linkOutDocs = new Set(allow.linkOuts || []);
    made.forEach((p) => {
      const f = path.join(W, 'content', `${p}.plain.html`);
      const doc = fs.readFileSync(f, 'utf8');
      const next = withOwnLinks(withLocalImages(relativeDamLinks(doc.split(`https://${LINK_OUT}`).join(`https://${HOST}`))), HOST, pages, aliases, { linkOut: linkOutDocs.has(p) ? p : null, served }).doc;
      if (next !== doc) fs.writeFileSync(f, next);
    });
    fs.writeFileSync(path.join(W, 'runs', `${name}-import.json`), `${JSON.stringify({ templates: out, documents: made, missing }, null, 1)}\n`);
    console.log(`${made.length} documents; upload list runs/${name}-upload.txt`);
  }
}
