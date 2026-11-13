/* eslint-disable no-console, max-len, import/prefer-default-export -- tooling */
/**
 * An unpadded AEM section between two padded ones as a section of its own, back into DA's copy (standing order 18 of
 * 2026-11-13: /de/en/passengers-with-sensory-impairment's "Travelling with a companion"). The importer splits there
 * since then (lufthansa-sections, test/info-padded-sandwich-so18); this is the delta for the documents imported before.
 * Per row ({heading, before, style}): the section (a top-level div of main, or of the document for a .plain.html)
 * holding a direct-child heading whose text starts with `heading` (not its first element) is split right before that
 * heading. The part before keeps the section's styles plus `before` ("flush" or "spaced"); the part from the heading on
 * gets `style` ("spaced"). Styles are the section-metadata block in DA's format, the section's classes in a published
 * .plain.html. A row whose heading is not found, is found more than once, opens its section, or whose section is split
 * there already, changes nothing. Everything else stays byte for byte.
 *
 * Usage: node tools/importer/section-split-apply.mjs --data rows.json --in <DA copy.html> --out <file>
 *   rows.json: [{ "heading": "Travelling with a companion.", "before": "flush", "style": "spaced" }]
 * Reads and writes local files only; the upload is the import helper's.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const text = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const META = /<div class="section-metadata"><div><div>style<\/div><div>([^<]*)<\/div><\/div><\/div>/;
const meta = (styles) => `<div class="section-metadata"><div><div>style</div><div>${styles.join(', ')}</div></div></div>`;

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

/** The direct-child headings of a section's body: [{ at, text }] (at: index in body). */
function childHeadings(body) {
  const out = [];
  const re = /<(\/?)(div|h[1-6])\b[^>]*>/g;
  let depth = 0;
  for (let m = re.exec(body); m; m = re.exec(body)) {
    if (m[2] === 'div') depth += m[1] ? -1 : 1;
    else if (!m[1] && depth === 1) {
      const close = body.indexOf(`</${m[2]}>`, m.index);
      out.push({ at: m.index, text: text(body.slice(m.index, close)) });
    }
  }
  return out;
}

/** The document with the rows' splits: { html, results: [{ row, result }] }. */
export function applySectionSplit(html, rows) {
  let out = html;
  const results = rows.map((row) => {
    if (!['flush', 'spaced'].includes(row.before) || !row.style) return { row, result: 'bad row' };
    const main = out.indexOf('<main>');
    const from = main >= 0 ? main + 6 : 0;
    const to = main >= 0 ? out.indexOf('</main>', from) : out.length;
    const hits = sections(out, from, to).flatMap((s) => childHeadings(out.slice(s.start, s.end))
      .filter((h) => h.text.startsWith(row.heading)).map((h) => ({ s, h })));
    if (!hits.length) return { row, result: 'not found' };
    if (hits.length > 1) return { row, result: 'found more than once' };
    const [{ s, h }] = hits;
    const body = out.slice(s.start, s.end);
    const open = out.slice(s.start, s.openEnd);
    // the heading's line start in a pretty-printed copy (its indentation goes with it)
    let at = h.at;
    while (at > 0 && /[ \t]/.test(body[at - 1])) at -= 1;
    if (!body.slice(open.length, at).replace(/\s+/g, '')) return { row, result: 'opens its section' };
    let first;
    let second;
    const m = body.match(META);
    if (m) {
      // DA's format: the metadata block ends the section; both parts get one
      const styles = m[1].split(',').map((x) => x.trim()).filter(Boolean);
      const metaAt = body.lastIndexOf(m[0]);
      first = `${body.slice(0, at)}${meta([...styles, row.before])}</div>\n`;
      second = `<div>${body.slice(at, metaAt)}${meta([row.style])}${body.slice(metaAt + m[0].length)}`;
    } else {
      const cls = open.match(/class="([^"]*)"/);
      const styles = cls ? cls[1].split(/\s+/).filter(Boolean) : [];
      if (!m && main >= 0) return { row, result: 'no section-metadata in DA format' };
      first = `${styles.length || row.before ? `<div class="${[...styles, row.before].join(' ')}">` : '<div>'}${body.slice(open.length, at).replace(/\s*$/, '\n')}</div>\n`;
      second = `<div class="${row.style}">\n${body.slice(at)}`;
    }
    out = `${out.slice(0, s.start)}${first}${second}${out.slice(s.end)}`;
    return { row, result: 'placed' };
  });
  return { html: out, results };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : undefined; };
  const r = applySectionSplit(fs.readFileSync(arg('in'), 'utf8'), JSON.parse(fs.readFileSync(arg('data'), 'utf8')));
  fs.writeFileSync(arg('out'), r.html);
  r.results.forEach(({ row, result }) => console.log(`${row.heading} (${row.before} | ${row.style}): ${result}`));
}
