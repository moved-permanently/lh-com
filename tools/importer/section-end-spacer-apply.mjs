/* eslint-disable no-console, max-len, import/prefer-default-export -- tooling */
/**
 * www's separator that ends an AEM section right above a grey column band, back into DA's copy (standing order 18 of
 * 2026-11-13: the children's-menus documents, the "Catering on board" band 17px higher than www's). The importer keeps
 * such a separator since then (lufthansa-cleanup missingSeparatorMarkers; test/band-separator-so18); this is the delta
 * for the documents imported before. Per row ({heading, n}): the section (a top-level div of main, or of the document
 * for a .plain.html) whose first heading starts with `heading` is found; the section before it gets <p>{spacer-n}</p>
 * as its last content, before its section-metadata block if it has one, unless its last content is a separator
 * paragraph already. A row whose heading is not found, is found more than once, or opens the first section, changes
 * nothing. Everything else stays byte for byte.
 *
 * Usage: node tools/importer/section-end-spacer-apply.mjs --data rows.json --in <DA copy.html> --out <file>
 *   rows.json: [{ "heading": "Catering on board: tailored completely to your wishes", "n": 40 }]
 * Reads and writes local files only; the upload is the import helper's.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SEPARATOR = /^\{(spacer|divider)-\d{1,3}( from-768)?\}$/;
const text = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

/** The top-level divs of html between from and to: [{ start, end }] (end after the closing tag). */
function sections(html, from, to) {
  const out = [];
  const re = /<(\/?)div\b[^>]*>/g;
  re.lastIndex = from;
  let depth = 0;
  let start = -1;
  for (let m = re.exec(html); m && m.index < to; m = re.exec(html)) {
    if (!m[1]) {
      if (depth === 0) start = m.index;
      depth += 1;
    } else {
      depth -= 1;
      if (depth === 0) out.push({ start, end: re.lastIndex });
    }
  }
  return out;
}

/** The document with the rows' spacers: { html, results: [{ row, result }] }. */
export function applySectionEndSpacer(html, rows) {
  let out = html;
  const results = rows.map((row) => {
    const main = out.indexOf('<main>');
    const from = main >= 0 ? main + 6 : 0;
    const to = main >= 0 ? out.indexOf('</main>', from) : out.length;
    const secs = sections(out, from, to);
    const hits = secs.map((s, i) => [s, i]).filter(([s]) => {
      const h = out.slice(s.start, s.end).match(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/);
      return h && text(h[1]).startsWith(row.heading);
    });
    if (!hits.length) return { row, result: 'not found' };
    if (hits.length > 1) return { row, result: 'found more than once' };
    const [[, i]] = hits;
    if (i === 0) return { row, result: 'first section' };
    const prev = secs[i - 1];
    const body = out.slice(prev.start, prev.end);
    // where the section's content ends: before its section-metadata block, else before its closing tag
    const meta = body.lastIndexOf('<div class="section-metadata">');
    const close = body.lastIndexOf('</div>');
    let at = meta >= 0 ? meta : close;
    // (the whitespace before it stays after the spacer, so a pretty-printed copy keeps its indentation)
    while (at > 0 && /\s/.test(body[at - 1])) at -= 1;
    const last = body.slice(0, at).match(/<p>([^<]*)<\/p>$/);
    if (last && SEPARATOR.test(last[1].trim())) return { row, result: 'there already' };
    const pos = prev.start + at;
    out = `${out.slice(0, pos)}<p>{spacer-${row.n}}</p>${out.slice(pos)}`;
    return { row, result: 'placed' };
  });
  return { html: out, results };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : undefined; };
  const r = applySectionEndSpacer(fs.readFileSync(arg('in'), 'utf8'), JSON.parse(fs.readFileSync(arg('data'), 'utf8')));
  fs.writeFileSync(arg('out'), r.html);
  r.results.forEach(({ row, result }) => console.log(`${row.heading} {spacer-${row.n}}: ${result}`));
}
