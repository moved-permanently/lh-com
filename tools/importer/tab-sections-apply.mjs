/* eslint-disable no-console, max-len, import/extensions -- tooling */
/**
 * A tab set as a delta on DA's copy (standing order 15 of 2026-11-13: xx/en entertainment-on-board, whose re-import
 * would lose DA's per-market section rows, links and pictures). Per tab its name and the heading it starts at (www's
 * panels, in order); from a tab's start heading to the next tab's start, every section gets DA's tab rows
 * (Tab: <name>, Tabs: 1, as de/en's copy writes them), into its section metadata or a new one; where a tab starts inside
 * a section the section is split before the heading, the part before it closing with a verbatim copy of the section's
 * own metadata rows (its style, its markets) and its tab rows. Content before the first tab and sections without
 * content stay outside. Nothing else changes: the inserts are returned, and removing them gives back DA's copy byte
 * for byte (removeInserts; --check). A start heading not found once, or a copy that has tab rows already, changes
 * nothing.
 *
 * Usage: node tools/importer/tab-sections-apply.mjs --data tabs.json --docs <DA copies> --out <dir> [--list <list>] [--check]
 *   tabs.json: [{ path, tabs: [{ name, start }] }]; <docs>/<path>.html as DA's copy (the source API's body/main frame)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TOKEN = /<!--[\s\S]*?-->|<![^>]*>|<(\/?)([a-zA-Z][\w:-]*)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>/g;
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const decode = (s) => s.replace(/&nbsp;|&#160;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCodePoint(parseInt(h, 16)));
const key = (s) => decode(s.replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim().toLowerCase();

/** The sections of main (DA's frame or a bare document) with their children: { start, end, kids: [{ tag, cls, start, end }] }. */
export function sectionsOf(html) {
  const m = html.match(/<main\b[^>]*>/i);
  const from = m ? m.index + m[0].length : 0;
  const to = m ? html.toLowerCase().lastIndexOf('</main>') : html.length;
  const stack = [];
  const sections = [];
  TOKEN.lastIndex = from;
  let t;
  // eslint-disable-next-line no-cond-assign
  while ((t = TOKEN.exec(html)) && t.index < to) {
    if (!t[2]) continue; // eslint-disable-line no-continue
    const tag = t[2].toLowerCase();
    if (!t[1]) {
      if (VOID.has(tag) || t[4]) {
        if (stack.length === 1) sections[sections.length - 1].kids.push({ tag, cls: '', start: t.index, end: TOKEN.lastIndex });
      } else {
        const cls = ((t[3] || '').match(/\bclass="([^"]*)"/) || [])[1] || '';
        if (stack.length === 0) sections.push({ start: t.index, kids: [] });
        stack.push({ tag, cls, start: t.index });
      }
    } else if (!VOID.has(tag)) {
      const open = stack.pop();
      if (!open || open.tag !== tag) return null;
      if (stack.length === 1) sections[sections.length - 1].kids.push({ tag, cls: open.cls, start: open.start, end: TOKEN.lastIndex });
      if (stack.length === 0) sections[sections.length - 1].end = TOKEN.lastIndex;
    }
  }
  return stack.length ? null : sections;
}

const tabRows = (name) => `<div><div>Tab</div><div>${name}</div></div><div><div>Tabs</div><div>1</div></div>`;
const isMeta = (k) => k.tag === 'div' && k.cls.split(/\s+/).includes('section-metadata');

/** @returns {{ html: string, inserts: Array<[number, string]>, results: Array<{ tab, result }> }} */
export function applyTabSections(html, tabs) {
  const sections = sectionsOf(html);
  if (!sections) return { html, inserts: [], results: tabs.map((tab) => ({ tab, result: 'not found in the source' })) };
  if (/<div><div>Tabs?<\/div><div>/.test(html)) return { html, inserts: [], results: tabs.map((tab) => ({ tab, result: 'present' })) };
  const kids = sections.flatMap((s, si) => s.kids.map((k) => ({ ...k, si })));
  const starts = tabs.map((tab) => kids.filter((k) => /^h[1-6]$/.test(k.tag) && key(html.slice(k.start, k.end)) === key(tab.start)));
  const results = tabs.map((tab, i) => ({ tab, result: starts[i].length === 1 ? 'found' : (starts[i].length ? 'ambiguous' : 'not found') }));
  if (results.some((r) => r.result !== 'found')) return { html, inserts: [], results };
  // each child's tab: the last tab started at or before it (content before the first tab: none)
  const startAt = starts.map(([k]) => k.start);
  const tabOf = (k) => {
    let n = null;
    startAt.forEach((s, i) => { if (k.start >= s) n = tabs[i].name; });
    return n;
  };
  const inserts = [];
  sections.forEach((sec) => {
    const meta = sec.kids.find(isMeta);
    const content = sec.kids.filter((k) => !isMeta(k));
    if (!content.length) return;
    const ownRows = meta ? html.slice(html.indexOf('>', meta.start) + 1, meta.end - '</div>'.length) : '';
    // runs of children with the same tab
    const runs = [];
    content.forEach((k) => {
      const tab = tabOf(k);
      if (!runs.length || runs[runs.length - 1].tab !== tab) runs.push({ tab, first: k });
      else runs[runs.length - 1].last = k;
    });
    runs.forEach((run, r) => {
      if (r === 0) return;
      // the part before this run closes here: its own copy of the section's rows, its tab rows
      const prev = runs[r - 1];
      const rows = ownRows + (prev.tab ? tabRows(prev.tab) : '');
      inserts.push([run.first.start, `${rows ? `<div class="section-metadata">${rows}</div>` : ''}</div><div>`]);
    });
    const lastTab = runs[runs.length - 1].tab;
    if (!lastTab) return;
    if (meta) inserts.push([meta.end - '</div>'.length, tabRows(lastTab)]);
    else inserts.push([sec.end - '</div>'.length, `<div class="section-metadata">${tabRows(lastTab)}</div>`]);
  });
  const sorted = [...inserts].sort((a, b) => a[0] - b[0]);
  let out = '';
  let at = 0;
  sorted.forEach(([pos, text]) => { out += html.slice(at, pos) + text; at = pos; });
  out += html.slice(at);
  return { html: out, inserts: sorted, results };
}

/** html without the inserts applyTabSections made (offsets in the original copy). */
export function removeInserts(html, inserts) {
  // insert i of the sorted list sits at its offset plus the lengths of the ones before it; removed from the end
  let before = 0;
  const at = inserts.map(([pos, text]) => { const a = pos + before; before += text.length; return [a, text]; });
  return at.reverse().reduce((out, [a, text]) => {
    if (out.slice(a, a + text.length) !== text) throw new Error(`insert at ${a} not found`);
    return out.slice(0, a) + out.slice(a + text.length);
  }, html);
}

const listPaths = (txt) => txt.split('\n').map((l) => l.split('\t'))
  .filter((c) => c[0].trim().startsWith('/') && (c.length === 1 || /^READY\b/.test(c[c.length - 1].trim())))
  .map((c) => c[0].trim());

const main = () => {
  const args = process.argv.slice(2);
  const opt = (k) => { const i = args.indexOf(`--${k}`); return i >= 0 ? args[i + 1] : undefined; };
  const data = JSON.parse(fs.readFileSync(opt('data'), 'utf8'));
  const list = opt('list') ? listPaths(fs.readFileSync(opt('list'), 'utf8')) : null;
  data.filter((d) => !list || list.includes(d.path)).forEach(({ path: p, tabs }) => {
    const src = path.join(opt('docs'), `${p}.html`);
    if (!fs.existsSync(src)) { console.log(`${p}\tno document`); return; }
    const before = fs.readFileSync(src, 'utf8');
    const { html, inserts, results } = applyTabSections(before, tabs);
    results.forEach(({ tab, result }) => console.log(`${p}\ttab "${tab.name}" at "${tab.start.slice(0, 40)}"\t${result}`));
    if (!inserts.length) return;
    const back = removeInserts(html, inserts) === before;
    console.log(`${p}\t${inserts.length} inserts\twithout them DA's copy byte for byte: ${back}`);
    if (args.includes('--check') || !back) return;
    const out = path.join(opt('out'), `${p}.html`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, html);
  });
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
