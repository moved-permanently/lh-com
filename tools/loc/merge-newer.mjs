/* eslint-disable no-console, max-len, import/no-extraneous-dependencies, import/extensions, import/prefer-default-export -- dev tooling */
/**
 * A merged page's marks resolved by the newer version, block by block (standing order 9 of 2026-11-12, item 2:
 * /gb/en/business-class). A rollout with merge keeps both sides of each differing block in the market's document: the
 * incoming (upstream) block wrapped in <da-diff-deleted>, the market's own (local) block right after it with
 * da-diff-added (tools/loc/README.md "What merge does"). Until they are resolved the published page shows both.
 *
 * Which side is newer is the caller's statement (--newer upstream|local), from DA's version lists: the rollout's source
 * saved after the market's own last save makes the upstream newer (gb/en business-class: /gc/en saved 2026-11-04 05:28,
 * rolled out 05:32; gb/en's own copy from the import of 2026-10-22 to 10-26).
 *
 * Per pair:
 * - the same words on both sides (whitespace aside): the local block (the market's links and pictures);
 * - other words: the newer block. An upstream block gets its links made the market's, as the link step does
 *   (link-lib.mjs localizeHref with the pages.csv rows: /gc/en/x -> /gb/en/x).
 * A mark without its local side next to it is refused (listed, nothing changed there). Everything else of the
 * document stays byte for byte: only the pairs' markup is replaced.
 *
 * Usage: node tools/loc/merge-newer.mjs --in <DA copy.html> --out <file> --from gc/en --to gb/en --newer upstream
 * Reads and writes local files only; the upload is the import helper's.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { pairMap, localizeHref } from './link-lib.mjs';
import { scopeRows } from './regional-diff.mjs';

const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
// an element's words: its text nodes' words in order (a list's items without spaces between them, as DA writes them
// on one side and the import with line breaks on the other, read the same)
const words = (el) => {
  const out = [];
  const walk = (n) => n.childNodes.forEach((c) => (c.nodeType === 3 ? out.push(c.textContent) : walk(c)));
  walk(el);
  return norm(out.join(' '));
};

let rowsCache;
const mapFor = (from, to) => {
  rowsCache = rowsCache || scopeRows();
  const others = ['gc/en', 'gc/de'].filter((o) => o !== from);
  return pairMap(rowsCache, from, to, { others });
};

/**
 * The document with each pair resolved: { html, pairs, upstream: [pair indexes taken upstream], refused: [indexes],
 * unmapped: [links of upstream blocks without a market page] }.
 */
export function keepNewer(html, { from, to, newer } = {}) {
  if (!['upstream', 'local'].includes(newer)) throw new Error('--newer upstream|local: which side is newer (from DA\'s version lists)');
  const { document } = parseHTML(`<html>${html}</html>`);
  const marks = [...document.querySelectorAll('da-diff-deleted')];
  const result = {
    pairs: 0, upstream: [], refused: [], unmapped: [],
  };
  const swaps = [];
  marks.forEach((del, i) => {
    const up = del.firstElementChild;
    const local = del.nextElementSibling;
    if (!up || del.children.length !== 1 || !local || !local.hasAttribute('da-diff-added')) {
      result.refused.push(i);
      return;
    }
    result.pairs += 1;
    // the upstream block's links made the market's first (a link whose text is its URL, as the metadata Parent, gets
    // the new URL as its text, as localizeDoc): links alone make no difference in words
    const map = mapFor(from, to);
    const unmapped = [];
    up.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      const next = localizeHref(href, map, (p) => unmapped.push(p));
      if (next === null) return;
      a.setAttribute('href', next);
      if (norm(a.textContent) === href) a.textContent = next;
    });
    if (words(up) === words(local) || newer === 'local') {
      local.removeAttribute('da-diff-added');
      swaps.push([del, local, '']);
      return;
    }
    result.upstream.push(i);
    result.unmapped.push(...unmapped);
    swaps.push([del, local, up.outerHTML]);
  });
  // only the pairs' markup changes: the source text with each pair's span replaced
  // (in document order from the previous pair's end: two pairs can hold the same markup, as two section metadata)
  let out = html;
  let cursor = 0;
  const { document: src } = parseHTML(`<html>${html}</html>`);
  const srcMarks = [...src.querySelectorAll('da-diff-deleted')];
  swaps.forEach(([del, local, upHtml]) => {
    const i = marks.indexOf(del);
    const oldSpan = srcMarks[i].outerHTML + srcMarks[i].nextElementSibling.outerHTML;
    const at = out.indexOf(oldSpan, cursor);
    if (at < 0) throw new Error(`pair ${i}: its markup not found in the source`);
    const next = upHtml || local.outerHTML;
    out = out.slice(0, at) + next + out.slice(at + oldSpan.length);
    cursor = at + next.length;
  });
  result.unmapped = [...new Set(result.unmapped)];
  return { html: out, ...result };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : undefined; };
  const r = keepNewer(fs.readFileSync(arg('in'), 'utf8'), { from: arg('from'), to: arg('to'), newer: arg('newer') });
  fs.mkdirSync(path.dirname(arg('out')), { recursive: true });
  fs.writeFileSync(arg('out'), r.html);
  console.log(`${arg('in')} -> ${arg('out')}: ${r.pairs} pairs, upstream ${r.upstream.join(', ') || 'none'}, refused ${r.refused.join(', ') || 'none'}, unmapped ${r.unmapped.join(', ') || 'none'}`);
}
