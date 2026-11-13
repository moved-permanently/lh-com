/* eslint-disable no-console, max-len, import/extensions, import/prefer-default-export -- tooling */
/**
 * www's table cells as they read, into DA's copies as they are (standing order 9 of 2026-11-13, item 2: baggage-and-
 * strollers' fare tables, "<b>Baggage</b><br>No baggage", flattened by the import to "BaggageNo baggage"; DA's copy has
 * market variants a re-import drops). Per document (--data, JSON: { "<path>": { cells: { "<flat text>": "<www's cell
 * HTML>" }, count } }): every <td> / <th> whose text (tags and entities aside, spaces folded) is a key gets that HTML;
 * there must be `count` such cells. Refused, and the document left as it is: another number, or a matching cell with
 * a <br> or <strong> already (a second run changes nothing).
 *
 * Usage: node tools/importer/ita-cells-apply.mjs --data cells.json --docs <dir> --out <dir> [--list a reimport list (its
 *   READY rows)]
 * <dir>/<path>.html: DA's copy; the result under --out, the same name.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const decode = (s) => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'");
const flat = (h) => decode(h.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

/**
 * The document with www's cells, or as it was with the problems.
 * @param {string} html DA's copy
 * @param {{cells: Object<string, string>, count: number}} spec
 */
export function applyCells(html, spec) {
  const problems = [];
  let n = 0;
  let marked = 0;
  const out = html.replace(/<(td|th)>([\s\S]*?)<\/\1>/g, (all, tag, inner) => {
    const key = flat(inner);
    if (!Object.prototype.hasOwnProperty.call(spec.cells, key)) return all;
    if (/<br\b|<strong\b/.test(inner)) { marked += 1; return all; }
    n += 1;
    return `<${tag}>${spec.cells[key]}</${tag}>`;
  });
  if (marked) problems.push(`${marked} matching cells have the markup already`);
  if (n + marked !== spec.count) problems.push(`${n + marked} matching cells, ${spec.count} expected`);
  return problems.length ? { html, problems } : { html: out, problems };
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
    const r = applyCells(html, data[p]);
    if (r.problems.length) { problems += 1; console.log(`${p}: NOT CHANGED: ${r.problems.join('; ')}`); return; }
    const target = path.join(opt('out'), `${p}.html`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, r.html);
    console.log(`${p}: ${data[p].count} cells as www's; the rest as DA's`);
  });
  console.log(`ita-cells-apply: ${paths.length - problems} written, ${problems} not changed`);
  if (problems) process.exitCode = 1;
}
