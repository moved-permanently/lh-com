/* eslint-disable no-console, max-len, import/extensions, import/prefer-default-export -- tooling */
/**
 * An element inside a block, into DA's copies as they are (standing order 12 of 2026-11-13, item 1, ITA row 50; not a
 * new import: DA's copies hold market variants a re-import drops). Per document a list of rows (--data, JSON: {
 * "<path>": [{ before, html, count }] }): `html` goes right before each exact occurrence of `before` (an element's whole
 * HTML, e.g. a paragraph in a tab's cell); there must be `count` of them (the market variants). Refused, and the
 * document left as it is: another number found, or `html` already right before one of them (so a second run changes
 * nothing). Every other byte as DA's. (ita-insert-apply.mjs places elements at the section level only.)
 *
 * Usage: node tools/importer/ita-fragment-insert-apply.mjs --data rows.json --docs <dir> --out <dir> [--list a reimport
 *   list (its READY rows)]
 * <dir>/<path>.html: DA's copy; the result under --out, the same name.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The document with each row's HTML in place, or as it was with the problems.
 * @param {string} html DA's copy
 * @param {{before: string, html: string, count: number}[]} rows
 */
export function applyFragments(html, rows) {
  const problems = [];
  rows.forEach((r) => {
    const found = html.split(r.before).length - 1;
    if (found !== r.count) problems.push(`"${r.before.slice(0, 60)}": ${found} found, ${r.count} expected`);
    else if (html.includes(`${r.html}${r.before}`)) problems.push(`"${r.html}" stands before it already`);
  });
  if (problems.length) return { html, problems };
  let out = html;
  rows.forEach((r) => { out = out.split(r.before).join(`${r.html}${r.before}`); });
  return { html: out, problems };
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const opt = (k) => (argv.includes(`--${k}`) ? argv[argv.indexOf(`--${k}`) + 1] : null);
  const data = JSON.parse(fs.readFileSync(opt('data'), 'utf8'));
  let paths = Object.keys(data);
  if (opt('list')) {
    const lines = fs.readFileSync(opt('list'), 'utf8').split('\n').filter((l) => l.trim() && !l.startsWith('#'));
    const ready = lines.filter((l) => /\tREADY\b/.test(l)).map((l) => l.split('\t')[0].trim());
    paths = paths.filter((p) => ready.includes(p));
  }
  let problems = 0;
  paths.forEach((p) => {
    const html = fs.readFileSync(path.join(opt('docs'), `${p}.html`), 'utf8');
    const r = applyFragments(html, data[p]);
    if (r.problems.length) { problems += 1; console.log(`${p}: NOT CHANGED: ${r.problems.join('; ')}`); return; }
    const target = path.join(opt('out'), `${p}.html`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, r.html);
    console.log(`${p}: ${data[p].length} row(s) placed; the rest as DA's`);
  });
  console.log(`ita-fragment-insert-apply: ${paths.length - problems} written, ${problems} not changed`);
  if (problems) process.exitCode = 1;
}
