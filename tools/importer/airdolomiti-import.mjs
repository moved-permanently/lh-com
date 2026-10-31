/* eslint-disable no-console, no-continue, no-restricted-syntax, max-len, no-nested-ternary, no-use-before-define, class-methods-use-this, import/extensions, import/prefer-default-export, import/no-extraneous-dependencies -- tooling */
/**
 * Imports Air Dolomiti's pages (lh-airdolomiti) offline from their rendered snapshots
 * (content-sites/lh-airdolomiti/snapshots/<host>/<path>.html, airdolomiti-capture.mjs) into
 * content-sites/lh-airdolomiti/content/<Edge Delivery document>.plain.html, with lh-com's existing
 * blocks only (the brand's look comes from styles/themes/airdolomiti.css). The source is Next.js
 * over WordPress: every page carries its Gutenberg blocks ("lazyblocks", attribute values often
 * URL-encoded JSON) in __NEXT_DATA__; this reads them, not the markup.
 *
 * Blocks (per lazyblock):
 * - herohome: hero-campaign (image, the "manage your trip" buttons) and the homepage's H1 (www's
 *   H1 is its logo: a visually hidden H1, section style hidden-heading); hero: hero-campaign (narrow);
 * - title, title-margin, title-description-text-cta: default content (heading at its tag, text,
 *   the CTA as a primary button);
 * - cardfullwidth, reach-monaco: hero-card-overlay (reach-monaco's section buttons, icon over label:
 *   cards-icon, their anchors as www has them);
 * - mini-card-slider, story-card-slider, cosa-fare-carroussel: carousel-cards;
 * - gridtwocolumns, gridtwocolumnsdownloadpdf: cards-teaser; news-list-grid, select-flight-list,
 *   add-baggage-cards: cards-teaser (three-up) (the "from" prices typed on the cards stay text);
 * - tariffe-list: accordion-columns (faq); half-page, description-news: columns-media;
 * - display-booking-widget, newsletter, live tools: a link to the page on the live site of the
 *   page's language (booking, newsletter subscription); blog-posts (www's live list): the
 *   category links of the rendered page;
 * - html-content and core blocks (paragraph, heading, list, image, table, embed, columns, group):
 *   default content, tables as table-striped, YouTube as embed, Google Maps as a link;
 * - any other block: its titles, texts, images and links in order (reported as generic).
 * Links to pages in scope become the site's paths (airdolomiti-paths.mjs; the source's aliases
 * to their canonical page), the rest absolute links to the live site of their language.
 * Images and documents come from airdolomiti-assets.mjs (content-sites/lh-airdolomiti/assets);
 * a file not downloaded yet stays the source URL and is listed (missing).
 * Writes content-sites/lh-airdolomiti/runs/<name>-import.json and the allowlist
 * tools/importer/sites/lh-airdolomiti.json.
 *
 * Usage: node tools/importer/airdolomiti-import.mjs --list <batch file> [--name batch-1] [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import {
  docOf, sourceKey, langOf, allRows, targetOf,
} from './airdolomiti-paths.mjs';
import { snapshotFile, urlKey } from './airdolomiti-capture.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const W = path.join(root, 'content-sites/lh-airdolomiti');
const OUT = path.join(W, 'content');
const ASSETS = path.join(W, 'assets');
const readJson = (f, d) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : d);
const writeJson = (f, v) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, `${JSON.stringify(v, null, 1)}\n`); };
const sha1 = (s) => crypto.createHash('sha1').update(s).digest('hex');

export const LIVE = {
  it: {
    host: 'https://www.airdolomiti.it', booking: '/prenotazioni', newsletter: '/iscrizione-newsletter', bookLabel: 'Prenota il tuo volo', newsletterLabel: 'Iscriviti alla nostra newsletter', mapLabel: 'Mappa su Google Maps', h1: 'Air Dolomiti',
  },
  en: {
    host: 'https://www.airdolomiti.eu', booking: '/booking', newsletter: '/newsletter-subscription', bookLabel: 'Book your flight', newsletterLabel: 'Subscribe to the newsletter', mapLabel: 'Map on Google Maps', h1: 'Air Dolomiti',
  },
  de: {
    host: 'https://www.airdolomiti.de', booking: '/buchung', newsletter: '/newsletter-anmeldung', bookLabel: 'Flug buchen', newsletterLabel: 'Newsletter abonnieren', mapLabel: 'Karte auf Google Maps', h1: 'Air Dolomiti',
  },
};

/* ------------------------------------------------------------------ site data ---------- */

let site;
export function loadSite() {
  if (site) return site;
  const paths = readJson(path.join(W, 'paths.json'), {});
  const rows = allRows(path.join(W, 'delivery'));
  // aliases and source redirects: their canonical page (in scope)
  const alias = {};
  rows.filter((r) => ['alias', 'redirect'].includes(r.decision)).forEach((r) => {
    const t = targetOf(r);
    if (t && paths[sourceKey(t)]) alias[sourceKey(r.url)] = paths[sourceKey(t)];
  });
  const files = readJson(path.join(ASSETS, 'files.json'), {});
  const state = readJson(path.join(ASSETS, 'state.json'), { done: {} });
  const capture = readJson(path.join(W, 'capture-state.json'), {});
  site = {
    paths, alias, files, state, capture,
  };
  return site;
}

/* ------------------------------------------------------------------ helpers ------------ */

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const attr = (s) => esc(s).replace(/"/g, '&quot;');
const plain = (s) => String(s ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ')
  .trim();

/** An attribute value: URL-encoded JSON decoded (arrays, objects), else as is. */
export function dec(v) {
  if (typeof v === 'string' && /^%5B|^%7B/.test(v)) {
    try { return dec(JSON.parse(decodeURIComponent(v))); } catch (e) { return v; }
  }
  if (Array.isArray(v)) return v.map(dec);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dec(x)]));
  return v;
}

/** A WordPress image object (or URL string): { url, alt }, or null. */
const imageOf = (v) => {
  if (!v) return null;
  if (typeof v === 'string') return /^https?:\/\/.+\.(jpe?g|png|webp|gif|svg)(\?|$)/i.test(v) ? { url: v, alt: '' } : null;
  if (Array.isArray(v)) return imageOf(v[0]);
  if (typeof v === 'object' && v.url) return { url: v.url, alt: v.alt || '' };
  return null;
};

/* ------------------------------------------------------------------ the page ----------- */

export class Page {
  constructor(sourceUrl, lang, rendered) {
    this.source = sourceUrl;
    this.lang = lang;
    this.live = LIVE[lang];
    this.rendered = rendered;
    this.sections = [{ style: null, items: [] }];
    this.blocks = {};
    this.notes = [];
    this.generic = new Set();
    this.missing = new Set();
    this.linkedOut = new Set();
    this.bookingLinked = false;
    this.newsletterLinked = false;
  }

  get current() { return this.sections[this.sections.length - 1]; }

  section(style = null) {
    if (!this.current.items.length) { this.current.style = style; return; }
    this.sections.push({ style, items: [] });
  }

  add(html) { if (html && html.replace(/<[^>]+>/g, (m) => (/^<(img|picture)/.test(m) ? 'x' : '')).trim()) this.current.items.push({ html }); }

  block(name, rows) {
    const clean = rows.map((r) => r.map((c) => c || '')).filter((r) => r.some((c) => c.trim()));
    if (!clean.length) return;
    this.blocks[name] = (this.blocks[name] || 0) + 1;
    this.current.items.push({ block: name, rows: clean });
  }

  note(s) { if (!this.notes.includes(s)) this.notes.push(s); }

  /** A link's target: the site's path for pages in scope, the live site for the rest. */
  href(raw) {
    const h = String(raw || '').trim().replace(/&amp;/g, '&');
    if (!h || /^javascript:|^\{\{/.test(h)) return null;
    if (/^(mailto|tel):/i.test(h)) return h;
    if (h.startsWith('#')) return h;
    if (/^http:\/\/search\b/.test(h)) return null;
    let u;
    try { u = new URL(h.replace(/^\/\//, 'https://'), `${this.live.host}/`); } catch (e) { return h; }
    if (/^cms\.airdolomiti\.it$/.test(u.hostname) && /\/wp-content\/uploads\//.test(u.pathname)) return this.file(u.href, 'document') || u.href;
    if (!/^(www\.)?airdolomiti\.(it|eu|de)$/.test(u.hostname)) return u.href;
    u.hostname = u.hostname.replace(/^airdolomiti/, 'www.airdolomiti');
    const { paths, alias, capture } = loadSite();
    const key = sourceKey(u.href);
    if (capture[urlKey(u.href)] && capture[urlKey(u.href)].status === 'not-found') return u.href;
    const target = paths[key] || alias[key];
    if (target) return `${target}${u.hash || ''}`;
    this.linkedOut.add(u.href.replace(/[?#].*$/, ''));
    return u.href;
  }

  /** A file's local path once downloaded (images /media-da/airdolomiti/..., documents /documents/...), else null (and listed). */
  file(url, kind) {
    const { files, state } = loadSite();
    const key = url.replace(/[?#].*$/, '');
    if (!files[key]) files[key] = { kind, pages: [] };
    if (!files[key].pages.includes(this.source)) files[key].pages.push(this.source);
    const d = state.done[key];
    if (!d || d.status !== 200 || !files[key].eds) { this.missing.add(key); return null; }
    if (kind === 'image' || files[key].kind === 'image') {
      const dest = path.join(OUT, files[key].eds);
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(path.join(ASSETS, 'cache', sha1(key)), dest);
      }
    }
    return files[key].eds;
  }

  img(image) {
    const im = imageOf(image);
    if (!im) return '';
    const src = this.file(im.url, 'image') || im.url;
    return `<picture><img src="${attr(src)}" alt="${attr(im.alt)}"></picture>`;
  }

  link(url, label, button) {
    const href = this.href(url);
    const text = plain(label);
    if (!text) return '';
    if (!href) return `<p>${esc(text)}</p>`;
    const a = `<a href="${attr(href)}">${esc(text)}</a>`;
    return `<p>${button === 'primary' ? `<strong>${a}</strong>` : button === 'secondary' ? `<em>${a}</em>` : a}</p>`;
  }

  heading(tag, text) {
    const t = plain(text);
    const level = /^h[1-6]$/.test(tag || '') ? tag : 'h2';
    return t ? `<${level}>${esc(t)}</${level}>` : '';
  }

  booking() {
    if (this.bookingLinked) return '';
    this.bookingLinked = true;
    this.note('booking widget: a link to the booking page on the live site');
    return this.link(`${this.live.host}${this.live.booking}`, this.live.bookLabel, 'primary');
  }
}

/* ------------------------------------------------------------------ rich text ---------- */

const KEEP_INLINE = new Set(['STRONG', 'B', 'EM', 'I', 'A', 'BR', 'SUP', 'SUB']);

/** WordPress HTML as clean block-level HTML (cell: tables as lists; top: tables as table-striped). */
function rich(html, page, mode = 'cell') {
  if (!html || !String(html).trim()) return '';
  const { document } = parseHTML(`<div id="r">${html}</div>`);
  return flow(document.getElementById('r'), page, mode).join('');
}

function inline(node, page) {
  let out = '';
  node.childNodes.forEach((c) => {
    if (c.nodeType === 3) { out += esc(c.textContent.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ')); return; }
    if (c.nodeType !== 1) return;
    const t = c.tagName;
    if (t === 'BR') { out += '<br>'; return; }
    if (t === 'IMG') { out += page.img({ url: c.getAttribute('src'), alt: c.getAttribute('alt') || '' }); return; }
    const inner = inline(c, page);
    if (t === 'A') {
      const href = page.href(c.getAttribute('href'));
      const label = inner.trim();
      if (!href || !label) { out += inner; return; }
      out += `${/^\s/.test(inner) ? ' ' : ''}<a href="${attr(href)}">${label}</a>${/\s$/.test(inner) ? ' ' : ''}`;
      return;
    }
    if (t === 'STRONG' || t === 'B') { out += inner.trim() ? `<strong>${inner}</strong>` : inner; return; }
    if (t === 'EM' || t === 'I') { out += inner.trim() ? `<em>${inner}</em>` : inner; return; }
    if (t === 'SUP' || t === 'SUB') { out += `<${t.toLowerCase()}>${inner}</${t.toLowerCase()}>`; return; }
    out += inner;
  });
  return out;
}

const tidy = (h) => h.replace(/\s+/g, ' ').replace(/(<br>\s*)+$/, '').replace(/^(\s*<br>)+/, '').trim();
const empty = (h) => !h.replace(/<br>/g, '').replace(/<[^>]+>/g, (m) => (/^<img/.test(m) ? 'x' : '')).trim();

function flow(node, page, mode) {
  const out = [];
  let run = '';
  const flush = () => { const h = tidy(run); if (!empty(h)) out.push(`<p>${h}</p>`); run = ''; };
  node.childNodes.forEach((c) => {
    if (c.nodeType === 3) { run += esc(c.textContent.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ')); return; }
    if (c.nodeType !== 1 || /^(SCRIPT|STYLE|NOSCRIPT|FORM|BUTTON|INPUT|SELECT|svg)$/i.test(c.tagName)) return;
    const t = c.tagName;
    if (KEEP_INLINE.has(t) || t === 'SPAN' || t === 'IMG' || t === 'U' || t === 'SMALL') {
      if (t === 'SPAN' && c.querySelector('p, div, ul, ol, table, h1, h2, h3, h4, h5, h6')) { flush(); out.push(...flow(c, page, mode)); return; }
      run += inline({ childNodes: [c] }, page);
      return;
    }
    flush();
    if (/^H[1-6]$/.test(t)) { const h = tidy(inline(c, page)).replace(/<br>/g, ' '); if (!empty(h)) out.push(`<${t.toLowerCase()}>${h}</${t.toLowerCase()}>`); return; }
    if (t === 'P') { const h = tidy(inline(c, page)); if (!empty(h)) out.push(`<p>${h}</p>`); return; }
    if (t === 'UL' || t === 'OL') { out.push(list(c, page)); return; }
    if (t === 'TABLE') {
      const rows = [...c.querySelectorAll('tr')].map((tr) => [...tr.children].filter((x) => /^T[DH]$/.test(x.tagName)).map((td) => tidy(inline(td, page))));
      const r = rows.filter((x) => x.some((y) => !empty(y)));
      if (!r.length) return;
      if (mode === 'top') { page.block(c.querySelector('th') || c.querySelector('thead') ? 'table-striped (header)' : 'table-striped', r); return; }
      out.push(`<ul>${r.map((x) => `<li>${x.filter((y) => !empty(y)).join(': ')}</li>`).join('')}</ul>`);
      return;
    }
    if (t === 'IFRAME') { out.push(...iframe(c.getAttribute('src') || c.getAttribute('data-src') || '', c.getAttribute('title') || '', page, mode)); return; }
    if (t === 'BLOCKQUOTE') { out.push(`<blockquote>${flow(c, page, 'cell').join('')}</blockquote>`); return; }
    if (t === 'FIGURE' || t === 'DIV' || t === 'SECTION' || t === 'FIGCAPTION' || t === 'CENTER') { out.push(...flow(c, page, mode)); return; }
    if (t === 'HR') return;
    out.push(...flow(c, page, mode));
  });
  flush();
  return out.filter(Boolean);
}

function list(c, page) {
  const tag = c.tagName.toLowerCase();
  const items = [...c.children].filter((li) => li.tagName === 'LI').map((li) => {
    const clone = li.cloneNode(true);
    [...clone.children].filter((x) => /^(UL|OL)$/.test(x.tagName)).forEach((x) => x.remove());
    const sub = [...li.children].filter((x) => /^(UL|OL)$/.test(x.tagName)).map((x) => list(x, page)).join('');
    const own = tidy(inline(clone, page));
    return empty(own) && !sub ? '' : `<li>${own}${sub}</li>`;
  }).filter(Boolean);
  return items.length ? `<${tag}>${items.join('')}</${tag}>` : '';
}

function iframe(src, title, page, mode) {
  const s = String(src || '').replace(/^\/\//, 'https://');
  if (/youtube(-nocookie)?\.com|youtu\.be/.test(s)) {
    const link = `<p><a href="${attr(s)}">${attr(s)}</a></p>`;
    if (mode === 'top') { page.block('embed', [[link]]); return []; }
    return [link];
  }
  if (/google\.[a-z.]+\/maps|maps\.google/.test(s)) {
    page.note('Google Maps iframe: a link to the map');
    return [`<p><a href="${attr(s.replace(/\/maps\/embed\?pb=.*$/, '/maps'))}">${esc(page.live.mapLabel)}</a></p>`];
  }
  if (/^https?:/.test(s)) return [`<p><a href="${attr(s)}">${esc(title || s)}</a></p>`];
  return [];
}

/* ------------------------------------------------------------------ the blocks --------- */

const cardRow = (page, {
  image, tag, title, text, url, label,
}) => {
  const body = [
    page.heading(tag || 'h3', title),
    text ? (/<[a-z]/i.test(text) ? rich(text, page) : `<p>${esc(plain(text))}</p>`) : '',
    url ? page.link(url, label || title) : '',
  ].join('');
  return [page.img(image), body];
};

// blocks that are lists of items (kept as blocks where they stand, not flattened into a column)
const LIST_BLOCKS = /^lazyblock\/(tariffe-list|tariffe-table|news-list-grid|select-flight-list|add-baggage-cards|mini-card-slider|story-card-slider|cosa-fare-carroussel|gridtwocolumns)$/;

const HANDLERS = {
  'lazyblock/herohome': (a, page) => {
    page.section('hidden-heading');
    page.add(`<h1>${esc(page.live.h1)}</h1>`);
    const buttons = (a.buttons || []).map((b) => page.link(b.url, b.text)).join('');
    page.block('hero-campaign', [[page.img(a.backgroundImage)], [`${a.title ? page.heading('h2', a.title) : ''}${a.subtitle ? `<p>${esc(plain(a.subtitle))}</p>` : ''}${page.booking()}${a.settingText ? `<p>${esc(plain(a.settingText))}</p>` : ''}${buttons}`]]);
    page.section();
  },
  'lazyblock/hero': (a, page) => {
    page.section();
    const buttons = (a.buttons || []).map((b) => page.link(b.url, b.text, 'primary')).join('');
    page.block('hero-campaign (narrow)', [[page.img(a.backgroundimage || a.backgroundImage)], [`${page.heading('h1', a.title)}${a.subtitle ? `<p>${esc(plain(a.subtitle))}</p>` : ''}${buttons}`]]);
    page.section();
  },
  'lazyblock/title': (a, page) => { page.add(page.heading(a.tag, a.title)); if (a.subtitle) page.add(`<p>${esc(plain(a.subtitle))}</p>`); },
  'lazyblock/title-margin': (a, page) => HANDLERS['lazyblock/title'](a, page),
  'lazyblock/title-news': (a, page) => HANDLERS['lazyblock/title'](a, page),
  'lazyblock/title-description-text-cta': (a, page) => {
    page.add(page.heading(a.tag, a.title));
    page.add(rich(a.description || a.text, page, 'top'));
    if (a.url && a.ctaText) page.add(page.link(a.url, a.ctaText, 'primary'));
  },
  'lazyblock/cardfullwidth': (a, page) => {
    page.section();
    page.block('hero-card-overlay', [[page.img(a.backgroundImage || a.backgroundImageLeft)], [`${page.heading(a.tag || 'h2', a.title)}${rich(a.subtitle, page)}${a.urlBtn ? page.link(a.urlBtn, a.ctaText, 'primary') : ''}`]]);
    page.section();
  },
  'lazyblock/reach-monaco': (a, page) => {
    page.section();
    const price = [a.titleWidget, a.widgetPrice].filter(Boolean).map(plain).join(' ');
    // the city's title is the page's H1 on www (HeroSecond h1)
    page.block('hero-card-overlay', [[page.img(a.backgroundImg)], [`${page.heading('h1', a.title)}${price ? `<p>${esc(price)}</p>` : ''}${a.ctaUrl ? page.link(a.ctaUrl, a.ctaText, 'primary') : ''}`]]);
    // the city's section buttons (icon over label: "Cosa fare" #cosa-fare, "Cosa ascoltare" /podcast):
    // cards-icon tiles with www's icons, the anchors as www has them
    const buttons = (a.buttonTexts || []).filter((b) => b.ctaUrl && b.text);
    if (buttons.length) {
      page.block('cards-icon', buttons.map((b) => [page.img(b.icon), `<p><a href="${attr(b.ctaUrl.startsWith('#') ? b.ctaUrl : page.href(b.ctaUrl))}">${esc(plain(b.text))}</a></p>`]));
    }
    page.section();
  },
  'lazyblock/mini-card-slider': (a, page) => {
    page.add(page.heading(a.tag, a.title));
    page.block('carousel-cards', (a.cardList || []).map((c) => cardRow(page, {
      image: c.image, tag: a.tagCard, title: c.title, text: [c.price, c.bottomText].filter(Boolean).map(plain).join(' '), url: c.url,
    })));
    if (a.showMoreTextUrl && a.showMoreText) page.add(page.link(a.showMoreTextUrl, a.showMoreText));
  },
  'lazyblock/story-card-slider': (a, page) => {
    page.add(page.heading(a.tag, a.title));
    page.block('carousel-cards', (a.cardList || []).map((c) => cardRow(page, {
      image: c.gallery || c.image, tag: a.tagCard, title: c.title, url: c.url,
    })));
    if (a.showMoreTextUrl && a.showMoreText) page.add(page.link(a.showMoreTextUrl, a.showMoreText));
  },
  'lazyblock/cosa-fare-carroussel': (a, page) => {
    page.add(page.heading(a.tag || 'h2', a.header || a.title));
    if (a.description) page.add(rich(a.description, page));
    page.block('carousel-cards', (a.cardList || []).map((c) => cardRow(page, {
      image: c.topImage || c.image, tag: a.tagCard, title: c.title, text: c.date, url: c.Url || c.url, label: c.ctaText || c.title,
    })));
    if (a.showMoreTextUrl && a.showMoreText) page.add(page.link(a.showMoreTextUrl, a.showMoreText));
  },
  'lazyblock/gridtwocolumns': (a, page) => {
    page.block('cards-teaser', (a.cardList || []).map((c) => cardRow(page, {
      image: c.image, tag: 'h3', title: c.title, text: c.subtitle, url: c.url, label: c.btntext,
    })));
  },
  'lazyblock/gridtwocolumnsdownloadpdf': (a, page) => {
    page.block('cards-teaser', [
      cardRow(page, {
        image: a.bigcardimage, tag: a.tag, title: a.bigcardtitle, text: a.bigcardsubtitle, url: a.bigcardctaurl, label: a.bigcardctatext,
      }),
      cardRow(page, {
        image: a.smallcardimage, tag: a.tag, title: a.smallcardtitle, text: a.smallcardsubtitle, url: imageOf(a.filetodownload)?.url || (a.filetodownload && a.filetodownload.url) || a.smallcardctaurl, label: a.smallcardctatext,
      }),
    ]);
  },
  'lazyblock/news-list-grid': (a, page) => {
    page.add(page.heading(a.tag === 'h3' ? 'h2' : (a.tag || 'h2'), a.titleHeder || a.title));
    if (a.subtitle) page.add(`<p>${esc(plain(a.subtitle))}</p>`);
    page.block('cards-teaser (three-up)', (a.cardList || []).map((c) => cardRow(page, {
      image: c.topImage || c.image, tag: a.tagCard || 'h3', title: c.title, text: c.date || c.subtitle, url: c.Url || c.url,
    })));
  },
  'lazyblock/select-flight-list': (a, page) => {
    page.add(page.heading(a.tag, a.title));
    if (a.description) page.add(`<p>${esc(plain(a.description))}</p>`);
    page.block('cards-teaser (three-up)', (a.cardList || []).map((c) => cardRow(page, {
      image: c.imgUrl || c.image, tag: a.tagCard || 'h3', title: c.title, text: [c.textPrice, c.price, c.bottomText].filter(Boolean).map(plain).join(' '), url: c.ctaUrl || c.url,
    })));
  },
  'lazyblock/add-baggage-cards': (a, page) => {
    page.add(page.heading(a.tag, a.title));
    if (a.subtitle) page.add(`<p>${esc(plain(a.subtitle))}</p>`);
    page.block('cards-teaser (three-up)', (a.addBaggageCards || a.cardList || []).map((c) => cardRow(page, {
      image: c.img || c.image, tag: a.tagCard || 'h3', title: c.title, url: c.ctaUrl || c.url,
    })));
  },
  'lazyblock/tariffe-list': (a, page) => {
    if (a.title) page.add(page.heading(a.tag, a.title));
    // an item's answer: its text, description, the "more" text, a small card (image, text), a
    // button and a closing text with its link
    page.block('accordion-columns (faq)', (a.tariffeList || []).map((t) => [esc(plain(t.title)), [
      rich(t.subtitle, page), rich(t.description, page), rich(t.textMore, page),
      t.cardImg ? `<p>${page.img(t.cardImg)}</p>` : '', rich(t.cardText, page),
      t.btnUrl && t.btnText ? page.link(t.btnUrl, t.btnText, 'secondary') : '',
      rich(t.finalText, page), t.finalLinkUrl && t.finalLinkText ? page.link(t.finalLinkUrl, t.finalLinkText) : '',
    ].join('')]));
  },
  'lazyblock/description-news': (a, page) => {
    const text = `${a.subtitle ? page.heading('h3', a.subtitle) : ''}${rich(a.description, page)}${a.urlBtn ? page.link(a.urlBtn, a.textBtn, 'primary') : ''}`;
    const im = page.img(a.backgroundImage);
    if (im) page.block('columns-media', [[im, text]]);
    else page.add(text);
  },
  'lazyblock/half-page': (a, page, b) => {
    const card = `${page.heading(a.tag || 'h3', a.cardTitle)}${a.cardSubtitle ? `<p>${esc(plain(a.cardSubtitle))}</p>` : ''}${a.urlBtn ? page.link(a.urlBtn, a.textBtn, 'primary') : ''}${a.urlLink ? page.link(a.urlLink, a.textLink) : ''}`;
    // a column holding a list block (accordion, cards): its blocks on the page, then the card as
    // its own image | text row; else the column's texts beside the card
    if ((b.innerBlocks || []).some((x) => LIST_BLOCKS.test(x.name))) {
      (b.innerBlocks || []).forEach((x) => render(x, page, 'top'));
      page.block('columns-media', [[page.img(a.img), card]]);
      return true;
    }
    const left = (b.innerBlocks || []).map((x) => render(x, page, 'cell')).join('');
    page.block('columns-media', [[left, `${page.img(a.img)}${card}`]]);
    return true;
  },
  'lazyblock/display-booking-widget': (a, page) => { page.add(page.booking()); },
  'lazyblock/newsletter': (a, page) => {
    if (page.newsletterLinked) return;
    page.newsletterLinked = true;
    page.note('newsletter form: a link to the subscription page on the live site');
    page.add(page.link(`${page.live.host}${page.live.newsletter}`, page.live.newsletterLabel));
  },
  'lazyblock/blog-posts': (a, page) => {
    // www's live list: the category links the rendered page shows
    const { document } = parseHTML(page.rendered);
    const cats = [...new Map([...document.querySelectorAll('#page-content a[href], main a[href]')]
      .filter((x) => /^\/(articoli|articles|artikel)\/[a-z0-9-]+$/.test(x.getAttribute('href') || '') && x.textContent.trim())
      .map((x) => [x.getAttribute('href'), x.textContent.trim()])).entries()];
    page.add(`<ul>${cats.map(([h, t]) => `<li>${page.link(h, t).replace(/^<p>|<\/p>$/g, '')}</li>`).join('')}</ul>`);
    page.note(`blog list (www's live list of posts): its ${cats.length} category links`);
  },
  'lazyblock/horizontal-pictures': (a, page) => HANDLERS['lazyblock/horizontal-pictures-tre'](a, page),
  'lazyblock/margin-top': () => {},
  'lazyblock/html-content': (a, page) => { page.add(rich(a.content || a.html || a.text, page, 'top')); },
  'core/paragraph': (a, page) => { page.add(rich(a.content ? `<p>${a.content}</p>` : '', page, 'top')); },
  'core/heading': (a, page) => { page.add(page.heading(`h${a.level || 2}`, a.content)); },
  'core/list': (a, page, b) => { page.add(rich(b.originalContent || b.saveContent || a.values || '', page, 'top')); },
  'core/image': (a, page) => { page.add(`<p>${page.img({ url: a.url, alt: a.alt })}</p>`); },
  'core/embed': (a, page) => { iframe(a.url, a.providerNameSlug, page, 'top').forEach((h) => page.add(h)); },
  'core/html': (a, page, b) => { page.add(rich(a.content || b.originalContent || '', page, 'top')); },
  'core/table': (a, page) => { tableBlock(a, page); },
  'lazyblock/tariffe-table': (a, page, b) => {
    // the fare families' table: the header row of the block, the body of its core/table
    const table = (b.innerBlocks || []).find((x) => x.name === 'core/table');
    tableBlock(table ? dec(table.attributes || {}) : {}, page, (a.tabRowHeaders || []).map((h) => esc(plain(h.name))));
    return true;
  },
  'lazyblock/tariffebanner': (a, page) => {
    page.section();
    page.block('hero-card-overlay', [[page.img(a.img)], [`${page.heading(a.tag || 'h3', a.title)}${a.subtitle ? `<p>${esc(plain(a.subtitle))}</p>` : ''}${a.urlbtn ? page.link(a.urlbtn, a.textbtn, 'primary') : ''}`]]);
    page.section();
  },
  'lazyblock/embed-url': (a, page) => { iframe(a.url, '', page, 'top').forEach((h) => page.add(h)); },
  'lazyblock/download-cta': (a, page) => {
    const f = a.fileToDownload && (a.fileToDownload.url || a.fileToDownload);
    if (f && a.textCta) page.add(page.link(f, a.textCta, 'secondary'));
  },
  'lazyblock/horizontal-pictures-tre': (a, page) => {
    // a row of pictures: columns-media, several images side by side in one media cell
    const imgs = (a.images || []).map((x) => page.img({ url: (x.image && x.image.url) || x.image, alt: x.altImage || (x.image && x.image.alt) || '' })).filter(Boolean);
    if (imgs.length) page.block('columns-media', [[imgs.map((i) => `<p>${i}</p>`).join('')]]);
  },
  'lazyblock/aspetti-ambientali': (a, page) => {
    // cards whose text opens in a dialog on www: image | title, the dialog's title and text
    page.block('columns-media', (a.cards || []).map((c) => [page.img(c.image), `${page.heading('h3', c.text)}${c.modalTitle ? page.heading('h4', c.modalTitle) : ''}${rich(c.modalText, page)}`]));
  },
  'core/spacer': () => {},
  'core/separator': () => {},
};

/** One block: its handler, else its content generically (titles, texts, images, links in order). */
function render(b, page, mode = 'top') {
  const a = dec(b.attributes || {});
  const h = HANDLERS[b.name];
  if (mode === 'cell') return cellOf(b, a, page);
  if (h) {
    const done = h(a, page, b);
    if (!done) (b.innerBlocks || []).forEach((x) => render(x, page, 'top'));
    return '';
  }
  if (/^core\/(group|columns|column|cover)$/.test(b.name)) { (b.innerBlocks || []).forEach((x) => render(x, page, 'top')); return ''; }
  page.generic.add(b.name);
  const html = genericOf(a, page);
  page.add(html);
  (b.innerBlocks || []).forEach((x) => render(x, page, 'top'));
  return '';
}

/**
 * A block inside a block cell (half-page's left column): rendered as at the top, then flattened
 * into cell HTML (a block's cells one after another; tables as lists).
 */
function cellOf(b, a, page) {
  const saved = page.sections;
  const savedBlocks = { ...page.blocks };
  page.sections = [{ style: null, items: [] }];
  render(b, page, 'top');
  const items = page.sections.flatMap((x) => x.items);
  page.sections = saved;
  page.blocks = savedBlocks;
  return items.map((it) => {
    if (!it.block) return it.html;
    if (/^table-striped/.test(it.block)) return `<ul>${it.rows.map((r) => `<li>${r.filter((c) => !empty(c)).join(': ')}</li>`).join('')}</ul>`;
    return it.rows.map((r) => r.join('')).join('');
  }).join('');
}

/** A core/table's head and body cells (and an optional header row) as table-striped. */
function tableBlock(a, page, header) {
  const cells = (rowsOf) => (rowsOf || []).map((r) => (r.cells || []).map((c) => tidy(rich(`<p>${c.content || ''}</p>`, page).replace(/^<p>|<\/p>$/g, ''))));
  const head = cells(a.head);
  const body = cells(a.body);
  const top = header && header.length ? [header] : head;
  const rows = [...top, ...body].filter((r) => r.some((c) => !empty(c)));
  if (rows.length) page.block(top.length ? 'table-striped (header)' : 'table-striped', rows);
}

const TITLE_KEYS = /^(title|header|titleHeder|cardTitle|bigcardtitle|smallcardtitle|heading)$/;
function genericOf(a, page) {
  const out = [];
  Object.entries(a).forEach(([k, v]) => {
    if (/^(tag|tagCard|newTab|lazyblock|anchor|className|blockId|blockUniqueClass|ghostkit.*|pll_lang|.*[Cc]olor.*|hideTooltip.*|ariaLabel.*|.*AriaLabel)$/.test(k)) return;
    if (typeof v === 'string' && TITLE_KEYS.test(k)) out.push(page.heading(a.tag, v));
    else if (typeof v === 'string' && /<[a-z]/i.test(v)) out.push(rich(v, page));
    else if (imageOf(v)) out.push(`<p>${page.img(v)}</p>`);
    else if (Array.isArray(v)) {
      v.forEach((c) => {
        if (!c || typeof c !== 'object') return;
        const im = imageOf(c.image || c.img || c.topImage || c.imgUrl || c.pic || c.icon);
        const u = c.url || c.Url || c.ctaUrl;
        const t = c.title || c.text || c.name;
        out.push(`${im ? `<p>${page.img(im)}</p>` : ''}${t && u ? page.link(u, t) : (t ? `<p>${esc(plain(t))}</p>` : '')}`);
      });
    }
  });
  return out.join('');
}

/* ------------------------------------------------------------------ the document ------- */

function blockHtml(item) {
  const m = item.block.match(/^([a-z0-9-]+)(?: \(([^)]+)\))?$/);
  const classes = [m[1], ...(m[2] ? m[2].split(/,\s*/).map((o) => o.trim().replace(/\s+/g, '-')) : [])].join(' ');
  return `<div class="${classes}">${item.rows.map((r) => `<div>${r.map((c) => `<div>${c}</div>`).join('')}</div>`).join('')}</div>`;
}

/** Converts one snapshot to the document's HTML; returns { html, report }. */
export function convert(rendered, sourceUrl) {
  const lang = langOf(sourceUrl);
  const page = new Page(sourceUrl, lang, rendered);
  const m = rendered.match(/<script id="__NEXT_DATA__" type="application\/json"[^>]*>([\s\S]*?)<\/script>/);
  if (!m) throw new Error(`${sourceUrl}: no __NEXT_DATA__`);
  const pp = JSON.parse(m[1]).props.pageProps;
  const post = pp.post || {};
  // a blog post: www's post template above its blocks (featured image, title; date and reading
  // time in the byline): article-header
  // eslint-disable-next-line no-underscore-dangle -- WPGraphQL's type name
  const isPost = post.__typename === 'Post';
  if (isPost) {
    const fi = post.featuredImage && post.featuredImage.node;
    page.block('article-header', [[fi ? page.img({ url: fi.sourceUrl, alt: fi.altText || '' }) : ''], [`<h1>${esc(plain(post.title))}</h1>${post.excerpt ? `<p>${esc(plain(post.excerpt))}</p>` : ''}`]]);
    page.section();
  }
  (post.blocks || []).forEach((b) => render(b, page, 'top'));
  // a post's own fields when it has no blocks (title, content)
  if (!(post.blocks || []).length && post.content) page.add(rich(post.content, page, 'top'));
  let docs = page.sections.filter((s) => s.items.length);
  const all = () => docs.flatMap((s) => s.items);
  const hasH1 = () => all().some((i) => (i.html || '').includes('<h1') || (i.rows || []).some((r) => r.some((x) => x.includes('<h1'))));
  if (!hasH1()) {
    const first = all().find((i) => /^<h[2-6]>/.test(i.html || ''));
    if (first) first.html = first.html.replace(/^<h[2-6]>(.*?)<\/h[2-6]>/, '<h1>$1</h1>');
    else {
      const t = plain(post.title || (post.seo && post.seo.title) || '').replace(/\s*\|\s*Air Dolomiti\s*$/, '');
      docs = docs.length ? docs : [{ style: null, items: [] }];
      docs[0].items.unshift({ html: `<h1>${esc(t)}</h1>` });
      page.note('no heading on the page: H1 from its title');
    }
  }
  // metadata: title, description, image, robots, the language's nav, footer and language
  const seo = post.seo || {};
  const meta = [['Title', esc(plain(seo.title || post.title || ''))]];
  if (seo.metaDesc) meta.push(['Description', esc(plain(seo.metaDesc))]);
  const og = seo.opengraphImage && (seo.opengraphImage.sourceUrl || seo.opengraphImage.url);
  if (og) { const im = page.img({ url: og, alt: '' }); if (im) meta.push(['Image', im]); }
  if (seo.metaRobotsNoindex === 'noindex') meta.push(['Robots', `noindex, ${seo.metaRobotsNofollow === 'nofollow' ? 'nofollow' : 'follow'}`]);
  const prefix = lang === 'it' ? '' : `/${lang}`;
  if (isPost) {
    // www shows the post's date and its reading time ("Tempo di lettura: 2 minuti"), 200 words a minute
    const words = plain(docs.flatMap((x) => x.items).map((it) => it.html || (it.rows || []).flat().join(' ')).join(' ')).split(' ').length;
    const min = Math.max(1, Math.ceil(words / 200));
    const label = { it: `Tempo di lettura: ${min} ${min === 1 ? 'minuto' : 'minuti'}`, en: `Reading time: ${min} ${min === 1 ? 'minute' : 'minutes'}`, de: `Lesezeit: ${min} ${min === 1 ? 'Minute' : 'Minuten'}` }[lang];
    if (post.date) meta.push(['Publication Date', post.date.slice(0, 10)]);
    meta.push(['Reading Time', label]);
    const cat = post.categories && post.categories.edges && post.categories.edges[0] && post.categories.edges[0].node;
    if (cat) meta.push(['Category', esc(cat.name)]);
  }
  meta.push(['Nav', `${prefix}/nav`], ['Footer', `${prefix}/footer`], ['Language', lang]);
  const out = docs.map((s, i) => {
    const body = s.items.map((it) => (it.block ? blockHtml(it) : it.html)).join('');
    const sm = s.style ? blockHtml({ block: 'section-metadata', rows: [['Style', s.style]] }) : '';
    const md = i === docs.length - 1 ? blockHtml({ block: 'metadata', rows: meta }) : '';
    return `<div>${body}${sm}${md}</div>`;
  });
  // one H1
  let h1s = 0;
  const doc = out.join('\n').replace(/<(\/?)h1>/g, (x, close) => {
    if (!close) h1s += 1;
    return h1s > 1 ? `<${close}h2>` : x;
  });
  return {
    html: `${doc}\n`,
    report: {
      blocks: page.blocks, generic: [...page.generic], notes: page.notes, missing: [...page.missing], linkedOut: [...page.linkedOut].sort(),
    },
  };
}

/* ------------------------------------------------------------------ CLI ---------------- */

function main() {
  const argv = process.argv.slice(2);
  const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
  const listFile = opt('list');
  if (!listFile) { console.log('usage: --list <batch file> [--name batch-1] [--dry-run]'); process.exit(1); }
  const name = opt('name') || path.basename(listFile, '.txt').replace(/^batch-0*/, 'batch-');
  const urls = fs.readFileSync(path.resolve(root, listFile), 'utf8').split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const { paths, capture, files } = loadSite();
  const report = {};
  const written = [];
  urls.forEach((url) => {
    const eds = paths[sourceKey(url)];
    if (!eds) { report[url] = { skipped: 'not a page in scope' }; return; }
    const c = capture[urlKey(url)];
    if (c && c.status !== 'ok') { report[url] = { eds, skipped: `${c.status} on the source (HTTP ${c.http}${c.finalUrl ? ` ${c.finalUrl}` : ''})` }; return; }
    const snap = snapshotFile(url);
    if (!fs.existsSync(snap)) { report[url] = { eds, skipped: 'no snapshot' }; return; }
    const { html, report: r } = convert(fs.readFileSync(snap, 'utf8'), url);
    const doc = docOf(eds);
    report[url] = { eds, doc, ...r };
    if (!argv.includes('--dry-run')) {
      const out = path.join(OUT, `${doc}.plain.html`);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      const before = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : null;
      if (before !== html) { fs.writeFileSync(out, html); report[url].changed = before === null ? 'new' : 'changed'; }
    }
    written.push(doc);
  });
  if (!argv.includes('--dry-run')) {
    writeJson(path.join(W, 'runs', `${name}-import.json`), report);
    fs.writeFileSync(path.join(W, 'runs', `${name}-paths.txt`), `${written.join('\n')}\n`);
    writeJson(path.join(ASSETS, 'files.json'), files);
    const listPath = path.join(root, 'tools/importer/sites/lh-airdolomiti.json');
    const allow = readJson(listPath, {
      site: 'moved-permanently/lh-airdolomiti',
      source: 'www.airdolomiti.it, www.airdolomiti.eu (/en/), www.airdolomiti.de (/de/): Air Dolomiti, plan content-sites/lh-airdolomiti/plan.md',
      paths: [],
      patterns: ['^(/en|/de)?/(nav|footer)$'],
    });
    allow.paths = [...new Set([...allow.paths, ...written])].sort();
    writeJson(listPath, allow);
  }
  const blocks = {};
  const generic = new Set();
  Object.values(report).forEach((r) => {
    Object.entries(r.blocks || {}).forEach(([b, n]) => { blocks[b] = (blocks[b] || 0) + n; });
    (r.generic || []).forEach((g) => generic.add(g));
  });
  const missing = new Set(Object.values(report).flatMap((r) => r.missing || []));
  console.log(`${name}: ${written.length} documents, ${Object.values(report).filter((r) => r.skipped).length} skipped, ${missing.size} files not downloaded yet`);
  console.log('blocks:', JSON.stringify(blocks));
  if (generic.size) console.log('generic:', [...generic].join(', '));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
