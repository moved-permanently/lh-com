/* eslint-disable no-console -- dev tooling */
/**
 * Lists live widgets whose UI text ended up as dead paragraphs in the import: for every raw
 * snapshot (tools/importer/bd-snapshots/www.lufthansa.com/{path}.html) with an imported
 * document (content/{path}.plain.html), the outermost dcep-* components, web components and
 * forms outside the page chrome are collected with their control texts (labels, buttons,
 * legends, options, tabs, placeholders); a paragraph of the document without a link or image
 * whose text is one of those texts, or only a run of them ("Travel Class or ...Travel Class
 * or ..."), is dead label text. A component with at least MIN_DEAD such paragraphs on a page
 * is listed.
 *
 * node tools/parity/unmapped-widgets.mjs [--out tools/parity/unmapped-widgets.md]
 * report.mjs includes the output as the section "Unmapped widgets".
 * Needs jsdom (NODE_PATH=/usr/local/lib/node_modules when it is not installed in the repo).
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
// jsdom is not a dependency of the repo (NODE_PATH, see above)
// eslint-disable-next-line import/no-unresolved
const { JSDOM, VirtualConsole } = require('jsdom');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SNAP = path.join(ROOT, 'tools/importer/bd-snapshots/www.lufthansa.com');
const argv = process.argv.slice(2);
const OUT = path.resolve(ROOT, argv.includes('--out') ? argv[argv.indexOf('--out') + 1] : 'tools/parity/unmapped-widgets.md');
const MIN_DEAD = 2;

/** Page chrome and media components, never content widgets. */
const CHROME = /^dcep-(country-and-language-selection|shopping-cart|login-portlet|header-[a-z-]+|search-bar|general-message-box|blog-cookie|moving-image|social-share|react-wrapper)$/;
const WEB_COMPONENTS = ['feedback-questionnaire', 'culinary-hub', 'passenger-receipt-portal', 'ppfi-web-component'];
/** Out of scope here: app shells built elsewhere, the receipt download form (left alone). */
const SKIP_PATH = /^\/[a-z]{2}\/[a-z]{2}\/(login|profile\/|book-and-manage\/pax-receipt|.*rechnungsbeleg)/;
const CONTROLS = 'label, button, maui-button, legend, option, [role="tab"], [role="combobox"], maui-checkbox, maui-radio, maui-select, maui-input';
/** Blocks the importer writes for a widget, or that another agent builds (README / commits). */
const KNOWN = {
  'dcep-lounge-finder': 'lounge-finder (A1, mapped)',
  'dcep-flight-manager': 'flight-search (homepage only; B2)',
  'dcep-quick-actions': 'booking-lookup (B3)',
  'dcep-login-form': 'carousel-cards via .loginform:has(.login-oneid-card) (B4)',
  'dcep-fare-teaser-static': 'fare-teaser (B5)',
  'dcep-meili-car-rental': 'car-rental (block by the other agent, not mapped yet)',
  'dcep-poi-mapping': 'poi-map (block by the other agent, not mapped yet)',
  'dcep-ejournals': 'ejournals (block by the other agent, not mapped yet)',
};

const norm = (s) => (s || '').replace(/[\u200b-\u200d\ufeff]/g, '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return walk(p);
    return d.name.endsWith('.html') ? [p] : [];
  });
}

const vc = new VirtualConsole();
/** Runs `fn` on the parsed document of `html` and closes the jsdom window afterwards. */
function withDocument(html, fn) {
  const { window } = new JSDOM(html, { virtualConsole: vc });
  try {
    return fn(window.document);
  } finally {
    window.close();
  }
}

function componentName(el) {
  const dcep = [...el.classList].find((c) => c.startsWith('dcep-'));
  if (dcep) return dcep;
  if (WEB_COMPONENTS.includes(el.localName)) return el.localName;
  return `form${el.id ? `#${el.id}` : ''}${el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/)[0]}` : ''}`;
}

/** Outermost content widgets of the snapshot. */
function widgets(doc) {
  const chrome = 'header, footer, .header, .footer, .contentpage-header, nav, #onetrust-consent-sdk';
  const candidates = [...doc.querySelectorAll(`[class*="dcep-"], form, ${WEB_COMPONENTS.join(', ')}`)]
    .filter((el) => !el.closest(chrome))
    .filter((el) => {
      if (el.localName === 'form' || WEB_COMPONENTS.includes(el.localName)) return true;
      const dcep = [...el.classList].filter((c) => c.startsWith('dcep-'));
      return dcep.length && !dcep.some((c) => CHROME.test(c)) && el.hasAttribute('data-dcep');
    });
  return candidates.filter((el) => !candidates.some((o) => o !== el && o.contains(el)));
}

function controlTexts(el) {
  const texts = new Set();
  el.querySelectorAll(CONTROLS).forEach((c) => {
    const t = norm(c.textContent);
    if (t.length >= 2 && t.length <= 80) texts.add(t);
  });
  el.querySelectorAll('[placeholder]').forEach((c) => {
    const t = norm(c.getAttribute('placeholder'));
    if (t.length >= 2) texts.add(t);
  });
  return [...texts].sort((a, b) => b.length - a.length);
}

/** Whether `text` is one control text or only a run of them. */
function isDead(text, controls) {
  if (!text) return false;
  let rest = text;
  let hit = false;
  controls.forEach((c) => {
    if (rest.includes(c)) { rest = rest.split(c).join(' '); hit = true; }
  });
  return hit && !norm(rest).replace(/[|:*•·,()\-–]/g, '').trim();
}

const results = {};
const t0 = Date.now();
let pages = 0;
walk(SNAP).forEach((file) => {
  const pagePath = `/${path.relative(SNAP, file).replace(/\.html$/, '')}`;
  if (SKIP_PATH.test(pagePath)) return;
  const plain = path.join(ROOT, 'content', `${pagePath}.plain.html`);
  if (!fs.existsSync(plain)) return;
  const raw = fs.readFileSync(file, 'utf8');
  if (!/data-dcep=|<form[\s>]|<(feedback-questionnaire|culinary-hub|passenger-receipt-portal|ppfi-web-component)[\s>]/.test(raw)) return;
  // every jsdom window is closed right after its document is read (also on errors)
  const found = withDocument(raw, (snap) => widgets(snap)
    .map((el) => ({ name: componentName(el), controls: controlTexts(el) }))
    .filter((w) => w.controls.length));
  if (!found.length) return;
  pages += 1;
  const paras = withDocument(fs.readFileSync(plain, 'utf8'), (doc) => [...doc.querySelectorAll('p')]
    .filter((p) => !p.querySelector('a, img, picture')).map((p) => norm(p.textContent)));
  found.forEach((w) => {
    const dead = paras.filter((t) => isDead(t, w.controls));
    if (dead.length < MIN_DEAD) return;
    const r = results[w.name] || (results[w.name] = { pages: [], samples: new Set() });
    if (!r.pages.includes(pagePath)) r.pages.push(pagePath);
    dead.slice(0, 6).forEach((t) => { if (r.samples.size < 6) r.samples.add(t.length > 70 ? `${t.slice(0, 67)}...` : t); });
  });
});

const rows = Object.entries(results).sort((a, b) => b[1].pages.length - a[1].pages.length);
const md = [
  '# Unmapped widgets',
  '',
  `Live widgets whose form labels and button texts were imported as plain paragraphs (generated by tools/parity/unmapped-widgets.mjs on ${new Date().toISOString().slice(0, 10)} from the raw snapshots and content/**/*.plain.html; ${pages} pages with widgets scanned; login/profile app shells and the receipt download form excluded). Each is a defect to fix in the importer (a block mapping), not a gap by design.`,
  '',
  '| Component | Pages | Planned | Dead texts (sample) | Pages (first 8) |',
  '| --- | --- | --- | --- | --- |',
  ...rows.map(([name, r]) => `| \`${name}\` | ${r.pages.length} | ${KNOWN[name] || '-'} | ${[...r.samples].map((s) => `"${s.replace(/\|/g, '/')}"`).join(', ')} | ${r.pages.sort().slice(0, 8).join(', ')}${r.pages.length > 8 ? ', ...' : ''} |`),
  '',
];
if (!rows.length) md.splice(4, 2, 'None found.');
fs.writeFileSync(OUT, md.join('\n'));
console.log(`unmapped-widgets: ${pages} pages with widgets, ${rows.length} components with dead label text -> ${path.relative(ROOT, OUT)} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
rows.forEach(([name, r]) => console.log(`  ${name}: ${r.pages.length} pages; ${[...r.samples].slice(0, 3).join(' | ')}`));
