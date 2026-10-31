import { createOptimizedPicture } from '../../scripts/aem.js';
import { getLocale } from '../../scripts/locale.js';
import {
  toConfigKey, cleanText, resolveLabels, decorateExternalLinks, keepImageSize,
} from '../../scripts/block-config.js';
import { isVideoLink, buildVideo, loadMediaStyles } from '../../scripts/media.js';
import { loadAuthors, loadArticles } from '../../scripts/articles.js';
import { isOwnWwwHost } from '../../scripts/brand.js';

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
  it: {
    'carousel label': 'Carosello',
    'previous label': 'Slide precedenti',
    'next label': 'Slide successive',
    'slide label': '{n} di {total}',
  },
  fr: {
    'carousel label': 'Carrousel',
    'previous label': 'Diapositives précédentes',
    'next label': 'Diapositives suivantes',
    'slide label': '{n} sur {total}',
  },
  es: {
    'carousel label': 'Carrusel',
    'previous label': 'Diapositivas anteriores',
    'next label': 'Diapositivas siguientes',
    'slide label': '{n} de {total}',
  },
  nl: {
    'carousel label': 'Carrousel',
    'previous label': 'Vorige dia’s',
    'next label': 'Volgende dia’s',
    'slide label': '{n} van {total}',
  },
  pt: {
    'carousel label': 'Carrossel',
    'previous label': 'Slides anteriores',
    'next label': 'Próximos slides',
    'slide label': '{n} de {total}',
  },
  el: {
    'carousel label': 'Καρουζέλ',
    'previous label': 'Προηγούμενες διαφάνειες',
    'next label': 'Επόμενες διαφάνειες',
    'slide label': '{n} από {total}',
  },
  ja: {
    'carousel label': 'カルーセル',
    'previous label': '前のスライド',
    'next label': '次のスライド',
    'slide label': '{n}/{total}',
  },
  ru: {
    'carousel label': 'Карусель',
    'previous label': 'Предыдущие слайды',
    'next label': 'Следующие слайды',
    'slide label': '{n} из {total}',
  },
  zh: {
    'carousel label': '轮播',
    'previous label': '上一组',
    'next label': '下一组',
    'slide label': '第 {n} 张，共 {total} 张',
  },
  pl: {
    'carousel label': 'Karuzela',
    'previous label': 'Poprzednie slajdy',
    'next label': 'Następne slajdy',
    'slide label': '{n} z {total}',
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

  // video card (Lufthansa video viewer in a multi-slide swiper, /articles/tags/munich): the
  // poster with the round play button takes the image place (scripts/media.js)
  const videoLink = cells.map((c) => [...c.querySelectorAll('a[href]')].find(isVideoLink)).find(Boolean);
  if (videoLink) {
    const picture = cells.map((c) => c.querySelector('picture')).find(Boolean);
    const img = picture && picture.querySelector('img');
    const poster = img
      ? keepImageSize(img, createOptimizedPicture(img.src, img.alt || '', false, [{ width: '750' }]))
      : null;
    if (picture) picture.remove();
    image.append(buildVideo(videoLink, poster));
    li.classList.add('carousel-cards-video');
  }

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
  // link paragraphs are the arrow CTA; bold / italic links stay buttons (decorateButtons)
  body.querySelectorAll(':scope > p:not(.button-wrapper)').forEach((p) => {
    const links = [...p.querySelectorAll('a[href]')];
    if (links.length && links.map((a) => a.textContent).join('').trim() === p.textContent.trim()) {
      p.classList.add('carousel-cards-cta');
    }
  });

  if (image.children.length) li.append(image);
  else li.classList.add('carousel-cards-text-only');
  if (body.children.length || !videoLink) li.append(body);
  return li;
}

/** Path of an author page link (this site or www.lufthansa.com), or ''. */
function authorPath(link) {
  try {
    const url = new URL(link.getAttribute('href'), window.location.href);
    const local = url.origin === window.location.origin || /\.aem\.(page|live)$/.test(url.hostname)
      || /(^|\.)lufthansa\.com$/.test(url.hostname);
    const m = url.pathname.match(/(\/[a-z]{2}\/[a-z]{2}\/articles\/authors\/[^/.]+)/);
    return local && m ? m[1] : '';
  } catch (e) {
    return '';
  }
}

/** A slide row (image | linked name, description) of an author of the author index. */
function authorRow(author) {
  const row = el('div');
  const image = el('div');
  if (author.image) {
    const picture = el('picture');
    const img = el('img');
    img.src = author.image;
    img.alt = '';
    picture.append(img);
    image.append(picture);
  }
  const body = el('div');
  const h = el('h3');
  const a = el('a');
  a.href = author.path;
  a.textContent = author.name;
  h.append(a);
  body.append(h);
  if (author.description) {
    const p = el('p');
    p.textContent = author.description;
    body.append(p);
  }
  row.append(image, body);
  return row;
}

/**
 * Author slider (option authors): the authors come from the locale's author index
 * (/{cc}/{ll}/articles/authors/query-index.json). Authored rows that link an author page keep
 * their order (www's configured authors) and take name, square image and description from the
 * index (rows of authors without a page in the index stay as authored); without authored rows
 * every author of the index is shown, the one with the newest article first.
 */
async function fillAuthors(block) {
  const locale = getLocale();
  const [authors, articles] = await Promise.all([
    loadAuthors(locale).catch(() => []),
    loadArticles(locale).catch(() => []),
  ]);
  block.dataset.lhSource = authors.length ? 'live' : 'none';
  if (!authors.length) return;
  const byPath = new Map(authors.map((a) => [a.path, a]));
  const rows = [...block.children].filter((r) => r.querySelector('picture, img, a, h1, h2, h3, h4, p'));
  if (!rows.length) {
    const newest = (a) => Math.max(-Infinity, ...articles
      .filter((x) => x.authorId && x.authorId === a.authorId)
      .map((x) => (Number.isNaN(x.time) ? -Infinity : x.time)));
    [...authors].sort((a, b) => newest(b) - newest(a) || a.name.localeCompare(b.name))
      .forEach((a) => block.append(authorRow(a)));
    return;
  }
  rows.forEach((row) => {
    const link = [...row.querySelectorAll('a[href]')].find(authorPath);
    const author = link && byPath.get(authorPath(link));
    if (author) row.replaceWith(authorRow(author));
  });
}

/** Slides in view: 1 (one slide per dot) unless the four-up option shows several at once. */
function slidesPerView(block, track, items) {
  if (!block.classList.contains('four-up') || !items[0].offsetWidth) return 1;
  const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
  return Math.max(1, Math.floor((track.clientWidth + gap) / (items[0].offsetWidth + gap)));
}

export default async function decorate(block) {
  instanceCount += 1;
  const uid = `carousel-cards-${instanceCount}`;
  if (block.classList.contains('authors')) await fillAuthors(block);
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

  // teaser cards (article, grid, four-up): links to lufthansa.com pages (and the brand's own www)
  // outside the site open in the same tab, as on live; article and grid are cards in rows, no
  // carousel controls
  const article = block.classList.contains('article');
  const grid = article || block.classList.contains('grid');
  if (grid || block.classList.contains('four-up')) {
    track.querySelectorAll('a[target="_blank"]').forEach((a) => {
      if (isOwnWwwHost(new URL(a.href).hostname)) a.removeAttribute('target');
    });
  }
  const media = track.querySelector('.media-video') ? loadMediaStyles() : null;
  if (items.length < 2 || grid) {
    block.replaceChildren(viewport);
    await media;
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

  // one dot per page of slides in view (four-up: Lufthansa swiper-multi-slide groups of 4/2/1)
  const dots = el('ol', 'carousel-cards-dots');
  let perView = 0;
  let dotButtons = [];
  const buildDots = () => {
    const n = slidesPerView(block, track, items);
    if (n === perView) return;
    perView = n;
    const pages = Math.ceil(items.length / perView);
    dotButtons = Array.from({ length: pages }, (_, page) => {
      const first = items[page * perView];
      const dotItem = el('li');
      const dot = el('button', 'carousel-cards-dot');
      dot.type = 'button';
      dot.setAttribute('aria-label', perView === 1 ? first.getAttribute('aria-label')
        : labels['slide label'].replace('{n}', page + 1).replace('{total}', pages));
      dot.setAttribute('aria-controls', track.id);
      dot.addEventListener('click', () => {
        track.scrollTo({ left: slideLeft(first), behavior: 'smooth' });
      });
      dotItem.append(dot);
      return dot;
    });
    dots.replaceChildren(...dotButtons.map((d) => d.parentElement));
  };

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
    buildDots();
    const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    const page = atEnd && track.scrollLeft > 1 ? dotButtons.length - 1
      : Math.round(currentIndex() / perView);
    dotButtons.forEach((dot, i) => {
      if (i === page) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    prev.disabled = track.scrollLeft <= 1;
    next.disabled = atEnd;
    const scrollable = track.scrollWidth > track.clientWidth + 1;
    nav.hidden = !scrollable;
    dots.hidden = !scrollable;
  };

  const step = (dir) => {
    const index = currentIndex();
    const target = items[Math.min(items.length - 1, Math.max(0, index + dir * perView))];
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
  await media;
}
