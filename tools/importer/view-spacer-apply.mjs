/* eslint-disable no-console, max-len, import/no-extraneous-dependencies, import/prefer-default-export -- tooling */
/**
 * www's separator that ends an AEM section right above a column view, back into DA's copy (standing order 14 of
 * 2026-11-13: the children's-menus documents, "Kids Box on European flights" 40px higher than www's). The importer keeps
 * such a separator since then (lufthansa-cleanup missingSeparatorMarkers); this is the delta for the documents imported
 * before. Per row ({heading, n}): the block (a div with a class at a section's top level) whose first heading starts with
 * `heading` gets a <p>{spacer-n}</p> right before it, unless its previous element is a separator paragraph already. A row
 * whose heading is not found, or found more than once, changes nothing. Everything else stays byte for byte.
 *
 * Usage: node tools/importer/view-spacer-apply.mjs --data rows.json --in <DA copy.html> --out <file>
 *   rows.json: [{ "heading": "Kids Box on European flights", "n": 40 }]
 * Reads and writes local files only; the upload is the import helper's.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

const SEPARATOR = /^\{(spacer|divider)-\d{1,3}( from-768)?\}$/;
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** The document with the rows' spacers: { html, results: [{ row, result }] }. */
export function applyViewSpacer(html, rows) {
  let out = html;
  const results = rows.map((row) => {
    const { document } = parseHTML(`<html>${out}</html>`);
    const blocks = [...document.querySelectorAll('main > div > div[class], body > div > div[class]')].filter((b) => {
      const h = b.querySelector('h1, h2, h3, h4, h5, h6');
      return h && h.textContent.trim().startsWith(row.heading);
    });
    if (!blocks.length) return { row, result: 'not found' };
    if (blocks.length > 1) return { row, result: 'found more than once' };
    const prev = blocks[0].previousElementSibling;
    if (prev && prev.tagName === 'P' && SEPARATOR.test(prev.textContent.trim())) return { row, result: 'there already' };
    // the source: the block's opening tag followed (within it) by the heading text, once
    const h = blocks[0].querySelector('h1, h2, h3, h4, h5, h6');
    const re = new RegExp(`<div class="${escape(blocks[0].getAttribute('class'))}">(?=(?:(?!<div class="${escape(blocks[0].getAttribute('class'))}">)[\\s\\S])*?${escape(h.textContent.trim().slice(0, 20))})`, 'g');
    const found = [...out.matchAll(re)];
    if (found.length !== 1) return { row, result: `source match ${found.length}` };
    out = `${out.slice(0, found[0].index)}<p>{spacer-${row.n}}</p>${out.slice(found[0].index)}`;
    return { row, result: 'placed' };
  });
  return { html: out, results };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : undefined; };
  const r = applyViewSpacer(fs.readFileSync(arg('in'), 'utf8'), JSON.parse(fs.readFileSync(arg('data'), 'utf8')));
  fs.writeFileSync(arg('out'), r.html);
  r.results.forEach(({ row, result }) => console.log(`${row.heading} {spacer-${row.n}}: ${result}`));
}
