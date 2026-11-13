import { createOptimizedPicture } from '../../scripts/aem.js';
import { getLocale } from '../../scripts/locale.js';
import {
  toConfigKey, cleanText, resolveLabels, stripZeroWidth, keepImageSize, decorateExternalLinks,
} from '../../scripts/block-config.js';

/**
 * UI strings; authors override any of them with a two-cell row such as
 * "Next label | Weiter". {n} and {total} are replaced in the slide label.
 */
const DEFAULT_LABELS = {
  en: {
    'carousel label': 'Image carousel',
    'previous label': 'Previous slide',
    'next label': 'Next slide',
    'slide label': '{n} of {total}',
  },
  de: {
    'carousel label': 'Bilderkarussell',
    'previous label': 'Vorheriges Bild',
    'next label': 'Nächstes Bild',
    'slide label': '{n} von {total}',
  },
  it: {
    'carousel label': 'Carosello di immagini',
    'previous label': 'Slide precedente',
    'next label': 'Slide successiva',
    'slide label': '{n} di {total}',
  },
  fr: {
    'carousel label': 'Carrousel d’images',
    'previous label': 'Diapositive précédente',
    'next label': 'Diapositive suivante',
    'slide label': '{n} sur {total}',
  },
  es: {
    'carousel label': 'Carrusel de imágenes',
    'previous label': 'Diapositiva anterior',
    'next label': 'Diapositiva siguiente',
    'slide label': '{n} de {total}',
  },
  nl: {
    'carousel label': 'Afbeeldingencarrousel',
    'previous label': 'Vorige dia',
    'next label': 'Volgende dia',
    'slide label': '{n} van {total}',
  },
  pt: {
    'carousel label': 'Carrossel de imagens',
    'previous label': 'Slide anterior',
    'next label': 'Próximo slide',
    'slide label': '{n} de {total}',
  },
  el: {
    'carousel label': 'Καρουζέλ εικόνων',
    'previous label': 'Προηγούμενη διαφάνεια',
    'next label': 'Επόμενη διαφάνεια',
    'slide label': '{n} από {total}',
  },
  ja: {
    'carousel label': '画像カルーセル',
    'previous label': '前のスライド',
    'next label': '次のスライド',
    'slide label': '{n}/{total}',
  },
  ru: {
    'carousel label': 'Карусель изображений',
    'previous label': 'Предыдущий слайд',
    'next label': 'Следующий слайд',
    'slide label': '{n} из {total}',
  },
  zh: {
    'carousel label': '图片轮播',
    'previous label': '上一张',
    'next label': '下一张',
    'slide label': '第 {n} 张，共 {total} 张',
  },
  pl: {
    'carousel label': 'Karuzela zdjęć',
    'previous label': 'Poprzedni slajd',
    'next label': 'Następny slajd',
    'slide label': '{n} z {total}',
  },
  // Korean (kr/ko; the wording of www where it has one, the capture of 2026-11-03)
  ko: {
    'carousel label': '이미지 캐러셀',
    'previous label': '이전 슬라이드',
    'next label': '다음 슬라이드',
    'slide label': '{n}/{total}',
  },
};

const LABEL_KEYS = Object.keys(DEFAULT_LABELS.en).map(toConfigKey);
const BREAKPOINTS = [{ media: '(min-width: 600px)', width: '2000' }, { width: '750' }];

let instanceCount = 0;

function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

/**
 * Slides (a row with an image; the rest of the row is the caption) and label rows (2 cells
 * without an image, known key). Other rows are ignored.
 */
function readRows(block) {
  const config = {};
  const slides = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const img = row.querySelector('img');
    if (img) {
      const picture = img.closest('picture') || img;
      // its paragraph goes with it when it holds only this picture (one paragraph can hold
      // a slide's two pictures, standing order 20)
      const alone = (p) => p && p.tagName === 'P' && !cleanText(p) && p.querySelectorAll('img').length === 1;
      const holder = alone(picture.parentElement) ? picture.parentElement : picture;
      const link = img.closest('a[href]');
      const imageCell = cells.find((c) => c.contains(img));
      holder.remove();
      // more pictures in the image's cell (a slide of several image components, one under the
      // other: Brussels' your-summer-in-athens-starts-here, standing order 20), in order
      const others = imageCell ? [...imageCell.querySelectorAll('img')] : [];
      const more = others.map((other) => {
        const pic = other.closest('picture') || other;
        const own = alone(pic.parentElement) ? pic.parentElement : pic;
        const a = other.closest('a[href]');
        own.remove();
        return { img: other, alt: stripZeroWidth(other.alt || ''), href: a ? a.getAttribute('href') : '' };
      });
      const caption = [];
      cells.forEach((cell) => {
        [...cell.childNodes].forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;
          if (node.nodeType === Node.ELEMENT_NODE && !cleanText(node)) return;
          caption.push(node);
        });
      });
      slides.push({
        img, alt: stripZeroWidth(img.alt || ''), href: link ? link.getAttribute('href') : '', caption, more,
      });
      return;
    }
    const key = cells.length === 2 ? toConfigKey(cleanText(cells[0])) : '';
    if (LABEL_KEYS.includes(key)) config[key] = { text: cleanText(cells[1]) };
  });
  return { config, slides };
}

/** A slide's picture, in its link if it has one. */
function slidePicture({ img, alt, href }) {
  const picture = keepImageSize(img, createOptimizedPicture(img.src, alt, false, BREAKPOINTS));
  if (!href) return picture;
  const a = el('a');
  a.href = href;
  a.append(picture);
  return a;
}

function buildSlide(slide, label) {
  // a group, not a list item (axe list: a ul holds only listitems; brief 370)
  const li = el('div', 'carousel-images-slide');
  li.setAttribute('role', 'group');
  li.setAttribute('aria-roledescription', 'slide');
  li.setAttribute('aria-label', label);
  const figure = el('figure', 'carousel-images-figure');
  const media = el('div', 'carousel-images-image');
  media.append(slidePicture(slide));
  (slide.more || []).forEach((other) => media.append(slidePicture(other)));
  figure.append(media);
  if (slide.caption.length) {
    const caption = el('figcaption', 'carousel-images-caption');
    // a single paragraph is unwrapped, several stay paragraphs
    const [first] = slide.caption;
    if (slide.caption.length === 1 && first.nodeType === Node.ELEMENT_NODE && first.tagName === 'P') {
      caption.append(...first.childNodes);
    } else {
      caption.append(...slide.caption);
    }
    figure.append(caption);
  }
  li.append(figure);
  return li;
}

/**
 * Image carousel, one slide at a time (Lufthansa .new-carousel .swiper-single-slide): the
 * current slide centred, its neighbours peeking in at the sides, next/previous arrows from
 * 1025px and dots.
 * @param {Element} block
 */
export default function decorate(block) {
  instanceCount += 1;
  const uid = `carousel-images-${instanceCount}`;
  const { config, slides } = readRows(block);
  const labels = resolveLabels(DEFAULT_LABELS, config, getLocale().lang);
  if (!slides.length) {
    block.replaceChildren();
    block.hidden = true;
    return;
  }

  const slideLabel = (i) => labels['slide label'].replace('{n}', i + 1).replace('{total}', slides.length);
  const track = el('div', 'carousel-images-track');
  track.id = `${uid}-track`;
  const items = slides.map((slide, i) => buildSlide(slide, slideLabel(i)));
  track.append(...items);
  decorateExternalLinks(track);

  const viewport = el('div', 'carousel-images-viewport');
  viewport.append(track);
  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  block.setAttribute('aria-label', labels['carousel label']);

  if (items.length < 2) {
    block.classList.add('carousel-images-single');
    block.replaceChildren(viewport);
    return;
  }

  // the slide whose centre is nearest the centre of the track
  const currentIndex = () => {
    const center = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    let bestDistance = Infinity;
    items.forEach((li, i) => {
      const distance = Math.abs(li.offsetLeft + li.offsetWidth / 2 - center);
      if (distance < bestDistance) {
        best = i;
        bestDistance = distance;
      }
    });
    return best;
  };
  const goTo = (i) => {
    const li = items[Math.max(0, Math.min(items.length - 1, i))];
    const left = li.offsetLeft + li.offsetWidth / 2 - track.clientWidth / 2;
    track.scrollTo({ left, behavior: 'smooth' });
  };

  const makeButton = (dir) => {
    const btn = el('button', `carousel-images-${dir}`);
    btn.type = 'button';
    btn.setAttribute('aria-controls', track.id);
    btn.setAttribute('aria-label', labels[`${dir === 'next' ? 'next' : 'previous'} label`]);
    btn.addEventListener('click', () => goTo(currentIndex() + (dir === 'next' ? 1 : -1)));
    return btn;
  };
  // the track scrolls with the arrow keys (below): a Tab stop (axe scrollable-region-focusable)
  track.tabIndex = 0;
  const prev = makeButton('prev');
  const next = makeButton('next');

  const dots = el('ol', 'carousel-images-dots');
  const dotButtons = items.map((li, i) => {
    const item = el('li');
    const dot = el('button', 'carousel-images-dot');
    dot.type = 'button';
    dot.setAttribute('aria-label', slideLabel(i));
    dot.setAttribute('aria-controls', track.id);
    dot.addEventListener('click', () => goTo(i));
    item.append(dot);
    dots.append(item);
    return dot;
  });

  const update = () => {
    const index = currentIndex();
    dotButtons.forEach((dot, i) => {
      if (i === index) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    items.forEach((li, i) => li.classList.toggle('carousel-images-current', i === index));
    prev.disabled = index === 0;
    next.disabled = index === items.length - 1;
  };
  let frame;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  }, { passive: true });
  track.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    goTo(currentIndex() + (e.key === 'ArrowRight' ? 1 : -1));
  });
  if (window.ResizeObserver) new ResizeObserver(update).observe(track);

  block.replaceChildren(viewport, prev, next, dots);
  update();
}
