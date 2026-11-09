/* eslint-disable no-console, max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/**
 * The collapse pass's carrier check (tools/reports/token-free/harness-pass-lufthansa.md): what each collapsed document
 * gained, against what a document of its class may gain. A document fails when
 * - it gained a section style the document didn't have and the site doesn't read (scripts/style-markers.js
 *   SECTION_STYLES; flush), or a purpose block with an option it doesn't know (the importers' own styles, grey or
 *   column-band, are copied when a section splits: not counted);
 * - a column-view section holds nothing but separators or is the page's last section and flush, or `flush` is new to
 *   the document on a section that isn't a column view (the importers write flush on grey sections themselves);
 * - it gained a carrier without the marks it stands for (column-view or flush without column marks, a from-768
 *   block without from-768 separators, a video option without {autoplay …} or {mobile}, parallax, narrow, the
 *   app screens' blocks);
 * - it gained more carriers than --max allows for its class (the template of its import report, without one
 *   insights for an article and none otherwise; harness-pass-lufthansa.md gives the most any workspace document of
 *   each class gained), or a carrier its class never gets (--never "class:carrier,…", e.g. insights:column-view).
 * Reads local files only.
 *
 * Usage: node tools/importer/carrier-check.mjs --before <dir> --after <dir> [--list paths.txt] [--reports <dir>]
 *   [--max class=n,…] [--never class:carrier,…] [--out report.json]   Exit code 1 when a document fails.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { SECTION_STYLES, BLOCK_OPTIONS } from '../../scripts/style-markers.js';

const PURPOSE = {
  spacer: ['l', 'from-768'], divider: ['from-768'], 'app-spacer': ['x-small', 'small', 'medium', 'm-large', 'large', 'v2'], 'app-divider': [], 'app-text': ['small'],
};
const STYLE_WORDS = new Set([...Object.keys(SECTION_STYLES), 'flush']);
const SEP = /^\s*\{(?:spacer|divider)-\d+(?: from-768)?\}\s*$/;
// a carrier only where the document had the marks it stands for (a wrong carrier shows here first)
const SOURCES = [
  [/^style (column-view|flush)$/, /\{[^}]*\bcolumn-(start|end)/],
  [/^block (spacer|divider)\b.*from-768/, /\{(spacer|divider)-\d+ from-768\}/],
  [/^option background-video$/, /\{[^}]*\bautoplay\b/],
  [/^option mobile-video$/, /\{mobile\}/],
  [/^style parallax$/, /\{[^}]*\bparallax\b/],
  [/^style narrow$/, /\{[^}]*\bnarrow\b/],
  [/^block app-(spacer|divider)/, /\{(spacer|divider)(:[^}]*)?\}/],
  [/^block app-text/, /\{small\}/],
];

const mainOf = (html) => parseHTML(/<main[\s>]/i.test(html) ? html : `<html><body><main>${html}</main></body></html>`).document.querySelector('main');
const nameOf = (el) => String(el.className || '').split(/\s+/)[0];
const styleOf = (section) => {
  const meta = [...section.children].find((c) => nameOf(c) === 'section-metadata');
  const row = meta && [...meta.children].find((r) => /^style$/i.test((r.firstElementChild?.textContent || '').trim()));
  return row ? row.lastElementChild.textContent.split(',').map((s) => s.trim().toLowerCase().replace(/\s+/g, '-')).filter(Boolean) : [];
};

/** A document's carriers: section style words, block options, purpose blocks (counted). */
export function carriersOf(html) {
  const main = mainOf(html);
  const out = new Map();
  const add = (k) => out.set(k, (out.get(k) || 0) + 1);
  [...main.querySelectorAll(':scope > div')].forEach((s) => styleOf(s).forEach((w) => add(`style ${w}`)));
  main.querySelectorAll(':scope > div > div[class]').forEach((b) => {
    const [name, ...opts] = String(b.className).split(/\s+/).filter(Boolean);
    if (name in PURPOSE) add(`block ${[name, ...opts].join(' ')}`);
    else opts.filter((o) => o in BLOCK_OPTIONS).forEach((o) => add(`option ${o}`));
  });
  return out;
}

/** A collapsed document's carrier problems (empty: it passes). */
export function carrierProblems(before, after, { max = Infinity, never = [] } = {}) {
  const problems = [];
  const a = carriersOf(before);
  const b = carriersOf(after);
  const gained = [...b].map(([k, n]) => [k, n - (a.get(k) || 0)]).filter(([k, n]) => n > 0 && !(k.startsWith('style ') && a.has(k) && !STYLE_WORDS.has(k.slice(6))));
  gained.forEach(([k]) => {
    if (k.startsWith('style ') && !STYLE_WORDS.has(k.slice(6))) problems.push(`unknown section style: ${k.slice(6)}`);
    if (k.startsWith('block ')) {
      const [name, ...opts] = k.slice(6).split(' ');
      opts.filter((o) => !PURPOSE[name].includes(o)).forEach((o) => problems.push(`unknown ${name} option: ${o}`));
    }
    const short = k.replace(/^(style|block|option) /, '');
    if (never.includes(short)) problems.push(`a carrier this class never gets: ${short}`);
    const source = SOURCES.find(([re]) => re.test(k));
    if (source && !source[1].test(before)) problems.push(`${short} without its marks in the document`);
  });
  const total = gained.reduce((s, [, n]) => s + n, 0);
  if (total > max) problems.push(`${total} carriers gained, more than the class's ${max}`);
  // the sections the collapse styled: a style list more often after than before (the importers' own column views,
  // "flush, column-view, grey", stay as they were)
  const lists = new Map();
  [...mainOf(before).querySelectorAll(':scope > div')].forEach((s) => { const k = styleOf(s).sort().join(); lists.set(k, (lists.get(k) || 0) + 1); });
  const sections = [...mainOf(after).querySelectorAll(':scope > div')];
  sections.forEach((s, i) => {
    const st = styleOf(s);
    const k = [...st].sort().join();
    if (lists.get(k) > 0) { lists.set(k, lists.get(k) - 1); return; }
    const own = [...s.children].filter((c) => !['section-metadata', 'metadata'].includes(nameOf(c)));
    if (st.includes('column-view') && own.every((c) => (c.tagName === 'P' && SEP.test(c.textContent)) || ['spacer', 'divider'].includes(nameOf(c)))) problems.push(`section ${i + 1}: a column view with no content`);
    if (st.includes('flush') && !st.includes('column-view') && !a.has('style flush')) problems.push(`section ${i + 1}: flush on a section that is no column view`);
    if (st.includes('flush') && st.includes('column-view') && !sections.slice(i + 1).some((n) => [...n.children].some((c) => !['section-metadata', 'metadata'].includes(nameOf(c))))) problems.push(`section ${i + 1}: flush on the page's last section`);
  });
  return problems;
}

const fileOf = (dir, p) => [`${p}.plain.html`, `${p}.html`].map((f) => path.join(dir, f)).find((f) => fs.existsSync(f));

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const argv = process.argv.slice(2);
  const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
  const beforeDir = opt('before'); const afterDir = opt('after');
  if (!beforeDir || !afterDir) { console.error('usage: carrier-check.mjs --before <dir> --after <dir> [--list paths.txt] [--reports <dir>] [--max class=n,…] [--never class:carrier,…] [--out file]'); process.exit(2); }
  const maxes = Object.fromEntries((opt('max') || '').split(',').filter(Boolean).map((x) => x.split('=')).map(([k, v]) => [k, Number(v)]));
  const nevers = (opt('never') || '').split(',').filter(Boolean).map((x) => x.split(':'));
  const classOf = (p) => {
    if (p.startsWith('/content/mobile/')) return 'app-screen';
    const f = opt('reports') && path.join(opt('reports'), `${p}.report.json`);
    // no import report (a DA document the workspace never imported): an article is insights, the rest none
    const fallback = /\/articles(\/|$)/.test(p) ? 'insights' : 'none';
    try { return (f && JSON.parse(fs.readFileSync(f, 'utf8')).template) || fallback; } catch (e) { return fallback; }
  };
  const paths = fs.readFileSync(opt('list'), 'utf8').split('\n').map((l) => l.trim()).filter((l) => l.startsWith('/'));
  const report = { checked: 0, failed: [] };
  paths.forEach((p) => {
    const bf = fileOf(beforeDir, p); const af = fileOf(afterDir, p);
    if (!bf || !af) return;
    report.checked += 1;
    const cls = classOf(p);
    const problems = carrierProblems(fs.readFileSync(bf, 'utf8'), fs.readFileSync(af, 'utf8'), { max: maxes[cls] ?? Infinity, never: nevers.filter(([c]) => c === cls).map(([, k]) => k) });
    if (problems.length) report.failed.push({ path: p, class: cls, problems });
  });
  if (opt('out')) fs.writeFileSync(opt('out'), JSON.stringify(report, null, 1));
  console.log(`checked ${report.checked}, failed ${report.failed.length}`);
  report.failed.slice(0, 20).forEach((f) => console.log(`${f.path} (${f.class}): ${f.problems.join('; ')}`));
  process.exit(report.failed.length ? 1 : 0);
}
