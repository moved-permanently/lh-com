/* eslint-disable no-console, max-len, import/prefer-default-export -- tooling */
/**
 * A style added to one section of DA's copy (standing order 18 of 2026-11-13: /de/en/passengers-with-sensory-impairment,
 * where our section gap stood for www's .mb-default twice: "Assistance on your trip" between two padded AEM sections,
 * and the padded assistance-dog section before the grey band; style spaced keeps the 2.4rem instead). Per row
 * ({heading, add}): the section (a top-level div of main, or of the document for a .plain.html) whose first heading
 * starts with `heading` gets the style `add`: in its section-metadata block in DA's format (a new block at its end when
 * it has none), in its classes in a published .plain.html. A row whose heading is not found, is found more than once,
 * or whose section has the style already, changes nothing. Everything else stays byte for byte.
 *
 * Usage: node tools/importer/section-style-apply.mjs --data rows.json --in <DA copy.html> --out <file>
 *   rows.json: [{ "heading": "Assistance on your trip", "add": "spaced" }]
 * Reads and writes local files only; the upload is the import helper's.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const text = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const META = /<div class="section-metadata"><div><div>style<\/div><div>([^<]*)<\/div><\/div><\/div>/;

function sections(html, from, to) {
  const out = [];
  const re = /<(\/?)div\b[^>]*>/g;
  re.lastIndex = from;
  let depth = 0;
  let cur = null;
  for (let m = re.exec(html); m && m.index < to; m = re.exec(html)) {
    if (!m[1]) {
      if (depth === 0) cur = { start: m.index, openEnd: re.lastIndex };
      depth += 1;
    } else {
      depth -= 1;
      if (depth === 0) out.push({ ...cur, end: re.lastIndex });
    }
  }
  return out;
}

/** The document with the rows' styles: { html, results: [{ row, result }] }. */
export function applySectionStyle(html, rows) {
  let out = html;
  const results = rows.map((row) => {
    if (!/^[a-z0-9-]+$/.test(row.add || '')) return { row, result: 'bad row' };
    const main = out.indexOf('<main>');
    const from = main >= 0 ? main + 6 : 0;
    const to = main >= 0 ? out.indexOf('</main>', from) : out.length;
    const hits = sections(out, from, to).filter((s) => {
      const h = out.slice(s.start, s.end).match(/<h[1-6]\b[^>]*>([\s\S]*?)<\/h[1-6]>/);
      return h && text(h[1]).startsWith(row.heading);
    });
    if (!hits.length) return { row, result: 'not found' };
    if (hits.length > 1) return { row, result: 'found more than once' };
    const [s] = hits;
    const body = out.slice(s.start, s.end);
    let next;
    if (main >= 0) {
      const m = body.match(META);
      if (m) {
        const styles = m[1].split(',').map((x) => x.trim()).filter(Boolean);
        if (styles.includes(row.add)) return { row, result: 'there already' };
        next = body.replace(m[0], m[0].replace(`<div>${m[1]}</div>`, `<div>${[...styles, row.add].join(', ')}</div>`));
      } else {
        const close = body.lastIndexOf('</div>');
        next = `${body.slice(0, close)}<div class="section-metadata"><div><div>style</div><div>${row.add}</div></div></div>${body.slice(close)}`;
      }
    } else {
      const open = out.slice(s.start, s.openEnd);
      const cls = open.match(/class="([^"]*)"/);
      const styles = cls ? cls[1].split(/\s+/).filter(Boolean) : [];
      if (styles.includes(row.add)) return { row, result: 'there already' };
      next = `<div class="${[...styles, row.add].join(' ')}">${body.slice(open.length)}`;
    }
    out = `${out.slice(0, s.start)}${next}${out.slice(s.end)}`;
    return { row, result: 'placed' };
  });
  return { html: out, results };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : undefined; };
  const r = applySectionStyle(fs.readFileSync(arg('in'), 'utf8'), JSON.parse(fs.readFileSync(arg('data'), 'utf8')));
  fs.writeFileSync(arg('out'), r.html);
  r.results.forEach(({ row, result }) => console.log(`${row.heading} +${row.add}: ${result}`));
}
