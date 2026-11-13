/* eslint-disable no-console -- tooling */
/**
 * A delta on DA's copy as plain text inserts (standing order 17 of 2026-11-13: businesstogo's nested block). Per
 * insert an anchor, a piece of DA's own text found exactly once, and the text to put before or after it
 * ({ before | after, text }). Nothing else of the copy changes; the inserts are returned, and removing them gives
 * back DA's copy byte for byte (removeTextInserts; --check). If an anchor is not found exactly once nothing changes;
 * a copy that holds every insert at its anchor already is left as it is ("present").
 *
 * Usage: node tools/importer/text-inserts-apply.mjs --data inserts.json --list <list> --docs <DA copies> --out <dir> [--check]
 *   inserts.json: [{ path, inserts: [{ before | after, text }] }]; <docs>/<path>.html as DA's copy
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const count = (s, part) => s.split(part).length - 1;

/** @returns {{ html: string, results: string[], inserts: Array<[number, string]> }} */
export function applyTextInserts(html, list) {
  const present = list.every(({ before, after, text }) => (before ? html.includes(text + before) : html.includes(after + text)));
  if (present) return { html, results: list.map(() => 'present'), inserts: [] };
  const results = list.map(({ before, after }) => {
    const n = count(html, before || after);
    return n === 1 ? 'inserted' : `anchor found ${n} times`;
  });
  if (results.some((r) => r !== 'inserted')) return { html, results, inserts: [] };
  const inserts = list.map(({ before, after, text }) => [before ? html.indexOf(before) : html.indexOf(after) + after.length, text])
    .map((x, i) => [...x, i]).sort((a, b) => a[0] - b[0] || a[2] - b[2]).map(([pos, text]) => [pos, text]);
  let out = '';
  let at = 0;
  inserts.forEach(([pos, text]) => { out += html.slice(at, pos) + text; at = pos; });
  out += html.slice(at);
  return { html: out, results, inserts };
}

/** html without the inserts applyTextInserts made (their offsets in DA's copy). */
export function removeTextInserts(html, inserts) {
  let before = 0;
  const at = inserts.map(([pos, text]) => { const a = pos + before; before += text.length; return [a, text]; });
  return at.reverse().reduce((out, [a, text]) => {
    if (out.slice(a, a + text.length) !== text) throw new Error(`insert at ${a} not found`);
    return out.slice(0, a) + out.slice(a + text.length);
  }, html);
}

/** A list's READY paths: READY / HOLD, then the path (order 18), or the path, READY last (17). */
export const listPaths = (txt) => txt.split('\n').map((l) => l.split('\t').map((c) => c.trim()))
  .map((c) => (/^(READY|HOLD)\b/.test(c[0]) ? { path: c[1] || '', ready: /^READY\b/.test(c[0]) }
    : { path: c[0], ready: c.length === 1 || /^READY\b/.test(c[c.length - 1]) }))
  .filter((r) => r.path.startsWith('/') && r.ready)
  .map((r) => r.path);

const main = () => {
  const args = process.argv.slice(2);
  const opt = (k) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
  const data = JSON.parse(fs.readFileSync(opt('data'), 'utf8'));
  const list = opt('list') ? listPaths(fs.readFileSync(opt('list'), 'utf8')) : null;
  data.filter((d) => !list || list.includes(d.path)).forEach(({ path: p, inserts: wanted }) => {
    const src = path.join(opt('docs'), `${p}.html`);
    if (!fs.existsSync(src)) { console.log(`${p}\tno document`); return; }
    const before = fs.readFileSync(src, 'utf8');
    const { html, results, inserts } = applyTextInserts(before, wanted);
    console.log(`${p}\t${results.filter((r) => r === 'inserted').length} inserted, ${results.filter((r) => r === 'present').length} present${results.some((r) => r.startsWith('anchor')) ? `, ${results.filter((r) => r.startsWith('anchor')).join('; ')}` : ''}`);
    if (!inserts.length) return;
    const back = removeTextInserts(html, inserts) === before;
    console.log(`${p}\twithout the inserts DA's copy byte for byte: ${back}`);
    if (args.includes('--check') || !back) return;
    const out = path.join(opt('out'), `${p}.html`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, html);
  });
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
