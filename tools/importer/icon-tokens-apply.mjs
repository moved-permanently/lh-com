/* eslint-disable no-console, max-len, import/extensions, import/prefer-default-export -- tooling */
/**
 * DA's copy plus the delta for the documents whose text holds a ":word:" that is no icon of ours
 * (icon-tokens.mjs: Edge Delivery would draw it as a broken icon, lh-b2b's
 * celebrating-shared-stories/meissen "Mitarbeiter:innen:"): the same guard the uploader now
 * applies to every document (a WORD JOINER before the token's closing colon; scripts/scripts.js
 * takes it out in the browser), nothing else of the document changes. A document without such a
 * token is not written. Idempotent.
 *
 * Usage: node tools/importer/icon-tokens-apply.mjs --list <reimport list> --docs <DA copies> --out <dir>
 *   --list: its READY rows (or one path a line); <dir>/<path>.html (DA's source) or <path>.plain.html
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { guardIconTokens, strayTokens } from './icon-tokens.mjs';

/** A list's paths: one a line, or a reimport list's rows (tab-separated), only the READY ones (its last column). */
export const listPaths = (txt) => txt.split('\n').map((l) => l.split('\t'))
  .filter((c) => c[0].trim().startsWith('/') && (c.length === 1 || /^READY\b/.test(c[c.length - 1].trim())))
  .map((c) => c[0].trim());

const main = () => {
  const args = process.argv.slice(2);
  const opt = (k) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
  listPaths(fs.readFileSync(opt('list'), 'utf8')).forEach((p) => {
    const src = [`${p}.html`, `${p}.plain.html`].map((f) => path.join(opt('docs'), f)).find((f) => fs.existsSync(f));
    if (!src) { console.log(`${p}\tno document`); return; }
    const html = fs.readFileSync(src, 'utf8');
    const stray = strayTokens(html);
    const out = guardIconTokens(html);
    console.log(`${p}\t${stray.map((t) => `:${t.name}:`).join(' ') || 'none'}`);
    if (out === html) return;
    const dest = path.join(opt('out'), path.relative(opt('docs'), src));
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, out);
  });
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
