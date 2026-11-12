/* eslint-disable no-console, max-len, import/extensions -- tooling */
/**
 * ITA's tab sets into DA's copies as they are (standing order 7 of 2026-11-12, item 1; not a new import: DA's copies
 * hold market sections, "markets" in a section's metadata, that a re-import drops: fleet/long-haul's A330-900neo table
 * for au/en, be/en, ..., the "Choose your favorite seat" band's market variant, short-haul's market paragraphs).
 *
 * Per document a spec (--data, JSON: { "<path>": { panels: [{ label, first }], end } }, read off the recording through
 * the import): each panel's label as www's tab and the start of the text of its first element (or "img:<file name>" of
 * its picture), and the start of the text of the element that ends the set. In DA's copy, at the section level (a
 * section's own children, not inside blocks), each panel runs from its first element to the next panel's, the last to
 * the end element. A section that a panel start or the end cuts becomes two sections, both with the section's
 * metadata rows; every section (or piece) inside a panel gets a "Tab" row with the panel's label (a section of only
 * metadata, a market's empty variant, too), so the set's Tab sections stay one after the other. Nothing else changes:
 * the bytes of every element are DA's (checkTabs: the same elements in the same order, each with its section's rows,
 * Tab aside). A start not found, found out of order, or a document with Tab sections already: no change.
 *
 * Usage: node tools/importer/ita-tabs-apply.mjs --data spec.json --docs <dir> --out <dir> [--list paths.txt | a reimport
 *   list (its READY rows)] [--report out.tsv]
 * <dir>/<path>.html: DA's copy (<body><header></header><main>...</main>...); the result under --out, the same name.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { children } from './austrian-tabs-apply.mjs';

const SECTION_META = '<div class="section-metadata">';
const decode = (s) => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'");
const textOf = (h) => decode(h.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
const imgFile = (h) => ((h.match(/<img\b[^>]*\ssrc="([^"]*)"/) || [])[1] || '').split('?')[0].split('/').filter((x) => !/^(img\.jpg|lh-dcep-transform-.*|.*\.transform)$/.test(x)).pop() || '';

/** The parts of a document: { before, main, after } (main: the inner html of <main>, or the whole when it has none). */
function partsOf(html) {
  const open = html.indexOf('<main>');
  const close = html.lastIndexOf('</main>');
  if (open < 0 || close < open) return { before: '', main: html, after: '' };
  return { before: html.slice(0, open + 6), main: html.slice(open + 6, close), after: html.slice(close) };
}

/** The sections of a main: [{ html, kids: [{html}], meta: html|null }] (top-level divs; other nodes as { raw }). */
function sectionsOf(main) {
  return children(main).map((s) => {
    if (s.tag !== 'div') return { raw: s.html };
    const inner = s.html.slice(s.html.indexOf('>') + 1, -6);
    const kids = children(inner);
    const meta = kids.find((k) => k.html.startsWith(SECTION_META)) || null;
    return { html: s.html, kids: kids.filter((k) => k !== meta).map((k) => k.html), meta: meta ? meta.html : null };
  });
}

const matches = (el, want) => {
  const w = norm(want);
  if (w.startsWith('img:')) return imgFile(el) === w.slice(4).trim();
  return textOf(el).startsWith(w);
};

const tabRow = (label) => `<div><div>Tab</div><div>${label}</div></div>`;
const withTab = (meta, label) => (meta ? `${meta.slice(0, -6)}${tabRow(label)}</div>` : `${SECTION_META}${tabRow(label)}</div>`);

/**
 * DA's copy with the spec's tab set as Tab sections. Returns { html, problems, tabs } (problems: nothing changed).
 * @param {string} html DA's copy
 * @param {{panels: {label: string, first: string}[], end?: string}} spec
 */
export function applyTabs(html, spec) {
  const problems = [];
  if (/<div><div>(?:<p>)?Tab(?:<\/p>)?<\/div>/.test(html)) return { html, problems: ['Tab sections already'], tabs: 0 };
  const { before, main, after } = partsOf(html);
  const secs = sectionsOf(main);
  // the section-level elements in order: [section index, kid index]
  const flat = [];
  secs.forEach((s, i) => (s.kids || []).forEach((k, j) => flat.push([i, j, k])));
  const starts = [];
  let from = 0;
  spec.panels.forEach((p) => {
    const k = flat.findIndex(([, , el], n) => n >= from && matches(el, p.first));
    if (k < 0) { problems.push(`panel "${p.label}": "${p.first}" not found${from ? ' after the panel before' : ''}`); return; }
    starts.push(k);
    from = k + 1;
  });
  let end = flat.length;
  if (spec.end) {
    const k = flat.findIndex(([, , el], n) => n >= from && matches(el, spec.end));
    if (k < 0) problems.push(`the end "${spec.end}" not found after the last panel`);
    else end = k;
  }
  if (problems.length) return { html, problems, tabs: 0 };
  // each element's panel (-1: outside the set)
  const panelAt = (n) => {
    if (n < starts[0] || n >= end) return -1;
    let p = 0;
    while (p + 1 < starts.length && n >= starts[p + 1]) p += 1;
    return p;
  };
  const out = [];
  let tabs = 0;
  let n = 0;
  secs.forEach((s) => {
    if (s.raw !== undefined) { out.push(s.raw); return; }
    if (!s.kids.length) {
      // a section of metadata only (a market's empty variant of the section before it): that section's panel
      const p = n > 0 ? panelAt(n - 1) : -1;
      if (p >= 0 && s.meta) { out.push(`<div>${withTab(s.meta, spec.panels[p].label)}</div>`); tabs += 1; } else out.push(s.html);
      return;
    }
    // runs of the section's elements of one panel
    const runs = [];
    s.kids.forEach((k) => {
      const p = panelAt(n);
      const last = runs[runs.length - 1];
      if (last && last.p === p && !starts.includes(n) && n !== end) last.kids.push(k);
      else runs.push({ p, kids: [k] });
      n += 1;
    });
    if (runs.length === 1 && runs[0].p < 0) { out.push(s.html); return; }
    runs.forEach((r) => {
      if (r.p < 0) out.push(`<div>${r.kids.join('')}${s.meta || ''}</div>`);
      else { out.push(`<div>${r.kids.join('')}${withTab(s.meta, spec.panels[r.p].label)}</div>`); tabs += 1; }
    });
  });
  return { html: `${before}${out.join('')}${after}`, problems, tabs };
}

/** The rows of a section's metadata, Tab aside: "key=value; ..." (cells' text). */
const rowsKey = (meta) => (meta ? [...meta.slice(SECTION_META.length, -6).matchAll(/<div><div>([\s\S]*?)<\/div><div>([\s\S]*?)<\/div><\/div>/g)]
  .map((m) => [textOf(m[1]), textOf(m[2])]).filter(([k]) => !/^tabs?$/i.test(k)).map(([k, v]) => `${k.toLowerCase()}=${v}`).join('; ') : '');

/** Every section-level element with its section's rows, and the text outside <main>. */
const elementsOf = (html) => {
  const { before, main, after } = partsOf(html);
  return {
    outside: before + after,
    els: sectionsOf(main).flatMap((s) => (s.raw !== undefined ? [`raw|${s.raw}`] : [...s.kids.map((k) => `${rowsKey(s.meta)}|${k}`), ...(s.kids.length ? [] : [`empty|${rowsKey(s.meta)}`])])),
  };
};

/** The differences between DA's copy and the result beyond the Tab rows and section cuts ([] when none). */
export function checkTabs(original, result) {
  const a = elementsOf(original);
  const b = elementsOf(result);
  const out = [];
  if (a.outside !== b.outside) out.push('the document outside <main> differs');
  const n = Math.max(a.els.length, b.els.length);
  for (let i = 0; i < n; i += 1) {
    if (a.els[i] !== b.els[i]) { out.push(`element ${i + 1}: ${textOf(String(a.els[i] || '-')).slice(0, 60)} | ${textOf(String(b.els[i] || '-')).slice(0, 60)}`); break; }
  }
  return out;
}

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const opt = (k) => (argv.includes(`--${k}`) ? argv[argv.indexOf(`--${k}`) + 1] : null);
  const data = JSON.parse(fs.readFileSync(opt('data'), 'utf8'));
  let paths = Object.keys(data);
  if (opt('list')) {
    const lines = fs.readFileSync(opt('list'), 'utf8').split('\n').filter((l) => l.trim() && !l.startsWith('#'));
    const listed = lines.filter((l) => !l.includes('\t') || /\tREADY\b/.test(l)).map((l) => l.split('\t')[0].trim());
    paths = paths.filter((p) => listed.includes(p));
  }
  const report = [];
  let problems = 0;
  paths.forEach((p) => {
    const file = path.join(opt('docs'), `${p}.html`);
    const html = fs.readFileSync(file, 'utf8');
    const r = applyTabs(html, data[p]);
    const diff = r.problems.length ? [] : checkTabs(html, r.html);
    if (r.problems.length || diff.length) {
      problems += 1;
      console.log(`${p}: NOT CHANGED: ${[...r.problems, ...diff].join('; ')}`);
      report.push(`${p}\tnot changed\t${[...r.problems, ...diff].join('; ')}`);
      return;
    }
    const target = path.join(opt('out'), `${p}.html`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, r.html);
    console.log(`${p}: ${data[p].panels.length} panels, ${r.tabs} Tab sections; the rest as DA's`);
    report.push(`${p}\t${r.tabs} Tab sections\t${data[p].panels.map((x) => x.label).join(' | ')}`);
  });
  if (opt('report')) fs.writeFileSync(opt('report'), `${report.join('\n')}\n`);
  console.log(`ita-tabs-apply: ${paths.length - problems} written, ${problems} not changed`);
  if (problems) process.exitCode = 1;
}
