/* eslint-disable no-console, max-len, import/extensions, import/no-extraneous-dependencies -- tooling; linkedom is a dev dependency */
/**
 * www's intro in a one-column view of its own after the title, into DA's copies as they are (DA's copy plus the
 * delta, not a re-import; standing order 10 of 2026-11-12, item 2: Discover's additional-services). Per data row
 * ({ path, text }: text the start of www's intro paragraph): the paragraph right after the document's H1, if its text
 * starts with the row's, gets " {column-start-outer column-end-outer}" at its end, which the page draws as the
 * view's padding and the collapse keeps (THEMES.discover columnViews.oneElementViews). A paragraph with a marker
 * already, or not found, changes nothing. Idempotent.
 *
 * Usage: node tools/importer/one-element-view-apply.mjs --data rows.json --docs <DA copies> --out <dir> [--list <reimport list>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

const norm = (s) => (s || '').replace(/\s+/g, ' ').trim().toLowerCase();
const MARKS = ' {column-start-outer column-end-outer}';

/** The document's HTML with the row's marks; returns { html, result }. */
export function applyOneElementView(html, row) {
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main>${html}</main></body></html>`);
  const main = document.querySelector('main');
  const h1 = main.querySelector(':scope > div > h1');
  const p = h1 && h1.nextElementSibling;
  if (!p || p.tagName !== 'P' || !norm(p.textContent).startsWith(norm(row.text).slice(0, 40))) return { html, result: 'not found' };
  if (/\{[^}]*\}\s*$/.test(p.textContent)) return { html, result: 'present' };
  p.append(document.createTextNode(MARKS));
  return { html: main.innerHTML, result: 'marked' };
}

/** A list's paths: one a line, or a reimport list's rows (tab-separated), only the READY ones (its last column). */
export const listPaths = (txt) => txt.split('\n').map((l) => l.split('\t'))
  .filter((c) => c[0].trim().startsWith('/') && (c.length === 1 || /^READY\b/.test(c[c.length - 1].trim())))
  .map((c) => c[0].trim());

const main = () => {
  const args = process.argv.slice(2);
  const opt = (k) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
  const data = JSON.parse(fs.readFileSync(opt('data'), 'utf8'));
  const list = opt('list') ? listPaths(fs.readFileSync(opt('list'), 'utf8')) : null;
  data.filter((r) => !list || list.includes(r.path)).forEach((row) => {
    const src = [`${row.path}.plain.html`, `${row.path}.html`].map((f) => path.join(opt('docs'), f)).find((f) => fs.existsSync(f));
    if (!src) { console.log(`${row.path}\tno document`); return; }
    const { html, result } = applyOneElementView(fs.readFileSync(src, 'utf8'), row);
    console.log(`${row.path}\t"${row.text.slice(0, 40)}"\t${result}`);
    if (result !== 'marked') return;
    const out = path.join(opt('out'), path.relative(opt('docs'), src));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, html);
  });
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
