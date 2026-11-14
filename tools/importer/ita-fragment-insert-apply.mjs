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

/**
 * The paths of a list's READY rows, in either layout: READY / HOLD as the first column and the path second (standing
 * order 14), or the path first and the status in a later column (the older lists). Comment lines and HOLD rows never.
 * @param {string} text the list file
 * @returns {string[]}
 */
export function readyPaths(text) {
  return text.split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.split('\t')).flatMap((c) => {
    if (/^(READY|HOLD)\b/.test(c[0])) return c[0].startsWith('READY') ? [c[1].trim()] : [];
    return c.slice(1).some((v) => /^READY\b/.test(v)) ? [c[0].trim()] : [];
  });
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
