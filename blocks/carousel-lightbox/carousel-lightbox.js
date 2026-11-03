import { createOptimizedPicture } from '../../scripts/aem.js';
import { getLocale } from '../../scripts/locale.js';
import {
  toConfigKey, cleanText, resolveLabels, stripZeroWidth, decorateExternalLinks,
} from '../../scripts/block-config.js';

/**
 * UI strings; authors override any of them with a two-cell row such as
 * "Close label | Schließen". {n} and {total} are replaced in the slide label.
 */
const DEFAULT_LABELS = {
  en: {
    'open label': 'Enlarge image',
    'close label': 'Close',
    'previous label': 'Previous image',
    'next label': 'Next image',
    'dialog label': 'Image gallery',
    'slide label': '{n} of {total}',
  },
  de: {
    'open label': 'Bild vergrößern',
    'close label': 'Schließen',
    'previous label': 'Vorheriges Bild',
    'next label': 'Nächstes Bild',
    'dialog label': 'Bildergalerie',
    'slide label': '{n} von {total}',
  },
  fr: {
    'open label': 'Agrandir l’image',
    'close label': 'Fermer',
    'previous label': 'Image précédente',
    'next label': 'Image suivante',
    'dialog label': 'Galerie d’images',
    'slide label': '{n} sur {total}',
  },
  es: {
    'open label': 'Ampliar imagen',
    'close label': 'Cerrar',
    'previous label': 'Imagen anterior',
    'next label': 'Imagen siguiente',
    'dialog label': 'Galería de imágenes',
    'slide label': '{n} de {total}',
  },
  el: {
    'open label': 'Μεγέθυνση εικόνας',
    'close label': 'Κλείσιμο',
    'previous label': 'Προηγούμενη εικόνα',
    'next label': 'Επόμενη εικόνα',
    'dialog label': 'Συλλογή εικόνων',
    'slide label': '{n} από {total}',
  },
  it: {
    'open label': 'Ingrandisci immagine',
    'close label': 'Chiudi',
    'previous label': 'Immagine precedente',
    'next label': 'Immagine successiva',
    'dialog label': 'Galleria di immagini',
    'slide label': '{n} di {total}',
  },
  ja: {
    'open label': '画像を拡大',
    'close label': '閉じる',
    'previous label': '前の画像',
    'next label': '次の画像',
    'dialog label': '画像ギャラリー',
    'slide label': '{n}/{total}',
  },
  ko: {
    'open label': '이미지 확대',
    'close label': '닫기',
    'previous label': '이전 이미지',
    'next label': '다음 이미지',
    'dialog label': '이미지 갤러리',
    'slide label': '{n}/{total}',
  },
  nl: {
    'open label': 'Afbeelding vergroten',
    'close label': 'Sluiten',
    'previous label': 'Vorige afbeelding',
    'next label': 'Volgende afbeelding',
    'dialog label': 'Afbeeldingengalerij',
    'slide label': '{n} van {total}',
  },
  pl: {
    'open label': 'Powiększ zdjęcie',
    'close label': 'Zamknij',
    'previous label': 'Poprzednie zdjęcie',
    'next label': 'Następne zdjęcie',
    'dialog label': 'Galeria zdjęć',
    'slide label': '{n} z {total}',
  },
  pt: {
    'open label': 'Ampliar imagem',
    'close label': 'Fechar',
    'previous label': 'Imagem anterior',
    'next label': 'Imagem seguinte',
    'dialog label': 'Galeria de imagens',
    'slide label': '{n} de {total}',
  },
  ru: {
    'open label': 'Увеличить изображение',
    'close label': 'Закрыть',
    'previous label': 'Предыдущее изображение',
    'next label': 'Следующее изображение',
    'dialog label': 'Галерея изображений',
    'slide label': '{n} из {total}',
  },
  zh: {
    'open label': '放大图片',
    'close label': '关闭',
    'previous label': '上一张图片',
    'next label': '下一张图片',
    'dialog label': '图片库',
    'slide label': '第 {n} 张，共 {total} 张',
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
 * Splits rows into slides (a row with an image), label rows (2 cells, known key) and intro
 * content (rows without an image before the first slide that are not label rows: headings and
 * text shown above the preview, in its column).
 */
function readRows(block) {
  const config = {};
  const slides = [];
  const intro = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const img = row.querySelector('img');
    if (img) {
      const captionNodes = [];
      cells.forEach((cell) => {
        if (cell.contains(img)) {
          // text authored next to the image in the same cell still counts as caption
          const pic = img.closest('picture') || img;
          const holder = pic.parentElement && pic.parentElement !== cell
            && pic.parentElement.tagName === 'P' && !cleanText(pic.parentElement)
            ? pic.parentElement : pic;
          holder.remove();
        }
        [...cell.childNodes].forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;
          if (node.nodeType === Node.ELEMENT_NODE && !cleanText(node)) return;
          captionNodes.push(node);
        });
      });
      slides.push({ src: img.src, alt: stripZeroWidth(img.alt || ''), captionNodes });
      return;
    }
    const key = cells.length === 2 ? toConfigKey(cleanText(cells[0])) : '';
    if (LABEL_KEYS.includes(key)) {
      if (!config[key]) config[key] = { text: cleanText(cells[1]) };
      return;
    }
    if (slides.length) return;
    cells.forEach((cell) => {
      [...cell.childNodes].forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          if (!node.textContent.trim()) return;
          const p = el('p');
          p.textContent = node.textContent.trim();
          intro.push(p);
          return;
        }
        if (node.nodeType === Node.ELEMENT_NODE && cleanText(node)) intro.push(node);
      });
    });
  });
  return { config, slides, intro };
}

/**
 * Inline preview of the first slide (below the optional intro); opens every slide in a modal
 * carousel.
 * @param {Element} block
 */
/**
 * Option half: this block and the half block right after it share one row from 768px (two
 * slideshows of one Lufthansa column view). The first of the two wraps both wrappers in
 * div.carousel-lightbox-pair.
 * @param {Element} block
 */
function pairHalves(block) {
  const wrapper = block.parentElement;
  const isHalf = (w) => w && w.classList.contains('carousel-lightbox-wrapper')
    && !!w.querySelector(':scope > .carousel-lightbox.half');
  if (!isHalf(wrapper) || wrapper.parentElement.classList.contains('carousel-lightbox-pair')) return;
  const next = wrapper.nextElementSibling;
  if (!isHalf(next)) return;
  const pair = document.createElement('div');
  pair.className = 'carousel-lightbox-pair';
  wrapper.before(pair);
  pair.append(wrapper, next);
}

export default function decorate(block) {
  if (block.classList.contains('half')) pairHalves(block);
  instanceCount += 1;
  const uid = `carousel-lightbox-${instanceCount}`;
  const { config, slides, intro } = readRows(block);
  const labels = resolveLabels(DEFAULT_LABELS, config, getLocale().lang);

  if (!slides.length) {
    block.replaceChildren();
    block.hidden = true;
    return;
  }

  const total = slides.length;
  const slideLabel = (i) => labels['slide label'].replace('{n}', i + 1).replace('{total}', total);

  // inline preview
  const trigger = el('button', 'carousel-lightbox-preview');
  trigger.type = 'button';
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', `${uid}-dialog`);
  trigger.setAttribute('aria-label', slides[0].alt ? `${labels['open label']}: ${slides[0].alt}` : labels['open label']);
  trigger.append(createOptimizedPicture(slides[0].src, slides[0].alt, false, BREAKPOINTS));
  trigger.append(el('span', 'carousel-lightbox-zoom'));
  trigger.lastChild.setAttribute('aria-hidden', 'true');

  // modal
  const dialog = el('dialog', 'carousel-lightbox-dialog');
  dialog.id = `${uid}-dialog`;
  dialog.setAttribute('aria-label', labels['dialog label']);

  const close = el('button', 'carousel-lightbox-close');
  close.type = 'button';
  close.setAttribute('aria-label', labels['close label']);

  const track = el('ul', 'carousel-lightbox-track');
  track.id = `${uid}-track`;
  track.setAttribute('aria-live', 'polite');
  const items = slides.map((slide, i) => {
    const li = el('li', 'carousel-lightbox-slide');
    li.setAttribute('aria-roledescription', 'slide');
    li.setAttribute('aria-label', slideLabel(i));
    const figure = el('figure');
    figure.append(createOptimizedPicture(slide.src, slide.alt, false, BREAKPOINTS));
    if (slide.captionNodes.length) {
      const caption = el('figcaption', 'carousel-lightbox-caption');
      caption.append(...slide.captionNodes);
      figure.append(caption);
    }
    li.append(figure);
    li.hidden = i !== 0;
    return li;
  });
  track.append(...items);

  const stage = el('div', 'carousel-lightbox-stage');
  stage.setAttribute('role', 'region');
  stage.setAttribute('aria-roledescription', 'carousel');
  stage.setAttribute('aria-label', labels['dialog label']);
  stage.append(track);
  dialog.append(close, stage);

  let current = 0;
  let prev;
  let next;
  let counter;
  const show = (index) => {
    current = Math.max(0, Math.min(total - 1, index));
    items.forEach((li, i) => { li.hidden = i !== current; });
    if (counter) counter.textContent = slideLabel(current);
    if (prev) prev.disabled = current === 0;
    if (next) next.disabled = current === total - 1;
  };

  if (total > 1) {
    const makeArrow = (dir) => {
      const btn = el('button', `carousel-lightbox-${dir}`);
      btn.type = 'button';
      btn.setAttribute('aria-controls', track.id);
      btn.setAttribute('aria-label', labels[`${dir === 'next' ? 'next' : 'previous'} label`]);
      btn.addEventListener('click', () => show(current + (dir === 'next' ? 1 : -1)));
      return btn;
    };
    prev = makeArrow('prev');
    next = makeArrow('next');
    stage.prepend(prev);
    stage.append(next);

    // fraction pagination ("1 of 2") as on the source slideshow; the slides carry the same
    // label for assistive technology
    counter = el('p', 'carousel-lightbox-counter');
    counter.setAttribute('aria-hidden', 'true');
    stage.append(counter);

    dialog.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
    });
  }

  const closeDialog = () => {
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  };
  close.addEventListener('click', closeDialog);
  // a click on the backdrop targets the dialog element itself
  dialog.addEventListener('click', (e) => { if (e.target === dialog) closeDialog(); });
  dialog.addEventListener('close', () => {
    trigger.focus();
  });

  trigger.addEventListener('click', () => {
    show(0);
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    close.focus();
  });

  // the preview column: optional intro (headings/text) above the preview button
  const inline = el('div', 'carousel-lightbox-inline');
  if (intro.length) {
    const introBox = el('div', 'carousel-lightbox-intro');
    introBox.append(...intro);
    inline.append(introBox);
  }
  inline.append(trigger);

  block.replaceChildren(inline, dialog);
  show(0);
  decorateExternalLinks(dialog);
}
