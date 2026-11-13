/* eslint-disable no-console, max-len, import/extensions, import/prefer-default-export -- tooling */
/**
 * An element back into DA's copies as they are (standing order 8 of 2026-11-12, item 1, ITA row 39; not a new import:
 * DA's copies hold market sections a re-import drops). Per document a list of rows (--data, JSON: { "<path>": [{
 * before, html, text }] }): `html` goes right before the section-level element (a section's own child) whose text
 * starts with `before`. Refused, and the document left as it is: `before` found nowhere or more than once, or `text`
 * (the inserted element's text) in the document already, so a second run changes nothing.
 *
 * Usage: node tools/importer/ita-insert-apply.mjs --data rows.json --docs <dir> --out <dir> [--list a reimport list
 *   (its READY rows)]
 * <dir>/<path>.html: DA's copy; the result under --out, the same name.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { children } from './austrian-tabs-apply.mjs';

const decode = (s) => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"');
const textOf = (h) => decode(h.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

/** The section-level elements of a document: [{ start, html }] with offsets in the whole document. */
function sectionLevel(html) {
  const open = html.indexOf('<main>');
  const close = html.lastIndexOf('</main>');
  const base = open >= 0 && close > open ? open + 6 : 0;
  const main = open >= 0 && close > open ? html.slice(base, close) : html;
  const out = [];
  children(main).forEach((s) => {
    if (s.tag !== 'div') return;
    const at = s.html.indexOf('>') + 1;
    children(s.html.slice(at, -6)).forEach((c) => out.push({ start: base + s.start + at + c.start, html: c.html }));
  });
  return out;
}

/**
 * The document with each row's HTML in place, or as it was with the problems.
 * @param {string} html DA's copy
 * @param {{before: string, html: string, text: string}[]} rows
 */
export function applyInserts(html, rows) {
  const problems = [];
  const els = sectionLevel(html);
  const whole = textOf(html);
  const at = [];
  rows.forEach((r) => {
    if (whole.includes(r.text)) { problems.push(`"${r.text}" is in the document already`); return; }
    const hits = els.filter((e) => textOf(e.html).startsWith(r.before));
    if (hits.length !== 1) { problems.push(`"${r.before}": ${hits.length} section-level elements start with it`); return; }
    at.push({ start: hits[0].start, html: r.html });
  });
  if (problems.length) return { html, problems };
  let out = html;
  at.sort((a, b) => b.start - a.start).forEach((a) => { out = `${out.slice(0, a.start)}${a.html}${out.slice(a.start)}`; });
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
    const r = applyInserts(html, data[p]);
    if (r.problems.length) { problems += 1; console.log(`${p}: NOT CHANGED: ${r.problems.join('; ')}`); return; }
    const target = path.join(opt('out'), `${p}.html`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, r.html);
    console.log(`${p}: ${data[p].length} inserted; the rest as DA's`);
  });
  console.log(`ita-insert-apply: ${paths.length - problems} written, ${problems} not changed`);
  if (problems) process.exitCode = 1;
}
