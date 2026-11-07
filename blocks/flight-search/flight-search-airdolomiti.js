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
 *   1025px the card is hidden and the search shows in place. The header's plane button (parity
 *   row 28) asks for the panel with OPEN_BOOKING; the focus then goes back to it.
 * - www's "flexible dates" box before the button (capture airdolomiti-booking-001): on www it
 *   only sets "flexible" in what the widget sends to Air Dolomiti's own API; the form posted to
 *   the booking engine and the engine's search are the same ticked or not. So the box has no name
 *   and sends nothing, which is www's effect.
 */

const CLOSE_LABELS = { it: 'Chiudi', en: 'Close', de: 'Schließen' };
// the header's request for the booking panel (header-airdolomiti.js's plane button)
export const OPEN_BOOKING = 'airdolomiti:open-booking';
// www's labels (it, en: airdolomiti-booking-001; de: airdolomiti-parity-001's /de/buchung)
const FLEXIBLE_LABELS = { it: 'Date flessibili +/- 3 giorni', en: 'Flexible dates +/- 3 days', de: 'im Zeitraum +/- 3 Tage' };

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
  // who opened it (the card, or the header's plane button): the focus goes back there
  let opener = card;
  const toggle = (open) => {
    block.classList.toggle('flight-search-overlay-open', open);
    card.setAttribute('aria-expanded', String(open));
    // the open panel: a modal dialog named by the card (WCAG 4.1.2), the focus kept inside (2.4.3)
    if (open) {
      form.setAttribute('role', 'dialog');
      form.setAttribute('aria-modal', 'true');
      form.setAttribute('aria-label', openLabel);
    } else {
      ['role', 'aria-modal', 'aria-label'].forEach((a) => form.removeAttribute(a));
    }
    (open ? close : opener).focus();
  };
  card.addEventListener('click', () => {
    opener = card;
    toggle(true);
  });
  close.addEventListener('click', () => toggle(false));
  // the header's plane button (header-airdolomiti.js, parity row 28): this panel, the focus back
  // on it
  document.addEventListener(OPEN_BOOKING, (e) => {
    if (e.defaultPrevented || !block.isConnected) return;
    e.preventDefault();
    opener = (e.detail && e.detail.opener) || card;
    toggle(true);
  });
  form.addEventListener('keydown', (e) => {
    if (!block.classList.contains('flight-search-overlay-open')) return;
    if (e.key === 'Escape') {
      toggle(false);
      return;
    }
    if (e.key !== 'Tab') return;
    const stops = [...form.querySelectorAll('button, input, select, a[href]')]
      .filter((n) => !n.disabled && !n.closest('[hidden]') && n.type !== 'hidden');
    const first = stops[0];
    const last = stops[stops.length - 1];
    if (e.shiftKey && e.target === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && e.target === last) {
      e.preventDefault();
      first.focus();
    }
  });
  form.prepend(close);
  form.before(card);
  block.classList.add('flight-search-overlay');
}

/** www's flexible dates box right before the search button: unticked, no name (nothing sent). */
function flexibleDates(form, lang) {
  const submit = form.querySelector('.flight-search-submit');
  if (!submit) return;
  const label = el('label', 'flight-search-flexible');
  const input = el('input');
  input.type = 'checkbox';
  label.append(
    el('span', 'flight-search-flexible-label', FLEXIBLE_LABELS[lang] || FLEXIBLE_LABELS.it),
    input,
    el('span', 'flight-search-flexible-mark'),
  );
  submit.before(label);
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
  // the passengers where they show, after the dates and before the button (WCAG 2.4.3)
  const passengers = form && form.querySelector('.flight-search-passengers');
  const submit = form && form.querySelector('.flight-search-fields .flight-search-submit');
  if (passengers && submit) submit.before(passengers);
  if (form) flexibleDates(form, lang);
  if (openLabel && form) bookingOverlay(block, form, openLabel, lang);
}
