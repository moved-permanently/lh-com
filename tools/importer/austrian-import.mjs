/* eslint-disable no-console, max-len, import/prefer-default-export, import/extensions, no-use-before-define -- tooling */
/**
 * Imports one batch of Austrian's pages (lh-austrian) offline from their snapshots
 * (tools/importer/bd-snapshots/www.austrian.com: the Studio's capture, austrian-studio.mjs) with
 * lh-com's import scripts into content-sites/lh-austrian/content, built as ita-import.mjs: per page
 * the template whose components it has (templateOf), then site-postprocess.mjs (the
 * www.lufthansa.com URLs of lh-com's importers back to www.austrian.com, links between the site's
 * pages relative), after adding the batch's documents to the allowlist
 * tools/importer/sites/lh-austrian.json. Per document (one per language page, option B):
 * - widgets a service answers on www become a link to the page on www (withLinkOuts): the check-in
 *   deadline search, the FAQ search bar, iframes the embed block doesn't play (the in-flight
 *   entertainment carousels); the culinary hub a micro-frontend block (the mfe template);
 * - the core forms get a form config row with a proposed lh-forms id austrian-<page> (withForm;
 *   preview only until lh-forms knows them);
 * - the flight search hands off to shop.austrian.com from Vienna (withFlightSearch);
 * - the check-in entry becomes the booking-lookup block (withCheckinTabs), its hand-off the page
 *   on www (withCheckinHandoff); the booking login's "Enter booking code" opens the page on www;
 * - two-column teaser rows import as carousel-cards (withTeaserColumns);
 * - metadata (withItaMetadata): the root's nav and footer, `markets` (scope.json), www's noindex;
 * - links to www's DAM files become site-relative edsDamPath links (austrian-dam.mjs).
 * Writes content-sites/lh-austrian/runs/<name>-import.json: path -> template.
 *
 * Usage: node tools/importer/austrian-import.mjs --list content-sites/lh-austrian/runs/batch-01.txt [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  ownPages, ownAliases, withOwnLinks, onlyBatch,
} from './own-links.mjs';
import { relativeDamLinks } from './austrian-dam.mjs';
import { withLocalImages } from './austrian-nav.mjs';
// SWISS's tab sets that hold blocks (ema-cashub, 2b35553d): the same component on www.austrian.com
import { withTabMarkers, splitTabSections } from './swiss-import.mjs';
import { stripScripts } from './excat-plugin.mjs';
import { withPartnerLogoAlts } from './austrian-partner-logos.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
const HOST = 'www.austrian.com';
const W = path.join(root, 'content-sites/lh-austrian');
const SNAP = path.join(root, 'tools/importer/bd-snapshots', HOST);
const CI = '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts';
// the source pages' own lufthansa.com URLs on a placeholder host during the import (as Discover)
export const PLACEHOLDER = 'www.lufthansa-com.invalid';
const MAPPED = path.join(W, 'snapshots');
export const withPlaceholder = (html) => html.replace(/(?:https?:)?\/\/(?:www\.)?lufthansa\.com(?![\w.-])/gi, `https://${PLACEHOLDER}`);

// links out to the page on www (a widget a service answers there): on this host during the import
export const LINK_OUT = 'link-out.invalid';
const EMBEDDED = /^https:\/\/(?:www\.)?(?:youtube(?:-nocookie)?\.com|lufthansa-inflightentertainment\.com)\//;
const text = (h) => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
// the page's visible H1, else its title without the brand ("Culinary Journey | Austrian Airlines")
const h1Of = (html) => text((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/g) || []).map((x) => x).find((x) => !/sr-only/.test(x)) || '')
  || text((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '').replace(/\s*\|\s*Austrian Airlines\s*$/, '');

/**
 * A snapshot whose live widgets are a link to the page on www: the check-in deadline search
 * (labelled with the page's H1), the FAQ search bar (with its own label), iframes the embed block
 * doesn't play (with their title, else the H1).
 */
/**
 * www's p.copytext-large (the intro under the title, Portada 18 / 27 on www.austrian.com; 200 times on
 * at/en and at/de) with its style as a marker: lh-com's cleanup marks it only with a link
 * (lufthansa.com's default copy is that size) and leaves a paragraph that ends in a marker alone.
 */
export const withCopytextLarge = (html) => html.replace(/(<p class="copytext-large"[^>]*>)([\s\S]*?)(<\/p>)/g, (m, open, inner, close) => {
  const plain = inner.replace(/<[^>]+>/g, '').trim();
  if (!plain || /\{[a-z0-9 -]+\}\s*$/.test(plain)) return m;
  return `${open}${inner.replace(/\s+$/, '')} {copytext-large}${close}`;
});

export function withLinkOuts(html, p) {
  const linkOut = (label) => `<div class="text section"><div class="richtext"><p><a href="https://${LINK_OUT}${p}">${label}</a></p></div></div>`;
  let out = editDivs(html, '<div class="checkindeadlinesearch', () => linkOut(h1Of(html) || HOST));
  out = editDivs(out, '<div class="dcep-search-bar', (el) => linkOut((el.match(/<label[^>]*>([^<]+)<\/label>/) || [])[1] || h1Of(html) || HOST));
  // (the culinary hub stays: the mfe template's micro-frontend parser reads it, templateOf)
  return out.replace(/<div class="iframe[ "][^>]*>\s*<div class="iframe-wrapper[^>]*>\s*<iframe\b([^>]*)>[\s\S]*?<\/iframe>\s*<\/div>\s*<\/div>/g, (m, attrs) => {
    const src = (attrs.match(/\ssrc="([^"]+)"/) || [])[1] || '';
    if (EMBEDDED.test(src)) return m;
    const label = (attrs.match(/\stitle="([^"]+)"/) || [])[1] || h1Of(html) || HOST;
    return `<div class="iframe-link-out"><p><a href="https://${LINK_OUT}${p}">${label}</a></p></div>`;
  });
}

/**
 * A snapshot that loads nothing while it is imported: the import browser renders it with
 * setContent, and its absolute www.austrian.com URLs (about 40 images per page) would be fetched
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
 * A snapshot whose teaser rows in a two-column view (Austrian's "Related", "This might also interest
 * you": two teasers side by side) are a three-column view, which lh-com's info importer makes a
 * carousel-cards block (".threecolumn:has(.teaser)"; its two-column views with teasers are left
 * to the text flow, where the teasers stack), marked data-import-two-up so the block keeps www's two
 * cards a row. Column views nested in it are left as they are.
 */
export const withTeaserColumns = (html) => editDivs(html, '<div class="twocolumn', (el) => {
  if (!el.includes('class="teaser') || /<div class="(?:two|three|four)column/.test(el.slice(1))) return el;
  // marked for the carousel-cards parser's two-up grid: www's two cards a row (/at/de/familien)
  return el.replace(/^<div class="twocolumn([^"]*)"/, '<div class="threecolumn$1" data-import-two-up=""').replace('data-identifier="twocolumn"', 'data-identifier="threecolumn"');
});

/**
 * A column view of partner teasers only (a.teaser.partner: a 32 px icon in the title, no card; /at/en/book/
 * flights/giftvoucher's "How does it work?", parity row 40) in a .carousel: its desktop row (.hidden-md-down)
 * out of the carousel, the .hidden-lg-up swiper copy dropped, so lh-com's info importer finds
 * ".threecolumn > .column-view > .row > .column-view-item > .teaser > a.teaser.partner" (cards-icon-text
 * partner rows), not teaser cards.
 */
export const withPartnerCarousels = (html) => ['<div class="twocolumn', '<div class="threecolumn', '<div class="fourcolumn']
  .reduce((out, open) => editDivs(out, open, (el) => {
    if (!el.includes('class="teaser partner') || el.includes('class="teaser card')) return el;
    const c = el.indexOf('<div class="carousel">');
    if (c < 0) return el;
    const carousel = el.slice(c, divEnd(el, c));
    const d = carousel.indexOf('<div class="hidden-md-down">');
    if (d < 0) return el;
    const desktop = carousel.slice(d, divEnd(carousel, d));
    const rowHtml = desktop.slice('<div class="hidden-md-down">'.length, -'</div>'.length);
    let view = `${el.slice(0, c)}${rowHtml}${el.slice(c + carousel.length)}`;
    // the column view's title (a bare <div> with its heading; cards-icon-text keeps none) before the view
    const titles = [];
    const v = view.indexOf('<div class="column-view');
    if (v >= 0) {
      const re = /<div\b[^>]*>/g;
      re.lastIndex = view.indexOf('>', v) + 1;
      let m = re.exec(view);
      while (m && m.index < divEnd(view, v)) {
        const end = divEnd(view, m.index);
        if (m[0] === '<div>' && /<h[1-6]\b/.test(view.slice(m.index, end))) titles.push([m.index, end]);
        re.lastIndex = end;
        m = re.exec(view);
      }
    }
    // (in a one-column view of its own: the band's section keeps lufthansa-sections.js' column-view style)
    const lead = titles.map(([s, e]) => view.slice(s, e)).join('');
    titles.reverse().forEach(([s, e]) => { view = `${view.slice(0, s)}${view.slice(e).replace(/^\n/, '')}`; });
    return `${lead ? `<div class="onecolumn column event"><div class="column-view flex-column">${lead}</div></div>` : ''}${view}`;
  }), html);

/**
 * A column view of teaser cards with www's .hidden-lg-up swiper copy (/at/de/bearbeitungsgebuehren: three
 * cards a row from 1025 px, a one-card slider with dots below; parity row 41) marked
 * data-import-phone-slider: lh-com's cleanup drops that copy before the carousel-cards parser when it
 * equals the grid (Austrian's swipers have no loop duplicates), so the parser reads the mark.
 */
export const withPhoneSliders = (html) => ['<div class="threecolumn', '<div class="fourcolumn']
  .reduce((out, open) => editDivs(out, open, (el) => {
    if (/^<div [^>]*data-import-phone-slider/.test(el) || !el.includes('class="teaser card')
      || !/<div class="hidden-lg-up"[\s\S]*?class="swiper[ "][\s\S]*?class="teaser card/.test(el)) return el;
    return el.replace(/^<div class="([^"]*)"/, '<div class="$1" data-import-phone-slider=""');
  }), html);

/**
 * Austrian's teaser cards with their link line (www shows ".teaser-link-text", "→ Zur
 * Reisevorbereitung"; lufthansa.com hides it): marked for the carousel-cards parser, which keeps a
 * marked card's line as a link paragraph.
 */
export const withTeaserCta = (html) => html.replace(/(<a\b[^>]*class="teaser card[^"]*")(?![^>]*data-import-cta)/g, '$1 data-import-cta=""');

// the booking-lookup's hand-off: www's check-in app is not reachable from the replica (and its
// target is not in the page), so a valid search opens the same page on www, nothing in the URL
export const withCheckinHandoff = (doc, p) => doc
  // the login widget's "Enter booking code" (lh-com: its own dialog) opens the page on www
  .split('href="#booking-code"').join(`href="https://${HOST}${p}"`).replace(/<div class="booking-lookup(?: [^"]*)?">/g, (m) => (/Submit URL/.test(doc) ? m : `${m}<div><div>Submit URL</div><div>https://${HOST}${p}</div></div>`));

// the core forms: a proposed lh-forms id per page name (austrian-<page>; lh-forms does not know
// them yet, so the form pages stay on preview)
export const formIdOf = (p) => `austrian-${p.split('/').pop().replace(/[^a-z0-9-]/gi, '-').toLowerCase()}`;
const CONFIG_ROW = /<div><div>(?:(?!<\/div><div>)[\s\S])*?<\/div><div>config<\/div><div>(?:form|success|error)<\/div>(?:<div><\/div>){7}<\/div>/g;
const ERROR_ROW = /<div><div>(?:(?!<\/div><div>)[\s\S])*?<\/div><div>config<\/div><div>error<\/div>(?:<div><\/div>){7}<\/div>/g;
const configRow = (name, value) => `<div><div>${value}</div><div>config</div><div>${name}</div>${'<div></div>'.repeat(7)}</div>`;
const linkRow = (name, href) => configRow(name, `<a href="${href}">${href}</a>`);

/** www's confirmation page of a form (its :redirect) as the public path on the site. */
export function successOf(html) {
  const redirect = (String(html || '').match(/name=":redirect"[^>]*value="([^"]+)"|value="([^"]+)"[^>]*name=":redirect"/) || []).slice(1).find(Boolean) || '';
  const m = redirect.match(/^\/content\/aua\/markets(\/[a-z]{2}\/[a-z]{2})(\/.+?)(?:\.html)?$/);
  if (!m) return '';
  // the common confirmation page: its short path on the English roots (/at/en/form-confirmation;
  // /at/de/form-confirmation is 404 on www), else its content path
  return m[2] === '/footer-pages/help-and-contact/form-confirmation' && m[1].endsWith('/en') ? `${m[1]}/form-confirmation` : `${m[1]}${m[2]}`;
}

/**
 * An Austrian form document with its form config row (the proposed lh-forms id) and its success
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

// the flight search hands the search to Austrian's shop (www's flight manager posts to
// shop.austrian.com, the same booking platform as Lufthansa's) and starts from Vienna on at/*
export const SHOP = 'https://shop.austrian.com/booking/availability';
// the market's airport per root, named in the root's language
const DEFAULT_ORIGIN = { 'at/en': 'Vienna (VIE)', 'at/de': 'Wien (VIE)' };

/** The document's flight-search blocks with the Shop row and the market's default origin. */
export function withFlightSearch(doc, p) {
  const key = p.split('/').slice(1, 3).join('/');
  return doc.replace(/<div class="flight-search(?: [^"]*)?">/g, (m) => {
    const rows = [`<div><div>Shop</div><div><a href="${SHOP}">${SHOP}</a></div></div>`];
    if (DEFAULT_ORIGIN[key]) rows.push(`<div><div>Default origin</div><div>${DEFAULT_ORIGIN[key]}</div></div>`);
    return `${m}${rows.join('')}`;
  });
}

/** The template of a page from its path and snapshot. */
/**
 * A snapshot as the import reads it: placeholders, link-outs, the check-in entry's tabs, the
 * teaser columns, the tab sets that hold blocks marked (SWISS's withTabMarkers: www.austrian.com's
 * maui-tab-control-responsive with column views, accordions, tables), no loads, no screen-reader
 * announcement (the help centre app's "Help page loaded." is no page text).
 */
export const mappedOf = (html, p) => withoutLoads(withNestedOnecolumnUnwrapped(withPanelWrappersUnwrapped(withAccordionMapsHoisted(withTabMarkers(withTeaserCta(withPhoneSliders(withTeaserColumns(withPartnerCarousels(withCheckinTabs(withCopytextLarge(withLinkOuts(withPlaceholder(stripScripts(html)), p))))))))))))
  .replace(/<output[^>]*class="screen-reader-announcer"[^>]*>[\s\S]*?<\/output>/g, '');

/**
 * The document's tab markers as Tab sections (SWISS's splitTabSections; scripts/section-tabs.js).
 * The import gives a marker paragraph tokens (the text section's {full-width}, a token paragraph
 * after it merged into it): full-width goes, the others stay after the marker as their own
 * paragraph (the panel's: {column-start}, a spacer).
 */
export const withAustrianTabs = (doc) => splitTabSections(doc.replace(
  /<p>(@@tab@@\d+@@[^<]*?@@|@@tabs-end@@)\s*\{([^}<]*)\}<\/p>/g,
  (m, mark, tokens) => {
    const rest = tokens.split(/\s+/).filter((t) => t && t !== 'full-width');
    return `<p>${mark}</p>${rest.length ? `<p>{${rest.join(' ')}}</p>` : ''}`;
  },
));

/**
 * An accordion whose items hold a points-of-interest map (.poimapping at an item's top: /book/flights/
 * new-destinations, parity row 42): split before each such item, the item's map before its part, so the
 * info importer makes the map a poi-map block of its own (inside the item its table nested in the
 * accordion's cell, and both blocks were lost). The accordion's own opening (its maui-collapsible) is
 * repeated for each part. String-based, the rest of the snapshot as it was.
 */
export const withAccordionMapsHoisted = (html) => editDivs(html, '<div class="accordion commonevent', (el) => {
  if (!el.includes('class="poimapping')) return el;
  const c = el.indexOf('<maui-collapsible');
  if (c < 0) return el;
  const open = el.slice(0, el.indexOf('>', c) + 1);
  const close = '</maui-collapsible></div>';
  const groups = [];
  for (let i = el.indexOf('<div class="accordionitem'); i >= 0; i = el.indexOf('<div class="accordionitem', i)) {
    const end = divEnd(el, i);
    let it = el.slice(i, end);
    const m = it.indexOf('<div class="poimapping');
    if (m >= 0 || !groups.length) groups.push({ map: '', items: [] });
    if (m >= 0) {
      groups[groups.length - 1].map = it.slice(m, divEnd(it, m));
      it = `${it.slice(0, m)}${it.slice(divEnd(it, m))}`;
    }
    groups[groups.length - 1].items.push(it);
    i = end;
  }
  return groups.map((g) => `${g.map}${open}${g.items.join('\n')}${close}`).join('');
});

/**
 * The points of Austrian's maps (tools/importer/austrian-poi-points.json: www's JCR path of each map -> its
 * rows, as DA's documents have them from the first import): lh-com's poi-map parser writes a map it has no
 * recording of as "Source | <path>" (the block would ask www, which answers aem.page nothing); a recorded
 * one gets its rows (name | lat, lng; the zoom labels) instead.
 */
const POI_POINTS = JSON.parse(fs.readFileSync(new URL('./austrian-poi-points.json', import.meta.url), 'utf8'));
const cellText = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
export const withPoiPoints = (doc, points = POI_POINTS) => doc.replace(
  /<div class="poi-map"><div><div>Source<\/div><div>([^<]+)<\/div><\/div><\/div>/g,
  (m, src) => (points[src] ? `<div class="poi-map">${points[src].map(([k, v]) => `<div><div>${cellText(k)}</div><div>${cellText(v)}</div></div>`).join('')}</div>` : m),
);

/**
 * An accordion whose first item is open on www (maui-collapsible-item expanded: new-destinations'
 * "New in Summer 2026" and the winter items) gets accordion-columns' option open-first, as SWISS's import
 * does; the parts withAccordionMapsHoisted makes start with such an item.
 */
export function withOpenFirst(doc, html = '') {
  const clean = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  const open = new Set([...html.matchAll(/<maui-collapsible-item\b[^>]*\sheadline="([^"]*)"[^>]*\sexpanded=""/g)].map((m) => clean(m[1])));
  if (!open.size) return doc;
  return doc.replace(/<div class="accordion-columns([^"]*)"><div><div>([\s\S]*?)<\/div>/g, (m, cls, title) => (
    open.has(clean(title)) && !cls.split(/\s+/).includes('open-first') ? m.replace(`accordion-columns${cls}"`, `accordion-columns${cls} open-first"`) : m));
}

/**
 * A tab panel's own bare wrapper (www: <maui-tab-control-panel-responsive><div>…) left under the section
 * content once the tab markers replaced the tab control (withTabMarkers): unwrapped when it holds a column
 * view, so lh-com's info importer finds ".section-content > .onecolumn > … > .fourcolumn" (the numbered steps
 * of /at/de/missing-baggage's first tab, parity row 36). String-based, the rest of the snapshot as it was.
 */
export function withPanelWrappersUnwrapped(html) {
  const tags = [...html.matchAll(/<(\/?)div\b[^>]*>/g)];
  const remove = new Set();
  tags.forEach((open, i) => {
    if (open[1] || !/^<div class="section-content\b/.test(open[0])) return;
    // the section content's direct children
    let depth = 0;
    let child = null;
    for (let j = i + 1; j < tags.length; j += 1) {
      const t = tags[j];
      if (!t[1]) {
        if (depth === 0) child = j;
        depth += 1;
      } else {
        if (depth === 0) break;
        depth -= 1;
        if (depth === 0 && tags[child][0] === '<div>') {
          const inner = html.slice(tags[child].index + 5, t.index);
          if (/<div class="(?:one|two|three|four)column\b/.test(inner)) remove.add(child).add(j);
        }
      }
    }
  });
  if (!remove.size) return html;
  let out = '';
  let last = 0;
  tags.forEach((t, i) => {
    if (!remove.has(i)) return;
    out += html.slice(last, t.index);
    last = t.index + t[0].length;
  });
  return out + html.slice(last);
}

// the divs of an html as a tree: { open, close (indexes into tags), cls, parent, kids }
const divTree = (tags) => {
  const top = { kids: [] };
  let at = top;
  tags.forEach((t, i) => {
    if (!t[1]) {
      const node = {
        open: i, cls: (t[0].match(/class="([^"]*)"/) || [])[1] || '', parent: at, kids: [],
      };
      at.kids.push(node);
      at = node;
    } else if (at !== top) {
      at.close = i;
      at = at.parent;
    }
  });
  return top;
};
const hasClass = (n, c) => n && n.cls.split(/\s+/).includes(c);

/**
 * A one-column view in another one-column view's item, with no band of its own (its column view only
 * "column-view flex-column"), gives its item's content to the outer item: lh-com's info importer maps a
 * two-column view one level into a one-column view (columns-media), not two (/at/en/austrian-app's QR code
 * and store badge pair, parity row 39). String-based, the rest of the snapshot as it was.
 */
export function withNestedOnecolumnUnwrapped(html) {
  const tags = [...html.matchAll(/<(\/?)div\b[^>]*>/g)];
  const remove = new Set();
  const visit = (n) => {
    const [view] = n.kids;
    const row = view?.kids[0];
    const item = row?.kids[0];
    const outer = n.parent?.parent?.parent?.parent;
    if (hasClass(n, 'onecolumn') && hasClass(n.parent, 'column-view-item') && hasClass(n.parent.parent, 'row')
      && hasClass(n.parent.parent.parent, 'column-view') && hasClass(outer, 'onecolumn')
      && n.kids.length === 1 && view.cls.trim().split(/\s+/).sort().join(' ') === 'column-view flex-column'
      && view.kids.length === 1 && hasClass(row, 'row') && row.kids.length === 1 && hasClass(item, 'column-view-item')
      && [n, view, row, item].every((x) => x.close !== undefined)) {
      [n, view, row, item].forEach((x) => remove.add(x.open).add(x.close));
    }
    n.kids.forEach(visit);
  };
  divTree(tags).kids.forEach(visit);
  if (!remove.size) return html;
  let out = '';
  let last = 0;
  tags.forEach((t, i) => {
    if (!remove.has(i)) return;
    out += html.slice(last, t.index);
    last = t.index + t[0].length;
  });
  return out + html.slice(last);
}

/**
 * The chat button's page metadata row (chat-button: the webchat's start topic), from www's page
 * (webchat_init.js?...start=DYNAMIC_web-<topic>, equal to the row on all 139 documents that had both):
 * written outside the importer before, so a re-import dropped it. A row that is there stays.
 */
export function withChatButton(doc, html = '') {
  if (/<div><div>chat-button<\/div>/.test(doc)) return doc;
  const m = html.match(/webchat_init\.js\?[^"']*?start=DYNAMIC_web-([A-Za-z0-9_-]+)/);
  if (!m) return doc;
  const i = doc.lastIndexOf('<div class="metadata">');
  if (i < 0) return doc;
  // the metadata block's end: its own closing tag after its rows
  const rows = doc.slice(i).match(/^<div class="metadata">((?:<div><div>[^<]*<\/div><div>(?:(?!<\/div><\/div>)[\s\S])*<\/div><\/div>)*)<\/div>/);
  if (!rows) return doc;
  const end = i + rows[0].length - '</div>'.length;
  return `${doc.slice(0, end)}<div><div>chat-button</div><div>${m[1]}</div></div>${doc.slice(end)}`;
}

export function templateOf(p, html) {
  // (homepage-new: the variant homepage some Italian-language roots have, al/it, be/it, ch/it)
  if (/^\/[a-z]{2}\/[a-z]{2}\/homepage(-new)?$/.test(p)) return 'homepage';
  if (/class="topoffersdestinationfinder/.test(html)) return 'hub';
  // the culinary hub (culinaryjourney): lh-com's mfe template, its micro-frontend block (row 42)
  if (/<culinary-hub\b/.test(html)) return 'mfe';
  // the timetable and the check-in entry: info's components plus that block (austrian-templates.mjs;
  // lh-com's flight-status and app-entry templates keep only lufthansa.com's hub pages' few)
  if (/class="flightstatustimetable/.test(html)) return 'austrian-flight-status';
  if (/class="slideshow/.test(html)) return 'fleet';
  if (/checkinpassengerreceiptentry|class="[^"]*dcep-quick-actions/.test(html)) return 'austrian-checkin';
  // www's expanding panels: lh-com's hero-banner block (austrian-templates.mjs; row 37)
  if (/class="dcep-hero-banner/.test(html)) return 'austrian-hero-banner';
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
    const mapped = mappedOf(html, p);
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
    // where lh-com has reports of its own at paths Austrian has too (/at/de/..., /de/de/...):
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
    // this batch's reports go to content-sites/lh-austrian/reports; lh-com's set-aside ones come back
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
        return;
      }
      // and the folders it leaves empty
      for (let d = path.dirname(from); d.startsWith(`${REPORTS}/`) && fs.existsSync(d) && !fs.readdirSync(d).length; d = path.dirname(d)) fs.rmdirSync(d);
    });
    const sites = path.join(root, 'tools/importer/sites/lh-austrian.json');
    const allow = JSON.parse(fs.readFileSync(sites, 'utf8'));
    const docName = (p) => p.toLowerCase().replace(/_/g, '-').replace(/-{2,}/g, '-');
    const made = Object.keys(out).map(docName).filter((p) => fs.existsSync(path.join(W, 'content', `${p}.plain.html`)));
    allow.paths = [...new Set([...allow.paths, ...made])];
    if (linkOuts.length) allow.linkOuts = [...new Set([...(allow.linkOuts || []), ...linkOuts.map(docName)])];
    fs.writeFileSync(sites, `${JSON.stringify(allow, null, 1)}\n`);
    made.forEach((p) => {
      const f = path.join(W, 'content', `${p}.plain.html`);
      const doc = fs.readFileSync(f, 'utf8');
      const src = Object.keys(out).find((k) => docName(k) === p);
      const markets = scope.documents[src]?.markets || [];
      const snap = fs.readFileSync(path.join(SNAP, `${src}.html`), 'utf8');
      const next = withChatButton(withOpenFirst(withPoiPoints(withPartnerLogoAlts(withAustrianTabs(withItaMetadata(withCheckinHandoff(withFlightSearch(withItaForm(doc, p, snap), p), p), p, snap, markets)))), snap), snap);
      if (next !== doc) fs.writeFileSync(f, next);
    });
    const mapOnly = path.join(W, 'runs', `${name}-upload.txt`);
    fs.writeFileSync(mapOnly, `${made.join('\n')}\n`);
    // site-postprocess's step 3 rewrites every document: outside the batch only links made
    // relative stay (onlyBatch), so a run never takes an earlier or another session's link back
    // to www (the navs' /<root>/login links as DA has them)
    const post = onlyBatch('lh-austrian', new Set(made), () => execFileSync('node', ['tools/importer/site-postprocess.mjs', '--site', 'lh-austrian', '--source-host', HOST, '--snapshots', path.join(MAPPED, HOST), '--real-placeholder', PLACEHOLDER, '--map-only', mapOnly], { cwd: root, encoding: 'utf8' }));
    console.log(post.result.trim().split('\n').slice(-3).join('\n'));
    console.log(`site-postprocess: ${post.restored.length} documents outside the batch left as they were`);
    // links to the site's pages relative (own-links.mjs: its documents and the market roots'
    // pages lh-edge answers from them), after site-postprocess (which knows only the pages
    // imported so far)
    const pages = ownPages('lh-austrian');
    const aliases = ownAliases('lh-austrian');
    // a link-out document keeps its link to its own page on www
    const linkOutDocs = new Set(allow.linkOuts || []);
    made.forEach((p) => {
      const f = path.join(W, 'content', `${p}.plain.html`);
      const doc = fs.readFileSync(f, 'utf8');
      const next = withOwnLinks(withLocalImages(relativeDamLinks(doc.split(`https://${LINK_OUT}`).join(`https://${HOST}`))), HOST, pages, aliases, { linkOut: linkOutDocs.has(p) ? p : null }).doc;
      if (next !== doc) fs.writeFileSync(f, next);
    });
    fs.writeFileSync(path.join(W, 'runs', `${name}-import.json`), `${JSON.stringify({ templates: out, documents: made, missing }, null, 1)}\n`);
    console.log(`${made.length} documents; upload list runs/${name}-upload.txt`);
  }
}
