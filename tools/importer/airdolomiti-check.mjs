/* eslint-disable no-console, max-len, import/extensions, import/no-extraneous-dependencies -- tooling */
/**
 * Compares imported Air Dolomiti documents (content-sites/lh-airdolomiti/content/<doc>.plain.html)
 * with their rendered snapshots (snapshots/<host>/<path>.html, the page content #page-content):
 * - text: every visible text block of the source (headings, paragraphs, list items, cells) not in
 *   the document's text;
 * - images: the source's content images (cms.airdolomiti.it uploads) against the document's;
 * - links: the source's link targets (as the import maps them) against the document's.
 * Writes content-sites/lh-airdolomiti/runs/<name>-check.json and prints a line per page.
 *
 * Usage: node tools/importer/airdolomiti-check.mjs --name batch-1 <source URL> ...
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseHTML } from 'linkedom';
import { Page, loadSite } from './airdolomiti-import.mjs';
import { snapshotFile } from './airdolomiti-capture.mjs';
import { langOf, sourceKey, docOf } from './airdolomiti-paths.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const W = path.join(root, 'content-sites/lh-airdolomiti');
const argv = process.argv.slice(2);
const name = argv.includes('--name') ? argv[argv.indexOf('--name') + 1] : 'check';
const urls = argv.filter((a, i) => /^https:\/\//.test(a) && argv[i - 1] !== '--name');
const norm = (s) => (s || '').replace(/[\s\u200b\u00a0]+/g, ' ').replace(/[\u2010-\u2015]/g, '-').replace(/[\u2018\u2019]/g, "'").trim()
  .toLowerCase();
const hidden = (n, stop) => {
  for (let a = n; a && a !== stop; a = a.parentElement) {
    const st = a.getAttribute && (a.getAttribute('style') || '');
    if (/display:\s*none|visibility:\s*hidden/.test(st) || (a.hasAttribute && (a.hasAttribute('hidden') || a.getAttribute('aria-hidden') === 'true'))) return true;
  }
  return false;
};
const imgKey = (src) => (src || '').replace(/[?#].*$/, '').replace(/-\d+x\d+(?=\.[a-z]+$)/i, '');

const { paths, files } = loadSite();
const byEds = {};
Object.entries(files).forEach(([k, f]) => { if (f.eds) byEds[f.eds] = k; });
const report = {};
urls.forEach((url) => {
  const eds = paths[sourceKey(url)];
  const doc = path.join(W, 'content', `${docOf(eds)}.plain.html`);
  const html = fs.readFileSync(snapshotFile(url), 'utf8');
  const { document } = parseHTML(html);
  const content = document.querySelector('#page-content') || document.querySelector('main') || document.body;
  const page = new Page(url, langOf(url), html);
  const texts = [...new Set([...content.querySelectorAll('h1, h2, h3, h4, h5, h6, p, li, td, th')]
    .filter((n) => !hidden(n, content) && !n.closest('form, nav, [role=dialog]') && !n.querySelector('p, li, h1, h2, h3, h4, h5, h6, td'))
    .map((n) => norm(n.textContent)).filter((t) => t.length > 2))];
  const srcImgs = [...new Set([...content.querySelectorAll('img')].map((i) => i.getAttribute('src') || '')
    .map((s) => { try { return new URL(s, 'https://www.airdolomiti.it/').href; } catch (e) { return ''; } })
    .filter((s) => /cms\.airdolomiti\.it\/wp-content\/uploads/.test(s)).map(imgKey))];
  const srcLinks = [...new Set([...content.querySelectorAll('a[href]')].filter((a) => !a.closest('form'))
    .map((a) => page.href(a.getAttribute('href'))).filter(Boolean)
    // a link to an anchor of this very page is the anchor ("/destinazioni/x#cosa-fare" = "#cosa-fare")
    .map((h) => (h.startsWith(`${eds}#`) ? h.slice(eds.length) : h)))];
  const { document: d } = parseHTML(`<main>${fs.readFileSync(doc, 'utf8')}</main>`);
  const main = d.querySelector('main');
  // the byline's reading time (article-header shows the Reading Time metadata) counts as text
  const byline = [...main.querySelectorAll('.metadata > div')].filter((r) => /^reading time$/i.test((r.children[0] || {}).textContent || '')).map((r) => r.children[1].textContent).join(' ');
  main.querySelectorAll('.metadata, .section-metadata').forEach((m) => m.remove());
  const docText = norm(`${main.textContent} ${byline}`);
  const docImgs = [...new Set([...main.querySelectorAll('img')].map((i) => {
    const s = i.getAttribute('src');
    return imgKey(s.startsWith('/media-da/') ? (byEds[s] || s) : s);
  }))];
  const docLinks = [...new Set([...main.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')))];
  const r = {
    eds,
    text: { source: texts.length, missing: texts.filter((t) => !docText.includes(t)) },
    images: {
      source: srcImgs.length, document: docImgs.length, missing: srcImgs.filter((i) => !docImgs.includes(i)), extra: docImgs.filter((i) => !srcImgs.includes(i)),
    },
    links: {
      source: srcLinks.length, document: docLinks.length, missing: srcLinks.filter((l) => !docLinks.includes(l)), extra: docLinks.filter((l) => !srcLinks.includes(l)),
    },
  };
  report[url] = r;
  console.log(`${url} -> ${eds}: text ${r.text.source - r.text.missing.length}/${r.text.source}, images ${r.images.source - r.images.missing.length}/${r.images.source} (+${r.images.extra.length}), links ${r.links.source - r.links.missing.length}/${r.links.source} (+${r.links.extra.length})`);
});
fs.writeFileSync(path.join(W, 'runs', `${name}-check.json`), `${JSON.stringify(report, null, 1)}\n`);
