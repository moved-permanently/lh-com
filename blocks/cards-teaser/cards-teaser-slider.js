import { cleanText } from '../../scripts/block-config.js';

let instances = 0;

/**
 * Option phone-slider (www's .hidden-lg-up swiper of a three-card column view: /de/en/traveltricks'
 * "This might also be of interest to you", brief 441): below 1025px the cards are a row that
 * scrolls one card at a time (cards-teaser.css), a dot per card under it, the current one marked;
 * from 1025px the rows as without the option (nothing scrolls: no dots). A dot's label is its
 * card's title.
 * @param {Element} block
 */
export default function decorateSlider(block) {
  const ul = block.querySelector(':scope > ul');
  const cards = ul ? [...ul.children] : [];
  if (cards.length < 2) return;
  instances += 1;
  ul.id = `cards-teaser-slider-${instances}`;

  const left = (li) => li.offsetLeft - cards[0].offsetLeft;
  const dots = document.createElement('ol');
  dots.className = 'cards-teaser-dots';
  const buttons = cards.map((li, i) => {
    const item = document.createElement('li');
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'cards-teaser-dot';
    dot.setAttribute('aria-label', cleanText(li.querySelector('.cards-teaser-title')) || `${i + 1} / ${cards.length}`);
    dot.setAttribute('aria-controls', ul.id);
    dot.addEventListener('click', () => ul.scrollTo({ left: left(li), behavior: 'smooth' }));
    item.append(dot);
    dots.append(item);
    return dot;
  });

  const update = () => {
    const at = ul.scrollLeft;
    const current = cards.reduce((best, li, i) => (
      Math.abs(left(li) - at) < Math.abs(left(cards[best]) - at) ? i : best), 0);
    buttons.forEach((dot, i) => {
      if (i === current) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    dots.hidden = ul.scrollWidth <= ul.clientWidth + 1;
  };
  let frame;
  ul.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  }, { passive: true });
  if (window.ResizeObserver) new ResizeObserver(update).observe(ul);
  block.append(dots);
  update();
}
