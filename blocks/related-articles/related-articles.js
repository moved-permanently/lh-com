import { createOptimizedPicture } from '../../scripts/aem.js';
import { getLocale } from '../../scripts/locale.js';
import { cleanText, decorateExternalLinks } from '../../scripts/block-config.js';

const INDEX_URL = '/query-index.json';

let indexPromise;

/** Path used to match links and index rows: no trailing slash, no .html. */
function normalizePath(path) {
  return (path || '').replace(/\.html$/, '').replace(/\/index$/, '').replace(/\/+$/, '') || '/';
}

/** Query index rows by normalized path; an empty map when the index is unavailable. */
function loadIndex() {
  if (!indexPromise) {
    indexPromise = (async () => {
      const byPath = new Map();
      try {
        const resp = await fetch(INDEX_URL);
        if (!resp.ok) return byPath;
        const json = await resp.json();
        let rows = [];
        if (Array.isArray(json)) rows = json;
        else if (json && Array.isArray(json.data)) rows = json.data;
        rows.forEach((row) => {
          if (row && typeof row.path === 'string') byPath.set(normalizePath(row.path), row);
        });
      } catch (e) {
        // no index: the cards keep their link text
      }
      return byPath;
    })();
  }
  return indexPromise;
}

/**
 * Date from an ISO string ("2026-08-20"), unix seconds/milliseconds or a spreadsheet serial day.
 * @param {string|number} value
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
 * ("August 20, 2026" for en, "20. August 2026" for de), or the indexed text.
 */
function formatDate(value, locale) {
  const date = parseDate(value);
  const text = typeof value === 'number' ? '' : String(value ?? '').trim();
  if (!date) return text;
  try {
    return new Intl.DateTimeFormat(locale.lang, {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
    }).format(date);
  } catch (e) {
    return text;
  }
}

/** Whether an index image is a real article image (not empty or the default meta image). */
function usableImage(src) {
  return typeof src === 'string' && src.trim() && !/default-meta-image/i.test(src);
}

/** Builds a card from an authored link; the index enriches it later. */
function buildCard(link) {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.className = 'related-articles-card';
  a.href = link.href;
  const image = document.createElement('div');
  image.className = 'related-articles-image';
  const byline = document.createElement('p');
  byline.className = 'related-articles-byline';
  const title = document.createElement('h3');
  title.className = 'related-articles-title';
  title.textContent = cleanText(link) || link.href;
  a.append(image, byline, title);
  li.append(a);
  return li;
}

/** Fills a card with image, byline and title from its query index row. */
function enrichCard(card, row, locale) {
  const image = card.querySelector('.related-articles-image');
  if (usableImage(row.image)) {
    try {
      image.replaceChildren(createOptimizedPicture(row.image, '', false, [
        { media: '(min-width: 600px)', width: '750' },
        { width: '600' },
      ]));
    } catch (e) {
      // unparseable image path: keep the placeholder
    }
  }
  const parts = [
    formatDate(row['publication-date'], locale),
    String(row['reading-time'] ?? '').trim(),
    String(row.author ?? '').trim(),
  ].filter((text) => text && text !== '0');
  const byline = card.querySelector('.related-articles-byline');
  byline.replaceChildren(...parts.map((text) => {
    const span = document.createElement('span');
    span.textContent = text;
    return span;
  }));
  const title = typeof row.title === 'string' ? row.title.trim() : '';
  if (title) card.querySelector('.related-articles-title').textContent = title;
}

/**
 * Related article cards from authored links, enriched with image, date, reading time, author and
 * title from the query index.
 * @param {Element} block
 */
export default function decorate(block) {
  const locale = getLocale();
  const seen = new Set();
  const links = [...block.querySelectorAll('a[href]')].filter((a) => {
    let key;
    try {
      const url = new URL(a.href, window.location.href);
      key = url.origin === window.location.origin ? normalizePath(url.pathname) : url.href;
    } catch (e) {
      return false;
    }
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const list = document.createElement('ul');
  list.className = 'related-articles-list';
  const cards = links.map((link) => {
    const card = buildCard(link);
    list.append(card);
    return { card, link };
  });
  block.replaceChildren(list);
  if (!cards.length) {
    block.classList.add('related-articles-empty');
    return;
  }
  decorateExternalLinks(block);

  // enrich without holding up the section: the cards are already in place
  loadIndex().then((index) => {
    cards.forEach(({ card, link }) => {
      try {
        const url = new URL(link.href, window.location.href);
        if (url.origin !== window.location.origin) return;
        const row = index.get(normalizePath(url.pathname));
        if (row) enrichCard(card, row, locale);
      } catch (e) {
        // keep the link-text card
      }
    });
  });
}
