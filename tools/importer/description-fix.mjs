#!/usr/bin/env node
/* eslint-disable no-console, max-len, import/no-extraneous-dependencies -- tooling (linkedom: dev) */
/**
 * A page's Description for its Metadata block (the brief after 484, item D). Without one, Edge
 * Delivery takes the page's first paragraph as description, og:description and
 * twitter:description, the importer's style marker included ("…within Europe now {full-width}";
 * a video path and "{autoplay muted loop}" on lh-b2b). This adds the row:
 *   1. www's own meta description from the page's capture, when there is one (meta
 *      name=description, else og:description, else twitter:description);
 *   2. else the first real text paragraph, its style markers removed (scripts/style-markers.js),
 *      not a paragraph that is only a link, a video path, a date or a picture.
 * A Description already there stays, its style markers removed. Placeholders ({origin}) stay.
 * HTML in, HTML out: the rest of the document is left byte for byte as it is.
 *
 * Usage: node tools/importer/description-fix.mjs <document.html> [--capture <www page.html>]
 *   [--out <file>] (default: stdout); prints the source used (capture, paragraph, kept, none)
 *   to stderr.
 */
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { stripStyleMarkers } from '../../scripts/style-markers.js';

const clean = (s) => String(s || '')
  .replace(/[\u200B-\u200D\uFEFF]/g, '')
  .replace(/\u00A0/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// a date line alone (B2B news: "(10. März 2026)", "(1 September 2026)")
const DATE_ONLY = /^\(?(?:\d{1,2}\.?\s+\p{L}+\.?|\p{L}+\.?\s+\d{1,2},?)\s+\d{4}\)?$/u;
const VIDEO_PATH = /^(?:https?:\/\/\S+|\/\S+)\.(?:mp4|webm|mov|m4v)(?:\?\S*)?$|^(?:https?:\/\/[^\s/]+)?\/content\/dam\/\S+$/i;

const parse = (html) => {
  const s = String(html);
  // a whole page, a <body>…</body> document (DA) or a plain.html fragment
  if (/<html[\s>]/i.test(s)) return parseHTML(s).document;
  return parseHTML(`<html><body>${s.replace(/^\s*<body[^>]*>|<\/body>\s*$/gi, '')}</body></html>`).document;
};

/** www's description in a page's HTML (its capture): name=description, else og: / twitter:. */
export function wwwDescription(captureHtml) {
  if (!captureHtml) return '';
  const document = parse(captureHtml);
  const read = (sel) => clean((document.querySelector(sel) || { getAttribute: () => '' }).getAttribute('content'));
  return read('meta[name="description" i]') || read('meta[property="og:description"]') || read('meta[name="og:description"]')
    || read('meta[name="twitter:description"]') || read('meta[property="twitter:description"]');
}

/** The text of a paragraph that can describe the page, or '' (link only, video path, picture). */
export function paragraphText(p) {
  const text = clean(stripStyleMarkers(clean(p.textContent)));
  if (!text) return '';
  if (VIDEO_PATH.test(text) || DATE_ONLY.test(text)) return '';
  const links = [...p.querySelectorAll('a')];
  if (links.length && clean(links.map((a) => a.textContent).join(' ')) === text) return '';
  return text;
}

/** The first real text paragraph of a document (outside its metadata blocks), markers removed. */
export function firstTextParagraph(html) {
  const document = typeof html === 'string' ? parse(html) : html;
  const root = document.querySelector('main') || document.body;
  const p = [...root.querySelectorAll('p')]
    .filter((x) => !x.closest('div.metadata, div.section-metadata'))
    .find((x) => paragraphText(x));
  return p ? paragraphText(p) : '';
}

/** The [start, end) of the element that opens at `at` (div nesting counted). */
function elementRange(html, at) {
  const re = /<(\/?)div\b[^>]*>/gi;
  re.lastIndex = at;
  let depth = 0;
  for (let m = re.exec(html); m; m = re.exec(html)) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return [at, m.index + m[0].length];
  }
  return null;
}

const cellHtml = (usesP, text) => (usesP ? `<p>${esc(text)}</p>` : esc(text));

/**
 * @param {string} html the document (DA HTML, a full page or a plain.html)
 * @param {{ capture?: string }} [opts] the page's capture on www (its HTML)
 * @returns {{ html: string, source: 'capture'|'paragraph'|'kept'|null, description: string }}
 */
export function fixDescription(html, { capture } = {}) {
  const src = String(html);
  const at = src.search(/<div class="metadata">/i);
  const range = at >= 0 ? elementRange(src, at) : null;
  if (range) {
    const block = parse(src.slice(range[0], range[1])).querySelector('div.metadata');
    const rows = [...block.children];
    const key = (r) => clean(r.children[0] ? r.children[0].textContent : '').toLowerCase();
    const has = rows.find((r) => key(r) === 'description');
    if (has && clean(has.children[1] && has.children[1].textContent)) {
      const value = has.children[1];
      const was = clean(value.textContent);
      const now = clean(stripStyleMarkers(was));
      if (now === was) return { html: src, source: 'kept', description: was };
      const usesP = !!value.querySelector('p');
      value.innerHTML = cellHtml(usesP, now);
      return { html: src.slice(0, range[0]) + block.outerHTML + src.slice(range[1]), source: 'kept', description: now };
    }
    const fromCapture = wwwDescription(capture);
    const description = fromCapture || firstTextParagraph(src);
    if (!description) return { html: src, source: null, description: '' };
    // the new row's cells as the block's first key cell (DA writes "<div>Title</div>" or "<div><p>Title</p></div>")
    const usesP = !!(rows[0] && rows[0].children[0] && rows[0].children[0].querySelector('p'));
    const row = block.ownerDocument.createElement('div');
    row.innerHTML = `<div>${cellHtml(usesP, 'Description')}</div><div>${cellHtml(usesP, description)}</div>`;
    if (has) has.replaceWith(row);
    else {
      const title = rows.find((r) => key(r) === 'title');
      if (title) title.after(row); else block.prepend(row);
    }
    return { html: src.slice(0, range[0]) + block.outerHTML + src.slice(range[1]), source: fromCapture ? 'capture' : 'paragraph', description };
  }
  // no Metadata block: one at the end of the last section
  const fromCapture = wwwDescription(capture);
  const description = fromCapture || firstTextParagraph(src);
  if (!description) return { html: src, source: null, description: '' };
  const block = `<div class="metadata"><div><div><p>Description</p></div><div><p>${esc(description)}</p></div></div></div>`;
  const mainEnd = src.search(/<\/main>/i);
  const scope = mainEnd >= 0 ? src.slice(0, mainEnd) : src;
  const lastClose = scope.lastIndexOf('</div>');
  const out = lastClose >= 0 ? `${src.slice(0, lastClose)}${block}${src.slice(lastClose)}` : `${src}<div>${block}</div>`;
  return { html: out, source: fromCapture ? 'capture' : 'paragraph', description };
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
  const file = argv.find((a, i) => !a.startsWith('--') && !(i && argv[i - 1].startsWith('--')));
  if (!file) {
    console.error('usage: description-fix.mjs <document.html> [--capture <www page.html>] [--out <file>]');
    process.exit(2);
  }
  const capture = opt('capture') ? fs.readFileSync(opt('capture'), 'utf8') : '';
  const r = fixDescription(fs.readFileSync(file, 'utf8'), { capture });
  if (opt('out')) fs.writeFileSync(opt('out'), r.html); else process.stdout.write(r.html);
  console.error(`${file}: ${r.source || 'none'}${r.description ? ` "${r.description.slice(0, 80)}"` : ''}`);
}
