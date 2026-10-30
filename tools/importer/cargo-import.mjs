/* eslint-disable no-console, no-continue, no-restricted-syntax, max-len, no-nested-ternary, import/extensions, import/prefer-default-export, import/no-extraneous-dependencies, no-use-before-define -- tooling */
/**
 * Imports Lufthansa Cargo's pages (lh-cargo) offline from their rendered snapshots
 * (content-sites/lh-cargo/delivery/snapshots/www.lufthansa-cargo.com/<path>.html, Liferay DXP)
 * into content-sites/lh-cargo/content/<Edge Delivery path>.plain.html, with lh-com's existing
 * blocks only (Cargo keeps lh-com's Lufthansa look). Nothing is fetched: images, documents and
 * videos come from tools/importer/cargo-assets.mjs (content-sites/lh-cargo/assets/files.json);
 * a file not downloaded yet stays a link to www (and is listed as missing).
 *
 * Liferay content pages (fragments, lfr-layout-structure-item-<key>):
 * - full-width structure fragments are sections; a grey one gets the section style grey;
 * - page header slider: its image (several: carousel-images); introduction: default content;
 * - tabs (tabs---sf-01, Bootstrap tabs that are an accordion on mobile): accordion-columns (faq),
 *   one item per tab; a tab whose panel holds a table of more than two columns, a gallery or a
 *   carousel: the tabs as sections with the tab title as H2 instead (lh-com has no tabs block);
 * - text and image side by side (cf5-cf8): columns-media, consecutive ones one block; text in two
 *   columns (cf3): columns-media text | text; card rows (cf9, cf10, cf12): cards-teaser (2, three-up, four-up);
 * - video (cf16): columns-media with the poster and the .mp4 link {controls round-play-button};
 *   the .mp4 in lh-cargo's DA (up to 36 MB) or on static.lufthansa-cargo.com (larger);
 * - gallery (cf15): carousel-images; accordion (cf17): accordion-columns (faq); table (cf19):
 *   table-striped; citation (cf23): a quote; the rest (heading, paragraph, image, button, html,
 *   list view, collection): default content.
 * Web content pages (journal articles in portlets): the homepage components (slider: hero-campaign
 * for the first slide, cards-teaser (overlay) for the others; the booking/track/schedule/stations
 * widget: cards-icon linking the portal on www; Mynewsdesk news: a link to the newsroom; station
 * map with counters, about, products: columns-media; fleet tiles: cards-teaser (overlay); eServices
 * slider: carousel-cards; ULD teaser: hero-card-overlay), the company pages (video header:
 * hero-campaign; facts slider: carousel-images; history timeline: carousel-cards), articles
 * (asset publisher: H1, dateline, text, image), legal pages (tables: table-striped).
 * Everywhere: forms, the portal's tools and Google Maps become a link to the page on www; the
 * Matterport tours and the Mynewsdesk newsroom a link to their player; consent overlays,
 * carousel clones and mobile-only duplicates are dropped; links to pages in scope become the
 * site's paths (tools/importer/cargo-paths.mjs, content-sites/lh-cargo/paths.json), the rest
 * absolute links to www.lufthansa-cargo.com.
 * Writes content-sites/lh-cargo/runs/batch-<n>-import.json (path -> blocks, notes, missing files)
 * and adds the documents to the allowlist tools/importer/sites/lh-cargo.json.
 *
 * Usage: node tools/importer/cargo-import.mjs --list content-sites/lh-cargo/batches/batch-01.txt [--name batch-1] [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import {
  HOST, sourcePath, REDIRECT_ONLY, LANGUAGE_LESS,
} from './cargo-paths.mjs';
import { fileKey, edsName } from './cargo-assets.mjs';

const sha1 = (s) => crypto.createHash('sha1').update(s).digest('hex');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const W = path.join(root, 'content-sites/lh-cargo');
const SNAP = path.join(W, 'delivery/snapshots/www.lufthansa-cargo.com');
const OUT = path.join(W, 'content');
const readJson = (f, d) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d);

const LABELS = {
  en: {
    form: 'Go to the form on www.lufthansa-cargo.com',
    map: 'Show the map on www.lufthansa-cargo.com',
    tour: 'Start the virtual tour (Matterport)',
    newsroom: 'Lufthansa Cargo newsroom on Mynewsdesk',
    booking: 'Booking',
    track: 'Track',
    schedule: 'Schedule',
    stations: 'Stations',
  },
  de: {
    form: 'Zum Formular auf www.lufthansa-cargo.com',
    map: 'Karte auf www.lufthansa-cargo.com anzeigen',
    tour: 'Virtuelle Tour starten (Matterport)',
    newsroom: 'Newsroom von Lufthansa Cargo auf Mynewsdesk',
    booking: 'Buchung',
    track: 'Tracking',
    schedule: 'Flugplan',
    stations: 'Stationen',
  },
};
export const MYNEWSDESK = 'https://lufthansa-cargo-ag-com.mynewsdesk.com';

/* ------------------------------------------------------------------ site data ---------- */

let site;
/** The site's paths, files and counterparts (loaded once). */
export function loadSite() {
  if (site) return site;
  const paths = readJson(path.join(W, 'paths.json'), {});
  const files = readJson(path.join(W, 'assets/files.json'), {});
  const state = readJson(path.join(W, 'assets/state.json'), { done: {} });
  const alternates = {};
  const tsv = path.join(W, 'delivery/urls-all.tsv');
  if (fs.existsSync(tsv)) {
    fs.readFileSync(tsv, 'utf8').split(/\r?\n/).slice(1).filter(Boolean)
      .forEach((l) => {
        const [url, , alt] = l.split('\t');
        if (alt) alternates[sourcePath(url)] = sourcePath(alt);
      });
  }
  site = {
    paths, files, state, alternates,
  };
  return site;
}

/* ------------------------------------------------------------------ helpers ------------ */

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s) => esc(s).replace(/"/g, '&quot;');
export const text = (n) => (n ? n.textContent : '').replace(/[\s\u200b]+/g, ' ').trim();
const cls = (n) => (n && n.getAttribute ? n.getAttribute('class') || '' : '');
const hasCls = (n, re) => re.test(cls(n));

/** Elements never imported: scripts, consent overlays, carousel clones, hidden and mobile-only duplicates, UI controls. */
export function isSkipped(n) {
  if (!n.tagName) return false;
  if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|SVG|BUTTON|INPUT|SELECT|TEXTAREA|LABEL|LINK|META|OPTION)$/i.test(n.tagName)) return true;
  if (n.hasAttribute('hidden') || n.getAttribute('aria-hidden') === 'true') return !n.querySelector('img');
  const c = cls(n);
  if (/(^|\s)(videoOverlayConsent|googleMapsOverlayConsent|consentText|portlet-header|portlet-title-text|owl-nav|owl-dots|swiper-pagination|swiper-button-(prev|next)|flex-control-nav|flex-direction-nav|carousel-indicators|tab-indicator|scrollArrowWrapper|LCAGCP-ScrollButtonContainer|eportalBreadcrumb|diariesBackLinkContainer|story-scrollLink|sr-only|visually-hidden|hide|d-md-none|d-lg-none|visible-xs|visible-sm)(\s|$)/.test(c)) return true;
  if (/(^|\s)(cloned|clone)(\s|$)/.test(c) || /_clone$/.test(n.id || '')) return true;
  if (/LCAGCP-lcagMobile|(^|\s)mobile(View|Only|Slider)/.test(c)) return true;
  if (/(^|\s)d-none(\s|$)/.test(c) && !/(^|\s)d-(sm|md|lg|xl)-(block|flex|inline|inline-block|table|grid)(\s|$)/.test(c)) return true;
  const style = n.getAttribute('style') || '';
  if (/display:\s*none/.test(style)) return true;
  return false;
}

/* ------------------------------------------------------------------ the page ----------- */

export class Page {
  constructor(source, lang, html) {
    this.source = source;
    this.lang = lang;
    this.html = html;
    this.sections = [{ style: null, items: [] }];
    this.blocks = {};
    this.notes = [];
    this.missing = new Set();
    this.linkedOut = new Set();
    this.formLinked = false;
    this.mapLinked = false;
  }

  get labels() { return LABELS[this.lang] || LABELS.en; }

  get current() { return this.sections[this.sections.length - 1]; }

  /** Starts a new section (style grey or null) unless the current one is still empty. */
  section(style = null) {
    if (!this.current.items.length) { this.current.style = style; return; }
    this.sections.push({ style, items: [] });
  }

  add(html) { if (html && html.trim()) this.current.items.push({ html }); }

  /**
   * A block: name with options ('cards-teaser (three-up)'), rows of cells (HTML strings).
   * With merge, rows join the block right before it of the same name and merge key.
   */
  block(name, rows, merge) {
    const clean = rows.map((r) => r.filter((c) => c !== null && c !== undefined)).filter((r) => r.some((c) => c.trim()));
    if (!clean.length) return;
    const last = this.current.items[this.current.items.length - 1];
    if (merge && last && last.block === name && last.merge === merge) { last.rows.push(...clean); return; }
    this.blocks[name] = (this.blocks[name] || 0) + 1;
    this.current.items.push({ block: name, rows: clean, merge });
  }

  note(s) { if (!this.notes.includes(s)) this.notes.push(s); }

  /** A link's target: the site's path for pages in scope and downloaded files, else www. */
  href(raw) {
    const h = (raw || '').trim().replace(/&amp;/g, '&');
    if (!h || /^javascript:/i.test(h)) return null;
    if (/^(mailto|tel):/i.test(h)) return h;
    if (h.startsWith('#')) return h === '#privacy-settings' ? h : null;
    let u;
    try { u = new URL(h.replace(/^\/\//, 'https://'), `${HOST}${this.source}`); } catch (e) { return h; }
    if (!/^(www\.)?lufthansa-cargo\.com$/.test(u.hostname)) {
      if (u.origin === 'https://static.lufthansa-cargo.com') return this.file(u.href) || u.href;
      return u.href;
    }
    if (/^\/documents\//.test(u.pathname)) return this.file(u.href) || `${HOST}${u.pathname}${u.search}`;
    const { paths, alternates } = loadSite();
    const p = sourcePath(u.href);
    const local = (sp) => {
      if (paths[sp]) return paths[sp];
      if (REDIRECT_ONLY[sp]) return REDIRECT_ONLY[sp];
      return null;
    };
    let target = local(p);
    // language-less addresses (/speed-pro, /data-protection): the page of this language
    if (!target && !/^\/[a-z]{2}(\/|$)/.test(p)) {
      target = local(`/${this.lang}${p}`);
      if (!target && LANGUAGE_LESS[p]) {
        const en = LANGUAGE_LESS[p];
        const enSource = Object.keys(paths).find((k) => paths[k] === en) || en;
        target = this.lang === 'en' ? en : (alternates[enSource] && local(alternates[enSource])) || en;
      }
    }
    if (target) return target;
    this.linkedOut.add(p);
    return `${HOST}${u.pathname}${u.search}${u.hash}`;
  }

  /** A file's Edge Delivery path once downloaded (images, documents, videos); null for links to the source. */
  file(src) {
    const key = fileKey(src);
    if (!key) return null;
    const { files, state } = loadSite();
    const f = files[key];
    if (!f || !f.eds) return null;
    const d = state.done[key];
    if (!d || d.status !== 200) { this.missing.add(key); return null; }
    if (f.kind !== 'image') return f.eds;
    // images: in the document tree, where da-upload.mjs finds them (named by their real type;
    // SVGs as the PNGs prepareImages made, as lh-com's documents hold raster images only)
    const svg = /svg/.test(d.type || '');
    const cached = path.join(W, 'assets/cache', `${sha1(key)}${svg ? '.png' : ''}`);
    if (svg && !fs.existsSync(cached)) { this.missing.add(key); return null; }
    const eds = edsName(key, 'image', svg ? 'image/png' : d.type);
    const dest = path.join(OUT, eds);
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.copyFileSync(cached, dest);
    }
    return eds;
  }

  /** An image: <picture> of its copy, or of www's URL while it is missing. */
  img(node) {
    const src = node.getAttribute('src') || node.getAttribute('data-src') || '';
    if (!src || /sprite|spacer|blank\.gif|^data:/i.test(src)) return '';
    const local = this.file(src);
    const url = local || (fileKey(src) ? `${HOST}${new URL(src, HOST).pathname}` : src);
    if (!local && !fileKey(src)) return '';
    // an image that is broken on www itself (404 at download) is left out
    const done = loadSite().state.done[fileKey(src)];
    if (!local && done && done.status !== 200) { this.note(`image ${src.split('?')[0]}: ${done.status} on www, left out`); return ''; }
    return `<picture><img src="${attr(url)}" alt="${attr(node.getAttribute('alt') || '')}"></picture>`;
  }

  /** A background image URL (data-desktop or style) as a picture. */
  bg(node) {
    const src = node.getAttribute('data-desktop') || ((node.getAttribute('style') || '').match(/url\((?:&quot;|["'])?([^"')&]+)/) || [])[1];
    if (!src) return '';
    const local = this.file(src);
    if (!local && !fileKey(src)) return '';
    return `<picture><img src="${attr(local || `${HOST}${new URL(src, HOST).pathname}`)}" alt=""></picture>`;
  }
}

/* ------------------------------------------------------------------ inline content ----- */

/** The inline HTML of a node's children (strong, em, links, line breaks, images). */
function inline(node, page) {
  let out = '';
  node.childNodes.forEach((c) => {
    if (c.nodeType === 3) { out += esc(c.textContent.replace(/[\s\u200b]+/g, ' ')); return; }
    if (c.nodeType !== 1 || isSkipped(c)) return;
    const t = c.tagName.toLowerCase();
    if (t === 'br') { out += '<br>'; return; }
    if (t === 'img') { out += page.img(c); return; }
    if (t === 'picture') { const i = c.querySelector('img'); if (i) out += page.img(i); return; }
    const inner = inline(c, page);
    if (t === 'a') {
      const href = page.href(c.getAttribute('href'));
      const label = inner.trim();
      if (!href || !label) { out += inner; return; }
      // spaces at the ends of the link text stay outside the link ("td.Pro and td.Zoom")
      out += `${/^\s/.test(inner) ? ' ' : ''}<a href="${attr(href)}">${label}</a>${/\s$/.test(inner) ? ' ' : ''}`;
      return;
    }
    if (/^(strong|b)$/.test(t)) { out += inner.trim() ? `<strong>${inner}</strong>` : inner; return; }
    if (/^(em|i)$/.test(t)) { out += inner.trim() && !c.className ? `<em>${inner}</em>` : inner; return; }
    if (/^(sup|sub)$/.test(t)) { out += `<${t}>${inner}</${t}>`; return; }
    if (/^(p|div|h[1-6]|li|ul|ol)$/.test(t)) { out += ` ${inner} `; return; }
    out += inner;
  });
  return out;
}

const tidy = (h) => h.replace(/\s+/g, ' ').replace(/(<br>\s*)+$/g, '').replace(/^(\s*<br>)+/g, '').trim();
const isEmptyHtml = (h) => !h.replace(/<br>/g, '').replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, (m) => (/^<img/.test(m) ? 'x' : '')).trim();

/* ------------------------------------------------------------------ flow content ------- */

/**
 * Block-level HTML of a node's content, for default content or a block cell. In a cell (mode
 * 'cell') tables become lists (key: value) and components their plain content.
 */
function flow(node, page, mode = 'cell') {
  const out = [];
  let run = '';
  const flush = () => { const h = tidy(run); if (!isEmptyHtml(h)) out.push(`<p>${h}</p>`); run = ''; };
  node.childNodes.forEach((c) => {
    if (c.nodeType === 3) { run += esc(c.textContent.replace(/[\s\u200b]+/g, ' ')); return; }
    if (c.nodeType !== 1) return;
    if (/(^|\s)(videoOverlayConsent|googleMapsOverlayConsent)(\s|$)/.test(cls(c)) && !/(^|\s)hide(\s|$)/.test(cls(c))) {
      flush();
      out.push(...blockedPlayer(c, page));
      return;
    }
    if (isSkipped(c)) return;
    const t = c.tagName;
    if (/^(STRONG|B|EM|I|SUP|SUB|BR|SMALL|U|FONT|ABBR|CODE)$/.test(t)) { run += inline({ childNodes: [c] }, page); return; }
    if (t === 'SPAN' && !c.querySelector('p, div, h1, h2, h3, h4, h5, h6, ul, ol, table, img')) { run += inline(c, page); return; }
    if (t === 'A' && !c.querySelector('p, div, h1, h2, h3, h4, h5, h6, img, picture')) {
      const a = inline({ childNodes: [c] }, page);
      if (/^\s*(<br>|\s)*$/.test(run.replace(/&nbsp;/g, ''))) {
        flush();
        // a button (btn): primary; a navigation link stays a link
        out.push(/(^|\s)(btn|btn1|button|more)(\s|$)/.test(cls(c)) && a ? `<p><strong>${a}</strong></p>` : (a ? `<p>${a}</p>` : ''));
      } else run += a;
      return;
    }
    flush();
    out.push(...element(c, page, mode));
  });
  flush();
  return out.filter(Boolean);
}

/** One element as block-level HTML strings (headings, paragraphs, lists, images, tables, components). */
function element(c, page, mode) {
  const t = c.tagName;
  if (/^H[1-6]$/.test(t)) {
    const h = tidy(inline(c, page)).replace(/<br>/g, ' ');
    return isEmptyHtml(h) ? [] : [`<${t.toLowerCase()}>${h}</${t.toLowerCase()}>`];
  }
  if (t === 'P') {
    const h = tidy(inline(c, page));
    if (isEmptyHtml(h)) return [];
    if (/^<a [^>]+>[^<]*<\/a>$/.test(h) && /(^|\s)(btn|btn1)(\s|$)/.test(cls(c.querySelector('a')))) return [`<p><strong>${h}</strong></p>`];
    return [`<p>${h}</p>`];
  }
  if (t === 'UL' || t === 'OL') return list(c, page);
  if (t === 'IMG') { const i = page.img(c); return i ? [`<p>${i}</p>`] : []; }
  if (t === 'PICTURE') { const i = c.querySelector('img'); const h = i ? page.img(i) : ''; return h ? [`<p>${h}</p>`] : []; }
  if (t === 'HR') return [];
  if (t === 'A' && !c.querySelector('p, div, h1, h2, h3, h4, h5, h6, ul, ol, table')) {
    const a = tidy(inline({ childNodes: [c] }, page));
    return isEmptyHtml(a) ? [] : [/(^|\s)(btn|btn1)(\s|$)/.test(cls(c)) ? `<p><strong>${a}</strong></p>` : `<p>${a}</p>`];
  }
  if (t === 'BLOCKQUOTE') return [`<blockquote>${flow(c, page, 'cell').join('')}</blockquote>`];
  if (t === 'TABLE') {
    if (mode === 'top') { tableBlock(c, page); return []; }
    return tableAsList(c, page);
  }
  if (t === 'IFRAME') return iframe(c, page);
  if (t === 'FORM') return formLink(page);
  if (t === 'VIDEO') {
    if (mode === 'top') { video(c.parentElement || c, page); return []; }
    const v = videoCell(c.parentElement || c, page);
    return v ? [v] : [];
  }
  if (t === 'DL') return [...c.querySelectorAll('dt, dd')].map((d) => `<p>${d.tagName === 'DT' ? `<strong>${tidy(inline(d, page))}</strong>` : tidy(inline(d, page))}</p>`);
  if (mode === 'top' && component(c, page)) return [];
  if (mode === 'cell') {
    const special = cellComponent(c, page);
    if (special) return special;
  }
  return flow(c, page, mode);
}

function list(c, page) {
  const tag = c.tagName.toLowerCase();
  const items = [...c.children].filter((li) => li.tagName === 'LI' && !isSkipped(li)).map((li) => {
    const nested = [...li.children].filter((x) => /^(UL|OL)$/.test(x.tagName));
    const clone = li.cloneNode(true);
    [...clone.children].filter((x) => /^(UL|OL)$/.test(x.tagName)).forEach((x) => x.remove());
    const own = tidy(inline(clone, page));
    const sub = nested.flatMap((n) => list(n, page)).join('');
    return isEmptyHtml(own) && !sub ? '' : `<li>${own}${sub}</li>`;
  }).filter(Boolean);
  return items.length ? [`<${tag}>${items.join('')}</${tag}>`] : [];
}

/** Table rows as cells of inline HTML. */
function tableRows(table, page) {
  return [...table.querySelectorAll('tr')].filter((tr) => !isSkipped(tr)).map((tr) => [...tr.children].filter((td) => /^T[DH]$/.test(td.tagName))
    .map((td) => ({ th: td.tagName === 'TH', html: flow(td, page, 'cell').join('') || '' })))
    .filter((r) => r.some((x) => !isEmptyHtml(x.html)));
}

function tableBlock(table, page) {
  const rows = tableRows(table, page);
  if (!rows.length) return;
  const header = rows[0].length > 1 && rows[0].every((x) => x.th) && rows.length > 1;
  page.block(header ? 'table-striped (header)' : 'table-striped', rows.map((r) => r.map((x) => x.html.replace(/^<p>(.*)<\/p>$/, '$1'))));
}

/** A table inside a block cell (no nesting): two columns as "label: value" items, else one item per row. */
function tableAsList(table, page) {
  const rows = tableRows(table, page);
  if (!rows.length) return [];
  const strip = (h) => h.replace(/<\/?p>/g, ' ').trim();
  if (rows[0].length > 2 && rows.length > 1 && rows[0].every((x) => x.th)) {
    const head = rows[0].map((x) => strip(x.html));
    return [`<ul>${rows.slice(1).map((r) => `<li>${r.map((x, i) => `${head[i] ? `<strong>${head[i]}</strong>: ` : ''}${strip(x.html)}`).join('; ')}</li>`).join('')}</ul>`];
  }
  return [`<ul>${rows.map((r) => `<li>${r.length > 1 ? `<strong>${strip(r[0].html)}</strong>: ${r.slice(1).map((x) => strip(x.html)).join(', ')}` : strip(r[0].html)}</li>`).join('')}</ul>`];
}

/* ------------------------------------------------------------------ media and links ---- */

const MATTERPORT = /https:\/\/my\.matterport\.com\/show\/\?m=[A-Za-z0-9]+/;

function iframe(c, page) {
  const src = c.getAttribute('src') || c.getAttribute('data-src') || '';
  if (/mynewsdesk\.com/.test(src)) {
    page.note('Mynewsdesk newsroom iframe: a link to the newsroom on Mynewsdesk');
    return [`<p><a href="${MYNEWSDESK}">${esc(page.labels.newsroom)}</a></p>`];
  }
  if (/youtube(-nocookie)?\.com|youtu\.be/.test(src)) {
    page.block('embed', [[`<p><a href="${attr(src.replace(/^\/\//, 'https://'))}">${attr(src.replace(/^\/\//, 'https://'))}</a></p>`]]);
    return [];
  }
  const tour = (page.html.match(MATTERPORT) || [])[0];
  if ((src === 'about:blank' || /matterport/.test(src)) && tour) {
    page.note(`Matterport tour ${tour}: a link (embed block has no Matterport player)`);
    return [`<p><a href="${tour}">${esc(page.labels.tour)}</a></p>`];
  }
  if (/^https?:|^\/\//.test(src)) {
    page.note(`iframe ${src.slice(0, 80)}: a link`);
    return [`<p><a href="${attr(src.replace(/^\/\//, 'https://'))}">${esc(c.getAttribute('title') || c.getAttribute('aria-label') || src)}</a></p>`];
  }
  return [];
}

/**
 * A visible consent overlay (the player behind it is only built after consent, so the snapshot
 * has no iframe): the page's Matterport tour, or the map, as a link.
 */
function blockedPlayer(c, page) {
  const tour = (page.html.match(MATTERPORT) || [])[0];
  if (tour && !page.tourLinked) {
    page.tourLinked = true;
    page.note(`Matterport tour ${tour}: a link (embed block has no Matterport player)`);
    return [`<p><a href="${tour}">${esc(page.labels.tour)}</a></p>`];
  }
  if (/googleMapsOverlayConsent/.test(cls(c))) return mapLink(page);
  return [];
}

function formLink(page) {
  if (page.formLinked) return [];
  page.formLinked = true;
  page.note('form: a link to the page on www');
  return [`<p><a href="${HOST}${page.source}">${esc(page.labels.form)}</a></p>`];
}

function mapLink(page) {
  if (page.mapLinked) return [];
  page.mapLinked = true;
  page.note('Google Maps (station / pharma map): a link to the page on www');
  return [`<p><a href="${HOST}${page.source}">${esc(page.labels.map)}</a></p>`];
}

/** The .mp4 of a video container: { href, large } (the copy in DA or the source file). */
function videoSource(node, page) {
  const v = node.tagName === 'VIDEO' ? node : node.querySelector('video');
  const src = (v && (v.getAttribute('src') || v.querySelector('source[src]')?.getAttribute('src'))) || node.querySelector('source[src]')?.getAttribute('src') || '';
  if (!/\.mp4/i.test(src)) return null;
  const abs = new URL(src.replace(/^\/\//, 'https://'), HOST).href;
  const key = fileKey(abs);
  const f = key ? loadSite().files[key] : null;
  const local = page.file(abs);
  if (f && f.linkSource) page.note(`video ${abs.split('/').pop()} ${f.linkSource}`);
  return { href: local || abs, poster: v && v.getAttribute('poster') };
}

function videoCell(node, page) {
  const s = videoSource(node, page);
  if (!s) return '';
  let poster = '';
  if (s.poster) poster = page.img({ getAttribute: (n) => (n === 'src' ? s.poster : '') });
  if (!poster) { const bgEl = node.querySelector('[style*="background-image"], [data-desktop]'); if (bgEl) poster = page.bg(bgEl); }
  if (!poster) { const i = node.querySelector('img'); if (i) poster = page.img(i); }
  return `${poster ? `<p>${poster}</p>` : ''}<p><a href="${attr(s.href)}">${attr(s.href)}</a> {controls round-play-button}</p>`;
}

function video(node, page) {
  const cell = videoCell(node, page);
  if (cell) page.block('columns-media', [[cell]]);
}

/** The distinct images of a node (carousel clones and thumbnails dropped). */
function images(node, page) {
  const seen = new Set();
  const out = [];
  node.querySelectorAll('img').forEach((i) => {
    let skip = false;
    for (let a = i; a && a !== node; a = a.parentElement) if (isSkipped(a)) skip = true;
    const src = i.getAttribute('src') || '';
    if (skip || seen.has(src.split('?')[0])) return;
    seen.add(src.split('?')[0]);
    const h = page.img(i);
    if (h) out.push(h);
  });
  return out;
}

function carousel(node, page) {
  const imgs = images(node, page);
  if (imgs.length > 1) page.block('carousel-images', imgs.map((i) => [i, '']));
  else if (imgs.length) page.add(`<p>${imgs[0]}</p>`);
}

/* ------------------------------------------------------------------ components --------- */

const keyOf = (n) => {
  for (let a = n; a && a.getAttribute; a = a.parentElement) {
    const m = cls(a).match(/lfr-layout-structure-item-((?:text|image)[a-z0-9-]*-cf\d+)/);
    if (m) return m[1];
  }
  return '';
};

/** Components inside a block cell: a few keep their content shape. */
function cellComponent(c, page) {
  if (hasCls(c, /(^|\s)(videoWrapper|flexi-video|video-container)(\s|$)/)) { const v = videoCell(c, page); return v ? [v] : []; }
  if (/portlet_com_lhcargo_eportal_maps_of_networks/.test(c.id || '') || hasCls(c, /maps_of_networks/)) return mapLink(page);
  if (hasCls(c, /(^|\s)(owl-carousel|flexslider|swiper|gallerySlider)(\s|$)/)) return images(c, page).map((i) => `<p>${i}</p>`);
  return null;
}

/** Top-level components; true when handled. */
function component(c, page) {
  const k = cls(c);
  // structure fragment: a section, grey when the source band is grey
  if (/(^|\s)fullWidthFragmentContainer(\s|$)/.test(k)) {
    page.section(/grey-background/.test(k) ? 'grey' : null);
    flow(c, page, 'top').forEach((h) => page.add(h));
    page.section(null);
    return true;
  }
  if (/(^|\s)pageHeaderSlider(\s|$)/.test(k)) { carousel(c, page); return true; }
  if (/(^|\s)service-widget(\s|$)/.test(k)) { serviceWidget(c, page); return true; }
  if (/(^|\s)(component-tabs|customTabFragment)(\s|$)/.test(k)) { tabs(c, page); return true; }
  if (/(^|\s)image-text-h(\s|$)/.test(k)) { textImage(c, page); return true; }
  if (/(^|\s)Introduction-CF3(\s|$)/.test(k)) { twoColumns(c, page); return true; }
  if (/(^|\s)(cf-12|four-columns|three-columns|two-columns)(\s|$)/.test(k) && c.querySelector(':scope > .row')) { cardRow(c, page); return true; }
  // the company pages' image tiles (.LCAGCP-lcagTile columns): cards-teaser
  if (/(^|\s)row(\s|$)/.test(k) && c.children.length && [...c.children].every((x) => hasCls(x, /LCAGCP-lcagTile/))) { cardRow({ querySelector: () => c }, page); return true; }
  if (/(^|\s)(videoWrapper|flexi-video)(\s|$)/.test(k)) { video(c, page); return true; }
  if (/lfr-layout-structure-item-gallery---cf15/.test(k)) {
    c.querySelectorAll('h1, h2, h3').forEach((h) => { if (!h.closest('.owl-carousel')) page.add(element(h, page, 'cell').join('')); });
    carousel(c, page);
    return true;
  }
  if (/(^|\s)(customAccordion|accordion|nwAccordion|rFleetAccordion)(\s|$)/.test(k) && c.querySelector('.panel, .card')) { accordion(c, page); return true; }
  if (/(^|\s)citation-CF23(\s|$)/.test(k)) { citation(c, page); return true; }
  if (c.querySelector(':scope > .nwAccordion')) { nwAccordion(c, page); return true; }
  if (/(^|\s)rmsFilterRow(\s|$)/.test(k)) { page.note('story filter (script widget): left out'); return true; }
  if (/(^|\s)grid(\s|$)/.test(k) && c.querySelector(':scope > .masonryItem')) { storyGrid(c, page); return true; }
  if (/(^|\s)rHomeSlider(\s|$)/.test(k)) { homeSlider(c, page); return true; }
  if (/(^|\s)latestNewsHome(\s|$)/.test(k)) { latestNews(c, page); return true; }
  if (/(^|\s)infraWrapper(\s|$)/.test(k)) { infra(c, page); return true; }
  if (/(^|\s)ourFleet(\s|$)/.test(k)) { ourFleet(c, page); return true; }
  if (/(^|\s)ourProducts(\s|$)/.test(k)) { ourProducts(c, page); return true; }
  if (/(^|\s)eservicesWrapper(\s|$)/.test(k)) { slideCards(c, page); return true; }
  if (/(^|\s)teaserULD(\s|$)/.test(k)) { teaserOverlay(c, page); return true; }
  if (/(^|\s)aboutWrapper(\s|$)/.test(k)) { about(c, page); return true; }
  if (/(^|\s)LCAGCP-HeaderImageVideo(\s|$)/.test(k)) { headerVideo(c, page); return true; }
  if (/(^|\s)LCAGCP-lcagFactsSlider(\s|$)/.test(k)) {
    const h = text(c.querySelector('.LCAGCP-lcagFactsHeadline'));
    if (h) page.add(`<h2>${esc(h)}</h2>`);
    carousel(c, page);
    return true;
  }
  if (/(^|\s)LCAGCP-lcagEventSlider(\s|$)/.test(k)) { timeline(c, page); return true; }
  if (/(^|\s)LCAGCP-lcagIconLinks(\s|$)/.test(k)) { iconLinks(c, page); return true; }
  if (/(^|\s)content-slider(\s|$)/.test(k)) { carousel(c, page); return true; }
  if (/(^|\s)newssectiondetail(\s|$)/.test(k)) { article(c, page); return true; }
  if (/(^|\s)module--story(\s|$)/.test(k)) { story(c, page); return true; }
  if (/(^|\s)(owl-carousel|flexslider|swiper)(\s|$)/.test(k)) { carousel(c, page); return true; }
  if (/portlet_com_lhcargo_eportal_maps_of_networks/.test(c.id || '')) { mapLink(page).forEach((h) => page.add(h)); return true; }
  if (/portlet_com_lhcargo_eportal_(contact_support|routing)/.test(c.id || '')) { formLink(page).forEach((h) => page.add(h)); return true; }
  if (/portlet_com_liferay_(site_navigation_breadcrumb|login)/.test(c.id || '')) return true;
  return false;
}

function serviceWidget(c, page) {
  const L = page.labels;
  const tiles = [
    [':takeoff:', L.booking, `${HOST}/${page.lang}/ebooking`],
    [':search:', L.track, `${HOST}/${page.lang}/eservices/etracking`],
    [':airplane-cruise:', L.schedule, `${HOST}/${page.lang === 'de' ? 'de/network/flugplan' : 'en/network/schedule-routings'}`],
    [':route-network:', L.stations, `${HOST}/${page.lang}/network/maps/stations`],
  ];
  // the tab labels as on the page
  const labels = [...c.querySelectorAll('.nav-tabs .nav-link span')].map(text);
  page.block('cards-icon', tiles.map(([icon, label, href], i) => [`<p>${icon}</p>`, `<p><a href="${href}">${esc(labels[i] || label)}</a></p>`]));
  page.note('booking / track / schedule / stations widget (portal): cards-icon linking the portal on www');
}

function tabs(c, page) {
  const panes = [...c.querySelectorAll('.tab-pane')].filter((p) => p.closest('.component-tabs, .customTabFragment') === c);
  const items = panes.map((p) => ({ title: text(p.querySelector('.card-header')) || text(c.querySelector(`a[href="#${p.id}"]`)), body: p.querySelector('.card-body') || p }));
  const heavy = items.some(({ body }) => [...body.querySelectorAll('table')].some((t) => t.querySelector('tr') && [...t.querySelector('tr').children].length > 2)
    || body.querySelector('.gallerySlider, .owl-carousel, .swiper, .flexslider, .component-tabs, .lfr-layout-structure-item-gallery---cf15'));
  if (!heavy) {
    page.block('accordion-columns (faq)', items.map(({ title, body }) => [esc(title), flow(body, page, 'cell').join('')]));
    return;
  }
  page.note('tabs with a wide table, gallery or carousel: one section per tab (H2 = tab title)');
  items.forEach(({ title, body }) => {
    page.section(page.current.style);
    page.add(`<h2>${esc(title)}</h2>`);
    flow(body, page, 'top').forEach((h) => page.add(h));
  });
}

function textImage(c, page) {
  const row = c.querySelector('.row') || c;
  const cols = [...row.children].filter((x) => !isSkipped(x));
  const mediaCol = cols.find((x) => x.querySelector('.image-section, .component-image, img, video'));
  const textCol = cols.find((x) => x !== mediaCol) || null;
  const media = mediaCol ? (videoCell(mediaCol, page) || images(mediaCol, page).map((i) => `<p>${i}</p>`).join('')) : '';
  const txt = textCol ? flow(textCol, page, 'cell').join('') : '';
  if (!media) { page.add(txt); return; }
  const key = keyOf(c);
  const imageFirst = /text-right-image-left|right--image-left|image-left/.test(key);
  page.block('columns-media', [imageFirst ? [media, txt] : [txt, media]], 'text-image');
}

function twoColumns(c, page) {
  [...c.children].filter((x) => !hasCls(x, /(^|\s)row(\s|$)/) && !isSkipped(x)).forEach((x) => element(x, page, 'cell').forEach((h) => page.add(h)));
  [...c.children].filter((x) => hasCls(x, /(^|\s)row(\s|$)/)).forEach((row) => {
    const cells = [...row.children].map((col) => flow(col, page, 'cell').join('')).filter((h) => !isEmptyHtml(h));
    if (cells.length > 1) page.block('columns-media', [cells]);
    else if (cells.length) page.add(cells[0]);
  });
}

function cardRow(c, page) {
  const row = c.querySelector(':scope > .row');
  const cols = [...row.children].filter((x) => !isSkipped(x) && text(x) + x.querySelectorAll('img').length);
  const rows = cols.map((col) => {
    const imgs = images(col, page);
    const clone = col.cloneNode(true);
    clone.querySelectorAll('img, picture').forEach((i) => i.remove());
    return [imgs[0] || '', flow(clone, page, 'cell').join('')];
  }).filter((r) => r.some((x) => !isEmptyHtml(x)));
  if (!rows.length) return;
  const n = cols.length;
  const option = n >= 4 ? ' (four-up)' : (n === 3 ? ' (three-up)' : '');
  page.block(`cards-teaser${option}`, rows);
}

function accordion(c, page) {
  const panels = [...c.querySelectorAll('.panel, .card')].filter((p) => p.parentElement === c || p.parentElement?.parentElement === c);
  const rows = panels.map((p) => {
    const head = p.querySelector('.panel-heading, .card-header');
    const body = p.querySelector('.panel-collapse, .collapse, .panel-body, .card-body');
    return [esc(text(head)), body ? flow(body, page, 'cell').join('') : ''];
  }).filter((r) => r[0]);
  if (rows.length) page.block('accordion-columns (faq)', rows);
}

/** Fleet and ULD lists (.nwAccordion): header, image, label | value rows. */
function nwAccordion(c, page) {
  const rows = [...c.querySelectorAll(':scope > .nwAccordion')].map((item) => {
    const title = text(item.querySelector('.nwAccordionHeader'));
    const content = item.querySelector('.nwAccordionContent');
    if (!content) return [esc(title), ''];
    const imgs = images(content, page).map((i) => `<p>${i}</p>`).join('');
    const facts = [...content.querySelectorAll('.accordionRow')].map((r) => `<li><strong>${esc(text(r.querySelector('.accordioneRowLeft')))}</strong>: ${esc(text(r.querySelector('.accordioneRowRight')))}</li>`).join('');
    const clone = content.cloneNode(true);
    clone.querySelectorAll('.nwAccordionImage, .accordionRow, img, picture').forEach((x) => x.remove());
    clone.querySelectorAll('h1, h2, h3, h4').forEach((h) => { if (text(h) === title) h.remove(); });
    return [esc(title), `${imgs}${facts ? `<ul>${facts}</ul>` : ''}${flow(clone, page, 'cell').join('')}`];
  }).filter((r) => r[0]);
  if (rows.length) page.block('accordion-columns (faq)', rows);
}

/** The transport stories' tiles (masonry grid): cards-teaser (three-up). */
function storyGrid(c, page) {
  const rows = [...c.querySelectorAll(':scope > .masonryItem')].map((item) => {
    const imgs = images(item, page);
    const clone = item.cloneNode(true);
    clone.querySelectorAll('img, picture').forEach((x) => x.remove());
    const body = flow(clone, page, 'cell').join('').replace(/<(\/?)h[1-6]>/g, '<$1h3>');
    return [imgs[0] || '', body];
  }).filter((r) => r.some((x) => !isEmptyHtml(x)));
  if (rows.length) page.block('cards-teaser (three-up)', rows);
}

function citation(c, page) {
  const h = c.querySelector(':scope > h2, :scope > h3');
  if (h) page.add(element(h, page, 'cell').join(''));
  const quote = c.querySelector('.fragment-citation');
  const who = [text(c.querySelector(':scope > h4')), text([...c.children].filter((x) => x.tagName === 'DIV' && !x.classList.contains('fragment-citation')).pop())].filter(Boolean).join(', ');
  if (quote) page.add(`<blockquote><p>${tidy(inline(quote, page))}</p>${who ? `<p>${esc(who)}</p>` : ''}</blockquote>`);
}

const slideParts = (s, page) => {
  const head = tidy(inline(s.querySelector('.slideHeadline') || { childNodes: [] }, page)).replace(/<br>/g, ' ').replace(/<\/?strong>/g, '');
  const sub = text(s.querySelector('.slideSubline'));
  const a = s.querySelector('.slideContent a[href]');
  const href = a ? page.href(a.getAttribute('href')) : null;
  return {
    img: page.bg(s.querySelector('.slideBg') || s), head, sub, link: href ? `<a href="${attr(href)}">${esc(text(a))}</a>` : '',
  };
};

function homeSlider(c, page) {
  const slides = [...c.querySelectorAll('.owl-item')].filter((s) => !isSkipped(s)).map((s) => slideParts(s, page)).filter((s) => s.head);
  if (!slides.length) return;
  const [first, ...rest] = slides;
  page.block('hero-campaign', [[first.img], [`<h1>${first.head}</h1>${first.sub ? `<p>${esc(first.sub)}</p>` : ''}${first.link ? `<p><strong>${first.link}</strong></p>` : ''}`]]);
  if (rest.length) {
    page.block('cards-teaser (overlay)', rest.map((s) => [s.img, `<h3>${s.head}</h3>${s.sub ? `<p>${esc(s.sub)}</p>` : ''}${s.link ? `<p>${s.link}</p>` : ''}`]));
    page.note(`home slider: slide 1 hero-campaign, slides 2-${slides.length} cards-teaser (overlay) (lh-com has no stage slider)`);
  }
  page.section(null);
}

function latestNews(c, page) {
  const h = c.querySelector('.latestNewsTitle, h2');
  const a = c.querySelector('a.readAllNews, .readAllWrapper a');
  if (h) page.add(`<h2>${esc(text(h))}</h2>`);
  const href = a ? page.href(a.getAttribute('href')) : null;
  page.add(`<p>${href ? `<a href="${attr(href)}">${esc(text(a))}</a>` : ''}</p>`);
  page.add(`<p><a href="${MYNEWSDESK}">${esc(page.labels.newsroom)}</a></p>`);
  page.note('Mynewsdesk news list: links to the newsroom (not copied)');
}

const statItem = (value, label) => `<li><strong>${esc(value)}</strong> ${esc(label)}</li>`;

function infra(c, page) {
  const inner = c.querySelector('.infraInner');
  const stats = [...c.querySelectorAll('.infraStat')].map((s) => statItem(text(s.querySelector('.infraStatValue')), text(s.querySelector('.infraStatLabel'))));
  const regions = [...c.querySelectorAll('.infraRegion')].map((r) => statItem(text(r.querySelector('.infraRegionValue')), text(r.querySelector('.infraRegionLabel'))));
  // the station network map (an image on www), then the counters
  const map = c.querySelector('img.infraMapImg');
  const mapImg = map ? page.img(map) : '';
  const right = `${mapImg ? `<p>${mapImg}</p>` : ''}${stats.length ? `<ul>${stats.join('')}</ul>` : ''}${regions.length ? `<ul>${regions.join('')}</ul>` : ''}${mapLink(page).join('')}`;
  page.block('columns-media', [[inner ? flow(inner, page, 'cell').join('') : '', right]]);
}

function ourFleet(c, page) {
  const content = c.querySelector('.content');
  if (content) flow(content, page, 'cell').forEach((h) => page.add(h));
  const cards = [...c.querySelectorAll('.lcagCard')].map((card) => {
    const a = card.querySelector('a[href]');
    const href = a ? page.href(a.getAttribute('href')) : null;
    const i = card.querySelector('img');
    // www's tile: the figure large ("18"), the type under it ("Boeing 777F"): the overlay card's
    // heading and its link text
    const figure = text(card.querySelector('.overlay h2'));
    const label = text(card.querySelector('.overlay p')) || figure;
    return [i ? page.img(i) : '', `<h3>${esc(figure || label)}</h3>${href ? `<p><a href="${attr(href)}">${esc(label)}</a></p>` : ''}`];
  });
  if (cards.length) page.block('cards-teaser (overlay)', cards);
}

function ourProducts(c, page) {
  const box = c.querySelector('.whiteBgBox') || c;
  [...box.children].filter((x) => /^(H2|A|P)$/.test(x.tagName)).forEach((x) => page.add(element(x, page, 'cell').join('') || (x.tagName === 'A' ? `<p>${inline({ childNodes: [x] }, page)}</p>` : '')));
  const rows = [...box.querySelectorAll('.productBlock, .speedBlock, .aosBlock')].map((b) => {
    const info = b.querySelector('.info');
    const links = [...b.querySelectorAll('.features a[href]')].map((a) => {
      const href = page.href(a.getAttribute('href'));
      const label = text(a.querySelector('small')) || text(a);
      return href ? `<li><a href="${attr(href)}">${esc(label)}</a></li>` : `<li>${esc(label)}</li>`;
    });
    return [info ? flow(info, page, 'cell').join('') : '', links.length ? `<ul>${links.join('')}</ul>` : ''];
  });
  if (rows.length) page.block('columns-media', rows);
}

function slideCards(c, page) {
  const h = c.querySelector('.slideTitle, h2');
  if (h) page.add(`<h2>${esc(text(h))}</h2>`);
  const rows = [...c.querySelectorAll('.owl-item')].filter((s) => !isSkipped(s)).map((s) => {
    const i = s.querySelector('img');
    const body = s.querySelector('.slide-content') || s;
    return [i ? page.img(i) : '', flow(body, page, 'cell').join('')];
  });
  if (rows.length) page.block('carousel-cards', rows);
}

function teaserOverlay(c, page) {
  const i = c.querySelector('img');
  const o = c.querySelector('.overlay') || c;
  const eyebrow = text(o.querySelector('.subtitle'));
  const clone = o.cloneNode(true);
  clone.querySelectorAll('.subtitle').forEach((x) => x.remove());
  page.block('hero-card-overlay', [[i ? page.img(i) : ''], [`${eyebrow ? `<p>${esc(eyebrow)}</p>` : ''}${flow(clone, page, 'cell').join('')}`]]);
}

function about(c, page) {
  const head = c.querySelector('.aboutHeroHeader');
  const facts = c.querySelector('.keyFacts');
  const items = facts ? [...facts.querySelectorAll('.keyFactsItem')].map((li) => statItem(text(li.querySelector('.keyFactsValue')), text(li.querySelector('.keyFactsLabel')))) : [];
  const more = facts && facts.querySelector(':scope > a[href]');
  const moreHref = more ? page.href(more.getAttribute('href')) : null;
  const right = facts ? `<h3>${esc(text(facts.querySelector('.keyFactsTitle')))}</h3><ul>${items.join('')}</ul>${moreHref ? `<p><a href="${attr(moreHref)}">${esc(text(more))}</a></p>` : ''}` : '';
  const clone = c.cloneNode(true);
  clone.querySelectorAll('.aboutHeroHeader, .keyFacts').forEach((x) => x.remove());
  page.block('columns-media', [[head ? flow(head, page, 'cell').join('') : '', right]]);
  flow(clone, page, 'cell').forEach((h) => page.add(h));
}

function headerVideo(c, page) {
  const s = videoSource(c, page);
  const i = c.querySelector('img');
  const head = text(c.querySelector('.LCAGCP-headerImageHeadline'));
  const sub = text(c.querySelector('.LCAGCP-headerImageSubline'));
  const a = c.querySelector('.LCAGCP-headerImageLink a[href]');
  const href = a ? page.href(a.getAttribute('href')) : null;
  const media = `${i ? page.img(i) : ''}${s ? `<p><a href="${attr(s.href)}">${attr(s.href)}</a></p>` : ''}`;
  const body = `<h1>${esc(head)}</h1>${sub ? `<p>${esc(sub)}</p>` : ''}${href ? `<p><a href="${attr(href)}">${esc(text(a))}</a></p>` : ''}`;
  if (media) page.block('hero-campaign (narrow)', [[media], [body]]);
  else page.add(body);
  page.section(null);
}

function timeline(c, page) {
  const rows = [...c.querySelectorAll('.LCAGCP-lcagEventText')].map((e) => {
    const year = text(e.querySelector('h1'));
    const clone = e.cloneNode(true);
    clone.querySelectorAll('h1').forEach((x) => x.remove());
    return ['', `${year ? `<p>${esc(year)}</p>` : ''}${flow(clone, page, 'cell').join('')}`];
  });
  if (rows.length) page.block('carousel-cards', rows);
}

function iconLinks(c, page) {
  const items = [...c.querySelectorAll('.LCAGCP-iconLinkItem')].map((x) => statItem(text(x.querySelector('.LCAGCP-iconLinkItemHeadline')), text(x.querySelector('.LCAGCP-iconLinkSubline'))));
  if (items.length) page.add(`<ul>${items.join('')}</ul>`);
}

function article(c, page) {
  const clone = c.cloneNode(true);
  const h = clone.querySelector('h2.header, h1');
  if (h) { page.add(`<h1>${tidy(inline(h, page))}</h1>`); h.remove(); }
  flow(clone, page, 'top').forEach((x) => page.add(x));
}

function story(c, page) {
  const i = c.querySelector('.story-imageWrap img');
  if (i) page.add(`<p>${page.img(i)}</p>`);
  const clone = (c.querySelector('.story-textWrap') || c).cloneNode(true);
  const h = clone.querySelector('.story-headline, h1, h2');
  if (h) { page.add(`<h1>${tidy(inline(h, page))}</h1>`); h.remove(); }
  flow(clone, page, 'top').forEach((x) => page.add(x));
}

/* ------------------------------------------------------------------ the document ------- */

function cellHtml(c) {
  return `<div>${c}</div>`;
}

function blockHtml(item) {
  const m = item.block.match(/^([a-z0-9-]+)(?: \(([^)]+)\))?$/);
  const classes = [m[1], ...(m[2] ? m[2].split(/,\s*/).map((o) => o.trim().replace(/\s+/g, '-')) : [])].join(' ');
  return `<div class="${classes}">${item.rows.map((r) => `<div>${r.map(cellHtml).join('')}</div>`).join('')}</div>`;
}

/**
 * The page's metadata: title, description, image, and its language's nav, footer and language
 * (Cargo's /en/ and /de/ paths are no lh-com locale roots, so the header and footer would look
 * for /de/de/nav; lh-cargo's /metadata sheet is not ours to change).
 */
function metadata(document, page) {
  const title = text(document.querySelector('title'));
  const desc = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  const og = document.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
  const rows = [['Title', esc(title)]];
  if (desc.trim()) rows.push(['Description', esc(desc.trim())]);
  const image = og ? page.file(og) : null;
  if (image) rows.push(['Image', `<picture><img src="${attr(image)}" alt=""></picture>`]);
  rows.push(['Nav', `/${page.lang}/nav`], ['Footer', `/${page.lang}/footer`], ['Language', page.lang]);
  return rows;
}

/** Converts one snapshot to the document's HTML; returns { html, report }. */
export function convert(html, source, lang) {
  const { document } = parseHTML(html);
  const page = new Page(source, lang, html);
  // #content: the layout (#main-content) and, on the homepage, the tile rows next to it
  const content = document.querySelector('#content.pagebody') || document.querySelector('#main-content') || document.querySelector('#content');
  if (!content) throw new Error(`${source}: no #main-content`);
  flow(content, page, 'top').forEach((h) => page.add(h));
  // exactly one H1: the first heading when the page has none
  let docs = page.sections.filter((s) => s.items.length);
  const all = () => docs.flatMap((s) => s.items);
  if (!all().some((i) => (i.html || '').includes('<h1') || (i.rows || []).some((r) => r.some((x) => x.includes('<h1'))))) {
    const first = all().find((i) => /^<h[2-6]>/.test(i.html || ''));
    if (first) first.html = first.html.replace(/^<h[2-6]>(.*)<\/h[2-6]>$/, '<h1>$1</h1>');
    else {
      const t = text(document.querySelector('title')).replace(/\s*[-|]\s*Lufthansa Cargo\s*$/i, '');
      docs = docs.length ? docs : [{ style: null, items: [] }];
      docs[0].items.unshift({ html: `<h1>${esc(t)}</h1>` });
      page.note('no heading on the page: H1 from the title');
    }
  }
  const meta = metadata(document, page);
  const out = docs.map((s, i) => {
    const body = s.items.map((it) => (it.block ? blockHtml(it) : it.html)).join('');
    const sm = s.style ? blockHtml({ block: 'section-metadata', rows: [['Style', s.style]] }) : '';
    const md = i === docs.length - 1 ? blockHtml({ block: 'metadata', rows: meta }) : '';
    return `<div>${body}${sm}${md}</div>`;
  });
  if (!docs.length) out.push(`<div>${blockHtml({ block: 'metadata', rows: meta })}</div>`);
  // one H1: www's stories and tables use h1 for their own titles; those after the first are H2
  let h1s = 0;
  const doc = out.join('\n').replace(/<(\/?)h1>/g, (m, close) => {
    if (!close) h1s += 1;
    return h1s > 1 ? `<${close}h2>` : m;
  });
  if (h1s > 1) page.note(`${h1s - 1} more H1 on www: H2`);
  return {
    html: `${doc}\n`,
    report: {
      blocks: page.blocks, notes: page.notes, missing: [...page.missing], linkedOut: [...page.linkedOut].sort(),
    },
  };
}

/* ------------------------------------------------------------------ CLI ---------------- */

/** The downloaded SVG images as PNGs next to them in the cache. */
export async function prepareImages() {
  const { files, state } = loadSite();
  const sharp = (await import('sharp')).default;
  let made = 0;
  for (const [key, f] of Object.entries(files)) {
    const d = state.done[key];
    if (f.kind !== 'image' || !d || d.status !== 200 || !/svg/.test(d.type || '')) continue;
    const src = path.join(W, 'assets/cache', sha1(key));
    const out = `${src}.png`;
    if (fs.existsSync(out) || !fs.existsSync(src)) continue;
    try {
      // eslint-disable-next-line no-await-in-loop
      await sharp(fs.readFileSync(src), { density: 192 }).png().toFile(out);
      made += 1;
    } catch (e) { console.error(`${key}: ${e.message}`); }
  }
  return made;
}

async function main() {
  const argv = process.argv.slice(2);
  const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
  const listFile = opt('list');
  if (!listFile) { console.log('usage: --list <batch file> [--name batch-1] [--dry-run]'); process.exit(1); }
  const name = opt('name') || path.basename(listFile, '.txt').replace(/^batch-0*/, 'batch-');
  const urls = fs.readFileSync(path.resolve(root, listFile), 'utf8').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const { paths } = loadSite();
  const svgs = await prepareImages();
  if (svgs) console.log(`${svgs} SVG images as PNG`);
  const report = {};
  const written = [];
  urls.forEach((url) => {
    const source = sourcePath(url);
    const eds = paths[source];
    if (!eds) { report[source] = { skipped: REDIRECT_ONLY[source] ? `redirect to ${REDIRECT_ONLY[source]}` : 'not a page in scope' }; return; }
    const snap = path.join(SNAP, `${source}.html`);
    if (!fs.existsSync(snap)) { report[source] = { eds, skipped: 'no snapshot' }; return; }
    const lang = source.slice(1, 3);
    const { html, report: r } = convert(fs.readFileSync(snap, 'utf8'), source, lang);
    report[source] = { eds, ...r };
    if (!argv.includes('--dry-run')) {
      const out = path.join(OUT, `${eds}.plain.html`);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, html);
    }
    written.push(eds);
  });
  if (!argv.includes('--dry-run')) {
    fs.mkdirSync(path.join(W, 'runs'), { recursive: true });
    fs.writeFileSync(path.join(W, 'runs', `${name}-import.json`), `${JSON.stringify(report, null, 1)}\n`);
    fs.writeFileSync(path.join(W, 'runs', `${name}-paths.txt`), `${written.join('\n')}\n`);
    // the allowlist of da-upload.mjs --site lh-cargo: the documents, the nav and footer of each language
    const listPath = path.join(root, 'tools/importer/sites/lh-cargo.json');
    const allow = readJson(listPath, {
      site: 'moved-permanently/lh-cargo',
      source: 'www.lufthansa-cargo.com (Lufthansa Cargo: en and de pages, nav and footer; plan content-sites/lh-cargo/plan.md)',
      paths: [],
      patterns: ['^/(en|de)/(nav|footer)$'],
    });
    allow.paths = [...new Set([...allow.paths, ...written])].sort();
    fs.writeFileSync(listPath, `${JSON.stringify(allow, null, 1)}\n`);
  }
  const missing = new Set(Object.values(report).flatMap((r) => r.missing || []));
  const blocks = {};
  Object.values(report).forEach((r) => Object.entries(r.blocks || {}).forEach(([b, n]) => { blocks[b] = (blocks[b] || 0) + n; }));
  console.log(`${name}: ${written.length} documents, ${Object.values(report).filter((r) => r.skipped).length} skipped, ${missing.size} files not downloaded yet`);
  console.log('blocks:', JSON.stringify(blocks));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
