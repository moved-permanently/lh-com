import { createOptimizedPicture } from '../../scripts/aem.js';
import { getLocale } from '../../scripts/locale.js';
import {
  resolveLabels, cleanText, decorateExternalLinks, keepImageSize,
} from '../../scripts/block-config.js';

const DEFAULT_LABELS = {
  en: { 'play video': 'Play video', 'show image': 'Show image' },
  de: { 'play video': 'Video abspielen', 'show image': 'Bild anzeigen' },
};

const BREAKPOINTS = [{ media: '(min-width: 600px)', width: '2000' }, { width: '750' }];

let videoCount = 0;

/** Playback settings a video link can carry (marker after the link: "{autoplay muted loop}"). */
const VIDEO_SETTINGS = ['autoplay', 'muted', 'loop', 'controls', 'round-play-button'];
const VIDEO_MARKER = new RegExp(`\\s*\\{((?:${VIDEO_SETTINGS.join('|')})(?: (?:${VIDEO_SETTINGS.join('|')}))*)\\}\\s*$`);
const VIDEO_MARKERS = new RegExp(VIDEO_MARKER.source.slice(0, -1), 'g');

/** Whether a link points to an .mp4 video. */
function isVideoLink(a) {
  try {
    return /\.mp4$/i.test(new URL(a.href, window.location.href).pathname);
  } catch (e) {
    return false;
  }
}

/** Whether a link text is just its URL (DA writes bare links that way). */
function isUrlText(a) {
  const text = cleanText(a);
  if (!text) return true;
  if (/^(https?:)?\/\//i.test(text) || text.startsWith('/')) return true;
  try {
    return new URL(text, window.location.href).href === new URL(a.href, window.location.href).href;
  } catch (e) {
    return false;
  }
}

/** Text of a cell outside of links (video settings markers are not text). */
function textOutsideLinks(cell) {
  const clone = cell.cloneNode(true);
  clone.querySelectorAll('a').forEach((a) => a.remove());
  return cleanText(clone).replace(VIDEO_MARKERS, '').trim();
}

/** A cell holding only pictures and links (to media) is a media cell. */
function isMediaCell(cell) {
  const hasMedia = cell.querySelector('picture, img')
    || [...cell.querySelectorAll('a[href]')].some(isVideoLink);
  return Boolean(hasMedia) && !textOutsideLinks(cell)
    && !cell.querySelector('h1, h2, h3, h4, h5, h6, ul, ol, table');
}

/** Re-renders an authored picture at the block's sizes, keeping the alt text. */
function optimize(picture) {
  const img = picture.querySelector('img');
  if (!img || !img.src) return;
  const optimized = keepImageSize(img, createOptimizedPicture(img.src, img.alt || '', false, BREAKPOINTS));
  const newImg = optimized.querySelector('img');
  if (newImg && img.title) newImg.title = img.title;
  picture.replaceWith(optimized);
}

/** Removes paragraphs and wrappers left empty by moved content. */
function removeEmpty(root) {
  root.querySelectorAll('p, div').forEach((el) => {
    if (!el.closest('.columns-media-video, .columns-media-multi') && !el.textContent.trim()
      && !el.querySelector('picture, img, a, video, button')) el.remove();
  });
}

/**
 * Takes the settings marker that follows a video link in its paragraph; returns the settings
 * (empty: none authored).
 * @param {HTMLAnchorElement} link
 * @returns {Set<string>}
 */
function takeVideoSettings(link) {
  const p = link.closest('p') || link.parentElement;
  const nodes = p ? [...p.childNodes] : [];
  const last = nodes.filter((n) => n.nodeType === Node.TEXT_NODE && n.nodeValue.trim()).pop();
  const match = last && nodes.indexOf(last) > nodes.findIndex((n) => n.contains(link))
    && last.nodeValue.match(VIDEO_MARKER);
  if (!match) return new Set();
  last.nodeValue = last.nodeValue.slice(0, match.index);
  return new Set(match[1].split(' '));
}

/**
 * Creates the video element for a video link.
 * @param {string} src
 * @param {HTMLImageElement} img poster
 * @param {Set<string>} settings authored settings (none: controls, loop)
 */
function createVideo(src, img, settings) {
  const authored = settings.size > 0;
  const video = document.createElement('video');
  video.controls = !authored || settings.has('controls');
  video.loop = !authored || settings.has('loop');
  video.muted = settings.has('muted');
  if (video.muted) video.setAttribute('muted', '');
  video.playsInline = true;
  video.setAttribute('playsinline', '');
  video.disablePictureInPicture = true;
  if (img) {
    video.poster = img.currentSrc || img.src;
    const w = Number(img.getAttribute('width'));
    const h = Number(img.getAttribute('height'));
    if (w && h) video.style.aspectRatio = `${w} / ${h}`;
    if (img.alt) video.setAttribute('aria-label', img.alt);
  }
  video.src = src;
  return video;
}

/** Starts a video; a refused play keeps the poster frame (and the controls, if any). */
function play(video) {
  const playing = video.play();
  if (playing && playing.catch) playing.catch(() => { /* autoplay refused */ });
}

/**
 * Turns a poster picture and an .mp4 link into a video. Settings (marker after the link):
 * "autoplay muted" without "controls" plays inline by itself, without controls, once the
 * video comes near the viewport (Lufthansa moving image; not with reduced motion: then a play
 * button); otherwise the poster shows a play button (square bottom left, "round-play-button":
 * round in the middle, video viewer) that starts the video in place. No settings: click to play
 * with controls, looping.
 * @param {Element} cell media cell
 * @param {HTMLAnchorElement} link video link
 * @param {Object} labels
 */
function buildVideo(cell, link, labels) {
  videoCount += 1;
  const settings = takeVideoSettings(link);
  const src = link.href;
  const label = isUrlText(link) ? labels['play video'] : cleanText(link);
  const picture = cell.querySelector('picture');
  const wrapper = document.createElement('div');
  wrapper.className = 'columns-media-video';
  wrapper.id = `columns-media-video-${videoCount}`;
  if (picture) wrapper.append(picture);

  const p = link.closest('p');
  link.remove();
  if (p && p.parentElement === cell && !p.textContent.trim() && !p.querySelector('picture, img, a')) p.remove();
  cell.prepend(wrapper);

  const inline = settings.has('autoplay') && settings.has('muted') && !settings.has('controls')
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (inline) {
    wrapper.classList.add('columns-media-video-inline');
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((e) => e.isIntersecting)) return;
      observer.disconnect();
      const video = createVideo(src, wrapper.querySelector('img'), settings);
      video.autoplay = true;
      video.tabIndex = -1;
      video.setAttribute('aria-hidden', 'true');
      wrapper.replaceChildren(video);
      play(video);
    }, { rootMargin: '200px 0px' });
    observer.observe(wrapper);
    return;
  }

  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'columns-media-play';
  if (settings.has('round-play-button')) wrapper.classList.add('columns-media-video-round');
  button.setAttribute('aria-label', label);
  button.setAttribute('aria-controls', wrapper.id);
  wrapper.append(button);

  button.addEventListener('click', () => {
    const video = createVideo(src, wrapper.querySelector('img'), settings);
    video.autoplay = true;
    if (!video.controls) video.addEventListener('click', () => (video.paused ? play(video) : video.pause()));
    wrapper.replaceChildren(video);
    wrapper.classList.add('columns-media-video-playing');
    video.focus();
    play(video);
  });
}

/** Wraps a picture in the bare link authored next to it in the same paragraph. */
function linkPictures(cell) {
  cell.querySelectorAll('p').forEach((p) => {
    const pictures = p.querySelectorAll('picture');
    const links = [...p.querySelectorAll('a[href]')].filter((a) => !a.querySelector('picture, img'));
    if (pictures.length !== 1 || links.length !== 1) return;
    const [link] = links;
    if (isVideoLink(link) || !isUrlText(link)) return;
    if (pictures[0].closest('a')) return;
    link.textContent = '';
    pictures[0].replaceWith(link);
    link.append(pictures[0]);
    p.querySelectorAll('br').forEach((br) => br.remove());
  });
}

/**
 * Option slider: below 1025px the images of a strip are slides, one at a time, with dots
 * (Lufthansa column view with carousel behaviour, .hidden-lg-up swiper).
 * @param {Element} strip .columns-media-multi
 * @param {Object} labels
 */
function buildSlider(strip, labels) {
  const slides = [...strip.children];
  const dots = document.createElement('div');
  dots.className = 'columns-media-dots';
  const buttons = slides.map((slide, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `${labels['show image']} ${index + 1}`);
    button.addEventListener('click', () => {
      strip.scrollTo({ left: slide.offsetLeft - strip.firstElementChild.offsetLeft, behavior: 'smooth' });
    });
    dots.append(button);
    return button;
  });
  const update = () => {
    const width = strip.clientWidth || 1;
    const current = Math.min(slides.length - 1, Math.max(0, Math.round(strip.scrollLeft / width)));
    buttons.forEach((b, i) => b.setAttribute('aria-current', String(i === current)));
  };
  let frame = 0;
  strip.addEventListener('scroll', () => {
    if (frame) return;
    frame = requestAnimationFrame(() => { frame = 0; update(); });
  }, { passive: true });
  update();
  strip.after(dots);
}

/**
 * Two-column text and media rows.
 * Each row has (usually) two cells; a cell holding only pictures or links to media is a media
 * cell, any other cell is a text cell. Media cells accept several images (shown side by side),
 * a linked image, or a poster image plus an .mp4 link (click-to-play video).
 * @param {Element} block
 */
export default function decorate(block) {
  const labels = resolveLabels(DEFAULT_LABELS, {}, getLocale().lang);

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length || (!cleanText(row) && !row.querySelector('picture, img, a'))) {
      row.remove();
      return;
    }
    row.classList.add('columns-media-row');
    row.style.setProperty('--columns-media-cols', cells.length);

    let mediaIndex = -1;
    cells.forEach((cell, index) => {
      if (isMediaCell(cell)) {
        cell.classList.add('columns-media-media');
        if (mediaIndex < 0) mediaIndex = index;
        linkPictures(cell);
        cell.querySelectorAll('picture').forEach(optimize);
        const video = [...cell.querySelectorAll('a[href]')].find(isVideoLink);
        if (video) buildVideo(cell, video, labels);
        if (!video && cell.querySelectorAll('picture').length > 1) {
          // several images side by side: collect them (with their links) into one strip
          const strip = document.createElement('div');
          strip.className = 'columns-media-multi';
          cell.querySelectorAll('picture').forEach((pic) => {
            const link = pic.closest('a');
            strip.append(link && link.querySelectorAll('picture').length === 1 ? link : pic);
          });
          cell.prepend(strip);
          if (block.classList.contains('slider')) buildSlider(strip, labels);
        }
      } else {
        cell.classList.add('columns-media-text');
        cell.querySelectorAll('picture').forEach(optimize);
      }
      removeEmpty(cell);
    });

    if (cells.length === 2 && mediaIndex >= 0 && cells.some((c) => c.classList.contains('columns-media-text'))) {
      row.classList.add(mediaIndex === 0 ? 'columns-media-media-first' : 'columns-media-media-last');
    }
  });

  decorateExternalLinks(block);
}
