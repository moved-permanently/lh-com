/* eslint-disable no-console, max-len, no-await-in-loop, no-restricted-syntax, import/extensions, import/no-extraneous-dependencies -- dev tooling */
/**
 * Style marker check (tools/loc/README.md), after a translation into /de/de: the authoring
 * markers `{heading-small}`, `{caption}`, `{divider-25}` … are text, so they go to Google like
 * any text; the site reads them only exact and at the end of the text (scripts/scripts.js
 * decorateTextStyles, the patterns below). The check compares the markers the site reads in each
 * translated page with its English source and lists every marker that changed (`{Bildunterschrift}`,
 * moved away from the end) or vanished. Merge marks count: an incoming block (`da-diff-deleted`,
 * what the author accepts) is checked like the page; the page's own local blocks
 * (`[da-diff-added]`) are left out. The app marks only the first block of a local group, so the
 * blocks after it count as the page's.
 *
 * Read only (DA GET); never writes, previews or publishes.
 * Pages: --page /de/en/x (repeatable), else every /de/en page of tools/migration-scope/pages.csv
 * with a German page. The translation of a page with its own German slug is read at
 * /de/de/<english slug> while it sits there (before the slug step), else at the German page.
 * --root /drafts/loc-test: every DA path below that folder.
 * Report (all pages, no --root): tools/reports/loc-marker-check.md
 * Usage: node tools/loc/marker-check.mjs [--page /de/en/flight-search ...] [--root …]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { scopeRows } from './regional-diff.mjs';
import { translationPath } from './slug-lib.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

// the site's markers: the same patterns as scripts/scripts.js 198-204 (test/loc-marker-check.test.mjs
// fails when they drift apart)
const COLUMN_MARK = 'column-(?:(?:start|end)(?:-outer)?|spaced)';
const styleMarker = (tokens) => new RegExp(`\\s*\\{((?:${tokens})(?: (?:${tokens}))*)\\}\\s*$`);
const HEADING_STYLE = styleMarker(`heading-(?:large|medium|small|copytext-large|copytext-medium)|copytext-large|limited-width|${COLUMN_MARK}`);
const PARAGRAPH_STYLE = styleMarker(`copytext-(?:small|medium|large)|full-width|limited-width|caption|parallax|narrow|indent-\\d{1,3}|${COLUMN_MARK}`);
const LIST_STYLE = styleMarker(`full-width|limited-width|${COLUMN_MARK}`);
const SEPARATOR = /^\{(spacer|divider)-(\d{1,3})( from-768)?\}$/;

const TEXT_ELEMENTS = 'h1, h2, h3, h4, h5, h6, p, li';
// any brace text: what Google may have made of a marker (an unclosed one included)
const BRACES = /\{[^{}\n]{1,60}\}?/g;

function textNodes(el, out = []) {
  for (const n of el.childNodes) {
    if (n.nodeType === 3) out.push(n);
    else if (n.nodeType === 1) textNodes(n, out);
  }
  return out;
}

/** The marker the site reads on an element (decorateTextStyles), or null: {kind, marker}. */
function siteMarker(el) {
  const tag = el.tagName.toLowerCase();
  const last = textNodes(el).filter((n) => n.nodeValue.trim()).pop();
  const end = (pattern) => last?.nodeValue.match(pattern)?.[1] || null;
  if (/^h[1-6]$/.test(tag)) {
    const m = end(HEADING_STYLE);
    return m && { kind: 'heading', marker: m };
  }
  if (tag === 'p') {
    const sep = el.textContent.trim().match(SEPARATOR);
    if (sep) return { kind: 'separator', marker: el.textContent.trim().slice(1, -1) };
    const m = end(PARAGRAPH_STYLE);
    return m && { kind: 'paragraph', marker: m };
  }
  // a list: the marker at the end of its last item
  const items = [...el.parentElement.children].filter((c) => c.tagName === 'LI');
  if (items[items.length - 1] !== el) return null;
  const m = end(LIST_STYLE);
  return m && { kind: 'list', marker: m };
}

function contextOf(el) {
  if (el.closest('da-diff-deleted, da-loc-deleted')) return 'incoming';
  if (el.closest('[da-diff-added], da-loc-added')) return 'local';
  return 'page';
}

const snippet = (s) => {
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length > 70 ? `${t.slice(0, 67)}…` : t;
};

/**
 * Every brace text of a DA document in order, with the ones the site reads marked:
 * [{raw, inner, tag, ctx, text, read: {kind, marker} | null}]. Local merge blocks left out.
 */
export function collectMarkers(html) {
  const { document } = parseHTML(/^\s*<html/i.test(html) ? html : `<html><head></head>${html}</html>`);
  const main = document.querySelector('main') || document.body;
  const els = [...main.querySelectorAll(TEXT_ELEMENTS)];
  const found = [];
  els.filter((el) => !el.querySelector(TEXT_ELEMENTS)).forEach((el) => {
    for (const m of el.textContent.matchAll(BRACES)) {
      found.push({
        el, raw: m[0], inner: m[0].replace(/^\{|\}$/g, ''), tag: el.tagName.toLowerCase(), ctx: contextOf(el), text: snippet(el.textContent), whole: el.textContent.trim() === m[0], read: null,
      });
    }
  });
  els.forEach((el) => {
    const read = siteMarker(el);
    if (!read) return;
    const own = found.filter((c) => c.el === el || el.contains(c.el));
    const c = own[own.length - 1];
    if (c) c.read = read;
  });
  return found.filter((c) => c.ctx !== 'local').map(({ el, ...c }) => c);
}

// the elements a marker of each kind can stand in (a separator: a paragraph of its own)
const KIND_TAGS = {
  heading: /^h[1-6]$/, paragraph: /^p$/, list: /^li$/, separator: /^p$/,
};

/**
 * How well a source marker s fits a brace text c of the translation (0: not at all): the same
 * marker read the same way 4, the same text the site does not read 2, another brace text the
 * site does not read 1. A brace text only stands for a marker in the element the marker's kind
 * belongs to (a separator: the whole text of a paragraph). Two markers the site reads but
 * different ones never pair (each is a finding of its own).
 */
function fit(s, c) {
  if (c.read) return c.read.kind === s.read.kind && c.read.marker === s.read.marker ? 4 : 0;
  if (!KIND_TAGS[s.read.kind].test(c.tag) || (s.read.kind === 'separator' && !c.whole)) return 0;
  return c.inner.trim() === s.read.marker ? 2 : 1;
}

/** The best order-keeping pairing of the source markers with the translation's brace texts. */
function align(src, all) {
  const t = Array.from({ length: src.length + 1 }, () => new Array(all.length + 1).fill(0));
  for (let i = src.length - 1; i >= 0; i -= 1) {
    for (let j = all.length - 1; j >= 0; j -= 1) {
      const f = fit(src[i], all[j]);
      t[i][j] = Math.max(t[i + 1][j], t[i][j + 1], f ? t[i + 1][j + 1] + f : 0);
    }
  }
  const pairs = new Map();
  for (let i = 0, j = 0; i < src.length && j < all.length;) {
    const f = fit(src[i], all[j]);
    if (f && t[i][j] === t[i + 1][j + 1] + f) {
      pairs.set(i, j);
      i += 1;
      j += 1;
    } else if (t[i + 1][j] >= t[i][j + 1]) i += 1;
    else j += 1;
  }
  return pairs;
}

/**
 * The markers of a translated page against its English source:
 * {markers: n read in the source, kept: n, findings: [{status, marker, kind, tag, text, now?, ctx?}]}
 * status: changed (another brace text at its place), not-read (the same text, but not where the
 * site reads it), vanished (no brace text left for it), added (read in the translation, not in
 * the source).
 */
export function compareMarkers(sourceHtml, translatedHtml) {
  const src = collectMarkers(sourceHtml).filter((c) => c.read);
  const all = collectMarkers(translatedHtml);
  const pairs = align(src, all);
  const used = new Set(pairs.values());
  const findings = [];
  let kept = 0;
  src.forEach((s, i) => {
    const base = {
      marker: `{${s.read.marker}}`, kind: s.read.kind, tag: s.tag, text: s.text,
    };
    if (!pairs.has(i)) {
      findings.push({ status: 'vanished', ...base });
      return;
    }
    const c = all[pairs.get(i)];
    if (c.read) {
      kept += 1;
      return;
    }
    findings.push({
      status: c.inner.trim() === s.read.marker ? 'not-read' : 'changed', ...base, now: c.raw, nowTag: c.tag, nowText: c.text, ctx: c.ctx,
    });
  });
  all.forEach((c, j) => {
    if (c.read && !used.has(j)) {
      findings.push({
        status: 'added', marker: `{${c.read.marker}}`, kind: c.read.kind, tag: c.tag, text: c.text, ctx: c.ctx,
      });
    }
  });
  return { markers: src.length, kept, findings };
}

const WHERE = { incoming: ' (in an incoming merge block)', page: '' };

export function findingLine(f) {
  if (f.status === 'vanished') return `vanished   ${f.marker} (${f.kind}) of <${f.tag}> "${f.text}"`;
  if (f.status === 'added') return `added      ${f.marker} (${f.kind}) in <${f.tag}> "${f.text}"${WHERE[f.ctx] || ''}: not in the English source`;
  const how = f.status === 'changed' ? `changed to ${f.now}` : `kept as ${f.now} but not where the site reads it (exact, at the end of a ${f.kind === 'separator' ? 'paragraph of its own' : `<${f.tag}>`})`;
  return `${f.status.padEnd(10)} ${f.marker} (${f.kind}) of <${f.tag}> "${f.text}": ${how} in <${f.nowTag}> "${f.nowText}"${WHERE[f.ctx] || ''}`;
}

/** The pages to check: [{source: /de/en/x, targets: [paths to try, in order]}]. */
export function checkPairs(rows, listed = []) {
  const german = new Map(rows.filter((r) => r.de_en && r.de_de).map((r) => [r.de_en, r.de_de]));
  const pages = listed.length ? listed : [...german.keys()];
  return pages.map((source) => {
    const de = german.get(source);
    const copy = translationPath(source);
    return { source, targets: [...new Set(de && de !== copy ? [copy, de] : [de || copy])] };
  });
}

/** Runs the check over DA (read only): [{source, target, markers, kept, findings} | {source, status}]. */
export async function runMarkerCheck({
  pairs, da, rootDir = '', concurrency = 6,
}) {
  const out = new Array(pairs.length);
  let next = 0;
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (next < pairs.length) {
      const i = next;
      next += 1;
      const { source, targets } = pairs[i];
      const sourceHtml = await da.get(`${rootDir}${source}`);
      let target = null;
      let html = null;
      for (const t of targets) {
        html = await da.get(`${rootDir}${t}`);
        if (html) {
          target = t;
          break;
        }
      }
      if (!sourceHtml) out[i] = { source, status: 'no English page in DA' };
      else if (!html) out[i] = { source, status: `no translation (${targets.join(', ')})` };
      else out[i] = { source, target, ...compareMarkers(sourceHtml, html) };
    }
  }));
  return out;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const argv = process.argv.slice(2);
  const opt = (name) => (argv.includes(`--${name}`) ? argv[argv.indexOf(`--${name}`) + 1] : undefined);
  if (argv.includes('--apply')) {
    console.error('marker-check: read only (a dry run); it never writes');
    process.exit(1);
  }
  const { daClient } = await import('./slug-step.mjs');
  const listed = argv.flatMap((a, i) => (a === '--page' ? [argv[i + 1]] : []));
  const results = await runMarkerCheck({ pairs: checkPairs(scopeRows(), listed), da: daClient(), rootDir: opt('root') || '' });
  const checked = results.filter((r) => r.target);
  const broken = checked.filter((r) => r.findings.length);
  const lines = [];
  broken.forEach((r) => {
    lines.push(`${r.target} (from ${r.source}): ${r.findings.length} finding${r.findings.length > 1 ? 's' : ''}; ${r.kept} of the source's ${r.markers} markers kept`);
    r.findings.forEach((f) => lines.push(`  ${findingLine(f)}`));
  });
  const skipped = results.filter((r) => r.status);
  const summary = `marker-check: ${checked.length} translated pages, ${checked.reduce((n, r) => n + r.markers, 0)} markers in their English sources, ${checked.reduce((n, r) => n + r.kept, 0)} kept; ${broken.length} pages with markers changed or vanished; ${skipped.length} not checked`;
  lines.forEach((l) => console.log(l));
  if (listed.length) skipped.forEach((r) => console.log(`${r.source}: ${r.status}`));
  console.log(summary);
  if (!listed.length && !opt('root')) {
    fs.writeFileSync(path.join(root, 'tools/reports/loc-marker-check.md'), ['# Style marker check (DA as it is)', '', new Date().toISOString(), '', `${summary}.`, '',
      'Before any translation project the German pages are www\'s own (imported): their markers differ from the English page where www\'s pages differ (other spacers, headings). Compare a run after a project with this one.', '',
      '```', ...lines, '```', '', `Not checked: ${[...new Set(skipped.map((r) => r.status.replace(/ \(.*/, '')))].map((s) => `${s} ${skipped.filter((r) => r.status.startsWith(s)).length}`).join(', ') || 'none'}.`, ''].join('\n'));
  }
}
