/* eslint-disable no-console */
/**
 * The article and author indexes of a locale as helix-query.yaml builds them (articles-<cc>-<ll>,
 * article-authors-<cc>-<ll>), computed from the local documents (content/<cc>/<ll>/articles/...
 * .plain.html, their Metadata block). For tests and the diff before the indexes exist on the
 * site (they fill on publish); the image fields hold the documents' image URLs, not media URLs.
 *
 * Usage: node tools/importer/build-article-index.mjs [--out <dir>]
 *   writes <dir>/<cc>/<ll>/articles/query-index.json and .../articles/authors/query-index.json
 *   (default: prints the row counts only)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const LOCALES = ['de/en', 'de/de', 'at/de', 'gb/en'];

const decode = (s) => s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"')
  .replace(/&#39;/g, "'")
  .replace(/&nbsp;/g, ' ');
const text = (html) => decode(String(html || '').replace(/<[^>]+>/g, '')).replace(/\s+/g, ' ').trim();

/** The Metadata block of a document: lower-case key -> {text, img}. */
export function readMetadata(html) {
  const meta = {};
  const block = html.match(/<div class="metadata">([\s\S]*?)<\/div>\s*<\/div>\s*(?:<\/div>\s*)?$/m)
    || html.match(/<div class="metadata">([\s\S]*)/);
  if (!block) return meta;
  [...block[1].matchAll(/<div><div>([\s\S]*?)<\/div><div>([\s\S]*?)<\/div><\/div>/g)].forEach(([, k, v]) => {
    const img = v.match(/<img[^>]*src="([^"]*)"/);
    meta[text(k).toLowerCase()] = { text: text(v), img: img ? decode(img[1]) : '' };
  });
  return meta;
}

const walk = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(d, e.name);
  return e.isDirectory() ? walk(p) : [p];
}) : []);

const EXCLUDED = /\/articles\/(tags|authors|config)\/|\/articles\/highlights\/all-it-takes-is-a-yes$/;

/** Rows of the article index of a locale (all included paths, as the site's index). */
export function articleRows(locale, contentDir = path.join(root, 'content')) {
  const base = path.join(contentDir, locale, 'articles');
  return walk(base).filter((f) => f.endsWith('.plain.html'))
    .map((f) => ({ f, p: `/${locale}/articles/${path.relative(base, f).replace(/\.plain\.html$/, '')}` }))
    .filter(({ p }) => p.split('/').length === 6 && !EXCLUDED.test(p))
    .map(({ f, p }) => {
      const html = fs.readFileSync(f, 'utf8');
      const m = readMetadata(html);
      const v = (k) => (m[k] ? m[k].text : '');
      const header = html.match(/<div class="article-header">[\s\S]*?<h1[^>]*>([\s\S]*?)<\/h1>(?:<p>([\s\S]*?)<\/p>)?/);
      return {
        path: p,
        title: header ? text(header[1]) : '',
        description: header && header[2] ? text(header[2]) : '',
        image: m['card-image'] ? m['card-image'].img : '',
        'image-alt': v('card-image-alt'),
        'page-type': v('page-type'),
        category: v('category'),
        'tag-ids': v('tag-ids'),
        author: v('author'),
        'author-id': v('author-id'),
        'publication-date': v('publication-date'),
        'reading-time': v('reading-time'),
        keywords: v('keywords'),
        destinations: v('destinations'),
        tags: JSON.stringify(v('tags').split(/\s*,\s*/).filter(Boolean)),
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}

/** Rows of the author index of a locale. */
export function authorRows(locale, contentDir = path.join(root, 'content')) {
  const base = path.join(contentDir, locale, 'articles/authors');
  return walk(base).filter((f) => f.endsWith('.plain.html')).map((f) => {
    const m = readMetadata(fs.readFileSync(f, 'utf8'));
    const v = (k) => (m[k] ? m[k].text : '');
    return {
      path: `/${locale}/articles/authors/${path.basename(f, '.plain.html')}`,
      author: v('author'),
      'author-id': v('author-id'),
      description: v('author-description'),
      image: m['card-image'] ? m['card-image'].img : '',
      'page-type': v('page-type'),
    };
  });
}

/** Overview pages of a locale with their blog-overview options. */
export function overviewPages(locale, contentDir = path.join(root, 'content')) {
  const base = path.join(contentDir, locale, 'articles');
  return walk(base).filter((f) => f.endsWith('.plain.html')).flatMap((f) => {
    const html = fs.readFileSync(f, 'utf8');
    const m = html.match(/<div class="blog-overview">([\s\S]*?)<\/div><\/div><\/div>|<div class="blog-overview">(<\/div>)/);
    if (!m) return [];
    const rows = Object.fromEntries([...(m[1] || '').matchAll(/<div><div>([\s\S]*?)<\/div><div>([\s\S]*?)<\/div>/g)]
      .map(([, k, v]) => [text(k).toLowerCase(), text(v)]));
    return [{
      path: `/${locale}/articles/${path.relative(base, f).replace(/\.plain\.html$/, '')}`.replace(/\/articles\/$/, '/articles'),
      options: {
        category: rows.category || '',
        tag: rows.tag || '',
        author: rows.author || '',
        pageSize: Number(rows['page size']) || 6,
        hideFilter: rows['hide filter'] === 'true',
      },
    }];
  });
}

const sheet = (data) => ({
  total: data.length, offset: 0, limit: data.length, data, ':type': 'sheet',
});

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  const out = argv.includes('--out') ? argv[argv.indexOf('--out') + 1] : '';
  LOCALES.forEach((locale) => {
    const articles = articleRows(locale);
    const authors = authorRows(locale);
    console.log(`${locale}: ${articles.length} index rows (${articles.filter((r) => r['page-type'] === 'article').length} articles), ${authors.length} authors`);
    if (out) {
      const dir = path.join(out, locale, 'articles');
      fs.mkdirSync(path.join(dir, 'authors'), { recursive: true });
      fs.writeFileSync(path.join(dir, 'query-index.json'), JSON.stringify(sheet(articles)));
      fs.writeFileSync(path.join(dir, 'authors/query-index.json'), JSON.stringify(sheet(authors)));
    }
  });
}
