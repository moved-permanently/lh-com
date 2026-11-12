/* eslint-disable no-console, max-len, import/extensions, import/prefer-default-export, import/no-extraneous-dependencies -- tooling; linkedom is a dev dependency */
/**
 * www's heading sizes the collapse dropped, back as their markers in the documents as they are (DA's copy plus the
 * delta, not a re-import; standing order 6 of 2026-11-12, item 2: rows-for-ema-test.md row 3, Discover's
 * heading-copytext-large). Per data row ({ path, level, text, size }: from the recordings, www's headline headings of
 * that size): the document's one heading of that level whose text is the row's gets " {size}" at its end, unless it
 * has a marker already; the page reads it as the class (scripts.js decorateTextStyles), and the collapse keeps it on a
 * theme with keepSizes. A heading not found, or found twice, changes nothing. Idempotent.
 *
 * Usage: node tools/importer/heading-size-marks-apply.mjs --data rows.json --docs <DA copies> --out <dir> [--list <reimport list>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

const key = (s) => (s || '').replace(/\{[^}]*\}\s*$/, '').replace(/\s+/g, ' ').trim().toLowerCase();
const MARKED = /\{[^}]*\}\s*$/;

/** The document's HTML with the rows' markers; returns { html, results: [{ row, result }] }. */
export function applyHeadingSizeMarks(html, rows) {
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main>${html}</main></body></html>`);
  const main = document.querySelector('main');
  const results = rows.map((row) => {
    const hits = [...main.querySelectorAll(`h${row.level}`)].filter((h) => key(h.textContent) === key(row.text));
    if (hits.length !== 1) return { row, result: hits.length ? 'ambiguous' : 'not found' };
    const [h] = hits;
    if (MARKED.test(h.textContent)) return { row, result: 'present' };
    h.append(document.createTextNode(` {${row.size}}`));
    return { row, result: `{${row.size}}` };
  });
  return { html: results.some((r) => r.result.startsWith('{')) ? main.innerHTML : html, results };
}

/** A list's paths: one a line, or a reimport list's rows (tab-separated), only the READY ones (its last column). */
export const listPaths = (txt) => txt.split('\n').map((l) => l.split('\t'))
  .filter((c) => c[0].trim().startsWith('/') && (c.length === 1 || /^READY\b/.test(c[c.length - 1].trim())))
  .map((c) => c[0].trim());

const main = () => {
  const args = process.argv.slice(2);
  const opt = (k) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
  const data = JSON.parse(fs.readFileSync(opt('data'), 'utf8'));
  const list = opt('list') ? listPaths(fs.readFileSync(opt('list'), 'utf8')) : null;
  const byPath = new Map();
  data.filter((r) => !list || list.includes(r.path)).forEach((r) => byPath.set(r.path, [...(byPath.get(r.path) || []), r]));
  byPath.forEach((rows, p) => {
    const src = [`${p}.html`, `${p}.plain.html`].map((f) => path.join(opt('docs'), f)).find((f) => fs.existsSync(f));
    if (!src) { console.log(`${p}\tno document`); return; }
    const { html, results } = applyHeadingSizeMarks(fs.readFileSync(src, 'utf8'), rows);
    results.forEach(({ row, result }) => console.log(`${p}\th${row.level} "${row.text.slice(0, 40)}"\t${result}`));
    if (!results.some((r) => r.result.startsWith('{'))) return;
    const out = path.join(opt('out'), path.relative(opt('docs'), src));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, html);
  });
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
