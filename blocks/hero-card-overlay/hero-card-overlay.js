import { createOptimizedPicture, getMetadata } from '../../scripts/aem.js';
import { keepImageSize } from '../../scripts/block-config.js';
import { getLocale } from '../../scripts/locale.js';
import { now as clockNow, parseLocalTime, MARKET_TIME_ZONES } from '../../scripts/clock.js';

let instanceCount = 0;

/*
 * Countdown (row End time, optional): www's main stage teaser counts down to its campaign's end
 * (linkModeConfig.campaignConfig: campaignType "running", campaignEndTime; www.austrian.com
 * us/en, 2026-11-01). Its component: the time left, every second; with a day or more left days :
 * hours : minutes, else hours : minutes : seconds, two digits each, labels from labels/countdown;
 * at the end the countdown is gone, the teaser stays. An end time without an offset is the
 * market's local time (scripts/clock.js parseLocalTime).
 */

/** www's labels/countdown (www.austrian.com en, 2026-11-01; de: not readable from our hosts). */
const COUNTDOWN_LABELS = {
  en: {
    days: 'Days', hours: 'Hours', minutes: 'Minutes', seconds: 'Seconds',
  },
  de: {
    days: 'Tage', hours: 'Stunden', minutes: 'Minuten', seconds: 'Sekunden',
  },
  fr: {
    days: 'Jours',
    hours: 'Heures',
    minutes: 'Minutes',
    seconds: 'Secondes',
  },
  es: {
    days: 'Días',
    hours: 'Horas',
    minutes: 'Minutos',
    seconds: 'Segundos',
  },
  el: {
    days: 'Ημέρες',
    hours: 'Ώρες',
    minutes: 'Λεπτά',
    seconds: 'Δευτερόλεπτα',
  },
  it: {
    days: 'Giorni',
    hours: 'Ore',
    minutes: 'Minuti',
    seconds: 'Secondi',
  },
  ja: {
    days: '日',
    hours: '時間',
    minutes: '分',
    seconds: '秒',
  },
  ko: {
    days: '일',
    hours: '시간',
    minutes: '분',
    seconds: '초',
  },
  nl: {
    days: 'Dagen',
    hours: 'Uren',
    minutes: 'Minuten',
    seconds: 'Seconden',
  },
  pl: {
    days: 'Dni',
    hours: 'Godzin',
    minutes: 'Minut',
    seconds: 'Sekund',
  },
  pt: {
    days: 'Dias',
    hours: 'Horas',
    minutes: 'Minutos',
    seconds: 'Segundos',
  },
  ru: {
    days: 'Дней',
    hours: 'Часов',
    minutes: 'Минут',
    seconds: 'Секунд',
  },
  zh: {
    days: '天',
    hours: '小时',
    minutes: '分钟',
    seconds: '秒',
  },
};
const LIVE_COUNTDOWN_LABELS = {
  days: 'countdown.common.default.dayLabelText',
  hours: 'countdown.common.default.hourLabelText',
  minutes: 'countdown.common.default.minuteLabelText',
  seconds: 'countdown.common.default.secondLabelText',
};

/**
 * The parts www's countdown shows for the time left.
 * @param {number} end ms since the epoch
 * @param {number} nowTs ms since the epoch
 * @returns {{completed: boolean, units: Array<[string, string]>}}
 */
export function countdownParts(end, nowTs) {
  const left = Math.floor((end - nowTs) / 1000);
  if (left <= 0) return { completed: true, units: [] };
  const days = Math.floor(left / 86400);
  const hours = Math.floor((left % 86400) / 3600);
  const minutes = Math.floor((left % 3600) / 60);
  const seconds = left % 60;
  const two = (n) => String(n).padStart(2, '0');
  const units = days > 0
    ? [['days', two(days)], ['hours', two(hours)], ['minutes', two(minutes)]]
    : [['hours', two(hours)], ['minutes', two(minutes)], ['seconds', two(seconds)]];
  return { completed: false, units };
}

/** Whether an authored date and time names a real one (Date.UTC would roll 2026-13-45 over). */
function plausible(text) {
  const iso = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[T\s]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  const de = text.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:,?\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  let parts = null;
  if (iso) parts = [iso[1], iso[2], iso[3], iso[4], iso[5], iso[6]];
  else if (de) parts = [de[3], de[2], de[1], de[4], de[5], de[6]];
  if (!parts) return false;
  const [y, mo, d, h = 0, mi = 0, sec = 0] = parts.map((v) => Number(v || 0));
  const days = new Date(Date.UTC(y, mo, 0)).getUTCDate();
  return mo >= 1 && mo <= 12 && d >= 1 && d <= days && h <= 23 && mi <= 59 && sec <= 59;
}

/**
 * The end of the countdown: an authored time (www's "2026-11-01T23:59:00.000-05:00", "2026-11-02
 * 05:59+01:00"; without an offset the market's local time), else null (empty or unreadable, or
 * a local time where the market's time zone is unknown: Austrian's and ITA's markets lufthansa.com
 * has no row for, e.g. us).
 * @param {string} value
 * @param {string|null} timeZone the page's market's time zone
 * @returns {number|null}
 */
export function readEndTime(value, timeZone) {
  // www's values carry milliseconds ("23:59:00.000-05:00"): whole seconds are enough
  const text = String(value || '').trim().replace(/(\d{1,2}:\d{2}:\d{2})\.\d+/, '$1');
  if (!text || !plausible(text)) return null;
  if (!timeZone && !/(z|[+-]\d{2}:?\d{2})$/i.test(text)) return null;
  const ts = parseLocalTime(text, timeZone);
  return Number.isFinite(ts) ? ts : null;
}

/** The value cell of a two-cell "End time | ..." row, else null. */
function endTimeRow(row) {
  const cells = [...row.children];
  if (cells.length !== 2) return null;
  return /^(end time|endzeit)$/i.test(cells[0].textContent.trim()) ? cells[1] : null;
}

/** The countdown (www's .count-down .countdown-row), ticking until the end; null when over. */
function buildCountdown(end, labels) {
  if (countdownParts(end, clockNow()).completed) return null;
  const timer = document.createElement('div');
  timer.className = 'hero-card-overlay-countdown';
  timer.setAttribute('role', 'timer');
  const row = document.createElement('div');
  row.className = 'hero-card-overlay-countdown-row';
  timer.append(row);
  const render = () => {
    const { completed, units } = countdownParts(end, clockNow());
    if (completed) return false;
    const children = [];
    units.forEach(([unit, value], i) => {
      if (i) {
        const sep = document.createElement('span');
        sep.className = 'hero-card-overlay-countdown-sep';
        sep.setAttribute('aria-hidden', 'true');
        sep.textContent = ':';
        children.push(sep);
      }
      const col = document.createElement('span');
      col.className = 'hero-card-overlay-countdown-col';
      col.dataset.unit = unit;
      const num = document.createElement('span');
      num.className = 'hero-card-overlay-countdown-num';
      num.textContent = value;
      const label = document.createElement('span');
      label.className = 'hero-card-overlay-countdown-label';
      label.textContent = labels[unit];
      col.append(num, label);
      children.push(col);
    });
    row.replaceChildren(...children);
    return true;
  };
  render();
  const interval = setInterval(() => {
    if (render()) return;
    clearInterval(interval);
    timer.remove();
  }, 1000);
  // www's live labels where its label service answers (the built-in copies otherwise)
  timer.relabel = (live) => {
    Object.entries(LIVE_COUNTDOWN_LABELS).forEach(([unit, key]) => {
      if (live[key]) labels[unit] = live[key];
    });
    render();
  };
  return timer;
}

/**
 * The value cell of a two-cell "Conditions | title + text" row, else null.
 * @param {Element} row
 * @returns {Element|null}
 */
function conditionsRow(row) {
  const cells = [...row.children];
  if (cells.length !== 2) return null;
  return /^(conditions|konditionen)$/i.test(cells[0].textContent.trim()) ? cells[1] : null;
}

/**
 * Conditions disclosure (the live card opens them in a dialog from a "Conditions" link button):
 * the first paragraph is the title, the rest the text.
 * @param {Element} cell
 * @returns {HTMLDetailsElement|null}
 */
function buildConditions(cell) {
  const [title, ...rest] = [...cell.children];
  const label = title ? title.textContent.trim() : '';
  if (!label || !rest.length) return null;
  const details = document.createElement('details');
  details.className = 'hero-card-overlay-conditions';
  const summary = document.createElement('summary');
  summary.textContent = label;
  const body = document.createElement('div');
  body.className = 'hero-card-overlay-conditions-text';
  body.append(...rest);
  details.append(summary, body);
  return details;
}

/**
 * The block's link to an .mp4, taken out of the content (its paragraph too when it holds only the
 * link), or ''.
 * @param {Element} block
 * @returns {string} the video's path
 */
function takeVideoLink(block) {
  const a = [...block.querySelectorAll('a[href]')].find((x) => /\.mp4$/i.test((x.getAttribute('href') || '').split(/[?#]/)[0]));
  if (!a) return '';
  const href = a.getAttribute('href');
  const p = a.closest('p');
  (p && p.textContent.trim() === a.textContent.trim() ? p : a).remove();
  return href;
}

/**
 * The hero's video over its picture (the poster, shown until the video plays): muted, looped,
 * inline, a decoration; none with prefers-reduced-motion (the picture alone).
 * @param {string} src
 * @param {HTMLImageElement|null} img
 * @returns {HTMLVideoElement|null}
 */
function buildVideo(src, img) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
  const video = document.createElement('video');
  video.className = 'hero-card-overlay-video';
  ['muted', 'loop', 'playsinline', 'autoplay'].forEach((a) => video.setAttribute(a, ''));
  video.muted = true;
  video.setAttribute('preload', 'metadata');
  video.setAttribute('aria-hidden', 'true');
  if (img && img.getAttribute('src')) video.setAttribute('poster', img.getAttribute('src'));
  const source = document.createElement('source');
  source.setAttribute('src', src);
  source.setAttribute('type', 'video/mp4');
  video.append(source);
  video.addEventListener('playing', () => video.classList.add('is-playing'), { once: true });
  return video;
}

/**
 * The brands whose picture cell's second picture is the phone one, and from where the first
 * picture shows: TAP's banners (parity 94, www's imageMobile, the import's phonePictures) from
 * 728 px; Cargo's ULD teaser (www's .teaserULD: Teaser-ULD-Mobile@2x.jpg up to 767 px) from 768 px.
 */
const PHONE_PICTURE_FROM = { tap: 728, cargo: 768 };

/**
 * The picture cell's second picture as the phone one: one picture, the first's sources from the
 * brand's width, then the phone picture's (as hero-campaign.js phonePicture; blocks import no
 * other block).
 * @param {Element} picture the first picture
 * @param {boolean} eager
 * @param {number} from the width (px) from which the first picture shows
 * @returns {Element|null} the picture, or null (no second picture in the cell)
 */
function phonePicture(picture, eager, from) {
  const img = picture.querySelector('img[src]');
  const cell = picture.closest('div');
  const second = img && cell ? [...cell.querySelectorAll('picture')][1] : null;
  const phoneImg = second && second.querySelector('img[src]');
  if (!phoneImg) return null;
  const wide = createOptimizedPicture(img.src, img.alt || '', eager, [
    { media: `(min-width: ${from}px)`, width: '2000' },
    { width: '900' },
  ]);
  const phone = keepImageSize(phoneImg, createOptimizedPicture(phoneImg.src, img.alt || '', eager, [{ width: '900' }]));
  phone.prepend(...wide.querySelectorAll('source[media]'));
  second.remove();
  return phone;
}

/**
 * Full-bleed image with a text card overlaid on it.
 * Content: a background image (first picture anywhere in the block) and the card content
 * (optional eyebrow paragraph, heading, text, CTA links) in any other cell.
 * @param {Element} block
 */
export default function decorate(block) {
  instanceCount += 1;
  // a linked .mp4 (SWISS's main stage teaser, www's moving image): no card content
  const videoLink = takeVideoLink(block);
  const picture = block.querySelector('picture');
  const media = document.createElement('div');
  media.className = 'hero-card-overlay-media';

  if (picture) {
    const img = picture.querySelector('img');
    const section = block.closest('.section');
    const sections = section ? [...section.parentElement.querySelectorAll(':scope > .section')] : [];
    // the stage sits near the top of most templates, so load it eagerly there; with
    // no-mobile-image the CSS hides it below 768px: lazy there (a lazy image under display: none
    // isn't fetched), desktop and tablet as before
    const hidden = block.classList.contains('no-mobile-image') && !matchMedia('(min-width: 768px)').matches;
    const eager = !hidden && (!section || sections.indexOf(section) < 2);
    const phoneFrom = PHONE_PICTURE_FROM[getMetadata('brand').trim().toLowerCase()];
    const optimized = (phoneFrom && phonePicture(picture, eager, phoneFrom)) || (img
      ? keepImageSize(img, createOptimizedPicture(img.src, img.alt || '', eager, [
        { media: '(min-width: 900px)', width: '2000' },
        { width: '900' },
      ]))
      : picture);
    // paragraphs left empty by the moved picture are dropped below
    picture.remove();
    media.append(optimized);
    const video = videoLink && buildVideo(videoLink, media.querySelector('img'));
    if (video) {
      media.append(video);
      block.classList.add('hero-card-overlay-has-video');
    }
  }

  const card = document.createElement('div');
  card.className = 'hero-card-overlay-card';
  let conditions = null;
  let endTime = null;
  [...block.children].forEach((row) => {
    const endCell = endTimeRow(row);
    if (endCell) {
      endTime = endCell.textContent;
      return;
    }
    const conditionsCell = conditionsRow(row);
    if (conditionsCell) {
      conditions = buildConditions(conditionsCell) || conditions;
      return;
    }
    [...row.children].forEach((cell) => {
      [...cell.childNodes].forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;
        if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'P'
          && !node.textContent.trim() && !node.querySelector('img, a')) return;
        card.append(node);
      });
    });
  });

  // eyebrow: text paragraphs before the first heading
  const heading = card.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    heading.id = heading.id || `hero-card-overlay-heading-${instanceCount}`;
    block.setAttribute('role', 'region');
    block.setAttribute('aria-labelledby', heading.id);
    let prev = heading.previousElementSibling;
    while (prev) {
      if (prev.tagName === 'P' && !prev.querySelector('a')) prev.classList.add('hero-card-overlay-eyebrow');
      prev = prev.previousElementSibling;
    }
  }

  // CTA: paragraphs holding only links
  card.querySelectorAll(':scope > p').forEach((p) => {
    const links = p.querySelectorAll('a[href]');
    if (links.length && [...links].map((a) => a.textContent).join('').trim() === p.textContent.trim()) {
      p.classList.add('hero-card-overlay-cta');
    }
  });

  // the countdown (row End time): after the text, before the link (www's campaign-wrapper)
  if (endTime !== null) {
    const locale = getLocale();
    const zone = locale.timeZone || MARKET_TIME_ZONES[locale.country] || null;
    const end = readEndTime(endTime, zone);
    const labels = { ...(COUNTDOWN_LABELS[locale.lang] || COUNTDOWN_LABELS.en) };
    const timer = end === null ? null : buildCountdown(end, labels);
    if (timer) {
      const cta = card.querySelector(':scope > .hero-card-overlay-cta');
      card.insertBefore(timer, cta || null);
      import('../../scripts/lh-api.js').then(({ fetchLabels }) => fetchLabels(['countdown'], locale))
        .then((live) => timer.relabel(live.labels || {}))
        .catch(() => {});
    }
  }

  if (conditions) card.append(conditions);

  block.replaceChildren(media, card);
  if (!picture) block.classList.add('hero-card-overlay-no-image');
  if (!card.children.length) card.remove();
}
