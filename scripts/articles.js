/**
 * Lufthansa Insights article lists: the article and author query indexes of a locale
 * (helix-query.yaml: articles-<cc>-<ll>, article-authors-<cc>-<ll>) and the tag priority sheet.
 * Read by blog-overview, related-articles and the author slider (carousel-cards authors).
 * Every index is fetched with { cache: 'no-cache' } (a publish shows at once) and once per page.
 */

/**
 * Local dev server (aem up --html-folder content) serves the documents under a folder prefix
 * (/content/de/en/...); the indexes are fetched under the same prefix.
 */
function devPrefix() {
  if (!/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)) return '';
  const m = window.location.pathname.match(/^((?:\/[^/]+)*?)(?=\/[a-z]{2}\/[a-z]{2}(?:\/|$))/);
  return m ? m[1] : '';
}

/** Path of the current page without the dev prefix, .html and trailing slash. */
export function currentPath() {
  const prefix = devPrefix();
  const { pathname } = window.location;
  const p = prefix && pathname.startsWith(`${prefix}/`) ? pathname.slice(prefix.length) : pathname;
  return p.replace(/\.html$/, '').replace(/\/+$/, '') || '/';
}

const PAGE = 500;
const sheets = {};

/** All rows of a sheet (query index or spreadsheet), page by page. */
export async function loadSheet(url) {
  if (!sheets[url]) {
    sheets[url] = (async () => {
      const rows = [];
      for (let offset = 0; offset < 100000; offset += PAGE) {
        // eslint-disable-next-line no-await-in-loop
        const resp = await fetch(`${devPrefix()}${url}?offset=${offset}&limit=${PAGE}`, { cache: 'no-cache' });
        if (!resp.ok) throw new Error(`${url}: HTTP ${resp.status}`);
        // eslint-disable-next-line no-await-in-loop
        const json = await resp.json();
        const data = Array.isArray(json.data) ? json.data : [];
        rows.push(...data);
        if (data.length < PAGE || rows.length >= (json.total ?? 0)) break;
      }
      return rows;
    })();
    sheets[url].catch(() => { delete sheets[url]; });
  }
  return sheets[url];
}

/** A list field of the index: a JSON array ("values" properties) or a comma list. */
export function listOf(value) {
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  const text = String(value ?? '').trim();
  if (!text) return [];
  if (text.startsWith('[')) {
    try {
      return JSON.parse(text).map((v) => String(v).trim()).filter(Boolean);
    } catch (e) { /* not JSON */ }
  }
  return text.split(/\s*,\s*/).filter(Boolean);
}

/** "2026-08-20" (or a timestamp) -> ms, NaN without a date. */
export function dateValue(value) {
  const text = String(value ?? '').trim();
  if (!text || text === '0') return NaN;
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return Date.parse(`${text}T00:00:00Z`);
  if (/^\d+$/.test(text)) {
    const n = Number(text);
    return n > 1e11 ? n : n * 1000;
  }
  return Date.parse(text);
}

/** Newest first; articles without a date last (then by title). */
export function byDate(a, b) {
  const da = Number.isNaN(a.time) ? -Infinity : a.time;
  const db = Number.isNaN(b.time) ? -Infinity : b.time;
  if (db !== da) return db - da;
  return a.title.localeCompare(b.title);
}

/** The www category id of a category (the path segment): "highlights" is also "highlights-em". */
export const normalizeCategory = (value) => String(value || '').trim().toLowerCase().replace(/-em$/, '');

/** Tag ids as www writes them: "articles:munich" ("munich" alone is accepted). */
export const normalizeTag = (value) => {
  const v = String(value || '').trim().toLowerCase();
  return !v || v.includes(':') ? v : `articles:${v}`;
};

export function toArticle(row) {
  const tags = listOf(row.tags);
  const tagIds = listOf(row['tag-ids']).map(normalizeTag);
  return {
    path: row.path,
    title: String(row.title || '').trim() || row.path,
    description: String(row.description || '').trim(),
    image: String(row.image || '').trim(),
    imageAlt: String(row['image-alt'] || '').trim(),
    category: normalizeCategory(row.category),
    categoryName: String(row.category || '').trim(),
    tags,
    tagIds,
    author: String(row.author || '').trim(),
    authorId: String(row['author-id'] || '').trim(),
    date: String(row['publication-date'] || '').trim(),
    time: dateValue(row['publication-date']),
    readingTime: String(row['reading-time'] || '').trim(),
    keywords: String(row.keywords || '').trim(),
    destinations: listOf(row.destinations),
  };
}

/**
 * The articles of a locale (page-type "article" only), newest first. With a brand that has an
 * index of its own for the locale's language (scripts/brands.js articleIndex: Air Dolomiti's
 * /articoli/query-index.json), that index's rows, every one a post.
 * @param {{key: string, lang?: string}} locale
 * @param {Object} [brand] the page's brand entry (scripts/locale.js brandEntry)
 * @returns {Promise<Object[]>}
 */
export async function loadArticles(locale, brand = null) {
  const own = brand && brand.articleIndex && brand.articleIndex[locale.lang];
  if (own) return (await loadSheet(own)).filter((r) => r.path).map(toArticle).sort(byDate);
  const rows = await loadSheet(`/${locale.key}/articles/query-index.json`);
  return rows.filter((r) => String(r['page-type'] || '').trim() === 'article' && r.path)
    .map(toArticle).sort(byDate);
}

/**
 * The author pages of a locale.
 * @returns {Promise<Array<{path, name, authorId, description, image}>>}
 */
export async function loadAuthors(locale) {
  const rows = await loadSheet(`/${locale.key}/articles/authors/query-index.json`);
  return rows.filter((r) => r.path && String(r['page-type'] || 'author').trim() === 'author').map((r) => ({
    path: r.path,
    name: String(r.author || r.title || '').trim(),
    authorId: String(r['author-id'] || '').trim(),
    description: String(r.description || '').trim(),
    image: String(r.image || '').trim(),
  }));
}

/**
 * Priority tags of a locale from the sheet /articles/config/tag-priority (columns locale,
 * priority-1, priority-2: comma lists of tag ids). No sheet: no priorities.
 * @returns {Promise<{p1: Set<string>, p2: Set<string>}>}
 */
export async function loadTagPriority(locale) {
  try {
    const rows = await loadSheet('/articles/config/tag-priority.json');
    const row = rows.find((r) => String(r.locale || '').trim() === locale.key) || {};
    return {
      p1: new Set(listOf(row['priority-1']).map(normalizeTag)),
      p2: new Set(listOf(row['priority-2']).map(normalizeTag)),
    };
  } catch (e) {
    return { p1: new Set(), p2: new Set() };
  }
}

const MONTHS = {
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
  de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
};

/**
 * A publication date as www's article lists print it: "21. Oktober 2026" (de), "21. October 2026"
 * (English in a German-speaking market, de/en), "October 21, 2026" (gb/en, and www's English
 * related-article cards and author pages: style "us").
 * @param {string} value ISO date
 * @param {{lang: string, country: string}} locale
 * @param {'market'|'us'} [style]
 */
export function formatArticleDate(value, locale, style = 'market') {
  const time = dateValue(value);
  if (Number.isNaN(time)) return String(value || '').trim();
  const d = new Date(time);
  // a brand site's list (blog-overview): the language's long date ("19 luglio 2023")
  if (style === 'local') {
    return new Intl.DateTimeFormat(locale.lang, {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
    }).format(d);
  }
  const months = MONTHS[locale.lang] || MONTHS.en;
  const day = d.getUTCDate();
  const month = months[d.getUTCMonth()];
  const year = d.getUTCFullYear();
  if (locale.lang === 'en' && (style === 'us' || !['de', 'at', 'ch'].includes(locale.country))) {
    return `${month} ${day}, ${year}`;
  }
  return `${day}. ${month} ${year}`;
}

/**
 * Three related articles from the locale's article index, after the authored ones:
 * two that share tags with the page (more shared priority-1 tags first, then priority-2, then
 * other shared tags, then the newest), and one more of the page's category (the newest not yet
 * shown; www fills its third card at random). Fewer matches: filled with the newest of the
 * category, then the newest of the locale.
 * @param {Object[]} articles index rows (newest first)
 * @param {{tagIds: string[], category: string, exclude: Set<string>}} page
 * @param {{p1: Set<string>, p2: Set<string>}} priority
 * @param {number} count
 */
export function pickRelated(articles, page, priority, count) {
  const pool = articles.filter((a) => !page.exclude.has(a.path));
  const own = new Set(page.tagIds);
  const score = (a) => {
    const shared = a.tagIds.filter((t) => own.has(t));
    return [shared.filter((t) => priority.p1.has(t)).length,
      shared.filter((t) => priority.p2.has(t)).length, shared.length];
  };
  const picks = [];
  const take = (list, n) => list.filter((a) => !picks.includes(a)).slice(0, n)
    .forEach((a) => picks.push(a));
  const tagged = pool.map((a, i) => ({ a, s: score(a), i })).filter((x) => x.s[2] > 0)
    .sort((x, y) => y.s[0] - x.s[0] || y.s[1] - x.s[1] || y.s[2] - x.s[2] || x.i - y.i)
    .map((x) => x.a);
  take(tagged, Math.min(2, count));
  const sameCategory = pool.filter((a) => page.category && a.category === page.category);
  take(sameCategory, count - picks.length);
  take(tagged, count - picks.length);
  take(pool, count - picks.length);
  return picks;
}
