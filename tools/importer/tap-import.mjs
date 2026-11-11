/* eslint-disable no-console, no-continue, no-restricted-syntax, max-len, no-use-before-define, no-underscore-dangle, import/extensions -- tooling */
/**
 * Imports TAP Air Portugal's pages (lh-tap) offline from the local capture's page archives
 * (tap-snapshots-NNN.tar.gz, unpacked: www.flytap.com/<path>.html, the homepage
 * www.flytap.com/pt-pt.html) into content-sites/lh-tap/content/<path>.plain.html, with lh-com's
 * existing blocks only (the brand's look comes from styles/themes/tap.css). The source is a
 * Next.js app over TAP's AEM: every page carries its content as JSON in __NEXT_DATA__
 * (pageProps.page: topSections and sections, typed content fragments; rich text as AEM's JSON
 * node tree); this reads them, not the markup. Paths as on the source (/pt-pt/..., the homepage
 * /pt-pt).
 *
 * Components (pageProps.page):
 * - the homepage's slider (BannerSlide items): hero-campaign (slider), no H1 of its own (the
 *   homepage's H1 is www's, the card list's title, parity 85); BannerCarousel: hero-campaign
 *   (narrow), (slider, narrow) with several slides;
 * - HeroCard: hero-campaign (narrow) at the top of a page, else hero-card-overlay;
 * - Heading (the page's first: its H1), HeadingSection (H2), RichTextBlock: default content, the
 *   CTAs as buttons (primary bold, secondary plain), tables as table-striped;
 * - AccordionItemsList, the FAQ's CategoryAccordion (a heading per category and subcategory),
 *   the alerts page's list: the message-center block (the current alerts, not the captured ones);
 *   the homepage's extra link strip (extraAlert): columns in a first section of style extra-alert;
 * - GenericCardList: cards (text cards; three-up, four-up by itemsPerRow), cards-teaser (image
 *   cards; three-up, four-up by itemsPerRow), carousel-cards (desktopType carousel);
 *   ClientNeedsCardList: carousel-cards; AuxiliaryCarousel: cards-icon; the visitor's
 *   Miles_GoCard (type 1), FeatureCard, BannerVideo: columns-media; InfoSection: its picture and
 *   accordion-columns (faq); a HeroCard with a picture only: the picture in the content; a
 *   LinkList to pages: cards-icon tiles (jump-links when all are anchors on the page); the
 *   homepage's stage: a booking-slot section after it; MilesStatusCardList: cards; InfoBlock: a
 *   highlight section; CardInfoBlock: default content;
 *   YoutubeVideo: embed; Table (fare comparisons): table-striped (header; matrix over three
 *   fares), a table in a panel; TabsItemsList (tabs in tabs: route group, cabin): a heading per
 *   group and accordion-columns (tabs) of its items;
 * - www's live widgets (WidgetFreeBlock: Smartvel's explorer; ContactsByCountry: the contacts
 *   picker; CoreMedia: the flight extras and c2call widgets; TrackBagagge: the baggage tracking
 *   form): a link to the page on www, reported;
 * - any other component: its titles, texts, images and links in order (reported as generic).
 * Out of scope (no document, links to www): the forms (templates register, requests-complaints,
 * information-miles-and-go-requests, suggestion-and-praise).
 * A page over 900 KB of HTML or 190 images (the content bus takes 1 MB and 200 images a document;
 * /pt-pt/destinos/inspire-se's destination themes are 2 MB): each category of its
 * CategoryAccordion fragment documents (/<locale>/fragments/<page>/<category>, -2 … each within
 * 900 KB and 180 images), the page a heading per category and a fragment block per fragment.
 * Links: pages of the site (those of the archives given that are imported, and the documents of
 * earlier runs, tools/importer/sites/lh-tap.json) relative, www's
 * anchors to the headings' ids (anchorsOf), the rest absolute on www.flytap.com (the
 * "pt_[market]" placeholder filled with the page's market).
 * Images: the media archives' files (tap-media-NNN.tar.gz, unpacked, by every URL they were seen
 * under), copied to content-sites/lh-tap/content/media-da/tap/ (da-upload.mjs sends them with the
 * pages); a file over Edge Delivery's limits (images and PDFs 20 MB, mp4 36 MB) is linked on the
 * source and listed; an image without a file is left out and listed (missing; with
 * --source-images it stays on www's image host instead, which the preview would fetch).
 * Metadata: title, description, image, robots, the locale's nav and footer, the language, and the
 * page's counterparts in the other languages that are documents of the site (www's hrefLangs:
 * Alternate <lang>, for the header's language switch).
 * Writes content-sites/lh-tap/runs/<name>-import.json, <name>-paths.txt (new or changed
 * documents) and the allowlist tools/importer/sites/lh-tap.json.
 *
 * Usage: node tools/importer/tap-import.mjs --archive <unpacked pages archive> [--archive ...]
 *          [--deliveries <tap-deliveries.json> [--archives-root /tmp/lh-arch]]
 *          [--media <unpacked media archive> ...] [--name batch-1] [--only <path,...>]
 *          [--source-images] [--dry-run]
 *        (archives in the index's order: a later one replaces pages of an earlier one)
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
// eslint-disable-next-line import/no-extraneous-dependencies -- tooling (linkedom: dev)
import { parseHTML } from 'linkedom';
import { SITE_LANGUAGES } from '../../scripts/site-languages.js';
import { collapseHtml } from './marker-collapse.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const W = path.join(root, 'content-sites/lh-tap');
const OUT = path.join(W, 'content');
export const WWW = 'https://www.flytap.com';
// the header's language switch: its first listed root per language (scripts/site-languages.js,
// tap: pt-pt for pt; the markets not yet live are listed false)
const SWITCH_ROOT = Object.fromEntries(SITE_LANGUAGES.tap.filter((l) => l.listed !== false)
  .reverse().map((l) => [l.lang, l.home.slice(1)]));
const PIC = 'https://pic.flytap.com';
const MB = 1024 * 1024;
const readJson = (f, d) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d);
const writeJson = (f, v) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, `${JSON.stringify(v, null, 1)}\n`); };
const sha1 = (s) => crypto.createHash('sha1').update(s).digest('hex');
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s) => esc(s).replace(/"/g, '&quot;');
const plainOf = (v) => (v && typeof v === 'object' ? v.plaintext : v) || '';

/** The texts in the page's language (pt-pt: pt, en-pt: en). */
const LABELS = {
  pt: { onWww: 'Ver em flytap.com', video: 'Ver o vídeo', book: 'Pesquisar voos em flytap.com' },
  en: { onWww: 'See on flytap.com', video: 'Watch the video', book: 'Search flights on flytap.com' },
  es: { onWww: 'Ver en flytap.com', video: 'Ver el vídeo', book: 'Buscar vuelos en flytap.com' },
  fr: { onWww: 'Voir sur flytap.com', video: 'Regarder la vidéo', book: 'Rechercher des vols sur flytap.com' },
  de: { onWww: 'Auf flytap.com ansehen', video: 'Video ansehen', book: 'Flüge auf flytap.com suchen' },
  it: { onWww: 'Vedi su flytap.com', video: 'Guarda il video', book: 'Cerca voli su flytap.com' },
  pl: { onWww: 'Zobacz na flytap.com', video: 'Obejrzyj wideo', book: 'Szukaj lotów na flytap.com' },
};
const labelsOf = (lang) => LABELS[lang] || LABELS.en;
/** Page templates out of scope: no document (their links go to www). */
const OUT_TEMPLATES = {
  register: 'register: the TAP Miles&Go sign-up form (a form, out of scope)',
  'requests-complaints': 'requests-complaints: the complaint form (a form, out of scope)',
  'information-miles-and-go-requests': 'information-miles-and-go-requests: the Miles&Go request form (a form, out of scope)',
  'suggestion-and-praise': 'suggestion-and-praise: the suggestion and praise form (a form, out of scope)',
};
/** A template out of scope (a form on www: no document, links to www). */
export const outOfScope = (template) => Boolean(OUT_TEMPLATES[template]);

/** An image description in the page's language ("pt:…|en:…|fr:…"); a plain one as it is. */
export function altOf(description, lang) {
  const d = String(description || '').trim();
  if (!/^[a-z]{2}(-[a-z]{2})?:/.test(d)) return d;
  const parts = Object.fromEntries(d.split('|').map((x) => {
    const i = x.indexOf(':');
    return [x.slice(0, i).trim(), x.slice(i + 1).trim()];
  }));
  return parts[lang] || parts.en || parts.pt || '';
}

/** A heading's id as Edge Delivery's backend makes it (lower case, accents kept, punctuation dropped). */
export const slugOf = (t) => String(t || '').trim().toLowerCase()
  .replace(/[^\p{L}\p{N}\p{M}\s_-]/gu, '')
  .replace(/\s/g, '-');

/** The document path of a source URL (/pt-pt, /pt-pt/ajuda). */
export const docPath = (url) => new URL(url, WWW).pathname.replace(/\/+$/, '') || '/';
const localeOf = (url) => docPath(url).split('/')[1] || 'pt-pt';
const langOf = (locale) => locale.split('-')[0];

/** A link of the page JSON: site pages in scope relative, www's anchors our heading ids, the rest on www. */
export function linkOf(href, c) {
  if (!href) return '';
  const h = String(href).trim().replace(/\[market\]/g, c.locale.split('-')[1]);
  const own = docPath(c.url);
  const mapAnchor = (p, id) => {
    const m = c.anchors && c.anchors.get(p);
    return (m && m.get(id)) || id;
  };
  // www's box anchors (#special-anchor-book-flight, -check-in, -my-travels, -flight-status; www
  // opens its booking box over the page), on any page or link: the root homepage's booking box,
  // /<root>#<tab> (booking-spec.md 5.4); its other widget anchors (sign-in): the page on www
  const box = h.match(/#special-anchor-(book-flight|check-in|my-travels|flight-status)$/);
  if (box && (h.startsWith('#') || /^(https?:\/\/(www\.)?flytap\.com)?\//.test(h))) return `/${c.locale}#${box[1]}`;
  if (/^#special-anchor/.test(h)) return `${WWW}${own}${h}`;
  if (h.startsWith('#')) return `#${mapAnchor(own, h.slice(1))}`;
  let u;
  try { u = new URL(h, WWW); } catch (e) { return h; }
  if (!/^(www\.)?flytap\.com$/.test(u.hostname) || !/^https?:$/.test(u.protocol)) return h;
  let p = u.pathname.replace(/\/+$/, '');
  // the app's paths come without the locale (/informacoes/bagagem): the page's locale
  if (!/^\/[a-z]{2}[-_][a-z]{2}(\/|$)/.test(p)) p = `/${c.locale}${p}`;
  if (c.scope.has(p)) return `${p}${u.search}${u.hash ? `#${mapAnchor(p, decodeURIComponent(u.hash.slice(1)))}` : ''}`;
  return `${WWW}${p}${u.search}${u.hash}`;
}

/**
 * BySide's card HTML as captured (the call-back card's title, text, schedule and small print):
 * its bold, emphasis, line breaks and links (a page in scope ours, the others as www has them);
 * any other tag dropped, its text kept. The space before a line break followed by a word joiner:
 * the pipeline drops the white space at a break's left (a no-break space too), and where the break
 * is hidden (the title on phones, as BySide's window) the words keep their gap.
 */
export function bysideHtml(v, c) {
  // the open links: false for one that goes nowhere (BySide's en-pt small print: href="null"),
  // dropped with its closing tag, its text kept (brief 468)
  const open = [];
  return String(v || '').replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, '').replace(/[ \t]+(<br\s*\/?>)/gi, ' \u2060$1')
    .split(/(<[^>]*>)/)
    .map((x) => {
      if (!x.startsWith('<')) return x.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const t = x.match(/^<(\/?)([a-z]+)\b([^>]*)>$/i);
      if (!t) return '';
      const [, close, tag, rest] = t;
      const name = {
        b: 'strong', strong: 'strong', i: 'em', em: 'em',
      }[tag.toLowerCase()];
      if (name) return `<${close}${name}>`;
      if (tag.toLowerCase() === 'br') return close ? '' : '<br>';
      if (tag.toLowerCase() !== 'a') return '';
      if (close) return open.pop() === false ? '' : '</a>';
      const href = (rest.match(/\bhref\s*=\s*"([^"]*)"/i) || [])[1];
      if (href !== undefined && /^\s*(null|undefined|#|javascript:.*)\s*$/i.test(href)) { open.push(false); return ''; }
      open.push(true);
      if (!href) return '<a>';
      const local = linkOf(href.replace(/&amp;/g, '&'), c);
      return `<a href="${attr(local.startsWith('/') ? local : href.replace(/&amp;/g, '&'))}">`;
    })
    .join('');
}

/** The anchors of a page (www's ids: the FAQ's categories, Anchor components) → our heading ids. */
export function anchorsOf(nd) {
  const page = nd.props.pageProps.page || {};
  const secs = [...(page.topSections || []), ...(page.sections || [])];
  const map = new Map();
  secs.forEach((s, i) => {
    if (s.__typename === 'ComponentCategoryAccordionModel') {
      (s.categories || []).forEach((cat) => {
        if (cat.id) map.set(cat.id, slugOf(cat.label));
        (cat.subCategories || []).forEach((sub) => { if (sub.id) map.set(sub.id, slugOf(sub.label)); });
      });
    }
    if (s.__typename === 'ComponentAnchorModel' && s.name) {
      const next = secs.slice(i + 1).find((x) => x.title && /Heading|AccordionItemsList|GenericCardList|LinkList/.test(x.__typename));
      if (next) map.set(s.name, slugOf(next.title));
    }
  });
  return map;
}

/* ------------------------------------------------------------------ rich text ---------- */

const INLINE = new Set(['text', 'link', 'line-break', 'span', 'reference']);
// www renders a rich text's DAM references from its AEM host (pageProps.aemHost)
const AEM = 'https://aem.flytap.com';

/** A rich text reference (a DAM image): the archive's copy, else left out and listed. */
function reference(n, c) {
  const p = n.data && n.data.path;
  if (!p || !/^image\//.test(n.data.mimetype || 'image/')) return '';
  const m = c.media(p) || c.media(`${AEM}/${p.replace(/^\/+/, '')}`) || c.media(`${AEM}//${p.replace(/^\/+/, '')}`)
    || c.media(plainKey(`${AEM}/${p}`));
  const local = m && (typeof m === 'string' ? { eds: m } : m);
  if (local && local.eds) return `<img src="${attr(local.eds)}" alt="">`;
  if (c.missing) c.missing.add(`${AEM}/${p.replace(/^\/+/, '')}`);
  return '';
}
// (www renders a rich text's subscript and superscript as plain text: none of the 265 pages with
// the marks has a <sub> or <sup>; "Para extras de bagagem …" a sentence at the text's size)
const FORMAT = {
  strong: 'strong', bold: 'strong', emphasis: 'em', italic: 'em', underline: 'u',
};
// the marks' nesting, outside in: a bold-italic word inside a bold sentence is
// <strong>… <em>word</em> …</strong>, not <em><strong>word</strong></em><strong>…, which the
// preview printed as literal asterisks ("Cristo morto**,")
const MARK_ORDER = ['strong', 'em', 'u'];
const marksOf = (n) => {
  const s = new Set(((n.format && n.format.variants) || []).map((v) => FORMAT[v]).filter(Boolean));
  return MARK_ORDER.filter((t) => s.has(t));
};
// a span only wraps: its children are siblings of the run
const unwrap = (nodes) => (nodes || []).flatMap((n) => (n && n.nodeType === 'span' ? unwrap(n.content) : [n]));

/**
 * A run of sibling nodes as HTML with one stack of marks: an open mark stays open while the next
 * text has it too (new ones nest inside, in MARK_ORDER), a text of spaces keeps the open ones,
 * and spaces at a mark's edge go outside it (a closing mark after a space is no mark in
 * Markdown); a link, line break or image closes them; a block node inside (a list in a
 * paragraph) is rendered as cell content.
 */
function marked(nodes, c) {
  let out = '';
  let pending = '';
  const open = [];
  const closeTo = (k) => { while (open.length > k) out += `</${open.pop()}>`; };
  const flushSpace = () => { out += pending; pending = ''; };
  const run = unwrap(nodes);
  // how many texts from i on have the mark (texts of spaces don't break the run)
  const runOf = (t, i) => {
    let r = 0;
    for (let j = i; j < run.length && run[j] && run[j].nodeType === 'text'; j += 1) {
      if (String(run[j].value).trim()) { if (!marksOf(run[j]).includes(t)) break; r += 1; }
    }
    return r;
  };
  run.forEach((n, i) => {
    if (!n || typeof n !== 'object') return;
    if (n.nodeType === 'text') {
      if (c.dropSubSup && ((n.format && n.format.variants) || []).some((v) => v === 'subscript' || v === 'superscript')) return;
      const [, lead, core, trail] = esc(n.value).match(/^(\s*)([\s\S]*?)(\s*)$/);
      if (!core) { pending += lead; return; }
      const want = new Set(marksOf(n));
      let k = 0;
      while (k < open.length && want.has(open[k])) k += 1;
      closeTo(k);
      flushSpace();
      out += lead;
      // the new marks: the one that runs on longest outside, then MARK_ORDER
      MARK_ORDER.filter((t) => want.has(t) && !open.includes(t))
        .sort((a, b) => runOf(b, i) - runOf(a, i) || MARK_ORDER.indexOf(a) - MARK_ORDER.indexOf(b))
        .forEach((t) => { out += `<${t}>`; open.push(t); });
      out += core;
      pending = trail;
      return;
    }
    closeTo(0);
    flushSpace();
    out += INLINE.has(n.nodeType) ? inline(n, c) : flow([n], c, 'cell');
  });
  closeTo(0);
  flushSpace();
  return out;
}

/** A link, line break or image of a run (texts and spans: marked). */
function inline(n, c) {
  if (n.nodeType === 'text' || n.nodeType === 'span') return marked([n], c);
  if (n.nodeType === 'line-break') return '<br>';
  if (n.nodeType === 'reference') return reference(n, c);
  const inner = marked(n.content, c);
  if (n.nodeType === 'link') {
    const href = linkOf(n.data && n.data.href, c);
    // spaces at the link's edges outside it (as at a mark's: no mark run into the next one)
    const [, lead, core, trail] = inner.match(/^(\s*)([\s\S]*?)(\s*)$/);
    return href && core ? `${lead}<a href="${attr(href)}">${core}</a>${trail}` : inner;
  }
  return inner;
}

const tidy = (h) => h.replace(/^(\s*<br>)+|(<br>\s*)+$/g, '').trim();

function cellOfTable(n, c) {
  return tidy(marked(n.content, c));
}

function tableRows(n) {
  const rows = [];
  const walk = (x) => {
    if (x.nodeType === 'table-row') rows.push(x);
    else (x.content || []).forEach(walk);
  };
  walk(n);
  return rows;
}

function table(n, c, mode) {
  const rows = tableRows(n).map((r) => (r.content || []).filter((x) => /^table-(data|head)$/.test(x.nodeType)));
  const head = rows.length && rows[0].length && rows[0].every((x) => x.nodeType === 'table-head');
  const cells = rows.map((r) => r.map((x) => cellOfTable(x, c))).filter((r) => r.some((x) => x.replace(/<[^>]+>/g, '').trim()));
  if (!cells.length) return '';
  if (mode === 'top') return blockHtml(head ? 'table-striped (header)' : 'table-striped', cells);
  return `<table><tbody>${cells.map((r, i) => `<tr>${r.map((x) => (head && i === 0 ? `<th>${x}</th>` : `<td>${x}</td>`)).join('')}</tr>`).join('')}</tbody></table>`;
}

function list(n, c) {
  const tag = n.nodeType === 'ordered-list' ? 'ol' : 'ul';
  const items = (n.content || []).map((li) => {
    const parts = [];
    let run = [];
    const flush = () => { const h = tidy(marked(run, c)); if (h) parts.push(h); run = []; };
    (li.content || []).forEach((x) => {
      if (INLINE.has(x.nodeType)) run.push(x);
      else if (x.nodeType === 'paragraph') run.push(...(run.length ? [{ nodeType: 'line-break' }] : []), ...(x.content || []));
      else { flush(); parts.push(flow([x], c, 'cell')); }
    });
    flush();
    return `<li>${parts.join('')}</li>`;
  });
  return `<${tag}>${items.join('')}</${tag}>`;
}

/**
 * The authoring convention for an empty line in a card's text (www draws a 24 px line for an empty
 * paragraph; R4-7): the marker paragraph {blank}, in a sub so the theme finds it (a card's text has
 * no sub of its own: cardRich drops www's sub- and superscript), one 24 px line, the word hidden.
 * Not an empty paragraph nor a no-break space's: the pipeline drops both (checked on aem.page); not
 * {spacer-24}: cards-teaser drops the emptied spacer.
 */
export const EMPTY_LINE = '<sub>{blank}</sub>';

/**
 * The last step of every TAP import (tap-import.mjs, tap-markets.mjs: they run no import bundle):
 * ema-test's marker collapse (marker-collapse.mjs, brand tap), gated as the bundles' (72026ccf):
 * until TAP's theme is live (scripts/style-markers.js THEMES.tap.live) the document comes back byte
 * for byte; forced (a site's pass) the {blank} line goes and tap.css's paragraph gap stands for it.
 * @param {string} html a document (div form)
 * @param {string} doc its path
 * @param {{force?: boolean}} [opts]
 */
export function collapseTap(html, doc, { force = false } = {}) {
  return collapseHtml(html, {
    path: doc, brand: 'tap', parse: parseHTML, force,
  }).html;
}

/** Block-level HTML of a node list; consecutive inline nodes become a paragraph. */
function flow(nodes, c, mode = 'top') {
  const out = [];
  let run = [];
  const close = () => { const h = tidy(marked(run, c)); if (h) out.push(`<p>${h}</p>`); run = []; };
  (nodes || []).forEach((n) => {
    if (!n || typeof n !== 'object') return;
    if (INLINE.has(n.nodeType)) { run.push(n); return; }
    close();
    if (n.nodeType === 'paragraph') {
      const p = tidy(marked(n.content, c));
      if (p.replace(/<br>/g, '').trim()) out.push(`<p>${p}</p>`);
      // a card's empty paragraph: www's empty 24 px line, the authoring convention's paragraph
      // (EMPTY_LINE; R4-7, brief 407)
      else if (c.emptyLines) out.push(`<p>${EMPTY_LINE}</p>`);
    } else if (n.nodeType === 'header') {
      const lv = Math.min(6, Math.max(2, Number(String(n.style || 'h3').replace(/\D/g, '')) || 3));
      const h = tidy(marked(n.content, c)).replace(/<\/?strong>/g, '');
      if (h) out.push(`<h${lv}>${h}</h${lv}>`);
    } else if (n.nodeType === 'unordered-list' || n.nodeType === 'ordered-list') out.push(list(n, c));
    else if (n.nodeType === 'table') out.push(table(n, c, mode));
    else if (n.content) out.push(flow(n.content, c, mode));
  });
  close();
  return out.join('');
}

/** AEM's rich text JSON (a node list, or {json: [...]}) as HTML; tables as table-striped at the top level. */
export function richText(v, c, mode = 'top') {
  const nodes = Array.isArray(v) ? v : (v && v.json) || null;
  if (nodes) return flow(nodes, c, mode);
  return v && v.plaintext ? `<p>${esc(v.plaintext.trim())}</p>` : '';
}

/* ------------------------------------------------------------------ the page ----------- */

/**
 * A document's text with no :name: the page decoration reads as an icon token (/icons/name.svg):
 * a word joiner after the colon keeps it text, as it reads (the cookie table's
 * inside:eu:IN-1000585, live-audit 35-42); tags and their attributes as they are.
 */
export const iconSafe = (html) => html.split(/(<[^>]*>)/)
  .map((x) => (x.startsWith('<') ? x : x.replace(/:(?=#?[a-z_-]+[a-z\d]*:)/gi, ':\u2060'))).join('');

export function blockHtml(name, rows) {
  const m = name.match(/^([a-z0-9-]+)(?: \(([^)]+)\))?$/);
  const classes = [m[1], ...(m[2] ? m[2].split(/,\s*/).map((o) => o.trim().replace(/\s+/g, '-')) : [])].join(' ');
  return `<div class="${classes}">${rows.map((r) => `<div>${r.map((x) => `<div>${x}</div>`).join('')}</div>`).join('')}</div>`;
}

/** The site's copy of a file by any of its keys: {eds} or {link: why it stays on the source}; null without one. */
function mediaOf(c, keys) {
  const m = keys.map((k) => c.media(k)).find(Boolean);
  if (!m) return null;
  return typeof m === 'string' ? { eds: m } : m;
}

class Page {
  constructor(c) {
    this.c = c;
    this.sections = [{ style: null, items: [] }];
    this.blocks = {};
    // shared with the rich text (its DAM references)
    this.missing = c.missing || new Set();
    c.missing = this.missing;
    this.linkedOut = new Set();
    this.generic = new Set();
    this.notes = [];
    this.fragments = [];
    this.h1 = false;
    this.cell = false;
    // the countries of the component being rendered (tap-markets.mjs), for its sections
    this.markets = null;
  }

  get current() { return this.sections[this.sections.length - 1]; }

  section(style = null) {
    if (this.cell) return;
    if (!this.current.items.length) {
      Object.assign(this.current, {
        style, markets: this.markets, tab: undefined, tabs: undefined,
      });
    } else this.sections.push({ style, items: [], markets: this.markets });
  }

  add(html) { if (html) this.current.items.push({ html }); }

  block(name, rows) {
    const r = rows.filter((x) => x.some((y) => y && String(y).trim()));
    if (!r.length) return;
    if (this.cell) { this.add(r.map((x) => x.join('')).join('')); return; }
    this.blocks[name] = (this.blocks[name] || 0) + 1;
    this.current.items.push({ html: blockHtml(name, r) });
  }

  heading(level, text) {
    const t = String(text || '').trim();
    if (!t) return '';
    let lv = level;
    if (lv === 1) { if (this.h1) lv = 2; else this.h1 = true; }
    return `<h${lv}>${esc(t)}</h${lv}>`;
  }

  rich(v, mode) { return richText(v, this.c, this.cell ? 'cell' : (mode || 'top')); }

  /** A card's description: www leaves out its sub- and superscript text (parity 97). */
  cardRich(v) { return richText(v, { ...this.c, dropSubSup: true, emptyLines: true }, this.cell ? 'cell' : 'top'); }

  link(url, label, kind) {
    const href = linkOf(url, this.c);
    if (!href || !label) return '';
    const a = `<a href="${attr(href)}">${esc(label)}</a>`;
    return `<p>${kind === 'primary' ? `<strong>${a}</strong>` : a}</p>`;
  }

  ctas(o, pre = 'primaryCta', sec = 'secondaryCta') {
    return `${this.link(o[`${pre}Url`], o[`${pre}Label`], 'primary')}${this.link(o[`${sec}Url`], o[`${sec}Label`])}`;
  }

  /**
   * A banner's picture cell: the picture, and with site.phonePictures www's phone rendition
   * (imageMobile, www's below 728 px) as a second picture where it is another file (parity 94;
   * hero-campaign and hero-card-overlay show it as the phone one since 137756ba: the CLIs pass
   * phonePictures, convertPage's default stays off).
   */
  pictures(ref, phoneRef) {
    const desk = this.img(ref);
    if (!this.c.phonePictures || !phoneRef || !desk) return desk;
    const phone = this.img(phoneRef);
    const src = (h) => (h.match(/src="([^"]*)"/) || [])[1];
    return phone && src(phone) !== src(desk) ? `${desk}${phone}` : desk;
  }

  img(ref) {
    if (!ref) return '';
    const keys = [ref._dynamicUrl && ref._dynamicUrl.split('?')[0], ref._path, ref._publishUrl].filter(Boolean);
    const local = mediaOf(this.c, keys);
    const alt = attr(altOf(ref.description || ref.title, this.c.lang));
    if (local && local.link) { this.notes.push(`${keys[0]}: ${local.link}`); return ''; }
    if (local) return `<img src="${attr(local.eds)}" alt="${alt}">`;
    const src = ref._dynamicUrl ? `${PIC}${ref._dynamicUrl}` : ref._publishUrl;
    if (!src) return '';
    this.missing.add(src);
    // without sourceImages (the CLI's default) an image without a local copy is left out: a
    // document naming www's image host would make the preview fetch it from there
    return this.c.sourceImages === false ? '' : `<img src="${attr(src)}" alt="${alt}">`;
  }

  /** A link to the page on www for one of its live widgets (reported). */
  onWww(type) {
    this.linkedOut.add(`${type}: ${docPath(this.c.url)}`);
    this.add(`<p><a href="${attr(`${WWW}${docPath(this.c.url)}`)}">${esc(labelsOf(this.c.lang).onWww)}</a></p>`);
  }
}

// the box's tab labels (TAP's keys), in the block's order: book, check-in, manage, status
const BOOKING_TABS = ['ibe.book-flight', 'ibe.to-check-in', 'ibe.my-travels', 'ibe.flight-status'];
// a market's airport when the page names no market list (the block's README: PT LIS, ES MAD …)
const MARKET_AIRPORT = {
  PT: 'LIS', ES: 'MAD', FR: 'PAR', DE: 'FRA', IT: 'FCO', PL: 'WAW', BR: 'SAO',
};

/** A text of www's translations (pageProps._nextI18Next: the language's namespaces), or null. */
function i18nOf(pp, lang, key) {
  // the language's store first, then the page's others (pt-br's texts are in its br store)
  const store = (pp._nextI18Next && pp._nextI18Next.initialI18nStore) || {};
  const stores = [store[lang], ...Object.values(store)].filter((ns) => ns && typeof ns === 'object');
  const hit = stores.flatMap((ns) => Object.values(ns)).find((n) => n && typeof n === 'object' && typeof n[key] === 'string');
  return hit ? hit[key] : null;
}

/**
 * The booking-box table (booking-spec.md 5.1): Format, Market and Language from the root,
 * Default origin the market's airport (pageProps.markets, else MARKET_AIRPORT), its name from the
 * airport sheet (c.booking.originName), the root's airport sheet, the four tabs, the corporate
 * link and one row per label: www's texts (its i18n store), else c.booking.labels
 * (tools/reports/tap/booking-labels.json).
 */
function bookingRows(P) {
  const { c } = P;
  const [lang, country] = c.locale.split('-');
  const market = country.toUpperCase();
  const pp = c.pageProps || {};
  const fromMarkets = (pp.markets || []).find((m) => m && String(m.code).toUpperCase() === market);
  const origin = (fromMarkets && fromMarkets.airport) || MARKET_AIRPORT[market] || '';
  const given = (c.booking && c.booking.labels) || {};
  const keys = Object.keys(given).filter((k) => !k.startsWith('_'));
  const text = (k) => i18nOf(pp, lang, k) || given[k] || '';
  const corporate = [].concat(given._corporate_link || ['https://tapforbiz.com/']).slice(-1)[0];
  const sheet = `/${c.locale}/booking/airports.json`;
  const rows = [['Format', 'tap'], ['Market', market], ['Language', lang]];
  if (origin) rows.push(['Default origin', origin]);
  const originName = c.booking && (c.booking.originName || (origin && c.booking.originNameOf && c.booking.originNameOf(origin)));
  if (originName) rows.push(['Default origin name', esc(originName)]);
  rows.push(['Airports', `<a href="${sheet}">${sheet}</a>`]);
  if (BOOKING_TABS.every(text)) rows.push(['Tabs', esc(BOOKING_TABS.map(text).join(', '))]);
  if (text('enterprise-reservation')) rows.push(['Corporate link', `<a href="${attr(corporate)}">${esc(text('enterprise-reservation'))}</a>`]);
  keys.filter((k) => !BOOKING_TABS.includes(k) && k !== 'enterprise-reservation' && text(k)).forEach((k) => rows.push([esc(k), esc(text(k))]));
  return rows;
}

// a destination slide (pl-pl's Fortaleza): www draws the destination's name and picture with its
// live fare and a booking link; as a slide: the name and picture, www's "book now" to the root's
// booking box, no fare (live fares stay on TAP, parity 48)
const slideOf = (s, P) => {
  if (s.__typename !== 'DestinationSlideModel') return s;
  const d = s.destination || {};
  return {
    title: s.title || d.title, image: d.image, buttonLabel: i18nOf(P.c.pageProps, P.c.lang, 'book-now'), buttonUrl: '#special-anchor-book-flight',
  };
};
// (a destination slide only with its picture: a root's destinations other than the captured ones
// have no copy, and a stage slide without its picture would show an empty frame)
const slideRows = (slides, P) => slides
  .filter((x) => x.__typename !== 'DestinationSlideModel' || P.img((x.destination || {}).image))
  .map((x) => slideOf(x, P)).flatMap((s) => [[P.pictures(s.image, s.imageMobile)], [
    `${P.heading(2, s.title)}${P.rich(s.description)}${P.link(s.buttonUrl, s.buttonLabel, 'primary')}${P.link(s.secondaryButtonUrl, s.secondaryButtonLabel)}`,
  ]]);

function cards(items, P, s) {
  const first = items[0] && items[0].__typename;
  if (first === 'SimpleGenericCardModel') {
    // www's text cards, so many to a row (itemsPerRow): cards with the option three-up / four-up
    // (tap.css lays them out so; cards keeps the buttons, cards-teaser would make them arrows)
    // (one a row: one-up, Wi-Fi's data packages, parity 98; two: two-up, the Schengen steps, 394)
    const up = {
      1: 'cards (one-up)', 2: 'cards (two-up)', 3: 'cards (three-up)', 4: 'cards (four-up)',
    }[s.itemsPerRow] || 'cards';
    P.block(up, items.map((x) => [`${x.icon ? P.img(x.icon) : ''}${P.heading(3, x.title)}${P.cardRich(x.description)}${P.ctas(x)}`]));
    return;
  }
  const rows = items.map((x) => {
    if (x.__typename === 'GenericCard2Model') {
      const links = (x.link || []).map((l) => `<li><a href="${attr(linkOf(l.url, P.c))}">${esc(l.label)}</a></li>`).join('');
      const cat = x.categoryUrl ? `<h3><a href="${attr(linkOf(x.categoryUrl, P.c))}">${esc(x.category || x.title)}</a></h3>` : P.heading(3, x.category || x.title);
      return [P.img(x.image), `${cat}${links ? `<ul>${links}</ul>` : ''}`];
    }
    const desc = x.genericCard1Description || x.genericCard2Description || x.description;
    return [P.img(x.image), `${x.category ? `<p>${esc(x.category)}</p>` : ''}${P.heading(3, x.title)}${P.cardRich(desc)}${x.date ? `<p>${esc(x.date)}</p>` : ''}${P.ctas(x)}`];
  });
  const carousel = s.desktopType === 'carousel';
  // www's desktop slider (the entertainment's news, a grid on phones): the option slider, one row
  // the theme scrolls from 1024 px (brief 394); www's phone swiper (mobileType slider: the promos'
  // News & Highlights, the Miles Store's lists): the option phone-slider, one card a view and a dot
  // each below 1025 px (cards-teaser-slider.js; brief 478)
  const opts = [{ 1: 'one-up', 3: 'three-up', 4: 'four-up' }[s.itemsPerRow], s.desktopType === 'slider' && 'slider', s.mobileType === 'slider' && 'phone-slider'].filter(Boolean);
  P.block(carousel ? 'carousel-cards' : `cards-teaser${opts.length ? ` (${opts.join(', ')})` : ''}`, rows);
}

/**
 * A comparison table's parts (ComponentTableModel): rows (the header: an empty corner and the
 * columns' headings, then a row per row title, its values; a row of the columns' buttons where
 * there are), www's legend of the marks (a list) where a value is one, its notes, and the legend's
 * and notes' headings in www's texts (the common store).
 * - a row title or value "text|note": the text and the note in italics after a line break;
 * - a value "[yes]" www's check (✓), "[no]" its cross (✕) (parity 95);
 * - a column's heading with its description (the Club's price) and tooltip under it (parity 96).
 */
function tableParts(s, P) {
  const cols = s.columns || [];
  const noted = (text, note) => `${text}${note && note.trim() ? `<br><em>${esc(note.trim())}</em>` : ''}`;
  const mark = { '[yes]': '✓', '[no]': '✕' };
  const titles = (s.rowTitles || []).map((t) => { const [title, note] = String(t).split('|'); return noted(esc(title.trim()), note); });
  const cellOf = (v) => { const [value, note] = String(v ?? '').split('|'); const t = value.trim(); return noted(mark[t] || esc(t), note); };
  const headOf = (c) => {
    const desc = plainOf(c.tableColumnDescription);
    return noted(`${esc(c.heading)}${desc && desc.trim() ? `<br>${esc(desc.trim())}` : ''}`, c.tooltip && String(c.tooltip));
  };
  const rows = [['', ...cols.map(headOf)], ...titles.map((t, i) => [t, ...cols.map((c) => cellOf((c.items || [])[i]))])];
  const ctas = cols.map((c) => P.link(c.ctaUrl, c.ctaLabel, 'primary').replace(/^<p>|<\/p>$/g, ''));
  if (ctas.some(Boolean)) rows.push(['', ...ctas]);
  const t = (k, d) => i18nOf(P.c.pageProps, P.c.lang, k) || d;
  const marks = cols.some((c) => (c.items || []).some((v) => mark[String(v).split('|')[0].trim()]));
  return {
    rows,
    legend: marks ? `<ul><li>✓ ${esc(t('service-included', 'Serviço incluído'))}</li><li>✕ ${esc(t('service-not-included', 'Serviço não incluído'))}</li></ul>` : '',
    notes: P.rich(s.tableComplementaryNotes),
    labels: { caption: t('caption', 'Legenda'), notes: t('notes', 'Notas') },
  };
}

const HANDLERS = {
  ComponentSliderHomepageModel: (s, P) => {
    // no H1 of its own: www's homepage H1 is the card list's title ("Planeie a sua viagem ao
    // detalhe", 145 of 145 homepages; parity 85)
    P.section();
    const slides = s.slides || [];
    P.block(slides.length > 1 ? 'hero-campaign (slider)' : 'hero-campaign', slideRows(slides, P));
    // where www has its booking box: the booking-box block in a section of its own right after
    // the stage (booking-spec.md 5.1, 5.4)
    P.section();
    P.block('booking-box', bookingRows(P));
    P.section();
  },
  ComponentBannerCarouselModel: (s, P) => {
    const slides = s.slides || [];
    P.section();
    // one slide the slider too: www draws it as several, without the controls (fr-fr, de-de, es-es
    // miles-and-go: 1,176 x 404 with the wedge; hero-campaign-tap.js hero-campaign-single; brief 480)
    P.block('hero-campaign (slider, narrow)', slideRows(slides, P));
    P.section();
  },
  ComponentHeroCardModel: (s, P, i) => {
    // its title an H3, as www's (43 of 43)
    const text = `${P.heading(3, s.title)}${P.rich(s.heroCardDescription)}${P.ctas(s)}`;
    // a banner with a picture only (bagagem, info-legal): the page's first one a one-row narrow
    // banner of both pictures, so the phone shows www's phone picture (brief 488; the narrow
    // banner sits where www's picture does: 305 px from 1024 px, 380 on phones, the title 64 / 32
    // px under it); a later one the picture in the content, as before
    if (!text.trim()) {
      const pics = i === 0 ? P.pictures(s.image, s.imageMobile) : '';
      if (pics) {
        P.section();
        P.block('hero-campaign (narrow)', [[pics]]);
        P.section();
        return;
      }
      const im = P.img(s.image);
      if (im) P.add(`<p>${im}</p>`);
      return;
    }
    P.section();
    P.block(i === 0 ? 'hero-campaign (narrow)' : 'hero-card-overlay', [[P.pictures(s.image, s.imageMobile)], [text]]);
    P.section();
  },
  ComponentHeadingModel: (s, P) => {
    if (s.lead) P.add(`<p>${esc(s.lead)}</p>`);
    P.add(P.heading(P.h1 ? 2 : 1, s.title));
    P.add(P.rich(s.headingDescription));
  },
  ComponentHeadingSectionModel: (s, P) => {
    if (s.lead) P.add(`<p>${esc(s.lead)}</p>`);
    P.add(P.heading(2, s.title));
    const desc = P.rich(s.headingSectionDescription);
    P.add(desc);
    // a heading with its description (TAP row 139): www's description 16 px under the heading and the next
    // component 32 px under it; the heading and the description end their section, style heading-section
    // (tap.css), so the next component starts a section. Not in a block cell or a tab's section (its Tab rows)
    if (desc && desc.replace(/<[^>]+>/g, '').trim() && !P.cell && !P.current.tab) {
      P.current.style = [P.current.style, 'heading-section'].filter(Boolean).join(', ');
      P.section();
    }
  },
  ComponentRichTextBlockModel: (s, P) => {
    P.add(P.rich(s.richTextContent));
    // www centres a rich text's button under the text (every one: stopover's "Book now", the
    // refunds' and the fares' ones): a section of its own, style centred-button (parity 44)
    const ctas = P.ctas(s, 'cta', 'secondaryCta');
    if (ctas && !P.cell) {
      P.section('centred-button');
      P.add(ctas);
      P.section();
    } else P.add(ctas);
  },
  ComponentAccordionItemsListModel: (s, P) => {
    P.add(P.heading(2, s.title));
    if (s.subtitle) P.add(`<p>${esc(s.subtitle)}</p>`);
    P.add(P.rich(s.accordionItemsListDescription));
    P.block('accordion-columns (faq)', (s.items || []).map((x) => [esc(x.label), `${richText(x.accordionItemDescription, P.c, 'cell')}${nested(x.sections, P)}`]));
    P.add(P.link(s.ctaUrl, s.ctaLabel, 'primary'));
  },
  ComponentCategoryAccordionModel: (s, P) => {
    // a page imported with fragments (the inspiration pages, brief 488): an item's article (its
    // sections: rich text, feature cards, the card lists www swipes on phones) a fragment document
    // of its own, /<locale>/fragments/<page>/<article>, written once however many categories hold
    // it; the item's panel names it, its path as code (not a link: scripts.js loads every
    // /fragments/ link of a page at once), and accordion-columns-tap.js loads it when it opens
    const fragBase = `/${P.c.locale}/fragments/${docPath(P.c.url).split('/').pop()}`;
    const plain = (t) => slugOf(t).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const taken = new Set((s.categories || []).map((cat) => plain(cat.label)));
    P.articles = P.articles || new Map();
    const articleDoc = (x) => {
      const key = x._path || x.question;
      if (P.articles.has(key)) return P.articles.get(key);
      let slug = plain(String(x._path || '').split('/').pop() || x.question);
      if (taken.has(slug)) slug = `${slug}-article`;
      const doc = `${fragBase}/${slug}`;
      P.articles.set(key, doc);
      P.fragments.push({ doc, html: standalone(x.sections, P) });
      return doc;
    };
    const item = (x) => {
      if (P.c.fragments && (x.sections || []).length) {
        const doc = articleDoc(x);
        return [esc(x.question), `${richText(x.answer, P.c, 'cell')}<p><code>${esc(doc)}</code></p>${P.link(x.ctaUrl, x.ctaLabel)}`];
      }
      return [esc(x.question), `${richText(x.answer, P.c, 'cell')}${nested(x.sections, P)}${P.link(x.ctaUrl, x.ctaLabel)}`];
    };
    const subs = (cat) => (cat.subCategories || []).map((sub) => `${P.heading(3, sub.label)}${blockHtml('accordion-columns (faq)', (sub.items || []).map(item))}`).join('');
    // each category a tab (TAP row 134; www's chips over one category at a time): a section of its
    // own with the section metadata Tab (its label) and Tabs (the set), scripts/section-tabs.js
    const tabbed = !P.cell && (s.categories || []).length > 1;
    (s.categories || []).forEach((cat) => {
      if (tabbed) {
        P.section();
        Object.assign(P.current, { tab: cat.label, tabs: 'categories' });
      }
      P.add(P.heading(2, cat.label));
      // a page over the content bus's limits (c.fragments; 1 MB, 200 images a document): the
      // category's accordions fragment documents of the locale (/<locale>/fragments/<page>/
      // <category>, -2, -3 … each within c.fragmentLimits), the page a fragment block each
      if (P.c.fragments) {
        const L = { bytes: 900 * 1024, images: 180, ...P.c.fragmentLimits };
        const fits = (h) => Buffer.byteLength(h) <= L.bytes && (h.match(/<img /g) || []).length <= L.images;
        // units: a subcategory's heading and accordion, its items split where one would not fit
        const units = [];
        (cat.subCategories || []).forEach((sub) => {
          let cur = [];
          let first = true;
          const unit = (rows) => `${first ? P.heading(3, sub.label) : ''}${blockHtml('accordion-columns (faq)', rows)}`;
          const flush = () => { if (cur.length) { units.push(unit(cur)); first = false; cur = []; } };
          (sub.items || []).map(item).forEach((r) => {
            if (cur.length && !fits(unit([...cur, r]))) flush();
            cur.push(r);
          });
          flush();
        });
        const chunks = [];
        units.forEach((u) => {
          if (chunks.length && fits(chunks[chunks.length - 1] + u)) chunks[chunks.length - 1] += u;
          else chunks.push(u);
        });
        const base = `/${P.c.locale}/fragments/${docPath(P.c.url).split('/').pop()}/${slugOf(cat.label).normalize('NFD').replace(/[̀-ͯ]/g, '')}`;
        chunks.forEach((h, i) => {
          const doc = i ? `${base}-${i + 1}` : base;
          P.fragments.push({ doc, html: `<div>${h}</div>\n` });
          P.block('fragment', [[`<a href="${attr(doc)}">${esc(doc)}</a>`]]);
        });
        return;
      }
      P.blocks['accordion-columns (faq)'] = (P.blocks['accordion-columns (faq)'] || 0) + (cat.subCategories || []).length;
      P.add(subs(cat));
    });
    if (tabbed) P.section();
  },
  ComponentGenericCardListModel: (s, P) => {
    // www renders no card list's title (the meals' "To pre-choose your meal, follow the steps
    // below.": in the page's data only, live-audit 154)
    if (s.subtitle) P.add(`<p>${esc(s.subtitle)}</p>`);
    cards(s.items || [], P, s);
  },
  ComponentClientNeedsCardListModel: (s, P) => {
    // the homepage's H1 (www's), else an H2
    P.add(P.heading(P.h1 ? 2 : 1, s.title));
    P.add(P.rich(s.clientNeedsCardListDescription));
    P.block('carousel-cards', (s.cards || []).map((x) => [P.img(x.image), `<h3><a href="${attr(linkOf(x.url, P.c))}">${esc(x.title)}</a></h3>`]));
  },
  ComponentAuxiliaryCarouselModel: (s, P) => {
    P.block('cards-icon', (s.items || []).map((x) => [P.img(x.icon), `<p><a href="${attr(linkOf(x.url, P.c))}">${esc(x.label)}</a></p>`]));
  },
  ComponentMiles_GoCardListModel: (s, P) => {
    const all = s.milesAndGoCards || [];
    const page = (P.c.pageProps && P.c.pageProps.page) || {};
    if (page.__typename === 'HomepageModel' && !P.cell) {
      // the homepage: www's stacked cards (lower-home.md), all four a visitor sees, one row each:
      // the logo picture, the h2 title, the subtitle an h2 too (www's, parity 85), the description, the button (the
      // first card's bold italic, the others' italic), a second link plain; the photo beside it
      // (www shows no extrainfo)
      const link = (url, label, wrap) => {
        const href = linkOf(url, P.c);
        return href && label ? `<p>${wrap(`<a href="${attr(href)}">${esc(label)}</a>`)}</p>` : '';
      };
      P.block('columns-media (stack)', all.map((x, i) => {
        const logo = P.img(x.logo);
        const cta = link(x.primaryCtaUrl, x.primaryCtaLabel, (a) => (i === 0 ? `<em><strong>${a}</strong></em>` : `<em>${a}</em>`));
        return [
          `${logo ? `<p>${logo}</p>` : ''}${P.heading(2, x.title)}${x.subtitle ? P.heading(2, x.subtitle) : ''}${P.rich(x.milesAndGoCardDescription)}${cta}${link(x.secondaryCtaUrl, x.secondaryCtaLabel, (a) => a)}`,
          P.img(x.image),
        ];
      }));
      return;
    }
    // elsewhere: the card of the visitor's state, a visitor (no account) the first (type 1); the
    // logo (a small wordmark over the title) left out; www's same panel as the homepage's
    // (economy-prime's "Lugar do Lado Livre", R4-6, brief 394): columns-media (stack), the second
    // line an H2, the button bold italic as the homepage's first card's
    const visitor = all.filter((x) => String(x.type) === '1');
    const link = (url, label, wrap) => {
      const href = linkOf(url, P.c);
      return href && label ? `<p>${wrap(`<a href="${attr(href)}">${esc(label)}</a>`)}</p>` : '';
    };
    P.block('columns-media (stack)', (visitor.length ? visitor : all.slice(0, 1)).map((x) => [
      `${P.heading(2, x.title)}${x.subtitle ? P.heading(2, x.subtitle) : ''}${P.rich(x.milesAndGoCardDescription)}${link(x.primaryCtaUrl, x.primaryCtaLabel, (a) => `<em><strong>${a}</strong></em>`)}${link(x.secondaryCtaUrl, x.secondaryCtaLabel, (a) => a)}${P.rich(x.extrainfo)}`,
      P.img(x.image),
    ]));
  },
  ComponentFeatureCardModel: (s, P) => {
    // its title an H3, as www's (330 of 331; the theme's TAP H3, parity 60)
    const text = `${P.heading(3, s.title)}${P.cardRich(s.featureCardDescription)}${P.link(s.ctaUrl, s.ctaLabel, 'primary')}`;
    // www's size: large (536 x 275, the chevron frame) the option feature, default (260 x 180)
    // feature-small; the theme lays them out (brief 394)
    const size = s.size === 'large' ? 'feature' : 'feature-small';
    // the footnote (complementaryNote): www's small print under the card's two columns (TAP row
    // 133), the card's second row of one text cell (the theme draws it, tap.css)
    const note = P.cardRich(s.complementaryNote);
    const hasNote = !!note && !!note.replace(/<[^>]+>/g, '').replace(/&nbsp;|\s/g, '');
    P.block(`columns-media (${size})`, [s.switchImageToRight ? [text, P.img(s.image)] : [P.img(s.image), text], ...(hasNote ? [[note]] : [])]);
  },
  ComponentInfoSectionModel: (s, P) => {
    // www: a picture beside an accordion of link groups; the picture, then the accordion
    P.add(P.heading(2, s.title));
    const im = P.img(s.image);
    if (im) P.add(`<p>${im}</p>`);
    P.block('accordion-columns (faq)', (s.infoList || []).map((x) => [esc(x.label), richText(x.infodescription, P.c, 'cell')]));
  },
  ComponentMilesStatusCardListModel: (s, P) => {
    P.block('cards', (s.cards || []).map((x) => [P.img(x.logo), `${P.heading(3, x.title)}${(x.topics || []).length ? `<ul>${x.topics.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}${x.link ? P.link(x.link.url, x.link.label) : ''}`]));
  },
  ComponentLinkListModel: (s, P) => {
    P.add(P.heading(2, s.title));
    const links = (s.linkList || []).filter((l) => l.url && l.label);
    const items = links.map((l) => `<li><a href="${attr(linkOf(l.url, P.c))}">${esc(l.label)}</a></li>`).join('');
    if (links.length && links.every((l) => l.url.startsWith('#'))) P.block('jump-links', [[`<ul>${items}</ul>`]]);
    // links to pages: www's grid of tiles (a label and a chevron each): cards-icon, one tile a link
    else if (links.length) P.block('cards-icon', links.map((l) => [`<p><a href="${attr(linkOf(l.url, P.c))}">${esc(l.label)}</a></p>`]));
  },
  // www's info alert: ema-test's info-alert block in a section of its own (parity 63), one cell:
  // its title an H4 (www's, 130 of 130), its text and link
  ComponentInfoBlockModel: (s, P) => {
    const cell = `${P.heading(4, s.title)}${P.rich(s.message)}${P.link(s.ctaUrl, s.ctaLabel)}`;
    if (!cell.trim()) return;
    if (P.cell) { P.add(cell); return; }
    P.section();
    // (www's without a close button where it is not dismissable: the option static)
    P.block(s.dismissable === false ? 'info-alert (static)' : 'info-alert', [[cell]]);
    P.section();
  },
  ComponentCardInfoBlockModel: (s, P) => {
    // www's teaser card (stopover's FAQ: a light card with a green edge): a section of its own,
    // style info-card (parity 43)
    P.section('info-card');
    // its title a line of bold text, no heading (www's a span, live-audit 154, 171)
    if (s.title && String(s.title).trim()) P.add(`<p><strong>${esc(String(s.title).trim())}</strong></p>`);
    P.add(P.rich(s.cardInfoBlockDescription));
    P.add(P.ctas(s));
    P.section();
  },
  ComponentBannerVideoModel: (s, P) => {
    if (s.youtubeUrl) {
      // www's banner (R4-9, brief 407): the TAP block video-banner, www's poster (when it has one)
      // in the first cell, the title an H3 (www's) and the play link in www's text (watch-video)
      // in the second; YouTube loads on play
      const poster = P.img(s.backgroundImage);
      const play = i18nOf(P.c.pageProps, P.c.lang, 'watch-video') || labelsOf(P.c.lang).video;
      const text = `${P.heading(3, s.title)}<p><a href="${attr(s.youtubeUrl)}">${esc(play)}</a></p>`;
      P.section();
      P.block('video-banner', [poster ? [poster, text] : [text]]);
      P.section();
      return;
    }
    const v = s.video || {};
    const keys = [v._path, v._publishUrl, v._authorUrl && v._authorUrl.replace(/^https:\/\/author-/, 'https://publish-')].filter(Boolean);
    const local = mediaOf(P.c, keys);
    const src = local && !local.link ? local.eds : (v._publishUrl || (v._authorUrl || '').replace(/^https:\/\/author-/, 'https://publish-'));
    if (!local) P.missing.add(src);
    if (local && local.link) P.notes.push(`${src}: ${local.link}`);
    const label = s.buttonLabel || labelsOf(P.c.lang).video;
    // www: the video in a rounded frame, its title over it (parity 42): hero-card-overlay, the
    // poster and the local mp4 (the block plays it over the poster); without a local copy the
    // poster only, nothing from TAP's AEM host
    const href = local && !local.link ? local.eds : '';
    P.section();
    // (its title an H3, as www's: 14 of 14)
    P.block('hero-card-overlay', [[P.img(s.backgroundImage)], [`${P.heading(3, s.title)}${P.rich(s.bannerVideoDescription)}${s.bannerVideoCaption ? `<p>${esc(plainOf(s.bannerVideoCaption))}</p>` : ''}${href ? `<p><a href="${attr(href)}">${esc(label)}</a></p>` : ''}`]]);
    P.section();
  },
  ComponentYoutubeVideoModel: (s, P) => {
    const u = s.youtubeUrl || s.url || s.videoUrl;
    if (u) P.block('embed', [[`<a href="${attr(u)}">${esc(s.title || u)}</a>`]]);
  },
  ComponentTableModel: (s, P) => {
    // www's comparison table: in a panel a table, at the top table-striped (header; matrix when
    // wide), then www's legend of the marks and its notes, each under its H2
    const x = tableParts(s, P);
    if (P.cell) {
      P.add(`<table><tbody>${x.rows.map((r, i) => `<tr>${r.map((c) => (i === 0 ? `<th>${c}</th>` : `<td>${c}</td>`)).join('')}</tr>`).join('')}</tbody></table>`);
    } else {
      P.block((s.columns || []).length > 3 ? 'table-striped (header, matrix)' : 'table-striped (header)', x.rows);
    }
    if (x.legend) P.add(`${P.heading(2, x.labels.caption)}${x.legend}`);
    if (x.notes) P.add(`${x.legend ? P.heading(2, x.labels.notes) : ''}${x.notes}`);
  },
  ComponentTabsItemsListModel: (s, P) => {
    const tabs = s.tabs || [];
    const fares = tabs.length && tabs.every((t) => (t.tabsItems || []).length
      && t.tabsItems.every((i) => (i.sections || []).length === 1 && i.sections[0].__typename === 'ComponentTableModel'));
    if (fares && !P.cell) {
      // the fare pages (route groups of cabins, a table each): ema-adobe's fare-comparison
      // (blocks/fare-comparison/README.md, parity 99): its label rows, a Group a route group, a
      // Cabin a tab, its header and service rows, its Caption and Notes; the groups' H2s the block's
      const { labels } = tableParts({}, P);
      const rows = [['Caption label', esc(labels.caption)], ['Notes label', esc(labels.notes)]];
      // the block's other texts in www's of the page (its common store; pl-pl, which the block
      // has no texts for, round 4), a row only where www has the text
      [['Compare label', 'fare-compare'], ['Dialog note', 'max-element-to-compare'], ['Clear label', 'clean'], ['Apply label', 'compare'],
        ['Services label', 'services'], ['Previous label', 'previous'], ['Next label', 'next']].forEach(([row, key]) => {
        const v = i18nOf(P.c.pageProps, P.c.lang, key);
        if (v) rows.push([row, esc(v)]);
      });
      tabs.forEach((t) => {
        rows.push(['Group', esc(t.fieldLabel)]);
        t.tabsItems.forEach((i) => {
          const x = tableParts(i.sections[0], P);
          rows.push(['Cabin', esc(i.label)], ...x.rows);
          if (x.legend) rows.push(['Caption', x.legend]);
          if (x.notes) rows.push(['Notes', x.notes]);
        });
      });
      P.block('fare-comparison', rows);
      return;
    }
    // tabs in tabs (route group, cabin): a heading per group, its items as accordion-columns
    // (tabs), each item's components in its panel
    tabs.forEach((t) => {
      P.add(P.heading(2, t.fieldLabel));
      P.block('accordion-columns (tabs)', (t.tabsItems || []).map((x) => [esc(x.label), `${P.rich(x.description)}${nested(x.sections, P)}`]));
    });
  },
  ComponentMiles_GoCardModel: (s, P) => HANDLERS.ComponentMiles_GoCardListModel({ milesAndGoCards: [s] }, P),
  ComponentTrackBagaggeModel: (s, P) => { P.add(P.heading(2, s.title)); P.onWww('TrackBagagge (the baggage tracking form)'); },
  // the destinations map (mapa-destinos): the poi-map block on ema-test's sheet of the language
  // version (/<version>/destinations/destinations-map.json in every version; a root's document
  // its version's), before it Smartvel's grid of the same widget (Explore&Go) as ema-test's
  // destination-grid on the version's /<version>/destinations/destination-grid.json (parity 84),
  // each a section of its own; the other widgets (Luggit's baggage tracker) link www
  ComponentWidgetFreeBlockModel: (s, P) => {
    if (!/\/components\/destinos\/mapa-destinos/.test(s._path || '')) { P.onWww('WidgetFreeBlock (Luggit\'s baggage tracker)'); return; }
    const version = P.c.version || P.c.locale;
    P.section();
    P.block('destination-grid', [['Source', `/${version}/destinations/destination-grid.json`]]);
    P.section();
    P.block('poi-map', [['Source', `/${version}/destinations/destinations-map.json`]]);
    P.section();
  },
  // the contacts by country (parity 40, 54): ema-test's hotline-finder on the language version's
  // sheet (/<version>/help/contacts.json, a root's document its version's; the block picks the
  // market's country) and www's picture (its alt empty, as www's)
  ComponentContactsByCountryModel: (s, P) => {
    P.add(P.heading(2, s.title));
    const im = P.img(s.image);
    P.block('hotline-finder', [['Sheet', `/${P.c.version || P.c.locale}/help/contacts.json`], ...(im ? [['Image', im]] : [])]);
  },
  // CoreMedia's call-back card (BySide's widget; the page's data holds its type only): ema-test's
  // click-to-call (its README's rows) from the captured card of the type in the page's version
  // (site.clickToCall: tools/importer/tap-click-to-call.json, the capture tap-byside-001; the
  // version's own, else its language's), its button to the same page on www (parity 66). A page
  // www shows no card on (the version's noCard, or outside the card's pages): nothing; without a
  // captured card the link to www, as before
  ComponentCoreMediaModel: (s, P) => {
    const byVersion = (P.c.clickToCall || {})[s.type] || {};
    const own = docPath(P.c.url);
    const card = byVersion[P.c.locale] || byVersion[P.c.lang];
    if (card && ((card.noCard || []).includes(own) || (card.pages && !card.pages.includes(own)))) return;
    if (!card || !card.title) { P.onWww(`CoreMedia (${s.type})`); return; }
    // the wide picture is the card's background on www (no alt), the phone one an img with its alt
    const pic = (url, alt = '') => (url ? P.img({ _path: url, description: alt }) : '');
    const page = `${WWW}${docPath(P.c.url)}`;
    const html = (v) => bysideHtml(v, P.c);
    const rows = [
      ['Title', html(card.title)],
      ['Text', card.text ? `<p>${html(card.text)}</p>` : ''],
      ['Schedule', html(card.schedule)],
      ['Hours', esc(card.hours || '')],
      ['Button', esc(card.button || '')],
      ['Button outside hours', esc(card.buttonOutside || '')],
      ['Phone', esc(card.phone || '')],
      ['Days', esc((card.days || []).join(', '))],
      ['Slots', esc(card.slots || '')],
      ['Small print', card.smallPrint ? `<p>${html(card.smallPrint)}</p>` : ''],
      ['Image', pic(card.image)],
      ['Mobile image', pic(card.mobileImage, card.alt || '')],
      ['Floating button', (card.floating || []).filter(Boolean).map((t) => `<p>${esc(t)}</p>`).join('')],
      ['Link', `<a href="${attr(page)}">${esc(page)}</a>`],
    ].filter(([, v]) => v);
    P.section();
    P.block('click-to-call', rows);
    P.section();
  },
  ComponentAnchorModel: () => {},
  // tap-markets.mjs: in place of a market's variant that no capture holds, the page on www
  MarketVariantOnWww: (s, P) => P.onWww('a market variant no capture holds (tap-markets.mjs)'),
};

/** Generic: a component's titles, texts, images and links in order (reported). */
function generic(s, P) {
  P.generic.add(s.__typename);
  Object.entries(s).forEach(([k, v]) => {
    if (/^(__typename|_.*|id|template|variant|containerSize|textAlign|size)$/.test(k) || v == null) return;
    if (typeof v === 'string' && /^(title|label|name|heading)$/.test(k)) P.add(P.heading(3, v));
    else if (v && typeof v === 'object' && (v.json || v.plaintext)) P.add(P.rich(v));
    else if (v && v.__typename === 'ImageRef') P.add(`<p>${P.img(v)}</p>`);
    else if (Array.isArray(v)) v.forEach((x) => { if (x && x.__typename) render(x, P); });
  });
  const ctas = P.ctas(s);
  if (ctas) P.add(ctas);
}

function render(s, P, i) {
  const h = HANDLERS[s.__typename];
  if (h) h(s, P, i); else generic(s, P);
}

/** Components nested in an accordion item, as cell content (blocks flattened). */
/**
 * Sections rendered as a document of their own (an inspiration article's fragment, brief 488):
 * blocks as on a page (no cell), a section each where the components start one, no metadata.
 */
function standalone(secs, P) {
  const saved = P.sections;
  const savedCell = P.cell;
  const savedFragments = P.c.fragments;
  P.sections = [{ style: null, items: [] }];
  P.cell = false;
  P.c.fragments = false;
  // not the page's first component (a picture-only hero card stays a picture)
  (secs || []).forEach((x, k) => render(x, P, k + 1));
  const out = P.sections.filter((x) => x.items.length).map((x) => {
    const sm = x.style ? blockHtml('section-metadata', [['Style', x.style]]) : '';
    return `<div>${x.items.map((it) => it.html).join('')}${sm}</div>`;
  }).join('\n');
  P.sections = saved;
  P.cell = savedCell;
  P.c.fragments = savedFragments;
  return `${out}\n`;
}

function nested(secs, P) {
  if (!(secs || []).length) return '';
  const saved = P.sections;
  const savedCell = P.cell;
  P.sections = [{ style: null, items: [] }];
  P.cell = true;
  secs.forEach((x) => render(x, P));
  const html = P.sections.flatMap((x) => x.items).map((x) => x.html).join('');
  P.sections = saved;
  P.cell = savedCell;
  return html;
}

/**
 * Converts one page's __NEXT_DATA__ to the document's HTML: { html, report } or { skipped }.
 * @param {object} nd the page's __NEXT_DATA__
 * @param {{url: string, lang?: string, locale?: string, version?: string, scope: Set<string>,
 *   media: (key: string) => (string|{eds?: string, link?: string}|null),
 *   anchors?: Map<string, Map<string, string>>, siteName?: string,
 *   units?: (page: object, pageProps: object) => object[]}} site (units: tap-markets.mjs)
 */
export function convertPage(nd, site) {
  const locale = site.locale || localeOf(site.url);
  const c = { anchors: new Map(), siteName: 'TAP Air Portugal', ...site };
  c.locale = locale;
  c.lang = site.lang || langOf(locale);
  const pp = (nd.props && nd.props.pageProps) || {};
  c.pageProps = pp;
  const page = pp.page || {};
  if (OUT_TEMPLATES[page.template]) return { skipped: OUT_TEMPLATES[page.template] };
  const P = new Page(c);
  // site.units (tap-markets.mjs): the components with the countries of those behind a rule
  // (__markets), each a section of its own; the variants of one component each keep its H1
  const secs = site.units ? site.units(page, pp) : [...(page.topSections || []), ...(page.sections || [])];
  // www's extra link strip under the alerts bar, above the header, on the root homepage only
  // (pageProps.extraAlert: pt-pt, en-pt "Intermediação de Crédito", fr-fr "Droits des passagers"):
  // a first section of style extra-alert, a columns block of the message (a link) and its pill
  // (a secondary button), before the stage (the header floats in the stage below it)
  if (page.__typename === 'HomepageModel') {
    (pp.extraAlert || []).filter((x) => x && x.messageCta && x.messageCtaUrl).forEach((x) => {
      const cells = [`<p><a href="${attr(linkOf(x.messageCtaUrl, c))}">${esc(x.messageCta)}</a></p>`];
      if (x.extraAlertCtaLabel) cells.push(`<p><em><a href="${attr(linkOf(x.extraAlertCtaUrl || x.messageCtaUrl, c))}">${esc(x.extraAlertCtaLabel)}</a></em></p>`);
      P.section('extra-alert');
      P.block('columns', [cells]);
      P.section();
    });
  }
  if (page.slider) render(page.slider, P, -1);
  let h1Before = P.h1;
  secs.forEach((s, i) => {
    if (s.__markets || P.markets) {
      if (s.__markets && P.markets && s._path === (secs[i - 1] || {})._path) P.h1 = h1Before;
      else h1Before = P.h1;
      P.markets = s.__markets || null;
      P.section();
    }
    render(s, P, page.slider ? i + 1 : i);
  });
  // the alerts page: in place of www's alerts list as captured (dynamicData), the message-center
  // block, which shows the current alerts of lh-tap's Message Center (tenant tap) and opens #<id>
  // from the alerts bar's links (tools/reports/tap/alerts-spec.md 5)
  if (page.template === 'alerts') P.block('message-center', [['Types', 'irreg, tech-outage']]);
  let docs = P.sections.filter((s) => s.items.length);
  if (!docs.length) return { skipped: `no content (template ${page.template || page.__typename})` };
  if (!P.h1) {
    const title = page.title || String(page.seoTitle || '').replace(/\s*\|\s*TAP Air Portugal\s*$/, '');
    // the page's first heading its title (www shows no H1, only that H2: localizar-equipaje,
    // flight-passes, live-audit 158, 168): that heading the H1, not a second copy above it
    // (not in a market section: every market's view keeps one H1)
    const sec = docs.find((s) => s.items.some((x) => /<h[1-6][ >]/.test(x.html)));
    const first = sec && !sec.markets && sec.items.find((x) => /<h[1-6][ >]/.test(x.html));
    const m = first && first.html.match(/<h([2-6])>([\s\S]*?)<\/h\1>/);
    const plain = (h) => h.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
    if (m && first.html.indexOf(m[0]) === first.html.search(/<h[1-6][ >]/) && plain(m[2]) === plain(esc(title))) {
      first.html = first.html.replace(m[0], `<h1>${m[2]}</h1>`);
      P.notes.push('no H1 on the page: its first heading, the title, the H1');
    } else {
      if (docs[0].markets) docs.unshift({ style: null, items: [] });
      docs[0].items.unshift({ html: `<h1>${esc(title)}</h1>` });
      P.notes.push('no heading on the page: H1 from its title');
    }
  }
  const meta = [['Title', esc(page.seoTitle || page.title || '')]];
  const desc = plainOf(page.seoDescription);
  if (desc) meta.push(['Description', esc(desc.trim())]);
  if (page.seoImage) { const im = P.img(page.seoImage); if (im) meta.push(['Image', im]); }
  if (page.seoIndexablePage === false) meta.push(['Robots', 'noindex, follow']);
  // the page's counterparts in the site's other roots (www's hrefLangs) that are documents of the
  // site: Alternate <ll>-<cc> per root; Alternate <lang>, which the header's language switch reads
  // (blocks/header, site-languages.js), only for the root the switch has for that language (pt:
  // pt-pt, not pt-br)
  (page.hrefLangs || []).forEach((h) => {
    const p = h && h.url ? docPath(h.url) : '';
    const m = p.match(/^\/([a-z]{2})-([a-z]{2})(?:\/|$)/);
    const r = m && `${m[1]}-${m[2]}`;
    if (!m || r === locale || !c.scope.has(p)) return;
    if (SWITCH_ROOT[m[1]] === r && !meta.some(([k]) => k === `Alternate ${m[1]}`)) meta.push([`Alternate ${m[1]}`, esc(p)]);
    if (!meta.some(([k]) => k === `Alternate ${r}`)) meta.push([`Alternate ${r}`, esc(p)]);
  });
  // breadcrumbs (www: home, the ancestors, the page): Parent the nearest ancestor that is a page
  // of the site, else the homepage; the page's crumb its title (blocks/breadcrumb)
  if (page.__typename !== 'HomepageModel') {
    const ancestors = (pp.breadcrumbs || []).map((b) => linkOf(b.url, c)).filter((u) => u.startsWith('/'));
    meta.push(['Parent', esc(ancestors.length ? ancestors[ancestors.length - 1] : `/${locale}`)]);
    if (page.title) meta.push(['Breadcrumb Title', esc(page.title)]);
  } else meta.push(['Breadcrumb Title', esc(c.siteName)]);
  meta.push(['Nav', `/${locale}/nav`], ['Footer', `/${locale}/footer`], ['Language', c.lang]);
  // the page metadata never in a market's section (lh-edge drops those for the other markets)
  if (docs[docs.length - 1].markets) docs.push({ style: null, items: [] });
  let h1s = 0;
  docs = docs.map((s, i) => {
    const body = iconSafe(s.items.map((it) => it.html).join(''));
    const rows = [s.style && ['Style', s.style], s.markets && ['Markets', s.markets], s.tab && ['Tab', esc(s.tab)], s.tab && ['Tabs', esc(s.tabs)]].filter(Boolean);
    const sm = rows.length ? blockHtml('section-metadata', rows) : '';
    const md = i === docs.length - 1 ? blockHtml('metadata', meta) : '';
    // one H1 a page; a market section's (a variant's own) stays
    const out = `<div>${body}${sm}${md}</div>`;
    return s.markets ? out : out.replace(/<(\/?)h1>/g, (x, close) => {
      if (!close) h1s += 1;
      return h1s > 1 ? `<${close}h2>` : x;
    });
  });
  const html = docs.join('\n');
  return {
    html: `${html}\n`,
    fragments: P.fragments.map((f) => ({ ...f, html: iconSafe(f.html) })),
    report: {
      blocks: P.blocks, generic: [...P.generic], notes: P.notes, missing: [...P.missing], linkedOut: [...P.linkedOut].sort(), fragments: P.fragments.map((f) => f.doc),
    },
  };
}

/* ------------------------------------------------------------------ CLI ---------------- */

const NEXT_DATA = /<script id="__NEXT_DATA__" type="application\/json"[^>]*>([\s\S]*?)<\/script>/;
const fileOf = (dir, e) => path.join(dir, (e.file || '').replace(/^snapshots\//, ''));
const EXT = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/svg+xml': 'svg', 'image/avif': 'avif', 'application/pdf': 'pdf', 'video/mp4': 'mp4',
};
const baseName = (u) => decodeURIComponent(String(u).split('?')[0].split('/').pop() || 'file').replace(/\.[a-z0-9]{2,4}$/i, '')
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '')
  .slice(0, 60) || 'file';

/**
 * A URL's plain key: host and path decoded, the path's slashes collapsed, NFC. The archives name
 * aem.flytap.com's pictures as fetched (//content/dam/…/AdegaM%C3%A3e%20Exterior.png), the rich
 * text by its DAM path (/content/dam/…/AdegaMãe Exterior.png).
 */
export function plainKey(u) {
  try {
    const x = new URL(u);
    let p = x.pathname;
    try { p = decodeURIComponent(p); } catch (err) { /* a stray % */ }
    return `plain:${x.host}${p.replace(/\/{2,}/g, '/')}`.normalize('NFC');
  } catch (err) { return null; }
}

/**
 * The media archives the capture's deliveries index (tap-deliveries.json) lists, in its order (a
 * later one's file wins): every tap-media-NNN, unpacked as <top>/<name>/x; missing, the ones not
 * unpacked there (the sitemap archives are no pictures).
 */
export function deliveryMediaDirs(indexFile, top = '/tmp/lh-arch') {
  const names = readJson(indexFile, []).filter((e) => e.kind === 'media' && /^tap-media-\d+\.tar\.gz$/.test(e.file || ''))
    .map((e) => e.file.replace(/\.tar\.gz$/, ''));
  const dirs = names.map((n) => path.join(top, n, 'x'));
  return { dirs: dirs.filter((d) => fs.existsSync(d)), missing: names.filter((n, i) => !fs.existsSync(dirs[i])) };
}

/** The media archives' files by every URL (and URL path) they were seen under. */
export function mediaIndex(dirs) {
  const idx = new Map();
  dirs.forEach((given) => {
    // the call-back capture unpacked as it comes (tap-byside-001/byside/…): its byside folder
    // (without it the click-to-call cards lost their Image rows, the held club pages of 2026-11-11)
    const dir = !fs.existsSync(path.join(given, 'manifest.json')) && !fs.existsSync(path.join(given, 'click-to-call.json'))
      && fs.existsSync(path.join(given, 'byside', 'click-to-call.json')) ? path.join(given, 'byside') : given;
    // a media archive's manifest, else the call-back capture's pictures (tap-byside-001)
    const m = readJson(path.join(dir, 'manifest.json'), null) || readJson(path.join(dir, 'click-to-call.json'), {}).pictures || [];
    (Array.isArray(m) ? m : m.files || []).forEach((e) => {
      // the archive's file: manifest path (<host>/<URL path>) or file, else from the URL
      const rel = e.path || (e.file || '').replace(/^snapshots\//, '');
      const file = rel ? path.join(dir, rel) : path.join(dir, new URL(e.url).host, new URL(e.url).pathname);
      if (!path.resolve(file).startsWith(path.resolve(dir) + path.sep)) return;
      const entry = { ...e, local: file };
      // listedAs: the URL a list of missing pictures named it (missing-pictures.txt)
      [e.url, ...(e.urlsSeen || e.urls || []), e.listedAs].filter(Boolean).forEach((u) => {
        idx.set(u, entry);
        try { const x = new URL(u); idx.set(x.pathname, entry); idx.set(`${x.origin}${x.pathname}`, entry); } catch (err) { /* a path */ idx.set(u.split('?')[0], entry); }
        const k = plainKey(u);
        if (k && !idx.has(k)) idx.set(k, entry);
      });
    });
  });
  return idx;
}

/**
 * The site's copy of a media file by a key of the page JSON (a pic.flytap.com path, a URL):
 * {eds: /media-da/tap/<name>-<hash>.<ext>} (copied to <out>, unless dry), {link: why it stays
 * on the source} over Edge Delivery's limits (images and PDFs 20 MB, mp4 36 MB), null without one.
 */
export function mediaResolver(idx, { out = OUT, dry = false } = {}) {
  return (key) => {
    const e = idx.get(key) || idx.get(`${PIC}${key}`);
    if (!e || !fs.existsSync(e.local)) return null;
    const type = String(e.type || e.contentType || '').split(';')[0];
    const bytes = e.bytes || fs.statSync(e.local).size;
    const limit = type === 'video/mp4' ? 36 * MB : 20 * MB;
    if (bytes > limit) return { link: `${(bytes / MB).toFixed(1)} MB: over Edge Delivery's ${limit / MB} MB, linked on the source` };
    const ext = EXT[type] || path.extname(e.local).slice(1) || 'bin';
    const eds = `/media-da/tap/${baseName(e.url)}-${sha1(e.url).slice(0, 8)}.${ext}`;
    if (!dry) {
      const f = path.join(out, eds);
      if (!fs.existsSync(f)) { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.copyFileSync(e.local, f); }
    }
    return { eds };
  };
}

// the root's airport sheet (lh-tap's preview, ema-test's sheets: booking-spec.md 5.3), cached in
// runs/airports-<root>.json: code -> "City, Country" for the box's Default origin name
const PREVIEW = 'https://main--lh-tap--moved-permanently.aem.page';
async function airportNames(locale) {
  const cache = path.join(W, 'runs', `airports-${locale}.json`);
  if (fs.existsSync(cache)) return readJson(cache, {});
  const r = await fetch(`${PREVIEW}/${locale}/booking/airports.json?limit=5000`);
  if (!r.ok) return {};
  const names = Object.fromEntries(((await r.json()).data || []).map((a) => [a.code, `${a.cityName}, ${a.countryName}`]));
  writeJson(cache, names);
  return names;
}

async function main() {
  const argv = process.argv.slice(2);
  const all = (n) => argv.flatMap((a, i) => (a === `--${n}` ? [path.resolve(argv[i + 1])] : []));
  const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
  const archives = all('archive');
  if (!archives.length) { console.log('usage: --archive <unpacked pages archive> [--archive ...] [--deliveries <index>] [--media <dir> ...] [--name batch-1] [--dry-run]'); process.exit(1); }
  const name = opt('name') || 'batch';
  // --only <path,...>: write only these documents (the others are read for links and anchors)
  const only = opt('only') ? new Set(opt('only').split(',')) : null;
  const bookingLabels = readJson(path.join(root, 'tools/reports/tap/booking-labels.json'), {});
  // the call-back cards as captured (CoreMedia type → language → card, parity 66)
  const clickToCall = readJson(path.join(root, 'tools/importer/tap-click-to-call.json'), {}).cards || {};
  const dry = argv.includes('--dry-run');
  // the pages: a later archive replaces an earlier one's copy
  const pages = new Map();
  archives.forEach((dir) => {
    readJson(path.join(dir, 'manifest.json'), []).forEach((e) => {
      if (e.status && e.status !== 'ok') return;
      const f = fileOf(dir, e);
      if (fs.existsSync(f)) pages.set(docPath(e.url), { url: e.url, file: f });
    });
  });
  const nds = new Map();
  const report = {};
  pages.forEach((p, doc) => {
    const m = fs.readFileSync(p.file, 'utf8').match(NEXT_DATA);
    if (!m) { report[p.url] = { doc, skipped: 'no __NEXT_DATA__ (not a page of the Next.js app)' }; return; }
    const nd = JSON.parse(m[1]);
    const t = nd.props && nd.props.pageProps && nd.props.pageProps.page && nd.props.pageProps.page.template;
    if (OUT_TEMPLATES[t]) { report[p.url] = { doc, skipped: OUT_TEMPLATES[t] }; return; }
    nds.set(doc, { ...p, nd });
  });
  // the site's pages: this run's and the documents imported before (the allowlist), so a new
  // language links and names its counterparts in the others without importing them again
  const scope = new Set([...nds.keys(), ...readJson(path.join(root, 'tools/importer/sites/lh-tap.json'), { paths: [] }).paths]);
  const anchors = new Map([...nds].map(([doc, p]) => [doc, anchorsOf(p.nd)]));
  // --deliveries <tap-deliveries.json>: every media archive it lists (unpacked under
  // --archives-root, default /tmp/lh-arch), before the --media ones
  const fromIndex = opt('deliveries') ? deliveryMediaDirs(path.resolve(opt('deliveries')), opt('archives-root') || undefined) : { dirs: [], missing: [] };
  if (fromIndex.missing.length) console.log(`media archives of the index not unpacked: ${fromIndex.missing.join(', ')}`);
  const idx = mediaIndex([...fromIndex.dirs, ...all('media')]);
  const media = mediaResolver(idx, { dry });
  const written = [];
  const write = (doc, raw) => {
    if (dry) return null;
    // the collapse, the last step (collapseTap)
    const html = collapseTap(raw, doc);
    const out = path.join(OUT, `${doc}.plain.html`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const before = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : null;
    if (before === html) return null;
    fs.writeFileSync(out, html);
    written.push(doc);
    return before === null ? 'new' : 'changed';
  };
  // the content bus takes at most 1 MB of HTML and 200 images a document (preview 409 above):
  // a larger page's category accordions go to fragment documents
  const LIMIT = 900 * 1024;
  const IMAGES = 190;
  const over = (h) => Buffer.byteLength(h) > LIMIT || (h.match(/<img /g) || []).length > IMAGES;
  // the homepages' booking box: labels and the default origin's name per root
  const locales = [...new Set([...nds.keys()].map((d) => d.split('/')[1]))];
  const sheets = await Promise.all(locales.map((locale) => airportNames(locale)));
  const booking = Object.fromEntries(locales.map((locale, i) => [locale, { labels: bookingLabels[locale] || {}, names: sheets[i] }]));
  nds.forEach((p, doc) => {
    if (only && !only.has(doc)) return;
    const locale = doc.split('/')[1];
    const b = booking[locale] || { labels: {}, names: {} };
    const site = {
      url: p.url,
      scope,
      media,
      anchors,
      sourceImages: argv.includes('--source-images'),
      booking: { labels: b.labels, originNameOf: (code) => b.names[code] },
      clickToCall,
      // the banners' phone pictures: hero-campaign and hero-card-overlay show them (ema-test, row 94)
      phonePictures: true,
    };
    let r = convertPage(p.nd, site);
    if (!r.skipped && over(r.html)) r = convertPage(p.nd, { ...site, fragments: true });
    if (r.skipped) { report[p.url] = { doc, skipped: r.skipped }; return; }
    report[p.url] = { doc, ...r.report };
    const big = [r, ...r.fragments].filter((x) => over(x.html));
    if (big.length) report[p.url].notes.push(`over 900 KB of HTML or ${IMAGES} images (the content bus takes 1 MB, 200 images): ${big.map((x) => x.doc || doc).join(', ')}`);
    const changed = write(doc, r.html);
    if (changed) report[p.url].changed = changed;
    r.fragments.forEach((f) => write(f.doc, f.html));
  });
  if (!dry) {
    writeJson(path.join(W, 'runs', `${name}-import.json`), report);
    fs.writeFileSync(path.join(W, 'runs', `${name}-paths.txt`), written.length ? `${written.join('\n')}\n` : '');
    const listPath = path.join(root, 'tools/importer/sites/lh-tap.json');
    const allow = readJson(listPath, {
      site: 'moved-permanently/lh-tap',
      source: 'www.flytap.com (/pt-pt, then /en-pt): TAP Air Portugal, tools/importer/tap-import.mjs',
      paths: [],
      patterns: ['^/[a-z]{2}-[a-z]{2}/(nav|footer)$'],
    });
    // the documents of this run and of earlier ones, without the pages this run skips
    const skipped = new Set(Object.values(report).filter((r) => r.skipped).map((r) => r.doc));
    const docs = Object.values(report).filter((r) => !r.skipped).flatMap((r) => [r.doc, ...(r.fragments || [])]);
    allow.paths = [...new Set([...allow.paths, ...docs])].filter((p) => !skipped.has(p)).sort();
    writeJson(listPath, allow);
  }
  const blocks = {};
  const generics = new Set();
  Object.values(report).forEach((r) => {
    Object.entries(r.blocks || {}).forEach(([b, n]) => { blocks[b] = (blocks[b] || 0) + n; });
    (r.generic || []).forEach((g) => generics.add(g));
  });
  const missing = new Set(Object.values(report).flatMap((r) => r.missing || []));
  console.log(`${name}: ${Object.values(report).filter((r) => !r.skipped).length} documents (${written.length} new or changed), ${Object.values(report).filter((r) => r.skipped).length} skipped, ${missing.size} files without a local copy`);
  console.log('blocks:', JSON.stringify(blocks));
  if (generics.size) console.log('generic:', [...generics].join(', '));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main();
