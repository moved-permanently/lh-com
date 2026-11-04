/*
 * cards-icon on brand tap (TAP Air Portugal) when every tile has an icon: www.flytap.com's
 * extras carousel under the booking box (/en-pt, 2026-11-04; its AuxiliaryCarousel swiper): one
 * row of white pills, the icon in a light grey circle left of the label; at 1440 px four pills
 * of 243 px in 1008 px between a round previous and next button (previous disabled at the start);
 * on phones the row alone, swiped, the next pill peeking in. The row scrolls natively (snap
 * points), the buttons step one pill. The look: styles/themes/tap.css.
 */

/** The buttons' labels in TAP's languages (English for any other). */
export const TAP_PILL_LABELS = {
  pt: { previous: 'Diapositivo anterior', next: 'Diapositivo seguinte' },
  en: { previous: 'Previous slide', next: 'Next slide' },
  es: { previous: 'Diapositiva anterior', next: 'Diapositiva siguiente' },
  fr: { previous: 'Diapositive précédente', next: 'Diapositive suivante' },
  de: { previous: 'Vorherige Folie', next: 'Nächste Folie' },
  it: { previous: 'Slide precedente', next: 'Slide successiva' },
  pl: { previous: 'Poprzedni slajd', next: 'Następny slajd' },
};

let count = 0;

/**
 * @param {Element} block the decorated cards-icon (its ul of tiles)
 * @param {{lang: string}} options the page's language
 */
export default function decorateTapPills(block, { lang }) {
  const track = block.querySelector(':scope > ul');
  if (!track) return;
  count += 1;
  track.id = `cards-icon-track-${count}`;
  block.classList.add('cards-icon-tap');
  const labels = TAP_PILL_LABELS[lang] || TAP_PILL_LABELS.en;

  const viewport = document.createElement('div');
  viewport.className = 'cards-icon-viewport';
  viewport.append(track);

  const button = (dir) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `cards-icon-${dir}`;
    b.setAttribute('aria-controls', track.id);
    b.setAttribute('aria-label', labels[dir === 'prev' ? 'previous' : 'next']);
    return b;
  };
  const prev = button('prev');
  const next = button('next');

  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const step = (dir) => {
    const first = track.firstElementChild;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const width = first ? first.getBoundingClientRect().width + gap : track.clientWidth;
    track.scrollBy({ left: dir * width, behavior: reduced ? 'auto' : 'smooth' });
  };
  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));

  const update = () => {
    const scrollable = track.scrollWidth > track.clientWidth + 1;
    prev.disabled = !scrollable || track.scrollLeft <= 1;
    next.disabled = !scrollable || track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    block.classList.toggle('cards-icon-static', !scrollable);
  };
  let frame = 0;
  track.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  }, { passive: true });
  if (typeof ResizeObserver === 'function') new ResizeObserver(update).observe(track);

  block.replaceChildren(prev, viewport, next);
  update();
}
