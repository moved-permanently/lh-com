/* eslint-disable no-console, max-len, import/extensions, import/no-extraneous-dependencies -- tooling */
/**
 * Compares imported Lufthansa Cargo documents (content-sites/lh-cargo/content/<path>.plain.html)
 * with their source snapshots (delivery/snapshots/www.lufthansa-cargo.com/<source>.html):
 * - text: every visible text block of the source (headings, paragraphs, list items, table cells)
 *   that is not in the document's text;
 * - images: the source's content images (no carousel clones, sprites, consent overlays) against
 *   the document's images, by file;
 * - links: the source's link targets against the document's, after the import's mapping
 *   (cargo-import.mjs Page.href), and the document's links that the source doesn't have.
 * Writes content-sites/lh-cargo/runs/<name>-check.json and prints a summary per page.
 *
 * Usage: node tools/importer/cargo-check.mjs --name batch-1 /en/home /en/speed-flash ...
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { Page, isSkipped, loadSite } from './cargo-import.mjs';
import { fileKey } from './cargo-assets.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const W = path.join(root, 'content-sites/lh-cargo');
const SNAPS = [path.join(W, 'snapshots/www.lufthansa-cargo.com'), path.join(W, 'delivery/snapshots/www.lufthansa-cargo.com')];
const argv = process.argv.slice(2);
const name = argv.includes('--name') ? argv[argv.indexOf('--name') + 1] : 'check';
// --pages <file>: the sources of a batch (URLs or paths, one per line); else the paths given
const pagesFile = argv.includes('--pages') ? argv[argv.indexOf('--pages') + 1] : null;
const sources = pagesFile
  ? fs.readFileSync(pagesFile, 'utf8').split(/\r?\n/).filter(Boolean).map((u) => new URL(u.trim(), 'https://www.lufthansa-cargo.com/').pathname.replace(/\/+$/, ''))
  : argv.filter((a, i) => a.startsWith('/') && !['--name', '--pages'].includes(argv[i - 1]));
const norm = (s) => (s || '').replace(/[\s\u200b\u00a0]+/g, ' ').replace(/[\u2010-\u2015]/g, '-').trim().toLowerCase();

const visible = (n, stop) => {
  for (let a = n; a && a !== stop; a = a.parentElement) if (isSkipped(a)) return false;
  return true;
};

function sourceParts(html, source, lang) {
  const { document } = parseHTML(html);
  const content = document.querySelector('#content.pagebody') || document.querySelector('#main-content');
  const page = new Page(source, lang, html);
  const texts = [...content.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, td, th, blockquote')]
    .filter((n) => visible(n, content) && !n.querySelector('p, li, h1, h2, h3, h4, h5, h6, td'))
    .map((n) => norm(n.textContent)).filter((t) => t.length > 2);
  const images = [...new Set([...content.querySelectorAll('img')].filter((i) => visible(i, content))
    .map((i) => fileKey(i.getAttribute('src'))).filter((k) => k && !/sprite/i.test(k)))];
  const links = [...new Set([...content.querySelectorAll('a[href]')].filter((a) => visible(a, content))
    .map((a) => page.href(a.getAttribute('href'))).filter(Boolean))];
  return { texts: [...new Set(texts)], images, links };
}

function docParts(html) {
  const { document } = parseHTML(`<main>${html}</main>`);
  const main = document.querySelector('main');
  main.querySelectorAll('.metadata, .section-metadata').forEach((m) => m.remove());
  const { files } = loadSite();
  const byEds = {};
  Object.entries(files).forEach(([k, f]) => { if (f.eds) byEds[f.eds.replace(/\.[a-z0-9]+$/, '')] = k; });
  const images = [...main.querySelectorAll('img')].map((i) => {
    const src = i.getAttribute('src');
    if (src.startsWith('/media-da/')) return byEds[src.replace(/\.[a-z0-9]+$/, '')] || src;
    return fileKey(src) || src;
  });
  return {
    text: norm(main.textContent), images: [...new Set(images)], links: [...new Set([...main.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')))],
  };
}

const { paths } = loadSite();
const report = {};
sources.forEach((source) => {
  const eds = paths[source];
  const snap = SNAPS.map((d) => path.join(d, `${source}.html`)).find((f) => fs.existsSync(f));
  if (!eds || !snap || !fs.existsSync(path.join(W, 'content', `${eds}.plain.html`))) return;
  const html = fs.readFileSync(snap, 'utf8');
  const doc = docParts(fs.readFileSync(path.join(W, 'content', `${eds}.plain.html`), 'utf8'));
  const src = sourceParts(html, source, source.slice(1, 3));
  const r = {
    eds,
    text: { source: src.texts.length, missing: src.texts.filter((t) => !doc.text.includes(t)) },
    images: {
      source: src.images.length, document: doc.images.length, missing: src.images.filter((i) => !doc.images.includes(i)), extra: doc.images.filter((i) => !src.images.includes(i)),
    },
    links: {
      source: src.links.length, document: doc.links.length, missing: src.links.filter((l) => !doc.links.includes(l)), extra: doc.links.filter((l) => !src.links.includes(l)),
    },
  };
  report[source] = r;
  console.log(`${source} -> ${eds}: text ${r.text.source - r.text.missing.length}/${r.text.source} blocks, images ${r.images.source - r.images.missing.length}/${r.images.source} (+${r.images.extra.length}), links ${r.links.source - r.links.missing.length}/${r.links.source} (+${r.links.extra.length})`);
});
fs.writeFileSync(path.join(W, 'runs', `${name}-check.json`), `${JSON.stringify(report, null, 1)}\n`);
