/* eslint-disable no-console, max-len, import/extensions, import/prefer-default-export -- tooling */
/**
 * A block option into DA's copies as they are (standing order 8 of 2026-11-12, item 2, ITA row 36: baggage-and-
 * strollers' fare accordion, whose www items open at load; main's importer writes accordion-columns (open-2), but DA's
 * copy has market variants of the block a re-import drops). Per document a list of rows (--data, JSON: { "<path>": [{
 * block, start, add, count }] }): every block `<div class="<block>...">` whose text starts with `start` gets the option
 * `add` in its class; there must be `count` of them (the market variants). Refused, and the document left as it is:
 * another number of such blocks, or one of them with the option already. Nothing else changes.
 *
 * Usage: node tools/importer/ita-block-options-apply.mjs --data rows.json --docs <dir> --out <dir> [--list a reimport list
 *   (its READY rows)]
 * <dir>/<path>.html: DA's copy; the result under --out, the same name.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { divEnd } from './brussels-import.mjs';

const decode = (s) => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"');
const textOf = (h) => decode(h.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The document with the rows' options, or as it was with the problems.
 * @param {string} html DA's copy
 * @param {{block: string, start: string, add: string, count: number}[]} rows
 */
export function applyOptions(html, rows) {
  const problems = [];
  const edits = [];
  rows.forEach((r) => {
    const re = new RegExp(`<div class="${esc(r.block)}((?: [^"]*)?)">`, 'g');
    const hits = [...html.matchAll(re)].filter((m) => textOf(html.slice(m.index, divEnd(html, m.index))).startsWith(r.start));
    if (hits.length !== r.count) { problems.push(`${r.block} "${r.start}": ${hits.length} blocks, ${r.count} expected`); return; }
    hits.forEach((m) => {
      const opts = m[1].trim().split(/\s+/).filter(Boolean);
      if (opts.includes(r.add)) { problems.push(`${r.block} "${r.start}": ${r.add} there already`); return; }
      edits.push({ at: m.index, len: m[0].length, tag: `<div class="${[r.block, ...opts, r.add].join(' ')}">` });
    });
  });
  if (problems.length) return { html, problems };
  let out = html;
  edits.sort((a, b) => b.at - a.at).forEach((e) => { out = `${out.slice(0, e.at)}${e.tag}${out.slice(e.at + e.len)}`; });
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
    const r = applyOptions(html, data[p]);
    if (r.problems.length) { problems += 1; console.log(`${p}: NOT CHANGED: ${r.problems.join('; ')}`); return; }
    const target = path.join(opt('out'), `${p}.html`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, r.html);
    console.log(`${p}: ${data[p].map((x) => `${x.add} on ${x.count} ${x.block}`).join(', ')}; the rest as DA's`);
  });
  console.log(`ita-block-options-apply: ${paths.length - problems} written, ${problems} not changed`);
  if (problems) process.exitCode = 1;
}
