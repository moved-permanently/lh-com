/* eslint-disable no-console, max-len, import/prefer-default-export -- tooling */
/**
 * A section of only a heading joined with the section after it, when that one opens with a given block, back into DA's
 * copy (standing order 21 of 2026-11-14: /de/en/during-your-trip/lhg-wifi and book-and-manage/rebook/involuntary-rebooking,
 * "Frequently Asked Questions" and its Accordion Columns). www's padded AEM section holds both; the importer's template
 * break before the accordion put the heading in a padded section of its own. The importer keeps them together since then
 * (lufthansa-sections, test/faq-join-so21); this is the delta for the documents imported before.
 * Per row ({heading, block}): the section (a top-level div of main, or of the document for a .plain.html) that holds only a
 * heading starting with `heading` (and its section-metadata block) and is followed by a section without styles or
 * section metadata (markets included) opening with a `block` block: the next section's content moves into it, before
 * its section-metadata block, and the next section goes. A row whose heading is not found, is found more than once, whose
 * section holds more than the heading, or whose next section has styles or metadata or does not open with the block,
 * changes nothing. Everything else stays byte for byte.
 *
 * Usage: node tools/importer/section-join-apply.mjs --data rows.json --in <DA copy.html> --out <file>
 *   rows.json: [{ "heading": "Frequently Asked Questions", "block": "accordion-columns" }]
 * Reads and writes local files only; the upload is the import helper's.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const text = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

/** The top-level divs between from and to: [{ start, end, openEnd }]. */
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

/** A section's parts: { open, inner (without its section-metadata block), meta, close }. */
function parts(html, s) {
  const open = html.slice(s.start, s.openEnd);
  const body = html.slice(s.openEnd, s.end - '</div>'.length);
  const at = body.search(/<div class="section-metadata">/);
  return { open, inner: at >= 0 ? body.slice(0, at) : body, meta: at >= 0 ? body.slice(at) : '' };
}

/** The document with the rows' joins: { html, results: [{ row, result }] }. */
export function applySectionJoin(html, rows) {
  let out = html;
  const results = rows.map((row) => {
    if (!row.heading || !row.block) return { row, result: 'bad row' };
    const main = out.indexOf('<main>');
    const from = main >= 0 ? main + 6 : 0;
    const to = main >= 0 ? out.indexOf('</main>', from) : out.length;
    const all = sections(out, from, to);
    const hits = all.map((s, i) => ({ s, i, p: parts(out, s) })).filter(({ p }) => {
      const h = p.inner.match(/^\s*<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>\s*$/);
      return h && text(h[2]).startsWith(row.heading);
    });
    if (!hits.length) {
      const anywhere = all.some((s) => text(parts(out, s).inner).startsWith(row.heading));
      return { row, result: anywhere ? 'holds more than the heading' : 'not found' };
    }
    if (hits.length > 1) return { row, result: 'found more than once' };
    const [{ s, i, p }] = hits;
    const next = all[i + 1];
    if (!next) return { row, result: 'no section after it' };
    const n = parts(out, next);
    // its styles or metadata (markets included) would be lost
    if (/class="/.test(n.open) || n.meta) return { row, result: 'next section has styles or metadata' };
    if (!new RegExp(`^\\s*<div class="${row.block}(?=[ "])`).test(n.inner)) return { row, result: 'next section does not open with the block' };
    // the heading's section: its own open tag and content, the next one's content, then its metadata block
    const joined = `${p.open}${p.inner.replace(/\s*$/, '')}${n.inner}${p.meta}</div>`;
    out = `${out.slice(0, s.start)}${joined}${out.slice(next.end)}`;
    return { row, result: 'placed' };
  });
  return { html: out, results };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : undefined; };
  const r = applySectionJoin(fs.readFileSync(arg('in'), 'utf8'), JSON.parse(fs.readFileSync(arg('data'), 'utf8')));
  fs.writeFileSync(arg('out'), r.html);
  r.results.forEach(({ row, result }) => console.log(`${row.heading} + ${row.block}: ${result}`));
}
