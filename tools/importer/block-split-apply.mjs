/* eslint-disable no-console, max-len, import/prefer-default-export -- tooling */
/**
 * A block split at one of its rows, with a separator paragraph moved from after the block into the gap, back into DA's
 * copy (standing order 21 of 2026-11-14: /de/en/prepare-for-your-trip/baggage/baggage-irregularities/delayed-baggage-lhg).
 * The columns-media parser merged column views across www's 100 px separators, so the separators' "{spacer-100}"
 * paragraphs landed after the merged block. The importer keeps the views apart since then
 * (test/columns-media-kept-spacer-so21); this is the delta for the documents imported before.
 * Per row ({block, heading, spacer}): the block (a div whose class list starts with `block`) holding a row (a direct child
 * div) whose first heading's text starts with `heading`, not the block's first row, is split right before that row: the
 * block is closed there, a "{spacer}" paragraph follows, then a new block with the same classes holding that row and the
 * rest. One "{spacer}" paragraph of the run of separator paragraphs right after the block is removed (the one the import
 * misplaced). A row whose heading is not found, is found more than once, opens its block, or finds no such paragraph
 * after the block, changes nothing. Everything else stays byte for byte.
 *
 * Option "break": "section" (standing order 25, the xx business-class pages: an old import merged www's two-column view
 * and the four-column card view of the next section into one block): the block is split into a new section instead (the
 * block and its section are closed before the row, a new section opens with a new block of the same classes); no spacer
 * paragraph is moved. The block must be a section's child (a div that is not inside another div), else nothing changes.
 * Option "trim": true drops the empty cells (<div></div>) at the end of each row before the split (the cells the merge
 * padded the narrower view's rows with); a row keeps at least one cell.
 *
 * Usage: node tools/importer/block-split-apply.mjs --data rows.json --in <DA copy.html> --out <file>
 *   rows.json: [{ "block": "columns-media", "heading": "SWISS", "spacer": "spacer-100" }]
 *   or [{ "block": "columns-media", "heading": "Lufthansa First Class", "break": "section", "trim": true }]
 * Reads and writes local files only; the upload is the import helper's.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const text = (s) => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

/** The div starting at `start`: its end index (after its closing tag) and its direct child divs [{ start, end }]. */
function divAt(html, start) {
  const re = /<(\/?)div\b[^>]*>/g;
  re.lastIndex = start;
  let depth = 0;
  const kids = [];
  let kid = null;
  for (let m = re.exec(html); m; m = re.exec(html)) {
    if (!m[1]) {
      depth += 1;
      if (depth === 2) kid = { start: m.index };
    } else {
      depth -= 1;
      if (depth === 1 && kid) { kids.push({ ...kid, end: re.lastIndex }); kid = null; }
      if (depth === 0) return { end: re.lastIndex, kids };
    }
  }
  return null;
}

/** The start of the div that holds the tag at `start` (null when none). */
function parentDiv(html, start) {
  const re = /<(\/?)div\b[^>]*>/g;
  const stack = [];
  for (let m = re.exec(html); m && m.index < start; m = re.exec(html)) {
    if (!m[1]) stack.push(m.index); else stack.pop();
  }
  return stack.length ? stack[stack.length - 1] : null;
}

/** A row without the empty cells at its end (at least one cell stays): { html, dropped }. */
function trimRow(row, cells) {
  let html = row;
  let dropped = 0;
  const re = /\s*<div>\s*<\/div>(\s*<\/div>)$/;
  while (cells - dropped > 1 && re.test(html)) {
    html = html.replace(re, '$1');
    dropped += 1;
  }
  return { html, dropped };
}

/** The document with the rows' splits: { html, results: [{ row, result }] }. */
export function applyBlockSplit(html, rows) {
  let out = html;
  const results = rows.map((row) => {
    const section = row.break === 'section';
    if (!row.block || !row.heading || (!section && !/^spacer-\d+$/.test(row.spacer || ''))) return { row, result: 'bad row' };
    const open = new RegExp(`<div class="${row.block}(?=[ "])[^"]*">`, 'g');
    const hits = [];
    for (let m = open.exec(out); m; m = open.exec(out)) {
      const div = divAt(out, m.index);
      if (div) {
        div.kids.forEach((k, i) => {
          const h = out.slice(k.start, k.end).match(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/);
          if (h && text(h[2]).startsWith(row.heading)) {
            hits.push({
              tag: m[0], start: m.index, div, i, k,
            });
          }
        });
      }
    }
    if (!hits.length) return { row, result: 'not found' };
    if (hits.length > 1) return { row, result: 'found more than once' };
    const [{
      tag, start, div, i, k,
    }] = hits;
    if (i === 0) return { row, result: 'opens its block' };
    if (section) {
      const sec = parentDiv(out, start);
      if (sec === null || parentDiv(out, sec) !== null) return { row, result: 'not in a section' };
      let at = k.start;
      while (at > 0 && /[ \t]/.test(out[at - 1])) at -= 1;
      const pretty = /\n[ \t]*$/.test(out.slice(0, k.start));
      const blockInd = out.slice(0, start).match(/[ \t]*$/)[0];
      const secInd = out.slice(0, sec).match(/[ \t]*$/)[0];
      const split = pretty
        ? `${blockInd}</div>\n${secInd}</div>\n${secInd}<div>\n${blockInd}${tag}\n`
        : `</div></div><div>${tag}`;
      let head = out.slice(0, at);
      let dropped = 0;
      if (row.trim) {
        // the rows before the split, from the last one back (the earlier rows' positions stay valid)
        div.kids.slice(0, i).reverse().forEach((r) => {
          const cells = (divAt(head, r.start) || { kids: [] }).kids.length;
          const t = trimRow(head.slice(r.start, r.end), cells);
          head = `${head.slice(0, r.start)}${t.html}${head.slice(r.end)}`;
          dropped += t.dropped;
        });
      }
      out = `${head}${split}${out.slice(at)}`;
      return { row, result: row.trim ? `placed, ${dropped} empty cells dropped` : 'placed' };
    }
    // the run of separator paragraphs right after the block, and the one to move in it
    const para = `<p>{${row.spacer}}</p>`;
    const run = out.slice(div.end).match(/^(?:\s*<p>\{(?:spacer|divider)-[^}]*\}<\/p>)*/)[0];
    const inRun = run.indexOf(para);
    if (inRun < 0) return { row, result: 'no such paragraph after the block' };
    let from = div.end + inRun;
    while (from > div.end && /\s/.test(out[from - 1])) from -= 1;
    const to = div.end + inRun + para.length;
    // the row's line start in a pretty-printed copy (its indentation goes with it)
    let at = k.start;
    while (at > 0 && /[ \t]/.test(out[at - 1])) at -= 1;
    // a pretty-printed copy (the row on a line of its own) gets the new tags on lines of their own
    const nl = /\n[ \t]*$/.test(out.slice(0, k.start)) ? '\n' : '';
    out = `${out.slice(0, at)}</div>${nl}${para}${nl}${tag}${nl}${out.slice(at, from)}${out.slice(to)}`;
    return { row, result: 'placed' };
  });
  return { html: out, results };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : undefined; };
  const r = applyBlockSplit(fs.readFileSync(arg('in'), 'utf8'), JSON.parse(fs.readFileSync(arg('data'), 'utf8')));
  fs.writeFileSync(arg('out'), r.html);
  r.results.forEach(({ row, result }) => console.log(`${row.block} ${row.heading} (${row.spacer}): ${result}`));
}
