import { createOptimizedPicture } from '../../scripts/aem.js';
import { getLocale } from '../../scripts/locale.js';
import { resolveLabels, cleanText, toConfigKey } from '../../scripts/block-config.js';

const DEFAULT_LABELS = {
  en: { 'pause label': 'Pause background video', 'play label': 'Play background video' },
  de: { 'pause label': 'Hintergrundvideo anhalten', 'play label': 'Hintergrundvideo abspielen' },
};

const LABEL_KEYS = ['pause-label', 'play-label'];

/** A paragraph after the heading up to this length is the subtitle (.subheadline). */
const SUBTITLE_MAX_LENGTH = 100;

const INLINE_TAGS = ['A', 'ABBR', 'B', 'BR', 'CODE', 'EM', 'I', 'SMALL', 'SPAN', 'STRONG', 'SUB', 'SUP', 'U'];

let instanceCount = 0;

/** Whether a link points to an .mp4 video. */
function isVideoLink(a) {
  try {
    return /\.mp4$/i.test(new URL(a.href, window.location.href).pathname);
  } catch (e) {
    return false;
  }
}

/**
 * Takes the optional trailing label rows ("Pause label | ...", "Play label | ...") out of the
 * block.
 * Only rows with two or more cells whose first cell is exactly one of those keys are read.
 */
function takeLabelRows(block) {
  const config = {};
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (cells.length < 2) return;
    const key = toConfigKey(cleanText(cells[0]));
    if (!LABEL_KEYS.includes(key)) return;
    if (!config[key]) config[key] = { text: cleanText(cells[1]), cell: cells[1] };
    row.remove();
  });
  return config;
}

/** Runs a callback after the page load event, so the video never competes with the LCP image. */
function afterLoad(callback) {
  const run = () => setTimeout(callback, 0);
  if (document.readyState === 'complete') run();
  else window.addEventListener('load', run, { once: true });
}

/** Keeps the full-bleed stage from causing a horizontal scrollbar on classic scrollbars. */
function trackScrollbar(block) {
  const update = () => {
    const sb = window.innerWidth - document.documentElement.clientWidth;
    block.style.setProperty('--hero-campaign-scrollbar', `${Math.max(sb, 0)}px`);
  };
  update();
  window.addEventListener('resize', update, { passive: true });
}

/**
 * Adds the muted, looping background video and its pause/play toggle.
 * @param {Element} block
 * @param {Element} media
 * @param {string} src
 * @param {Object} labels
 */
function addBackgroundVideo(block, media, src, labels) {
  const img = media.querySelector('img');
  const video = document.createElement('video');
  video.id = `hero-campaign-video-${instanceCount}`;
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.autoplay = true;
  video.playsInline = true;
  ['muted', 'loop', 'autoplay', 'playsinline', 'disablepictureinpicture'].forEach((attr) => video.setAttribute(attr, ''));
  video.setAttribute('aria-hidden', 'true');
  video.setAttribute('tabindex', '-1');
  video.preload = 'auto';
  if (img) video.poster = img.currentSrc || img.src;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'hero-campaign-toggle';
  toggle.setAttribute('aria-controls', video.id);
  const setState = (paused) => {
    toggle.setAttribute('aria-label', paused ? labels['play label'] : labels['pause label']);
    toggle.classList.toggle('hero-campaign-toggle-paused', paused);
  };
  setState(false);
  toggle.addEventListener('click', () => {
    if (video.paused) {
      const playing = video.play();
      if (playing && playing.catch) playing.catch(() => setState(true));
    } else {
      video.pause();
    }
  });
  video.addEventListener('play', () => setState(false));
  video.addEventListener('pause', () => setState(true));
  video.addEventListener('playing', () => block.classList.add('hero-campaign-video-playing'), { once: true });
  video.addEventListener('error', () => {
    video.remove();
    toggle.remove();
    block.classList.remove('hero-campaign-video-playing');
  });

  video.src = src;
  media.append(video);
  block.append(toggle);
  const playing = video.play();
  if (playing && playing.catch) playing.catch(() => setState(true));
}

/**
 * Full-bleed campaign stage: background image (optionally with a muted looping background video)
 * and text placed directly on the media.
 * @param {Element} block
 */
export default function decorate(block) {
  instanceCount += 1;
  const labels = resolveLabels(DEFAULT_LABELS, takeLabelRows(block), getLocale().lang);

  // background image: the first picture anywhere in the block
  const media = document.createElement('div');
  media.className = 'hero-campaign-media';
  const picture = block.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    const section = block.closest('.section');
    const sections = section && section.parentElement
      ? [...section.parentElement.querySelectorAll(':scope > .section')] : [];
    const eager = !section || sections.indexOf(section) < 2;
    const optimized = img && img.src
      ? createOptimizedPicture(img.src, img.alt || '', eager, [
        { media: '(min-width: 600px)', width: '2000' },
        { width: '750' },
      ])
      : picture;
    picture.remove();
    media.append(optimized);
  }

  // background video: the first link to an .mp4 file
  const videoLink = [...block.querySelectorAll('a[href]')].find(isVideoLink);
  const videoSrc = videoLink ? videoLink.href : '';
  if (videoLink) videoLink.remove();

  // everything else is text; loose text and inline nodes (cells without a paragraph) are
  // wrapped in a paragraph so they get the text styles
  const content = document.createElement('div');
  content.className = 'hero-campaign-content';
  let loose = null;
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      [...cell.childNodes].forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;
        if (node.nodeType === Node.ELEMENT_NODE && ['P', 'DIV'].includes(node.tagName)
          && !node.textContent.trim() && !node.querySelector('img, a, picture')) return;
        if (node.nodeType === Node.TEXT_NODE || INLINE_TAGS.includes(node.tagName)) {
          if (!loose) {
            loose = document.createElement('p');
            content.append(loose);
          }
          loose.append(node);
          return;
        }
        loose = null;
        content.append(node);
      });
      loose = null;
    });
  });

  const heading = content.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    heading.id = heading.id || `hero-campaign-heading-${instanceCount}`;
    block.setAttribute('role', 'region');
    block.setAttribute('aria-labelledby', heading.id);
    // subtitle: a short plain paragraph directly after the heading (longer ones are body text)
    const next = heading.nextElementSibling;
    if (next && next.tagName === 'P' && !next.querySelector('a, picture')
      && cleanText(next).length <= SUBTITLE_MAX_LENGTH) {
      next.classList.add('hero-campaign-subtitle');
    }
  }

  content.querySelectorAll(':scope > p').forEach((p) => {
    const links = p.querySelectorAll('a[href]');
    if (links.length && [...links].map((a) => a.textContent).join('').trim() === p.textContent.trim()) {
      p.classList.add('hero-campaign-cta');
      // a call to action on the stage is always a button; unformatted links are secondary
      links.forEach((a) => {
        if (!a.classList.contains('button')) a.classList.add('button', 'secondary');
      });
      p.classList.remove('link-wrapper');
      p.classList.add('button-wrapper');
    }
  });

  const inner = document.createElement('div');
  inner.className = 'hero-campaign-inner';
  if (content.children.length) inner.append(content);
  block.replaceChildren(media, inner);
  if (!media.children.length) block.classList.add('hero-campaign-no-image');
  trackScrollbar(block);

  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (videoSrc && !reducedMotion) {
    afterLoad(() => addBackgroundVideo(block, media, videoSrc, labels));
  }
}
