/* eslint-disable no-console, max-len, import/extensions -- tooling */
/**
 * Austrian's tab sets that hold blocks into the documents as they are (not a new import: the
 * documents carry later fixes and DA's image copies a re-import would undo). A marked copy of each
 * document (austrian-import.mjs with SWISS's withTabMarkers, written to --marked) shows where each
 * panel starts: the element after each marker (its tag and text, tokens aside; the nth of its
 * kind). The current document gets a clean marker before that element (tokens that open the panel,
 * {column-start} or a spacer, go with it; a {column-end} stays with the panel before), then
 * withAustrianTabs makes the Tab sections. Nothing else of the document changes (--check: the
 * content with section boundaries and section metadata set aside is the same).
 * Usage: node tools/importer/austrian-tabs-apply.mjs --list paths.txt --marked <dir> [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { withAustrianTabs } from './austrian-import.mjs';
import { divEnd } from './brussels-import.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DOCS = path.join(root, 'content-sites/lh-austrian/content');
const MARK = /^(@@tab@@\d+@@.*?@@|@@tabs-end@@)/;
const VOID = new Set(['img', 'br', 'hr', 'input', 'source']);

/** The top-level elements of an html fragment: [{start, end, tag, html}]. */
export function children(html) {
  const out = [];
  let i = html.indexOf('<');
  while (i >= 0 && i < html.length) {
    const m = html.slice(i).match(/^<([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*>/);
    if (!m) break;
    const tag = m[1].toLowerCase();
    let end;
    if (VOID.has(tag)) {
      end = i + m[0].length;
    } else if (tag === 'div') {
      end = divEnd(html, i);
    } else {
      const re = new RegExp(`<${tag}\\b[^>]*>|</${tag}>`, 'gi');
      re.lastIndex = i;
      let depth = 0;
      let t = re.exec(html);
      end = html.length;
      while (t) {
        depth += t[0].startsWith('</') ? -1 : 1;
        if (depth === 0) { end = t.index + t[0].length; break; }
        t = re.exec(html);
      }
    }
    out.push({
      start: i, end, tag, html: html.slice(i, end),
    });
    i = html.indexOf('<', end);
  }
  return out;
}

const decode = (s) => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
const textOf = (h) => decode(h.replace(/<[^>]+>/g, ' ')).replace(/\{[^}]*\}/g, ' ').replace(/\s+/g, ' ').trim();
const tokenOnly = (el) => el.tag === 'p' && /^\{[^}]*\}$/.test(textOf(el.html.replace(/\{([^}]*)\}/g, '§$1§')).replace(/§([^§]*)§/g, '{$1}'));
const isToken = (el) => el.tag === 'p' && /^<p>\s*\{[^}<]*\}\s*<\/p>$/.test(el.html);
const signature = (el) => `${el.tag}|${(el.html.match(/^<div class="([^"]+)"/) || [])[1] || ''}|${textOf(el.html).slice(0, 80)}`;

/** The section-level elements of a document, in order: [{section, child}] with absolute offsets. */
function flatten(doc) {
  const out = [];
  children(doc).forEach((s) => {
    if (s.tag !== 'div') return;
    const open = s.html.indexOf('>') + 1;
    const inner = s.html.slice(open, -6);
    children(inner).forEach((c) => out.push({
      ...c, start: s.start + open + c.start, end: s.start + open + c.end,
    }));
  });
  return out;
}

/** The markers of a marked document: [{mark, signature, nth}] (the element after each). */
export function markersOf(marked) {
  const flat = flatten(marked);
  const seen = new Map();
  const nthOf = flat.map((el) => {
    if (el.tag === 'p' && MARK.test(textOf(el.html).replace(/^\s+/, ''))) return -1;
    const sig = signature(el);
    const n = seen.get(sig) || 0;
    seen.set(sig, n + 1);
    return n;
  });
  const out = [];
  flat.forEach((el, i) => {
    const m = el.tag === 'p' && el.html.match(/^<p>(@@tab@@\d+@@[^<]*?@@|@@tabs-end@@)/);
    if (!m) return;
    let j = i + 1;
    while (j < flat.length && (nthOf[j] < 0 || isToken(flat[j]))) j += 1;
    out.push(j < flat.length ? { mark: m[1], signature: signature(flat[j]), nth: nthOf[j] } : { mark: m[1], signature: null, nth: 0 });
  });
  return out;
}

/** The document with a clean marker before each panel's first element (see the header). */
export function withMarkers(doc, markers) {
  const flat = flatten(doc);
  const counts = new Map();
  const nth = flat.map((el) => { const s = signature(el); const n = counts.get(s) || 0; counts.set(s, n + 1); return n; });
  const inserts = [];
  const missing = [];
  markers.forEach((mk) => {
    let at;
    if (!mk.signature) {
      // the set ends the document: after its last element
      at = flat.length ? flat[flat.length - 1].end : doc.length;
    } else {
      // the metadata block (a set at the document's end): its values are the document's own
      const meta = mk.signature.startsWith('div|metadata|');
      const k = flat.findIndex((el, i) => !isToken(el) && (meta ? signature(el).startsWith('div|metadata|') : signature(el) === mk.signature && nth[i] === mk.nth));
      if (k < 0) { missing.push(mk); return; }
      let b = k;
      // tokens that open the panel go with it; a column end stays before
      while (b > 0 && isToken(flat[b - 1]) && !/column-end/.test(flat[b - 1].html) && flat[b - 1].end <= flat[b].start) b -= 1;
      at = flat[b].start;
    }
    inserts.push({ at, html: `<p>${mk.mark}</p>` });
  });
  let out = doc;
  inserts.sort((a, b) => b.at - a.at).forEach(({ at, html }) => { out = `${out.slice(0, at)}${html}${out.slice(at)}`; });
  return { doc: out, missing };
}

/**
 * Each tab set over several sections as one section from its first marker to its end marker (the
 * documents keep a panel's image in a section of its own, e.g. austrian-app's full-bleed phone
 * images, which would break the set): the content before the set keeps its section and metadata,
 * the content after it too; the metadata of the sections inside the set goes (a panel is one
 * section; named in `dropped`). A set within one section as it is.
 */
export function joinSets(doc) {
  const dropped = [];
  let out = doc;
  const START = /<p>@@tab@@(\d+)@@[^<]*?@@<\/p>/g;
  for (let m = START.exec(out); m; m = START.exec(out)) {
    const p0 = m.index;
    const pe = out.indexOf('<p>@@tabs-end@@</p>', p0);
    if (pe < 0) break;
    const sections = children(out).filter((s) => s.tag === 'div');
    const s0 = sections.findIndex((s) => s.start <= p0 && p0 < s.end);
    const se = sections.findIndex((s) => s.start <= pe && pe < s.end);
    if (s0 < 0 || se <= s0) { START.lastIndex = pe + 1; continue; }
    // a section's inner html without its metadata, and the metadata
    const split = (s) => {
      const open = s.html.indexOf('>') + 1;
      const inner = s.html.slice(open, -6);
      const meta = children(inner).find((c) => c.html.startsWith('<div class="section-metadata">'));
      return { start: s.start + open, inner: meta ? inner.slice(0, meta.start) + inner.slice(meta.end) : inner, meta: meta ? meta.html : '' };
    };
    const describe = (metaHtml) => [...metaHtml.matchAll(/<div><div>([^<]*)<\/div><div>([^<]*)<\/div><\/div>/g)].map((r) => `${r[1]}: ${r[2]}`);
    const first = split(sections[s0]);
    const last = split(sections[se]);
    const firstInner = sections[s0].html.slice(sections[s0].html.indexOf('>') + 1, -6);
    const cut0 = p0 - first.start - (firstInner.slice(0, p0 - first.start).includes('<div class="section-metadata">') ? first.meta.length : 0);
    const before = first.inner.slice(0, cut0);
    const rest0 = first.inner.slice(cut0);
    const lastInner = sections[se].html.slice(sections[se].html.indexOf('>') + 1, -6);
    const endAt = pe - last.start;
    const cutE = endAt - (lastInner.slice(0, endAt).includes('<div class="section-metadata">') ? last.meta.length : 0) + '<p>@@tabs-end@@</p>'.length;
    const upToEnd = last.inner.slice(0, cutE);
    const after = last.inner.slice(cutE);
    const middles = sections.slice(s0 + 1, se).map((s) => {
      const x = split(s);
      if (x.meta) dropped.push(...describe(x.meta));
      return x.inner;
    });
    if (!before.trim() && first.meta) dropped.push(...describe(first.meta));
    if (!after.trim() && last.meta) dropped.push(...describe(last.meta));
    const parts = [
      before.trim() ? `<div>${before}${first.meta}</div>` : '',
      `<div>${rest0}${middles.join('')}${upToEnd}</div>`,
      after.trim() ? `<div>${after}${last.meta}</div>` : '',
    ].filter(Boolean).join('\n');
    out = `${out.slice(0, sections[s0].start)}${parts}${out.slice(sections[se].end)}`;
    START.lastIndex = sections[s0].start + parts.length;
  }
  return { doc: out, dropped };
}

const META = /<div class="section-metadata">(?:<div><div>[^<]*<\/div><div>[^<]*<\/div><\/div>)*<\/div>/g;
/** The content with section boundaries and section metadata set aside (the check). */
// (the split writes the sections it cuts anew: an attribute's "&amp;" as "&", the same HTML)
// and an empty id dropped, the same HTML)
export const contentOf = (doc) => flatten(doc.replace(META, '')).map((el) => el.html).join('').replace(/&amp;/g, '&').replace(/ id=""/g, '');

const isMain = process.argv[1] && fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) {
  const argv = process.argv.slice(2);
  const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
  const paths = fs.readFileSync(opt('list'), 'utf8').split('\n').map((x) => x.trim()).filter(Boolean);
  const changed = [];
  let problems = 0;
  paths.forEach((p) => {
    const file = path.join(DOCS, `${p}.plain.html`);
    const doc = fs.readFileSync(file, 'utf8');
    // a document with Tab sections already (the check-in entry's tabs): as it is
    if (doc.includes('<div><div>Tab</div>')) { console.log(`${p}: Tab sections already, left as it is`); return; }
    const markers = markersOf(fs.readFileSync(path.join(opt('marked'), `${p}.plain.html`), 'utf8'));
    const { doc: marked, missing } = withMarkers(doc, markers);
    const { doc: joined, dropped } = joinSets(marked);
    const next = withAustrianTabs(joined);
    const same = contentOf(next.replace(/\n/g, '')) === contentOf(doc.replace(/\n/g, ''));
    const tabs = (next.match(/<div><div>Tab<\/div>/g) || []).length;
    const left = (next.match(/@@tab/g) || []).length;
    // a set's Tab sections one after the other (a section between them would break the set)
    const kinds = children(next).filter((s) => s.tag === 'div').map((s) => s.html.includes('<div><div>Tab</div>'));
    const broken = kinds.filter((k, i) => !k && kinds.slice(0, i).includes(true) && kinds.slice(i + 1).includes(true)).length;
    if (missing.length || !same || left || broken) problems += 1;
    console.log(`${p}: ${markers.length} markers, ${tabs} Tab sections${dropped.length ? `, panel metadata dropped: ${dropped.join(', ')}` : ''}${missing.length ? `, ${missing.length} not placed (${missing[0].signature})` : ''}${same ? '' : ', CONTENT DIFFERS'}${left ? `, ${left} markers left` : ''}${broken ? `, ${broken} sections between Tab sections` : ''}`);
    if (!argv.includes('--dry-run') && !missing.length && same && !left && !broken && next !== doc) {
      fs.writeFileSync(file, next);
      changed.push(p);
    }
  });
  fs.writeFileSync(path.join(root, 'content-sites/lh-austrian/runs/tabs-upload.txt'), `${changed.join('\n')}\n`);
  console.log(`austrian-tabs-apply: ${changed.length} documents changed, ${problems} with problems (runs/tabs-upload.txt)`);
}
