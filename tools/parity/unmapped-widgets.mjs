/* eslint-disable no-console -- dev tooling */
/**
 * Lists live widgets whose UI text ended up as dead paragraphs in the import: for every raw
 * snapshot (tools/importer/bd-snapshots/www.lufthansa.com/{path}.html) with an imported
 * document (content/{path}.plain.html), the outermost dcep-* components, web components and
 * forms outside the page chrome are collected with their control texts (labels, buttons,
 * legends, options, tabs, placeholders); a paragraph of the document without a link or image
 * whose text is one of those texts, or only a run of them ("Travel Class or ...Travel Class
 * or ..."), is dead label text. A component with at least MIN_DEAD such paragraphs on a page
 * is listed. Paragraphs inside blocks (authored settings) do not count. A KNOWN widget whose
 * block is missing from the document and that left no dead text is listed as dropped.
 *
 * node tools/parity/unmapped-widgets.mjs [--out tools/parity/unmapped-widgets.md]
 * report.mjs includes the output as the section "Unmapped widgets".
 * Needs jsdom (NODE_PATH=/usr/local/lib/node_modules when it is not installed in the repo).
 * Snapshots are parsed in child processes of CHUNK pages each (jsdom keeps memory of closed
 * windows).
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
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
/** Control texts, plus loader texts ("Loading...") and the Google map attribution of a widget. */
const CONTROLS = 'label, button, maui-button, legend, option, [role="tab"], [role="combobox"], maui-checkbox, maui-radio, maui-select, maui-input, maui-loader, .loading-text, .gm-style-cc';
/**
 * Block the importer writes (or should write) for a widget, and the work item that maps it. A
 * known widget on a page whose document has no such block and no dead text was dropped without
 * a trace (listed separately).
 */
const KNOWN = {
  'dcep-lounge-finder': { block: 'lounge-finder', planned: 'lounge-finder (A1, mapped in hub/info)' },
  'dcep-flight-manager': { block: 'flight-search', planned: 'flight-search (B2 done: mapped in homepage, app-entry, campaign, info)' },
  'dcep-quick-actions': { block: 'booking-lookup', planned: 'booking-lookup my-bookings (B3 done, app-entry)' },
  'dcep-login-form': { block: 'carousel-cards', planned: 'carousel-cards via .loginform:has(.login-oneid-card) (B4 done: app-entry, info)' },
  'dcep-fare-teaser-static': { block: 'fare-teaser', planned: 'fare-teaser (B5 done: homepage, insights)' },
  'dcep-meili-car-rental': { block: 'car-rental', planned: 'car-rental (B6 done: mapped in info)' },
  'dcep-poi-mapping': { block: 'poi-map', planned: 'poi-map (block exists, not mapped; open, no item)' },
  'dcep-ejournals': { block: 'ejournals', planned: 'ejournals (block exists, not mapped; open, no item)' },
  'dcep-author-slider': { planned: 'loader text only (the slider is imported as carousel-cards); open, no item: drop .loading-text in the cleanup' },
  'dcep-blog-overview': { planned: 'loader text only; open, no item: drop .loading-text in the cleanup' },
  'form#new_form.cmp-form': { block: 'form', planned: 'Form (core) variant of the form block (B7 done: form-core parser mapped in form, hub, info)' },
};
const planned = (name) => (KNOWN[name] && KNOWN[name].planned) || 'open, no item';

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

/**
 * Whether the widget's settings hide every part (data-dcep hide* flags all true: the homepage
 * dcep-quick-actions shows nothing on the live page either).
 */
function allHidden(el) {
  try {
    const flags = Object.entries(JSON.parse(el.getAttribute('data-dcep') || '{}'))
      .filter(([k]) => /^hide[A-Z]/.test(k));
    return flags.length > 0 && flags.every(([, v]) => v === true);
  } catch (e) {
    return false;
  }
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

/** Scans `files` (snapshot paths) in this process: { pagePath: [{ name, dead: [...] }] }. */
function scan(files) {
  const out = {};
  files.forEach((file) => {
    const pagePath = `/${path.relative(SNAP, file).replace(/\.html$/, '')}`;
    // scripts, styles and inline SVGs carry no control texts and make up most of the DOM
    const raw = fs.readFileSync(file, 'utf8')
      .replace(/<(script|style|svg|noscript)\b[\s\S]*?<\/\1>/gi, '');
    // every jsdom window is closed right after its document is read (also on errors)
    const found = withDocument(raw, (snap) => widgets(snap)
      .map((el) => ({ name: componentName(el), controls: controlTexts(el), hidden: allHidden(el) }))
      // known widgets without controls (fare teaser) still count for "dropped"
      .filter((w) => w.controls.length || (KNOWN[w.name] && KNOWN[w.name].block)));
    if (!found.length) return;
    const plain = path.join(ROOT, 'content', `${pagePath}.plain.html`);
    // paragraphs of the default content only: block cells (div[class]) hold authored settings
    const { paras, blocks } = withDocument(fs.readFileSync(plain, 'utf8'), (doc) => ({
      paras: [...doc.querySelectorAll('p')]
        .filter((p) => !p.closest('div[class]') && !p.querySelector('a, img, picture'))
        .map((p) => norm(p.textContent)),
      blocks: [...new Set([...doc.querySelectorAll('div[class]')].map((d) => d.classList[0]))],
    }));
    out[pagePath] = found.map((w) => ({
      name: w.name,
      dead: paras.filter((t) => isDead(t, w.controls)),
      hidden: w.hidden,
      hasBlock: !!(KNOWN[w.name] && KNOWN[w.name].block && blocks.includes(KNOWN[w.name].block)),
    }));
  });
  return out;
}

if (argv.includes('--worker')) {
  // child mode: file list on stdin, result as JSON on stdout
  process.stdout.write(JSON.stringify(scan(JSON.parse(fs.readFileSync(0, 'utf8')))));
  process.exit(0);
}

const t0 = Date.now();
const files = walk(SNAP).filter((file) => {
  const pagePath = `/${path.relative(SNAP, file).replace(/\.html$/, '')}`;
  if (SKIP_PATH.test(pagePath)) return false;
  if (!fs.existsSync(path.join(ROOT, 'content', `${pagePath}.plain.html`))) return false;
  return /data-dcep=|<form[\s>]|<(feedback-questionnaire|culinary-hub|passenger-receipt-portal|ppfi-web-component)[\s>]/
    .test(fs.readFileSync(file, 'utf8'));
});
// jsdom keeps memory of closed windows; a fresh process per chunk keeps the heap small
const CHUNK = 60;
const scanned = {};
for (let i = 0; i < files.length; i += CHUNK) {
  const res = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--worker'], {
    input: JSON.stringify(files.slice(i, i + CHUNK)),
    env: process.env,
    maxBuffer: 64 * 1024 * 1024,
    encoding: 'utf8',
  });
  if (res.status !== 0) {
    console.error(res.stderr);
    process.exit(1);
  }
  Object.assign(scanned, JSON.parse(res.stdout));
}

const pages = Object.keys(scanned).length;
/** Widgets of one name on one page are merged (two POI maps on first-class are one row). */
const merged = Object.entries(scanned).flatMap(([page, list]) => {
  const byWidget = {};
  list.forEach((w) => {
    const m = byWidget[w.name] || (byWidget[w.name] = {
      page, name: w.name, dead: [], hasBlock: w.hasBlock, hidden: true,
    });
    m.hidden = m.hidden && w.hidden;
    m.dead.push(...w.dead.filter((t) => !m.dead.includes(t)));
  });
  return Object.values(byWidget);
});
const byPage = (a, b) => a.name.localeCompare(b.name) || a.page.localeCompare(b.page);
/** Dead label text: at least MIN_DEAD different dead paragraphs of the widget. */
const hits = merged.filter((w) => w.dead.length >= MIN_DEAD).sort(byPage);
/** Known widget without its block and without dead text: dropped from the import. */
const dropped = merged.filter((w) => w.dead.length < MIN_DEAD
  && KNOWN[w.name] && KNOWN[w.name].block && !w.hasBlock && !w.hidden).sort(byPage);
const group = (list) => {
  const by = {};
  list.forEach((h) => { (by[h.name] ||= []).push(h); });
  return Object.entries(by).sort((a, b) => b[1].length - a[1].length);
};
const rows = group(hits);
const short = (t) => `"${(t.length > 70 ? `${t.slice(0, 67)}...` : t).replace(/\|/g, '/')}"`;
const md = [
  '# Unmapped widgets',
  '',
  `Live widgets whose form labels, button texts, loader texts or map attributions were imported as plain paragraphs of the default content (generated by tools/parity/unmapped-widgets.mjs on ${new Date().toISOString().slice(0, 10)} from the raw snapshots and content/**/*.plain.html; ${pages} pages with widgets scanned; login/profile app shells and the receipt download form excluded). "Planned" names the work item that maps the widget, or "open" when none does yet.`,
  '',
  '| Component | Pages | Planned | Dead texts (sample) |',
  '| --- | ---: | --- | --- |',
  ...rows.map(([name, list]) => `| \`${name}\` | ${list.length} | ${planned(name)} | ${[...new Set(list.flatMap((h) => h.dead))].slice(0, 6).map(short).join(', ')} |`),
  '',
  '### Per page',
  '',
  '| Page | Component | Dead texts (sample) | Planned |',
  '| --- | --- | --- | --- |',
  ...hits.map((h) => `| ${h.page} | \`${h.name}\` | ${h.dead.slice(0, 4).map(short).join(', ')} | ${planned(h.name)} |`),
  '',
  '### Dropped widgets',
  '',
  'Known widgets on the live page whose block is missing from the document and whose texts left no dead paragraphs (the widget is simply absent on the preview). Heuristic: a page with the block for another instance counts as mapped; widgets whose data-dcep hides every part (hide* all true: the homepage quick actions) are not a gap and not listed.',
  '',
  '| Component | Pages | Planned | Pages |',
  '| --- | ---: | --- | --- |',
  ...group(dropped).map(([name, list]) => `| \`${name}\` | ${list.length} | ${planned(name)} | ${list.map((h) => h.page).join(', ')} |`),
  '',
];
if (!dropped.length) md.splice(md.length - 3, 3, 'None found.', '');
if (!rows.length) md.splice(4, md.indexOf('### Dropped widgets') - 4, 'None found.', '');
fs.writeFileSync(OUT, md.join('\n'));
console.log(`unmapped-widgets: ${pages} pages with widgets, ${rows.length} components on ${hits.length} page rows, ${dropped.length} dropped -> ${path.relative(ROOT, OUT)} (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
rows.forEach(([name, list]) => console.log(`  ${name}: ${list.length} pages; ${[...new Set(list.flatMap((h) => h.dead))].slice(0, 3).join(' | ')}`));
group(dropped).forEach(([name, list]) => console.log(`  dropped ${name}: ${list.length} pages`));
