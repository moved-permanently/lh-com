import { createOptimizedPicture } from '../../scripts/aem.js';
import { getLocale } from '../../scripts/locale.js';
import {
  toConfigKey, cleanText, resolveLabels, decorateExternalLinks, keepImageSize,
} from '../../scripts/block-config.js';

/**
 * UI strings; authors override any of them with a two-cell row such as
 * "Previous label | Zurück". {n} and {total} are replaced in the slide label.
 */
const DEFAULT_LABELS = {
  en: {
    'carousel label': 'Carousel',
    'previous label': 'Previous slides',
    'next label': 'Next slides',
    'slide label': '{n} of {total}',
  },
  de: {
    'carousel label': 'Karussell',
    'previous label': 'Vorherige Folien',
    'next label': 'Nächste Folien',
    'slide label': '{n} von {total}',
  },
};

const LABEL_KEYS = Object.keys(DEFAULT_LABELS.en).map(toConfigKey);
const WIDTH_TOKENS = ['wide', 'compact'];

let instanceCount = 0;

function el(tag, className) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  return node;
}

/** Splits authored rows into label rows (consumed as config) and slide rows. */
function readRows(block) {
  const config = {};
  const slides = [];
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const key = cells.length === 2 && !row.querySelector('picture, img') ? toConfigKey(cleanText(cells[0])) : '';
    if (LABEL_KEYS.includes(key)) {
      config[key] = { text: cleanText(cells[1]) };
    } else if (cells.some((c) => c.textContent.trim() || c.querySelector('picture, img'))) {
      slides.push(cells);
    }
  });
  return { config, slides };
}

function buildSlide(cells) {
  const li = el('li', 'carousel-cards-slide');
  const image = el('div', 'carousel-cards-image');
  const body = el('div', 'carousel-cards-body');

  cells.forEach((cell) => {
    const token = cleanText(cell).toLowerCase();
    if (WIDTH_TOKENS.includes(token) && !cell.querySelector('picture, img, a')) {
      li.classList.add(`carousel-cards-${token}`);
      return;
    }
    const picture = cell.querySelector('picture');
    if (picture && !image.children.length) {
      const img = picture.querySelector('img');
      image.append(img
        ? keepImageSize(img, createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]))
        : picture);
      picture.remove();
    }
    [...cell.childNodes].forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE && !node.textContent.trim()) return;
      if (node.nodeType === Node.ELEMENT_NODE && !node.textContent.trim() && !node.querySelector('img, a')) return;
      body.append(node);
    });
  });

  const heading = body.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    let prev = heading.previousElementSibling;
    while (prev) {
      if (prev.tagName === 'P' && !prev.querySelector('a')) prev.classList.add('carousel-cards-eyebrow');
      prev = prev.previousElementSibling;
    }
  }
  body.querySelectorAll(':scope > p').forEach((p) => {
    const links = [...p.querySelectorAll('a[href]')];
    if (links.length && links.map((a) => a.textContent).join('').trim() === p.textContent.trim()) {
      p.classList.add('carousel-cards-cta');
    }
  });

  if (image.children.length) li.append(image);
  li.append(body);
  return li;
}

export default function decorate(block) {
  instanceCount += 1;
  const uid = `carousel-cards-${instanceCount}`;
  const { config, slides } = readRows(block);
  const labels = resolveLabels(DEFAULT_LABELS, config, getLocale().lang);

  const track = el('ul', 'carousel-cards-track');
  track.id = `${uid}-track`;
  const items = slides.map(buildSlide);
  items.forEach((li, i) => {
    li.setAttribute('aria-roledescription', 'slide');
    li.setAttribute('aria-label', labels['slide label'].replace('{n}', i + 1).replace('{total}', items.length));
  });
  track.append(...items);

  const viewport = el('div', 'carousel-cards-viewport');
  viewport.append(track);

  block.setAttribute('role', 'region');
  block.setAttribute('aria-roledescription', 'carousel');
  block.setAttribute('aria-label', labels['carousel label']);
  decorateExternalLinks(track);

  if (items.length < 2) {
    block.replaceChildren(viewport);
    return;
  }

  const nav = el('div', 'carousel-cards-nav');
  const makeButton = (dir) => {
    const btn = el('button', `carousel-cards-${dir}`);
    btn.type = 'button';
    btn.setAttribute('aria-controls', track.id);
    btn.setAttribute('aria-label', labels[`${dir === 'next' ? 'next' : 'previous'} label`]);
    nav.append(btn);
    return btn;
  };
  const prev = makeButton('prev');
  const next = makeButton('next');

  // scroll position of a slide, measured from the first slide so track padding does not count
  const slideLeft = (li) => li.offsetLeft - items[0].offsetLeft;

  const dots = el('ol', 'carousel-cards-dots');
  const dotButtons = items.map((li, i) => {
    const dotItem = el('li');
    const dot = el('button', 'carousel-cards-dot');
    dot.type = 'button';
    dot.setAttribute('aria-label', li.getAttribute('aria-label'));
    dot.setAttribute('aria-controls', track.id);
    dot.addEventListener('click', () => {
      track.scrollTo({ left: slideLeft(items[i]), behavior: 'smooth' });
    });
    dotItem.append(dot);
    dots.append(dotItem);
    return dot;
  });

  const currentIndex = () => {
    const left = track.scrollLeft;
    let best = 0;
    items.forEach((li, i) => {
      const distance = Math.abs(slideLeft(li) - left);
      const bestDistance = Math.abs(slideLeft(items[best]) - left);
      if (distance < bestDistance) best = i;
    });
    return best;
  };

  const update = () => {
    const index = currentIndex();
    dotButtons.forEach((dot, i) => {
      if (i === index) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    prev.disabled = track.scrollLeft <= 1;
    next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    const scrollable = track.scrollWidth > track.clientWidth + 1;
    nav.hidden = !scrollable;
    dots.hidden = !scrollable;
  };

  const step = (dir) => {
    const index = currentIndex();
    const target = items[Math.min(items.length - 1, Math.max(0, index + dir))];
    track.scrollTo({ left: slideLeft(target), behavior: 'smooth' });
  };
  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));

  let frame;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  }, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(update).observe(track);

  viewport.append(nav);
  block.replaceChildren(viewport, dots);
  update();
}
