import { createOptimizedPicture } from '../../scripts/aem.js';
import { getLocale } from '../../scripts/locale.js';
import {
  resolveLabels, cleanText, decorateExternalLinks, keepImageSize,
} from '../../scripts/block-config.js';
import {
  VIDEO_MARKERS, isVideoLink, isUrlText, isEmbedLink, buildVideo, buildEmbed, decorateMedia,
  loadMediaStyles,
} from '../../scripts/media.js';

const DEFAULT_LABELS = {
  en: { 'play video': 'Play video', 'show image': 'Show image', 'show slide': 'Show slide' },
  de: { 'play video': 'Video abspielen', 'show image': 'Bild anzeigen', 'show slide': 'Folie anzeigen' },
  it: {
    'play video': 'Riproduci video',
    'show image': 'Mostra immagine',
    'show slide': 'Mostra slide',
  },
  fr: {
    'play video': 'Lire la vidéo',
    'show image': 'Afficher l’image',
    'show slide': 'Afficher la diapositive',
  },
  es: {
    'play video': 'Reproducir vídeo',
    'show image': 'Mostrar imagen',
    'show slide': 'Mostrar diapositiva',
  },
  nl: {
    'play video': 'Video afspelen',
    'show image': 'Afbeelding tonen',
    'show slide': 'Dia tonen',
  },
  pt: {
    'play video': 'Reproduzir vídeo',
    'show image': 'Mostrar imagem',
    'show slide': 'Mostrar slide',
  },
  el: {
    'play video': 'Αναπαραγωγή βίντεο',
    'show image': 'Εμφάνιση εικόνας',
    'show slide': 'Εμφάνιση διαφάνειας',
  },
  ja: {
    'play video': '動画を再生',
    'show image': '画像を表示',
    'show slide': 'スライドを表示',
  },
  ru: {
    'play video': 'Воспроизвести видео',
    'show image': 'Показать изображение',
    'show slide': 'Показать слайд',
  },
  zh: {
    'play video': '播放视频',
    'show image': '显示图片',
    'show slide': '显示幻灯片',
  },
  pl: {
    'play video': 'Odtwórz film',
    'show image': 'Pokaż zdjęcie',
    'show slide': 'Pokaż slajd',
  },
};

const BREAKPOINTS = [{ media: '(min-width: 600px)', width: '2000' }, { width: '750' }];

/** Text of a cell outside of links and image captions (video settings markers are not text). */
function textOutsideLinks(cell) {
  const clone = cell.cloneNode(true);
  clone.querySelectorAll('a, p.caption').forEach((el) => el.remove());
  return cleanText(clone).replace(VIDEO_MARKERS, '').trim();
}

/** A cell holding only pictures and links (to media) is a media cell. */
function isMediaCell(cell) {
  const hasMedia = cell.querySelector('picture, img')
    || [...cell.querySelectorAll('a[href]')].some((a) => isVideoLink(a) || isEmbedLink(a));
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
    if (!el.closest('.media-video, .media-embed, .columns-media-multi') && !el.textContent.trim()
      && !el.querySelector('picture, img, a, video, button, iframe')) el.remove();
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
 * (Lufthansa column view with carousel behaviour, .hidden-lg-up swiper). Option cell-slider:
 * the same for the cells of a row (media | text items with carousel behaviour).
 * @param {Element} strip .columns-media-multi, or a .columns-media-row
 * @param {Object} labels
 * @param {string} [label] label key of the dots
 */
function buildSlider(strip, labels, label = 'show image') {
  const slides = [...strip.children];
  const dots = document.createElement('div');
  dots.className = 'columns-media-dots';
  const buttons = slides.map((slide, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.setAttribute('aria-label', `${labels[label]} ${index + 1}`);
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
 * cell, any other cell is a text cell (image captions, p.caption, count as media). Media cells
 * accept several images (shown side by side, option stacked: one under the other),
 * a linked image, or a poster image plus an .mp4 link (click-to-play video).
 * @param {Element} block
 */
export default async function decorate(block) {
  const labels = resolveLabels(DEFAULT_LABELS, {}, getLocale().lang);

  // an icon heading (C8, hrefless a.teaser): the document keeps the heading's SVG icon as a
  // paragraph of its own right after it; it goes back into the heading
  block.querySelectorAll(':is(h3, h4) + p').forEach((p) => {
    const picture = p.querySelector(':scope > picture:only-child');
    const img = picture && picture.querySelector('img');
    if (!img || cleanText(p) || !/\.svg(?:$|[?#])/i.test(img.getAttribute('src') || '')) return;
    p.previousElementSibling.prepend(picture);
    p.remove();
  });

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
        const links = [...cell.querySelectorAll('a[href]')];
        const video = links.find(isVideoLink);
        const embed = !video && links.find(isEmbedLink);
        if (video) cell.prepend(buildVideo(video, cell.querySelector('picture'), labels['play video']));
        if (embed) (embed.closest('p') || embed).replaceWith(buildEmbed(embed));
        if (!video && !embed && cell.querySelectorAll('picture').length > 1) {
          // several images side by side: collect them (with their links) into one strip
          const strip = document.createElement('div');
          strip.className = 'columns-media-multi';
          cell.querySelectorAll('picture').forEach((pic) => {
            const link = pic.closest('a');
            const media = link && link.querySelectorAll('picture').length === 1 ? link : pic;
            // "{caption}" paragraph right after the image's paragraph: image and caption together
            const para = pic.closest('p');
            const caption = para && para.nextElementSibling;
            if (caption && caption.matches('p.caption')) {
              const item = document.createElement('div');
              item.className = 'columns-media-item';
              item.append(media, caption);
              strip.append(item);
            } else strip.append(media);
          });
          cell.prepend(strip);
          if (block.classList.contains('slider')) buildSlider(strip, labels);
        }
      } else {
        cell.classList.add('columns-media-text');
        cell.querySelectorAll('picture').forEach(optimize);
        // a video or embed after running text (business-class: text, then the YouTube player)
        decorateMedia(cell);
      }
      removeEmpty(cell);
    });

    if (cells.length === 2 && mediaIndex >= 0 && cells.some((c) => c.classList.contains('columns-media-text'))) {
      row.classList.add(mediaIndex === 0 ? 'columns-media-media-first' : 'columns-media-media-last');
    }
  });

  // option cell-slider: below 1025px the cells of a row are slides with dots under the row
  if (block.classList.contains('cell-slider')) {
    block.querySelectorAll(':scope > .columns-media-row').forEach((row) => {
      if (row.children.length > 1) buildSlider(row, labels, 'show slide');
    });
  }

  decorateExternalLinks(block);
  if (block.querySelector('.media-video, .media-embed')) await loadMediaStyles();
}
