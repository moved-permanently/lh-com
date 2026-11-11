/* eslint-disable no-console, max-len, import/extensions, import/no-extraneous-dependencies -- tooling */
/**
 * www's empty paragraphs in running text into the documents as they are (DA's copy plus the delta, not a new import:
 * DA's copies hold market sections and later fixes a re-import would undo). Standing order 5 of 2026-11-11, item 1
 * (ema-cashub's row 2 in rows-for-ema-test.md): on www an empty paragraph in a rich text takes space (<p></p> one
 * paragraph margin, Brussels 20 px at 1440 and 16 at 390; <p>&nbsp;</p> and <p><br></p> a line and a margin, 44 / 40);
 * the import dropped them, and the collapse drops a spacer of 31 px or less.
 *
 * The data (--data, a JSON list) comes from the recordings, laid out offline: per page every run of empty paragraphs
 * that takes space, with the end of the text before it ("after"), the start of the text after it ("before") and www's
 * gap from the one to the other at 1440 and 390 (gap1440, gap390: the bottom of the text before to the top of the next
 * text, the empty paragraphs and both margins in it). Per row, in the document's top-level content (a section's own
 * children, not in blocks): the paragraph or list whose text ends with "after" (or, without it, the element whose text
 * starts with "before") and its neighbour. Only between running text (a paragraph or a list) and running text or an
 * H2, a spacing marker <p>{spacer-N}</p> goes between the two. Our gap there is then the paragraph's bottom margin
 * (--margins, at 1440 and 390: 20,16) + N + 1 (the marker's paragraph; the next paragraph, list or H2 has no top margin
 * after it), so N = the mean over both widths of www's gap less our margin, less 1. A row whose place is not found, or
 * not between running text, or that leaves under 8 px, changes nothing; a place that already has a spacing marker is
 * left. Everything else of the document stays as it is.
 *
 * Usage: node tools/importer/text-spacers-apply.mjs --data rows.json --docs <dir> --out <dir> [--site brussels]
 *   [--margins 20,16] [--list paths.txt (one path a line, or a reimport list: its READY rows)] [--report out.tsv]
 * <dir>/<path>.plain.html (or <path>.html) as DA's copy; the result under --out with the same name.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

const norm = (s) => (s || '').replace(/[\s\u00a0]+/g, ' ').trim();
const text = (el) => norm(el && el.textContent);
const MARKER = /^\{[^}]*\}$/;
const isMarker = (el) => !!el && el.tagName === 'P' && MARKER.test(text(el));
const isSpacer = (el) => !!el && el.tagName === 'P' && /^\{(spacer|divider)-\d{1,3}( from-768)?\}$/.test(text(el));
const isProse = (el) => !!el && ((el.tagName === 'P' && !!text(el) && !isMarker(el) && !el.querySelector('picture, img')) || /^(UL|OL)$/.test(el.tagName));

/** The marker's size for one row: { n } or { skip: reason }. margins: our paragraph margin at 1440 and 390. */
export function spacerSize(row, margins = [20, 16]) {
  const d = [[row.gap1440, margins[0]], [row.gap390, margins[1]]].filter(([g]) => typeof g === 'number').map(([g, m]) => g - m);
  if (!d.length) return { skip: 'no gap' };
  const n = Math.round(d.reduce((a, b) => a + b, 0) / d.length) - 1;
  return n >= 8 ? { n } : { skip: 'under 8 px' };
}

/**
 * Applies the rows of one document to its HTML (the .plain.html's content). Returns { html, results: [{ row, result }] }.
 */
export function applyTextSpacers(html, rows, { margins = [20, 16] } = {}) {
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main>${html}</main></body></html>`);
  const main = document.querySelector('main');
  const top = [...main.children].flatMap((s) => (s.tagName === 'DIV' ? [...s.children] : []));
  const results = rows.map((row) => {
    // the last / first 25 characters: www's paragraph may hold more lines than DA's (a <br> where DA has two paragraphs)
    const after = norm(row.after).slice(-25).trim();
    const before = norm(row.before).slice(0, 25).trim();
    let prev = null;
    let next = null;
    if (after) {
      const hits = top.filter((el) => isProse(el) && text(el).endsWith(after)
        && (!before || text(el.nextElementSibling).startsWith(before)));
      if (hits.length !== 1) return { row, result: hits.length ? 'ambiguous' : 'not found' };
      [prev] = hits;
      next = prev.nextElementSibling;
    } else if (before) {
      const hits = top.filter((el) => text(el).startsWith(before) && !isMarker(el));
      if (hits.length !== 1) return { row, result: hits.length ? 'ambiguous' : 'not found' };
      [next] = hits;
      prev = next.previousElementSibling;
    } else return { row, result: 'no text around' };
    if (isSpacer(next) || isSpacer(prev)) return { row, result: 'present' };
    if (!isProse(prev) || !(isProse(next) || (!!next && next.tagName === 'H2'))) {
      return { row, result: `not between running text (${prev ? prev.tagName : '-'} / ${next ? (next.className || next.tagName) : '-'})` };
    }
    const size = spacerSize(row, margins);
    if (size.skip) return { row, result: size.skip };
    const p = document.createElement('p');
    p.textContent = `{spacer-${size.n}}`;
    prev.after(p);
    return { row, result: `{spacer-${size.n}}` };
  });
  return { html: main.innerHTML, results };
}

/** A list's paths: one a line, or a reimport list's rows (tab-separated), only the READY ones (its last column). */
export const listPaths = (txt) => txt.split('\n').map((l) => l.split('\t'))
  .filter((c) => c[0].trim().startsWith('/') && (c.length === 1 || /^READY\b/.test(c[c.length - 1].trim())))
  .map((c) => c[0].trim());

const main = () => {
  const args = process.argv.slice(2);
  const opt = (k, d) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : d; };
  const data = JSON.parse(fs.readFileSync(opt('data'), 'utf8'));
  const site = opt('site');
  const margins = opt('margins', '20,16').split(',').map(Number);
  const list = opt('list') ? listPaths(fs.readFileSync(opt('list'), 'utf8')) : null;
  const byPath = new Map();
  data.filter((r) => (!site || r.site === site) && (!list || list.includes(r.path))).forEach((r) => {
    byPath.set(r.path, [...(byPath.get(r.path) || []), r]);
  });
  const report = [];
  byPath.forEach((rows, p) => {
    const src = [`${p}.plain.html`, `${p}.html`].map((f) => path.join(opt('docs'), f)).find((f) => fs.existsSync(f));
    if (!src) { report.push(`${p}\t-\tno document`); return; }
    const { html, results } = applyTextSpacers(fs.readFileSync(src, 'utf8'), rows, { margins });
    results.forEach(({ row, result }) => report.push(`${p}\t${row.kind} gap ${row.gap1440 ?? '-'}/${row.gap390 ?? '-'} "${row.after.slice(-25)}" -> "${row.before.slice(0, 25)}"\t${result}`));
    if (results.some(({ result }) => result.startsWith('{spacer-'))) {
      const out = path.join(opt('out'), path.relative(opt('docs'), src));
      fs.mkdirSync(path.dirname(out), { recursive: true });
      fs.writeFileSync(out, html);
    }
  });
  if (opt('report')) fs.writeFileSync(opt('report'), `${report.join('\n')}\n`);
  console.log(report.join('\n'));
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
