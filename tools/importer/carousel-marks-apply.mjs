/* eslint-disable no-console, max-len, import/prefer-default-export -- tooling */
/**
 * The column marks of a titled card view, back into DA's copy (standing order 16 of 2026-11-13: /de/en/special-meals'
 * "More information about our in-flight menus", the view after the grey band). www pads a column view of an AEM section
 * 3.2rem above and below; where the view became a Carousel Cards block the importer wrote no marks. The importer change
 * (lufthansa-cleanup markColumnViews + the carousel-cards parser, info) is held with these rows: the measured change
 * fails the 0.5 gate on two pages (tools/reports/parity-2026-11-09/delta-so16-card-marks-lh-com.txt). Per row ({heading, end}): the heading (h2-h6) whose text starts with `heading` and that
 * is directly followed by a carousel-cards block gets "column-start" in its trailing marker ("{heading-small}" ->
 * "{heading-small column-start}", or " {column-start}" appended), and a <p>{end}</p> ("column-end", or
 * "column-end column-spaced" where the view ends the page in a section with .mb-default) right after the block. A row
 * whose heading is not found, or found more than once, changes nothing; a heading that has the mark already, neither.
 * Everything else stays byte for byte.
 *
 * Usage: node tools/importer/carousel-marks-apply.mjs --data rows.json --in <DA copy.html> --out <file>
 *   rows.json: [{ "heading": "More information about our in-flight menus", "end": "column-end column-spaced" }]
 * Reads and writes local files only; the upload is the import helper's.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const ENDS = ['column-end', 'column-end column-spaced'];

/** The index right after the element that opens at `start` (a div), or -1. */
function closeOf(html, start) {
  const re = /<(\/?)div\b[^>]*>/g;
  re.lastIndex = start;
  let depth = 0;
  for (let m = re.exec(html); m; m = re.exec(html)) {
    depth += m[1] ? -1 : 1;
    if (depth === 0) return re.lastIndex;
  }
  return -1;
}

/** The document with the rows' marks: { html, results: [{ row, result }] }. */
export function applyCarouselMarks(html, rows) {
  let out = html;
  const results = rows.map((row) => {
    if (!ENDS.includes(row.end)) return { row, result: 'unknown end' };
    const re = new RegExp(`(<(h[2-6])\\b[^>]*>\\s*${escape(row.heading)})(\\s*\\{([a-z0-9 -]+)\\})?(\\s*</\\2>\\s*)(?=<div class="carousel-cards\\b)`, 'g');
    const found = [...out.matchAll(re)];
    if (!found.length) return { row, result: 'not found' };
    if (found.length > 1) return { row, result: 'found more than once' };
    const [m] = found;
    const tokens = m[4] ? m[4].trim().split(/\s+/) : [];
    if (tokens.includes('column-start')) return { row, result: 'there already' };
    const blockStart = m.index + m[0].length;
    const blockEnd = closeOf(out, blockStart);
    if (blockEnd < 0) return { row, result: 'block not closed' };
    const marker = m[3] ? `${m[3].slice(0, m[3].lastIndexOf('}'))} column-start}` : ' {column-start}';
    const heading = `${m[1]}${marker}${m[5]}`;
    out = `${out.slice(0, m.index)}${heading}${out.slice(blockStart, blockEnd)}<p>{${row.end}}</p>${out.slice(blockEnd)}`;
    return { row, result: 'placed' };
  });
  return { html: out, results };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : undefined; };
  const r = applyCarouselMarks(fs.readFileSync(arg('in'), 'utf8'), JSON.parse(fs.readFileSync(arg('data'), 'utf8')));
  fs.writeFileSync(arg('out'), r.html);
  r.results.forEach(({ row, result }) => console.log(`${row.heading} {${row.end}}: ${result}`));
}
