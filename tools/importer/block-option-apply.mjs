/* eslint-disable no-console, max-len, import/prefer-default-export -- tooling */
/**
 * An option added to one block of DA's copy (standing order 20 of 2026-11-13: the Jump Links of www's ul.responsive lists,
 * option stacked, one link per line below 768px; the importer writes it since then, test/jump-links-stacked-so20). Per
 * row ({block, text, add}): the block (a div whose first class is `block`, DA's format and a published .plain.html alike)
 * whose text starts with `text` gets the class `add` after its own. A row whose block is not found, is found more than
 * once, or has the option already, changes nothing. Everything else stays byte for byte.
 *
 * Usage: node tools/importer/block-option-apply.mjs --data rows.json --in <DA copy.html> --out <file>
 *   rows.json: [{ "block": "jump-links", "text": "Rapid help", "add": "stacked" }]
 * Reads and writes local files only; the upload is the import helper's.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const plain = (s) => s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

/** The index right after the div that opens at start, or -1. */
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

/** The document with the rows' options: { html, results: [{ row, result }] }. */
export function applyBlockOption(html, rows) {
  let out = html;
  const results = rows.map((row) => {
    if (!/^[a-z0-9-]+$/.test(row.block || '') || !/^[a-z0-9-]+$/.test(row.add || '')) return { row, result: 'bad row' };
    const open = new RegExp(`<div class="${row.block}((?: [a-z0-9-]+)*)">`, 'g');
    const hits = [...out.matchAll(open)].filter((m) => {
      const end = closeOf(out, m.index);
      return end > 0 && plain(out.slice(m.index, end)).startsWith(row.text);
    });
    if (!hits.length) return { row, result: 'not found' };
    if (hits.length > 1) return { row, result: 'found more than once' };
    const [m] = hits;
    if (m[1].split(' ').includes(row.add)) return { row, result: 'there already' };
    out = `${out.slice(0, m.index)}<div class="${row.block}${m[1]} ${row.add}">${out.slice(m.index + m[0].length)}`;
    return { row, result: 'placed' };
  });
  return { html: out, results };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : undefined; };
  const r = applyBlockOption(fs.readFileSync(arg('in'), 'utf8'), JSON.parse(fs.readFileSync(arg('data'), 'utf8')));
  fs.writeFileSync(arg('out'), r.html);
  r.results.forEach(({ row, result }) => console.log(`${row.block} "${row.text}" +${row.add}: ${result}`));
}
