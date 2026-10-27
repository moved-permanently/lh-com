/* eslint-disable no-console */
/**
 * The site search indexes (helix-query.yaml search-<cc>-<ll>) computed from the local documents
 * (content/<cc>/<ll>/**.plain.html), as the site's index builds them from the rendered pages:
 * title (the Title metadata, as <title>), description (the Description row; without one, Edge
 * Delivery's default: the first paragraph of 10 words or more, its first 25 words), image (the
 * Image row), headings (h1 to h3), content (paragraphs, list items and links alone in a block
 * cell), parent (the Parent row), hide-in-search, lastModified (the file's
 * time). For the diff and the tests before the indexes fill on the site (on publish).
 *
 * Usage: node tools/importer/build-search-index.mjs [--out <dir>]
 *   writes <dir>/<cc>/<ll>/search-index.json (default: prints the row counts)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LIVE_ROOTS } from '../../scripts/locale.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const LOCALES = LIVE_ROOTS;

const decode = (s) => s.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&#x([0-9a-f]+);/gi, (m, x) => String.fromCodePoint(parseInt(x, 16)))
  .replace(/&#(\d+);/g, (m, x) => String.fromCodePoint(Number(x)))
  .replace(/&amp;/g, '&');
const text = (html) => decode(String(html || '').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();
const firstWords = (s, n) => s.split(/\s+/).filter(Boolean).slice(0, n).join(' ');

/** Paths the index config excludes (helix-query.yaml search-<cc>-<ll>). */
export function excluded(locale, p) {
  const rest = p.slice(locale.length + 2);
  return /^(nav|footer)$/.test(rest) || /^(fragments|drafts|articles\/config|support\/search)(\/|$)/.test(rest)
    || /(^|\/)confirmation$/.test(rest) || /-confirmation$/.test(rest);
}

const walk = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(d, e.name);
  return e.isDirectory() ? walk(p) : [p];
}) : []);

/** The index rows of a locale. */
export function searchRows(locale, contentDir = path.join(root, 'content')) {
  const base = path.join(contentDir, locale);
  return walk(base).filter((f) => f.endsWith('.plain.html'))
    .map((f) => ({ f, p: `/${locale}/${path.relative(base, f).replace(/\.plain\.html$/, '')}` }))
    .filter(({ p }) => !excluded(locale, p))
    .map(({ f, p }) => {
      const html = fs.readFileSync(f, 'utf8');
      const metaAt = html.search(/<div class="metadata">/);
      const main = metaAt >= 0 ? html.slice(0, metaAt) : html;
      const meta = {};
      if (metaAt >= 0) {
        [...html.slice(metaAt).matchAll(/<div><div>([\s\S]*?)<\/div><div>([\s\S]*?)<\/div><\/div>/g)].forEach(([, k, v]) => {
          const img = v.match(/<img[^>]*src="([^"]*)"/);
          meta[text(k).toLowerCase()] = { text: text(v), img: img ? decode(img[1]) : '' };
        });
      }
      const paragraphs = [...main.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)].map((m) => text(m[1])).filter(Boolean);
      const items = [...main.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map((m) => text(m[1])).filter(Boolean);
      // links that stand alone in a block cell (main div > a)
      const cellLinks = [...main.matchAll(/<div>\s*<a [^>]*>([\s\S]*?)<\/a>/g)].map((m) => text(m[1])).filter(Boolean);
      const firstLong = paragraphs.find((t) => t.split(/\s+/).length >= 10);
      let description = '';
      if (meta.description) description = meta.description.text;
      else if (firstLong) description = firstWords(firstLong, 25);
      const h1 = main.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
      const image = meta.image && meta.image.img ? meta.image.img.replace(/^https?:\/\/[^/]+/, '') : '';
      return {
        path: p,
        title: (meta.title && meta.title.text) || (h1 && text(h1[1])) || '',
        description,
        image,
        headings: JSON.stringify([...main.matchAll(/<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/g)].map((m) => text(m[1])).filter(Boolean)),
        content: JSON.stringify([...paragraphs, ...items, ...cellLinks]),
        parent: (() => {
          const m = metaAt >= 0 && html.slice(metaAt).match(/<div><div>Parent<\/div><div>[\s\S]*?href="([^"]*)"/);
          return m ? decode(m[1]).replace(/^https?:\/\/[^/]+/, '') : '';
        })(),
        'hide-in-search': meta['hide-in-search'] ? meta['hide-in-search'].text : '',
        lastModified: Math.floor(fs.statSync(f).mtimeMs / 1000),
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}

const sheet = (data) => ({
  total: data.length, offset: 0, limit: data.length, data, ':type': 'sheet',
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  const out = argv.includes('--out') ? argv[argv.indexOf('--out') + 1] : '';
  LOCALES.forEach((locale) => {
    const rows = searchRows(locale);
    const bytes = JSON.stringify(sheet(rows)).length;
    console.log(`${locale}: ${rows.length} rows, ${(bytes / 1024 / 1024).toFixed(1)} MB`);
    if (out) {
      fs.mkdirSync(path.join(out, locale), { recursive: true });
      fs.writeFileSync(path.join(out, locale, 'search-index.json'), JSON.stringify(sheet(rows)));
    }
  });
}
