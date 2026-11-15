/* eslint-disable no-console, max-len, import/prefer-default-export -- tooling */
/**
 * A row added to the page Metadata block of DA's copy (standing order 30: Template legal on lufthansa.com's legal pages;
 * aem.js then gives the body the class legal). Per row ({key, value}): the document's Metadata block (div.metadata in
 * DA's format) gets a row key | value at its end. A document without a Metadata block, or whose block has the key
 * already (any value), changes nothing ("not found", "there already" or "differs: <value>"). Everything else stays byte
 * for byte. A published .plain.html carries no Metadata block: nothing to do there ("not found").
 *
 * Usage: node tools/importer/metadata-row-apply.mjs --data rows.json --in <DA copy.html> --out <file>
 *   rows.json: [{ "key": "Template", "value": "legal" }]
 * Reads and writes local files only; the upload is the import helper's.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const text = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

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

/** The document with the rows: { html, results: [{ row, result }] }. */
export function applyMetadataRow(html, rows) {
  let out = html;
  const results = rows.map((row) => {
    if (!/^[A-Za-z][A-Za-z0-9 -]*$/.test(row.key || '') || typeof row.value !== 'string' || !row.value || /[<>]/.test(row.value)) return { row, result: 'bad row' };
    const at = out.lastIndexOf('<div class="metadata">');
    if (at < 0) return { row, result: 'not found' };
    const end = closeOf(out, at);
    if (end < 0) return { row, result: 'not found' };
    const block = out.slice(at, end);
    const pairs = [...block.matchAll(/<div><div>([\s\S]*?)<\/div><div>([\s\S]*?)<\/div><\/div>/g)].map((m) => [text(m[1]), text(m[2])]);
    const same = pairs.find(([k]) => k.toLowerCase() === row.key.toLowerCase());
    if (same) return { row, result: same[1] === row.value ? 'there already' : `differs: ${same[1]}` };
    const close = end - '</div>'.length;
    out = `${out.slice(0, close)}<div><div>${row.key}</div><div>${row.value}</div></div>${out.slice(close)}`;
    return { row, result: 'placed' };
  });
  return { html: out, results };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : undefined; };
  const r = applyMetadataRow(fs.readFileSync(arg('in'), 'utf8'), JSON.parse(fs.readFileSync(arg('data'), 'utf8')));
  fs.writeFileSync(arg('out'), r.html);
  r.results.forEach(({ row, result }) => console.log(`${row.key} | ${row.value}: ${result}`));
}
