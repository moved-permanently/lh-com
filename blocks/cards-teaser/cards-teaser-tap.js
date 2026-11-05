/*
 * cards-teaser option slider on brand tap (TAP Air Portugal): www.flytap.com's news swiper on the
 * entertainment pages (/pt-pt/a-bordo/entretenimento, 2026-11-05; R4-10): from 728 px a round
 * previous and next button 16 px either side of the row, two cards in view below 1024 px and
 * three from 1024 px, one card a step, bullets under the row (one per position); on phones the
 * grid, no controls. The row scrolls natively (snap points); www's swiper does not wrap, so
 * previous at the start and next at the end are unavailable (aria-disabled: a keyboard visitor
 * keeps the focus) and do nothing. The list stays the block's own ul (the theme's > ul rules).
 * The look: styles/themes/tap.css.
 */

/** The controls' labels in TAP's languages (English for any other); dot: {n} and {total}. */
export const TAP_NEWS_LABELS = {
  pt: { previous: 'Diapositivo anterior', next: 'Diapositivo seguinte', dot: '{n} de {total}' },
  en: { previous: 'Previous slide', next: 'Next slide', dot: '{n} of {total}' },
  es: { previous: 'Diapositiva anterior', next: 'Diapositiva siguiente', dot: '{n} de {total}' },
  fr: { previous: 'Diapositive précédente', next: 'Diapositive suivante', dot: '{n} sur {total}' },
  de: { previous: 'Vorherige Folie', next: 'Nächste Folie', dot: '{n} von {total}' },
  it: { previous: 'Slide precedente', next: 'Slide successiva', dot: '{n} di {total}' },
  pl: { previous: 'Poprzedni slajd', next: 'Następny slajd', dot: '{n} z {total}' },
};

/**
 * Where the row stands: cards in view, positions (one bullet each), the current one, the ends.
 * @param {{count: number, clientWidth: number, scrollWidth: number, scrollLeft: number,
 *   pitch: number}} row the cards, the row's box and scroll, one card plus the gap
 */
export function sliderState({
  count, clientWidth, scrollWidth, scrollLeft, pitch,
}) {
  const scrollable = scrollWidth > clientWidth + 1;
  const perView = scrollable && pitch > 0 ? Math.max(1, Math.round(clientWidth / pitch)) : count;
  const positions = Math.max(1, count - perView + 1);
  const at = pitch > 0 ? Math.min(positions - 1, Math.max(0, Math.round(scrollLeft / pitch))) : 0;
  return {
    perView,
    positions,
    at,
    atStart: scrollLeft <= 1,
    atEnd: !scrollable || scrollLeft + clientWidth >= scrollWidth - 1,
    scrollable,
  };
}

let count = 0;

/**
 * @param {Element} block the decorated cards-teaser (its ul of cards)
 * @param {{lang: string}} options the page's language
 */
export default function decorateTapNews(block, { lang }) {
  const track = block.querySelector(':scope > ul');
  if (!track) return;
  count += 1;
  track.id = `cards-teaser-track-${count}`;
  block.classList.add('cards-teaser-tap-slider');
  const labels = TAP_NEWS_LABELS[lang] || TAP_NEWS_LABELS.en;

  const button = (dir) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `cards-teaser-${dir}`;
    b.setAttribute('aria-controls', track.id);
    b.setAttribute('aria-label', labels[dir === 'prev' ? 'previous' : 'next']);
    return b;
  };
  const prev = button('prev');
  const next = button('next');
  const dots = document.createElement('div');
  dots.className = 'cards-teaser-dots';

  // one step: from a card to the next (a card may sit inside its column, TAP's text cards 16 px),
  // else a card and the gap
  const pitch = () => {
    const first = track.firstElementChild;
    if (!first) return track.clientWidth;
    const second = first.nextElementSibling;
    const box = first.getBoundingClientRect();
    const apart = second ? second.getBoundingClientRect().left - box.left : 0;
    if (apart > 0) return apart;
    return box.width + (parseFloat(getComputedStyle(track).columnGap) || 0);
  };
  const state = () => sliderState({
    count: track.children.length,
    clientWidth: track.clientWidth,
    scrollWidth: track.scrollWidth,
    scrollLeft: track.scrollLeft,
    pitch: pitch(),
  });
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const go = (by) => {
    if (by) track.scrollBy({ left: by * pitch(), behavior: reduced ? 'auto' : 'smooth' });
  };
  prev.addEventListener('click', () => { if (!state().atStart) go(-1); });
  next.addEventListener('click', () => { if (!state().atEnd) go(1); });

  const update = () => {
    const s = state();
    prev.setAttribute('aria-disabled', String(s.atStart));
    next.setAttribute('aria-disabled', String(s.atEnd));
    block.classList.toggle('cards-teaser-static', !s.scrollable);
    const total = s.scrollable ? s.positions : 0;
    if (dots.children.length !== total) {
      dots.replaceChildren(...Array.from({ length: total }, (_, i) => {
        const d = document.createElement('button');
        d.type = 'button';
        d.setAttribute('aria-controls', track.id);
        d.setAttribute('aria-label', labels.dot.replace('{n}', i + 1).replace('{total}', total));
        d.addEventListener('click', () => go(i - state().at));
        return d;
      }));
    }
    [...dots.children].forEach((d, i) => {
      if (i === s.at) d.setAttribute('aria-current', 'true');
      else d.removeAttribute('aria-current');
    });
  };
  let frame = 0;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  }, { passive: true });
  if (typeof ResizeObserver === 'function') new ResizeObserver(update).observe(track);

  block.replaceChildren(prev, track, next, dots);
  update();
}
