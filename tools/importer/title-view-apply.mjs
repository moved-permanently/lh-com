/* eslint-disable no-console -- tooling */
/**
 * A page title's column view as a delta on DA's copy (standing order 16 of 2026-11-13: B2B's lhg-history, whose
 * title sits in a column view on www and whose import marks the collapse dropped): a {column-start-outer} paragraph
 * right before the document's one H1, inserted into DA's own text (the rest byte for byte). Unchanged: a document
 * whose H1 has the marker right before it already, or with no H1 or more than one.
 *
 * Usage: node tools/importer/title-view-apply.mjs --list <list> --docs <DA copies> --out <dir>
 *   the list's READY rows (or one path a line); <docs>/<path>.html as DA's copy
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MARK = '<p>{column-start-outer}</p>';

/** @returns {{ html: string, result: string }} */
export function applyTitleView(html) {
  const opens = [...html.matchAll(/<h1[\s>]/gi)];
  if (opens.length !== 1) return { html, result: 'not one H1' };
  const at = opens[0].index;
  if (html.slice(0, at).replace(/\s+$/, '').endsWith(MARK)) return { html, result: 'present' };
  return { html: html.slice(0, at) + MARK + html.slice(at), result: '{column-start-outer}' };
}

const listPaths = (txt) => txt.split('\n').map((l) => l.split('\t'))
  .filter((c) => c[0].trim().startsWith('/') && (c.length === 1 || /^READY\b/.test(c[c.length - 1].trim())))
  .map((c) => c[0].trim());

const main = () => {
  const args = process.argv.slice(2);
  const opt = (k) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
  listPaths(fs.readFileSync(opt('list'), 'utf8')).forEach((p) => {
    const src = path.join(opt('docs'), `${p}.html`);
    if (!fs.existsSync(src)) { console.log(`${p}\tno document`); return; }
    const { html, result } = applyTitleView(fs.readFileSync(src, 'utf8'));
    console.log(`${p}\t${result}`);
    if (!result.startsWith('{')) return;
    const out = path.join(opt('out'), `${p}.html`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, html);
  });
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
