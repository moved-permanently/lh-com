/**
 * Option paged (brief 448: Air Dolomiti's destinations hubs, www's GridTreNews): the cards a page
 * at a time, 9 a page (paged-N: N), under them "previous page", the page numbers and "next page";
 * the current number marked (aria-current="page"), the arrows disabled at the ends. A number or an
 * arrow shows its page; the list's top comes back into view when it is above the window. One page
 * only: a lone "1" between the disabled arrows, as www's (brief 452); no cards: no controls.
 */

// www's labels (airdolomiti-parity-001: it, en, de); English for the other languages
const LABELS = {
  en: { nav: 'Pages', previous: 'Previous page', next: 'Next page' },
  it: { nav: 'Pagine', previous: 'Pagina precedente', next: 'Pagina successiva' },
  de: { nav: 'Seiten', previous: 'Vorherige Seite', next: 'Nächste Seite' },
};

let instances = 0;

/**
 * @param {Element} block
 * @param {string} lang the page's language
 */
export default function decoratePager(block, lang) {
  const ul = block.querySelector(':scope > ul');
  const cards = ul ? [...ul.children] : [];
  const option = [...block.classList].find((c) => /^paged(-\d+)?$/.test(c)) || 'paged';
  const size = Math.max(1, parseInt(option.split('-')[1], 10) || 9);
  const pages = Math.ceil(cards.length / size);
  if (pages < 1) return;
  instances += 1;
  if (!ul.id) ul.id = `cards-teaser-pager-${instances}`;
  const labels = LABELS[lang] || LABELS.en;

  const nav = document.createElement('nav');
  nav.className = 'cards-teaser-pager';
  nav.setAttribute('aria-label', labels.nav);
  const button = (className, text, label) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = className;
    b.setAttribute('aria-controls', ul.id);
    if (text) b.textContent = text;
    if (label) b.setAttribute('aria-label', label);
    nav.append(b);
    return b;
  };
  const previous = button('cards-teaser-pager-arrow cards-teaser-pager-previous', '', labels.previous);
  const numbers = Array.from({ length: pages }, (_, i) => button('cards-teaser-pager-number', String(i + 1)));
  const next = button('cards-teaser-pager-arrow cards-teaser-pager-next', '', labels.next);

  let current = 0;
  const show = (page, scroll) => {
    current = page;
    cards.forEach((li, i) => {
      li.hidden = Math.floor(i / size) !== page;
      // (an inline display: a brand's card rules set display: flex, which hidden alone loses to)
      li.style.display = li.hidden ? 'none' : '';
    });
    numbers.forEach((b, i) => {
      if (i === page) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
    previous.disabled = page === 0;
    next.disabled = page === pages - 1;
    if (scroll && ul.getBoundingClientRect && ul.getBoundingClientRect().top < 0) ul.scrollIntoView({ block: 'start' });
  };
  numbers.forEach((b, i) => b.addEventListener('click', () => show(i, true)));
  previous.addEventListener('click', () => { if (current > 0) show(current - 1, true); });
  next.addEventListener('click', () => { if (current < pages - 1) show(current + 1, true); });
  ul.after(nav);
  show(0, false);
}
