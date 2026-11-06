import { readConfigRows, pick } from '../../scripts/block-config.js';

/* ---------------------------------------------------------------------------------------------
 * Data contract. www.lufthansa-cargo.com's homepage "Latest news" (.latestNewsHome, its inline
 * script; cargo-parity-001, 2026-11-06) reads Mynewsdesk's pressroom list
 *   GET https://www.mynewsdesk.com/services/pressroom/list/{key}/?format=json
 *       &type_of_media=pressrelease&limit=6&order=published
 * (any origin may read it) and shows the first two of the page language's releases, filled up
 * with the others in the feed's order: items.item[] { language, published_at "2026-11-02
 * 14:30:00", header, url, image, type_of_media }. www's "Read more" opens its embedded newsroom;
 * here the release on Mynewsdesk. A failed or empty feed leaves the block out.
 * ------------------------------------------------------------------------------------------- */

const FEED_HOST = 'www.mynewsdesk.com';
const LABELS = {
  en: { 'press release label': 'Press Release', 'read more label': 'Read more' },
  de: { 'press release label': 'Pressemitteilung', 'read more label': 'Mehr lesen' },
};
const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
let ids = 0;

/**
 * www's date line: "02 NOV 26 | 14:30" from the feed's "2026-11-02 14:30:00" (its own day and
 * time; the month in English capitals in every language, as www's toLocaleString('en-GB')).
 * @param {string} published
 * @returns {string}
 */
export function pressDate(published) {
  const m = String(published || '').match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/);
  if (!m) return '';
  return `${m[3]} ${MONTHS[Number(m[2]) - 1]} ${m[1].slice(2)} | ${m[4]}:${m[5]}`;
}

/** The authored feed URL when it is Mynewsdesk's, else null. */
function feedUrl(config) {
  const value = pick(config, 'feed', 'source');
  if (!value) return null;
  try {
    const url = new URL(value.link ? value.link.getAttribute('href') : value.text);
    return url.protocol === 'https:' && url.hostname === FEED_HOST ? url.href : null;
  } catch {
    return null;
  }
}

/** The releases to show: the language's first, then the others in the feed's order. */
function pickReleases(items, lang, count) {
  const own = items.filter((i) => (i.language || '').slice(0, 2) === lang);
  const rest = items.filter((i) => !own.includes(i));
  return [...own, ...rest].slice(0, count);
}

function el(tag, className, textContent) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (textContent) node.textContent = textContent;
  return node;
}

function card(item, labels) {
  const li = el('li', 'news-feed-card');
  const media = el('div', 'news-feed-image');
  if (item.image) {
    const picture = document.createElement('picture');
    const img = document.createElement('img');
    img.setAttribute('src', item.image);
    img.setAttribute('alt', '');
    img.setAttribute('loading', 'lazy');
    picture.append(img);
    media.append(picture);
  }
  const body = el('div', 'news-feed-body');
  const kind = item.type_of_media === 'pressrelease' ? labels['press release label'] : item.type_of_media;
  const date = pressDate(item.published_at);
  body.append(el('p', 'news-feed-meta', [kind, date].filter(Boolean).join(' - ')));
  ids += 1;
  const title = el('h3', 'news-feed-title', (item.header || '').trim());
  title.id = `news-feed-title-${ids}`;
  body.append(title);
  if (item.url) {
    const p = el('p', 'news-feed-more');
    const a = el('a', 'news-feed-link', labels['read more label']);
    a.setAttribute('href', item.url);
    a.setAttribute('aria-describedby', title.id);
    p.append(a);
    body.append(p);
  }
  li.append(media, body);
  return li;
}

/**
 * news-feed: Mynewsdesk press releases as cards (www.lufthansa-cargo.com's "Latest news").
 * Rows: Feed | the pressroom list URL; optional Count | 2, Press release label, Read more label.
 * @param {Element} block
 */
export default async function decorate(block) {
  const config = readConfigRows(block);
  const lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
  const labels = { ...(LABELS[lang] || LABELS.en) };
  Object.keys(labels).forEach((key) => {
    const authored = config[key.replace(/ /g, '-')];
    if (authored && authored.text) labels[key] = authored.text;
  });
  const count = Math.max(1, Number.parseInt(config.count?.text, 10) || 2);
  const url = feedUrl(config);
  block.replaceChildren();
  const wrapper = block.closest('.news-feed-wrapper') || block;
  let items = [];
  if (url) {
    try {
      const resp = await fetch(url);
      const data = resp.ok ? await resp.json() : null;
      items = (data && data.items && Array.isArray(data.items.item)) ? data.items.item : [];
    } catch {
      items = [];
    }
  }
  if (!items.length) {
    wrapper.hidden = true;
    return;
  }
  const ul = el('ul');
  pickReleases(items, lang, count).forEach((item) => ul.append(card(item, labels)));
  block.append(ul);
}
