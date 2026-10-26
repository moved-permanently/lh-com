/* eslint-disable no-console, max-len */
/**
 * Post-import step: page metadata from the live <head> (Ben's head parity rules, 2026-10-24).
 * Idempotent; run after an import and before postprocess-media.mjs (which may resize the share
 * image) and the DA upload.
 *
 * For every scope page (tools/migration-scope/pages.csv, tools/migration-scope/local-pages.csv)
 * with a snapshot (the unpacked article export, tools/source-export/articles-unpacked/pages{path}.html,
 * else tools/importer/bd-snapshots/www.lufthansa.com{path}.html) it rewrites rows of
 * the page's Metadata block in content{path}.plain.html:
 * - Description: the live description; an empty row where live has none (EDS would otherwise
 *   make one from the first paragraph). The empty row renders description, og:description and
 *   twitter:description with content="".
 * - og:description: only where live's og:description differs from its description.
 * - og:title: only where live's og:title differs from its title (else the row is removed).
 * - Keywords: the live keywords, where live has them.
 * - Robots: the live value only when it contains "noindex" (page metadata overrides the
 *   site-wide /metadata.json row; the live default "index,follow,NOODP" is never copied; other
 *   values, e.g. "index, follow", are reported, not set). The same value as `page-robots`: the
 *   page's own robots value, which the site-wide row (noindex on every page until go-live) does
 *   not set; the locale query indexes read it as their `robots` column for the sitemaps.
 * - Canonical: the live canonical, only where it points to another URL than the page itself.
 * - Image: the live og:image (EDS sets og:image and twitter:image from it), unless the row
 *   already holds that image (or its local resized copy, media-manifest.json). An og:image www
 *   does not find (404 in media-manifest.json, after postprocess-media.mjs) is not copied: the
 *   page keeps (or gets back) its card-image.
 * - nav, footer: on market-only pages of a market without nav and footer in the replica (us/en),
 *   those of the locale with the same language (/de/en/nav, /de/en/footer).
 * - primary-language-url: on the de/de and at/de pages whose slug differs from de/en in
 *   pages.csv, the de/en path of the same row.
 * No hreflang rows are written (live has no hreflang links in the head of these pages).
 * (The json-ld rows of the AirCore route pages went with the /lhg/ pages on 2026-10-25.)
 *
 * Usage: node tools/importer/head-metadata.mjs [--path /de/en/homepage ...] [--dry]
 *   prints one line per changed page and a summary; --report writes the gap table
 *   (tools/reports/head-metadata.md, .json) from the state before the change.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const argv = process.argv.slice(2);
const only = argv.flatMap((a, i) => (a === '--path' ? [argv[i + 1]] : []));
const dry = argv.includes('--dry');
const report = argv.includes('--report');
const DEFAULT_ROBOTS = 'index,follow,NOODP';
const LIVE = 'https://www.lufthansa.com';

const csvPaths = (file) => fs.readFileSync(path.join(root, file), 'utf8').trim().split('\n').slice(1)
  .flatMap((l) => l.split(',').slice(1).map((p) => p.trim()).filter((p) => p.startsWith('/')));
const scope = [...new Set([
  ...csvPaths('tools/migration-scope/pages.csv'),
  // market-only pages: path,locale,kind (the AirCore pages, /lhg/, left the scope on 2026-10-25)
  ...fs.readFileSync(path.join(root, 'tools/migration-scope/local-pages.csv'), 'utf8').trim().split('\n')
    .slice(1)
    .map((l) => l.split(',')[0].trim())
    .filter((p) => p.startsWith('/')),
])];

const decode = (s) => s
  .replace(/&#x([0-9a-f]+);/gi, (m, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (m, d) => String.fromCodePoint(Number(d)))
  .replace(/&nbsp;/g, ' ')
  .replace(/&quot;/g, '"')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&amp;/g, '&');
const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

/** The live head values of a snapshot. */
function liveHead(html) {
  const end = html.indexOf('</head>');
  const h = html.slice(0, end > 0 ? end : 200000);
  const tags = [...h.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]);
  const meta = (attr, name) => {
    const t = tags.find((x) => x.toLowerCase().includes(`${attr}="${name}"`));
    if (!t) return undefined;
    const c = t.match(/content="([^"]*)"/i);
    return c ? decode(c[1]).trim() : '';
  };
  const canon = h.match(/<link[^>]*rel="canonical"[^>]*>/i);
  const title = h.match(/<title[^>]*>([^<]*)<\/title>/i);
  return {
    title: title ? decode(title[1]).trim() : undefined,
    description: meta('name', 'description'),
    keywords: meta('name', 'keywords'),
    robots: meta('name', 'robots'),
    canonical: canon ? decode((canon[0].match(/href="([^"]*)"/) || [])[1] || '') : undefined,
    'og:title': meta('property', 'og:title'),
    'og:description': meta('property', 'og:description'),
    'og:image': meta('property', 'og:image'),
  };
}

const manifestFile = path.join(root, 'tools/importer/media-manifest.json');
const manifest = fs.existsSync(manifestFile) ? JSON.parse(fs.readFileSync(manifestFile, 'utf8')) : {};
const localToSrc = Object.fromEntries(Object.entries(manifest).flatMap(([src, v]) => [
  v.local, v.converted && v.converted.local].filter(Boolean).map((l) => [l, src])));
const imageKey = (u0) => {
  const u = localToSrc[u0] || u0 || '';
  return u.replace(/^https?:\/\/[^/]+/, '').replace(/\.transform\/[^/]+\/img\.[a-z]+$/, '').replace(/[?#].*$/, '');
};
// primary-language-url: de/de and at/de pages whose slug differs from de/en (pages.csv row) name
// their de/en page
const primaryLanguage = {};
fs.readFileSync(path.join(root, 'tools/migration-scope/pages.csv'), 'utf8').trim().split('\n').slice(1)
  .forEach((l) => {
    const [, deEn, deDe, atDe] = l.split(',').map((s) => (s || '').trim());
    if (!deEn) return;
    const slug = deEn.slice('/de/en'.length);
    if (deDe && deDe.slice('/de/de'.length) !== slug) primaryLanguage[deDe] = deEn;
    if (atDe && atDe.slice('/at/de'.length) !== slug) primaryLanguage[atDe] = deEn;
  });

// market-only pages of a market the replica has no nav or footer for (us/en): the nav and footer
// of the locale with the same language (local-pages.csv locale us/en -> /de/en/nav, /de/en/footer)
const LOCALE_DOCS = { en: 'de/en', de: 'de/de' };
const MIGRATED = ['de/en', 'de/de', 'at/de', 'gb/en'];
const borrowed = {};
fs.readFileSync(path.join(root, 'tools/migration-scope/local-pages.csv'), 'utf8').trim().split('\n').slice(1)
  .forEach((l) => {
    const [p, locale] = l.split(',').map((s) => (s || '').trim());
    if (!p || !locale || MIGRATED.includes(locale)) return;
    const lang = locale.split('/')[1];
    if (LOCALE_DOCS[lang]) borrowed[p] = LOCALE_DOCS[lang];
  });

const ROW = /<div><div>([^<]*)<\/div><div>([\s\S]*?)<\/div><\/div>/g;

/** Rows of the page's Metadata block: [{ key, html }] and the block's position. */
function readMetadata(doc) {
  const start = doc.indexOf('<div class="metadata">');
  if (start < 0) return null;
  // the block ends where its row list ends: "</div></div></div>" closes the last row and block
  let i = start + '<div class="metadata">'.length;
  const rows = [];
  ROW.lastIndex = i;
  for (let m = ROW.exec(doc); m && m.index === i; m = ROW.exec(doc)) {
    rows.push({ key: decode(m[1]).trim(), html: m[2] });
    i = ROW.lastIndex;
  }
  if (doc.slice(i, i + 6) !== '</div>') return null;
  return { start, end: i + 6, rows };
}

const text = (html) => decode(html.replace(/<[^>]+>/g, '')).trim();

function setRow(rows, key, html) {
  const i = rows.findIndex((r) => r.key.toLowerCase() === key.toLowerCase());
  if (html === null) {
    if (i >= 0) rows.splice(i, 1);
    return i >= 0;
  }
  if (i >= 0) {
    if (rows[i].html === html) return false;
    rows[i] = { key: rows[i].key, html };
    return true;
  }
  // after Title / Description / Image, before the importer's own rows (Parent, Breadcrumb ...)
  const after = rows.reduce((last, r, j) => (/^(title|description|image|og:|keywords|robots|canonical)/i.test(r.key) ? j : last), -1);
  rows.splice(after + 1, 0, { key, html });
  return true;
}

const results = []; const robotsListed = []; const brokenShareImages = [];
const pathsToDo = only.length ? only : scope;
pathsToDo.forEach((p) => {
  const snap = ['tools/source-export/articles-unpacked/pages', 'tools/importer/bd-snapshots/www.lufthansa.com']
    .map((d) => path.join(root, d, `${p}.html`)).find((f) => fs.existsSync(f)) || '';
  const file = path.join(root, 'content', `${p}.plain.html`);
  if (!fs.existsSync(snap) || !fs.existsSync(file)) return;
  const live = liveHead(fs.readFileSync(snap, 'utf8'));
  const doc = fs.readFileSync(file, 'utf8');
  const md = readMetadata(doc);
  if (!md) { results.push({ path: p, error: 'no metadata block' }); return; }
  const { rows } = md;
  const get = (k) => { const r = rows.find((x) => x.key.toLowerCase() === k); return r ? text(r.html) : undefined; };
  const changed = [];
  const set = (key, html, what = key) => { if (setRow(rows, key, html)) changed.push(what); };

  const desc = live.description ?? '';
  if (norm(get('description')) !== norm(desc) || get('description') === undefined) set('Description', escape(desc));
  const ogDesc = live['og:description'];
  set('og:description', ogDesc !== undefined && norm(ogDesc) !== norm(desc) ? escape(ogDesc) : null);
  const ogTitle = live['og:title'];
  set('og:title', ogTitle && norm(ogTitle) !== norm(live.title) ? escape(ogTitle) : null);
  set('Keywords', live.keywords ? escape(live.keywords) : null);
  if (live.robots && live.robots !== DEFAULT_ROBOTS) {
    if (/noindex/i.test(live.robots)) {
      set('Robots', escape(live.robots));
      set('page-robots', escape(live.robots));
    } else robotsListed.push({ path: p, robots: live.robots });
  }
  if (!(live.robots && /noindex/i.test(live.robots))) {
    set('Robots', null);
    set('page-robots', null);
  }
  const canonical = live.canonical && live.canonical.replace(/\/$/, '') !== `${LIVE}${p}` ? live.canonical : null;
  set('Canonical', canonical ? `<a href="${escape(canonical)}">${escape(canonical)}</a>` : null);
  if (live['og:image']) {
    const r = rows.find((x) => x.key.toLowerCase() === 'image');
    const src = r && (r.html.match(/<img[^>]*src="([^"]*)"/) || [])[1];
    // www error: an og:image that is not found (postprocess-media.mjs recorded the 404): the
    // page keeps the feature image (card-image), as no share image would show
    const known = manifest[new URL(live['og:image'], `${LIVE}/`).href];
    if (known && known.status === 404) {
      const card = rows.find((x) => x.key.toLowerCase() === 'card-image');
      if (imageKey(src && decode(src)) === imageKey(live['og:image']) && card) set('Image', card.html);
      brokenShareImages.push({ path: p, image: live['og:image'] });
    } else if (imageKey(src && decode(src)) !== imageKey(live['og:image'])) {
      set('Image', `<picture><img src="${escape(live['og:image'])}" alt=""></picture>`);
    }
  }
  set('primary-language-url', primaryLanguage[p] ? escape(primaryLanguage[p]) : null);
  if (borrowed[p]) {
    set('nav', `/${borrowed[p]}/nav`);
    set('footer', `/${borrowed[p]}/footer`);
  }
  if (!changed.length) return;
  results.push({ path: p, changed });
  if (dry) return;
  const block = `<div class="metadata">${rows.map((r) => `<div><div>${escape(r.key)}</div><div>${r.html}</div></div>`).join('')}</div>`;
  fs.writeFileSync(file, doc.slice(0, md.start) + block + doc.slice(md.end));
});

const count = {};
results.forEach((r) => (r.changed || [r.error]).forEach((k) => { count[k] = (count[k] || 0) + 1; }));
results.forEach((r) => console.log(`${r.path}: ${(r.changed || [r.error]).join(', ')}`));
console.log(`head-metadata: ${pathsToDo.length} pages, ${results.filter((r) => r.changed).length} ${dry ? 'would change' : 'changed'} ${JSON.stringify(count)}; robots not copied (no noindex): ${robotsListed.length}; share images not found on www (feature image kept): ${brokenShareImages.length}`);
brokenShareImages.forEach((b) => console.log(`  share image not found: ${b.path} ${b.image}`));
if (report) fs.writeFileSync('/tmp/head/script-result.json', JSON.stringify({ results, robotsListed }, null, 1));
