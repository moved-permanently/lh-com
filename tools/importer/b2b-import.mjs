/* eslint-disable no-console, max-len, no-bitwise, import/prefer-default-export, import/extensions, no-use-before-define, import/no-extraneous-dependencies -- tooling */
/**
 * Imports one batch of Lufthansa Group for Business' pages (lh-b2b) offline from their snapshots
 * (tools/importer/bd-snapshots/business.lufthansagroup.com: the Studio's capture, b2b-studio.mjs)
 * with lh-com's import scripts into content-sites/lh-b2b/content, as brussels-import.mjs: per
 * page the template (templateOf: lh-com's info template; B2B's pages have none of lh-com's homepage
 * widgets), then site-postprocess.mjs and own-links.mjs, after adding the batch's documents to the
 * allowlist tools/importer/sites/lh-b2b.json. Per document (one per language page, option B):
 * - B2B's own components get a class only this importer gives (withB2bComponents), which the
 *   templates' B2B selectors take: the icon modules (b2b-iconmodules: cards-icon-text, stacked),
 *   the stage (b2b-stage: hero-card-overlay), the inspirational stage (b2b-inspirationalstage:
 *   hero-campaign); the author quote as its text and name, after the import the shared quote
 *   block (withB2bQuotes);
 * - the phone list of the contact page (dcep-ppb-hotlinebox: rendered in the browser from
 *   Lufthansa's contact catalog) as the hotline-finder block (withHotlines, withHotlineFinder);
 * - e-mail addresses Cloudflare obfuscated (/cdn-cgi/l/email-protection#..., __cf_email__) as
 *   mailto: links and their text (withEmails);
 * - a column view holding a stage as a columns-media block of option stage, the stage in its
 *   half as www's (withStageColumnMarkers, withStageColumns);
 * - a one-column view holding column views as a columns-media block of option nested, its rows
 *   as www's nested views (withNestedColumnMarkers, withNestedColumns; the brief after 526);
 * - a tab set holding blocks (the Newsroom's categories: maui-tab-control-responsive) as Tab
 *   sections, swiss-import.mjs's withTabMarkers and splitTabSections (scripts/section-tabs.js);
 * - the pre-login search: the search bar and the results widget as one search-results block
 *   (the site search, /<root>/search-index.json);
 * - the core forms get a form config row with the lh-forms id b2b-<page> and their success page
 *   (www's :redirect; preview only until lh-forms knows them);
 * - metadata: the nav and footer of the document's language version, `markets` (scope.json),
 *   www's noindex;
 * - document names without "--" (b2b-scope.mjs docName; runs/redirects.tsv);
 * - links to www's DAM files become site-relative edsDamPath links (b2b-dam.mjs); SVG images Edge
 *   Delivery refuses are their PNG renderings in DA (LOCAL_IMAGES).
 * Writes content-sites/lh-b2b/runs/<name>-import.json: path -> template.
 *
 * Usage: node tools/importer/b2b-import.mjs --list content-sites/lh-b2b/runs/batch-01.txt [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import {
  ownPages, ownAliases, withOwnLinks, onlyBatch,
} from './own-links.mjs';
import {
  PLACEHOLDER, withPlaceholder, withoutLoads, divEnd, withMetadataRows,
} from './brussels-import.mjs';
import { docName, LANGUAGE_VERSIONS } from './b2b-scope.mjs';
import { relativeDamLinks } from './b2b-dam.mjs';
import { labelsOf, imageOf } from './b2b-hotlines.mjs';
import { withTabMarkers, splitTabSections } from './swiss-import.mjs';
import { stripScripts } from './excat-plugin.mjs';
import collapseDocs from './collapse-docs.mjs';
import { withRestoredNbsp } from './nbsp-guard.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
export const HOST = 'business.lufthansagroup.com';
const W = path.join(root, 'content-sites/lh-b2b');
const SNAP = path.join(root, 'tools/importer/bd-snapshots', HOST);
const CI = '/home/node/.excat-marketplaces/excat-marketplace/excat/skills/excat-content-import/scripts';
const MAPPED = path.join(W, 'snapshots-mapped');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const clean = (s) => String(s || '').replace(/[\u200B-\u200D\uFEFF]/g, '').replace(/\s+/g, ' ').trim();

/** The html with each div whose opening tag starts with `open` given to `edit` (its outer html). */
export function editDivs(html, open, edit) {
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

/** Cloudflare's e-mail obfuscation: the hex string decoded (the first byte is the XOR key). */
export function decodeCfEmail(hex) {
  const key = parseInt(hex.slice(0, 2), 16);
  let out = '';
  for (let i = 2; i < hex.length; i += 2) out += String.fromCharCode(parseInt(hex.slice(i, i + 2), 16) ^ key);
  return out;
}

/** The obfuscated addresses as mailto: links and plain text, as www's readers see them. */
export function withEmails(html) {
  return html
    .replace(/href="(?:https?:\/\/[^"/]+)?\/cdn-cgi\/l\/email-protection#([0-9a-f]+)"/gi, (m, hex) => `href="mailto:${esc(decodeCfEmail(hex))}"`)
    .replace(/<span class="__cf_email__" data-cfemail="([0-9a-f]+)">[^<]*<\/span>/gi, (m, hex) => esc(decodeCfEmail(hex)))
    .replace(/<a\b[^>]*href="(?:https?:\/\/[^"/]+)?\/cdn-cgi\/l\/email-protection"[^>]*>\s*\[email[^\]]*\]\s*<\/a>/gi, '');
}

/**
 * B2B's components: the classes the templates' B2B selectors take (the column row of icon
 * modules, the stage, the inspirational stage), the author quote as its text and name.
 */
export function withB2bComponents(html) {
  let out = html;
  // a column row whose items are icon modules (no column row nested in it): the row is the block
  ['twocolumn', 'threecolumn', 'fourcolumn'].forEach((col) => {
    out = editDivs(out, `<div class="${col}`, (el) => (/class="iconmodule\b/.test(el) && !/<div class="(?:two|three|four)column/.test(el.slice(1))
      ? el.replace(`<div class="${col}`, `<div class="b2b-iconmodules ${col}`) : el));
  });
  out = editDivs(out, '<div class="stage ', (el) => (/class="stage-teaser"/.test(el) ? el.replace('<div class="stage ', '<div class="b2b-stage stage ') : el));
  out = out.replace(/<div class="inspirationalstage(["\s])/g, '<div class="b2b-inspirationalstage inspirationalstage$1');
  out = editDivs(out, '<div class="authorquote', (el) => {
    const { document } = parseHTML(`<html><body>${el}</body></html>`);
    const quote = clean(document.querySelector('.quote-text')?.textContent);
    const name = clean(document.querySelector('.subline-text')?.textContent);
    if (!quote) return '';
    return `<div class="text section"><div class="richtext"><p>${esc(quote)}</p>${name ? `<p>${esc(name)}</p>` : ''}</div></div>`;
  });
  return out;
}

const reEscape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The author quotes of a document as the shared quote block (the quote, then the name): the two
 * paragraphs withB2bComponents made of the page's .quote-text and .subline-text (a paragraph
 * style token after each, as the import leaves it, dropped), where they are a section's content;
 * a quote in a block's cell (Jägermeister's, beside an image in columns-media) stays as it is: a
 * block in a block is not decorated. A page without one as it was.
 */
export function withB2bQuotes(doc, html = '') {
  const { document } = parseHTML(`<html><body>${html}</body></html>`);
  // the section's own content: one <div> open before it (the section's)
  const inSection = (s, at) => (s.slice(0, at).match(/<div\b/g) || []).length - (s.slice(0, at).match(/<\/div>/g) || []).length === 1;
  return [...document.querySelectorAll('.quote-text')].reduce((out, q) => {
    const quote = esc(clean(q.textContent));
    const name = esc(clean(q.parentElement.querySelector('.subline-text')?.textContent));
    if (!quote) return out;
    const token = '(?: \\{[^}<]*\\})?';
    const m = out.match(new RegExp(`<p>${reEscape(quote)}${token}</p>${name ? `<p>${reEscape(name)}${token}</p>` : ''}`));
    if (!m || !inSection(out, m.index)) return out;
    const block = `<div class="quote"><div><div><p>${quote}</p></div></div>${name ? `<div><div><p>${name}</p></div></div>` : ''}</div>`;
    return `${out.slice(0, m.index)}${block}${out.slice(m.index + m[0].length)}`;
  }, doc);
}

/**
 * The phone box (.hotlinenumberdisplay > .dcep-ppb-hotlinebox: a country select whose contact www
 * fetches in the browser) as a marker with the box's heading, "[hotline-finder] <heading>": after
 * the import the hotline-finder block (withHotlineFinder), the countries from lh-b2b's
 * /data/hotlines.json (tools/importer/b2b-hotlines.mjs).
 */
export function withHotlines(html) {
  return editDivs(html, '<div class="hotlinenumberdisplay', (el) => {
    const { document } = parseHTML(`<html><body>${el}</body></html>`);
    const head = [...document.querySelectorAll('maui-headline')].find((h) => !h.closest('.support-contact') && clean(h.textContent));
    return `<div class="text section"><div class="richtext"><p>[hotline-finder]${head ? ` ${esc(clean(head.textContent))}` : ''}</p></div></div>`;
  });
}

export const HOTLINE_SHEET = '/data/hotlines.json';

/**
 * The phone box's marker as the hotline-finder block: the sheet, the box's heading, the labels
 * of the document's language (b2b-hotlines.mjs labelsOf: the select's label, the contact's and the
 * opening hours' headings, the day names), the box's image (its copy in DA); a row without a text
 * is left out. Its section grey (www's full-width grey band) unless it has section metadata.
 */
export function withHotlineFinder(doc, labels = {}, image = '') {
  const m = doc.match(/<p>\[hotline-finder\]\s*([^<]*)<\/p>/);
  if (!m) return doc;
  const row = (k, v) => (v ? `<div><div>${k}</div><div>${v}</div></div>` : '');
  const block = `<div class="hotline-finder">${row('Sheet', `<a href="${HOTLINE_SHEET}">${HOTLINE_SHEET}</a>`)}${row('Headline', m[1].replace(/\s*\{[^}]*\}\s*$/, '').trim())}${row('Select', esc(labels.select || ''))}${row('Contact', esc(labels.contact || ''))}${row('Hours', esc(labels.hours || ''))}${row('Days', esc((labels.days || []).join(', ')))}${row('Image', image ? `<picture><img src="${esc(image)}" alt=""></picture>` : '')}</div>`;
  let out = `${doc.slice(0, m.index)}${block}${doc.slice(m.index + m[0].length)}`;
  // the top-level div (the section) the block is in
  for (let i = out.indexOf('<div'); i >= 0 && i <= m.index; i = out.indexOf('<div', divEnd(out, i))) {
    const end = divEnd(out, i);
    if (m.index < end) {
      const section = out.slice(i, end);
      if (!section.includes('class="section-metadata"')) {
        out = `${out.slice(0, end - 6)}<div class="section-metadata"><div><div>style</div><div>grey</div></div></div>${out.slice(end - 6)}`;
      }
      break;
    }
  }
  return out;
}

export function withSearch(html) {
  const hasResults = /class="dcep-b2b-neo-search-results-aem/.test(html);
  return editDivs(html, '<div class="searchbar', () => (hasResults ? '' : '<div class="onsitesearchresult"><div class="dcep-b2b-neo-search-results-aem"></div></div>'));
}

// the core forms: the lh-forms id per page name (b2b-<page>; preview only until lh-forms knows it)
export const formIdOf = (p) => `b2b-${p.split('/').pop().replace(/[^a-z0-9-]/gi, '-').toLowerCase()}`;
const CONFIG_ROW = /<div><div>(?:(?!<\/div><div>)[\s\S])*?<\/div><div>config<\/div><div>(?:form|success|error)<\/div>(?:<div><\/div>){7}<\/div>/g;
const ERROR_ROW = /<div><div>(?:(?!<\/div><div>)[\s\S])*?<\/div><div>config<\/div><div>error<\/div>(?:<div><\/div>){7}<\/div>/g;
const configRow = (name, value) => `<div><div>${value}</div><div>config</div><div>${name}</div>${'<div></div>'.repeat(7)}</div>`;
const linkRow = (name, href) => configRow(name, `<a href="${href}">${href}</a>`);

/** www's confirmation page of a form (its :redirect, /content/B2Bneo/markets/...) as the site path. */
export function successOf(html) {
  const redirect = (String(html || '').match(/name=":redirect"[^>]*value="([^"]+)"|value="([^"]+)"[^>]*name=":redirect"/) || []).slice(1).find(Boolean) || '';
  const m = redirect.match(/^\/content\/B2Bneo\/markets(\/[a-z]{2}\/[a-z]{2})(\/.+?)(?:\.html)?$/i);
  return m ? docName(`${m[1]}${m[2]}`) : '';
}

/** A form document with its form config row (the lh-forms id) and its success row; no error row. */
export function withB2bForm(doc, p, html = '') {
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
  return out.replace(ERROR_ROW, '');
}

/**
 * The document's metadata: nav and footer of its language version (a market root's documents, xx's
 * and the own ones, have the menu of de/<ll>: www's is the same on every root), its markets, www's
 * noindex.
 */
export function withB2bMetadata(doc, p, html, markets = []) {
  const key = p.split('/').slice(1, 3).join('/');
  const nav = LANGUAGE_VERSIONS[key.split('/')[1]] || key;
  const rows = [['nav', `/${nav}/nav`], ['footer', `/${nav}/footer`]];
  if (markets.length) rows.push(['markets', markets.join(', ')]);
  const robots = ((html || '').match(/<meta name="robots" content="([^"]*)"/i) || [])[1] || '';
  if (/noindex/i.test(robots)) rows.push(['Robots', robots.split(',').map((x) => x.trim()).filter(Boolean).join(', ')]);
  return withMetadataRows(doc, rows);
}

// www's SVG images Edge Delivery refuses at preview (a raster picture embedded, 114 KB to 1 MB:
// 409 from the content bus, /<root>/about-us/lhg-history/lhg-history-alliances-and-joint-ventures):
// their rendering at the SVG's own size, a PNG in DA (da-upload.mjs uploads /media-da/)
const WEBHUB = '/content/dam/b2b/100y_webhub/04-joint-ventures';
export const LOCAL_IMAGES = Object.fromEntries([
  '01_Founding Star Alliance_Teaser-1440x960', '02_Deepening ties-2010_Teaser-1440x512', '02_Deepening ties-2012_Teaser-1440x512',
  '02_Deepening ties-2017_Teaser-1440x512', '02_Deepening ties-2017-2_Teaser-1440x512',
].map((f) => [`${WEBHUB}/${f}.svg`, `/media-da/b2b/${f.replace(/ /g, '-').toLowerCase()}.png`]));

/** A document's images Edge Delivery refuses (LOCAL_IMAGES) as their PNG renderings. */
export const withLocalImages = (doc) => doc.replace(/<img src="(?:https:\/\/business\.lufthansagroup\.com)?(\/content\/dam\/[^"?]+\.svg)"/g, (m, src) => {
  let www = src;
  try { www = decodeURIComponent(src); } catch (e) { /* as it is */ }
  return LOCAL_IMAGES[www] ? `<img src="${LOCAL_IMAGES[www]}"` : m;
});

/**
 * www's hidden helper links: a link holding only its screen-reader note ("The link will be opened
 * in a new browser tab", pointing to /gc/en/...) and an empty link, as the de/de raffle's terms
 * note has them before the real link; the import made the note the link's text. www's "opens in
 * a new tab" icon (lh-link-popup) counts as part of the helper (terms-and-conditions-traveller);
 * a link with another icon or an image keeps it.
 */
export const withoutHelperLinks = (html) => html
  .replace(/<a\b[^>]*>(?:\s|&nbsp;|<span class="sr-only">[^<]*<\/span>|<(i|em) class="lh lh-link-popup"><\/\1>)*<\/a>/g, '');

const stageMarker = (label) => `<div class="text section"><div class="richtext"><p>${label}</p></div></div>`;
// (the import's cleanup may write a text style after a marker: "@@stage-columns@@light@@ {full-width}")
const STAGE_MARK = /^@@stage-columns@@(light|default)@@(?:\s*\{[^}]*\})?$/;
const STAGE_END = /^@@stage-columns-end@@(?:\s*\{[^}]*\})?$/;

/**
 * A column view that holds a stage (www's .stage > .stage-teaser in a column item: partner-plus-
 * benefit, eXperts, hygiene-and-safety) between two marker paragraphs, the opening one naming the
 * variant (light: .stage-teaser-link-light, white text on a black gradient); withStageColumns makes
 * the run between them one columns-media block after the import.
 */
export function withStageColumnMarkers(html) {
  let out = html;
  ['twocolumn', 'threecolumn', 'fourcolumn'].forEach((col) => {
    out = editDivs(out, `<div class="${col}`, (el) => {
      if (!/class="stage-teaser"/.test(el) || el.includes('@@stage-columns')) return el;
      const variant = /stage-teaser-link-light/.test(el) ? 'light' : 'default';
      return `${stageMarker(`@@stage-columns@@${variant}@@`)}${el}${stageMarker('@@stage-columns-end@@')}`;
    });
  });
  return out;
}

// a one-column view that holds column views (www's airline rows: two-item views inside one view)
const NESTED_MARK = /^@@nested-columns@@(?:\s*\{[^}]*\})?$/;
const NESTED_END = /^@@nested-columns-end@@(?:\s*\{[^}]*\})?$/;

/**
 * A one-column view whose items hold column views (travel-solutions/lufthansa-group-airlines: the
 * airlines' two-item views inside one view, 83 px apart on www; the homepage's top-level views, a
 * separator between, are 106 apart) between two marker paragraphs; withNestedColumns gives the
 * columns-media block made of it the option nested (b2b.css). The brief after 526, B2B row 36.
 */
export function withNestedColumnMarkers(html) {
  if (html.includes('@@nested-columns')) return html;
  return editDivs(html, '<div class="onecolumn', (el) => {
    if (!/class="col[^"]*column-view-item[^"]*"[\s\S]*?<div class="(?:two|three|four)column/.test(el)) return el;
    return `${stageMarker('@@nested-columns@@')}${el}${stageMarker('@@nested-columns-end@@')}`;
  });
}

/** The columns-media blocks between the nested-view markers (withNestedColumnMarkers) as option nested; the markers go. */
export function withNestedColumns(doc) {
  if (!doc.includes('@@nested-columns')) return doc;
  const { document } = parseHTML(`<html><body>${doc}</body></html>`);
  const isMark = (el, re) => el.tagName === 'P' && re.test(el.textContent.trim());
  const all = [...document.body.querySelectorAll('*')];
  let inside = false;
  all.forEach((el) => {
    if (isMark(el, NESTED_MARK)) { inside = true; el.remove(); return; }
    if (isMark(el, NESTED_END)) { inside = false; el.remove(); return; }
    if (inside && el.matches('div.columns-media') && !el.classList.contains('nested')) el.classList.add('nested');
  });
  return document.body.innerHTML;
}

/** An element's trailing marker without the column-view tokens (the block keeps its own spacing). */
const withoutColumnTokens = (el) => {
  const walker = el.ownerDocument.createTreeWalker(el, 4);
  let last = null;
  for (let n = walker.nextNode(); n; n = walker.nextNode()) if (n.nodeValue.trim()) last = n;
  if (!last) return;
  last.nodeValue = last.nodeValue.replace(/\s*\{([a-z0-9 -]+)\}\s*$/, (m, tokens) => {
    const rest = tokens.trim().split(/\s+/).filter((t) => !/^column-(?:start|end)(?:-outer)?$|^column-spaced$/.test(t));
    return rest.length ? ` {${rest.join(' ')}}` : '';
  });
};

/**
 * The stage column views (withStageColumnMarkers) as columns-media blocks of option stage (light):
 * a cell per stage (the import's hero-card-overlay: its picture linked to the stage's target, the
 * headline, the subheadline as an h3, the button) and a cell per run of other content, in www's
 * order; the column view's markers inside go. Styles: styles/themes/b2b.css.
 */
export function withStageColumns(doc) {
  if (!doc.includes('@@stage-columns')) return doc;
  const { document } = parseHTML(`<html><body>${doc}</body></html>`);
  const isMark = (el, re) => el && el.tagName === 'P' && re.test(el.textContent.trim());
  [...document.querySelectorAll('p')].filter((p) => isMark(p, STAGE_MARK)).forEach((start) => {
    const variant = start.textContent.trim().match(STAGE_MARK)[1];
    const run = [];
    let end = start.nextElementSibling;
    while (end && !isMark(end, STAGE_END)) { run.push(end); end = end.nextElementSibling; }
    const cells = [];
    let text = null;
    run.forEach((el) => {
      if (el.matches('div.hero-card-overlay')) {
        text = null;
        const picture = el.querySelector('picture');
        const body = el.querySelectorAll(':scope > div')[1]?.firstElementChild;
        const kids = body ? [...body.children] : [];
        const link = [...(body ? body.querySelectorAll('a[href]') : [])].pop();
        const cell = [];
        if (picture) cell.push(link ? `<p><a href="${link.getAttribute('href')}">${picture.outerHTML}</a></p>` : `<p>${picture.outerHTML}</p>`);
        kids.forEach((k) => {
          if (/^H[1-6]$/.test(k.tagName) && !cell.some((c) => c.startsWith('<h'))) cell.push(k.outerHTML);
          else if (k.tagName === 'P' && !k.querySelector('a') && !cell.some((c) => c.startsWith('<h3'))) cell.push(`<h3>${k.innerHTML}</h3>`);
          else cell.push(k.outerHTML);
        });
        cells.push(cell);
        return;
      }
      if (el.tagName === 'P' && /^\{[a-z0-9 -]+\}$/.test(el.textContent.trim()) && /column-/.test(el.textContent)) return;
      withoutColumnTokens(el);
      if (!text) { text = []; cells.push(text); }
      text.push(el.outerHTML);
    });
    const block = document.createElement('div');
    block.className = `columns-media stage${variant === 'light' ? ' light' : ''}`;
    block.innerHTML = `<div>${cells.map((c) => `<div>${c.join('')}</div>`).join('')}</div>`;
    start.before(block);
    [start, ...run, end].filter(Boolean).forEach((el) => el.remove());
  });
  return document.body.innerHTML;
}

/** The ranges [start, end) of a document's top-level <div> elements, in order. */
const topDivs = (doc) => {
  const out = [];
  let depth = 0;
  let start = 0;
  [...doc.matchAll(/<(\/?)div\b[^>]*>/g)].forEach((m) => {
    if (!m[1]) {
      if (!depth) start = m.index;
      depth += 1;
    } else {
      depth -= 1;
      if (!depth) out.push([start, m.index + m[0].length]);
    }
  });
  return out;
};

const TAB_ROW = /<div><div>Tabs?<\/div><div>[^<]*<\/div><\/div>/g;

/**
 * A tab panel whose content is a section of its own (the Newsroom's categories: each panel a grey
 * AEM section, so the import leaves a section holding only the panel's Tab and Tabs rows before
 * it): the rows go to the section after it, which becomes the panel, and the empty one goes. The
 * set's panels are then consecutive (one tab set, scripts/section-tabs.js), their cards inside.
 */
export function withTabPanels(doc) {
  let out = doc;
  for (;;) {
    const cur = out;
    const sections = topDivs(cur);
    const i = sections.findIndex(([a, b], k) => {
      const sec = cur.slice(a, b);
      const rest = sec.slice(5, -6).replace(/<div class="section-metadata">[\s\S]*<\/div>$/, '').trim();
      const next = sections[k + 1] && cur.slice(...sections[k + 1]);
      return /<div class="section-metadata">/.test(sec) && (sec.match(TAB_ROW) || []).length && !rest
        && next && !/<div><div>Tab<\/div>/.test(next) && !/<div class="metadata">/.test(next);
    });
    if (i < 0) return out;
    const [a] = sections[i];
    const b = sections[i][1];
    const rows = out.slice(a, b).match(TAB_ROW).join('');
    const [c, d] = sections[i + 1];
    let next = out.slice(c, d);
    const meta = next.lastIndexOf('<div class="section-metadata">');
    if (meta >= 0) {
      // the rows at the end of its section-metadata block (the section's last element)
      next = `${next.slice(0, -12)}${rows}</div></div>`;
    } else {
      next = `${next.slice(0, -6)}<div class="section-metadata">${rows}</div></div>`;
    }
    // the empty section, what lay between it and the next, and the next as it was: the panel
    out = `${out.slice(0, a)}${next}${out.slice(d)}`;
  }
}

/** The template of a page: lh-com's info template (B2B has no homepage widgets of lh-com's). */
// www's main content ending with a separator: its inline margin-bottom (in px)
const END_SEPARATOR = /<div class="separator[^"]*">\s*<div aria-hidden="true" style="margin-bottom:\s*(\d+)px;?"[^>]*>\s*<maui-divider[^>]*>\s*<\/maui-divider>\s*<\/div>\s*<\/div>(?:\s|<\/div>|<!--[\s\S]*?-->)*(?:<\/main>\s*)?(?:<link[^>]*>\s*)*<footer/;

/**
 * A page www ends with a separator (12 pages, 30 to 90 px of inline margin; brief 444, the airlines page's
 * end): lh-com's cleanup drops a separator at a section's end (lufthansa.com's last component has no
 * margin), business.lufthansagroup.com shows its margin. Written back as {spacer-N} at the end of the
 * document's last content section (before its metadata), unless the document ends with a spacer already.
 */
export function withEndSpacer(doc, html = '') {
  const m = html.match(END_SEPARATOR);
  if (!m) return doc;
  const spans = [];
  let depth = 0;
  let start = -1;
  [...doc.matchAll(/<(\/?)div\b[^>]*>/g)].forEach((t) => {
    if (!t[1]) {
      if (depth === 0) start = t.index;
      depth += 1;
    } else {
      depth -= 1;
      if (depth === 0) spans.push([start, t.index + t[0].length]);
    }
  });
  const onlyMeta = (s) => /^<div>\s*<div class="metadata">/.test(s) || !s.replace(/<[^>]+>/g, '').trim();
  const last = [...spans].reverse().find(([s, e]) => !onlyMeta(doc.slice(s, e)));
  if (!last) return doc;
  const sec = doc.slice(last[0], last[1]);
  const at = ['<div class="metadata">', '<div class="section-metadata">'].map((x) => sec.indexOf(x)).filter((i) => i >= 0);
  const cut = at.length ? Math.min(...at) : sec.length - '</div>'.length;
  if (/<p>\{spacer-[^}]*\}<\/p>\s*$/.test(sec.slice(0, cut))) return doc;
  return `${doc.slice(0, last[0])}${sec.slice(0, cut)}<p>{spacer-${m[1]}}</p>${sec.slice(cut)}${doc.slice(last[1])}`;
}

/**
 * A document without an h1 (the airlines-at-a-glance pages: the stage's logo, then "<Airline>
 * Products & Services" as an h2; the brief after 463): its first h2 is the page's h1, its id and
 * size marker kept, so it looks as before; an h2 without a size marker gets {heading-medium} (an
 * unmarked h2's size; an unmarked h1 is the page title's: the brief after 467). A document with an
 * h1, or without an h2, as it is.
 */
export function withPageHeading(doc) {
  if (/<h1[\s>]/.test(doc)) return doc;
  const m = doc.match(/<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/);
  if (!m) return doc;
  let text = m[2];
  if (!/\{[^}]*\bheading-[a-z-]+[^}]*\}\s*$/.test(text)) {
    const group = text.match(/\{([^}]*)\}\s*$/);
    text = group
      ? `${text.slice(0, group.index)}{heading-medium ${group[1].trim()}}`
      : `${text.trimEnd()} {heading-medium}`;
  }
  return `${doc.slice(0, m.index)}<h1${m[1] || ''}>${text}</h1>${doc.slice(m.index + m[0].length)}`;
}

export const templateOf = () => 'info';

/** A snapshot as the import reads it. */
export const mappedOf = (html) => withoutLoads(withSearch(withNestedColumnMarkers(withStageColumnMarkers(withTabMarkers(withB2bComponents(withHotlines(withEmails(withoutHelperLinks(withPlaceholder(stripScripts(html))))))))))
  .replace(/<output[^>]*class="screen-reader-announcer"[^>]*>[\s\S]*?<\/output>/g, ''));

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const started = Date.now();
  const list = opt('list');
  const name = path.basename(list).replace(/\.txt$/, '');
  const urls = fs.readFileSync(path.resolve(root, list), 'utf8').split('\n').map((u) => u.trim()).filter(Boolean);
  const scope = JSON.parse(fs.readFileSync(path.join(W, 'scope.json'), 'utf8'));
  // the hotline finder's labels (b2b-hotlines.mjs --record)
  const RECORD = path.join(W, 'runs/hotlines-record.json');
  const hotlineRecord = fs.existsSync(RECORD) ? JSON.parse(fs.readFileSync(RECORD, 'utf8')) : {};
  const byTemplate = {};
  const missing = [];
  const out = {};
  urls.forEach((u) => {
    const p = new URL(u).pathname;
    const f = path.join(SNAP, `${p}.html`);
    if (!fs.existsSync(f)) { missing.push(p); return; }
    const html = fs.readFileSync(f, 'utf8');
    const t = templateOf(p, html);
    // the mapped copy under the document's name (Edge Delivery's: no "--"): the import names the
    // document after the URL it reads
    const doc = docName(p);
    const copy = path.join(MAPPED, HOST, `${doc}.html`);
    fs.mkdirSync(path.dirname(copy), { recursive: true });
    fs.writeFileSync(copy, mappedOf(html));
    (byTemplate[t] ||= []).push(`https://${HOST}${doc}`);
    out[doc] = { template: t, source: p };
  });
  console.log(`${name}: ${Object.entries(byTemplate).map(([t, l]) => `${t} ${l.length}`).join(', ')}; no snapshot: ${missing.length ? missing.join(' ') : 'none'}`);
  if (!argv.includes('--dry-run')) {
    // the bulk importer loads a page live unless its workspace is flagged protected: every page
    // comes from its snapshot, nothing is requested from www
    const flag = path.join(W, '.migration/project.json');
    const flags = fs.existsSync(flag) ? JSON.parse(fs.readFileSync(flag, 'utf8')) : {};
    if (flags.botProtected !== true) {
      fs.mkdirSync(path.dirname(flag), { recursive: true });
      fs.writeFileSync(flag, `${JSON.stringify({ ...flags, botProtected: true }, null, 2)}\n`);
    }
    // the bulk importer writes its reports into lh-com's tree (tools/importer/reports/<path>),
    // where lh-com has reports at paths B2B has too (/de/en/...): set aside and put back
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
        cwd: root, env: { ...process.env, WORKSPACE_PATH: W, BD_ENDPOINT: '' }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024,
      });
      log.split('\n').filter((x) => /Snapshot import failed|falling through to live/i.test(x)).forEach((x) => console.log(`WARNING (live fallback): ${x.trim()}`));
      const lines = log.split('\n').filter((x) => /imported|failed|error/i.test(x) && !/wss:|endpoint/i.test(x));
      console.log(`${t}: ${lines.slice(-2).join(' | ')}`);
    });
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
      for (let d = path.dirname(from); d.startsWith(`${REPORTS}/`) && fs.existsSync(d) && !fs.readdirSync(d).length; d = path.dirname(d)) fs.rmdirSync(d);
    });
    const sites = path.join(root, 'tools/importer/sites/lh-b2b.json');
    const allow = JSON.parse(fs.readFileSync(sites, 'utf8'));
    const made = Object.keys(out).filter((p) => fs.existsSync(path.join(W, 'content', `${p}.plain.html`)));
    allow.paths = [...new Set([...allow.paths, ...made])];
    fs.writeFileSync(sites, `${JSON.stringify(allow, null, 1)}\n`);
    made.forEach((p) => {
      const f = path.join(W, 'content', `${p}.plain.html`);
      const doc = fs.readFileSync(f, 'utf8');
      const src = out[p].source;
      const html = fs.readFileSync(path.join(SNAP, `${src}.html`), 'utf8');
      const markets = scope.documents[src]?.markets || [];
      // a tab set's panels as Tab sections (the markers withTabMarkers left, scripts/section-tabs.js)
      const next = withPageHeading(withEndSpacer(withB2bMetadata(withHotlineFinder(withB2bQuotes(withB2bForm(withNestedColumns(withStageColumns(withTabPanels(splitTabSections(doc)))), p, html), html), labelsOf(hotlineRecord, p.split('/')[2]), imageOf(hotlineRecord)), p, html, markets), html));
      if (next !== doc) fs.writeFileSync(f, next);
    });
    const mapOnly = path.join(W, 'runs', `${name}-upload.txt`);
    fs.writeFileSync(mapOnly, `${made.join('\n')}\n`);
    const post = onlyBatch('lh-b2b', new Set(made), () => execFileSync('node', ['tools/importer/site-postprocess.mjs', '--site', 'lh-b2b', '--source-host', HOST, '--snapshots', path.join(MAPPED, HOST), '--real-placeholder', PLACEHOLDER, '--map-only', mapOnly], { cwd: root, encoding: 'utf8' }));
    console.log(post.result.trim().split('\n').slice(-3).join('\n'));
    console.log(`site-postprocess: ${post.restored.length} documents outside the batch left as they were`);
    const pages = ownPages('lh-b2b');
    const aliases = ownAliases('lh-b2b');
    made.forEach((p) => {
      const f = path.join(W, 'content', `${p}.plain.html`);
      const doc = fs.readFileSync(f, 'utf8');
      const next = withOwnLinks(withLocalImages(relativeDamLinks(doc)), HOST, pages, aliases).doc;
      if (next !== doc) fs.writeFileSync(f, next);
    });
    // the last step: no import writes style markers (token-free styling, tools/importer/marker-collapse.mjs)
    collapseDocs(withRestoredNbsp(made.map((p) => path.join(W, 'content', `${p}.plain.html`)), fs), { brand: 'b2b', content: path.join(W, 'content') });
    fs.writeFileSync(path.join(W, 'runs', `${name}-import.json`), `${JSON.stringify({
      templates: Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.template])), sources: Object.fromEntries(Object.entries(out).map(([k, v]) => [k, v.source])), documents: made, missing,
    }, null, 1)}\n`);
    console.log(`${made.length} documents; upload list runs/${name}-upload.txt`);
  }
}
