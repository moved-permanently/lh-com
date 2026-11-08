/* eslint-disable no-console, max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling */
/**
 * The collapse (tools/importer/marker-collapse.mjs) over a site's local documents: every
 * .plain.html below --content, collapsed into --out (never in place), the links from one document
 * to another's old heading ids rewritten too (a second pass over the collapsed documents), and a
 * report: per family how many markers became theme defaults, carriers or are left for a person,
 * the documents that changed, any marker left, and whether a second run changes anything
 * (idempotence). Reads and writes local files only; DA is the harness's.
 *
 * Usage: node tools/importer/marker-collapse-cli.mjs --content content-sites/lh-austrian/content
 *          --brand austrian [--out logs/collapse/lh-austrian] [--report logs/collapse/lh-austrian.json]
 *          [--list paths.txt] [--paths changed.txt] [--pages carriers.jsonl] [--check] [--force]
 *          (--check: no output written, the report only; --force: a brand whose theme isn't live yet,
 *          its pass; --pages: per changed document the carriers it gains, one JSON line each)
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseHTML } from 'linkedom';
import { collapseHtml, totals } from './marker-collapse.mjs';

const argv = process.argv.slice(2);
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d);
const content = opt('content');
const brand = opt('brand', 'lufthansa');
const outDir = opt('out', '');
const check = argv.includes('--check');
// a site's collapse pass, its brand's theme going live in the same release (without: a brand that
// isn't live keeps its markers, as the importers do)
const force = argv.includes('--force');
const listFile = opt('list', '');
const pagesFile = opt('pages', '');
if (!content) {
  console.error('usage: marker-collapse-cli.mjs --content <dir> --brand <brand> [--out <dir>] [--report <file>] [--check]');
  process.exit(2);
}
// what is left after the collapse and must not be: a known marker at the end of a text
const LEFT = /\{(?:heading-|copytext-|full-width|limited-width|column-|caption|parallax|narrow|indent-\d|spacer|divider|autoplay|muted|loop|controls|round-play-button|size-\d|mobile|selected|small|blank|cart|login|locale|help|search|accessibility|notifications)[^}]*\}/;

const walk = (d, out = []) => {
  fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { if (!/^(snapshots|snapshots-src|library|reports|runs)$/.test(e.name)) walk(p, out); } else if (e.name.endsWith('.plain.html')) out.push(p);
  });
  return out;
};
const only = listFile ? new Set(fs.readFileSync(listFile, 'utf8').split('\n').map((l) => l.trim()).filter((l) => l.startsWith('/'))) : null;
const files = walk(content).filter((f) => !only || only.has(`/${path.relative(content, f).replace(/\.plain\.html$/, '')}`));

const report = {
  content, brand, documents: files.length, changed: 0, changedPaths: [], families: { theme: {}, carrier: {}, hand: {} }, left: [], notIdempotent: [], errors: [], hand: [], ids: 0,
};
const results = new Map();
const idMaps = new Map();
files.forEach((f) => {
  const docPath = `/${path.relative(content, f).replace(/\.plain\.html$/, '')}`;
  const html = fs.readFileSync(f, 'utf8');
  try {
    const r = collapseHtml(html, {
      path: docPath, brand, parse: parseHTML, force,
    });
    Object.entries(r.stats).forEach(([kind, fam]) => Object.entries(fam).forEach(([k, n]) => {
      report.families[kind][k] = (report.families[kind][k] || 0) + n;
    }));
    r.hand.forEach((h) => report.hand.push(`${docPath}: ${h}`));
    if (Object.keys(r.ids).length) idMaps.set(docPath, r.ids);
    results.set(docPath, { file: f, before: html, html: r.html });
  } catch (e) {
    report.errors.push(`${docPath}: ${e.message}`);
  }
});
// links from one document to another's old heading ids
results.forEach((res) => {
  if (!idMaps.size || !/#/.test(res.html)) return;
  res.html = res.html.replace(/href="([^"#]*)#([^"]+)"/g, (m, page, frag) => {
    const ids = page && idMaps.get(page.replace(/^https?:\/\/[^/]+/, '').replace(/\.html$/, ''));
    const id = ids && ids[decodeURIComponent(frag)];
    if (!id) return m;
    report.ids += 1;
    return `href="${page}#${id}"`;
  });
});
// the carriers a document holds (section styles, block options, purpose blocks, video fragments,
// the Headings row): what the collapse wrote is the difference to the document before
const STYLE_WORDS = ['space-m', 'space-l', 'divider', 'space-below-m', 'space-below-l', 'divider-below', 'wide-text', 'small-print', 'h2-large', 'h2-compact', 'h3-large', 'parallax', 'narrow', 'padded'];
const OPTION_WORDS = ['space-m', 'space-l', 'divider-above', 'small-print', 'title-large', 'title-compact', 'background-video', 'mobile-video'];
const PURPOSE = ['spacer', 'divider', 'app-spacer', 'app-divider', 'app-text', 'nav-tools'];
function carriersOf(html) {
  const { document } = parseHTML(`<main>${html}</main>`);
  const n = {};
  const add = (k, v = 1) => { n[k] = (n[k] || 0) + v; };
  document.querySelectorAll('main > div > div.section-metadata').forEach((m) => {
    [...m.children].forEach((r) => {
      const [k, v] = r.children;
      if (k && v && k.textContent.trim().toLowerCase() === 'style') v.textContent.split(',').map((x) => x.trim().toLowerCase()).forEach((x) => { if (STYLE_WORDS.includes(x)) add(`section style ${x}`); });
    });
  });
  document.querySelectorAll('main > div > div[class]').forEach((b) => {
    const [name, ...opts] = b.className.trim().split(/\s+/);
    if (PURPOSE.includes(name)) add(`block ${[name, ...opts].join(' ')}`);
    opts.filter((o) => OPTION_WORDS.includes(o)).forEach((o) => add(`block option ${o}`));
  });
  document.querySelectorAll('a[href*="#"]').forEach((a) => {
    const h = a.getAttribute('href');
    if (/[#&]background(&|$)/.test(h)) add('video #background');
    if (/[#&]size=\d+x\d+/.test(h)) add('video #size');
  });
  document.querySelectorAll('main div.metadata > div').forEach((r) => { if (/^headings$/i.test((r.children[0] || {}).textContent || '')) add('page row Headings'); });
  return n;
}
report.carriers = {};
results.forEach((res, docPath) => {
  if (res.html !== res.before) {
    report.changed += 1;
    const after = carriersOf(res.html);
    const before = carriersOf(res.before);
    Object.entries(after).forEach(([k, v]) => {
      const d = v - (before[k] || 0);
      if (d > 0) report.carriers[k] = (report.carriers[k] || 0) + d;
    });
    if (pagesFile) {
      const gained = Object.fromEntries(Object.entries(after).map(([k, v]) => [k, v - (before[k] || 0)]).filter(([, d]) => d > 0));
      fs.appendFileSync(pagesFile, `${JSON.stringify({ path: docPath, carriers: gained })}\n`);
    }
    report.changedPaths.push(docPath);
  }
  const { document } = parseHTML(`<main>${res.html}</main>`);
  const left = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li')].filter((el) => LEFT.test(el.textContent));
  if (left.length && !docPath.startsWith('/content/mobile/')) report.left.push(`${docPath}: ${left.slice(0, 3).map((el) => el.textContent.trim().slice(-60)).join(' | ')}`);
  const again = collapseHtml(res.html, {
    path: docPath, brand, parse: parseHTML, force,
  }).html;
  if (again !== res.html) report.notIdempotent.push(docPath);
  if (outDir && !check) {
    const target = path.join(outDir, `${docPath}.plain.html`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, res.html);
  }
});
const t = totals(report.families);
report.totals = { ...t, all: t.theme + t.carrier + t.hand };
// the carriers written (instances): the captions' italics and the forms' Default cells counted from the markers
report.carriers['italic caption'] = (report.families.carrier.caption || 0);
if (report.families.carrier.form) report.carriers['form Default'] = report.families.carrier.form;
if (report.families.carrier.indent) report.carriers['list or quote (indent)'] = report.families.carrier.indent;
report.carrierTotal = Object.values(report.carriers).reduce((x, y) => x + y, 0);
const pathsOut = opt('paths', '');
if (pathsOut) {
  fs.mkdirSync(path.dirname(pathsOut), { recursive: true });
  fs.writeFileSync(pathsOut, `${report.changedPaths.sort().join('\n')}\n`);
}
const file = opt('report', '');
if (file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(report, null, 1)}\n`);
}
console.log(`${content} (${brand}): ${report.documents} documents, ${report.changed} changed; markers ${report.totals.all}: theme ${t.theme}, carriers ${t.carrier} (written: ${report.carrierTotal}), for a person ${t.hand}; left ${report.left.length}, not idempotent ${report.notIdempotent.length}, errors ${report.errors.length}, cross-document anchors ${report.ids}`);
