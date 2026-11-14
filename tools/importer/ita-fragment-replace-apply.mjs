/* eslint-disable no-console, max-len, import/extensions, import/prefer-default-export -- tooling */
/**
 * Exact strings replaced in DA's copies as they are (standing order 17 of 2026-11-14, item 1; not a new import: DA's
 * copies hold market variants a re-import drops). Per document a list of rows (--data, JSON: { "<path>": [{ from, to,
 * count }] }): each `from`, found exactly `count` times, becomes `to`. Refused, and the document left as it is: another
 * number found, `to` in the document already (so a second run changes nothing, and a revert can tell every replaced
 * place), or two rows that overlap (one row's string inside another's). Every other byte as DA's. --revert: each `to`
 * back to `from`, on the same terms, so the written copy goes back to DA's bytes. (ita-fragment-insert-apply.mjs only
 * inserts.)
 *
 * Usage: node tools/importer/ita-fragment-replace-apply.mjs --data rows.json --docs <dir> --out <dir> [--list a list (its
 *   READY rows)] [--revert]
 * <dir>/<path>.html: DA's copy (or, with --revert, a written copy); the result under --out, the same name.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readyPaths } from './ita-fragment-insert-apply.mjs';

const count = (html, s) => html.split(s).length - 1;

function replaceAll(html, rows, fromKey, toKey) {
  const problems = [];
  rows.forEach((r, i) => {
    rows.forEach((o, j) => {
      if (i !== j && [o.from, o.to].some((s) => r.from.includes(s) || r.to.includes(s))) problems.push(`rows ${i + 1} and ${j + 1} overlap`);
    });
    const found = count(html, r[fromKey]);
    if (found !== r.count) problems.push(`"${r[fromKey].slice(0, 60)}": ${found} found, ${r.count} expected`);
    else if (count(html, r[toKey])) problems.push(`"${r[toKey].slice(0, 60)}" is there already`);
  });
  if (problems.length) return { html, problems: [...new Set(problems)] };
  let out = html;
  rows.forEach((r) => { out = out.split(r[fromKey]).join(r[toKey]); });
  const after = rows.filter((r) => count(out, r[toKey]) !== r.count || count(out, r[fromKey]));
  if (after.length) return { html, problems: after.map((r) => `"${r[toKey].slice(0, 60)}": the rows overlap in this document`) };
  return { html: out, problems };
}

/**
 * The document with each row's `from` replaced by its `to`, or as it was with the problems.
 * @param {string} html DA's copy
 * @param {{from: string, to: string, count: number}[]} rows
 */
export const applyReplacements = (html, rows) => replaceAll(html, rows, 'from', 'to');

/**
 * A written copy back to DA's bytes: each row's `to` replaced by its `from`, or as it was with the problems.
 * @param {string} html the written copy
 * @param {{from: string, to: string, count: number}[]} rows
 */
export const revertReplacements = (html, rows) => replaceAll(html, rows, 'to', 'from');

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const opt = (k) => (argv.includes(`--${k}`) ? argv[argv.indexOf(`--${k}`) + 1] : null);
  const revert = argv.includes('--revert');
  const data = JSON.parse(fs.readFileSync(opt('data'), 'utf8'));
  let paths = Object.keys(data);
  if (opt('list')) {
    const ready = readyPaths(fs.readFileSync(opt('list'), 'utf8'));
    paths = paths.filter((p) => ready.includes(p));
  }
  let problems = 0;
  paths.forEach((p) => {
    const html = fs.readFileSync(path.join(opt('docs'), `${p}.html`), 'utf8');
    const r = (revert ? revertReplacements : applyReplacements)(html, data[p]);
    if (r.problems.length) { problems += 1; console.log(`${p}: NOT CHANGED: ${r.problems.join('; ')}`); return; }
    const target = path.join(opt('out'), `${p}.html`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, r.html);
    console.log(`${p}: ${data[p].length} row(s) ${revert ? 'reverted' : 'replaced'}; the rest as DA's`);
  });
  console.log(`ita-fragment-replace-apply: ${paths.length - problems} written, ${problems} not changed`);
  if (problems) process.exitCode = 1;
}
