/* eslint-disable no-console, max-len, import/extensions, import/prefer-default-export -- tooling */
/**
 * A section's text and its closing picture as one Columns Media row, in DA's copies as they are (standing order 16 of
 * 2026-11-14, item 1; not a new import: DA's copies hold market sections and later fixes a re-import would undo).
 * Group for Business /de/en/travel-solutions/our-european-fares: the "Exclusive benefits for status customers" section is
 * an H3, paragraphs and a picture paragraph one under the other, where www sets text and picture side by side.
 * Per document (--data, JSON: { "<path>": { heading } }): in the section whose first element is a heading whose text
 * starts with `heading`, the elements from the heading up to the picture paragraph become the first cell, and the
 * picture paragraph the second cell, of `<div class="columns-media"><div><div>...</div><div>...</div></div></div>`.
 * The section's metadata and every other byte stay as DA's. Refused, and the document left as it is: the heading not
 * found once or not its section's first element, the section not ending (before its metadata) with exactly one picture
 * paragraph, or a Columns Media block in the section already (so a second run changes nothing).
 * --revert takes a wrapped copy back to DA's bytes (the wrapper's bytes are fixed, so the change is reversible byte for byte).
 *
 * Usage: node tools/importer/columns-wrap-apply.mjs --data rows.json --docs <dir> --out <dir> [--list a delta list
 *   (its READY rows, status first or last)] [--revert]
 * <dir>/<path>.html: DA's copy; the result under --out, the same name.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { children } from './austrian-tabs-apply.mjs';
import { readyPaths } from './ita-fragment-insert-apply.mjs';

const OPEN = '<div class="columns-media"><div><div>';
const MID = '</div><div>';
const CLOSE = '</div></div></div>';
const textOf = (h) => h.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ')
  .trim();
const isPicturePara = (h) => /^<p>\s*<picture>[\s\S]*<\/picture>\s*<\/p>$/.test(h);

/** The section holding the heading as its first element: { base, kids } with offsets in the whole document. */
function findSection(html, heading) {
  const open = html.indexOf('<main>');
  const close = html.lastIndexOf('</main>');
  const mainStart = open >= 0 && close > open ? open + 6 : 0;
  const main = open >= 0 && close > open ? html.slice(mainStart, close) : html;
  const hits = [];
  children(main).forEach((s) => {
    if (s.tag !== 'div') return;
    const at = s.html.indexOf('>') + 1;
    const kids = children(s.html.slice(at, -6));
    const i = kids.findIndex((k) => /^h[1-6]$/.test(k.tag) && textOf(k.html).startsWith(heading));
    if (i >= 0) hits.push({ base: mainStart + s.start + at, kids, first: i === 0 });
  });
  return hits;
}

/**
 * @param {string} html DA's copy
 * @param {{heading: string}} row
 */
export function applyColumnsWrap(html, row) {
  const hits = findSection(html, row.heading);
  if (hits.length !== 1) return { html, problems: [`"${row.heading}": ${hits.length} sections with that heading`] };
  const { base, kids, first } = hits[0];
  if (!first) return { html, problems: [`"${row.heading}" is not its section's first element`] };
  if (kids.some((k) => /^<div class="columns-media/.test(k.html))) return { html, problems: ['a Columns Media block in the section already'] };
  const content = kids.filter((k) => !/^<div class="section-metadata"/.test(k.html));
  const last = content[content.length - 1];
  if (content.length < 2 || !isPicturePara(last.html) || content.slice(0, -1).some((k) => /<picture>/.test(k.html))) {
    return { html, problems: ['the section does not end with exactly one picture paragraph'] };
  }
  const textStart = base + content[0].start;
  const picStart = base + last.start;
  const picEnd = base + last.end;
  const out = `${html.slice(0, textStart)}${OPEN}${html.slice(textStart, picStart)}${MID}${html.slice(picStart, picEnd)}${CLOSE}${html.slice(picEnd)}`;
  return { html: out, problems: [] };
}

/**
 * The wrapped copy back to DA's bytes.
 * @param {string} html a copy applyColumnsWrap wrote
 * @param {{heading: string}} row
 */
export function revertColumnsWrap(html, row) {
  const hits = findSection(html, row.heading);
  const wrapped = [];
  const open = html.indexOf('<main>');
  const close = html.lastIndexOf('</main>');
  const mainStart = open >= 0 && close > open ? open + 6 : 0;
  const main = open >= 0 && close > open ? html.slice(mainStart, close) : html;
  children(main).forEach((s) => {
    if (s.tag !== 'div') return;
    const at = s.html.indexOf('>') + 1;
    const kids = children(s.html.slice(at, -6));
    const k = kids[0];
    if (k && k.html.startsWith(OPEN) && k.html.endsWith(CLOSE) && textOf(k.html).startsWith(row.heading)) {
      wrapped.push({ start: mainStart + s.start + at + k.start, end: mainStart + s.start + at + k.end, html: k.html });
    }
  });
  if (hits.length || wrapped.length !== 1) return { html, problems: [`"${row.heading}": ${wrapped.length} wrapped rows to revert`] };
  const w = wrapped[0];
  const inner = w.html.slice(OPEN.length, -CLOSE.length);
  const mid = inner.lastIndexOf(MID);
  if (mid < 0 || !isPicturePara(inner.slice(mid + MID.length))) return { html, problems: ['not a row this tool wrote'] };
  return { html: `${html.slice(0, w.start)}${inner.slice(0, mid)}${inner.slice(mid + MID.length)}${html.slice(w.end)}`, problems: [] };
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const opt = (k) => (argv.includes(`--${k}`) ? argv[argv.indexOf(`--${k}`) + 1] : null);
  const revert = argv.includes('--revert');
  const data = JSON.parse(fs.readFileSync(opt('data'), 'utf8'));
  let paths = Object.keys(data);
  if (opt('list')) {
    const ready = readyPaths(fs.readFileSync(opt('list'), 'utf8'));
    paths = paths.filter((p) => ready.includes(p));
  }
  let problems = 0;
  paths.forEach((p) => {
    const html = fs.readFileSync(path.join(opt('docs'), `${p}.html`), 'utf8');
    const r = revert ? revertColumnsWrap(html, data[p]) : applyColumnsWrap(html, data[p]);
    if (r.problems.length) { problems += 1; console.log(`${p}: NOT CHANGED: ${r.problems.join('; ')}`); return; }
    const target = path.join(opt('out'), `${p}.html`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, r.html);
    console.log(`${p}: ${revert ? 'the row taken back to DA\'s bytes' : 'the section\'s text and picture as one Columns Media row; the rest as DA\'s'}`);
  });
  console.log(`columns-wrap-apply${revert ? ' --revert' : ''}: ${paths.length - problems} written, ${problems} not changed`);
  if (problems) process.exitCode = 1;
}
