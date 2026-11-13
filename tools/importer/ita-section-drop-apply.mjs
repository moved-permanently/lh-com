/* eslint-disable no-console, max-len, import/extensions, import/prefer-default-export -- tooling */
/**
 * The empty last section out of DA's copies as they are (standing order 11 of 2026-11-13, item 1; not a new import: DA's
 * copies hold market sections a re-import drops). A document that ends with a grey band, then the metadata section,
 * then an empty section (`<div></div>`): the empty section stays a section on the page, so the band is not main's last
 * section and keeps the section gap under it (48 px to the footer) instead of styles.css's
 * `main > .section.grey:last-child` 24 px (www's 24 on /it/en/support/utilities/invoicing). Per document (--data, JSON:
 * { "<path>": { band } }): the empty last section goes when the section before it holds the metadata block only and the
 * one before that is the band (its text starts with `band`). Refused, and the document left as it is, otherwise (so a
 * second run changes nothing). Every other byte as DA's.
 *
 * Usage: node tools/importer/ita-section-drop-apply.mjs --data rows.json --docs <dir> --out <dir> [--list a reimport list
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
const inner = (h) => h.slice(h.indexOf('>') + 1, -6);

/**
 * The document without its empty last section, or as it was with the problems.
 * @param {string} html DA's copy
 * @param {{band: string}} row the start of the closing band's text
 */
export function dropEmptyLast(html, row) {
  const open = html.indexOf('<main>');
  const close = html.lastIndexOf('</main>');
  if (open < 0 || close < open) return { html, problems: ['no <main>'] };
  const base = open + 6;
  const secs = children(html.slice(base, close));
  const [band, metadata, last] = secs.slice(-3);
  const problems = [];
  if (secs.length < 3 || secs.some((s) => s.tag !== 'div')) problems.push('not three sections or more, all <div>');
  else if (inner(last.html).trim()) problems.push('the last section is not empty');
  else {
    const metaKids = children(inner(metadata.html));
    if (metaKids.length !== 1 || !/^<div class="metadata"/.test(metaKids[0].html)) problems.push('the section before the empty one is not the metadata block only');
    else if (!textOf(band.html).startsWith(row.band)) problems.push(`the section before the metadata does not start with "${row.band}"`);
  }
  if (problems.length) return { html, problems };
  return { html: `${html.slice(0, base + last.start)}${html.slice(base + last.end)}`, problems };
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
    const r = dropEmptyLast(html, data[p]);
    if (r.problems.length) { problems += 1; console.log(`${p}: NOT CHANGED: ${r.problems.join('; ')}`); return; }
    const target = path.join(opt('out'), `${p}.html`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, r.html);
    console.log(`${p}: the empty last section dropped; the rest as DA's`);
  });
  console.log(`ita-section-drop-apply: ${paths.length - problems} written, ${problems} not changed`);
  if (problems) process.exitCode = 1;
}
