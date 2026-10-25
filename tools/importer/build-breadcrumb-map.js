/* eslint-disable no-console */
/**
 * Breadcrumb trails of pages that show none themselves (homepages, hub pages such as
 * /de/en/additional-services or /de/en/first-class) but are parents of pages that do: their
 * label and parents are only known from their children's live breadcrumbs. Reads every snapshot
 * in tools/importer/bd-snapshots/www.lufthansa.com (not /lhg/: the AirCore pages left the
 * replica on 2026-10-25) and inlines
 *   path -> [[label, href], ...]   (root first, the page itself last)
 * into tools/importer/transformers/lufthansa-cleanup.js (BEGIN/END BREADCRUMB_MAP), which writes
 * them as page metadata (Parent, Breadcrumb title, Breadcrumb: hidden) when such a page is
 * imported. Rerun after new captures, then rebuild the bundles.
 *
 * Usage: node tools/importer/build-breadcrumb-map.js
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');
const SNAP = path.join(__dirname, 'bd-snapshots/www.lufthansa.com');
const CLEANUP = path.join(__dirname, 'transformers/lufthansa-cleanup.js');

const text = (html) => html.replace(/<[^>]+>/g, ' ')
  .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&#39;|&apos;/g, "'")
  .replace(/&quot;/g, '"')
  .replace(/[\u200B\uFEFF]/g, '')
  .replace(/\s+/g, ' ')
  .trim();
const attr = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? m[1] : null;
};

/** Same idea as normalizePath() in lufthansa-cleanup.js: path without .html and trailing slash. */
function normalize(href, base) {
  let u;
  try { u = new URL(href, `https://www.lufthansa.com${base}`); } catch (e) { return null; }
  if (!/(^|\.)lufthansa\.com$/.test(u.hostname)) return u.href;
  let p = u.pathname;
  try { p = decodeURI(p); } catch (e) { /* keep */ }
  return p.replace(/\.html$/, '').replace(/\/+$/, '') || '/';
}

/** [{label, path}] of a snapshot (maui-breadcrumb). */
function trailOf(html, pagePath) {
  const items = [...html.matchAll(/<maui-breadcrumb-item([^>]*)>([\s\S]*?)<\/maui-breadcrumb-item>/g)]
    .map((m) => ({ label: text(m[2]) || attr(m[1], 'label') || '', href: attr(m[1], 'href') }));
  return items.filter((i) => i.label)
    .map((i) => ({ label: i.label, path: i.href ? normalize(i.href, pagePath) : null }));
}

function walk(dir, out = []) {
  fs.readdirSync(dir, { withFileTypes: true }).forEach((d) => {
    const f = path.join(dir, d.name);
    if (d.isDirectory()) {
      if (f !== path.join(SNAP, 'lhg')) walk(f, out);
    } else if (d.name.endsWith('.html')) out.push(f);
  });
  return out;
}

const trails = {};
walk(SNAP).forEach((f) => {
  const pagePath = f.slice(SNAP.length).replace(/\.html$/, '');
  const t = trailOf(fs.readFileSync(f, 'utf8'), pagePath);
  if (t.length) trails[pagePath] = t;
});

const map = {};
Object.values(trails).forEach((t) => {
  t.slice(0, -1).forEach((crumb, i) => {
    const p = crumb.path;
    if (!p || !p.startsWith('/') || trails[p] || map[p]) return;
    map[p] = t.slice(0, i + 1).map((c) => [c.label, c.path]);
  });
});
const sorted = Object.fromEntries(Object.keys(map).sort().map((k) => [k, map[k]]));

const src = fs.readFileSync(CLEANUP, 'utf8');
const block = `// BEGIN BREADCRUMB_MAP\nconst BREADCRUMB_MAP = ${JSON.stringify(sorted)};\n// END BREADCRUMB_MAP`;
const next = src.replace(/\/\/ BEGIN BREADCRUMB_MAP[\s\S]*?\/\/ END BREADCRUMB_MAP/, () => block);
if (next === src && !src.includes(block)) {
  console.error(`${path.relative(root, CLEANUP)}: BREADCRUMB_MAP markers not found`);
  process.exitCode = 1;
} else {
  fs.writeFileSync(CLEANUP, next);
  console.log(`breadcrumb map: ${Object.keys(trails).length} snapshots with a trail, ${Object.keys(sorted).length} parents without their own trail inlined`);
}
