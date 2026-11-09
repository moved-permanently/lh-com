/* eslint-disable no-console, max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/**
 * The collapse's loss check (the harness's pass, tools/reports/token-free/harness-pass-<brand>.md): every document
 * before and after marker-collapse.mjs, compared. The collapse may only take markers away and add carriers; a
 * document fails when anything else differs:
 * - text: the document's characters without its markers and whitespace (and without a list's numbers and bullets
 *   written as text, "1. " or "- ", which become a list's own), outside the Metadata and Section Metadata tables, the purpose
 *   blocks (Spacer, Divider; App Text keeps its text) and the form block (whose Default column the collapse writes); a video link whose text
 *   was its URL gets a readable text, so link texts of video files are left out too;
 * - links (href without its fragment: the collapse writes #background, #size=WxH) and images (src);
 * - blocks: their names in order, the purpose blocks, Metadata and Section Metadata aside;
 * - headings: their number per level (the collapse never changes a level), and one H1 where there was one
 *   (the report lists the documents that had several before: notes, not failures);
 * - markers: none left (LEFT_MARKER).
 * Reads local files only.
 *
 * Usage: node tools/importer/collapse-loss-check.mjs --before <dir> --after <dir> [--list paths.txt] [--out report.json]
 *   (<dir>/<path>.plain.html or <path>.html; the DA source shape <body>…</body> or a document's main content)
 *   Exit code 1 when a document fails.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { LEFT_MARKER, stripMarkers } from './marker-families.mjs';

const SKIP_BLOCKS = new Set(['metadata', 'section-metadata', 'spacer', 'divider', 'app-spacer', 'app-divider', 'app-text']);
const VIDEO = /\.(mp4|webm|mov|m3u8)(?:[?#]|$)/i;
const LIST_SIGN = /^\s*(\d{1,3}\.|[-–—•·])\s+/;

const mainOf = (html) => {
  const { document } = parseHTML(/<main[\s>]/i.test(html) ? html : `<html><body><main>${html}</main></body></html>`);
  return document.querySelector('main');
};
const blockName = (el) => String(el.className || '').split(/\s+/)[0];
// the text without its markers and without whitespace (a serialisation may join or split text nodes, and
// whitespace between elements comes and goes), a list's numbers and bullets written as text ("1. ", "- ") aside: the
// collapse makes such paragraphs a list (indent-N)
// (a run of sibling text nodes is one text: the parser splits a node at an entity, "Familie&#160;– und" is three nodes,
// and a dash after a no-break space is no list sign; the brief after 539)
const textNodes = (node, out = []) => {
  let run = null;
  node.childNodes.forEach((n) => {
    if (n.nodeType === 3) {
      if (run === null) { run = out.length; out.push(''); }
      out[run] += n.nodeValue;
      return;
    }
    run = null;
    if (n.nodeType === 1) textNodes(n, out);
  });
  return out;
};
const textOf = (node) => textNodes(node).map((t) => stripMarkers(t).replace(LIST_SIGN, '')).join('').replace(/\s+/g, '');
const strip = (href) => String(href || '').replace(/#.*$/, '');
const counted = (list) => list.reduce((m, x) => m.set(x, (m.get(x) || 0) + 1), new Map());
const diffCounts = (a, b) => {
  const out = [];
  const keys = new Set([...a.keys(), ...b.keys()]);
  keys.forEach((k) => { const d = (b.get(k) || 0) - (a.get(k) || 0); if (d) out.push(`${d > 0 ? '+' : ''}${d} ${k}`); });
  return out;
};

/**
 * The markers left in a document: at the end of a heading, paragraph or list item, or in a block cell's bare text
 * (a form note's label, a one-paragraph cell). Data placeholders ({origin}, {n}) aren't markers.
 */
export function leftIn(html, main = mainOf(html)) {
  const texts = [...main.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li')].filter((el) => LEFT_MARKER.test(el.textContent));
  const cells = [...main.querySelectorAll('div')].filter((d) => [...d.childNodes].some((n) => n.nodeType === 3 && LEFT_MARKER.test(n.nodeValue)));
  return [...texts, ...cells].map((el) => el.textContent.trim().slice(-60));
}

/** What a document's checks read. */
export function readDocument(html) {
  const main = mainOf(html);
  const clone = main.cloneNode(true);
  clone.querySelectorAll('div').forEach((d) => {
    if (d.parentElement && d.parentElement.parentElement === clone && ((SKIP_BLOCKS.has(blockName(d)) && blockName(d) !== 'app-text') || blockName(d) === 'form')) d.remove();
  });
  clone.querySelectorAll('a').forEach((a) => { if (VIDEO.test(a.getAttribute('href') || '')) a.textContent = ''; });
  return {
    text: textOf(clone),
    links: [...main.querySelectorAll('a[href]')].map((a) => strip(a.getAttribute('href'))),
    images: [...main.querySelectorAll('img')].map((i) => i.getAttribute('src') || ''),
    blocks: [...main.querySelectorAll(':scope > div > div[class]')].map(blockName).filter((n) => !SKIP_BLOCKS.has(n)),
    headings: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map((h) => main.querySelectorAll(h).length),
    left: leftIn(html, main),
  };
}

/**
 * A document's problems after the collapse (empty: it passes).
 * @param {string} before
 * @param {string} after
 * @returns {string[]}
 */
export function lossProblems(before, after) {
  const a = readDocument(before);
  const b = readDocument(after);
  const problems = [];
  if (a.text !== b.text) {
    let k = 0;
    while (k < a.text.length && a.text[k] === b.text[k]) k += 1;
    problems.push(`text: "…${a.text.slice(Math.max(0, k - 20), k + 30)}…" -> "…${b.text.slice(Math.max(0, k - 20), k + 30)}…"`);
  }
  const l = diffCounts(counted(a.links), counted(b.links));
  if (l.length) problems.push(`links: ${l.slice(0, 5).join(', ')}`);
  const i = diffCounts(counted(a.images), counted(b.images));
  if (i.length) problems.push(`images: ${i.slice(0, 5).join(', ')}`);
  if (a.blocks.join(' ') !== b.blocks.join(' ')) problems.push(`blocks: ${a.blocks.join(' ')} -> ${b.blocks.join(' ')}`);
  if (a.headings.join() !== b.headings.join()) problems.push(`headings per level: ${a.headings.join('/')} -> ${b.headings.join('/')}`);
  // one H1 where there was one (a document with several before keeps them: not the collapse's)
  if (a.headings[0] === 1 && b.headings[0] !== 1) problems.push(`h1: ${b.headings[0]}`);
  if (b.left.length) problems.push(`markers left: ${b.left.slice(0, 3).join(' | ')}`);
  return problems;
}

const fileOf = (dir, p) => [`${p}.plain.html`, `${p}.html`].map((f) => path.join(dir, f)).find((f) => fs.existsSync(f));

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const argv = process.argv.slice(2);
  const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : null);
  const beforeDir = opt('before'); const afterDir = opt('after');
  if (!beforeDir || !afterDir) { console.error('usage: collapse-loss-check.mjs --before <dir> --after <dir> [--list paths.txt] [--out report.json]'); process.exit(2); }
  const walk = (d, out = []) => {
    fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
      const f = path.join(d, e.name);
      if (e.isDirectory()) walk(f, out); else if (/\.(plain\.)?html$/.test(e.name)) out.push(`/${path.relative(beforeDir, f).replace(/\.(plain\.)?html$/, '')}`);
    });
    return out;
  };
  const paths = opt('list') ? fs.readFileSync(opt('list'), 'utf8').split('\n').map((x) => x.trim()).filter((x) => x.startsWith('/')) : walk(beforeDir);
  const report = {
    checked: 0, failed: [], missing: [], severalH1: [],
  };
  paths.forEach((p) => {
    const bf = fileOf(beforeDir, p); const af = fileOf(afterDir, p);
    if (!bf || !af) { report.missing.push(p); return; }
    report.checked += 1;
    const problems = lossProblems(fs.readFileSync(bf, 'utf8'), fs.readFileSync(af, 'utf8'));
    if (problems.length) report.failed.push({ path: p, problems });
    const h1 = readDocument(fs.readFileSync(bf, 'utf8')).headings[0];
    if (h1 > 1) report.severalH1.push(`${p} (${h1})`);
  });
  if (opt('out')) fs.writeFileSync(opt('out'), JSON.stringify(report, null, 1));
  console.log(`checked ${report.checked}, failed ${report.failed.length}, missing ${report.missing.length}; several H1s before (notes) ${report.severalH1.length}`);
  report.failed.slice(0, 20).forEach((f) => console.log(`${f.path}: ${f.problems.join('; ')}`));
  process.exit(report.failed.length || report.missing.length ? 1 : 0);
}
