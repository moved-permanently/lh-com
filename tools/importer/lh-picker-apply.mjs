/* eslint-disable no-console, import/extensions, import/prefer-default-export -- tooling */
/**
 * Adds lufthansa.com's passengers and cabin picker rows (parsers/flight-search-picker.js, the
 * rows the flight-search parser writes on later imports) to documents imported before: in each
 * document only its flight-search block with a flights tab gets them, after its Traveller label
 * row, in the document's own cell format (cells with or without <p>); rows it has already are
 * kept as they are (run twice, changed once). The rest of the document stays byte for byte.
 * The group booking link: the root's group travel page (www's groupBookingsUrl on every root,
 * /content/lh/markets/<cc>/<ll>/book-and-manage/group-travel).
 *
 * Usage: node tools/importer/lh-picker-apply.mjs --list <paths> [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pickerRows } from './parsers/flight-search-picker.js';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

/** The block's start and end in the document (balanced divs), or null. */
function blockAt(html) {
  const start = html.search(/<div class="flight-search(?: [^"]*)?">/);
  if (start < 0) return null;
  let depth = 0;
  const re = /<\/?div\b[^>]*>/g;
  re.lastIndex = start;
  let m = re.exec(html);
  while (m) {
    depth += m[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return { start, end: m.index + m[0].length };
    m = re.exec(html);
  }
  return null;
}

/**
 * The document with the picker rows in its flight-search block.
 * @param {string} html the document (.plain.html)
 * @param {string} docPath its path (/<cc>/<ll>/...): the language and the root
 */
export function applyPicker(html, docPath) {
  const at = blockAt(html);
  if (!at) return html;
  const block = html.slice(at.start, at.end);
  const rowRe = /<div><div>(?:<p>)?([^<]+?)(?:<\/p>)?<\/div><div>([\s\S]*?)<\/div><\/div>/g;
  const rows = [...block.matchAll(rowRe)];
  const keys = rows.map((r) => r[1].trim());
  const tabs = rows.find((r) => r[1].trim() === 'Tabs');
  const tabText = tabs ? tabs[2].replace(/<[^>]+>/g, '').trim() : '';
  // a search with a flights tab (no Tabs row: the flight search only)
  if (tabs && !/flights|flüge|flug/i.test(tabText)) return html;
  const p = block.includes('<div><div><p>');
  const cell = (v) => (p ? `<p>${v}</p>` : v);
  const [, cc, ll] = docPath.match(/^\/([a-z]{2})\/([a-z]{2})(\/|$)/) || [];
  if (!cc) return html;
  const add = pickerRows({ lang: ll, groupBookingsUrl: `/content/lh/markets/${cc}/${ll}/book-and-manage/group-travel` })
    .filter(([k]) => !keys.includes(k))
    .map(([k, v]) => `<div><div>${cell(esc(k))}</div><div>${cell(typeof v === 'string' ? esc(v) : `<a href="${esc(v.href)}">${esc(v.text)}</a>`)}</div></div>`)
    .join('');
  if (!add) return html;
  // after the traveller line, else after the trip types, else at the block's end
  const anchor = rows.find((r) => r[1].trim() === 'Traveller label') || rows.find((r) => r[1].trim() === 'Trip types');
  const insertAt = anchor ? at.start + anchor.index + anchor[0].length : at.end - '</div>'.length;
  return `${html.slice(0, insertAt)}${add}${html.slice(insertAt)}`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
  const argv = process.argv.slice(2);
  const list = argv[argv.indexOf('--list') + 1];
  const dry = argv.includes('--dry-run');
  let changed = 0;
  fs.readFileSync(path.resolve(root, list), 'utf8').split('\n').map((l) => l.trim()).filter(Boolean)
    .forEach((p) => {
      const file = path.join(root, 'content', `${p}.plain.html`);
      const html = fs.readFileSync(file, 'utf8');
      const out = applyPicker(html, p);
      if (out === html) { console.log(`unchanged ${p}`); return; }
      changed += 1;
      if (!dry) fs.writeFileSync(file, out);
      console.log(`${dry ? 'would change' : 'changed'} ${p}`);
    });
  console.log(`${changed} documents ${dry ? 'would change' : 'changed'}`);
}
