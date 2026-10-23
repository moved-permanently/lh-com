import { createOptimizedPicture, getMetadata, toClassName } from '../../scripts/aem.js';
import { getLocale } from '../../scripts/locale.js';
import {
  readConfigRows, resolveLabels, cleanText, toConfigKey, keepImageSize,
} from '../../scripts/block-config.js';

const DEFAULT_LABELS = {
  en: {
    'tags label': 'Tags',
    'share label': 'Share this article',
    'facebook label': 'Facebook',
    'x label': 'X',
    'linkedin label': 'LinkedIn',
    'email label': 'Email',
    'copy link label': 'Copy link',
    'link copied label': 'Link copied',
  },
  de: {
    'tags label': 'Schlagwörter',
    'share label': 'Artikel teilen',
    'facebook label': 'Facebook',
    'x label': 'X',
    'linkedin label': 'LinkedIn',
    'email label': 'E-Mail',
    'copy link label': 'Link kopieren',
    'link copied label': 'Link kopiert',
  },
};

const LABEL_KEYS = Object.keys(DEFAULT_LABELS.en).map(toConfigKey);

/** Live renders .dcep-social-share empty (no share links); the share code stays for later use. */
const SHOW_SHARE = false;

let instanceCount = 0;

/**
 * Date from an ISO string ("2026-08-20"), unix seconds/milliseconds or a spreadsheet serial day.
 * @param {string|number} value
 * @returns {Date|null}
 */
function parseDate(value) {
  const text = String(value ?? '').trim();
  if (!text) return null;
  if (/^\d+(\.\d+)?$/.test(text)) {
    const n = Number(text);
    if (n < 100000) return new Date(Math.round((n - 25569) * 86400000)); // spreadsheet serial
    return new Date(n > 1e11 ? n : n * 1000);
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}T00:00:00Z` : text);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

/**
 * Publication date as live prints it in the article header: "20. August 2026" in every language
 * (day, dot, month name in the page language, year), or the authored text.
 */
function formatDate(value, locale) {
  const date = parseDate(value);
  if (!date || Number.isNaN(date.getTime())) return String(value ?? '').trim();
  try {
    const parts = new Intl.DateTimeFormat(locale.lang, {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
    }).formatToParts(date);
    const part = (type) => (parts.find((p) => p.type === type) || {}).value;
    return `${part('day')}. ${part('month')} ${part('year')}`;
  } catch (e) {
    return String(value).trim();
  }
}

/** Tag slug for the tag page URL ("Eat See Do" gives "eat-see-do"). */
function tagSlug(tag) {
  return toClassName(tag.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ß/g, 'ss'));
}

/** Takes optional label override rows (e.g. "Share label | Teilen") out of the block. */
function takeLabelRows(block) {
  const config = readConfigRows(block);
  Object.entries(config).forEach(([key, { row }]) => {
    if (LABEL_KEYS.includes(key)) row.remove();
    else delete config[key];
  });
  return config;
}

/** Copies text to the clipboard, with a fallback for browsers without the async API. */
async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) { /* fall back below */ }
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.append(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch (e) {
    ok = false;
  }
  area.remove();
  return ok;
}

function buildTags(labels, locale) {
  // the pipeline writes the Tags row as one <meta property="article:tag"> per tag (no name="tags")
  const tags = (getMetadata('article:tag') || getMetadata('tags'))
    .split(',').map((t) => t.trim()).filter(Boolean);
  const unique = [...new Map(tags.map((t) => [tagSlug(t), t])).entries()].filter(([slug]) => slug);
  if (!unique.length) return null;
  const list = document.createElement('ul');
  list.className = 'article-header-tags';
  list.setAttribute('aria-label', labels['tags label']);
  unique.forEach(([slug, tag]) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = `${locale.base}/articles/tags/${slug}`;
    a.textContent = tag;
    li.append(a);
    list.append(li);
  });
  return list;
}

function buildByline(locale) {
  const parts = [
    ['date', formatDate(getMetadata('publication-date'), locale)],
    ['reading-time', getMetadata('reading-time').trim()],
    ['author', getMetadata('author').trim()],
  ].filter(([, text]) => text);
  if (!parts.length) return null;
  const byline = document.createElement('p');
  byline.className = 'article-header-byline';
  parts.forEach(([type, text]) => {
    const span = document.createElement(type === 'date' ? 'time' : 'span');
    span.className = `article-header-${type}`;
    span.textContent = text;
    if (type === 'date') {
      const date = parseDate(getMetadata('publication-date'));
      if (date && !Number.isNaN(date.getTime())) span.dateTime = date.toISOString().slice(0, 10);
    }
    byline.append(span);
  });
  return byline;
}

function buildShare(labels, title) {
  const share = document.createElement('div');
  share.className = 'article-header-share';
  share.setAttribute('role', 'group');
  share.setAttribute('aria-label', labels['share label']);

  const list = document.createElement('ul');
  const url = () => encodeURIComponent(window.location.href);
  const text = () => encodeURIComponent(title || document.title);
  const networks = [
    ['facebook', () => `https://www.facebook.com/sharer/sharer.php?u=${url()}`],
    ['x', () => `https://x.com/intent/post?url=${url()}&text=${text()}`],
    ['linkedin', () => `https://www.linkedin.com/sharing/share-offsite/?url=${url()}`],
    ['email', () => `mailto:?subject=${text()}&body=${url()}`],
  ];
  networks.forEach(([network, href]) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = `article-header-share-${network}`;
    a.href = href();
    a.textContent = labels[`${network} label`];
    if (network !== 'email') {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }
    // the URL may change (hash, query) after load
    a.addEventListener('click', () => { a.href = href(); });
    li.append(a);
    list.append(li);
  });

  const li = document.createElement('li');
  const copy = document.createElement('button');
  copy.type = 'button';
  copy.className = 'article-header-share-copy';
  copy.textContent = labels['copy link label'];
  const status = document.createElement('span');
  status.className = 'article-header-share-status';
  status.setAttribute('role', 'status');
  copy.addEventListener('click', async () => {
    const ok = await copyText(window.location.href);
    status.textContent = ok ? labels['link copied label'] : '';
    if (ok) setTimeout(() => { status.textContent = ''; }, 3000);
  });
  li.append(copy, status);
  list.append(li);

  share.append(list);
  return share;
}

/**
 * Article page header: feature image, then a panel with tag chips, H1, intro and byline (share
 * links only with SHOW_SHARE). Tags, date, reading time and author come from page metadata.
 * @param {Element} block
 */
export default function decorate(block) {
  instanceCount += 1;
  const locale = getLocale();
  const labels = resolveLabels(DEFAULT_LABELS, takeLabelRows(block), locale.lang);

  const media = document.createElement('div');
  media.className = 'article-header-media';
  const picture = block.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    const optimized = img && img.src
      ? keepImageSize(img, createOptimizedPicture(img.src, img.alt || '', true, [
        { media: '(min-width: 600px)', width: '2000' },
        { width: '750' },
      ]))
      : picture;
    picture.remove();
    media.append(optimized);
  }

  const panel = document.createElement('div');
  panel.className = 'article-header-panel';
  const content = document.createElement('div');
  content.className = 'article-header-content';
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      [...cell.childNodes].forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;
        if (node.nodeType === Node.ELEMENT_NODE && ['P', 'DIV'].includes(node.tagName)
          && !node.textContent.trim() && !node.querySelector('img, a, picture')) return;
        content.append(node);
      });
    });
  });

  const heading = content.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    heading.classList.add('article-header-title');
    heading.id = heading.id || `article-header-title-${instanceCount}`;
    content.querySelectorAll(':scope > p').forEach((p) => {
      // eslint-disable-next-line no-bitwise
      if (heading.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING) {
        p.classList.add('article-header-intro');
      }
    });
  }

  const tags = buildTags(labels, locale);
  if (tags) panel.append(tags);
  panel.append(content);

  const meta = document.createElement('div');
  meta.className = 'article-header-meta';
  const byline = buildByline(locale);
  if (byline) meta.append(byline);
  if (SHOW_SHARE) meta.append(buildShare(labels, heading ? cleanText(heading) : ''));
  panel.append(meta);

  block.replaceChildren(...(media.children.length ? [media] : []), panel);
  const updateScrollbar = () => {
    const sb = window.innerWidth - document.documentElement.clientWidth;
    block.style.setProperty('--article-header-scrollbar', `${Math.max(sb, 0)}px`);
  };
  updateScrollbar();
  window.addEventListener('resize', updateScrollbar, { passive: true });
  if (!media.children.length) block.classList.add('article-header-no-image');
}
