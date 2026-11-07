/**
 * Option routes on phones (Air Dolomiti's route cards, www's select-flight-list: MiniCardSlider):
 * under the sideways row, www's two arrows, "previous page" and "next page", each scrolling the row
 * by one card; the previous one disabled at the start, the next one at the end. The theme shows
 * them below 930px only (from 930px the cards are a grid). One card: no arrows. www's count beside
 * them ("undefined (17)" on www) is left out.
 */

// the pager's labels (www's it, en, de); English for the other languages
const LABELS = {
  en: { nav: 'Routes', previous: 'Previous page', next: 'Next page' },
  it: { nav: 'Tratte', previous: 'Pagina precedente', next: 'Pagina successiva' },
  de: { nav: 'Strecken', previous: 'Vorherige Seite', next: 'Nächste Seite' },
};

let instances = 0;

/**
 * @param {Element} block
 * @param {string} lang the page's language
 */
export default function decorateRoutes(block, lang) {
  const ul = block.querySelector(':scope > ul');
  const cards = ul ? [...ul.children] : [];
  if (cards.length < 2) return;
  instances += 1;
  if (!ul.id) ul.id = `cards-teaser-routes-${instances}`;
  const labels = LABELS[lang] || LABELS.en;

  const nav = document.createElement('nav');
  nav.className = 'cards-teaser-routes-nav';
  nav.setAttribute('aria-label', labels.nav);
  const button = (className, label) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = className;
    b.setAttribute('aria-label', label);
    b.setAttribute('aria-controls', ul.id);
    nav.append(b);
    return b;
  };
  const previous = button('cards-teaser-routes-previous', labels.previous);
  const next = button('cards-teaser-routes-next', labels.next);

  // one card: the distance between two cards' starts (the card and the gap)
  const step = () => (cards[1].offsetLeft - cards[0].offsetLeft) || ul.clientWidth;
  const update = () => {
    previous.disabled = ul.scrollLeft <= 1;
    next.disabled = ul.scrollLeft + ul.clientWidth >= ul.scrollWidth - 1;
  };
  previous.addEventListener('click', () => ul.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => ul.scrollBy({ left: step(), behavior: 'smooth' }));
  ul.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  // the row has no size until its section shows (after the block): its size changes tell
  if (typeof ResizeObserver === 'function') new ResizeObserver(update).observe(ul);
  block.append(nav);
  requestAnimationFrame(update);
}
