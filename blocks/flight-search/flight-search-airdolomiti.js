/*
 * Air Dolomiti's flight search (the block's variant airdolomiti, loaded by flight-search.js for it
 * only), as www.airdolomiti.it's booking widget (390 and 1440 px, 2026-11-05):
 * - the trip type as two radio tabs ("Andata / Ritorno", "Solo andata") in place of the
 *   drop-down. The block's select stays the source of truth, hidden: a tab sets it and fires its
 *   change, so the return date and the shop hand-off follow as before.
 * - with an Open label row (the homepages): on phones and tablets (below 1025px,
 *   styles/themes/airdolomiti.css) the card "Prenota il tuo volo" on the stage opens the search as
 *   a full-screen panel with a round close button, as www's; the close button or Escape closes
 *   it. The focus goes to the close button on opening and back to the card on closing. From
 *   1025px the card is hidden and the search shows in place.
 */

const CLOSE_LABELS = { it: 'Chiudi', en: 'Close', de: 'Schließen' };

let count = 0;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function tripTypeTabs(select) {
  const wrap = select.closest('.flight-search-trip-type') || select.parentElement;
  const label = wrap && wrap.querySelector('label');
  const group = el('div', 'flight-search-trip-tabs');
  group.setAttribute('role', 'radiogroup');
  if (label && label.textContent.trim()) group.setAttribute('aria-label', label.textContent.trim());
  count += 1;
  const name = `flight-search-trip-${count}`;
  const tabs = [...select.options].map((option) => {
    const tab = el('label', 'flight-search-trip-tab');
    const radio = el('input');
    radio.type = 'radio';
    radio.name = name;
    radio.value = option.value;
    radio.checked = option.value === select.value;
    tab.append(radio, el('span', 'flight-search-trip-tab-label', option.textContent));
    group.append(tab);
    return { tab, radio };
  });
  const mark = () => tabs.forEach(({ tab, radio }) => tab.classList.toggle('is-checked', radio.checked));
  tabs.forEach(({ radio }) => radio.addEventListener('change', () => {
    if (!radio.checked) return;
    [...select.options].forEach((option) => { option.selected = option.value === radio.value; });
    tabs.forEach((t) => { t.radio.checked = t.radio === radio; });
    select.dispatchEvent(new Event('change', { bubbles: true }));
    mark();
  }));
  mark();
  if (wrap) {
    wrap.hidden = true;
    wrap.after(group);
  }
  return group;
}

function bookingOverlay(block, form, openLabel, lang) {
  count += 1;
  if (!form.id) form.id = `flight-search-panel-${count}`;
  const card = el('button', 'flight-search-open', openLabel);
  card.type = 'button';
  card.setAttribute('aria-expanded', 'false');
  card.setAttribute('aria-controls', form.id);
  const close = el('button', 'flight-search-close-panel');
  close.type = 'button';
  close.setAttribute('aria-label', CLOSE_LABELS[lang] || CLOSE_LABELS.en);
  const toggle = (open) => {
    block.classList.toggle('flight-search-overlay-open', open);
    card.setAttribute('aria-expanded', String(open));
    (open ? close : card).focus();
  };
  card.addEventListener('click', () => toggle(true));
  close.addEventListener('click', () => toggle(false));
  form.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && block.classList.contains('flight-search-overlay-open')) toggle(false);
  });
  form.prepend(close);
  form.before(card);
  block.classList.add('flight-search-overlay');
}

/**
 * @param {Element} block the flight search block
 * @param {{form: HTMLFormElement, select?: HTMLSelectElement, openLabel?: string, lang?: string}}
 *   opts the block's form and trip type select, the Open label row's text, the page's language
 */
export default function decorateAirDolomiti(block, {
  form, select, openLabel = '', lang = 'it',
}) {
  if (select) tripTypeTabs(select);
  if (openLabel && form) bookingOverlay(block, form, openLabel, lang);
}
