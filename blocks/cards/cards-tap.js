/*
 * cards on brand tap (TAP Air Portugal): the Miles&Go tier cards on phones as www.flytap.com's
 * swiper (brief 483, tools/reports/tap/parity.md row 124): under the row of cards, previous and
 * next (unavailable at the ends: aria-disabled, the focus kept) and a dot per card, the card in
 * view the current one. The row itself scrolls (tap.css: 247 px cards, 24 px apart, snapping);
 * the controls only move it. From 1024 px the cards stand four to a row and tap.css hides the
 * controls. Loaded by cards.js on brand tap, for a list of cards with a picture.
 */

/** The controls' names in TAP's languages (English for any other). */
export const TIER_LABELS = {
  en: { prev: 'Previous slide', next: 'Next slide', slide: 'Slide' },
  pt: { prev: 'Diapositivo anterior', next: 'Diapositivo seguinte', slide: 'Diapositivo' },
  es: { prev: 'Diapositiva anterior', next: 'Diapositiva siguiente', slide: 'Diapositiva' },
  fr: { prev: 'Diapositive précédente', next: 'Diapositive suivante', slide: 'Diapositive' },
  de: { prev: 'Vorherige Folie', next: 'Nächste Folie', slide: 'Folie' },
  it: { prev: 'Diapositiva precedente', next: 'Diapositiva successiva', slide: 'Diapositiva' },
  pl: { prev: 'Poprzedni slajd', next: 'Następny slajd', slide: 'Slajd' },
};

/**
 * The card in view: the scroll position over one card's step (its width and the gap), rounded,
 * within the cards.
 * @param {number} left the row's scrollLeft
 * @param {number} step a card's width and the gap
 * @param {number} count the cards
 */
export function slideAt(left, step, count) {
  if (!step) return 0;
  return Math.max(0, Math.min(count - 1, Math.round(left / step)));
}

/**
 * @param {Element} block a decorated cards block
 */
export default function tierSlider(block) {
  const ul = block.querySelector(':scope > ul');
  const cards = ul ? [...ul.children] : [];
  if (cards.length < 2) return;
  const lang = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
  const t = TIER_LABELS[lang] || TIER_LABELS.en;
  const button = (cls, label) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = cls;
    b.setAttribute('aria-label', label);
    return b;
  };
  const prev = button('cards-tap-prev', t.prev);
  const next = button('cards-tap-next', t.next);
  const dots = cards.map((c, i) => button('cards-tap-dot', `${t.slide} ${i + 1}`));
  const nav = document.createElement('div');
  nav.className = 'cards-tap-nav';
  nav.append(prev, ...dots, next);
  ul.after(nav);

  const step = () => (cards.length > 1 ? cards[1].offsetLeft - cards[0].offsetLeft : 0);
  const at = () => slideAt(ul.scrollLeft, step(), cards.length);
  const show = (i) => {
    dots.forEach((d, k) => d.setAttribute('aria-current', String(k === i)));
    prev.setAttribute('aria-disabled', String(i <= 0));
    next.setAttribute('aria-disabled', String(i >= cards.length - 1));
  };
  const go = (i) => {
    const to = Math.max(0, Math.min(cards.length - 1, i));
    if (typeof ul.scrollTo === 'function') ul.scrollTo({ left: to * step(), behavior: 'smooth' });
    show(to);
  };
  prev.addEventListener('click', () => { if (at() > 0) go(at() - 1); });
  next.addEventListener('click', () => { if (at() < cards.length - 1) go(at() + 1); });
  dots.forEach((d, i) => d.addEventListener('click', () => go(i)));
  ul.addEventListener('scroll', () => show(at()), { passive: true });
  show(0);
}
