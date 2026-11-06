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
 * (slider), its slides; the booking/track/schedule/stations widget in the stage's section, over its
 * foot: cards-icon (widget) linking the portal on www and the Track tab's form; Mynewsdesk news:
 * news-feed reading www's pressroom list; the bands (brief 425): station map with counters
 * columns-media (band, gradient, stats, icons), products columns-media (band, dark, features,
 * icons) (icons: www's sprites, brief 429), about columns-media (band, dark, facts), each with its
 * heading inside; fleet tiles: cards-teaser
 * (overlay, fleet); eServices slider: carousel-cards (slides); ULD teaser: hero-card-overlay
 * (plain), brief 430), the company pages (video header:
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
 *          [--known-from <dir of DA copies>] (no asset map here: the files lh-cargo's DA has, knownCopy)
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import {
  HOST, sourcePath, edsPath, REDIRECT_ONLY, LANGUAGE_LESS, ADDED_PAGES, CONTACT_FORM, contactForm, contactFormHref, contactDialog,
} from './cargo-paths.mjs';
import { fileKey, edsName, baseName } from './cargo-assets.mjs';

const sha1 = (s) => crypto.createHash('sha1').update(s).digest('hex');

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const W = path.join(root, 'content-sites/lh-cargo');
const SNAP = path.join(W, 'delivery/snapshots/www.lufthansa-cargo.com');
const CAPTURED = path.join(W, 'snapshots/www.lufthansa-cargo.com');
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

/**
 * The files lh-cargo's DA has (brief 417): the upload state's media (da-upload.mjs) and the
 * pictures and links of DA documents (full documents or .plain.html: their content.da.live URLs
 * as paths), for a re-import on a machine without the asset map.
 * @param {{media?: Object}} state tools/importer/da-upload-state-lh-cargo.json
 * @param {string[]} docs the documents' HTML
 */
export function knownPaths(state, docs = []) {
  const known = new Set(Object.keys((state && state.media) || {}).filter((p) => /^\/(media-da|documents)\//.test(p)));
  docs.forEach((html) => {
    [...html.matchAll(/(?:src|href)="(?:https:\/\/content\.da\.live\/moved-permanently\/lh-cargo)?(\/(?:media-da|documents)\/[^"?#]+)/g)].forEach((m) => known.add(m[1]));
  });
  return known;
}

/**
 * Without the asset map (content-sites/lh-cargo/assets/files.json): the copy of a www file that
 * lh-cargo's DA already has, by cargo-assets.mjs's name (edsName: a picture
 * /media-da/cargo/<name>-<sha1 8>.<ext>, a document or video /documents/<name>-<sha1 6>.<ext>),
 * whatever its extension; else null.
 */
export function knownCopy(key, known) {
  const sha = sha1(key);
  const name = baseName(key);
  const stems = [`/media-da/cargo/${name}-${sha.slice(0, 8)}.`, `/documents/${name}-${sha.slice(0, 6)}.`];
  return [...known].find((p) => stems.some((stem) => p.startsWith(stem))) || null;
}

// the --known-from documents (main): DA copies of the pages to import
let knownDocs = [];

let site;

/** The DA copies whose files a run without the asset map may use (knownCopy; cargo-nav.mjs too). */
export function useKnownDocs(docs) {
  knownDocs = docs;
  site = null;
}
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
  // the added pages and their counterparts, both ways (cargo-paths.mjs ADDED_PAGES)
  Object.entries(ADDED_PAGES).forEach(([p, { alternate }]) => {
    alternates[p] = alternate;
    alternates[alternate] = alternates[alternate] || p;
  });
  const capture = readJson(path.join(W, 'capture-state.json'), {});
  // no asset map here: the files lh-cargo's DA has (knownCopy)
  const known = Object.keys(files).length ? null
    : knownPaths(readJson(path.join(root, 'tools/importer/da-upload-state-lh-cargo.json'), {}), knownDocs);
  site = {
    paths, files, state, alternates, capture, known,
  };
  return site;
}

/* ------------------------------------------------------------------ helpers ------------ */

const webGuest = (p) => p.replace(/^(\/[a-z]{2})?\/web\/guest(?=\/)/, '$1');

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
  if (/(^|\s)(videoOverlayConsent|googleMapsOverlayConsent|consentText|portlet-header|portlet-title-text|owl-nav|owl-dots|swiper-pagination|swiper-button-(prev|next)|flex-control-nav|flex-direction-nav|carousel-indicators|tab-indicator|scrollArrowWrapper|LCAGCP-ScrollButtonContainer|eportalBreadcrumb|diariesBackLinkContainer|story-scrollLink|sr-only|visually-hidden|hide|d-sm-none|d-md-none|d-lg-none|visible-xs|visible-sm)(\s|$)/.test(c)) return true;
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
    const { paths, alternates, capture } = loadSite();
    // Liferay's default site prefix (/en/web/guest/x) is the same page as /en/x
    const p = webGuest(sourcePath(u.href));
    // our contact form pages and dialogs (no page on www; supportTopics links its entries to the
    // dialogs)
    if ([CONTACT_FORM, contactForm('de'), contactDialog()].includes(p)) return `${p}${u.search}`;
    // www's contact form links: /support-and-contact?reason=&subreason= opens the form with both,
    // on the form page of the link's language (a language-less link: this page's)
    const q = u.searchParams;
    const support = p.match(/^(?:\/([a-z]{2}))?\/support-and-contact$/);
    if (support && q.get('reason') && q.get('subreason')) return contactFormHref(q.get('reason'), q.get('subreason'), support[1] || this.lang);
    const local = (sp) => {
      // a page in scope that answers 404 on www stays a link to www
      if (capture[sp] && capture[sp].status === 'not-found') return null;
      if (paths[sp]) return paths[sp];
      if (ADDED_PAGES[sp]) return sp;
      if (REDIRECT_ONLY[sp]) return REDIRECT_ONLY[sp];
      return null;
    };
    let target = local(p);
    // www's shortcut addresses (/products-general-cargo), resolved once (cargo-capture.mjs
    // --resolve): the page they land on, in the language of the linking page;
    // a shortcut that asks for sign-in stays a link to www
    const resolved = capture[p];
    if (!target && resolved && resolved.status === 'resolved' && resolved.finalPath && !/LoginPortlet/.test(resolved.finalUrl || '')) {
      const fp = webGuest(resolved.finalPath);
      // www answers in the session's language: the page in this page's language (its counterpart)
      target = fp.startsWith(`/${this.lang}/`) ? local(fp) : (alternates[fp] && local(alternates[fp])) || local(fp);
    }
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
    const { files, state, known } = loadSite();
    if (known) {
      const copy = knownCopy(key, known);
      if (!copy) this.missing.add(key);
      return copy;
    }
    const f = files[key];
    if (!f || !f.eds) return null;
    const d = state.done[key];
    if (!d || d.status !== 200) { this.missing.add(key); return null; }
    if (f.kind !== 'image') return f.eds;
    // images: in the document tree, where da-upload.mjs finds them (named by their real type;
    // SVGs as the PNGs prepareImages made, as lh-com's documents hold raster images only)
    // the type cargo-assets.mjs settled (read from the file when www's was odd), else www's
    const type = /^image\//.test(f.type || '') ? f.type : d.type;
    const svg = /svg/.test(type || '');
    const cached = path.join(W, 'assets/cache', `${sha1(key)}${svg ? '.png' : ''}`);
    if (svg && !fs.existsSync(cached)) { this.missing.add(key); return null; }
    const eds = edsName(key, 'image', svg ? 'image/png' : type);
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
    // the newsletter's Dynamics 365 form (/en/ci/newsletter, /de/ci/newsletter): newsletter-form
    if (c.getAttribute('data-form-id') && c.getAttribute('data-cached-form-url')) { flush(); out.push(...dynamicsForm(c, page, mode)); return; }
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
    // on the page's top level a component adds its block at once: what came before it goes on
    // the page first, so a heading stays above its cards (brief 417: www's "Our fleet in detail");
    // every 'top' caller adds the rest in order
    if (mode === 'top') out.splice(0).filter(Boolean).forEach((h) => page.add(h));
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
  if (t === 'IFRAME') return iframe(c, page, mode);
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
  // a transport story's layout table (rmsDiariesTable, one row of text cells): www's two text
  // columns, as cf3's (brief 417)
  if (hasCls(table, /(^|\s)rmsDiariesTable(\s|$)/) && rows.length === 1 && rows[0].length > 1 && !rows[0].some((x) => x.th)) {
    page.block('columns-media', [rows[0].map((x) => x.html)]);
    return;
  }
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

function iframe(c, page, mode) {
  const src = c.getAttribute('src') || c.getAttribute('data-src') || '';
  if (/mynewsdesk\.com/.test(src)) {
    // the page's own newsroom (www: the English lufthansa-cargo-ag-com, the German
    // lufthansa-cargo-ag); on the page's top level the newsroom block (blocks/newsroom, behind
    // the site flag newsroom, brief 422) with the link as its fallback, in a cell the link
    let host = '';
    try { host = new URL(src.replace(/^\/\//, 'https://')).hostname; } catch (e) { /* the default */ }
    const url = /^[a-z0-9-]+\.mynewsdesk\.com$/.test(host) ? `https://${host}` : MYNEWSDESK;
    const link = `<p><a href="${attr(url)}">${esc(page.labels.newsroom)}</a></p>`;
    if (mode === 'top') {
      page.note(`Mynewsdesk newsroom iframe: the newsroom block (${url}), its link as the fallback`);
      page.block('newsroom', [['Newsroom', `<a href="${attr(url)}">${esc(url)}</a>`], [link]]);
      return [];
    }
    page.note('Mynewsdesk newsroom iframe: a link to the newsroom on Mynewsdesk');
    return [link];
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

/**
 * www's Dynamics 365 marketing form (its div's data-form-id, data-form-api-url,
 * data-cached-form-url): the newsletter-form block (rows Form ID, Form API URL, Cached Form URL,
 * then the link to the form on www, all the page shows while the site flag newsletter-form is
 * off); in a cell the link.
 */
function dynamicsForm(c, page, mode) {
  if (mode !== 'top') return formLink(page);
  page.formLinked = true;
  page.blocks['newsletter-form'] = (page.blocks['newsletter-form'] || 0) + 1;
  page.note('newsletter: the Dynamics form as newsletter-form (flag newsletter-form; the link to www while off)');
  // in the flow's order (where www has the form), not before the text around it
  return [blockHtml({
    block: 'newsletter-form',
    rows: [
      ['Form ID', esc(c.getAttribute('data-form-id'))],
      ['Form API URL', esc(c.getAttribute('data-form-api-url') || '')],
      ['Cached Form URL', esc(c.getAttribute('data-cached-form-url'))],
      [`<p><a href="${HOST}${page.source}">${esc(page.labels.form)}</a></p>`],
    ],
  })];
}

/**
 * Support & Contact's contact portlet: www's "Contact us" card (heading, text, the "Open contact
 * form" button that opens its form) with the button as a link to the form's dialog (round 3: as
 * www, the form opens over the page; cargo-contact-form.mjs writes it, and the form page).
 */
function contactCard(c, page) {
  page.formLinked = true;
  const card = c.querySelector('.contactSupportWrapper .contactBox');
  if (!card) return;
  const h = text(card.querySelector('h1, h2, h3, h4'));
  const p = text(card.querySelector('p'));
  const label = text(card.querySelector('.contactBtn .lfr-btn-label, .contactBtn, button'));
  // www's navy band: a section of its own (style contact, round 3)
  page.section('contact');
  if (h) page.add(`<h2>${esc(h)}</h2>`);
  if (p) page.add(`<p>${esc(p)}</p>`);
  if (label) page.add(`<p><strong><a href="${contactDialog()}">${esc(label)}</a></strong></p>`);
  // www's photo beside the card (under it on phones; brief 439)
  const photo = c.querySelector('.contactSupportWrapper .imageBox img');
  const pic = photo ? page.img(photo) : '';
  if (pic) page.add(`<p>${pic}</p>`);
  page.section(null);
  page.note(`contact form: www's card, its button opening ${contactDialog()} as a dialog (cargo-contact-us)`);
}

/**
 * Support & Contact's station search portlet (row 21, round 3): its technical support (text, the
 * phone as a tel: link, the opening hours) beside "Find your local sales contact", whose station
 * search stays a link to www's station finder (decided: portal function), as columns.
 */
function techSupport(c, page) {
  const t = c.querySelector('.techSupport');
  const left = t ? [...t.children].map((x) => {
    if (/^H\d$/.test(x.tagName)) return `<h3>${esc(text(x))}</h3>`;
    const a = x.querySelector('a[href^="callto:"], a[href^="tel:"]');
    if (a) return `<p><a href="tel:${a.getAttribute('href').replace(/^(callto|tel):/, '').replace('(0)', '').replace(/[^+\d]/g, '')}">${esc(text(a))}</a></p>`;
    if (x.tagName === 'SMALL') {
      const lines = [''];
      x.childNodes.forEach((n) => { if (n.tagName === 'BR') lines.push(''); else lines[lines.length - 1] += n.textContent; });
      return `<p><small>${lines.map((l) => esc(l.replace(/\s+/g, ' ').trim())).filter(Boolean).join('<br>')}</small></p>`;
    }
    return text(x) ? `<p>${esc(text(x))}</p>` : '';
  }).join('') : '';
  const sales = c.querySelector('.stationSearch');
  const salesHead = sales ? text(sales.querySelector('h1, h2, h3, h4')) : '';
  const salesLabel = sales ? text(sales.querySelector('label')) : '';
  const right = salesHead ? `<h3>${esc(salesHead)}</h3><p><a href="${HOST}/${page.lang}/network/maps/stations">${esc(salesLabel || salesHead)}</a></p>` : '';
  page.block('columns (support)', [[left, right]]);
  page.note('support: www\'s technical support beside the local sales contact (columns; the station search a link to www\'s station finder)');
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
  if (hasCls(c, /(^|\s)(owl-carousel|flexslider|swiper|gallerySlider)(\s|$)/) && isImageSlider(c)) return images(c, page).map((i) => `<p>${i}</p>`);
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
  // text and picture side by side (cf5-cf8; CF7, text one third: www's class has no image-text-h)
  if (/(^|\s)(image-text-h|Text-Image-horizontal-CF[5-8])(\s|$)/.test(k)) { textImage(c, page); return true; }
  if (/(^|\s)Introduction-CF3(\s|$)/.test(k)) { twoColumns(c, page); return true; }
  if (/(^|\s)(cf-12|four-columns|three-columns|two-columns)(\s|$)/.test(k) && c.querySelector(':scope > .row')) { cardRow(c, page); return true; }
  // the company pages' image tiles (.LCAGCP-lcagTile columns): cards-teaser (overlay, mosaic),
  // their text over the picture, edge to edge (What's up now?, brief 422)
  if (/(^|\s)row(\s|$)/.test(k) && c.children.length && [...c.children].every((x) => hasCls(x, /LCAGCP-lcagTile/))) { cardRow({ querySelector: () => c }, page, ['overlay', 'mosaic']); return true; }
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
    // a section of its own (style key-facts, brief 439): the slider's photo and the phone
    // slider's (its sibling, www's phone copy, otherwise left out), which Cargo's theme draws
    // behind the heading and the slides
    page.section('key-facts');
    const bgs = [c.querySelector('.parallax-bg'), c.parentElement?.querySelector(':scope > .LCAGCP-lcagMobileFactsSlider')]
      .map((n) => (n ? page.bg(n) : '')).filter(Boolean);
    bgs.forEach((b) => page.add(`<p>${b}</p>`));
    const h = text(c.querySelector('.LCAGCP-lcagFactsHeadline'));
    if (h) page.add(`<h2>${esc(h)}</h2>`);
    carousel(c, page);
    // www's phone slides (its phone copy, brief 442): carousel-cards (facts), which Cargo's theme
    // shows below 768 px instead of the desktop slides; an icon only when lh-cargo's DA has it.
    // Then the slider's "Facts & Figures" link (www's at the band's foot)
    const mobile = c.parentElement?.querySelector(':scope > .LCAGCP-lcagMobileFactsSlider');
    const slides = mobile ? [...mobile.querySelectorAll('.LCAGCP-mobileSlide:not(.slick-cloned)')] : [];
    const rows = slides.map((s) => {
      const icon = s.querySelector('img.LCAGCP-factIcon');
      const src = icon && icon.getAttribute('src');
      let pic = '';
      if (src) {
        const copy = page.file(src);
        if (copy) pic = `<picture><img src="${attr(copy)}" alt=""></picture>`;
        else page.missing.delete(fileKey(src));
      }
      const lines = [...s.querySelectorAll('.LCAGCP-mobileFactsText > *')].map((x) => {
        const t = inline(x, page).trim();
        if (!t) return '';
        return /^H\d$/.test(x.tagName) ? `<p><strong>${t}</strong></p>` : `<p>${t}</p>`;
      }).join('');
      return [pic, lines];
    }).filter((r) => r[1]);
    if (rows.length) page.block('carousel-cards (facts)', rows);
    const more = (mobile || c).querySelector('.LCAGCP-lcagFactsLink a[href]') || c.querySelector('.LCAGCP-lcagFactsLink a[href]');
    const moreHref = more ? page.href(more.getAttribute('href')) : null;
    if (moreHref && text(more)) page.add(`<p><a href="${attr(moreHref)}">${esc(text(more))}</a></p>`);
    page.section(null);
    return true;
  }
  if (/(^|\s)LCAGCP-lcagEventSlider(\s|$)/.test(k)) { timeline(c, page); return true; }
  if (/(^|\s)LCAGCP-lcagImageList(\s|$)/.test(k)) { imageList(c, page); return true; }
  if (/(^|\s)LCAGCP-lcagIconLinks(\s|$)/.test(k)) { iconLinks(c, page); return true; }
  if (/(^|\s)content-slider(\s|$)/.test(k)) { carousel(c, page); return true; }
  if (/(^|\s)newssectiondetail(\s|$)/.test(k)) { article(c, page); return true; }
  if (/(^|\s)portlet-breadcrumb(\s|$)/.test(k)) { breadcrumb(c, page); return true; }
  if (/(^|\s)module--story(\s|$)/.test(k)) { story(c, page); return true; }
  if (/(^|\s)LhcIconCollapsible(\s|$)/.test(k)) { iconCollapsible(c, page); return true; }
  if (/(^|\s)LHCTabs(\s|$)/.test(k)) { lhcTabs(c, page); return true; }
  if (/(^|\s)(owl-carousel|flexslider|swiper)(\s|$)/.test(k) && isImageSlider(c)) { carousel(c, page); return true; }
  if (/portlet_com_lhcargo_eportal_maps_of_networks/.test(c.id || '')) { mapLink(page).forEach((h) => page.add(h)); return true; }
  if (/portlet_com_lhcargo_eportal_contact_support_web/.test(c.id || '')) { contactCard(c, page); return true; }
  if (/portlet_com_lhcargo_eportal_contact_support_station_search/.test(c.id || '') && c.querySelector('.techSupport')) { techSupport(c, page); return true; }
  if (/portlet_com_lhcargo_eportal_contact_support_(topic|station)_search/.test(c.id || '')) {
    // the topic search's page heading (Support & Contact's H1); its search and the station
    // search need www (the topics are the tabs, the stations the topics' station link)
    const h1 = c.querySelector('.rHeaderBlock h1');
    if (h1) page.add(`<h1>${esc(text(h1))}</h1>`);
    page.formLinked = true;
    return true;
  }
  if (/portlet_com_lhcargo_eportal_(contact_support|routing)/.test(c.id || '')) {
    const h1 = c.querySelector('.rHeaderBlock h1');
    if (h1) page.add(`<h1>${esc(text(h1))}</h1>`);
    formLink(page).forEach((h) => page.add(h));
    return true;
  }
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
  page.block('cards-icon (widget)', tiles.map(([icon, label, href], i) => [`<p>${icon}</p>`, `<p><a href="${href}">${esc(labels[i] || label)}</a></p>`]));
  page.note('booking / track / schedule / stations widget (portal): cards-icon linking the portal on www');
  // the Track tab's form (eTracking: prefix and serial of the air waybill): booking-lookup
  // (tracking), its texts as www's form has them; the tab named as www's own link to eTracking
  const form = c.querySelector('form[name="etrk-tracking-form"]');
  if (!form) { page.section(null); return; }
  const doc = c.ownerDocument;
  // (the footer's "Frequently used" link: "Track your shipment", "Shipment tracken")
  const tab = text(doc.querySelector(`.footerLinkSection a[href="/${page.lang}/eservices/etracking"]`));
  const rows = [];
  if (tab) rows.push(['Tab', tab]);
  const prefix = form.querySelector('#etrk_awbp');
  if (prefix && prefix.getAttribute('aria-label')) rows.push(['Prefix label', prefix.getAttribute('aria-label')]);
  // www prefills the prefix (Lufthansa Cargo's 020)
  if (prefix && /^\d{3}$/.test(prefix.getAttribute('value') || '')) rows.push(['Default prefix', prefix.getAttribute('value')]);
  const serialLabel = text(form.querySelector('label.control-label'));
  if (serialLabel) rows.push(['Serial label', serialLabel]);
  const prefixError = text(form.querySelector('#awbPrefixError'));
  if (prefixError) rows.push(['Prefix error', prefixError]);
  const serialError = text(form.querySelector('#awbNumError'));
  if (serialError) rows.push(['Serial error', serialError]);
  const submit = text(form.querySelector('#etrk_awbsearch'));
  if (submit) rows.push(['Submit label', submit]);
  page.block('booking-lookup (tracking)', rows.map(([k, v]) => [k, esc(v)]));
  page.note('shipment tracking form: booking-lookup (tracking), the air waybill handed to eTracking on www');
  page.section(null);
}

function tabs(c, page) {
  const panes = [...c.querySelectorAll('.tab-pane')].filter((p) => p.closest('.component-tabs, .customTabFragment') === c);
  const items = panes.map((p) => ({ title: text(p.querySelector('.card-header')) || text(c.querySelector(`a[href="#${p.id}"]`)), body: p.querySelector('.card-body') || p }));
  const heavy = items.some(({ body }) => [...body.querySelectorAll('table')].some((t) => t.querySelector('tr') && [...t.querySelector('tr').children].length > 2)
    || body.querySelector('.gallerySlider, .owl-carousel, .swiper, .flexslider, .component-tabs, .lfr-layout-structure-item-gallery---cf15'));
  if (!heavy) {
    const rows = items.map(({ title, body }) => [esc(title), flow(body, page, 'cell').join('')]);
    // Support & Contact's topics: www's tabs with its topic search over them, the accordion's
    // filter (once; with tabs a finder over them, round 3)
    const filter = page.topicFilter && !page.topicFiltered;
    if (filter) {
      page.topicFiltered = true;
      rows.push(['Filter label', esc(page.topicFilter.label)], ['No results', esc(page.topicFilter.noResults)]);
      page.note('support topics: accordion-columns (faq, tabs, filter), www\'s tabs and its "Find topic by typing" over them');
    }
    page.block(filter ? 'accordion-columns (faq, tabs, filter)' : 'accordion-columns (faq)', rows);
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
  // www's text one third, picture two thirds (CF7, eBooking's features): wide-media's 25 | 75
  if (/(^|\s)text-one-third(\s|$)/.test(cls(c))) {
    page.block('columns-media (wide-media)', [imageFirst ? [media, txt] : [txt, media]]);
    return;
  }
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

function cardRow(c, page, extra = []) {
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
  // www's boxed cards (lcagCard: a white card with a border and shadow): option boxed (Cargo's
  // theme, brief 422)
  const options = [n >= 4 ? 'four-up' : (n === 3 ? 'three-up' : ''), ...extra, cols.some((col) => col.querySelector('.lcagCard') || hasCls(col, /(^|\s)lcagCard(\s|$)/)) ? 'boxed' : ''].filter(Boolean);
  page.block(`cards-teaser${options.length ? ` (${options.join(', ')})` : ''}`, rows);
}

/**
 * www's breadcrumb (Liferay's desktopBreadcrumb, brief 422): the breadcrumb block where it stands,
 * its items as www's (Home and the hub pages linked, the menu's section labels as text, the page
 * last); its phone version (a back link) and the portlet title left out.
 */
function breadcrumbItems(scope, page) {
  return [...scope.querySelectorAll('.desktopBreadcrumb > li')].map((li) => {
    const label = esc(text(li).replace(/\s+/g, ' ').trim());
    if (!label) return '';
    const a = li.querySelector('a[href]');
    const href = a ? page.href(a.getAttribute('href')) : null;
    return href ? `<li><a href="${attr(href)}">${label}</a></li>` : `<li>${label}</li>`;
  }).filter(Boolean);
}

function breadcrumb(c, page) {
  const items = breadcrumbItems(c, page);
  if (items.length > 1) page.block('breadcrumb', [[`<ul>${items.join('')}</ul>`]]);
}

/** www's breadcrumb under scope as the breadcrumb block's HTML, else '' (cargo-notifications.mjs). */
export function breadcrumbHtml(scope, page) {
  const items = breadcrumbItems(scope, page);
  return items.length > 1 ? `<div class="breadcrumb"><div><div><ul>${items.join('')}</ul></div></div></div>` : '';
}

/**
 * www's icon collapsibles (LhcIconCollapsible: the SDG goals, brief 417): accordion-columns (faq),
 * one item per goal, its icon and bold title line as the item's title, its text as the panel.
 */
function iconCollapsible(c, page) {
  const rows = [...c.querySelectorAll('.LhcIconCollapsibleItem')].filter((item) => !isSkipped(item)).map((item) => {
    const head = item.querySelector('.LhcIconCollapsibleHeadContainer');
    const icon = head && head.querySelector('img');
    const line = head && head.querySelector('.LhcIconCollapsibleHeadText');
    const body = item.querySelector('.LhcIconCollapsibleText');
    const title = [icon ? page.img(icon) : '', line ? tidy(inline(line, page)) : ''].filter(Boolean).join(' ');
    return [title, body ? flow(body, page, 'cell').join('') : ''];
  }).filter((r) => !isEmptyHtml(r[0]));
  if (rows.length) page.block('accordion-columns (faq)', rows);
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

/** A slider of images (a carousel); www also builds tab panels on its slider (flexslider). */
function isImageSlider(c) {
  const clone = c.cloneNode(true);
  clone.querySelectorAll('script, style, .clone, .cloned').forEach((x) => x.remove());
  return text(clone).length < 200;
}

/**
 * www's older tab component (.LHCTabs: a headline, a tab bar, one panel per tab on a slider):
 * the headline, then accordion-columns (faq) with one item per tab; a single tab is default content.
 */
function lhcTabs(c, page) {
  const head = c.querySelector('.content-tab-headline-container h1, .content-tab-headline-container h2, .content-tab-headline-container h3');
  if (head) page.add(element(head, page, 'cell').join(''));
  const panes = [...c.querySelectorAll('.tab-content')];
  const titles = Object.fromEntries([...c.querySelectorAll('.tabs-selector a[href^="#"]')].map((a) => [a.getAttribute('href').slice(1), text(a)]));
  if (panes.length < 2) {
    panes.forEach((pane) => flow(pane, page, 'top').forEach((h) => page.add(h)));
    return;
  }
  page.block('accordion-columns (faq)', panes.map((pane, i) => [esc(titles[pane.id] || `${i + 1}`), flow(pane, page, 'cell').join('')]));
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

/**
 * www's story list on the transport stories hub (brief 439): the page's script holds every story
 * (var diaries = [...]: teaserImage, teaserHeadline, teaserDescription, viewUrl, moreText, ...), its
 * grid renders them as the visitor scrolls (a capture holds only the first tiles). The entries in
 * www's order, the strings unescaped; [] without the list.
 */
export function diariesOf(doc) {
  const script = [...doc.querySelectorAll('script')].map((s) => s.textContent).find((t) => /var diaries\s*=\s*\[/.test(t));
  if (!script) return [];
  const from = script.search(/var diaries\s*=\s*\[/);
  const list = script.slice(script.indexOf('[', from) + 1, script.indexOf('];', from));
  const unjs = (v) => { try { return JSON.parse(`"${v.replace(/\\'/g, "'")}"`); } catch (e) { return v; } };
  return [...list.matchAll(/\{([\s\S]*?)\}\s*(?=,\s*\{|$)/g)]
    .map(([, o]) => Object.fromEntries([...o.matchAll(/(\w+):"((?:[^"\\]|\\.)*)"/g)].map(([, k, v]) => [k, unjs(v)])));
}

// a story's imported document (its .plain.html in the workspace), for the hub's tile pictures;
// tests set their own (useStoryDocs)
const workspaceDoc = (p) => {
  const f = path.join(OUT, `${p}.plain.html`);
  return fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : null;
};
let storyDoc = workspaceDoc;
/** The story documents the hub's tiles take their pictures from (null: the workspace's). */
export function useStoryDocs(fn) {
  storyDoc = fn || workspaceDoc;
}

/**
 * A hub tile's picture (brief 439): the teaser's own when lh-cargo's DA has it, else the story's
 * first picture in DA (its imported document; for a language whose stories are not ours, the
 * English or German story of the same address), else none.
 */
function storyPicture(entry, page) {
  const pic = (src) => `<picture><img src="${attr(src)}" alt=""></picture>`;
  if (entry.teaserImage) {
    const copy = page.file(entry.teaserImage);
    if (copy) return pic(copy);
    page.missing.delete(fileKey(entry.teaserImage));
  }
  const own = edsPath(entry.viewUrl);
  const rest = own.replace(/^\/[a-z]{2}\/news\//, '');
  for (const p of new Set([own, `/en/news/${rest}`, `/de/news/${rest}`])) {
    const m = (storyDoc(p) || '').match(/<img[^>]*src="(?:https:\/\/content\.da\.live\/moved-permanently\/lh-cargo)?(\/media-da\/[^"?#]+)/);
    if (m) return pic(m[1]);
  }
  return '';
}

/**
 * The hub's tiles from www's story list (diariesOf), each as www's tile: picture | headline, text,
 * More. A story www rendered keeps its tile's text (www's Portuguese page shows its tiles
 * translated; its list is English).
 */
function storyList(list, c, page) {
  const rendered = new Map([...c.querySelectorAll(':scope > .masonryItem')].map((item) => {
    const a = item.querySelector('.storyTeaserHeadline a[href]');
    const box = item.querySelector('.storyTeaserTile');
    if (!a || !box) return null;
    const more = [...box.querySelectorAll(':scope > a[href]')].pop();
    return [sourcePath(a.getAttribute('href')), {
      head: text(a), desc: [...box.querySelectorAll(':scope > p')].filter((p) => text(p)).map((p) => p.outerHTML).join(''), more: more ? text(more) : '',
    }];
  }).filter(Boolean));
  const rows = list.map((e) => {
    const r = e.viewUrl ? rendered.get(sourcePath(e.viewUrl)) : null;
    const head = ((r && r.head) || e.teaserHeadline || e.teaserTitle || '').trim();
    if (!e.viewUrl || !head) return null;
    const href = page.href(e.viewUrl);
    const desc = c.ownerDocument.createElement('div');
    desc.innerHTML = r ? r.desc : (e.teaserDescription || '');
    const more = ((r && r.more) || e.moreText || '').trim();
    return [storyPicture(e, page), `<h3><a href="${attr(href)}">${esc(head)}</a></h3>${flow(desc, page, 'cell').join('')}${more ? `<p><a href="${attr(href)}">${esc(more)}</a></p>` : ''}`];
  }).filter(Boolean);
  page.block('cards-teaser (three-up)', rows);
  page.note(`transport stories: all ${rows.length} of www's story list (its grid renders them as the visitor scrolls)`);
}

/** The transport stories' tiles (masonry grid): cards-teaser (three-up); www's whole list when the page has it. */
function storyGrid(c, page) {
  const list = diariesOf(c.ownerDocument);
  if (list.length && list.length >= c.querySelectorAll(':scope > .masonryItem').length) { storyList(list, c, page); return; }
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
  // one stage per slide (hero-campaign (slider): a picture row starts a slide), the first slide's
  // headline the page's H1, the others' H2; the widget follows in the same section (serviceWidget)
  const rows = slides.flatMap((s, i) => {
    const h = i ? 'h2' : 'h1';
    return [[s.img], [`<${h}>${s.head}</${h}>${s.sub ? `<p>${esc(s.sub)}</p>` : ''}${s.link ? `<p><strong>${s.link}</strong></p>` : ''}`]];
  });
  page.block(slides.length > 1 ? 'hero-campaign (slider)' : 'hero-campaign', rows);
  if (!c.ownerDocument.querySelector('.service-widget')) page.section(null);
}

function latestNews(c, page) {
  const h = c.querySelector('.latestNewsTitle, h2');
  const a = c.querySelector('a.readAllNews, .readAllWrapper a');
  if (h) page.add(`<h2>${esc(text(h))}</h2>`);
  // the list www's script reads (var apiUrl = "https://www.mynewsdesk.com/services/pressroom/list/…")
  const script = [...c.ownerDocument.querySelectorAll('script')].map((s) => s.textContent).find((s) => /services\/pressroom\/list\//.test(s)) || '';
  const feed = (script.match(/https:\/\/www\.mynewsdesk\.com\/services\/pressroom\/list\/[^"'\s]+/) || [])[0];
  if (feed) {
    const url = feed.replace(/&amp;/g, '&');
    page.block('news-feed', [['Feed', `<a href="${attr(url)}">${esc(url)}</a>`]]);
    page.note('Mynewsdesk news: news-feed reads www\'s pressroom list');
  }
  // "Read all news": the newsroom in the page's language (www's script sets /newsroom on German
  // pages; the newsroom is /<lang>/ci/newsroom), else www's link
  const local = [`/${page.lang}/newsroom`, `/${page.lang}/ci/newsroom`].map((p) => page.href(p)).find((x) => x && !x.startsWith(HOST));
  const href = a ? (local || page.href(a.getAttribute('href'))) : null;
  page.add(`<p>${href ? `<a href="${attr(href)}">${esc(text(a))}</a>` : ''}</p>`);
  if (!feed) {
    page.add(`<p><a href="${MYNEWSDESK}">${esc(page.labels.newsroom)}</a></p>`);
    page.note('Mynewsdesk news list: links to the newsroom (not copied)');
  }
}

const statItem = (value, label) => `<li><strong>${esc(value)}</strong> ${esc(label)}</li>`;

function infra(c, page) {
  const inner = c.querySelector('.infraInner');
  const stats = [...c.querySelectorAll('.infraStat')].map((s) => statItem(text(s.querySelector('.infraStatValue')), text(s.querySelector('.infraStatLabel'))));
  // a region's label on two lines as www's spans ("Stations in" / "North America")
  const regionLabel = (r) => {
    const spans = [...r.querySelectorAll('.infraRegionLabel span')].map(text).filter(Boolean);
    return spans.length > 1 ? spans.map(esc).join('<br>') : esc(text(r.querySelector('.infraRegionLabel')));
  };
  const regions = [...c.querySelectorAll('.infraRegion')].map((r) => `<li><strong>${esc(text(r.querySelector('.infraRegionValue')))}</strong> ${regionLabel(r)}</li>`);
  // the station network map (an image on www), then the counters
  const map = c.querySelector('img.infraMapImg');
  const mapImg = map ? page.img(map) : '';
  const counters = `${stats.length ? `<ul>${stats.join('')}</ul>` : ''}${regions.length ? `<ul>${regions.join('')}</ul>` : ''}${mapLink(page).join('')}`;
  page.block('columns-media (band, gradient, stats, icons)', [[inner ? flow(inner, page, 'cell').join('') : ''], [counters, mapImg ? `<p>${mapImg}</p>` : '']]);
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
  if (cards.length) page.block('cards-teaser (overlay, fleet)', cards);
}

function ourProducts(c, page) {
  const box = c.querySelector('.whiteBgBox') || c;
  const head = [...box.children].filter((x) => /^(H2|A|P)$/.test(x.tagName)).map((x) => element(x, page, 'cell').join('') || (x.tagName === 'A' ? `<p>${inline({ childNodes: [x] }, page)}</p>` : '')).join('');
  const rows = [...box.querySelectorAll('.productBlock, .speedBlock, .aosBlock')].map((b) => {
    const info = b.querySelector('.info');
    const links = [...b.querySelectorAll('.features a[href]')].map((a) => {
      const href = page.href(a.getAttribute('href'));
      const label = text(a.querySelector('small')) || text(a);
      return href ? `<li><a href="${attr(href)}">${esc(label)}</a></li>` : `<li>${esc(label)}</li>`;
    });
    return [info ? flow(info, page, 'cell').join('') : '', links.length ? `<ul>${links.join('')}</ul>` : ''];
  });
  if (rows.length) page.block('columns-media (band, dark, features, icons)', [[head], ...rows]);
  else if (head) page.add(head);
}

function slideCards(c, page) {
  const h = c.querySelector('.slideTitle, h2');
  if (h) page.add(`<h2>${esc(text(h))}</h2>`);
  const rows = [...c.querySelectorAll('.owl-item')].filter((s) => !isSkipped(s)).map((s) => {
    const i = s.querySelector('img');
    const body = s.querySelector('.slide-content') || s;
    return [i ? page.img(i) : '', flow(body, page, 'cell').join('')];
  });
  if (rows.length) page.block('carousel-cards (slides)', rows);
}

function teaserOverlay(c, page) {
  const i = c.querySelector('img');
  const o = c.querySelector('.overlay') || c;
  const eyebrow = text(o.querySelector('.subtitle'));
  const clone = o.cloneNode(true);
  clone.querySelectorAll('.subtitle').forEach((x) => x.remove());
  // www's phone picture (the picture's max-width source: Teaser-ULD-Mobile@2x.jpg up to 767 px)
  // as the cell's second picture, which hero-card-overlay shows on Cargo below 768 px (brief 442)
  const source = i && i.closest('picture')?.querySelector('source[media*="max-width"][srcset]');
  const phoneSrc = source ? source.getAttribute('srcset').trim().split(/[\s,]+/)[0] : '';
  let phone = '';
  if (phoneSrc && fileKey(phoneSrc) !== fileKey(i.getAttribute('src') || '')) {
    const n = c.ownerDocument.createElement('img');
    n.setAttribute('src', phoneSrc);
    n.setAttribute('alt', '');
    phone = page.img(n);
  }
  page.block('hero-card-overlay (plain)', [[i ? `${page.img(i)}${phone}` : ''], [`${eyebrow ? `<p>${esc(eyebrow)}</p>` : ''}${flow(clone, page, 'cell').join('')}`]]);
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
  page.block('columns-media (band, dark, facts)', [[head ? flow(head, page, 'cell').join('') : '', right]]);
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
  // www's timeline: the events in a row on a line (carousel-cards (timeline), round 3), in a
  // section of its own (style timeline, brief 439) with www's photo behind it, which Cargo's theme
  // draws
  if (!rows.length) return;
  page.section('timeline');
  const bg = page.bg(c);
  if (bg) page.add(`<p>${bg}</p>`);
  page.block('carousel-cards (timeline)', rows);
  page.section(null);
}

/**
 * www's image lists (LCAGCP-lcagImageList: Facts & Figures' Meet the Executive Board and
 * Compliance, round 3): the band's picture, the heading and the items as an accordion that opens
 * one item at a time, in a section of style image-list (Cargo's theme: the picture behind the
 * list). www keeps each item's text only in its phone copy (collapse d-md-none; its script copies
 * it into the desktop overlay, whose placeholder reads "lorem"), so that copy is read.
 */
function imageList(c, page) {
  const i = c.querySelector('img');
  const h = c.querySelector('.LCAGCP-imageListHeadline');
  const rows = [...c.querySelectorAll('.LCAGCP-imageListItemHeadline')].map((t) => {
    const next = t.nextElementSibling;
    const body = next && hasCls(next, /LCAGCP-imageListMobileContent/) ? next.cloneNode(true) : null;
    if (body) body.removeAttribute('class');
    return [esc(text(t.querySelector('.LCAGCP-imageListToggle') || t)), body ? flow(body, page, 'cell').join('') : ''];
  });
  page.section('image-list');
  if (i) page.add(`<p>${page.img(i)}</p>`);
  if (h) page.add(`<h2>${esc(text(h))}</h2>`);
  page.block('accordion-columns (faq, exclusive)', rows);
  page.section(null);
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

/** The first match under scope that no skipped element holds (www's phone-only copies, brief 417). */
function shown(scope, sel) {
  return [...scope.querySelectorAll(sel)].find((el) => {
    for (let n = el; n && n !== scope; n = n.parentNode) if (isSkipped(n)) return false;
    return true;
  }) || null;
}

function story(c, page) {
  const i = shown(c, '.story-imageWrap img');
  const box = c.querySelector('.story-textWrap');
  const clone = (box || c).cloneNode(true);
  // the headline of the copy that is imported: a module without a picture holds a phone copy
  // (d-sm-none, left out) before the desktop one; the story's first headline is the page's H1
  const h = shown(clone, '.story-headline, h1, h2');
  const headline = h ? tidy(inline(h, page)) : '';
  if (h) h.remove();
  const level = page.storyHeadline ? 'h2' : 'h1';
  if (headline) page.storyHeadline = true;
  const head = headline ? `<${level}>${headline}</${level}>` : '';
  // the picture with www's text box over it (brief 422): hero-card-overlay (light), at the right
  // where www's box sits at the right (offset-md-8)
  if (i && box) {
    const right = Boolean(box.querySelector('[class*="offset-md-"], [class*="offset-lg-"]'));
    page.block(`hero-card-overlay (light${right ? ', right' : ''})`, [[page.img(i)], [`${head}${flow(clone, page, 'cell').join('')}`]]);
  } else {
    if (i) page.add(`<p>${page.img(i)}</p>`);
    if (head) page.add(head);
    flow(clone, page, 'top').forEach((x) => page.add(x));
  }
  phoneOnly(c, page).forEach((x) => page.add(x));
}

// a passage's sentences (3+ words), compared with punctuation, case and spaces evened out
const evened = (t) => ` ${t.normalize('NFC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim()} `;
const sentencesOf = (t) => t.split(/(?<=[.!?"”])\s+/).map((x) => x.trim()).filter((x) => x.split(/\s+/).length >= 3);
const PHONE_COPY = '.d-sm-none, .d-md-none';
const wordsOf = (t) => new Set(evened(t).trim().split(' ').filter(Boolean));
// a passage's language by its function words (en or de: Cargo's story languages), '' when unclear
const FUNCTION_WORDS = {
  en: new Set(['the', 'and', 'of', 'to', 'is', 'with', 'for', 'which', 'that', 'are', 'its', 'from', 'by', 'this']),
  de: new Set(['der', 'die', 'das', 'und', 'mit', 'für', 'ist', 'von', 'den', 'dem', 'ein', 'eine', 'zu', 'auf', 'nicht', 'sich']),
};
function languageOf(t) {
  const w = [...wordsOf(t)];
  const en = w.filter((x) => FUNCTION_WORDS.en.has(x)).length;
  const de = w.filter((x) => FUNCTION_WORDS.de.has(x)).length;
  if (en >= 2 && en > de) return 'en';
  if (de >= 2 && de > en) return 'de';
  return '';
}

/**
 * A story module's phone-only passages (brief 442): www keeps some text only in a module's phone
 * copy (d-block d-sm-none, otherwise left out as the desktop copy's duplicate). Each paragraph of
 * the module's phone copies whose sentences the page's desktop copy lacks, after the module: as it
 * is when none of its sentences is on the desktop, else only its missing sentences; each once. A
 * sentence counts as on the desktop when a desktop sentence has nearly its words (80 %: the phone
 * copy's older wording, "Kühne+Nagel" for "Kuehne+Nagel", another word order); a paragraph in the
 * page's other language (www's English phone copy of a German story) is no phone-only passage.
 */
function phoneOnly(c, page) {
  const phones = [...c.querySelectorAll(PHONE_COPY)].filter((x) => !x.parentElement.closest(PHONE_COPY));
  if (!phones.length) return [];
  if (page.desktopText === undefined) {
    const doc = c.ownerDocument;
    const root = (doc.querySelector('#main-content') || doc.body).cloneNode(true);
    root.querySelectorAll(`${PHONE_COPY}, script, style`).forEach((x) => x.remove());
    root.querySelectorAll('p, li, h1, h2, h3, h4, td').forEach((x) => x.append(' '));
    page.desktopText = evened(root.textContent);
    page.desktopSentences = sentencesOf(root.textContent.replace(/\s+/g, ' ')).map(wordsOf);
    page.phoneKept = new Set();
  }
  // a word in a desktop sentence: the same, or inside one at most two characters longer (www's
  // bullet glyph glued to a list item's first word: "uCare/td")
  const inSentence = (x, d) => d.has(x) || [...d].some((y) => y.length - x.length <= 2 && y.length > x.length && y.includes(x));
  const onDesktop = (s) => {
    if (page.desktopText.includes(evened(s))) return true;
    const w = wordsOf(s);
    return page.desktopSentences.some((d) => [...w].filter((x) => inSentence(x, d)).length >= 0.8 * w.size);
  };
  const other = { en: 'de', de: 'en' }[page.lang];
  const out = [];
  phones.forEach((ph) => ph.querySelectorAll('p').forEach((p) => {
    const t = text(p);
    if (other && languageOf(t) === other) return;
    const sentences = sentencesOf(t);
    const missing = sentences.filter((s) => !onDesktop(s) && !page.phoneKept.has(evened(s)));
    if (!missing.length) return;
    missing.forEach((s) => page.phoneKept.add(evened(s)));
    out.push(missing.length === sentences.length ? `<p>${tidy(inline(p, page))}</p>` : `<p>${esc(missing.join(' '))}</p>`);
  }));
  if (out.length) page.note(`story: ${out.length} passage(s) only in www's phone copy kept`);
  return out;
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
/**
 * Support & Contact's topics (www: tabs of categories, each category's entries in a panel beside
 * the list for the one selected; the topic search's list .topicSearchTriggerContainer has every
 * category with all its entries): each tab's categories, their one-line description and their
 * entries as a list; the search's list and each entry's hidden fields (requiresLogin true/false,
 * the link's portal parameters p_p_id=...) left out.
 */
// www's topic search answers no match with no line; its screen readers hear jQuery UI's own
// "No search results." (www.lufthansa-cargo.com/en/support-and-contact, typed 2026-11-01)
const TOPIC_NO_RESULTS = 'No search results.';

function supportTopics(content, page) {
  // www's "Find topic by typing" (its topic search's field label): the topics' accordion filters
  const topicLabel = text(content.querySelector('label[for$="_topicSearch"]'));
  if (topicLabel) page.topicFilter = { label: topicLabel, noResults: TOPIC_NO_RESULTS };
  // entries without a link: www's script opens its contact form with the entry's reason and
  // subreason (.faqReason / .faqSubreason beside it): links to the form's dialog with both
  let linked = 0;
  content.querySelectorAll('.faqEntryTitle').forEach((e) => {
    const a = e.querySelector('a[href]');
    if (a && !/^javascript:/i.test(a.getAttribute('href'))) return;
    let box = e.parentElement;
    while (box && box !== content && !(box.querySelectorAll('.faqEntryTitle').length === 1 && box.querySelector('.faqReason'))) box = box.parentElement;
    if (!box || box === content) return;
    const reason = text(box.querySelector('.faqReason'));
    const subreason = text(box.querySelector('.faqSubreason'));
    if (!reason || !subreason) return;
    const h = e.querySelector('h1, h2, h3, h4, h5, h6') || e;
    const link = content.ownerDocument.createElement('a');
    link.setAttribute('href', contactFormHref(reason, subreason, page.lang, { dialog: true }));
    link.append(...[...(a || h).childNodes]);
    if (a) a.replaceWith(link); else h.replaceChildren(link);
    linked += 1;
  });
  if (linked) page.note(`support topics: ${linked} entries opening www's contact form linked to ${contactDialog()} with their reason and subreason`);
  content.querySelectorAll('.requiresLogin, .faqReason, .faqSubreason').forEach((x) => x.remove());
  // the topic search's section: the .topicSection outside the tabs (a category heading in each
  // .topicSearchTriggerContainer, its entries the .faqEntryTitle after it)
  const search = [...content.querySelectorAll('.topicSection')].find((s) => !s.closest('.tab-pane'));
  if (!search) return;
  const doc = content.ownerDocument;
  const entries = {};
  let current = null;
  search.querySelectorAll('.topicSearchTriggerContainer, .faqEntryTitle').forEach((e) => {
    // (the heading's own text: the first container also holds a <style>)
    if (e.matches('.topicSearchTriggerContainer')) {
      // a name can come again (each tab's "Other service requests"): its groups in their order
      current = [];
      const name = text(e.querySelector('h1, h2, h3, h4, h5, h6') || e);
      (entries[name] = entries[name] || []).push(current);
      return;
    }
    if (current) current.push(e.querySelector('h1, h2, h3, h4, h5, h6') || e);
  });
  let rebuilt = 0;
  const used = {};
  [...content.querySelectorAll('.tab-pane')].filter((p) => p.querySelector('.topicSection')).forEach((pane) => {
    const tabTitle = text(content.querySelector(`a[href="#${pane.id}"]`)).toLowerCase();
    // the tab's categories: a heading named as one of the list's categories, its description the next heading
    const heads = [...pane.querySelectorAll('h3, h4, h5')];
    const cats = [];
    heads.forEach((h, i) => {
      const name = text(h);
      if (!entries[name] || cats.some((c) => c.name === name)) return;
      const next = heads[i + 1];
      cats.push({ name, description: next && /^H[56]$/.test(next.tagName) && !entries[text(next)] ? text(next) : '' });
    });
    if (!cats.length) return;
    const body = doc.createElement('div');
    cats.forEach((c) => {
      const h = doc.createElement('h3');
      h.textContent = c.name;
      body.append(h);
      if (c.description) { const p = doc.createElement('p'); p.textContent = c.description; body.append(p); }
      const ul = doc.createElement('ul');
      // a name in several tabs: the group naming the tab ("... with your general request"), else in order
      const groups = entries[c.name];
      const own = groups.length > 1 && tabTitle ? groups.find((g) => g.some((e) => text(e).toLowerCase().includes(tabTitle))) : null;
      const group = own || groups[Math.min(used[c.name] || 0, groups.length - 1)];
      used[c.name] = (used[c.name] || 0) + 1;
      group.forEach((e) => { const li = doc.createElement('li'); li.append(...[...e.childNodes].map((n) => n.cloneNode(true))); ul.append(li); });
      body.append(ul);
    });
    const box = pane.querySelector('.card-body') || pane;
    box.replaceChildren(body);
    rebuilt += 1;
  });
  search.remove();
  page.note(`support topics: ${rebuilt} tabs of categories with their entries; the topic search's list and the hidden login flags and link parameters left out`);
}

export function convert(html, source, lang) {
  const { document } = parseHTML(html);
  const page = new Page(source, lang, html);
  // #content: the layout (#main-content) and, on the homepage, the tile rows next to it
  const content = document.querySelector('#content.pagebody') || document.querySelector('#main-content') || document.querySelector('#content');
  if (!content) throw new Error(`${source}: no #main-content`);
  supportTopics(content, page);
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
  // --known-from <dir>: DA copies of the pages (<path>.html), whose files the import may use
  // where there is no asset map (knownCopy)
  if (opt('known-from')) {
    const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
    knownDocs = walk(path.resolve(opt('known-from'))).filter((f) => f.endsWith('.html')).map((f) => fs.readFileSync(f, 'utf8'));
  }
  const { paths, capture, known } = loadSite();
  if (known) console.log(`no asset map: the files lh-cargo's DA has (${known.size})`);
  const svgs = await prepareImages();
  if (svgs) console.log(`${svgs} SVG images as PNG`);
  const report = {};
  const written = [];
  urls.forEach((url) => {
    const source = sourcePath(url);
    const eds = paths[source];
    if (!eds) { report[source] = { skipped: REDIRECT_ONLY[source] ? `redirect to ${REDIRECT_ONLY[source]}` : 'not a page in scope' }; return; }
    // our captures (cargo-capture.mjs) first, then the delivery's batch 1
    const c = capture[source];
    if (c && c.status !== 'ok') {
      report[source] = { eds, skipped: c.status === 'redirect' ? `redirect on www to ${c.finalUrl}` : `${c.status} on www (HTTP ${c.http})` };
      return;
    }
    const snap = [path.join(CAPTURED, `${source}.html`), path.join(SNAP, `${source}.html`)].find((f) => fs.existsSync(f));
    if (!snap) { report[source] = { eds, skipped: 'no snapshot' }; return; }
    const lang = source.slice(1, 3);
    const { html, report: r } = convert(fs.readFileSync(snap, 'utf8'), source, lang);
    report[source] = { eds, ...r };
    if (!argv.includes('--dry-run')) {
      const out = path.join(OUT, `${eds}.plain.html`);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      // unchanged documents keep their file (and time): da-upload.mjs sends only changed ones
      const before = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : null;
      if (before !== html) {
        fs.writeFileSync(out, html);
        report[source].changed = before === null ? 'new' : 'changed';
      }
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
      patterns: ['^/(en|de)/(nav|footer|search)$'],
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
