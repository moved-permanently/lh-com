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
};

const LABEL_KEYS = Object.keys(DEFAULT_LABELS.en).map(toConfigKey);
const BREAKPOINTS = [{ media: '(min-width: 600px)', width: '2000' }, { width: '750' }];

let instanceCount = 0;

function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

/** Splits rows into slides (a row with an image) and label rows (2 cells, known key). */
function readRows(block) {
  const config = {};
  const slides = [];
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
    if (LABEL_KEYS.includes(key) && !config[key]) config[key] = { text: cleanText(cells[1]) };
  });
  return { config, slides };
}

/**
 * Inline preview of the first slide; opens every slide in a modal carousel.
 * @param {Element} block
 */
export default function decorate(block) {
  instanceCount += 1;
  const uid = `carousel-lightbox-${instanceCount}`;
  const { config, slides } = readRows(block);
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

  block.replaceChildren(trigger, dialog);
  show(0);
  decorateExternalLinks(dialog);
}
