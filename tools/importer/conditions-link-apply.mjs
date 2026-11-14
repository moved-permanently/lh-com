/* eslint-disable no-console, max-len, import/extensions, import/prefer-default-export -- tooling */
/**
 * The fares' conditions as a link to their dialog, in DA's copies as they are (standing order 15 of 2026-11-14, item 1;
 * not a new import: DA's copies hold market sections a re-import drops). A homepage whose page text carries the
 * conditions' title paragraph and the whole text (Brussels fr/fr, ke/en) gets the title as a link to the market's
 * /modals/general-conditions document, which scripts/fragment-dialog.js opens as a dialog (as be/en's homepage and www).
 * Per document (--data, JSON: { "<path>": { title, href } }): `<p>{title}</p>` followed by exactly one text paragraph
 * and then the section's end is replaced by `<p><a href="{href}">{title}</a></p>`. Refused, and the document left as it
 * is, otherwise (so a second run changes nothing). Every other byte as DA's.
 *
 * Usage: node tools/importer/conditions-link-apply.mjs --data rows.json --docs <dir> --out <dir> [--list a delta list
 *   (its READY rows, status first or last)]
 * <dir>/<path>.html: DA's copy; the result under --out, the same name.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readyPaths } from './ita-fragment-insert-apply.mjs';

/**
 * @param {string} html DA's copy
 * @param {{title: string, href: string}} row
 */
export function applyConditionsLink(html, row) {
  const title = `<p>${row.title}</p>`;
  const found = html.split(title).length - 1;
  if (found !== 1) return { html, problems: [`"${row.title}" as a paragraph: ${found} found, 1 expected`] };
  const at = html.indexOf(title);
  const rest = html.slice(at + title.length);
  // one text paragraph, then the section's end or the page's metadata block
  const m = rest.match(/^<p>(?:(?!<p>|<\/p>)[\s\S])*<\/p>(?=<\/div>|<div class="metadata">)/);
  if (!m) return { html, problems: ['the title is not followed by one text paragraph and the section\'s end or the metadata'] };
  const textEnd = at + title.length + m[0].length;
  return { html: `${html.slice(0, at)}<p><a href="${row.href}">${row.title}</a></p>${html.slice(textEnd)}`, problems: [] };
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const opt = (k) => (argv.includes(`--${k}`) ? argv[argv.indexOf(`--${k}`) + 1] : null);
  const data = JSON.parse(fs.readFileSync(opt('data'), 'utf8'));
  let paths = Object.keys(data);
  if (opt('list')) {
    const ready = readyPaths(fs.readFileSync(opt('list'), 'utf8'));
    paths = paths.filter((p) => ready.includes(p));
  }
  let problems = 0;
  paths.forEach((p) => {
    const html = fs.readFileSync(path.join(opt('docs'), `${p}.html`), 'utf8');
    const r = applyConditionsLink(html, data[p]);
    if (r.problems.length) { problems += 1; console.log(`${p}: NOT CHANGED: ${r.problems.join('; ')}`); return; }
    const target = path.join(opt('out'), `${p}.html`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, r.html);
    console.log(`${p}: the conditions' title links to ${data[p].href}; the rest as DA's`);
  });
  console.log(`conditions-link-apply: ${paths.length - problems} written, ${problems} not changed`);
  if (problems) process.exitCode = 1;
}
