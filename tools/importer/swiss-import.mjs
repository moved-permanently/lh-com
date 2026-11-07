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
 * - www's sidebar component (airem-sidebar) as its content beside a sidebar-aside section, its
 *   two-column views as columns-media rows (swiss-sidebar.mjs withSwissSidebar, brief 432), www's
 *   accordions the import wrote as text an accordion-columns block (withSwissAccordions, brief 445);
 * - the check-in form with www's first name and field hints (withCheckinFields, brief 445);
 * - the cards' link rows with www's link texts (withCardLinks), www's icon teasers the cards'
 *   option usp (withUspTeasers, brief 445), www's two-column teaser views two-up
 *   (withTwoUpCards, brief 450), www's teaser heights and pinned
 *   stages (withPinnedTeasers, brief 450);
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
import { stripScripts } from './excat-plugin.mjs';
import { withSwissSidebar, withSwissAccordions } from './swiss-sidebar.mjs';

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
export const withPlaceholder = (html) => html.replace(/(?:https?:)?\/\/(?:www\.)?lufthansa\.com(?![\w.-])/gi, `https://${PLACEHOLDER}`);

// links out to the page on www (a widget a service answers there): on this host during the import
export const LINK_OUT = 'link-out.invalid';
// the iframes the embed block plays (scripts/media.js embedFor)
const EMBEDDED = /^https:\/\/(?:(?:www\.)?(?:youtube(?:-nocookie)?\.com|(?:lufthansa|swiss)-inflightentertainment\.com)\/|box\.media-carrier\.de\/|www\.google\.com\/maps\/embed\?pb=)/;
const text = (h) => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
// the page's visible H1, else its title without the brand ("Culinary Journey | SWISS")
const h1Of = (html) => text((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/g) || []).map((x) => x).find((x) => !/sr-only/.test(x)) || '')
  || text((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '').replace(/\s*\|\s*SWISS\s*$/, '');

// www's search bar (dcep-search-bar, the FAQ's "Search for topic"): the paragraph withLinkOuts
// writes before the import, which withSearchBar makes the search-bar block after it
export const SEARCH_BAR_MARK = '@@search-bar@@';

/** The marker paragraph (its link, a trailing style marker) as the search-bar block. */
export function withSearchBar(doc) {
  return doc.replace(new RegExp(`<p>${SEARCH_BAR_MARK}\\s*(<a href="[^"]+">[^<]*</a>)(?:\\s*\\{[^}]*\\})?</p>`, 'g'), '<div class="search-bar"><div><div>$1</div></div></div>');
}

/**
 * A snapshot whose live widgets are a link to the page on www (class C): the PNR search and the
 * passenger receipt portal (labelled with the page's H1), the booking logins (their intro text and
 * the H1), iframes the embed block doesn't play (with their title, else the H1). The FAQ search
 * bar is the search-bar block (SEARCH_BAR_MARK, withSearchBar after the import) on a link to the
 * root's search page (www's searchUrl without its query, else /<cc>/<ll>/search-results; the
 * search-results block), with its own label. The check-in deadline search (checkin-deadlines) and
 * the culinary hub (micro-frontend) are lh-com blocks.
 */
export function withLinkOuts(html, p) {
  const linkOut = (label) => `<div class="text section"><div class="richtext"><p><a href="https://${LINK_OUT}${p}">${label}</a></p></div></div>`;
  let out = html;
  // the "fly more sustainably" PNR search (pnr-search-module micro-frontend in a wrapper)
  const pnr = out.search(/<div class="wrapper section">\s*<pnr-search-module/);
  if (pnr >= 0) out = `${out.slice(0, pnr)}${linkOut(h1Of(html) || HOST)}${out.slice(divEnd(out, pnr))}`;
  out = editDivs(out, '<div class="dcep-search-bar', (el) => {
    const label = (el.match(/<label[^>]*>([^<]+)<\/label>/) || [])[1] || h1Of(html) || HOST;
    const url = ((el.match(/searchUrl&quot;\s*:\s*&quot;([^&]*)/) || [])[1] || '').replace(/^https?:\/\/[^/]+/, '').split('?')[0];
    const page = /^\/[a-z]{2}\/[a-z]{2}\/search-results$/.test(url) ? url : `/${p.split('/').slice(1, 3).join('/')}/search-results`;
    return `<div class="text section"><div class="richtext"><p>${SEARCH_BAR_MARK}<a href="${page}">${label}</a></p></div></div>`;
  });
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

// (the import's cleanup may write a text style after a marker: "@@tabs-end@@ {full-width}")
const TAB_MARK = /^@@tab@@(\d+)@@(.*?)@@(?:\s*\{[^}]*\})?$/;
const END_MARK = /^@@tabs-end@@(?:\s*\{[^}]*\})?$/;

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
    const isMark = (c) => c.tagName === 'P' && (TAB_MARK.test(c.textContent.trim()) || END_MARK.test(c.textContent.trim()));
    if (!kids.some(isMark)) return section.outerHTML;
    const own = kids.find((c) => c.classList.contains('section-metadata'));
    const parts = [{ tab: null, html: [] }];
    kids.filter((c) => c !== own).forEach((c) => {
      const line = c.tagName === 'P' ? c.textContent.trim() : '';
      const m = line.match(TAB_MARK);
      if (m) parts.push({ tab: m[2].trim(), set: m[1], html: [] });
      else if (END_MARK.test(line)) parts.push({ tab: null, html: [] });
      else parts.at(-1).html.push(c.outerHTML);
    });
    return parts.filter((p) => p.tab || p.html.length).map((p) => {
      let tail = own ? own.outerHTML : '';
      if (p.tab) tail = metaRows([['Tab', p.tab], ['Tabs', p.set]]);
      return `<div>${p.html.join('')}${tail}</div>`;
    }).join('\n');
  }).join('\n');
  // markers inside a block (no split there): the text goes
  return out.replace(/<p>@@tab@@\d+@@[^<]*?@@(?:\s*\{[^}<]*\})?<\/p>|<p>@@tabs-end@@(?:\s*\{[^}<]*\})?<\/p>/g, '');
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

/**
 * The check-in form as www's (brief 445): www's check-in entry asks for the booking code, the first
 * name and the last name, the names with a hint under them (maui-input hint); lh-com's import
 * writes its manage-bookings form (booking code, last name, the tour operator checkbox). The
 * booking-lookup gets the option checkin (blocks/booking-lookup) and rows of www's first name
 * (label, hint, error) and its hints. A snapshot without that form, and a document with it, as they are.
 */
export function withCheckinFields(doc, html) {
  const { document } = parseHTML(html);
  const field = (name) => document.querySelector(`form maui-input[id$="-flm-checkin-fktnCheckinRequest-${name}"]`);
  const first = field('firstName');
  if (!first || !doc.includes('<div class="booking-lookup my-bookings">')) return doc;
  const attrOf = (el, a) => ((el && el.getAttribute(a)) || '').replace(/\s+/g, ' ').trim();
  const row = (k, v) => (v ? `<div><div>${k}</div><div>${v.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</div></div>` : '');
  const last = field('lastName');
  const ref = field('fileKey');
  return editDivs(doc, '<div class="booking-lookup my-bookings">', (el) => {
    let out = el.replace('<div class="booking-lookup my-bookings">', '<div class="booking-lookup my-bookings checkin">');
    const names = row('First name label', attrOf(first, 'label')) + row('First name hint', attrOf(first, 'hint')) + row('First name error', attrOf(first, 'errormessage'));
    const at = out.indexOf('<div><div>Last name label</div>');
    out = at < 0 ? out.replace(/<\/div>$/, `${names}</div>`) : `${out.slice(0, at)}${names}${out.slice(at)}`;
    const lastHint = row('Last name hint', attrOf(last, 'hint'));
    out = out.replace(/(<div><div>Last name label<\/div><div>[^<]*<\/div><\/div>)/, (m) => `${m}${lastHint}`);
    const refHint = row('Reference hint', attrOf(ref, 'hint'));
    return refHint ? out.replace(/(<div><div>Reference label<\/div><div>[^<]*<\/div><\/div>)/, (m) => `${m}${refHint}`) : out;
  });
}

/**
 * The cards of www's menu pages end with a link row (the teaser's teaser-link-text, brief 445);
 * lh-com's import makes the card's title its link. Per card (carousel-cards, cards-teaser) whose
 * title is one link, with www's link text for that title: the title plain text, a paragraph with
 * the link and www's text after the card's text (brief 380's first-level menu pages). Cards www
 * shows without a link text, and cards with a link paragraph, as they are.
 * @returns {{doc: string, made: number}}
 */
export function withCardLinks(doc, html) {
  const t = (e) => (e ? e.textContent.replace(/\s+/g, ' ').trim() : '');
  const links = new Map([...parseHTML(html).document.querySelectorAll('a.teaser.card, a.card.teaser')]
    .map((a) => [t(a.querySelector('.teaser-heading, h1, h2, h3, h4')), t(a.querySelector('.teaser-link-text'))])
    .filter(([title, link]) => title && link));
  if (!links.size) return { doc, made: 0 };
  const isPlain = !/<main>/.test(doc);
  const inner = isPlain ? doc : doc.match(/<main>([\s\S]*)<\/main>/)[1];
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main>${inner}</main></body></html>`);
  const main = document.querySelector('main');
  let made = 0;
  main.querySelectorAll('div.carousel-cards > div, div.cards-teaser > div').forEach((card) => {
    const h = card.querySelector('h1, h2, h3, h4, h5, h6');
    const a = h && h.querySelector('a');
    const link = h && links.get(t(h));
    if (!a || !link || t(a) !== t(h)) return;
    if ([...card.querySelectorAll('p')].some((q) => q.querySelector('a') && t(q) === t(q.querySelector('a')))) return;
    const para = document.createElement('p');
    const to = document.createElement('a');
    to.setAttribute('href', a.getAttribute('href'));
    if (a.getAttribute('title')) to.setAttribute('title', a.getAttribute('title'));
    to.textContent = link;
    para.append(to);
    h.textContent = t(a);
    h.parentElement.append(para);
    made += 1;
  });
  if (!made) return { doc, made };
  return { doc: isPlain ? main.innerHTML : doc.replace(/<main>[\s\S]*<\/main>/, () => `<main>${main.innerHTML}</main>`), made };
}

/**
 * www's icon teasers (a.teaser.usp: an icon above a title, no frame; the legal page's links,
 * brief 445) come in as carousel-cards: a block whose cards' titles are all www's usp teasers
 * gets the option usp (SWISS's theme draws it as www). Others as they are.
 * @returns {{doc: string, made: number}}
 */
export function withUspTeasers(doc, html) {
  const t = (e) => (e ? e.textContent.replace(/\s+/g, ' ').trim() : '');
  const titles = new Set([...parseHTML(html).document.querySelectorAll('a.teaser.usp')].map((a) => t(a.querySelector('.teaser-heading'))).filter(Boolean));
  if (!titles.size) return { doc, made: 0 };
  let made = 0;
  const out = doc.replace(/<div class="carousel-cards( [^"]*)?">/g, (m, opts, at) => {
    if ((opts || '').split(' ').includes('usp')) return m;
    const block = doc.slice(at, divEnd(doc, at));
    const heads = [...block.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/g)].map((h) => h[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim());
    if (!heads.length || !heads.every((h) => titles.has(h))) return m;
    made += 1;
    return `<div class="carousel-cards${opts || ''} usp">`;
  });
  return { doc: out, made };
}

/**
 * www's two-column teaser views (a .twocolumn view of a.teaser.card: fleet, travel regulations;
 * brief 450) show two cards to a row; withTeaserColumns makes them three-column views for lh-com's
 * importer (a carousel-cards grid, three to a row). A grid whose cards are exactly one such view's
 * gets the option two-up. Others as they are.
 * @returns {{doc: string, made: number}}
 */
export function withTwoUpCards(doc, html) {
  const t = (s) => s.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
  const views = [...parseHTML(html).document.querySelectorAll('.twocolumn .column-view')]
    .map((v) => [...v.querySelectorAll('a.teaser.card .teaser-heading')].map((h) => t(h.innerHTML)).sort().join('\n'))
    .filter(Boolean);
  if (!views.length) return { doc, made: 0 };
  let made = 0;
  const out = doc.replace(/<div class="carousel-cards grid( [^"]*)?">/g, (m, opts, at) => {
    if (/\b(two-up|four-up)\b/.test(opts || '')) return m;
    const block = doc.slice(at, divEnd(doc, at));
    const heads = [...block.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/g)].map((h) => t(h[1])).sort().join('\n');
    if (!heads || !views.includes(heads)) return m;
    made += 1;
    return `<div class="carousel-cards grid${opts || ''} two-up">`;
  });
  return { doc: out, made };
}

/**
 * www's inspiration teasers as the page has them now (brief 450): each one's height (tall: no
 * option, inspiration-teaser-narrow, -regular) and, for an animated one (.inspiration-teaser-
 * animation: pinned at the top while the page scrolls on, www.swiss.com's A350 and SWISS Senses),
 * the hero-campaign option pinned. Blocks matched by their heading; others as they are.
 * @returns {{doc: string, made: number}}
 */
export function withPinnedTeasers(doc, html) {
  const t = (s) => s.replace(/<[^>]+>/g, '').replace(/&#8203;|\u200B/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ')
    .trim();
  const teasers = new Map([...parseHTML(html).document.querySelectorAll('.cms-inspiration-teaser')].map((el) => {
    const h = el.querySelector('h1, h2, h3');
    const height = ['narrow', 'regular'].find((x) => el.classList.contains(`inspiration-teaser-${x}`)) || '';
    return [h ? t(h.innerHTML) : '', { height, pinned: el.classList.contains('inspiration-teaser-animation') }];
  }).filter(([title]) => title));
  if (!teasers.size) return { doc, made: 0 };
  let made = 0;
  const out = doc.replace(/<div class="hero-campaign( [^"]*)?">/g, (m, opts, at) => {
    const block = doc.slice(at, divEnd(doc, at));
    const h = block.match(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/);
    const www = h && teasers.get(t(h[1]));
    if (!www) return m;
    const names = (opts || '').trim().split(/\s+/).filter((x) => x && !['narrow', 'regular', 'pinned'].includes(x));
    if (www.height) names.push(www.height);
    if (www.pinned) names.push('pinned');
    const next = `<div class="hero-campaign${names.length ? ` ${names.join(' ')}` : ''}">`;
    if (next !== m) made += 1;
    return next;
  });
  return { doc: out, made };
}

/**
 * www's stages' texts and buttons (brief 455: by 2026-11-06 the A350's and onboard catering's
 * stages had a paragraph and a button the snapshots of 11-02 lack): per hero-campaign block
 * matched by its heading, www's teaser paragraphs (.information .richtext p) and its button
 * (maui-button-link, secondary: a plain link paragraph) after the heading, when the block lacks
 * that text. Blocks with it, and teasers without such text, as they are.
 * @returns {{doc: string, made: number}}
 */
export function withTeaserTexts(doc, html) {
  const norm = (s) => s.replace(/\u200B/g, '').replace(/\s+/g, ' ').trim();
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const teasers = new Map([...parseHTML(html).document.querySelectorAll('.cms-inspiration-teaser')].map((el) => {
    const h = el.querySelector('h1, h2, h3');
    const ps = [...el.querySelectorAll('.information .richtext p')].map((p) => norm(p.textContent)).filter(Boolean);
    const btn = el.querySelector('.information maui-button-link[href]');
    return [h ? norm(h.textContent) : '', { ps, button: btn && { href: btn.getAttribute('href'), text: norm(btn.textContent) } }];
  }).filter(([title, t]) => title && (t.ps.length || t.button)));
  if (!teasers.size) return { doc, made: 0 };
  const isPlain = !/<main>/.test(doc);
  const inner = isPlain ? doc : doc.match(/<main>([\s\S]*)<\/main>/)[1];
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main>${inner}</main></body></html>`);
  const main = document.querySelector('main');
  let made = 0;
  main.querySelectorAll('div.hero-campaign').forEach((block) => {
    const h = block.querySelector('h1, h2, h3');
    const www = h && teasers.get(norm(h.textContent).replace(/\s*\{[a-z0-9 -]+\}$/, ''));
    if (!www) return;
    const have = norm(block.textContent);
    const add = [];
    www.ps.filter((t) => !have.includes(t)).forEach((t) => add.push(`<p>${esc(t)}</p>`));
    if (www.button && !have.includes(www.button.text)) add.push(`<p><a href="${www.button.href.replace(/"/g, '&quot;')}">${esc(www.button.text)}</a></p>`);
    if (!add.length) return;
    h.insertAdjacentHTML('afterend', add.join(''));
    made += 1;
  });
  if (!made) return { doc, made };
  return { doc: isPlain ? main.innerHTML : doc.replace(/<main>[\s\S]*<\/main>/, () => `<main>${main.innerHTML}</main>`), made };
}

// the core forms: a proposed lh-forms id per page name (swiss-<page>; lh-forms does not know
// them yet, so the form pages stay on preview)
export const formIdOf = (p) => `swiss-${p.split('/').pop().replace(/[^a-z0-9-]/gi, '-').toLowerCase()}`;
const CONFIG_ROW = /<div><div>(?:(?!<\/div><div>)[\s\S])*?<\/div><div>config<\/div><div>(?:form|success|error)<\/div>(?:<div><\/div>){7}<\/div>/g;
const ERROR_ROW = /<div><div>(?:(?!<\/div><div>)[\s\S])*?<\/div><div>config<\/div><div>error<\/div>(?:<div><\/div>){7}<\/div>/g;
const configRow = (name, value) => `<div><div>${value}</div><div>config</div><div>${name}</div>${'<div></div>'.repeat(7)}</div>`;
const linkRow = (name, href) => configRow(name, `<a href="${href}">${href}</a>`);

/**
 * www's confirmation page of a form (its :redirect) as the public path on the site, in the form's
 * root (p): www sends some forms to another root's page (ch/fr) or the global content tree (gc).
 */
export function successOf(html, p = '') {
  const redirect = (String(html || '').match(/name=":redirect"[^>]*value="([^"]+)"|value="([^"]+)"[^>]*name=":redirect"/) || []).slice(1).find(Boolean) || '';
  const m = redirect.match(/^\/content\/lx\/(?:markets(\/[a-z]{2}\/[a-z]{2})|gc\/[a-z]{2})(\/.+?)(?:\.html)?$/);
  const own = p ? `/${p.split('/').slice(1, 3).join('/')}` : m?.[1];
  return m && own ? `${own}${m[2]}` : '';
}

// a form's success row (its link, relative or to www's page)
const SUCCESS_ROW = /<div><div><a href="(?:https:\/\/www\.swiss\.com)?(\/[^"]*)">[^<]*<\/a><\/div><div>config<\/div><div>success<\/div>(?:<div><\/div>){7}<\/div>/g;

/**
 * The success row to a confirmation page the site has (own(path)), relative; to one it does not
 * have (not imported, or www's only), dropped: the form shows its success message in its place.
 */
export const withOwnSuccess = (doc, own) => doc.replace(SUCCESS_ROW, (m, to) => (own(to) ? linkRow('success', to) : ''));

/**
 * A SWISS form document with its form config row (the proposed lh-forms id) and its success
 * row (www's confirmation page; lh-com's parser only maps /content/lh/markets/ paths); the
 * parser's error row stays. Others as they are.
 */
export function withItaForm(doc, p, html = '') {
  if (!/<div class="form[ "]/.test(doc)) return doc;
  const id = formIdOf(p);
  const success = successOf(html, p);
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

// the language of a form message (www's raffle forms on ch/en carry ch/fr's French ones, some
// forms German ones)
const MESSAGE_LANGUAGE = [
  ['fr', /\b(?:Veuillez|votre|vos)\b/i],
  ['de', /\b(?:Bitte|Geben Sie|Wählen Sie|Ihre[nrs]?|Pflichtfeld)\b/],
  ['en', /\b(?:Please|your|required field|Choose a)\b/i],
  ['it', /\b(?:Inserisca|Selezioni|Compili|campo obbligatorio)\b/i],
  ['es', /\b(?:Introduzca|Seleccione|Rellene)\b/],
  ['pt', /\b(?:Digite|Selecione|Informe|Preencha)\b/],
  // kana: Japanese; 请 and 您 (simplified, not Japanese): Chinese
  ['ja', /[\u3040-\u30ff]/],
  ['zh', /[请您]/],
  // Greek and Cyrillic letters
  ['el', /[\u0370-\u03ff]/],
  ['ru', /[\u0400-\u04ff]/],
];
// SWISS's own wording per field name (its forms in the language), and the form block's
// messages (DEFAULT_LABELS required / format error) for the other fields
const FIELD_MESSAGES = {
  en: {
    salutation: 'Please select a title.',
    firstname: 'Please enter your first name.',
    lastname: 'Please enter your surname.',
    nachname: 'Please enter your surname.',
    email: 'Please enter your e-mail address.',
    zip: 'Please enter a postcode.',
    city: 'Please enter your town or city.',
    street: 'Please enter a street name and a house number.',
    adress: 'Please enter a street name and a house number.',
    country: 'Please select your country.',
    state: 'Please select your country.',
    phone: 'Please enter your telephone number.',
    termsconditions: 'Please accept the terms and conditions.',
    'required error': 'Please fill in this field.',
    'format error': 'Please check your entry.',
    'email format': 'Please enter a valid e-mail address.',
  },
  de: {
    salutation: 'Bitte wählen Sie einen Titel aus.',
    firstname: 'Bitte geben Sie Ihren Vornamen ein.',
    lastname: 'Bitte geben Sie Ihren Nachnamen ein.',
    nachname: 'Bitte geben Sie Ihren Nachnamen ein.',
    email: 'Bitte geben Sie Ihre E-Mail-Adresse an.',
    zip: 'Bitte geben Sie eine Postleitzahl ein.',
    city: 'Bitte geben Sie Ihre Ortschaft oder Stadt ein.',
    street: 'Bitte geben Sie den Strassennamen und eine Hausnummer ein.',
    adress: 'Bitte geben Sie den Strassennamen und eine Hausnummer ein.',
    country: 'Land ist ein Pflichtfeld.',
    state: 'Land ist ein Pflichtfeld.',
    phone: 'Bitte geben Sie Ihre Telefonnummer ein.',
    termsconditions: 'Bitte akzeptieren Sie die Teilnahmebedingungen.',
    'required error': 'Bitte füllen Sie dieses Feld aus.',
    'format error': 'Bitte überprüfen Sie Ihre Eingabe.',
    'email format': 'Bitte geben Sie eine gültige E-Mail-Adresse an.',
  },
  // ch/fr and ch/it (brief 276): SWISS's French and Italian forms' most frequent wording per field
  fr: {
    salutation: 'Veuillez sélectionner une civilité.',
    firstname: 'Veuillez indiquer votre prénom.',
    lastname: 'Veuillez indiquer votre nom de famille.',
    nachname: 'Veuillez indiquer votre nom de famille.',
    email: 'Veuillez saisir votre adresse e-mail.',
    zip: 'Veuillez indiquer votre code postal.',
    city: 'Veuillez indiquer votre ville.',
    street: 'Veuillez indiquer le nom et le numéro de la voie.',
    adress: 'Veuillez indiquer le nom et le numéro de la voie.',
    country: 'Le pays doit être indiqué.',
    state: 'Le pays doit être indiqué.',
    phone: 'Veuillez indiquer votre numéro de téléphone.',
    termsconditions: 'Veuillez accepter les conditions de participation.',
    outbounddate: 'Veuillez sélectionner votre date de départ.',
    inbounddate: 'Veuillez sélectionner votre date de retour.',
    'required error': 'Veuillez remplir ce champ.',
    'format error': 'Veuillez vérifier votre saisie.',
    'email format': 'Veuillez saisir une adresse e-mail valide.',
  },
  it: {
    salutation: 'Selezioni un titolo.',
    firstname: 'Inserisca il suo nome.',
    lastname: 'Inserisca il suo cognome.',
    nachname: 'Inserisca il suo cognome.',
    email: 'Inserisca il suo indirizzo e-mail.',
    zip: 'Inserisca un codice postale.',
    city: 'Inserisca il suo luogo di residenza.',
    street: 'Inserisca una via e un numero civico.',
    adress: 'Inserisca una via e un numero civico.',
    country: 'Il Paese è un campo obbligatorio.',
    state: 'Il Paese è un campo obbligatorio.',
    phone: 'Inserisca il suo numero di telefono.',
    termsconditions: 'Accetti le condizioni di partecipazione.',
    outbounddate: 'Selezioni la data di partenza.',
    inbounddate: 'Selezioni la data di ritorno.',
    'required error': 'Compili questo campo.',
    'format error': 'Verifichi i dati inseriti.',
    'email format': 'Inserisca un indirizzo e-mail valido.',
  },
  // ch/es and ch/pt (brief 279): SWISS's Spanish and Portuguese forms' most frequent wording per
  // field, a Spanish or Portuguese required or format message for the others
  es: {
    salutation: 'Seleccione un tratamiento.',
    gender: 'Seleccione una forma de saludo',
    firstname: 'Introduzca su nombre.',
    lastname: 'Introduzca sus apellidos.',
    nachname: 'Introduzca sus apellidos.',
    email: 'Introduzca su dirección de correo electrónico.',
    zip: 'Introduzca su código postal.',
    city: 'Introduzca su localidad.',
    street: 'Introduzca su calle y número',
    adress: 'Introduzca su calle y número',
    country: 'El país es un campo obligatorio.',
    state: 'El país es un campo obligatorio.',
    phone: 'Introduzca su número de teléfono.',
    outbounddate: 'Seleccione su fecha de salida.',
    inbounddate: 'Seleccione su fecha de regreso.',
    'required error': 'Rellene este campo.',
    'format error': 'Compruebe los datos introducidos.',
    'email format': 'Introduzca una dirección de correo electrónico válida.',
  },
  pt: {
    salutation: 'Selecione um pronome de tratamento.',
    gender: 'Escolha uma forma de tratamento',
    firstname: 'Digite seu nome.',
    lastname: 'Digite seu sobrenome.',
    nachname: 'Digite seu sobrenome.',
    email: 'Digite seu endereço de e-mail.',
    zip: 'Digite seu código postal.',
    city: 'Digite sua cidade.',
    street: 'Digite o nome da rua e o número da residência',
    adress: 'Digite o nome da rua e o número da residência',
    country: 'O país é um campo obrigatório.',
    state: 'O país é um campo obrigatório.',
    phone: 'Digite seu número de telefone',
    outbounddate: 'Selecione a data de partida',
    inbounddate: 'Selecione a data de retorno',
    'required error': 'Preencha este campo.',
    'format error': 'Verifique os dados informados.',
    'email format': 'Digite um e-mail válido.',
  },
  // ch/zh and ch/ja (brief 28x): SWISS's Chinese and Japanese forms' most frequent wording per
  // field, a Chinese or Japanese required or format message for the others
  zh: {
    salutation: '请选择称谓。',
    gender: '请选择称谓',
    firstname: '请输入您的名字。',
    lastname: '请输入您的姓氏。',
    nachname: '请输入您的姓氏。',
    email: '请输入您的电子邮箱。',
    zip: '请输入您的邮政编码。',
    city: '请输入您的城镇或城市。',
    street: '请输入您的街道名称和门牌号',
    adress: '请输入您的街道名称和门牌号',
    country: '国家/地区是必填字段。',
    state: '国家/地区是必填字段。',
    phone: '请输入您的电话号码',
    outbounddate: '请选择您的出发日期。',
    inbounddate: '请选择您的返程日期。',
    'required error': '请填写此字段。',
    'format error': '请检查您的输入。',
    'email format': '请输入有效的电子邮箱。',
  },
  ja: {
    salutation: '敬称を選択してください。',
    gender: '敬称を選択してください',
    firstname: '名を入力してください。',
    lastname: '姓を入力してください。',
    nachname: '姓を入力してください。',
    email: 'Eメールアドレスを入力してください。',
    zip: '郵便番号を入力してください。',
    city: '市区町村を入力してください。',
    street: '町名以降および番地を入力してください。',
    adress: '町名以降および番地を入力してください。',
    country: '国は必須情報です。',
    state: '国は必須情報です。',
    phone: '電話番号を入力してください',
    outbounddate: '出発日を選択してください。',
    inbounddate: '復路便の搭乗日を選択してください。',
    'required error': 'この項目を入力してください。',
    'format error': '入力内容をご確認ください。',
    'email format': '有効なEメールアドレスを入力してください。',
  },
  // ch/el and ch/ru (brief 283): SWISS's Greek and Russian forms' most frequent wording per field,
  // a Greek or Russian required or format message for the others
  el: {
    salutation: 'Παρακαλούμε επιλέξτε τίτλο.',
    gender: 'Επιλέξτε προσφώνηση',
    firstname: 'Εισαγάγετε το όνομά σας.',
    lastname: 'Παρακαλούμε πληκτρολογήστε το επώνυμό σας.',
    nachname: 'Παρακαλούμε πληκτρολογήστε το επώνυμό σας.',
    email: 'Εισαγάγετε τη διεύθυνση email σας',
    zip: 'Εισαγάγετε έναν ταχυδρομικό κώδικα',
    city: 'Εισαγάγετε την πόλη σας.',
    street: 'Παρακαλούμε εισαγάγετε οδό και αριθμό οικίας',
    adress: 'Παρακαλούμε εισαγάγετε οδό και αριθμό οικίας',
    country: 'Η χώρα είναι απαιτούμενο πεδίο.',
    state: 'Η χώρα είναι απαιτούμενο πεδίο.',
    phone: 'Εισαγάγετε τον αριθμό τηλεφώνου σας',
    outbounddate: 'Επιλέξτε την ημερομηνία αναχώρησης.',
    inbounddate: 'Επιλέξτε την ημερομηνία επιστροφής.',
    'required error': 'Συμπληρώστε αυτό το πεδίο.',
    'format error': 'Ελέγξτε τα στοιχεία που καταχωρίσατε.',
    'email format': 'Εισαγάγετε μια έγκυρη διεύθυνση e-mail.',
  },
  ru: {
    salutation: 'Выберите обращение.',
    gender: 'Выберите приветствие',
    firstname: 'Введите имя.',
    lastname: 'Введите фамилию.',
    nachname: 'Введите фамилию.',
    email: 'Введите адрес электронной почты.',
    zip: 'Введите индекс',
    city: 'Укажите город или населенный пункт.',
    street: 'Ведите улицу и номер дома',
    adress: 'Ведите улицу и номер дома',
    country: 'Страна обязательна для заполнения.',
    state: 'Страна обязательна для заполнения.',
    phone: 'Введите свой номер телефона',
    outbounddate: 'Введите дату вылета',
    'required error': 'Заполните это поле.',
    'format error': 'Проверьте введенные данные.',
    'email format': 'Введите действительный адрес электронной почты.',
  },
};
// a row of a form block (cells without nested blocks)
const FORM_ROW = /<div>(?:<div>(?:(?!<\/?div[ >])[\s\S])*<\/div>){8,}<\/div>/g;

/**
 * The form's validation and constraint messages in the page's language: one in another language
 * becomes SWISS's wording for its field (by name), else the form block's message. Roots without
 * wording as they are.
 */
export function withPageLanguageMessages(doc, p) {
  const words = FIELD_MESSAGES[p.split('/')[2]];
  if (!words || !/<div class="form[ "]/.test(doc)) return doc;
  const lang = p.split('/')[2];
  const foreign = (msg) => (MESSAGE_LANGUAGE.find(([, re]) => re.test(msg)) || [lang])[0] !== lang;
  let col = { name: 2, validation: 7, constraint: 8 };
  return doc.replace(FORM_ROW, (row) => {
    const cells = [...row.slice(5, -6).matchAll(/<div>((?:(?!<\/?div[ >])[\s\S])*)<\/div>/g)].map((m) => m[1]);
    if (cells[0] === 'Label' && cells[1] === 'Type') {
      const at = (name, d) => (cells.indexOf(name) < 0 ? d : cells.indexOf(name));
      col = { name: at('Name', 2), validation: at('Validation message', 7), constraint: at('Constraint message', 8) };
      return row;
    }
    const name = String(cells[col.name] || '').toLowerCase();
    const next = [...cells];
    if (foreign(cells[col.validation] || '')) next[col.validation] = words[name] || words['required error'];
    if (foreign(cells[col.constraint] || '')) next[col.constraint] = name === 'email' ? words['email format'] : words['format error'];
    return next.some((c, i) => c !== cells[i]) ? `<div>${next.map((c) => `<div>${c}</div>`).join('')}</div>` : row;
  });
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
// shop.swiss.com, the same booking platform as Lufthansa's) and starts from Zurich (ch/fr: Geneva,
// as its homepage's flight search)
export const SHOP = 'https://shop.swiss.com/booking/availability';
// the market's airport per root, named in the root's language (the homepages' flight search;
// ch/es's writes Zurich)
const DEFAULT_ORIGIN = {
  'ch/en': 'Zurich (ZRH)',
  'ch/de': 'Zürich (ZRH)',
  'ch/fr': 'Genève (GVA)',
  'ch/it': 'Zurigo (ZRH)',
  'ch/es': 'Zurich (ZRH)',
  'ch/pt': 'Zurique (ZRH)',
  'ch/zh': '苏黎世 (ZRH)',
  'ch/ja': 'チューリッヒ (ZRH)',
  'ch/el': 'Ζυρίχη (ZRH)',
  'ch/ru': 'Цюрих (ZRH)',
};

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

// an attribute's text decoded once (the snapshots' data-dcep JSON)
const decodeAttr = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&amp;/g, '&');
const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/** www's flight manager's promotionTeaser object in a snapshot, or null. */
export function promotionTeaserOf(html) {
  const json = decodeAttr(String(html || ''));
  const at = json.indexOf('"promotionTeaser"');
  const start = at < 0 ? -1 : json.indexOf('{', at);
  if (start < 0) return null;
  let depth = 0;
  for (let i = start; i < json.length; i += 1) {
    if (json[i] === '{') depth += 1;
    else if (json[i] === '}') {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(json.slice(start, i + 1));
        } catch (e) {
          return null;
        }
      }
    }
  }
  return null;
}

/**
 * The flight search's Background teaser row after its Background video (www's flight manager
 * shows its promotion teaser's card text over the moving image): the title as the eyebrow, the
 * displayText as a heading, the link. A document without the video row, or a snapshot without a
 * teaser text: as it is.
 */
export function withFlightSearchTeaser(doc, html) {
  if (doc.includes('<div>Background teaser</div>')) return doc;
  const video = doc.match(/<div><div>Background video<\/div><div>(?:(?!<\/div>)[\s\S])*<\/div><\/div>/);
  const t = promotionTeaserOf(html);
  if (!video || !t || !(t.title || t.displayText)) return doc;
  const link = t.linkModeConfig && t.linkModeConfig.url && t.linkModeConfig.label
    ? `<p><a href="${escapeHtml(t.linkModeConfig.url)}">${escapeHtml(t.linkModeConfig.label)}</a></p>` : '';
  const cell = [t.title ? `<p>${escapeHtml(t.title)}</p>` : '', t.displayText ? `<h2>${escapeHtml(t.displayText)}</h2>` : '', link].join('');
  return doc.replace(video[0], `${video[0]}<div><div>Background teaser</div><div>${cell}</div></div>`);
}

/**
 * The offers pages' grid (www's .dcep-destination-finder, drawn in the browser: empty in the
 * snapshot), which lufthansa-cleanup removes as an empty component before the destination-finder
 * parser reads its data-dcep; data-import-keep keeps it (as ita-import.mjs's fare teaser).
 */
export const withOffersGridConfig = (html) => html.replace(/<div class="dcep-destination-finder"(?![^>]*data-import-keep)/g, '$& data-import-keep');

// the flight search's rows that www links to its own pages, and our page in the document's root
// (www writes the group booking link as an AEM path, at times its market root only)
const FLIGHT_SEARCH_OWN = {
  'Group booking': (base) => `${base}/book-and-manage/corporate-customers/group-travel-and-charter/group-travel`,
  'Where we fly': (base) => `${base}/offers`,
};

/**
 * The cockpit deep link without a query (www's overview-manage pages: www answers it, our host
 * 404) with the root's country and language, as www's other cockpit links. A path without a
 * <cc>/<ll> root as it is.
 */
export function withCockpitQuery(doc, p) {
  const m = p.match(/^\/([a-z]{2})\/([a-z]{2})(?:\/|$)/);
  if (!m) return doc;
  const href = `/deeplink/cockpit?country=${m[1].toUpperCase()}&amp;language=${m[2].toUpperCase()}`;
  return doc.replace(/href="(?:https:\/\/www\.swiss\.com)?\/deeplink\/cockpit\/?"/g, `href="${href}"`);
}

/** The flight search blocks' group booking and destinations links to our pages in p's root. */
export function withOwnFlightSearchLinks(doc, p) {
  const base = `/${p.split('/').slice(1, 3).join('/')}`;
  let out = '';
  let at = 0;
  const open = /<div class="flight-search(?: [^"]*)?">/g;
  for (let m = open.exec(doc); m; m = open.exec(doc)) {
    const end = divEnd(doc, m.index);
    const block = doc.slice(m.index, end).replace(/<div><div>(Group booking|Where we fly)<\/div><div><a href="[^"]*">/g, (row, key) => `<div><div>${key}</div><div><a href="${FLIGHT_SEARCH_OWN[key](base)}">`);
    out += doc.slice(at, m.index) + block;
    at = end;
    open.lastIndex = end;
  }
  return out + doc.slice(at);
}

/** The template of a page from its path and snapshot. */
// the claim apps whose release the page names in its script (www's ch/ru: claim-form-entry 0.11.9)
const VERSIONED_APPS = ['claim-form-entry', 'baggage-form-entry'];

/**
 * The release of a claim app the snapshot's module script names (<app>-0.11.9.js, <app>-latest.js)
 * as the app element's data-app-version, before the scripts are stripped: the micro-frontend
 * parser writes it as the block's Version row. A page without such a script as it is.
 */
export function withAppVersions(html) {
  return VERSIONED_APPS.reduce((out, app) => {
    const v = (out.match(new RegExp(`<script\\b[^>]*\\ssrc="[^"]*/${app}-(\\d+\\.\\d+\\.\\d+|latest)\\.js"`)) || [])[1];
    return v ? out.replace(new RegExp(`<${app}(?=[\\s>])(?![^>]*data-app-version)`, 'g'), `<${app} data-app-version="${v}"`) : out;
  }, html);
}

/**
 * A micro-frontend block's Fallback link to the document's own page (Continue to www, where the
 * app works: the parser's live link) back on www.swiss.com where a link step made it relative;
 * other links and those outside the block as they are.
 */
export function withLiveFallback(doc, p) {
  return doc.replace(/<div class="micro-frontend">[\s\S]*?<div><div>Fallback<\/div><div>[\s\S]*?<\/div><\/div><\/div>/g, (block) => block.split(`href="${p}"`).join(`href="https://${HOST}${p}"`));
}

export function templateOf(p, html) {
  if (/^\/[a-z]{2}\/[a-z]{2}\/homepage$/.test(p)) return 'homepage';
  // articles and the article hub: lh-com's insights template (article-header, price-bar)
  if (/<meta name="template" content="article"/.test(html) || /class="dcep-blog-overview/.test(html)) return 'insights';
  if (/class="topoffersdestinationfinder/.test(html)) return 'hub';
  if (/class="flightstatustimetable/.test(html)) return 'flight-status';
  if (/class="slideshow/.test(html)) return 'fleet';
  // the culinary journey (www's <culinary-hub> micro-frontend): the micro-frontend block, as Discover;
  // the claim pages (<claim-form-entry>, <baggage-form-entry>) as lufthansa.com's claim page
  if (/<(culinary-hub|claim-form-entry|baggage-form-entry)[\s>]/.test(html)) return 'mfe';
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
    const mapped = withOffersGridConfig(withoutLoads(withTabMarkers(withTeaserColumns(withCheckinTabs(withLinkOuts(withoutPlaceholders(withPlaceholder(editDivs(stripScripts(withAppVersions(html)), '<div id="ui-datepicker-div"', () => ''))), p))))))
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
      // www's sidebar component (airem-sidebar) as the content beside a sidebar-aside section (swiss-sidebar.mjs)
      // (www's accordions the import wrote as text first: the sidebar's content can end with one)
      const next = withSwissSidebar(withSwissAccordions(withTeaserTexts(withPinnedTeasers(withTwoUpCards(withUspTeasers(withCardLinks(splitTabSections(withFlightSearchTeaser(withFlightSearchVideo(withHeroVideo(withItaMetadata(withCheckinFields(withCheckinHandoff(withFlightSearch(withPageLanguageMessages(withItaForm(doc, p, snapHtml), p), p), p), snapHtml), p, snapHtml, markets), snapHtml), snapHtml), snapHtml)), snapHtml).doc, snapHtml).doc, snapHtml).doc, snapHtml).doc, snapHtml).doc, snapHtml).doc, snapHtml).doc;
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
      const linked = withOwnLinks(withLocalImages(relativeDamLinks(doc.split(`https://${LINK_OUT}`).join(`https://${HOST}`))), HOST, pages, aliases, { linkOut: linkOutDocs.has(p) ? p : null, served }).doc;
      // a form sends the visitor to its confirmation page on the site, never to www's
      const next = withSearchBar(withLiveFallback(withCockpitQuery(withOwnFlightSearchLinks(withOwnSuccess(linked, (t) => fs.existsSync(path.join(W, 'content', `${t}.plain.html`))), p), p), p));
      if (next !== doc) fs.writeFileSync(f, next);
    });
    fs.writeFileSync(path.join(W, 'runs', `${name}-import.json`), `${JSON.stringify({ templates: out, documents: made, missing }, null, 1)}\n`);
    console.log(`${made.length} documents; upload list runs/${name}-upload.txt`);
  }
}
