import { createOptimizedPicture, getMetadata } from '../../scripts/aem.js';
import { getLocale } from '../../scripts/locale.js';
import { cleanText, keepImageSize } from '../../scripts/block-config.js';
import {
  loadArticles, loadTagPriority, listOf, normalizeTag, normalizeCategory, currentPath, pickRelated,
} from '../../scripts/articles.js';
import { isSitePreviewHost } from '../../scripts/brand.js';

const CACHE_KEY = 'lh-related-articles:';
// hosts of this site besides the current origin (links may be authored absolute)
const BREAKPOINTS = [{ media: '(min-width: 600px)', width: '750' }, { width: '600' }];

/**
 * Local dev server (aem up --html-folder content) serves the documents under a folder prefix
 * (/content/de/en/...); the linked pages are fetched under the same prefix.
 */
function devPrefix() {
  if (!/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)) return '';
  const m = window.location.pathname.match(/^((?:\/[^/]+)*?)(?=\/[a-z]{2}\/[a-z]{2}(?:\/|$))/);
  return m ? m[1] : '';
}

/**
 * Path of a page of this site (no .html, no trailing slash), or null for other sites
 * (e.g. an article on www.lufthansa.com that is not part of the site).
 * @param {string} href
 */
function sitePath(href) {
  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin && !isSitePreviewHost(url.hostname)) return null;
    const prefix = devPrefix();
    const pathname = prefix && url.pathname.startsWith(`${prefix}/`) ? url.pathname.slice(prefix.length) : url.pathname;
    return pathname.replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/+$/, '') || '/';
  } catch {
    return null;
  }
}

/**
 * Date from an ISO string ("2026-08-20"), unix seconds/milliseconds or a spreadsheet serial day.
 * @param {string} value
 * @returns {Date|null}
 */
function parseDate(value) {
  const text = String(value ?? '').trim();
  if (!text || text === '0') return null;
  let date = null;
  if (/^\d+(\.\d+)?$/.test(text)) {
    const n = Number(text);
    if (n < 100000) date = new Date(Math.round((n - 25569) * 86400000)); // spreadsheet serial
    else date = new Date(n > 1e11 ? n : n * 1000);
  } else if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}T00:00:00Z` : text);
  }
  return date && !Number.isNaN(date.getTime()) ? date : null;
}

/**
 * Publication date as the live article cards print it: the page language's default long date
 * ("August 20, 2026" for en, "20. August 2026" for de), or the text as it is.
 */
function formatDate(value, locale) {
  const date = parseDate(value);
  const text = String(value ?? '').trim();
  if (!date) return text;
  try {
    return new Intl.DateTimeFormat(locale.lang, {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
    }).format(date);
  } catch (e) {
    return text;
  }
}

/** Whether an image URL is a real article image (not empty or the default meta image). */
function usableImage(src) {
  return typeof src === 'string' && !!src.trim() && !/default-meta-image/i.test(src);
}

/**
 * Card values of a page from its head: og:image (+ alt), og:title, publication-date,
 * reading-time and author. The local dev server leaves the Metadata block in the body.
 * @param {Document} doc
 */
function readPage(doc) {
  const rows = {};
  doc.querySelectorAll('div.metadata > div').forEach(({ children: [k, v] }) => {
    if (!k || !v) return;
    rows[k.textContent.trim().toLowerCase().replace(/[^a-z0-9:]+/g, '-')] = v;
  });
  if (Object.keys(rows).length) {
    const text = (...keys) => keys.map((key) => (rows[key] ? rows[key].textContent.trim() : '')).find(Boolean) || '';
    const img = (rows.image || rows['og:image'] || doc.createElement('div')).querySelector('img');
    return {
      image: img ? img.getAttribute('src') : text('og:image', 'image'),
      alt: img ? img.getAttribute('alt') || '' : '',
      title: text('og:title', 'title'),
      date: text('publication-date'),
      readingTime: text('reading-time'),
      author: text('author'),
    };
  }
  return {
    image: getMetadata('og:image', doc),
    alt: getMetadata('og:image:alt', doc),
    title: getMetadata('og:title', doc) || doc.title || '',
    date: getMetadata('publication-date', doc),
    readingTime: getMetadata('reading-time', doc),
    author: getMetadata('author', doc),
  };
}

/**
 * Card values of another page of the site, from the head of its HTML (cached per tab).
 * @param {string} path
 * @returns {Promise<Object|null>}
 */
async function fetchPage(path) {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY + path);
    if (cached) return JSON.parse(cached);
  } catch { /* no storage */ }
  try {
    const resp = await fetch(`${devPrefix()}${path}`, { signal: AbortSignal.timeout(5000) });
    if (!resp.ok) return null;
    const html = await resp.text();
    const local = html.includes('<div class="metadata">');
    const end = html.search(/<\/head>/i);
    const doc = new DOMParser().parseFromString(local || end < 0 ? html : `${html.slice(0, end)}</head><body></body></html>`, 'text/html');
    const page = readPage(doc);
    try { sessionStorage.setItem(CACHE_KEY + path, JSON.stringify(page)); } catch { /* full */ }
    return page;
  } catch {
    return null;
  }
}

/** Picture for an image URL: optimized for media of this site, as it is for other hosts. */
function buildPicture(src, alt) {
  try {
    const url = new URL(src, window.location.href);
    if (url.origin === window.location.origin || isSitePreviewHost(url.hostname)) {
      return createOptimizedPicture(url.pathname, alt, false, BREAKPOINTS);
    }
    const picture = document.createElement('picture');
    const img = document.createElement('img');
    img.src = url.href;
    img.alt = alt;
    img.loading = 'lazy';
    picture.append(img);
    return picture;
  } catch {
    return null;
  }
}

function setByline(card, parts) {
  const byline = card.querySelector('.related-articles-byline');
  byline.replaceChildren(...parts.filter((text) => text && text !== '0').map((text) => {
    const span = document.createElement('span');
    span.textContent = text;
    return span;
  }));
}

/**
 * Builds a card from an authored link with the row's image and byline ("date | reading time |
 * author"), if any. Links to pages of the site are relative; other links stay as they are.
 */
function buildCard(link, authored) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.className = 'related-articles-card';
  const path = sitePath(link.href);
  const href = link.getAttribute('href');
  if (path && /^https?:/i.test(href)) {
    const url = new URL(href);
    a.href = `${path}${url.search}${url.hash}`;
  } else {
    a.href = href;
  }
  const image = document.createElement('div');
  image.className = 'related-articles-image';
  if (authored.img) {
    image.append(keepImageSize(authored.img, createOptimizedPicture(authored.img.src, authored.img.alt || '', false, BREAKPOINTS)));
  }
  const byline = document.createElement('p');
  byline.className = 'related-articles-byline';
  const title = document.createElement('h3');
  title.className = 'related-articles-title';
  const text = cleanText(link);
  // a link whose text is its URL: the linked page's title (pages of the site), else the URL
  if (text && !/^https?:\/\//i.test(text)) title.textContent = text;
  else if (!path) title.textContent = text || href;
  a.append(image, byline, title);
  li.append(a);
  setByline(li, authored.byline ? authored.byline.split('|').map((s) => s.trim()) : []);
  return { li, path, hasTitle: !!title.textContent };
}

/** Fills what the authored card leaves open from the linked page's head. */
function enrichCard(card, page, locale) {
  const image = card.li.querySelector('.related-articles-image');
  if (!image.children.length && usableImage(page.image)) {
    const picture = buildPicture(page.image, page.alt || '');
    if (picture) image.append(picture);
  }
  const byline = card.li.querySelector('.related-articles-byline');
  if (!byline.children.length) {
    setByline(card.li, [formatDate(page.date, locale), page.readingTime, page.author]);
  }
  const title = card.li.querySelector('.related-articles-title');
  if (!title.textContent && page.title) title.textContent = page.title;
}

/**
 * The cards of the block: one per link, in authored order, duplicates dropped. A row with a
 * single link may hold the card's image and a byline paragraph (text without links).
 */
function readCards(block) {
  const seen = new Set();
  const cards = [];
  [...block.children].forEach((row) => {
    const links = [...row.querySelectorAll('a[href]')];
    const single = links.length === 1;
    const img = single ? row.querySelector('img') : null;
    const bylineP = single ? [...row.querySelectorAll('p')].find((p) => !p.querySelector('a, img') && cleanText(p)) : null;
    links.forEach((link) => {
      const key = sitePath(link.href) || link.href;
      if (seen.has(key)) return;
      seen.add(key);
      cards.push(buildCard(link, { img, byline: bylineP ? cleanText(bylineP) : '' }));
    });
  });
  return cards;
}

/** Card values of an index row (the shape readPage returns). */
const fromIndex = (article) => ({
  image: article.image,
  alt: article.imageAlt,
  title: article.title,
  date: article.date,
  readingTime: article.readingTime,
  author: article.author,
});

const MAX_CARDS = 3;

/**
 * Related article cards: rows an editor adds first (fixed, in authored order), then picks from
 * the article index up to three (pickRelated). Image, byline and title a row leaves out come
 * from the index, else from the head of the linked page (pages of the site only).
 * @param {Element} block
 */
export default async function decorate(block) {
  const locale = getLocale();
  const cards = readCards(block);
  const list = document.createElement('ul');
  list.className = 'related-articles-list';
  list.append(...cards.map((card) => card.li));
  block.replaceChildren(list);

  const here = currentPath();
  const [articles, priority] = await Promise.all([
    loadArticles(locale).catch(() => []),
    loadTagPriority(locale),
  ]);
  const byPath = new Map(articles.map((a) => [a.path, a]));

  const picks = pickRelated(articles, {
    tagIds: listOf(getMetadata('tag-ids')).map(normalizeTag),
    category: normalizeCategory(getMetadata('category') || (here.match(/\/articles\/([^/]+)\/[^/]+$/) || [])[1]),
    exclude: new Set([here, ...cards.map((c) => c.path).filter(Boolean)]),
  }, priority, Math.max(0, MAX_CARDS - cards.length));
  picks.forEach((article) => {
    const link = document.createElement('a');
    link.href = article.path;
    link.textContent = article.title;
    const card = buildCard(link, { img: null, byline: '' });
    enrichCard(card, fromIndex(article), locale);
    cards.push(card);
    list.append(card.li);
  });
  block.dataset.lhSource = articles.length ? 'live' : 'none';

  if (!cards.length) {
    block.classList.add('related-articles-empty');
    // nothing to show (no index yet): neither the heading of the section
    const section = block.closest('.section');
    if (section && section.querySelectorAll('.block').length === 1) section.hidden = true;
    return;
  }

  // authored cards: what the row leaves out from the index, else from the linked page's head
  cards.forEach((card) => {
    const complete = card.li.querySelector('.related-articles-image').children.length
      && card.li.querySelector('.related-articles-byline').children.length && card.hasTitle;
    if (!card.path || complete) return;
    if (byPath.has(card.path)) {
      enrichCard(card, fromIndex(byPath.get(card.path)), locale);
      return;
    }
    fetchPage(card.path).then((page) => {
      if (page) enrichCard(card, page, locale);
      else if (!card.hasTitle) card.li.querySelector('.related-articles-title').textContent = card.path;
    });
  });
}
