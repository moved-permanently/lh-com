/* eslint-disable no-console, max-len, import/extensions, import/no-extraneous-dependencies -- tooling */
/**
 * Group for Business: the small spacers DA held right before a column view's start, back into the documents as they
 * are (DA's copy plus the delta, not a re-import; standing order 5 of 2026-11-11, item 2). DA's copies before the marker
 * collapse (the census of 2026-11-09) had {spacer-20} / {spacer-25} / {spacer-30} paragraphs right before a column start
 * (49 documents); the collapse drops every spacer of 31 px or less, so the view starts that much higher than www's
 * (de/en homepage: "For companies" 26 px higher at 1440 and everything under it).
 *
 * The data (--data, a JSON list from the census): per spacer the document's path, its size, the start of the element
 * the view begins with ("next.start", e.g. the Columns Media's first text) and the end of the text before it
 * ("prev.end"), and from768 where the space is drawn from 768 px only ({spacer-N from-768}: www's phone layout has none
 * there, the homepages). Per row, in the document's top-level content (a section's own children): the element whose text starts
 * with next.start (and whose previous sibling's text ends with prev.end, where the census had one); a <p>{spacer-N}</p>
 * goes right before it, unless a spacing marker is there already. A row whose place is not found (or found twice) changes
 * nothing. Everything else of the document stays as it is.
 *
 * Usage: node tools/importer/b2b-view-spacers-apply.mjs --data rows.json --docs <dir> --out <dir> [--list <reimport list>]
 *   <dir>/<path>.plain.html (or .html) as DA's copy; --list: its READY rows only (or one path a line)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';

const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();
const text = (el) => norm(el && el.textContent);
// compared without spaces and marker tokens: the census' cells run together ("For companiesPartnerPlusBenefit"), its
// headings still carry their marks ("Introduction {heading-small}")
const key = (s) => (s || '').replace(/\{[^}]*\}/g, '').replace(/\s+/g, '');
const isSpacer = (el) => !!el && el.tagName === 'P' && /^\{(spacer|divider)-\d{1,3}( from-768)?\}$/.test(text(el));

/** The document's HTML with the rows' spacers; returns { html, results: [{ row, result }] }. */
export function applyViewSpacers(html, rows) {
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main>${html}</main></body></html>`);
  const main = document.querySelector('main');
  const top = [...main.children].flatMap((s) => (s.tagName === 'DIV' ? [...s.children] : []));
  const results = rows.map((row) => {
    const start = key(row.next && row.next.start).slice(0, 30);
    const end = key(row.prev && row.prev.end).slice(-20);
    if (!start) return { row, result: 'no text' };
    const hits = top.filter((el) => key(el.textContent).startsWith(start)
      && (!end || key(el.previousElementSibling && el.previousElementSibling.textContent).endsWith(end)));
    if (hits.length !== 1) return { row, result: hits.length ? 'ambiguous' : 'not found' };
    const [at] = hits;
    if (isSpacer(at.previousElementSibling)) return { row, result: 'present' };
    // at a section's start the collapse keeps no small spacer either (the section's own gap)
    if (!at.previousElementSibling) return { row, result: 'at a section start' };
    const p = document.createElement('p');
    // from768: the space from 768 px only (styles.css hides p.spacer.from-768 on phones), where www's phone layout has none
    const marker = `{spacer-${row.px}${row.from768 ? ' from-768' : ''}}`;
    p.textContent = marker;
    at.before(p);
    return { row, result: marker };
  });
  return { html: results.some((r) => r.result.startsWith('{spacer-')) ? main.innerHTML : html, results };
}

/** A list's paths: one a line, or a reimport list's rows (tab-separated), only the READY ones (its last column). */
export const listPaths = (txt) => txt.split('\n').map((l) => l.split('\t'))
  .filter((c) => c[0].trim().startsWith('/') && (c.length === 1 || /^READY\b/.test(c[c.length - 1].trim())))
  .map((c) => c[0].trim());

const main = () => {
  const args = process.argv.slice(2);
  const opt = (k) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
  const data = JSON.parse(fs.readFileSync(opt('data'), 'utf8'));
  const list = opt('list') ? listPaths(fs.readFileSync(opt('list'), 'utf8')) : null;
  const byPath = new Map();
  data.filter((r) => !list || list.includes(r.path)).forEach((r) => byPath.set(r.path, [...(byPath.get(r.path) || []), r]));
  byPath.forEach((rows, p) => {
    const src = [`${p}.plain.html`, `${p}.html`].map((f) => path.join(opt('docs'), f)).find((f) => fs.existsSync(f));
    if (!src) { console.log(`${p}\tno document`); return; }
    const { html, results } = applyViewSpacers(fs.readFileSync(src, 'utf8'), rows);
    results.forEach(({ row, result }) => console.log(`${p}\t${row.px} before "${norm(row.next.start).slice(0, 30)}"\t${result}`));
    if (!results.some((r) => r.result.startsWith('{spacer-'))) return;
    const out = path.join(opt('out'), path.relative(opt('docs'), src));
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, html);
  });
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
