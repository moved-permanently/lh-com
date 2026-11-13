/* eslint-disable no-console, max-len, import/extensions, import/prefer-default-export -- tooling */
/**
 * Heading size markers into DA's copies as they are (standing order 8 of 2026-11-12, item 2: /it/en/support/utilities/
 * contact, whose www column-view headings are heading-medium; the collapse leaves them unmarked and ITA row 31 sets an
 * unmarked Columns Media H2 at heading-small's size; DA's copy has market variants a re-import drops). Per document a
 * list of rows (--data, JSON: { "<path>": [{ block, level, mark, count }] }): every <level> heading inside a block
 * `<div class="<block>...">` gets " {<mark>}" at its end (scripts/style-markers.js HEADING_TOKENS); there must be
 * `count` of them. Refused, and the document left as it is: another number, or one of them with a marker already.
 *
 * Usage: node tools/importer/ita-heading-marks-apply.mjs --data rows.json --docs <dir> --out <dir> [--list a reimport list
 *   (its READY rows)]
 * <dir>/<path>.html: DA's copy; the result under --out, the same name.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { divEnd } from './brussels-import.mjs';

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * The document with the rows' markers, or as it was with the problems.
 * @param {string} html DA's copy
 * @param {{block: string, level: string, mark: string, count: number}[]} rows
 */
export function applyMarks(html, rows) {
  const problems = [];
  const edits = [];
  rows.forEach((r) => {
    const blocks = [...html.matchAll(new RegExp(`<div class="${esc(r.block)}(?: [^"]*)?">`, 'g'))].map((m) => [m.index, divEnd(html, m.index)]);
    const heads = [];
    blocks.forEach(([a, b]) => {
      const re = new RegExp(`<${r.level}\\b[^>]*>([\\s\\S]*?)</${r.level}>`, 'g');
      re.lastIndex = a;
      for (let m = re.exec(html); m && m.index < b; m = re.exec(html)) heads.push({ at: m.index + m[0].length - `</${r.level}>`.length, inner: m[1] });
    });
    if (heads.length !== r.count) { problems.push(`${r.level} in ${r.block}: ${heads.length}, ${r.count} expected`); return; }
    if (heads.some((h) => /\{[^}]*\}\s*$/.test(h.inner.replace(/<[^>]+>/g, '')))) { problems.push(`${r.level} in ${r.block}: a marker there already`); return; }
    heads.forEach((h) => edits.push({ at: h.at, text: ` {${r.mark}}` }));
  });
  if (problems.length) return { html, problems };
  let out = html;
  edits.sort((a, b) => b.at - a.at).forEach((e) => { out = `${out.slice(0, e.at)}${e.text}${out.slice(e.at)}`; });
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
    const r = applyMarks(html, data[p]);
    if (r.problems.length) { problems += 1; console.log(`${p}: NOT CHANGED: ${r.problems.join('; ')}`); return; }
    const target = path.join(opt('out'), `${p}.html`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, r.html);
    console.log(`${p}: ${data[p].map((x) => `{${x.mark}} on ${x.count} ${x.level}`).join(', ')}; the rest as DA's`);
  });
  console.log(`ita-heading-marks-apply: ${paths.length - problems} written, ${problems} not changed`);
  if (problems) process.exitCode = 1;
}
