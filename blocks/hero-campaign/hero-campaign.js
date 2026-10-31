import { createOptimizedPicture } from '../../scripts/aem.js';
import { getLocale } from '../../scripts/locale.js';
import {
  resolveLabels, cleanText, toConfigKey, keepImageSize,
} from '../../scripts/block-config.js';

const DEFAULT_LABELS = {
  en: {
    'pause label': 'Pause background video',
    'play label': 'Play background video',
    'slider label': 'Stage',
    'previous label': 'Previous slide',
    'next label': 'Next slide',
    'slide label': '{n} of {total}',
  },
  de: {
    'pause label': 'Hintergrundvideo anhalten',
    'play label': 'Hintergrundvideo abspielen',
    'slider label': 'Bühne',
    'previous label': 'Vorherige Folie',
    'next label': 'Nächste Folie',
    'slide label': '{n} von {total}',
  },
  it: {
    'pause label': 'Metti in pausa il video di sfondo',
    'play label': 'Riproduci il video di sfondo',
    'slider label': 'Banner principale',
    'previous label': 'Slide precedente',
    'next label': 'Slide successiva',
    'slide label': '{n} di {total}',
  },
  fr: {
    'pause label': 'Mettre en pause la vidéo d’arrière-plan',
    'play label': 'Lire la vidéo d’arrière-plan',
    'slider label': 'Bannière principale',
    'previous label': 'Diapositive précédente',
    'next label': 'Diapositive suivante',
    'slide label': '{n} sur {total}',
  },
  es: {
    'pause label': 'Pausar el vídeo de fondo',
    'play label': 'Reproducir el vídeo de fondo',
    'slider label': 'Banner principal',
    'previous label': 'Diapositiva anterior',
    'next label': 'Diapositiva siguiente',
    'slide label': '{n} de {total}',
  },
  nl: {
    'pause label': 'Achtergrondvideo pauzeren',
    'play label': 'Achtergrondvideo afspelen',
    'slider label': 'Hoofdbanner',
    'previous label': 'Vorige dia',
    'next label': 'Volgende dia',
    'slide label': '{n} van {total}',
  },
  pt: {
    'pause label': 'Pausar o vídeo de fundo',
    'play label': 'Reproduzir o vídeo de fundo',
    'slider label': 'Banner principal',
    'previous label': 'Slide anterior',
    'next label': 'Próximo slide',
    'slide label': '{n} de {total}',
  },
  el: {
    'pause label': 'Παύση βίντεο φόντου',
    'play label': 'Αναπαραγωγή βίντεο φόντου',
    'slider label': 'Κεντρικό banner',
    'previous label': 'Προηγούμενη διαφάνεια',
    'next label': 'Επόμενη διαφάνεια',
    'slide label': '{n} από {total}',
  },
  ja: {
    'pause label': '背景動画を一時停止',
    'play label': '背景動画を再生',
    'slider label': 'メインビジュアル',
    'previous label': '前のスライド',
    'next label': '次のスライド',
    'slide label': '{n}/{total}',
  },
};

const LABEL_KEYS = ['pause-label', 'play-label', 'slider-label', 'previous-label', 'next-label', 'slide-label'];

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

/**
 * Resolves once the stage image has loaded and decoded (at once without an image, or when it
 * fails), so the video starts after it: its poster is then the image's own currentSrc (no second
 * request) and the video doesn't take over as the page's largest paint.
 */
function imageReady(img) {
  if (!img) return Promise.resolve();
  const loaded = img.complete && img.naturalWidth
    ? Promise.resolve()
    : new Promise((resolve) => {
      img.addEventListener('load', resolve, { once: true });
      img.addEventListener('error', resolve, { once: true });
    });
  return loaded.then(() => (img.decode ? img.decode().catch(() => {}) : undefined));
}

/**
 * Keeps the full-bleed stage at the layout width (no horizontal overflow under a classic
 * scrollbar, whether or not the browser's 100vw includes it).
 */
function trackScrollbar(block) {
  const update = () => {
    block.style.setProperty('--hero-campaign-viewport', `${document.documentElement.clientWidth}px`);
  };
  update();
  window.addEventListener('resize', update, { passive: true });
  // the scrollbar appears once the page grows taller than the viewport (no resize event)
  if (window.ResizeObserver) new ResizeObserver(update).observe(document.body);
}

/**
 * Adds the muted, looping background video and its pause/play toggle.
 * @param {Element} block
 * @param {Element} media
 * @param {string} src
 * @param {Object} labels
 * @param {string} uid the stage's id suffix (the block's number, a slide's number-slide)
 */
function addBackgroundVideo(block, media, src, labels, uid) {
  // kept when the video fails (e.g. a browser without H.264): the stage still had one
  block.dataset.backgroundVideo = 'true';
  const img = media.querySelector('img');
  const video = document.createElement('video');
  video.id = `hero-campaign-video-${uid}`;
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

/** Whether the stage's image loads eagerly: the block is in one of the first two sections. */
function stageEager(block) {
  const section = block.closest('.section');
  const sections = section && section.parentElement
    ? [...section.parentElement.querySelectorAll(':scope > .section')] : [];
  return !section || sections.indexOf(section) < 2;
}

/**
 * One stage: background image (optionally with a muted looping background video) and text placed
 * directly on the media, out of the rows the element holds.
 * @param {Element} block the block, or one slide of option slider
 * @param {Object} labels
 * @param {{eager: boolean, region: boolean, uid: string}} options region: the block is the region
 *   its heading names (a slide is a group of the slider instead)
 */
function decorateStage(block, labels, { eager, region, uid }) {
  // background image: the first picture anywhere in the block
  const media = document.createElement('div');
  media.className = 'hero-campaign-media';
  const picture = block.querySelector('picture');
  if (picture) {
    const img = picture.querySelector('img');
    const optimized = img && img.src
      ? keepImageSize(img, createOptimizedPicture(img.src, img.alt || '', eager, [
        { media: '(min-width: 600px)', width: '2000' },
        { width: '750' },
      ]))
      : picture;
    picture.remove();
    media.append(optimized);
  }

  // background video: the first link to an .mp4 file
  const videoLink = [...block.querySelectorAll('a[href]')].find(isVideoLink);
  const videoSrc = videoLink ? videoLink.href : '';
  if (videoLink) videoLink.remove();
  // its subtitle links (.vtt) are not calls to action: a muted background video shows no text
  block.querySelectorAll('a[href]').forEach((a) => {
    if (/\.vtt$/i.test(a.pathname || '')) a.remove();
  });

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
    heading.id = heading.id || `hero-campaign-heading-${uid}`;
    if (region) {
      block.setAttribute('role', 'region');
      block.setAttribute('aria-labelledby', heading.id);
    }
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

  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (videoSrc && !reducedMotion) {
    // after the load event and after the stage image has loaded and decoded
    afterLoad(() => imageReady(media.querySelector('img'))
      .then(() => addBackgroundVideo(block, media, videoSrc, labels, uid)));
  }
}

/** The rows of option slider per slide: a row with a picture starts one (earlier rows join it). */
function slideRows(block) {
  const groups = [];
  [...block.children].forEach((row) => {
    if (row.querySelector('picture, img') || !groups.length) groups.push([]);
    groups[groups.length - 1].push(row);
  });
  return groups;
}

/**
 * Option slider: several stages, one at a time (www.lufthansa-cargo.com's homepage stage): each row
 * with a picture starts a slide, the rows after it are its text (a slide reads like a hero-campaign
 * of its own); the block's other options apply to every slide. As carousel-images: a region
 * (aria-roledescription carousel), slides as groups labelled "1 of 3", previous/next buttons,
 * dots (aria-current), arrow keys on the track; no automatic rotation. Only the first slide's
 * image loads eagerly. Fewer than two slides: false (the block is one stage as without the option).
 * @param {Element} block
 * @param {Object} labels
 * @param {boolean} eager
 */
function buildSlider(block, labels, eager) {
  const groups = slideRows(block);
  if (groups.length < 2) return false;
  const uid = `hero-campaign-${instanceCount}`;
  const options = [...block.classList].filter((c) => !['block', 'hero-campaign', 'slider'].includes(c) && !c.startsWith('hero-campaign'));
  const slideLabel = (i) => labels['slide label'].replace('{n}', i + 1).replace('{total}', groups.length);
  const track = document.createElement('div');
  track.className = 'hero-campaign-track';
  track.id = `${uid}-track`;
  const slides = groups.map((rows, i) => {
    const slide = document.createElement('div');
    slide.className = ['hero-campaign', 'hero-campaign-slide', ...options].join(' ');
    slide.append(...rows);
    decorateStage(slide, labels, { eager: eager && i === 0, region: false, uid: `${instanceCount}-${i + 1}` });
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', slideLabel(i));
    track.append(slide);
    return slide;
  });
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  block.setAttribute('aria-label', labels['slider label']);

  const current = () => {
    const i = Math.round((track.scrollLeft || 0) / (track.clientWidth || 1));
    return Math.max(0, Math.min(slides.length - 1, i));
  };
  const goTo = (i) => {
    const index = (i + slides.length) % slides.length;
    track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' });
  };
  const button = (dir) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `hero-campaign-${dir}`;
    btn.setAttribute('aria-controls', track.id);
    btn.setAttribute('aria-label', labels[`${dir === 'next' ? 'next' : 'previous'} label`]);
    btn.addEventListener('click', () => goTo(current() + (dir === 'next' ? 1 : -1)));
    return btn;
  };
  const prev = button('prev');
  const next = button('next');
  const dots = document.createElement('ol');
  dots.className = 'hero-campaign-dots';
  const dotButtons = slides.map((slide, i) => {
    const li = document.createElement('li');
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'hero-campaign-dot';
    dot.setAttribute('aria-label', slideLabel(i));
    dot.setAttribute('aria-controls', track.id);
    dot.addEventListener('click', () => goTo(i));
    li.append(dot);
    dots.append(li);
    return dot;
  });
  const update = () => {
    const index = current();
    dotButtons.forEach((dot, i) => {
      if (i === index) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    slides.forEach((slide, i) => slide.classList.toggle('hero-campaign-current', i === index));
  };
  let frame;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  }, { passive: true });
  track.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    goTo(current() + (e.key === 'ArrowRight' ? 1 : -1));
  });
  track.tabIndex = 0;
  block.replaceChildren(track, prev, next, dots);
  update();
  return true;
}

/**
 * Full-bleed campaign stage: background image (optionally with a muted looping background video)
 * and text placed directly on the media. Option slider: several stages (buildSlider).
 * @param {Element} block
 */
export default function decorate(block) {
  instanceCount += 1;
  const labels = resolveLabels(DEFAULT_LABELS, takeLabelRows(block), getLocale().lang);
  const eager = stageEager(block);
  if (block.classList.contains('slider') && buildSlider(block, labels, eager)) {
    trackScrollbar(block);
    return;
  }
  decorateStage(block, labels, { eager, region: true, uid: String(instanceCount) });
  trackScrollbar(block);
}
