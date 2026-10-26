/* eslint-disable no-console, max-len */
/**
 * Generates tools/importer/parsers/article-data.js for the insights importer (the parsers run in
 * the import browser and cannot read files):
 * - AUTHOR_IDS: author name -> www's author id ("Philip Bierig" -> "lh/philip-bierig"). An
 *   article page prints only the author's name; www's ids are not always the name as a slug
 *   ("Jana Zierdt" -> "lh/jana-zierst", "Hauke Hückstädt" -> "lh/hauke-hueckstaedt"), so they
 *   come from the article lists www sends: the related articles of every article snapshot
 *   (data-dcep relatedArticlesData), the author pages' list configuration (authorId, base64) with
 *   the page's name, and www's list answers when they are exported
 *   (tools/source-export/articles/api/articleblog-<cc>-<ll>.json, any shape with articles that
 *   have author and authorId). The parser falls back to a slug of the name.
 * - AUTHOR_CARD_IMAGES: author page path -> the square image www's author slider shows for the
 *   author (the author page itself only has its banner).
 * Pages: the Bright Data snapshots and the unpacked article export
 * (tools/source-export/articles-unpacked/pages, serve-export.mjs --unpack --out).
 *
 * Also generates tools/importer/parsers/poi-data.js for the poi-map parser: POI_POINTS, the map's
 * JCR path (the decoded data-dcep id) -> its points [title, lat, lng, link, linkLabel], from
 * www's pointsOfInterest answers recorded with the export (tools/source-export/articles/poi/*.ndjson,
 * every page with a map in the four locales).
 *
 * Usage: node tools/importer/build-article-data.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(dir, '../..');
const SNAPSHOTS = path.join(dir, 'bd-snapshots/www.lufthansa.com');
const EXPORT_API = path.join(root, 'tools/source-export/articles/api');
const EXPORT_PAGES = path.join(root, 'tools/source-export/articles-unpacked/pages');
const EXPORT_POI = path.join(root, 'tools/source-export/articles/poi');
const OUT = path.join(dir, 'parsers/article-data.js');
const POI_OUT = path.join(dir, 'parsers/poi-data.js');

const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&amp;/g, '&');
const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();

const walk = (d) => (fs.existsSync(d) ? fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(d, e.name);
  return e.isDirectory() ? walk(p) : [p];
}) : []);

const ids = {};
const conflicts = [];
const addId = (name, id, from) => {
  const n = clean(name);
  if (!n || !id) return;
  if (ids[n] && ids[n] !== id) conflicts.push(`${n}: ${ids[n]} / ${id} (${from})`);
  else ids[n] = id;
};
const cardImages = {};

const pageFiles = [EXPORT_PAGES, SNAPSHOTS].flatMap((base) => walk(base)
  .filter((f) => /\/[a-z]{2}\/[a-z]{2}\/articles\//.test(f) && f.endsWith('.html')).map((f) => [base, f]));
pageFiles.forEach(([base, file]) => {
  const html = fs.readFileSync(file, 'utf8');
  const page = file.slice(base.length).replace(/\.html$/, '');
  [...html.matchAll(/class="dcep-related-articles[^"]*"[^>]*?data-dcep="([^"]*)"/g)].forEach((m) => {
    try {
      JSON.parse(decode(m[1])).relatedArticlesData.forEach((a) => addId(a.author, a.authorId, page));
    } catch (e) { /* not JSON */ }
  });
  [...html.matchAll(/class="dcep-blog-overview"[^>]*?data-dcep="([^"]*)"/g)].forEach((m) => {
    try {
      const cfg = JSON.parse(decode(m[1]));
      const h1 = html.match(/class="author-content"[\s\S]*?<h1[^>]*>([\s\S]*?)<\/h1>/);
      if (cfg.authorId && h1) addId(h1[1].replace(/<[^>]+>/g, ''), Buffer.from(cfg.authorId, 'base64').toString('utf8'), page);
    } catch (e) { /* not JSON */ }
  });
  // author slider cards: <a href=".../articles/authors/<slug>" class="author-slider-link"> ... <img src="...">
  [...html.matchAll(/<a href="(?:https:\/\/www\.lufthansa\.com)?(\/[a-z]{2}\/[a-z]{2}\/articles\/authors\/[^"]+)" class="author-slider-link"[\s\S]*?<img[^>]*?src="([^"]+)"/g)]
    .forEach(([, author, src]) => { if (!cardImages[author]) cardImages[author] = src; });
});

// www's list answers (export): every object with author + authorId; an article's own values by
// its path: author id (one name can have several ids: "Interview: Marcus Müntefering",
// "Dr.Bohl"), category (not always the path segment: the 21 articles under
// /articles/highlights-european-championship/ and one under /articles/explore-the-world/ are
// "highlights"; "-em" dropped as scripts/articles.js does) and post date with its time (www
// orders its lists by it; at/de prints "Jänner")
const articleMeta = {};
const visit = (v) => {
  if (Array.isArray(v)) v.forEach(visit);
  else if (v && typeof v === 'object') {
    if (typeof v.author === 'string' && typeof v.authorId === 'string') addId(v.author, v.authorId, 'export');
    if (typeof v.targetUrl === 'string' && 'category' in v && Array.isArray(v.tags)) {
      try {
        articleMeta[new URL(v.targetUrl).pathname] = {
          authorId: v.authorId || '',
          category: String(v.category || '').replace(/-em$/, ''),
          // the full time: www orders its lists by it (dates shown in UTC, as www does)
          date: String(v.postDate || ''),
        };
      } catch (e) { /* no URL */ }
    }
    Object.values(v).forEach(visit);
  }
};
walk(EXPORT_API).filter((f) => /articleblog.*\.json$/.test(f)).forEach((f) => {
  try { visit(JSON.parse(fs.readFileSync(f, 'utf8'))); } catch (e) { console.warn(`unreadable: ${f}`); }
});

const sorted = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => a.localeCompare(b)));
fs.writeFileSync(OUT, `/* eslint-disable */
// Generated by tools/importer/build-article-data.mjs; do not edit by hand.
// Author name -> www's author id (the article page prints the name only).
export const AUTHOR_IDS = ${JSON.stringify(sorted(ids), null, 2)};

// Author page -> the square image of www's author slider.
export const AUTHOR_CARD_IMAGES = ${JSON.stringify(sorted(cardImages), null, 2)};

// Article page -> www's values in its list answer: author id, category, post date.
export const ARTICLE_META = ${JSON.stringify(sorted(articleMeta)).replace(/\},"/g, '},\n"')};
`);
// map points: JCR path -> [title, lat, lng, link, linkLabel]
const points = {};
walk(EXPORT_POI).filter((f) => f.endsWith('.ndjson')).forEach((f) => fs.readFileSync(f, 'utf8').split('\n').filter(Boolean).forEach((line) => {
  const r = JSON.parse(line);
  if (r.status !== 200) return;
  const id = decodeURIComponent(r.url.split('/').pop());
  const jcr = Buffer.from(id, 'base64').toString('utf8');
  const list = (JSON.parse(r.text).pointsOfInterest || []).map((x) => [clean(x.title), x.lat, x.lng, clean(x.link), clean(x.linkLabel)]);
  points[jcr] = list;
}));
fs.writeFileSync(POI_OUT, `/* eslint-disable */
// Generated by tools/importer/build-article-data.mjs; do not edit by hand.
// Map (JCR path of the poimapping component) -> its points: [title, lat, lng, link, linkLabel].
export const POI_POINTS = ${JSON.stringify(sorted(points)).replace(/\],"/g, '],\n"')};
`);
console.log(`poi-data: ${Object.keys(points).length} maps, ${Object.values(points).reduce((n, l) => n + l.length, 0)} points`);
console.log(`article-data: ${Object.keys(ids).length} author ids, ${Object.keys(articleMeta).length} articles in www's lists, ${Object.keys(cardImages).length} author images${conflicts.length ? `; conflicts (first kept): ${conflicts.join('; ')}` : ''}`);
