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
 * - the homepage's slider (BannerSlide items): hero-campaign (slider), behind a visually hidden
 *   H1 (section style hidden-heading; www's H1 is none); BannerCarousel: hero-campaign (narrow),
 *   (slider, narrow) with several slides;
 * - HeroCard: hero-campaign (narrow) at the top of a page, else hero-card-overlay;
 * - Heading (the page's first: its H1), HeadingSection (H2), RichTextBlock: default content, the
 *   CTAs as buttons (primary bold, secondary plain), tables as table-striped;
 * - AccordionItemsList, the FAQ's CategoryAccordion (a heading per category and subcategory),
 *   the alerts page's list: accordion-columns (faq);
 * - GenericCardList: cards (text cards), cards-teaser (image cards; three-up, four-up by
 *   itemsPerRow), carousel-cards (desktopType carousel); ClientNeedsCardList: carousel-cards;
 *   AuxiliaryCarousel: cards-icon; Miles_GoCardList, FeatureCard, InfoSection, BannerVideo:
 *   columns-media; MilesStatusCardList: cards; LinkList: a list of links (jump-links when all are
 *   anchors on the page); InfoBlock: a highlight section; CardInfoBlock: default content;
 *   YoutubeVideo: embed;
 * - www's live widgets (WidgetFreeBlock: Smartvel's explorer; ContactsByCountry: the contacts
 *   picker; CoreMedia: the flight extras widget): a link to the page on www, reported;
 * - any other component: its titles, texts, images and links in order (reported as generic).
 * Out of scope (no document, links to www): the registration form (template register).
 * A page over 900 KB of HTML (the content bus takes 1 MB a document; /pt-pt/destinos/inspire-se's
 * destination themes are 2 MB): each category of its CategoryAccordion a fragment document
 * (/<locale>/fragments/<page>/<category>), the page a heading and a fragment block per category.
 * Links: pages of the site (those of the archives given that are imported) relative, www's
 * anchors to the headings' ids (anchorsOf), the rest absolute on www.flytap.com (the
 * "pt_[market]" placeholder filled with the page's market).
 * Images: the media archives' files (tap-media-NNN.tar.gz, unpacked, by every URL they were seen
 * under), copied to content-sites/lh-tap/content/media-da/tap/ (da-upload.mjs sends them with the
 * pages); a file over Edge Delivery's limits (images and PDFs 20 MB, mp4 36 MB) is linked on the
 * source and listed; an image without a file is left out and listed (missing; with
 * --source-images it stays on www's image host instead, which the preview would fetch).
 * Writes content-sites/lh-tap/runs/<name>-import.json, <name>-paths.txt (new or changed
 * documents) and the allowlist tools/importer/sites/lh-tap.json.
 *
 * Usage: node tools/importer/tap-import.mjs --archive <unpacked pages archive> [--archive ...]
 *          [--media <unpacked media archive> ...] [--name batch-1] [--source-images] [--dry-run]
 *        (archives in the index's order: a later one replaces pages of an earlier one)
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const W = path.join(root, 'content-sites/lh-tap');
const OUT = path.join(W, 'content');
export const WWW = 'https://www.flytap.com';
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
  pt: { onWww: 'Ver em flytap.com', video: 'Ver o vídeo' },
  en: { onWww: 'See on flytap.com', video: 'Watch the video' },
};
/** Page templates out of scope: no document (their links go to www). */
const OUT_TEMPLATES = { register: 'register: the TAP Miles&Go sign-up form (a form, out of scope)' };

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
  // www's widget anchors (#special-anchor-check-in opens its check-in form): the page on www
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

const INLINE = new Set(['text', 'link', 'line-break', 'span']);
const FORMAT = {
  strong: 'strong', bold: 'strong', emphasis: 'em', italic: 'em', underline: 'u', subscript: 'sub', superscript: 'sup',
};

function inline(n, c) {
  if (n.nodeType === 'text') {
    let s = esc(n.value);
    [...new Set(((n.format && n.format.variants) || []).map((v) => FORMAT[v]).filter(Boolean))].forEach((t) => { if (s.trim()) s = `<${t}>${s}</${t}>`; });
    return s;
  }
  if (n.nodeType === 'line-break') return '<br>';
  const inner = (n.content || []).map((x) => (INLINE.has(x.nodeType) ? inline(x, c) : flow([x], c, 'cell'))).join('');
  if (n.nodeType === 'link') {
    const href = linkOf(n.data && n.data.href, c);
    return href && inner.trim() ? `<a href="${attr(href)}">${inner}</a>` : inner;
  }
  return inner;
}

const tidy = (h) => h.replace(/^(\s*<br>)+|(<br>\s*)+$/g, '').trim();

function cellOfTable(n, c) {
  return tidy((n.content || []).map((x) => (INLINE.has(x.nodeType) ? inline(x, c) : flow([x], c, 'cell'))).join(''));
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
    let run = '';
    (li.content || []).forEach((x) => {
      if (INLINE.has(x.nodeType)) run += inline(x, c);
      else if (x.nodeType === 'paragraph') run += `${run ? '<br>' : ''}${(x.content || []).map((y) => inline(y, c)).join('')}`;
      else { if (run) { parts.push(tidy(run)); run = ''; } parts.push(flow([x], c, 'cell')); }
    });
    if (run) parts.push(tidy(run));
    return `<li>${parts.join('')}</li>`;
  });
  return `<${tag}>${items.join('')}</${tag}>`;
}

/** Block-level HTML of a node list; consecutive inline nodes become a paragraph. */
function flow(nodes, c, mode = 'top') {
  const out = [];
  let run = '';
  const close = () => { if (tidy(run)) out.push(`<p>${tidy(run)}</p>`); run = ''; };
  (nodes || []).forEach((n) => {
    if (!n || typeof n !== 'object') return;
    if (INLINE.has(n.nodeType)) { run += inline(n, c); return; }
    close();
    if (n.nodeType === 'paragraph') {
      const p = tidy((n.content || []).map((x) => (INLINE.has(x.nodeType) ? inline(x, c) : flow([x], c, 'cell'))).join(''));
      if (p.replace(/<br>/g, '').trim()) out.push(`<p>${p}</p>`);
    } else if (n.nodeType === 'header') {
      const lv = Math.min(6, Math.max(2, Number(String(n.style || 'h3').replace(/\D/g, '')) || 3));
      const h = tidy((n.content || []).map((x) => inline(x, c)).join('')).replace(/<\/?strong>/g, '');
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
    this.missing = new Set();
    this.linkedOut = new Set();
    this.generic = new Set();
    this.notes = [];
    this.fragments = [];
    this.h1 = false;
    this.cell = false;
  }

  get current() { return this.sections[this.sections.length - 1]; }

  section(style = null) {
    if (this.cell) return;
    if (!this.current.items.length) this.current.style = style;
    else this.sections.push({ style, items: [] });
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

  link(url, label, kind) {
    const href = linkOf(url, this.c);
    if (!href || !label) return '';
    const a = `<a href="${attr(href)}">${esc(label)}</a>`;
    return `<p>${kind === 'primary' ? `<strong>${a}</strong>` : a}</p>`;
  }

  ctas(o, pre = 'primaryCta', sec = 'secondaryCta') {
    return `${this.link(o[`${pre}Url`], o[`${pre}Label`], 'primary')}${this.link(o[`${sec}Url`], o[`${sec}Label`])}`;
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
    this.add(`<p><a href="${attr(`${WWW}${docPath(this.c.url)}`)}">${esc(LABELS[this.c.lang].onWww)}</a></p>`);
  }
}

const slideRows = (slides, P) => slides.flatMap((s) => [[P.img(s.image)], [
  `${P.heading(2, s.title)}${P.rich(s.description)}${P.link(s.buttonUrl, s.buttonLabel, 'primary')}${P.link(s.secondaryButtonUrl, s.secondaryButtonLabel)}`,
]]);

function cards(items, P, s) {
  const first = items[0] && items[0].__typename;
  if (first === 'SimpleGenericCardModel') {
    P.block('cards', items.map((x) => [`${x.icon ? P.img(x.icon) : ''}${P.heading(3, x.title)}${P.rich(x.description)}${P.ctas(x)}`]));
    return;
  }
  const rows = items.map((x) => {
    if (x.__typename === 'GenericCard2Model') {
      const links = (x.link || []).map((l) => `<li><a href="${attr(linkOf(l.url, P.c))}">${esc(l.label)}</a></li>`).join('');
      const cat = x.categoryUrl ? `<h3><a href="${attr(linkOf(x.categoryUrl, P.c))}">${esc(x.category || x.title)}</a></h3>` : P.heading(3, x.category || x.title);
      return [P.img(x.image), `${cat}${links ? `<ul>${links}</ul>` : ''}`];
    }
    const desc = x.genericCard1Description || x.genericCard2Description || x.description;
    return [P.img(x.image), `${x.category ? `<p>${esc(x.category)}</p>` : ''}${P.heading(3, x.title)}${P.rich(desc)}${x.date ? `<p>${esc(x.date)}</p>` : ''}${P.ctas(x)}`];
  });
  const carousel = s.desktopType === 'carousel';
  const per = { 3: ' (three-up)', 4: ' (four-up)' }[s.itemsPerRow] || '';
  P.block(carousel ? 'carousel-cards' : `cards-teaser${per}`, rows);
}

const HANDLERS = {
  ComponentSliderHomepageModel: (s, P) => {
    P.section('hidden-heading');
    P.add(P.heading(1, P.c.siteName));
    P.section();
    const slides = s.slides || [];
    P.block(slides.length > 1 ? 'hero-campaign (slider)' : 'hero-campaign', slideRows(slides, P));
    P.section();
  },
  ComponentBannerCarouselModel: (s, P) => {
    const slides = s.slides || [];
    P.section();
    P.block(slides.length > 1 ? 'hero-campaign (slider, narrow)' : 'hero-campaign (narrow)', slideRows(slides, P));
    P.section();
  },
  ComponentHeroCardModel: (s, P, i) => {
    const text = `${P.heading(2, s.title)}${P.rich(s.heroCardDescription)}${P.ctas(s)}`;
    P.section();
    P.block(i === 0 ? 'hero-campaign (narrow)' : 'hero-card-overlay', [[P.img(s.image)], [text]]);
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
    P.add(P.rich(s.headingSectionDescription));
  },
  ComponentRichTextBlockModel: (s, P) => {
    P.add(P.rich(s.richTextContent));
    P.add(P.ctas(s, 'cta', 'secondaryCta'));
  },
  ComponentAccordionItemsListModel: (s, P) => {
    P.add(P.heading(2, s.title));
    if (s.subtitle) P.add(`<p>${esc(s.subtitle)}</p>`);
    P.add(P.rich(s.accordionItemsListDescription));
    P.block('accordion-columns (faq)', (s.items || []).map((x) => [esc(x.label), `${richText(x.accordionItemDescription, P.c, 'cell')}${nested(x.sections, P)}`]));
    P.add(P.link(s.ctaUrl, s.ctaLabel, 'primary'));
  },
  ComponentCategoryAccordionModel: (s, P) => {
    const subs = (cat) => (cat.subCategories || []).map((sub) => `${P.heading(3, sub.label)}${blockHtml('accordion-columns (faq)', (sub.items || []).map((x) => [esc(x.question), `${richText(x.answer, P.c, 'cell')}${nested(x.sections, P)}${P.link(x.ctaUrl, x.ctaLabel)}`]))}`).join('');
    (s.categories || []).forEach((cat) => {
      P.add(P.heading(2, cat.label));
      // a page over the content bus's 1 MB (c.fragments): the category's accordions a fragment
      // document of the locale (/<locale>/fragments/<page>/<category>), the page a fragment block
      if (P.c.fragments) {
        const doc = `/${P.c.locale}/fragments/${docPath(P.c.url).split('/').pop()}/${slugOf(cat.label).normalize('NFD').replace(/[̀-ͯ]/g, '')}`;
        P.fragments.push({ doc, html: `<div>${subs(cat)}</div>\n` });
        P.block('fragment', [[`<a href="${attr(doc)}">${esc(doc)}</a>`]]);
        return;
      }
      P.blocks['accordion-columns (faq)'] = (P.blocks['accordion-columns (faq)'] || 0) + (cat.subCategories || []).length;
      P.add(subs(cat));
    });
  },
  ComponentGenericCardListModel: (s, P) => {
    P.add(P.heading(2, s.title));
    if (s.subtitle) P.add(`<p>${esc(s.subtitle)}</p>`);
    cards(s.items || [], P, s);
  },
  ComponentClientNeedsCardListModel: (s, P) => {
    P.add(P.heading(2, s.title));
    P.add(P.rich(s.clientNeedsCardListDescription));
    P.block('carousel-cards', (s.cards || []).map((x) => [P.img(x.image), `<h3><a href="${attr(linkOf(x.url, P.c))}">${esc(x.title)}</a></h3>`]));
  },
  ComponentAuxiliaryCarouselModel: (s, P) => {
    P.block('cards-icon', (s.items || []).map((x) => [P.img(x.icon), `<p><a href="${attr(linkOf(x.url, P.c))}">${esc(x.label)}</a></p>`]));
  },
  ComponentMiles_GoCardListModel: (s, P) => {
    P.block('columns-media', (s.milesAndGoCards || []).map((x) => [
      `${x.logo ? `<p>${P.img(x.logo)}</p>` : ''}${P.heading(2, x.title)}${x.subtitle ? `<p><strong>${esc(x.subtitle)}</strong></p>` : ''}${P.rich(x.milesAndGoCardDescription)}${P.ctas(x)}${P.rich(x.extrainfo)}`,
      P.img(x.image),
    ]));
  },
  ComponentFeatureCardModel: (s, P) => {
    const text = `${P.heading(2, s.title)}${P.rich(s.featureCardDescription)}${P.rich(s.complementaryNote)}${P.link(s.ctaUrl, s.ctaLabel, 'primary')}`;
    P.block('columns-media', [s.switchImageToRight ? [text, P.img(s.image)] : [P.img(s.image), text]]);
  },
  ComponentInfoSectionModel: (s, P) => {
    P.add(P.heading(2, s.title));
    P.block('columns-media', [[P.img(s.image), (s.infoList || []).map((x) => `${P.heading(3, x.label)}${richText(x.infodescription, P.c, 'cell')}`).join('')]]);
  },
  ComponentMilesStatusCardListModel: (s, P) => {
    P.block('cards', (s.cards || []).map((x) => [P.img(x.logo), `${P.heading(3, x.title)}${(x.topics || []).length ? `<ul>${x.topics.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>` : ''}${x.link ? P.link(x.link.url, x.link.label) : ''}`]));
  },
  ComponentLinkListModel: (s, P) => {
    P.add(P.heading(2, s.title));
    const links = (s.linkList || []).filter((l) => l.url && l.label);
    const items = links.map((l) => `<li><a href="${attr(linkOf(l.url, P.c))}">${esc(l.label)}</a></li>`).join('');
    if (links.length && links.every((l) => l.url.startsWith('#'))) P.block('jump-links', [[`<ul>${items}</ul>`]]);
    else if (items) P.add(`<ul>${items}</ul>`);
  },
  ComponentInfoBlockModel: (s, P) => {
    P.section('highlight');
    P.add(P.heading(3, s.title));
    P.add(P.rich(s.message));
    P.add(P.link(s.ctaUrl, s.ctaLabel));
    P.section();
  },
  ComponentCardInfoBlockModel: (s, P) => {
    P.add(P.heading(2, s.title));
    P.add(P.rich(s.cardInfoBlockDescription));
    P.add(P.ctas(s));
  },
  ComponentBannerVideoModel: (s, P) => {
    if (s.youtubeUrl) {
      P.add(P.heading(2, s.title));
      P.block('embed', [[`<a href="${attr(s.youtubeUrl)}">${esc(s.title || s.youtubeUrl)}</a>`]]);
      return;
    }
    const v = s.video || {};
    const keys = [v._path, v._publishUrl, v._authorUrl && v._authorUrl.replace(/^https:\/\/author-/, 'https://publish-')].filter(Boolean);
    const local = mediaOf(P.c, keys);
    const src = local && !local.link ? local.eds : (v._publishUrl || (v._authorUrl || '').replace(/^https:\/\/author-/, 'https://publish-'));
    if (!local) P.missing.add(src);
    if (local && local.link) P.notes.push(`${src}: ${local.link}`);
    const label = s.buttonLabel || LABELS[P.c.lang].video;
    P.block('columns-media', [[`${P.img(s.backgroundImage)}${src ? `<p><a href="${attr(src)}">${esc(label)}</a></p>` : ''}`, `${P.heading(2, s.title)}${P.rich(s.bannerVideoDescription)}${s.bannerVideoCaption ? `<p>${esc(plainOf(s.bannerVideoCaption))}</p>` : ''}`]]);
  },
  ComponentYoutubeVideoModel: (s, P) => {
    const u = s.youtubeUrl || s.url || s.videoUrl;
    if (u) P.block('embed', [[`<a href="${attr(u)}">${esc(s.title || u)}</a>`]]);
  },
  ComponentWidgetFreeBlockModel: (s, P) => P.onWww('WidgetFreeBlock (Smartvel destinations explorer)'),
  ComponentContactsByCountryModel: (s, P) => { P.add(P.heading(2, s.title)); P.onWww('ContactsByCountry (the contacts by country picker)'); },
  ComponentCoreMediaModel: (s, P) => P.onWww(`CoreMedia (${s.type})`),
  ComponentAnchorModel: () => {},
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
 * @param {{url: string, lang?: string, locale?: string, scope: Set<string>,
 *   media: (key: string) => (string|{eds?: string, link?: string}|null),
 *   anchors?: Map<string, Map<string, string>>, siteName?: string}} site
 */
export function convertPage(nd, site) {
  const locale = site.locale || localeOf(site.url);
  const c = {
    lang: langOf(locale), locale, anchors: new Map(), siteName: 'TAP Air Portugal', ...site,
  };
  const pp = (nd.props && nd.props.pageProps) || {};
  const page = pp.page || {};
  if (OUT_TEMPLATES[page.template]) return { skipped: OUT_TEMPLATES[page.template] };
  const P = new Page(c);
  const secs = [...(page.topSections || []), ...(page.sections || [])];
  if (page.slider) render(page.slider, P, -1);
  secs.forEach((s, i) => render(s, P, page.slider ? i + 1 : i));
  // the alerts page: www's alerts list (dynamicData) as an accordion, in its order
  const alerts = page.template === 'alerts' && page.dynamicData && page.dynamicData.alertList ? page.dynamicData.alertList.items || [] : [];
  if (alerts.length) {
    P.block('accordion-columns (faq)', [...alerts].sort((a, b) => (Number(a.weight) || 0) - (Number(b.weight) || 0)).map((x) => [esc(x.title), richText(x.content, c, 'cell')]));
  }
  let docs = P.sections.filter((s) => s.items.length);
  if (!docs.length) return { skipped: `no content (template ${page.template || page.__typename})` };
  if (!P.h1) {
    docs[0].items.unshift({ html: `<h1>${esc(page.title || String(page.seoTitle || '').replace(/\s*\|\s*TAP Air Portugal\s*$/, ''))}</h1>` });
    P.notes.push('no heading on the page: H1 from its title');
  }
  const meta = [['Title', esc(page.seoTitle || page.title || '')]];
  const desc = plainOf(page.seoDescription);
  if (desc) meta.push(['Description', esc(desc.trim())]);
  if (page.seoImage) { const im = P.img(page.seoImage); if (im) meta.push(['Image', im]); }
  if (page.seoIndexablePage === false) meta.push(['Robots', 'noindex, follow']);
  meta.push(['Nav', `/${locale}/nav`], ['Footer', `/${locale}/footer`], ['Language', c.lang]);
  docs = docs.map((s, i) => {
    const body = s.items.map((it) => it.html).join('');
    const sm = s.style ? blockHtml('section-metadata', [['Style', s.style]]) : '';
    const md = i === docs.length - 1 ? blockHtml('metadata', meta) : '';
    return `<div>${body}${sm}${md}</div>`;
  });
  let h1s = 0;
  const html = docs.join('\n').replace(/<(\/?)h1>/g, (x, close) => {
    if (!close) h1s += 1;
    return h1s > 1 ? `<${close}h2>` : x;
  });
  return {
    html: `${html}\n`,
    fragments: P.fragments,
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

/** The media archives' files by every URL (and URL path) they were seen under. */
function mediaIndex(dirs) {
  const idx = new Map();
  dirs.forEach((dir) => {
    const m = readJson(path.join(dir, 'manifest.json'), []);
    (Array.isArray(m) ? m : m.files || []).forEach((e) => {
      const file = e.file ? fileOf(dir, e) : path.join(dir, new URL(e.url).host, new URL(e.url).pathname);
      const entry = { ...e, local: file };
      [e.url, ...(e.urls || e.seen || [])].filter(Boolean).forEach((u) => {
        idx.set(u, entry);
        try { const x = new URL(u); idx.set(x.pathname, entry); idx.set(`${x.origin}${x.pathname}`, entry); } catch (err) { /* a path */ idx.set(u.split('?')[0], entry); }
      });
    });
  });
  return idx;
}

function main() {
  const argv = process.argv.slice(2);
  const all = (n) => argv.flatMap((a, i) => (a === `--${n}` ? [path.resolve(argv[i + 1])] : []));
  const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
  const archives = all('archive');
  if (!archives.length) { console.log('usage: --archive <unpacked pages archive> [--archive ...] [--media <dir> ...] [--name batch-1] [--dry-run]'); process.exit(1); }
  const name = opt('name') || 'batch';
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
  const scope = new Set(nds.keys());
  const anchors = new Map([...nds].map(([doc, p]) => [doc, anchorsOf(p.nd)]));
  const idx = mediaIndex(all('media'));
  const media = (key) => {
    const e = idx.get(key) || idx.get(`${PIC}${key}`);
    if (!e || !fs.existsSync(e.local)) return null;
    const type = String(e.type || e.contentType || '').split(';')[0];
    const bytes = e.bytes || fs.statSync(e.local).size;
    const limit = type === 'video/mp4' ? 36 * MB : 20 * MB;
    if (bytes > limit) return { link: `${(bytes / MB).toFixed(1)} MB: over Edge Delivery's ${limit / MB} MB, linked on the source` };
    const ext = EXT[type] || path.extname(e.local).slice(1) || 'bin';
    const eds = `/media-da/tap/${baseName(e.url)}-${sha1(e.url).slice(0, 8)}.${ext}`;
    if (!dry) {
      const out = path.join(OUT, eds);
      if (!fs.existsSync(out)) { fs.mkdirSync(path.dirname(out), { recursive: true }); fs.copyFileSync(e.local, out); }
    }
    return { eds };
  };
  const written = [];
  const write = (doc, html) => {
    if (dry) return null;
    const out = path.join(OUT, `${doc}.plain.html`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const before = fs.existsSync(out) ? fs.readFileSync(out, 'utf8') : null;
    if (before === html) return null;
    fs.writeFileSync(out, html);
    written.push(doc);
    return before === null ? 'new' : 'changed';
  };
  // the content bus takes at most 1 MB of HTML a document (preview 409 above): a larger page's
  // category accordions go to fragment documents
  const LIMIT = 900 * 1024;
  nds.forEach((p, doc) => {
    const site = {
      url: p.url, scope, media, anchors, sourceImages: argv.includes('--source-images'),
    };
    let r = convertPage(p.nd, site);
    if (!r.skipped && Buffer.byteLength(r.html) > LIMIT) r = convertPage(p.nd, { ...site, fragments: true });
    if (r.skipped) { report[p.url] = { doc, skipped: r.skipped }; return; }
    report[p.url] = { doc, ...r.report };
    const big = [r, ...r.fragments].filter((x) => Buffer.byteLength(x.html) > LIMIT);
    if (big.length) report[p.url].notes.push(`over 900 KB of HTML (the content bus takes 1 MB): ${big.map((x) => x.doc || doc).join(', ')}`);
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

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
