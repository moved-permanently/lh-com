/* eslint-disable no-console, max-len, import/extensions, import/no-extraneous-dependencies -- tooling */
/**
 * Group for Business: a tab panel of running text with one picture after it as www's two-up column view (text left,
 * picture right from 768 px), DA's copy plus the delta, not a new import (standing order 5 of 2026-11-11, item 2:
 * businesstogo's four panels, de/de, de/en, xx/de, xx/en; www's text in the left half beside the picture, DA's text
 * full width over a full-width picture). Per tab section (data-tab, a section with a Tab row) whose own content is one or
 * more paragraphs, lists or headings and, last (or first), one paragraph holding only a picture: that content becomes
 * one Columns Media row, the text in the first cell and the picture paragraph in the second (the picture first where it
 * came first: the Allegris pages' HON Circle / Senators panels, www's picture left). Everything else of the document
 * stays as it is (the section, its metadata, the other sections). Idempotent (a panel that is a block already is left).
 *
 * Usage: node tools/importer/b2b-tab-picture-columns-apply.mjs --list paths.txt --docs <dir> --out <dir>
 *   --list: one path a line, or a reimport list (its READY rows); <dir>/<path>.plain.html (or .html) as DA's copy
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

const TEXT = new Set(['P', 'UL', 'OL', 'H2', 'H3', 'H4', 'H5', 'H6']);
const isPicturePara = (el) => !!el && el.tagName === 'P' && !!el.querySelector('picture') && !el.textContent.trim();

/**
 * A tab section's own content when it is text and one picture paragraph at its end (www: the text left, the picture
 * right) or at its start (the picture left), else null.
 */
const panelParts = (section) => {
  const kids = [...section.children].filter((k) => !k.matches('.section-metadata'));
  if (kids.length < 2) return null;
  const isText = (els) => els.every((e) => TEXT.has(e.tagName) && !e.querySelector('picture'));
  const last = kids[kids.length - 1];
  if (isPicturePara(last) && isText(kids.slice(0, -1))) return { text: kids.slice(0, -1), picture: last, pictureFirst: false };
  if (isPicturePara(kids[0]) && isText(kids.slice(1))) return { text: kids.slice(1), picture: kids[0], pictureFirst: true };
  return null;
};

/**
 * The document's HTML (a .plain.html's content) with each such tab panel as a Columns Media. A tab section is a
 * top-level div with data-tab (the served .plain.html) or with a Section Metadata whose Tab row is set.
 * Returns { html, panels }.
 */
export function applyTabPictureColumns(html) {
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main>${html}</main></body></html>`);
  const main = document.querySelector('main');
  let panels = 0;
  [...main.children].forEach((section) => {
    const meta = section.querySelector(':scope > .section-metadata');
    const tabRow = meta && [...meta.children].some((r) => /^tab$/i.test((r.children[0]?.textContent || '').trim()) && (r.children[1]?.textContent || '').trim());
    if (!section.hasAttribute('data-tab') && !tabRow) return;
    const parts = panelParts(section);
    if (!parts) return;
    const block = document.createElement('div');
    block.className = 'columns-media';
    const row = document.createElement('div');
    const textCell = document.createElement('div');
    const mediaCell = document.createElement('div');
    (parts.pictureFirst ? parts.picture : parts.text[0]).before(block);
    textCell.append(...parts.text);
    mediaCell.append(parts.picture);
    if (parts.pictureFirst) row.append(mediaCell, textCell);
    else row.append(textCell, mediaCell);
    block.append(row);
    panels += 1;
  });
  return { html: panels ? main.innerHTML : html, panels };
}

/** A list's paths: one a line, or a reimport list's rows (tab-separated), only the READY ones (its last column). */
export const listPaths = (txt) => txt.split('\n').map((l) => l.split('\t'))
  .filter((c) => c[0].trim().startsWith('/') && (c.length === 1 || /^READY\b/.test(c[c.length - 1].trim())))
  .map((c) => c[0].trim());

const main = () => {
  const args = process.argv.slice(2);
  const opt = (k) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
  listPaths(fs.readFileSync(opt('list'), 'utf8')).forEach((p) => {
    const src = [`${p}.plain.html`, `${p}.html`].map((f) => path.join(opt('docs'), f)).find((f) => fs.existsSync(f));
    if (!src) { console.log(`${p}\tno document`); return; }
    const { html, panels } = applyTabPictureColumns(fs.readFileSync(src, 'utf8'));
    console.log(`${p}\t${panels} panel(s)`);
    if (!panels) return;
    const out = path.join(opt('out'), path.relative(opt('docs'), src));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, html);
  });
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
