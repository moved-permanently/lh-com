import { createOptimizedPicture, getMetadata, toClassName } from '../../scripts/aem.js';
import { getLocale } from '../../scripts/locale.js';
import { outsideUrl } from '../../scripts/clock.js';
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
    // www's moving image (common.misc.movingimage.*)
    'play label': 'Play video',
    'pause label': 'Pause video',
    'video started label': 'Video started',
    'video stopped label': 'Video stopped',
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
    // www's German label bundle holds the English texts; translated here
    'play label': 'Video abspielen',
    'pause label': 'Video anhalten',
    'video started label': 'Video gestartet',
    'video stopped label': 'Video gestoppt',
  },
};

/** www's moving image plays above its s-view (md breakpoint 767px) unless enabled on mobile. */
const VIDEO_VIEWPORT = '(min-width: 768px)';
/** The controls stay visible this long after the pointer or focus leaves (www: 3000 ms). */
const CONTROLS_DELAY = 3000;
/** Marker after the video link: the video plays on small screens too (isVideoEnabledOnMobile). */
const MOBILE_MARKER = /\{\s*mobile\s*\}/i;

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
 * (day, dot, month name in the page language, year; at/de: Austrian month names, "22. Jänner
 * 2025"), or the authored text.
 */
function formatDate(value, locale) {
  const date = parseDate(value);
  if (!date || Number.isNaN(date.getTime())) return String(value ?? '').trim();
  try {
    const tag = locale.lang === 'de' && locale.country === 'at' ? 'de-AT' : locale.lang;
    const parts = new Intl.DateTimeFormat(tag, {
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

/** Whether a link points to an .mp4 video. */
function isVideoLink(a) {
  try {
    return /\.mp4$/i.test(new URL(a.href, window.location.href).pathname);
  } catch (e) {
    return false;
  }
}

/**
 * Takes the optional header video link (the first link to an .mp4 file) out of the block, with
 * its paragraph when that holds nothing else but the "{mobile}" marker.
 * @returns {{ src: string, mobile: boolean }|null}
 */
function takeVideo(block) {
  const link = [...block.querySelectorAll('a[href]')].find(isVideoLink);
  if (!link) return null;
  const p = link.closest('p');
  const mobile = MOBILE_MARKER.test(p ? p.textContent : '');
  const src = link.href;
  if (p) {
    const rest = p.cloneNode(true);
    rest.querySelectorAll('a').forEach((a) => a.remove());
    if (!cleanText(rest).replace(MOBILE_MARKER, '').trim()) p.remove();
    else link.remove();
  } else link.remove();
  return { src, mobile };
}

/** Runs a callback after the page load event, so the video never competes with the LCP image. */
function afterLoad(callback) {
  const run = () => setTimeout(callback, 0);
  if (document.readyState === 'complete') run();
  else window.addEventListener('load', run, { once: true });
}

/**
 * www's moving image (.dcep-moving-image) over the feature image: muted, looping, inline, no
 * picture-in-picture; it plays while at least half of it is in view and pauses outside, unless
 * the visitor paused it. The play/pause button appears once the video can play and hides
 * CONTROLS_DELAY after the pointer or focus leaves. The picture stays below as the poster and
 * the fallback: the video shows only once it plays, and not at all where www shows none (below
 * 768px unless {mobile}), with reduced motion or when it fails.
 */
function addVideo(block, media, { src, mobile }, labels) {
  const img = media.querySelector('img');
  const viewport = mobile ? null : window.matchMedia(VIDEO_VIEWPORT);
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const allowed = () => (!viewport || viewport.matches) && !motion.matches;

  let video = null;
  let toggle = null;
  let status = null;
  let inView = false;
  let pausedByVisitor = false;
  let hideTimer = 0;

  const showControls = (show) => {
    clearTimeout(hideTimer);
    if (show) block.classList.add('article-header-controls-visible');
    else hideTimer = setTimeout(() => block.classList.remove('article-header-controls-visible'), CONTROLS_DELAY);
  };
  const update = () => {
    if (!video) return;
    const play = allowed() && inView && !pausedByVisitor;
    block.classList.toggle('article-header-video-off', !allowed());
    if (play && video.paused) {
      const playing = video.play();
      if (playing && playing.catch) playing.catch(() => {});
    } else if (!play && !video.paused) video.pause();
  };
  const remove = () => {
    if (video) video.remove();
    if (toggle) toggle.remove();
    if (status) status.remove();
    video = null;
    block.classList.remove('article-header-video-playing', 'article-header-controls-visible');
  };

  const create = () => {
    if (video || !allowed()) return;
    video = document.createElement('video');
    video.id = `article-header-video-${instanceCount}`;
    video.className = 'article-header-video';
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    ['muted', 'loop', 'playsinline', 'disablepictureinpicture'].forEach((attr) => video.setAttribute(attr, ''));
    video.setAttribute('aria-hidden', 'true');
    video.setAttribute('tabindex', '-1');
    video.preload = 'auto';
    if (img) video.poster = img.currentSrc || img.src;

    toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'article-header-video-toggle';
    toggle.setAttribute('aria-controls', video.id);
    toggle.hidden = true;
    status = document.createElement('span');
    status.className = 'article-header-video-status';
    status.setAttribute('role', 'status');
    const setState = (paused) => {
      toggle.setAttribute('aria-label', paused ? labels['play label'] : labels['pause label']);
      toggle.classList.toggle('article-header-video-paused', paused);
    };
    setState(true);
    toggle.addEventListener('click', () => {
      pausedByVisitor = !video.paused;
      status.textContent = pausedByVisitor ? labels['video stopped label'] : labels['video started label'];
      if (pausedByVisitor) video.pause();
      else update();
    });
    toggle.addEventListener('focus', () => showControls(true));
    toggle.addEventListener('blur', () => showControls(false));
    video.addEventListener('play', () => setState(false));
    video.addEventListener('pause', () => setState(true));
    video.addEventListener('playing', () => block.classList.add('article-header-video-playing'), { once: true });
    video.addEventListener('canplay', () => {
      if (!toggle.hidden) return;
      toggle.hidden = false;
      showControls(true);
      showControls(false);
    }, { once: true });
    video.addEventListener('error', remove);
    video.src = src;
    media.append(video, toggle, status);

    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    }, { threshold: [0.5] }).observe(media);
  };

  media.addEventListener('mouseenter', () => showControls(true));
  media.addEventListener('mouseleave', () => showControls(false));
  const onChange = () => {
    create();
    update();
  };
  if (viewport) viewport.addEventListener('change', onChange);
  motion.addEventListener('change', onChange);
  afterLoad(create);
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
  // shared and copied without the preview's time-travel parameters (scripts/clock.js)
  const url = () => encodeURIComponent(outsideUrl(window.location.href));
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
    const ok = await copyText(outsideUrl(window.location.href));
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
  const headerVideo = takeVideo(block);

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
  // the scrollbar appears after decorate (body still hidden) without a resize event; the root's
  // box narrows by the scrollbar width then, and on every window resize
  if (window.ResizeObserver) new ResizeObserver(updateScrollbar).observe(document.documentElement);
  else window.addEventListener('resize', updateScrollbar, { passive: true });
  if (!media.children.length) block.classList.add('article-header-no-image');
  else if (headerVideo) addVideo(block, media, headerVideo, labels);
}
