/* eslint-disable no-console, max-len, import/prefer-default-export, import/extensions, no-use-before-define, import/no-extraneous-dependencies -- tooling */
/**
 * Imports one batch of Brussels Airlines' pages (lh-brussels) offline from their snapshots
 * (tools/importer/bd-snapshots/www.brusselsairlines.com: the Studio's capture, brussels-studio.mjs)
 * with lh-com's import scripts into content-sites/lh-brussels/content, built as austrian-import.mjs:
 * per page
 * the template whose components it has (templateOf), then site-postprocess.mjs (the
 * www.lufthansa.com URLs of lh-com's importers back to www.brusselsairlines.com, links between the site's
 * pages relative), after adding the batch's documents to the allowlist
 * tools/importer/sites/lh-brussels.json. Per document (one per language page, option B):
 * - widgets a service answers on www become a link to the page on www (withLinkOuts): the check-in
 *   deadline search, the FAQ search bar, the "fly more sustainably" PNR search micro-frontend,
 *   iframes the embed block doesn't play;
 * - the payment methods table (an iframe of webv4.brusselsairlines.com) as plain content where its
 *   rendered page is at hand (withPaymentTable), the phone numbers of the hotline widget
 *   (.dcep-hotline-number-display, rendered in the browser) as plain content (withHotlines);
 * - articles (template article) import with lh-com's insights template (article-header,
 *   price-bar), slideshows with fleet (carousel-lightbox);
 * - the core forms get a form config row with a proposed lh-forms id brussels-<page> (withForm;
 *   preview only until lh-forms knows them);
 * - www's leftover test forms ("… Test" section titles) are dropped (withoutTestForms);
 * - a sidebar whose content holds column views: its content as sections with style sidebar, a grey
 *   column view in it a section of its own (withSidebarContent, withSidebarSections);
 * - the flight search hands off to shop.brusselsairlines.com from Brussels (withFlightSearch);
 * - the flight search picker's texts in the page's language from www's label state (withBookingLabels);
 * - the check-in entry becomes the booking-lookup block (withCheckinTabs), its hand-off the page
 *   on www (withCheckinHandoff); the booking login's "Enter booking code" opens the page on www;
 * - two-column teaser rows import as carousel-cards (withTeaserColumns);
 * - metadata (withItaMetadata): the root's nav and footer, `markets` (scope.json), www's noindex;
 * - links to www's DAM files become site-relative edsDamPath links (brussels-dam.mjs);
 * - a share image www doesn't serve becomes Brussels' own logo (brussels-share-image.mjs).
 * Writes content-sites/lh-brussels/runs/<name>-import.json: path -> template.
 *
 * Usage: node tools/importer/brussels-import.mjs --list content-sites/lh-brussels/runs/batch-01.txt [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import {
  ownPages, ownAliases, ownServed, withOwnLinks, onlyBatch,
} from './own-links.mjs';
import { relativeDamLinks } from './brussels-dam.mjs';
import { pageBookingLabels } from './parsers/flight-search-picker.js';
import { withLocalImages } from './brussels-nav.mjs';
import { withShareImage } from './brussels-share-image.mjs';
import { stripScripts } from './excat-plugin.mjs';
import { withHiddenH1 } from './discover-import.mjs';
import collapseDocs from './collapse-docs.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
const HOST = 'www.brusselsairlines.com';
const W = path.join(root, 'content-sites/lh-brussels');
const SNAP = path.join(root, 'tools/importer/bd-snapshots', HOST);
const CI = '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts';
// the source pages' own lufthansa.com URLs on a placeholder host during the import (as Discover)
export const PLACEHOLDER = 'www.lufthansa-com.invalid';
const MAPPED = path.join(W, 'snapshots');
// the gallery pages' fleet import (spliceGalleries): a workspace of its own
const GALLERY_W = path.join(W, 'gallery-import');
export const withPlaceholder = (html) => html.replace(/(?:https?:)?\/\/(?:www\.)?lufthansa\.com(?![\w.-])/gi, `https://${PLACEHOLDER}`);

// links out to the page on www (a widget a service answers there): on this host during the import
export const LINK_OUT = 'link-out.invalid';
const EMBEDDED = /^https:\/\/(?:www\.)?(?:youtube(?:-nocookie)?\.com|lufthansa-inflightentertainment\.com)\//;
const text = (h) => h.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
// the page's visible H1, else its title without the brand ("Culinary Journey | Brussels Airlines")
const h1Of = (html) => text((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/g) || []).map((x) => x).find((x) => !/sr-only/.test(x)) || '')
  || text((html.match(/<title>([^<]*)<\/title>/) || [])[1] || '').replace(/\s*\|\s*Brussels Airlines\s*$/, '');

/**
 * A snapshot whose live widgets are a link to the page on www: the check-in deadline search and the
 * culinary-hub micro-frontend (labelled with the page's H1), the FAQ search bar (with its own
 * label), iframes the embed block doesn't play (with their title, else the H1).
 */
export function withLinkOuts(html, p) {
  const linkOut = (label) => `<div class="text section"><div class="richtext"><p><a href="https://${LINK_OUT}${p}">${label}</a></p></div></div>`;
  let out = editDivs(html, '<div class="checkindeadlinesearch', () => linkOut(h1Of(html) || HOST));
  // the "fly more sustainably" PNR search (pnr-search-module micro-frontend in a wrapper)
  const pnr = out.search(/<div class="wrapper section">\s*<pnr-search-module/);
  if (pnr >= 0) out = `${out.slice(0, pnr)}${linkOut(h1Of(html) || HOST)}${out.slice(divEnd(out, pnr))}`;
  out = editDivs(out, '<div class="dcep-search-bar', (el) => linkOut((el.match(/<label[^>]*>([^<]+)<\/label>/) || [])[1] || h1Of(html) || HOST));
  // the culinary hub's wrapper (whitespace between the wrapper and the element varies)
  const hub = out.search(/<div class="wrapper section">\s*<culinary-hub/);
  if (hub >= 0) out = `${out.slice(0, hub)}${linkOut(h1Of(html) || HOST)}${out.slice(divEnd(out, hub))}`;
  return out.replace(/<div class="iframe[ "][^>]*>\s*<div class="iframe-wrapper[^>]*>\s*<iframe\b([^>]*)>[\s\S]*?<\/iframe>\s*<\/div>\s*<\/div>/g, (m, attrs) => {
    const src = (attrs.match(/\ssrc="([^"]+)"/) || [])[1] || '';
    if (EMBEDDED.test(src)) return m;
    const label = (attrs.match(/\stitle="([^"]+)"/) || [])[1] || h1Of(html) || HOST;
    return `<div class="iframe-link-out"><p><a href="https://${LINK_OUT}${p}">${label}</a></p></div>`;
  });
}

/**
 * The hotline widget (.dcep-hotline-number-display: a country select whose phone numbers www fills
 * in the browser) as plain content: per rendered contact (.support-contact) its heading, the number
 * (a tel: link), the notes, the opening hours (day: hours) and the e-mail line; the select goes.
 */
export function withHotlines(html) {
  return editDivs(html, '<div class="hotlinenumberdisplay', (el) => {
    const { document } = parseHTML(`<html><body>${el}</body></html>`);
    const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    document.querySelectorAll('svg, maui-icon, maui-select, .sr-only').forEach((n) => n.remove());
    const parts = [...document.querySelectorAll('.support-contact')].map((c) => {
      const out = [];
      const head = c.querySelector(':scope > maui-headline');
      if (head) out.push(`<h3>${esc(clean(head.textContent))}</h3>`);
      c.querySelectorAll(':scope > a.phone-number').forEach((a) => out.push(`<p><a href="${a.getAttribute('href')}">${esc(clean(a.textContent))}</a></p>`));
      c.querySelectorAll(':scope > div').forEach((d) => {
        const table = d.querySelector('table.service-hours');
        if (table) {
          const h = d.querySelector('maui-headline');
          if (h) out.push(`<h4>${esc(clean(h.textContent))}</h4>`);
          const rows = [...table.querySelectorAll('tr')].map((tr) => `${esc(clean(tr.querySelector('th')?.textContent))}: ${esc(clean(tr.querySelector('td')?.textContent))}`);
          out.push(`<p>${rows.join('<br>')}</p>`);
          return;
        }
        const lines = [...d.querySelectorAll('span')].map((s) => clean(s.textContent)).filter(Boolean);
        if (lines.length) out.push(`<p>${lines.map(esc).join('<br>')}</p>`);
      });
      return out.join('');
    }).join('');
    return parts ? `<div class="text section"><div class="richtext">${parts}</div></div>` : '';
  });
}

// the payment methods table: the iframe page of webv4.brusselsairlines.com per language, rendered
// through the Bright Data session (content-sites/lh-brussels/assets/fop/<file>.html, the table only)
const FOP = path.join(W, 'assets/fop');

/** The payment methods iframe as its table (plain content) where its page is at hand. */
export function withPaymentTable(html) {
  return html.replace(/<div class="iframe[ "][^>]*>\s*<div class="iframe-wrapper[^>]*>\s*<iframe\b[^>]*src="https:\/\/webv4\.brusselsairlines\.com\/[^"]*\/(fop_standalone_[^"/]+?)\.html"[^>]*>[\s\S]*?<\/iframe>\s*<\/div>\s*<\/div>/g, (m, file) => {
    const f = path.join(FOP, `${file}.html`);
    return fs.existsSync(f) && fs.statSync(f).size > 0 ? `<div class="text section"><div class="richtext">${fs.readFileSync(f, 'utf8')}</div></div>` : m;
  });
}

/**
 * A snapshot that loads nothing while it is imported: the import browser renders it with
 * setContent, and its absolute www.brusselsairlines.com URLs (about 40 images per page) would be fetched
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

/*
 * www's photo galleries (.slideshow: a picture that opens a lightbox). lh-com's fleet template
 * takes them (carousel-lightbox) but none of a content page's other components (picture and text
 * rows, teaser cards, accordions: plain content on /be/fr/travel-classes/business). A page with a
 * gallery imports with the info template, each gallery a numbered placeholder
 * (withGalleryPlaceholders); the fleet template's import of the same page gives the galleries back
 * in their places (spliceGalleries). Offline package 2026-11-06, brussels-parity-002.
 */
const GALLERY = 'BRUSSELS-GALLERY-';

/** The snapshot with each gallery a numbered placeholder paragraph. */
export function withGalleryPlaceholders(html) {
  let n = 0;
  return editDivs(html, '<div class="slideshow', () => {
    const p = `<div class="text section"><div class="richtext"><p>${GALLERY}${n}</p></div></div>`;
    n += 1;
    return p;
  });
}

/** A document's blocks of a name, in order, each its whole outer html. */
export function blocksOf(doc, name) {
  const out = [];
  const re = new RegExp(`<div class="${name}(?: [^"]*)?">`, 'g');
  let m = re.exec(doc);
  while (m) {
    const end = divEnd(doc, m.index);
    out.push(doc.slice(m.index, end));
    re.lastIndex = end;
    m = re.exec(doc);
  }
  return out;
}

/** The info import's placeholders replaced by the fleet import's galleries (none left: nothing). */
export function spliceGalleries(doc, fleetDoc) {
  const galleries = blocksOf(fleetDoc, 'carousel-lightbox');
  // (the import may add its layout markers after it: "BRUSSELS-GALLERY-0 {full-width}")
  return doc.replace(new RegExp(`<p>${GALLERY}(\\d+)(?: \\{[a-z-]+\\})*</p>`, 'g'), (m, i) => galleries[Number(i)] || '');
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
 * A snapshot whose teaser rows in a two-column view (Brussels' "Related", "This might also interest
 * you": two teasers side by side) are a three-column view, which lh-com's info importer makes a
 * carousel-cards block (".threecolumn:has(.teaser)"; its two-column views with teasers are left
 * to the text flow, where the teasers stack). Column views nested in it are left as they are.
 */
export const withTeaserColumns = (html) => editDivs(html, '<div class="twocolumn', (el) => {
  if (!el.includes('class="teaser') || /<div class="(?:two|three|four)column/.test(el.slice(1))) return el;
  return el.replace('<div class="twocolumn', '<div class="threecolumn').replace('data-identifier="twocolumn"', 'data-identifier="threecolumn"');
});

/**
 * A column view with www's carousel behaviour (<div class="carousel">: a .hidden-md-down grid and a
 * .hidden-lg-up swiper copy; /be/fr/extra-services/inflight-services' four "Autres sujets" teasers,
 * meetings-and-events' three steps): one card and dots on phones. Marked data-import-phone-slider, as
 * austrian-import.mjs does: the carousel-cards parser gives a marked view phone-slider (a four-column one
 * too); the cards-teaser parser reads the cleanup's carousel flag. A view whose own carousel is missing,
 * or that holds column views of its own, is left as it is.
 */
export const withPhoneSliders = (html) => ['<div class="threecolumn', '<div class="fourcolumn']
  .reduce((out, open) => editDivs(out, open, (el) => {
    const head = el.slice(0, el.indexOf('>') + 1);
    if (/data-import-phone-slider/.test(head) || /<div class="(?:two|three|four)column/.test(el.slice(1))
      || !/<div class="carousel">[\s\S]*?<div class="hidden-lg-up"/.test(el)) return el;
    return el.replace(/^<div class="([^"]*)"/, '<div class="$1" data-import-phone-slider=""');
  }), html);

/*
 * www's sidebar component (.airem-sidebar: .sidebar-content 75% beside .sidebar-aside) whose content
 * holds column views (travel-regulations' picture rows and its grey "Current Travel Regulations"
 * box, brief 441). lh-com's info template takes only sidebars without column views as a
 * columns-media sidebar; this one's content came in as one full-width section, all of it grey
 * (the section transformer's grey region climbs up to the sidebar component). withSidebarContent
 * marks it before the import: the content column gets a col- class, where the transformer's grey
 * region stops (lufthansa-sections.js REGION_STOP [class*="col-"]), so a grey column view in it is
 * a section of its own and the template's other section breaks stay; and a marker paragraph at its
 * start and end. withSidebarSections gives the sections from the start marker's to the end
 * marker's the section style sidebar (the Brussels theme's 75% column) and removes the markers
 * (the cleanup may have added a style token: "{full-width}"). A sidebar that starts inside a
 * section narrows that whole section.
 */
export const SIDEBAR_START = 'brussels-sidebar-start';
export const SIDEBAR_END = 'brussels-sidebar-end';
const sidebarMarker = (t) => `<div class="text section"><div class="richtext"><p>${t}</p></div></div>`;
const COLUMN_VIEWS = /<div class="(?:one|two|three|four)column[ "]/;

export const withSidebarContent = (html) => editDivs(html, '<div class="sidebar ', (el) => {
  const open = '<div class="sidebar-content"';
  const i = el.indexOf(open);
  if (i < 0) return el;
  const body = el.indexOf('>', i) + 1;
  const end = divEnd(el, i) - '</div>'.length;
  if (!COLUMN_VIEWS.test(el.slice(body, end))) return el;
  return `${el.slice(0, i)}<div class="sidebar-content col-sidebar-content"${el.slice(i + open.length, body)}${sidebarMarker(SIDEBAR_START)}${el.slice(body, end)}${sidebarMarker(SIDEBAR_END)}${el.slice(end)}`;
});

const SIDEBAR_MARK = new RegExp(`<p>(${SIDEBAR_START}|${SIDEBAR_END})(?: [{][^}<]*[}])?</p>`, 'g');
const META_OPEN = '<div class="section-metadata">';

/** Section metadata (its outer div, or '') with `style` added to its style row (made when it has none). */
function withSectionStyle(meta, style) {
  const row = /(<div><div>style<\/div><div>)([^<]*)(<\/div><\/div>)/i;
  if (row.test(meta)) return meta.replace(row, (m, x, v, y) => `${x}${v ? `${v}, ` : ''}${style}${y}`);
  const rowHtml = `<div><div>style</div><div>${style}</div></div>`;
  return meta ? meta.replace(META_OPEN, `${META_OPEN}${rowHtml}`) : `${META_OPEN}${rowHtml}</div>`;
}

/** Whether `html` closes every div it opens (a marker there is a direct child of its section). */
const balanced = (html) => (html.match(/<div\b/g) || []).length === (html.match(/<\/div>/g) || []).length;

export function withSidebarSections(doc) {
  if (doc.search(SIDEBAR_MARK) < 0) return doc;
  let out = '';
  let from = 0;
  let inside = false;
  let i = doc.indexOf('<div', from);
  while (i >= 0) {
    const close = divEnd(doc, i);
    const section = doc.slice(i, close);
    const open = section.indexOf('>') + 1;
    let body = section.slice(open, -'</div>'.length);
    const m = body.lastIndexOf(META_OPEN);
    const meta = m >= 0 && balanced(body.slice(0, m)) ? body.slice(m, divEnd(body, m)) : '';
    if (meta) body = body.slice(0, m) + body.slice(m + meta.length);
    // the section's parts between markers; a marker inside a block only toggles
    const split = [...body.matchAll(SIDEBAR_MARK)].reduce((acc, mark) => {
      const part = acc.part + body.slice(acc.last, mark.index);
      const done = balanced(part);
      return {
        parts: done ? [...acc.parts, [part, acc.inside]] : acc.parts,
        part: done ? '' : part,
        last: mark.index + mark[0].length,
        inside: mark[1] === SIDEBAR_START,
      };
    }, {
      parts: [], part: '', last: 0, inside,
    });
    const parts = [...split.parts, [split.part + body.slice(split.last), split.inside]];
    inside = split.inside;
    const sections = parts.filter(([html]) => html.replace(/\s/g, ''))
      .map(([html, side]) => `${section.slice(0, open)}${html}${side ? withSectionStyle(meta, 'sidebar') : meta}</div>`);
    out += doc.slice(from, i) + sections.join('\n');
    from = close;
    i = doc.indexOf('<div', from);
  }
  return out + doc.slice(from);
}

/**
 * The flight search picker's texts in the page's language (www's label state, a script the import
 * strips first: brief 448) on the body as data-lh-booking-labels, for lh-com's flight-search
 * parser; a page without them as it is.
 */
export function withBookingLabels(html) {
  const labels = pageBookingLabels(html);
  if (!labels) return html;
  const value = JSON.stringify(labels).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
  return html.replace(/<body\b/i, `<body data-lh-booking-labels="${value}"`);
}

// the booking-lookup's hand-off: www's check-in app is not reachable from the replica (and its
// target is not in the page), so a valid search opens the same page on www, nothing in the URL
export const withCheckinHandoff = (doc, p) => doc
  // the login widget's "Enter booking code" (lh-com: its own dialog) opens the page on www
  .split('href="#booking-code"').join(`href="https://${HOST}${p}"`).replace(/<div class="booking-lookup(?: [^"]*)?">/g, (m) => (/Submit URL/.test(doc) ? m : `${m}<div><div>Submit URL</div><div>https://${HOST}${p}</div></div>`));

// the core forms: a proposed lh-forms id per page name (brussels-<page>; lh-forms does not know
// them yet, so the form pages stay on preview)
// www's copies of a form under another page name: the form's id (ro/en's ask-invoice1 is the invoice
// request, brief 441)
const FORM_ALIASES = { 'ask-invoice1': 'ask-invoice' };
export const formIdOf = (p) => {
  const name = p.split('/').pop().replace(/[^a-z0-9-]/gi, '-').toLowerCase();
  return `brussels-${FORM_ALIASES[name] || name}`;
};
const CONFIG_ROW = /<div><div>(?:(?!<\/div><div>)[\s\S])*?<\/div><div>config<\/div><div>(?:form|success|error)<\/div>(?:<div><\/div>){7}<\/div>/g;
const ERROR_ROW = /<div><div>(?:(?!<\/div><div>)[\s\S])*?<\/div><div>config<\/div><div>error<\/div>(?:<div><\/div>){7}<\/div>/g;
const configRow = (name, value) => `<div><div>${value}</div><div>config</div><div>${name}</div>${'<div></div>'.repeat(7)}</div>`;
const linkRow = (name, href) => configRow(name, `<a href="${href}">${href}</a>`);

/**
 * The snapshot without www's leftover test forms: a form whose first section title ends in "Test"
 * (ro/en's ask-invoice1: "Invoicing details Biztalk Test", a second form posting to the same
 * handler, brief 441), with its container. A container that holds more than one form is looked
 * into.
 */
export function withoutTestForms(html) {
  const open = '<div class="container responsivegrid">';
  return editDivs(html, open, (el) => {
    const forms = el.split('<form').length - 1;
    if (forms > 1) return open + withoutTestForms(el.slice(open.length));
    const title = (el.match(/class="(?:[^"]*\s)?form-section-headline(?:\s[^"]*)?">([^<]*)</) || [])[1] || '';
    return forms === 1 && /\sTest\s*$/.test(title) ? '' : el;
  });
}

/** www's confirmation page of a form (its :redirect) as the public path on the site. */
export function successOf(html) {
  const redirect = (String(html || '').match(/name=":redirect"[^>]*value="([^"]+)"|value="([^"]+)"[^>]*name=":redirect"/) || []).slice(1).find(Boolean) || '';
  const m = redirect.match(/^\/content\/bel\/markets(\/[a-z]{2}\/[a-z]{2})(\/.+?)(?:\.html)?$/);
  // (the GUID copy of be/en's invoice form redirects into /content/bel/gc/, Lufthansa's global
  // tree: no public page)
  return m ? `${m[1]}${m[2]}` : '';
}

/**
 * A Brussels form document with its form config row (the proposed lh-forms id) and its success
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

// the flight search hands the search to Brussels' shop (www's flight manager posts to
// shop.brusselsairlines.com, the same booking platform as Lufthansa's) and starts from Brussels
export const SHOP = 'https://shop.brusselsairlines.com/booking/availability';
// the market's airport per root, named in the root's language (the homepages' flight search)
const DEFAULT_ORIGIN = { 'be/en': 'Brussels (BRU)', 'be/fr': 'Bruxelles (BRU)', 'be/nl': 'Brussel (BRU)' };

/** The document's flight-search blocks with the Shop row and the market's default origin. */
export function withFlightSearch(doc, p) {
  const key = p.split('/').slice(1, 3).join('/');
  return doc.replace(/<div class="flight-search(?: [^"]*)?">/g, (m) => {
    const rows = [`<div><div>Shop</div><div><a href="${SHOP}">${SHOP}</a></div></div>`];
    if (DEFAULT_ORIGIN[key]) rows.push(`<div><div>Default origin</div><div>${DEFAULT_ORIGIN[key]}</div></div>`);
    return `${m}${rows.join('')}`;
  });
}

// www's destination finder titles its offers itself (maui-headline type h1). A capture with the
// widget rendered keeps the title in the import; the others (be/en, be/fr our-destinations) left
// the page without one (axe page-has-heading-one). The labels www's captures show, per language.
/**
 * One h1 per document (brief 448): www's own where it has one (the market homepages' visually
 * hidden h1, www's header: the first section's h1 with the style hidden-heading, as Discover's);
 * where www has none, the document's first heading if it is an h2 (the class pages' stage title:
 * the theme styles a stage's title the same at any level), its id and text (with any size marker)
 * kept; with no heading at all, the page's title (metadata Title, without " | Brussels Airlines")
 * as a hidden h1. A document with an h1 stays as it is.
 * @param {string} doc the document (.plain.html)
 * @param {string} html www's snapshot of the page
 */
export function withPageH1(doc, html) {
  if (/<h1[\s>]/i.test(doc)) return doc;
  if (/<h1\b[^>]*class="[^"]*\bsr-only\b/i.test(html || '')) return withHiddenH1(doc, html);
  const first = doc.match(/<h([2-6])(\s[^>]*)?>([\s\S]*?)<\/h\1>/i);
  if (first && first[1] === '2') {
    return `${doc.slice(0, first.index)}<h1${first[2] || ''}>${first[3]}</h1>${doc.slice(first.index + first[0].length)}`;
  }
  if (first) return doc;
  const title = (doc.match(/<div><div>Title<\/div><div>([\s\S]*?)<\/div><\/div>/) || [])[1];
  const name = title && title.replace(/<[^>]+>/g, '').replace(/\s*\|\s*Brussels Airlines\s*$/i, '').trim();
  if (!name) return doc;
  return withHiddenH1(doc, `<h1 class="sr-only">${name}</h1>`);
}

export const FINDER_TITLES = { en: 'Best offers', fr: 'Meilleures offres', es: 'Las mejores ofertas' };

/** A finder page without an h1: www's finder title in the page's language above the finder (not
 * the homepages: www's homepage finder has no title). */
export function withFinderTitle(doc, p) {
  const title = FINDER_TITLES[p.split('/')[2]];
  if (!title || /\/homepage$/.test(p) || /<h1[\s>]/.test(doc)) return doc;
  return doc.replace(/<div class="destination-finder(?: [^"]*)?">/, (m) => `<h1>${title}</h1>${m}`);
}

/** The template of a page from its path and snapshot. */
export function templateOf(p, html) {
  // (homepage-new: the variant homepage some Italian-language roots have, al/it, be/it, ch/it)
  if (/^\/[a-z]{2}\/[a-z]{2}\/homepage$/.test(p)) return 'homepage';
  // articles and the article hub: lh-com's insights template (article-header, price-bar)
  if (/<meta name="template" content="article"/.test(html) || /class="dcep-blog-overview/.test(html)) return 'insights';
  if (/class="topoffersdestinationfinder/.test(html)) return 'hub';
  if (/class="flightstatustimetable/.test(html)) return 'flight-status';
  // (a gallery page: info, its galleries from a fleet import of the page, spliceGalleries)
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
  // pages with a gallery (withGalleryPlaceholders): their snapshots as they are for the fleet import
  const galleries = [];
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
    const mapped = withoutLoads(withPhoneSliders(withTeaserColumns(withCheckinTabs(withLinkOuts(withHotlines(withPaymentTable(withPlaceholder(withSidebarContent(withoutTestForms(editDivs(stripScripts(withBookingLabels(html)), '<div id="ui-datepicker-div"', () => '')))))), p)))))
      .replace(/<output[^>]*class="screen-reader-announcer"[^>]*>[\s\S]*?<\/output>/g, '');
    if (mapped.includes(`https://${LINK_OUT}`)) linkOuts.push(p);
    if (/<div class="slideshow/.test(mapped)) {
      const fleetCopy = path.join(GALLERY_W, 'snapshots', HOST, `${p}.html`);
      fs.mkdirSync(path.dirname(fleetCopy), { recursive: true });
      fs.writeFileSync(fleetCopy, mapped);
      galleries.push(u);
    }
    fs.writeFileSync(copy, galleries.includes(u) ? withGalleryPlaceholders(mapped) : mapped);
    (byTemplate[t] ||= []).push(u);
    out[p] = t;
  });
  console.log(`${name}: ${Object.entries(byTemplate).map(([t, l]) => `${t} ${l.length}`).join(', ')}; no snapshot: ${missing.length ? missing.join(' ') : 'none'}; galleries: ${galleries.length}`);
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
    // where lh-com has reports of its own at paths Brussels has too (/be/en/..., /de/de/...):
    // those are set aside before the import and put back after it
    const REPORTS = path.join(root, 'tools/importer/reports');
    const ASIDE = path.join(W, 'reports-aside');
    const aside = Object.keys(out).filter((p) => fs.existsSync(path.join(REPORTS, `${p}.report.json`)));
    aside.forEach((p) => {
      fs.mkdirSync(path.dirname(path.join(ASIDE, `${p}.report.json`)), { recursive: true });
      fs.copyFileSync(path.join(REPORTS, `${p}.report.json`), path.join(ASIDE, `${p}.report.json`));
    });
    // the gallery pages once more with the fleet template, in a workspace of their own: their
    // galleries (carousel-lightbox) go into the info import's placeholders (spliceGalleries)
    if (galleries.length) {
      const gflag = path.join(GALLERY_W, '.migration/project.json');
      fs.mkdirSync(path.dirname(gflag), { recursive: true });
      fs.writeFileSync(gflag, `${JSON.stringify({ botProtected: true }, null, 2)}\n`);
      const glist = path.join(GALLERY_W, `urls-${name}.txt`);
      fs.writeFileSync(glist, `${galleries.join('\n')}\n`);
      const glog = execFileSync('node', [`${CI}/run-bulk-import.js`, '--import-script', 'tools/importer/import-fleet.bundle.js', '--urls', glist, '--force', '--html-dir', path.join(GALLERY_W, 'snapshots')], {
        cwd: root, env: { ...process.env, WORKSPACE_PATH: GALLERY_W, BD_ENDPOINT: '' }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024,
      });
      glog.split('\n').filter((x) => /Snapshot import failed|falling through to live/i.test(x)).forEach((x) => console.log(`WARNING (live fallback): ${x.trim()}`));
      console.log(`galleries (fleet): ${glog.split('\n').filter((x) => /imported|failed|error/i.test(x) && !/wss:|endpoint/i.test(x)).slice(-2).join(' | ')}`);
    }
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
    // this batch's reports go to content-sites/lh-brussels/reports; lh-com's set-aside ones come back
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
    const sites = path.join(root, 'tools/importer/sites/lh-brussels.json');
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
      const fleetDoc = path.join(GALLERY_W, 'content', `${p}.plain.html`);
      const galleried = galleries.some((u) => new URL(u).pathname === src)
        ? spliceGalleries(doc, fs.existsSync(fleetDoc) ? fs.readFileSync(fleetDoc, 'utf8') : '') : doc;
      const snap = fs.readFileSync(path.join(SNAP, `${src}.html`), 'utf8');
      // (one h1 per document after the finder's title: withPageH1, brief 448)
      const next = withPageH1(withSidebarSections(withItaMetadata(withCheckinHandoff(withFlightSearch(withFinderTitle(withItaForm(galleried, p, snap), p), p), p), p, snap, markets)), snap);
      if (next !== doc) fs.writeFileSync(f, next);
    });
    const mapOnly = path.join(W, 'runs', `${name}-upload.txt`);
    fs.writeFileSync(mapOnly, `${made.join('\n')}\n`);
    // site-postprocess's step 3 rewrites every document: outside the batch only links made
    // relative stay (onlyBatch), so a run never takes an earlier or another session's link back
    // to www
    const post = onlyBatch('lh-brussels', new Set(made), () => execFileSync('node', ['tools/importer/site-postprocess.mjs', '--site', 'lh-brussels', '--source-host', HOST, '--snapshots', path.join(MAPPED, HOST), '--real-placeholder', PLACEHOLDER, '--map-only', mapOnly], { cwd: root, encoding: 'utf8' }));
    console.log(post.result.trim().split('\n').slice(-3).join('\n'));
    console.log(`site-postprocess: ${post.restored.length} documents outside the batch left as they were`);
    // links to the site's pages relative (own-links.mjs: its documents and the market roots'
    // pages lh-edge answers from them), after site-postprocess (which knows only the pages
    // imported so far)
    const pages = ownPages('lh-brussels');
    const aliases = ownAliases('lh-brussels');
    // the login and profile pages and the cockpit deep link the replica serves (lh-brussels.json served)
    const served = ownServed('lh-brussels');
    // a link-out document keeps its link to its own page on www
    const linkOutDocs = new Set(allow.linkOuts || []);
    made.forEach((p) => {
      const f = path.join(W, 'content', `${p}.plain.html`);
      const doc = fs.readFileSync(f, 'utf8');
      // a share image www doesn't serve: Brussels' own logo (brussels-share-image.mjs)
      const next = withShareImage(withOwnLinks(withLocalImages(relativeDamLinks(doc.split(`https://${LINK_OUT}`).join(`https://${HOST}`))), HOST, pages, aliases, { linkOut: linkOutDocs.has(p) ? p : null, served }).doc);
      if (next !== doc) fs.writeFileSync(f, next);
    });
    // the last step: no import writes style markers (token-free styling, tools/importer/marker-collapse.mjs)
    collapseDocs(made.map((p) => path.join(W, 'content', `${p}.plain.html`)), { brand: 'brussels', content: path.join(W, 'content') });
    fs.writeFileSync(path.join(W, 'runs', `${name}-import.json`), `${JSON.stringify({ templates: out, documents: made, missing }, null, 1)}\n`);
    console.log(`${made.length} documents; upload list runs/${name}-upload.txt`);
  }
}
