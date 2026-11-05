/**
 * The offers grid's "Compare cities" (destination-finder grid mode), as www's Discover grid
 * (www.discover-airlines.com/<root>/book/flights/offers; capture discover-parity-001, 2026-11-05:
 * each df-offer-card has a maui-checkbox "Compare cities" in .comparison-checkbox, 10 px from the
 * card's left and 20 px from its bottom; www's app.css .df-compare-modal): on a brand whose config
 * sets gridCompare (scripts/brands.js; the other brands' captures show no compare). A ticked card
 * says "Added to compare" and offers "See comparison", which opens a modal dialog: the headline,
 * one column per ticked destination (picture, city, country, price), a grey section with its
 * activities, "Flight Information" with the duration and the stops (the offer's
 * minimumFlightDuration and numberOfStopovers) and "Calendar" to the destination's page. Texts:
 * www's labels destinationFinder.resultSection.comparison.* (the grid's live labels replace
 * these). Escape or the close button close it, the focus back on the button that opened it.
 * Styles: finder-compare.css, loaded with the first control.
 */

/** www's texts (labels/destinationFinder, recorded de/en and de/de). */
export const COMPARE_LABELS = {
  en: {
    'compare label': 'Compare cities',
    'compare checked label': 'Added to compare',
    'compare open label': 'See comparison',
    'compare added label': '{DESTINATION} has been added to comparison list',
    'compare removed label': '{DESTINATION} has been removed from comparison list',
    'compare headline': 'Compare {TRIPTYPE} destination and flights from {ORIGIN}',
    'compare activities label': 'Activities',
    'compare flight information label': 'Flight Information',
    'compare duration label': 'Duration',
    'compare duration': 'From {HOURS, select, 0 {} other { {HOURS}h }}{MINUTES, select, 0 {} other {{MINUTES}min}}',
    'compare stops label': 'Stops',
    'compare nonstop label': 'Nonstop available',
    'compare stops': 'From {COUNT} {COUNT, plural, =0 {} one {stop} other {stops}}',
    'compare cta label': 'Calendar',
    'compare close label': 'Close',
  },
  de: {
    'compare label': 'Städte vergleichen',
    'compare checked label': 'Zum Vergleich hinzugefügt',
    'compare open label': 'Vergleich ansehen',
    'compare added label': '{DESTINATION} wurde zur Vergleichsliste hinzugefügt',
    'compare removed label': '{DESTINATION} wurde aus der Vergleichsliste entfernt',
    'compare headline': 'Reiseziel und Flüge ab {ORIGIN} vergleichen',
    'compare activities label': 'Aktivitäten',
    'compare flight information label': 'Fluginformationen',
    'compare duration label': 'Dauer',
    'compare duration': 'Ab {HOURS, select, 0 {} other { {HOURS}h }}{MINUTES, select, 0 {} other {{MINUTES}min}}',
    'compare stops label': 'Zwischenstopps',
    'compare nonstop label': 'Nonstop-Flüge verfügbar',
    'compare stops': 'Ab {COUNT} {COUNT, plural, =0 {} one {Zwischenstopp} other {Zwischenstopps}}',
    'compare cta label': 'Kalender',
    'compare close label': 'Schließen',
  },
};

/** www's live label keys of these texts (destinationFinder.destinationFinder.resultSection.*). */
export const COMPARE_LIVE_LABELS = {
  'compare label': 'comparison.unchecked',
  'compare checked label': 'comparison.checked',
  'compare open label': 'comparison.openModal',
  'compare added label': 'comparison.addedSR',
  'compare removed label': 'comparison.removedSR',
  'compare headline': 'comparison.modalHeadline',
  'compare activities label': 'comparison.modalActivitiesHeadline',
  'compare flight information label': 'comparison.modalFlightInformationHeadline',
  'compare duration label': 'comparison.flightDurationHeadline',
  'compare duration': 'comparison.flightDurationTime',
  'compare stops label': 'comparison.modalStopsHeadline',
  'compare nonstop label': 'comparison.nonstopAvailable',
  'compare stops': 'comparison.fromStopsCount',
  'compare cta label': 'comparison.modalCTA',
};

/**
 * www's message format as these labels use it: {NAME}, {NAME, select, 0 {...} other {...}} and
 * {NAME, plural, =0 {...} one {...} other {...}}; spaces collapsed.
 */
export function formatMessage(template, values) {
  const src = String(template || '');
  // the text of the brace group opening at i (its content) and the index after it
  const group = (str, i) => {
    let depth = 0;
    for (let j = i; j < str.length; j += 1) {
      if (str[j] === '{') depth += 1;
      else if (str[j] === '}') {
        depth -= 1;
        if (depth === 0) return [str.slice(i + 1, j), j + 1];
      }
    }
    return [str.slice(i + 1), str.length];
  };
  const render = (str) => {
    let out = '';
    let i = 0;
    while (i < str.length) {
      if (str[i] !== '{') {
        out += str[i];
        i += 1;
      } else {
        const [inner, next] = group(str, i);
        const m = inner.match(/^\s*(\w+)\s*(?:,\s*(select|plural)\s*,([\s\S]*))?$/);
        if (!m) {
          out += `{${inner}}`;
        } else if (!m[2]) {
          out += m[1] in values ? values[m[1]] : `{${inner}}`;
        } else {
          const value = values[m[1]];
          const cases = {};
          let k = 0;
          const body = m[3];
          while (k < body.length) {
            const key = body.slice(k).match(/^\s*(=?[\w-]+)\s*\{/);
            if (!key) break;
            const open = k + key[0].length - 1;
            const [text, after] = group(body, open);
            cases[key[1]] = text;
            k = after;
          }
          const chosen = m[2] === 'plural'
            ? (cases[`=${value}`] ?? (Number(value) === 1 ? cases.one : undefined) ?? cases.other)
            : (cases[String(value)] ?? cases.other);
          out += render(chosen || '');
        }
        i = next;
      }
    }
    return out;
  };
  return render(src).replace(/\s+/g, ' ').trim();
}

/** "From 2h 35min" from minutes; nothing without a duration. */
export function durationText(labels, minutes) {
  const m = Number(minutes);
  if (!Number.isFinite(m) || m <= 0) return '';
  return formatMessage(labels['compare duration'], { HOURS: Math.floor(m / 60), MINUTES: m % 60 });
}

/** "Nonstop available", "From 1 stop", "From 2 stops"; nothing without a count. */
export function stopsText(labels, stops) {
  const n = Number(stops);
  if (stops === undefined || stops === null || !Number.isFinite(n)) return '';
  return n === 0 ? labels['compare nonstop label'] : formatMessage(labels['compare stops'], { COUNT: n });
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

let stylesLoaded = false;
function loadStyles() {
  if (stylesLoaded || !document.head) return;
  stylesLoaded = true;
  const link = el('link');
  link.rel = 'stylesheet';
  link.href = `${(window.hlx && window.hlx.codeBasePath) || ''}/blocks/destination-finder/finder-compare.css`;
  document.head.append(link);
}

const CLOSE_ICON = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="2" fill="none"/></svg>';

/**
 * The compare: a card's control and the dialog.
 * @param {Object} options
 * @param {Object} options.labels COMPARE_LABELS of the language, live labels applied
 * @param {Array<{code: string, name: string}>} options.affinities catalogs/affinities
 * @param {() => {code: string, name: string}} options.origin the grid's origin
 * @param {() => string} options.tripTypeLabel the trip type in the headline ("round trip")
 * @param {(offer: Object) => string} options.price the offer's price text
 * @param {(offer: Object) => string} options.priceLabel "Round trip from"
 * @param {(offer: Object) => string} options.link the destination's page
 * @param {(offer: Object) => string} [options.image] the destination's picture
 * @returns {{element: Element, control: (offer: Object) => Element, selected: () => Object[],
 *   reset: () => void}}
 */
export function createCompare({
  labels, affinities = [], origin, tripTypeLabel, price, priceLabel, link, image = () => '',
}) {
  loadStyles();
  const uid = Math.random().toString(36).slice(2, 8);
  // the ticked offers, in the order ticked (by city code: a re-rendered card keeps its tick)
  const picked = new Map();
  const element = el('div', 'destination-finder-compare-root');
  const live = el('p', 'destination-finder-compare-sr');
  live.setAttribute('aria-live', 'polite');
  const dialog = el('dialog', 'destination-finder-compare-dialog');
  dialog.id = `destination-finder-compare-${uid}`;
  element.append(live, dialog);
  let opener = null;
  const say = (key, offer) => {
    live.textContent = formatMessage(labels[key], { DESTINATION: offer.name || offer.code });
  };
  const nameOf = (code) => (affinities.find((a) => a.code === code) || {}).name || '';

  const isOpen = () => dialog.open || dialog.hasAttribute('open');
  const close = () => {
    if (!isOpen()) return;
    if (typeof dialog.close === 'function') dialog.close();
    dialog.removeAttribute('open');
    if (opener) opener.focus();
  };
  dialog.addEventListener('cancel', (e) => {
    e.preventDefault();
    close();
  });
  dialog.addEventListener('click', (e) => {
    if (e.target !== dialog || typeof dialog.getBoundingClientRect !== 'function') return;
    const r = dialog.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right
      && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) close();
  });

  const column = (offer, first) => {
    const col = el('div', 'destination-finder-compare-destination');
    const head = el('div', 'destination-finder-compare-head');
    const src = image(offer);
    if (src) {
      const img = el('img', 'destination-finder-compare-image');
      img.src = src;
      img.alt = '';
      img.loading = 'lazy';
      img.addEventListener('error', () => img.remove());
      head.append(img);
    }
    head.append(el('h3', 'destination-finder-compare-city', offer.name || offer.code));
    if (offer.country) head.append(el('p', 'destination-finder-compare-country', offer.country));
    const priceText = price(offer);
    if (priceText) {
      const p = el('p', 'destination-finder-compare-price');
      p.append(el('span', 'destination-finder-compare-price-label', priceLabel(offer)), ' ', el('strong', '', priceText));
      head.append(p);
    }
    // the grey section: the activities
    const grey = el('div', 'destination-finder-compare-gray-section');
    grey.append(el('h4', 'destination-finder-compare-label', labels['compare activities label']));
    const list = el('ul', 'destination-finder-compare-activities');
    (offer.affinities || []).map(nameOf).filter(Boolean).forEach((n) => list.append(el('li', '', n)));
    grey.append(list);
    // the flight information: its headline once (sticky over the columns), then each column's
    const flight = el('div', 'destination-finder-compare-flight-headline-row');
    if (first) flight.append(el('h4', 'destination-finder-compare-flight-headline', labels['compare flight information label']));
    const row = (cls, label, value) => {
      const r = el('div', `destination-finder-compare-row ${cls}`);
      r.append(el('h5', 'destination-finder-compare-label', label), el('p', 'destination-finder-compare-value', value || '–'));
      return r;
    };
    const duration = row('destination-finder-compare-duration', labels['compare duration label'], durationText(labels, offer.duration));
    const stops = row('destination-finder-compare-stops', labels['compare stops label'], stopsText(labels, offer.stops));
    const ctaWrap = el('p', 'destination-finder-compare-cta-wrap');
    const cta = el('a', 'destination-finder-compare-cta button secondary', labels['compare cta label']);
    cta.href = link(offer);
    ctaWrap.append(cta);
    col.append(head, grey, flight, duration, stops, ctaWrap);
    return col;
  };

  const open = (from) => {
    opener = from;
    const offers = [...picked.values()];
    const o = origin() || {};
    const headline = el('h2', 'destination-finder-compare-headline', formatMessage(labels['compare headline'], {
      ORIGIN: o.name || o.code || '', TRIPTYPE: tripTypeLabel(),
    }));
    headline.id = `${dialog.id}-headline`;
    dialog.setAttribute('aria-labelledby', headline.id);
    const header = el('div', 'destination-finder-compare-header');
    const closeButton = el('button', 'destination-finder-compare-close');
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', labels['compare close label'] || 'Close');
    closeButton.innerHTML = CLOSE_ICON;
    closeButton.addEventListener('click', close);
    const sticky = el('div', 'destination-finder-compare-sticky-headline');
    sticky.append(headline);
    header.append(sticky, closeButton);
    const grid = el('div', 'destination-finder-compare-destinations');
    offers.forEach((offer, i) => grid.append(column(offer, i === 0)));
    const scroller = el('div', 'destination-finder-compare-scroller');
    scroller.append(grid);
    dialog.style.setProperty('--df-compare-destinations-count', String(offers.length));
    dialog.replaceChildren(header, scroller);
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    closeButton.focus();
  };

  const control = (offer) => {
    const wrap = el('div', 'destination-finder-compare');
    const box = el('input', 'destination-finder-compare-checkbox');
    box.type = 'checkbox';
    box.id = `destination-finder-compare-${uid}-${offer.code}`;
    box.name = `compare-checkbox-${offer.code}`;
    const label = el('label', 'destination-finder-compare-label-text');
    label.setAttribute('for', box.id);
    const seeButton = el('button', 'destination-finder-compare-open', labels['compare open label']);
    seeButton.type = 'button';
    const show = () => {
      box.checked = picked.has(offer.code);
      label.textContent = box.checked ? labels['compare checked label'] : labels['compare label'];
      seeButton.hidden = !box.checked;
    };
    box.addEventListener('change', () => {
      if (box.checked) {
        picked.set(offer.code, offer);
        say('compare added label', offer);
      } else {
        picked.delete(offer.code);
        say('compare removed label', offer);
      }
      show();
    });
    seeButton.addEventListener('click', () => open(seeButton));
    const field = el('div', 'destination-finder-compare-field');
    field.append(box, label);
    wrap.append(field, seeButton);
    show();
    return wrap;
  };

  return {
    element,
    control,
    selected: () => [...picked.values()],
    reset: () => picked.clear(),
  };
}
