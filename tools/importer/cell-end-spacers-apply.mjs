/* eslint-disable no-console, max-len, import/no-extraneous-dependencies, import/prefer-default-export -- tooling */
/**
 * www's empty paragraph at the end of a column-view cell, back into DA's copy as a separator (standing order 11 of
 * 2026-11-12, item 3: /de/en/common/imprint/lufthansa-insights-imprint). www ends some cells with <p><br></p> or
 * <p>&nbsp;</p>; the import drops them, so the next view starts higher than www's. Per row ({end, n}): the Columns Media
 * cell whose last paragraph ends with the text `end` gets a <p>{spacer-n}</p> after that paragraph (blocks/columns-media
 * draws it n + 1px, the paragraph above keeps its margin). A row whose text is not found, is found more than once, does
 * not end a Columns Media cell or already has the spacer changes nothing. Everything else stays byte for byte.
 *
 * Usage: node tools/importer/cell-end-spacers-apply.mjs --data rows.json --in <DA copy.html> --out <file>
 *   rows.json: [{ "end": "Cindy Richter", "n": 26 }, ...]
 * Reads and writes local files only; the upload is the import helper's.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '(?:\\s|&nbsp;)+');

/** The document with the rows' spacers: { html, results: [{ row, result }] }. */
export function applyCellEndSpacers(html, rows) {
  let out = html;
  const results = rows.map((row) => {
    const { document } = parseHTML(`<html>${out}</html>`);
    const hits = [...document.querySelectorAll('p')].filter((p) => norm(p.textContent).endsWith(row.end));
    if (!hits.length) return { row, result: 'not found' };
    if (hits.length > 1) return { row, result: 'found more than once' };
    const p = hits[0];
    const next = p.nextElementSibling;
    if (next && norm(next.textContent) === `{spacer-${row.n}}`) return { row, result: 'there already' };
    const block = p.parentElement && p.parentElement.parentElement && p.parentElement.parentElement.parentElement;
    if (next || !block || !block.matches('div.columns-media')) return { row, result: 'not the end of a cell' };
    // the source: the paragraph's end text, its </p> and the cell's </div>, once
    const re = new RegExp(`${escape(row.end)}(\\s*</p>)(\\s*</div>)`, 'g');
    const found = [...out.matchAll(re)];
    if (found.length !== 1) return { row, result: `source match ${found.length}` };
    const m = found[0];
    const at = m.index + m[0].length - m[2].length;
    out = `${out.slice(0, at)}<p>{spacer-${row.n}}</p>${out.slice(at)}`;
    return { row, result: 'placed' };
  });
  return { html: out, results };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : undefined; };
  const r = applyCellEndSpacers(fs.readFileSync(arg('in'), 'utf8'), JSON.parse(fs.readFileSync(arg('data'), 'utf8')));
  fs.writeFileSync(arg('out'), r.html);
  r.results.forEach(({ row, result }) => console.log(`${row.end} {spacer-${row.n}}: ${result}`));
}
