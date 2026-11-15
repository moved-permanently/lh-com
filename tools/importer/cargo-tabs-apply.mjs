/* eslint-disable no-console, max-len, import/extensions -- tooling */
/**
 * Cargo's product tab rows into DA's copies as they are (standing order 37, item 3; the list:
 * tools/reports/parity-2026-11-09/delta-so37-cargo-product-tabs.txt, its rows: delta-so37-cargo-product-tabs.json).
 *
 * Per document a spec (--data, JSON: { "<path>": { block, titles, add, rows: [{ panel, cells: [[sig, ...], ...] }] } }):
 *   - block / titles: the block (its class's first name) whose items' titles are these, in this order (found once);
 *   - add: the option the block gets (its class list gets it at the end: "accordion-columns faq" -> "... faq tabs");
 *   - rows: in the panel of the item titled `panel`, the run of the panel's own elements that the cells' signatures name,
 *     one after the other, becomes a one-row table, one cell per entry (<table><tbody><tr><td>...</td>...</tr></tbody>
 *     </table>, in the run's place). A signature is "img" (an element with a picture and no text) or "<tag>|<the start of
 *     its text>" (case and spaces aside).
 * Nothing else changes: every element's bytes are DA's (unwrap(): the tables' tags and the option out give DA's copy back
 * byte for byte). A block not found or found twice, a run not found or found twice, or the option there already: no change.
 *
 * Usage: node tools/importer/cargo-tabs-apply.mjs --data <rows.json> --docs <dir> --out <dir> [--list <delta list>
 *   (its READY rows' paths)] [--report out.tsv]
 * <dir>/<path>.html: DA's current copy (<body><header></header><main>...</main>...); the result under --out, the same name.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { children } from './austrian-tabs-apply.mjs';
import { readyPaths } from './ita-fragment-insert-apply.mjs';

const decode = (s) => s.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (m, d) => String.fromCodePoint(Number(d)))
  .replace(/&amp;/g, '&');
export const norm = (s) => decode(String(s || '').replace(/<[^>]+>/g, ' ')).replace(/[\u200b-\u200d\ufeff]/g, '').replace(/\s+/g, ' ').trim()
  .toLowerCase();

/** The signature of an element (its html): "img" for a picture without text, else "<tag>|<its text>". */
export function signature(el) {
  const tag = (el.match(/^<([a-zA-Z][a-zA-Z0-9-]*)/) || [])[1].toLowerCase();
  const text = norm(el);
  if (!text && /<(picture|img)\b/i.test(el)) return 'img';
  return `${tag}|${text}`;
}

const fits = (el, sig) => {
  const s = signature(el);
  if (sig === 'img') return s === 'img';
  const [tag, ...rest] = sig.split('|');
  const want = norm(rest.join('|'));
  return want.length > 0 && s.startsWith(`${tag.toLowerCase()}|`) && s.slice(tag.length + 1).startsWith(want);
};

/** The inner html of an element: [start, end) offsets within the element's html. */
function innerOf(html) {
  return [html.indexOf('>') + 1, html.lastIndexOf('</')];
}

/** The blocks named `name` anywhere in html: [{ start, end, html, classes }]. */
function blocksOf(html, name) {
  const out = [];
  const walk = (h, base) => children(h).forEach((c) => {
    if (!['body', 'main', 'div'].includes(c.tag)) return;
    const cls = ((c.html.match(/^<div\b[^>]*\sclass="([^"]*)"/) || [])[1] || '').split(/\s+/).filter(Boolean);
    if (c.tag === 'div' && cls[0] === name) {
      out.push({
        start: base + c.start, end: base + c.end, html: c.html, classes: cls,
      }); return;
    }
    const [a, b] = innerOf(c.html);
    walk(c.html.slice(a, b), base + c.start + a);
  });
  walk(html, 0);
  return out;
}

/**
 * DA's copy with the spec's option and tables. Returns { html, problems, tables } (problems: nothing changed).
 * @param {string} html DA's copy
 * @param {{block: string, titles: string[], add: string, rows: {panel: string, cells: string[][]}[]}} spec
 */
export function applyCargoTabs(html, spec) {
  const fail = (p) => ({ html, problems: [p], tables: 0 });
  const want = spec.titles.map(norm);
  const found = blocksOf(html, spec.block).map((b) => {
    const [a, z] = innerOf(b.html);
    const items = children(b.html.slice(a, z)).map((it) => {
      const [ia, iz] = innerOf(it.html);
      const cells = children(it.html.slice(ia, iz));
      return {
        item: it, cells, base: b.start + a + it.start + ia, title: cells[0] ? norm(cells[0].html) : '',
      };
    });
    return { ...b, items };
  }).filter((b) => b.items.length === want.length && b.items.every((it, i) => it.title === want[i]));
  if (!found.length) return fail(`no ${spec.block} with the titles ${spec.titles.join(' | ')}`);
  if (found.length > 1) return fail(`${found.length} ${spec.block} blocks with these titles`);
  const block = found[0];
  if (block.classes.includes(spec.add)) return fail(`option ${spec.add} there already`);
  // the edits: [start, end, replacement] in the document's offsets
  const edits = [];
  const open = block.html.match(/^<div\b[^>]*\sclass="([^"]*)"/);
  const clsStart = block.start + open[0].length - 1 - open[1].length;
  edits.push([clsStart, clsStart + open[1].length, `${open[1].replace(/\s+$/, '')} ${spec.add}`]);
  for (let r = 0; r < spec.rows.length; r += 1) {
    const row = spec.rows[r];
    const item = block.items.find((it) => it.title === norm(row.panel));
    if (!item || !item.cells[1]) return fail(`row ${r + 1}: no panel "${row.panel}"`);
    const cell = item.cells[1];
    const [ca, cz] = innerOf(cell.html);
    const inner = cell.html.slice(ca, cz);
    const kids = children(inner);
    if (kids.some((k) => k.tag === 'table')) return fail(`row ${r + 1}: panel "${row.panel}" has a table already`);
    const flat = row.cells.flat();
    const at = [];
    for (let s = 0; s + flat.length <= kids.length; s += 1) {
      if (flat.every((sig, n) => fits(kids[s + n].html, sig))) at.push(s);
    }
    if (!at.length) return fail(`row ${r + 1}: the run "${flat[0]}" ... (${flat.length} elements) not found in "${row.panel}"`);
    if (at.length > 1) return fail(`row ${r + 1}: the run found ${at.length} times in "${row.panel}"`);
    let n = at[0];
    const tds = row.cells.map((sigs) => {
      const first = kids[n];
      const last = kids[n + sigs.length - 1];
      n += sigs.length;
      return `<td>${inner.slice(first.start, last.end)}</td>`;
    });
    const base = item.base + cell.start + ca;
    edits.push([base + kids[at[0]].start, base + kids[n - 1].end, `<table><tbody><tr>${tds.join('')}</tr></tbody></table>`]);
  }
  let out = html;
  edits.sort((x, y) => y[0] - x[0]).forEach(([a, z, rep]) => { out = out.slice(0, a) + rep + out.slice(z); });
  return { html: out, problems: [], tables: spec.rows.length };
}

/** The check: the result less the tables' tags and the option is DA's copy, byte for byte (whitespace between a run's
 *  cells aside: there is none in DA's copies). */
export function unwrap(html, spec) {
  return html.replace(new RegExp(`(<div\\b[^>]*\\sclass="${spec.block}\\b[^"]*?) ${spec.add}"`), '$1"')
    .replace(/<table><tbody><tr><td>/g, '').replace(/<\/td><td>/g, '').replace(/<\/td><\/tr><\/tbody><\/table>/g, '');
}

function main() {
  const args = process.argv.slice(2);
  const opt = (k) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : null; };
  const data = JSON.parse(fs.readFileSync(opt('--data'), 'utf8'));
  const docs = opt('--docs');
  const outDir = opt('--out');
  if (!data || !docs || !outDir) { console.error('usage: --data <rows.json> --docs <dir> --out <dir> [--list <delta list>] [--report <tsv>]'); process.exit(2); }
  let paths = Object.keys(data).filter((k) => k.startsWith('/'));
  if (opt('--list')) {
    const ready = new Set(readyPaths(fs.readFileSync(opt('--list'), 'utf8')));
    paths = paths.filter((p) => ready.has(p));
  }
  const report = ['path\tresult\ttables\tcheck'];
  paths.forEach((p) => {
    const src = path.join(docs, `${p}.html`);
    if (!fs.existsSync(src)) { report.push(`${p}\tno copy\t0\t-`); return; }
    const html = fs.readFileSync(src, 'utf8');
    const r = applyCargoTabs(html, data[p]);
    if (r.problems.length) { report.push(`${p}\tno change: ${r.problems.join('; ')}\t0\t-`); return; }
    const ok = unwrap(r.html, data[p]) === html;
    if (!ok) { report.push(`${p}\tno change: the check failed\t0\tbad`); return; }
    const dest = path.join(outDir, `${p}.html`);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, r.html);
    report.push(`${p}\tchanged\t${r.tables}\tok`);
  });
  const text = `${report.join('\n')}\n`;
  if (opt('--report')) fs.writeFileSync(opt('--report'), text);
  process.stdout.write(text);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) main();
