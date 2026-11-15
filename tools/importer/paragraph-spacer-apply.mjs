/* eslint-disable no-console, max-len, import/prefer-default-export -- tooling */
/**
 * www's empty line back into DA's copy (standing order 20 of 2026-11-13: a paragraph of only no-break spaces between two
 * text paragraphs or lists, 56px on www, dropped by the framework; the importer writes "{spacer-56}" since then,
 * test/empty-lines-so20). Per row ({text, n, all}): the paragraph whose text starts with `text` gets a <p>{spacer-n}</p>
 * right before it, unless the element before it is a separator paragraph already; with all: true every such paragraph
 * (wheelchair-batteries: two identical paragraphs, each after an empty line). A row whose paragraph is not found, or
 * found more than once without all, changes nothing. Everything else stays byte for byte.
 *
 * A row with kind "divider" writes {divider-n} (a 1px line, n px under it) instead, and tag "h1" ... "h6" looks for a
 * heading of that level instead of a paragraph (standing order 38: Cargo's live-animals note).
 *
 * Usage: node tools/importer/paragraph-spacer-apply.mjs --data rows.json --in <DA copy.html> --out <file>
 *   rows.json: [{ "text": "The distance is calculated", "n": 56 }] or [{ "text": "Update", "n": 50, "kind": "divider", "tag": "h4" }]
 * Reads and writes local files only; the upload is the import helper's.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const plain = (s) => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const SEPARATOR = /<p>\s*\{(spacer|divider)-\d{1,3}( from-768)?\}\s*<\/p>\s*$/;

/** The document with the rows' spacers: { html, results: [{ row, result }] }. */
export function applyParagraphSpacer(html, rows) {
  let out = html;
  const results = rows.map((row) => {
    if (!row.text || !(Number(row.n) > 0)) return { row, result: 'bad row' };
    // kind "divider" (standing order 38: www's separator, a 1px line, before a heading or paragraph): {divider-n};
    // tag: the element the row's text starts (p, the default, or a heading h1 to h6)
    const kind = row.kind || 'spacer';
    const tag = row.tag || 'p';
    if (!['spacer', 'divider'].includes(kind) || !/^(p|h[1-6])$/.test(tag)) return { row, result: 'bad row' };
    const re = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, 'g');
    const hits = [...out.matchAll(re)].filter((m) => plain(m[1]).startsWith(row.text));
    if (!hits.length) return { row, result: 'not found' };
    if (hits.length > 1 && !row.all) return { row, result: 'found more than once' };
    if (hits.some((m) => SEPARATOR.test(out.slice(0, m.index)))) return { row, result: 'there already' };
    // (from the last one back, so the earlier indexes stay)
    hits.reverse().forEach((m) => { out = `${out.slice(0, m.index)}<p>{${kind}-${Number(row.n)}}</p>${out.slice(m.index)}`; });
    return { row, result: hits.length > 1 ? `placed ${hits.length}` : 'placed' };
  });
  return { html: out, results };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : undefined; };
  const r = applyParagraphSpacer(fs.readFileSync(arg('in'), 'utf8'), JSON.parse(fs.readFileSync(arg('data'), 'utf8')));
  fs.writeFileSync(arg('out'), r.html);
  r.results.forEach(({ row, result }) => console.log(`"${row.text}" {${row.kind || 'spacer'}-${row.n}}: ${result}`));
}
