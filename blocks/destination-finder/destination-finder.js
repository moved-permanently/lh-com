import { getLocale, LIVE_ORIGIN } from '../../scripts/locale.js';
import { lhFetch } from '../../scripts/lh-data.js';
import {
  readConfigRows, pick, resolveLabels, parseAirportCode, parseAirportName, formatPrice,
  decorateExternalLinks,
} from '../../scripts/block-config.js';
import { createAirportCombobox } from '../../scripts/airport-combobox.js';

/* ---------------------------------------------------------------------------------------------
 * Data contract. Request building and response mapping live here so the recorded responses
 * from the live site only require changes in this section.
 * ------------------------------------------------------------------------------------------- */

/** Trip type codes by authored chip position: first chip is round trip, second one way. */
const TRIP_TYPE_CODES = ['RETURN', 'ONEWAY'];

/**
 * Destination recommendations request: the campaign route by default, the region finder
 * route when a region is authored.
 */
function destinationsRoute({
  origin, tripType, tripDuration, region,
}, locale) {
  const params = new URLSearchParams({
    tripType,
    countryCode: locale.country.toUpperCase(),
    languageCode: locale.lang,
  });
  if (tripType === 'RETURN') params.set('tripDuration', tripDuration);
  const base = region
    ? `/service/api/destinationfinder/destination/finder/${encodeURIComponent(origin)}/${encodeURIComponent(region)}`
    : `/service/api/destinationfinder/campaign/${encodeURIComponent(origin)}`;
  return `${base}?${params}`;
}

/** Absolute image URL for images served by the live site. */
function liveImageUrl(src) {
  if (!src) return '';
  try {
    return new URL(src, LIVE_ORIGIN).toString();
  } catch (e) {
    return '';
  }
}

/**
 * Maps the recommendations response to
 * [{ code, name, price, currency, formattedPrice, image }].
 */
function mapDestinations(data) {
  const list = Array.isArray(data) ? data
    : (data && (data.destinations || data.offers || data.recommendations
      || data.items || data.data)) || [];
  const code = (value) => (typeof value === 'string' ? value.toUpperCase() : '');
  return list.map((item) => {
    const destination = typeof item.destination === 'object' && item.destination ? item.destination : item;
    const price = item.price || item.fare || {};
    return {
      code: code(destination.code || destination.iataCode || item.destinationCode
        || (typeof item.destination === 'string' ? item.destination : '')),
      name: destination.cityName || destination.name || item.destinationName || '',
      price: price.amount ?? price.value ?? item.amount ?? (typeof price === 'number' ? price : ''),
      currency: price.currency || price.currencyCode || item.currency || '',
      formattedPrice: price.formatted || item.formattedPrice || '',
      image: liveImageUrl(destination.image || destination.imageUrl || item.image || item.imageUrl),
    };
  }).filter((d) => /^[A-Z]{3}$/.test(d.code));
}

/** Origin display name from the recommendations response, if it carries one. */
function mapOriginName(data) {
  const origin = data && !Array.isArray(data) ? data.origin : null;
  if (!origin || typeof origin !== 'object') return '';
  return origin.cityName || origin.name || '';
}

/** Airport autocomplete request (origin picker). */
function airportSuggestionsRoute(term, locale) {
  const params = new URLSearchParams({
    searchTerm: term,
    countryCode: locale.country.toUpperCase(),
    languageCode: locale.lang,
  });
  return `/service/api/suggestions/airports?${params}`;
}

/** Maps the autocomplete response to [{ code, name, label }]. */
function mapAirportSuggestions(data) {
  const list = Array.isArray(data) ? data
    : (data && (data.airports || data.suggestions || data.items || data.data)) || [];
  return list.map((item) => {
    const code = String(item.code || item.iataCode || item.airportCode || item.cityCode || '').toUpperCase();
    const name = item.cityName || item.name || item.airportName || item.label || '';
    return { code, name, label: name ? `${name} (${code})` : code };
  }).filter((a) => /^[A-Z]{3}$/.test(a.code));
}

/** Link of one recommended destination: the live site's destination page under this locale. */
function buildDestinationLink({
  origin, destination, tripType, tripDuration,
}, locale) {
  const params = new URLSearchParams({
    OriginCode: origin, tripType, DestinationCode: destination,
  });
  if (tripType === 'RETURN') params.set('TripDuration', tripDuration);
  return `${locale.base}/book-and-manage/destination?${params}`;
}

/** Trip type value used by the offers & destinations page links. */
function offersPageTripType(tripType) {
  return tripType === 'ONEWAY' ? 'ONEWAY' : 'ROUNDTRIP';
}

/* ------------------------------------------------------------------------------------------- */

/** Defaults for strings an author may leave out; any can be overridden by a block row. */
const DEFAULT_LABELS = {
  en: {
    heading: 'Flight offers from',
    'origin input label': 'Please choose an origin city',
    'change origin label': 'Change origin',
    'trip type label': 'Type of trip',
    'price label': 'Round trip from',
    'one way price label': 'One way from',
    'previous label': 'Previous',
    'next label': 'Next',
    'no results label': 'No matching airports',
  },
  de: {
    heading: 'Flugangebote ab',
    'origin input label': 'Bitte wählen Sie einen Abflugort',
    'change origin label': 'Abflugort ändern',
    'trip type label': 'Reiseart',
    'price label': 'Hin- und Rückflug ab',
    'one way price label': 'Hinflug ab',
    'previous label': 'Zurück',
    'next label': 'Weiter',
    'no results label': 'Keine passenden Flughäfen',
  },
};

let instanceCount = 0;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function moveCell(cell, className) {
  if (!cell || (!cell.textContent.trim() && !cell.querySelector('img'))) return null;
  const wrap = el('div', className);
  wrap.append(...cell.childNodes);
  return wrap;
}

function renderDestination(dest, state, labels, locale, hasDisclaimer) {
  const li = el('li', 'destination-finder-item');
  const link = el('a', 'destination-finder-link');
  link.href = buildDestinationLink({
    origin: state.origin.code,
    destination: dest.code,
    tripType: state.tripType,
    tripDuration: state.tripDuration,
  }, locale);
  const imageWrap = el('div', 'destination-finder-image');
  if (dest.image) {
    const img = el('img');
    img.src = dest.image;
    img.alt = '';
    img.loading = 'lazy';
    imageWrap.append(img);
  }
  link.append(imageWrap, el('span', 'destination-finder-city', dest.name || dest.code));
  li.append(link);

  const price = dest.formattedPrice || formatPrice(dest.price, dest.currency, locale);
  if (price) {
    const offer = el('p', 'destination-finder-offer');
    const label = state.tripType === 'ONEWAY' ? labels['one way price label'] : labels['price label'];
    const priceEl = el('span', 'destination-finder-price', price);
    if (hasDisclaimer) priceEl.append(el('sup', '', '*'));
    offer.append(el('span', 'destination-finder-price-label', label), priceEl);
    li.append(offer);
  }
  return li;
}

/**
 * Conditions authored as a title paragraph plus text: the title becomes a disclosure
 * (the live site opens the text in a dialog from a "Conditions" link button).
 */
function decorateConditions(conditions) {
  const [title, ...rest] = [...conditions.children];
  if (!title || !rest.length || title.querySelector('a') || !title.textContent.trim()) return;
  const details = el('details');
  const summary = el('summary', 'destination-finder-conditions-toggle', title.textContent.trim());
  const body = el('div', 'destination-finder-conditions-body');
  body.append(...rest);
  details.append(summary, body);
  conditions.replaceChildren(details);
}

function updateAuthoredLinks(root, state) {
  root.querySelectorAll('a[href]').forEach((a) => {
    try {
      const url = new URL(a.href);
      if (!url.searchParams.has('OriginCode')) return;
      url.searchParams.set('OriginCode', state.origin.code);
      if (url.searchParams.has('tripType')) url.searchParams.set('tripType', offersPageTripType(state.tripType));
      a.href = url.toString();
    } catch (e) {
      // leave unparsable links untouched
    }
  });
}

export default function decorate(block) {
  instanceCount += 1;
  const uid = `destination-finder-${instanceCount}`;
  const locale = getLocale();
  const config = readConfigRows(block);
  const labels = resolveLabels(DEFAULT_LABELS, config, locale.lang);
  const text = (...keys) => (pick(config, ...keys) || {}).text || '';
  const cell = (...keys) => (pick(config, ...keys) || {}).cell;

  const originValue = text('default-origin', 'origin');
  const tripTypes = (pick(config, 'trip-types', 'trip-type') || { list: [] }).list.slice(0, 2);
  const state = {
    origin: {
      code: parseAirportCode(originValue) || locale.homeAirport,
      name: parseAirportCode(originValue) ? parseAirportName(originValue) : '',
    },
    tripType: TRIP_TYPE_CODES[0],
    tripDuration: parseInt(text('trip-duration', 'duration'), 10) || 14,
    region: text('region'),
  };

  const finderCard = moveCell(cell('finder-card', 'card'), 'destination-finder-card');
  const disclaimer = moveCell(cell('disclaimer'), 'destination-finder-disclaimer');
  const conditions = moveCell(cell('conditions', 'conditions-label'), 'destination-finder-conditions');
  const cta = moveCell(cell('cta', 'link'), 'destination-finder-cta');
  if (conditions) decorateConditions(conditions);
  const ctaLink = cta && cta.querySelector('a[href]');
  if (ctaLink && !ctaLink.classList.contains('button')) ctaLink.classList.add('button', 'secondary');
  const srHeading = text('sr-heading', 'list-heading', 'recommendations-heading');

  // heading with origin switch
  const header = el('div', 'destination-finder-header');
  const heading = el('h2', 'destination-finder-heading');
  const originButton = el('button', 'destination-finder-origin');
  originButton.type = 'button';
  originButton.setAttribute('aria-expanded', 'false');
  originButton.setAttribute('aria-controls', `${uid}-picker`);
  originButton.setAttribute('aria-label', `${labels['change origin label']}: ${state.origin.name || state.origin.code}`);
  originButton.textContent = state.origin.name || state.origin.code;
  heading.append(document.createTextNode(`${labels.heading} `), originButton);
  header.append(heading);

  const picker = el('div', 'destination-finder-picker');
  picker.id = `${uid}-picker`;
  picker.hidden = true;
  header.append(picker);

  // trip type chips
  let chips;
  if (tripTypes.length) {
    chips = el('fieldset', 'destination-finder-trip-types');
    chips.append(el('legend', 'destination-finder-sr-only', labels['trip type label']));
    const chipRow = el('div', 'destination-finder-chips');
    chips.append(chipRow);
    tripTypes.forEach((type, i) => {
      const label = el('label', 'destination-finder-chip');
      const input = el('input');
      input.type = 'radio';
      input.name = `${uid}-trip-type`;
      input.value = TRIP_TYPE_CODES[i];
      input.checked = i === 0;
      label.append(input, el('span', '', type));
      chipRow.append(label);
    });
    header.append(chips);
  }

  // slider
  const slider = el('div', 'destination-finder-slider');
  if (srHeading) slider.append(el('h3', 'destination-finder-sr-only', srHeading));
  const list = el('ul', 'destination-finder-list');
  list.id = `${uid}-list`;
  list.tabIndex = 0;
  if (srHeading) list.setAttribute('aria-label', srHeading);
  slider.append(list);

  const controls = el('div', 'destination-finder-controls');
  const makeNav = (dir, label) => {
    const btn = el('button', `destination-finder-${dir}`);
    btn.type = 'button';
    btn.setAttribute('aria-label', label);
    btn.setAttribute('aria-controls', list.id);
    btn.addEventListener('click', () => {
      list.scrollBy({ left: (dir === 'next' ? 1 : -1) * list.clientWidth * 0.8, behavior: 'smooth' });
    });
    controls.append(btn);
    return btn;
  };
  const prev = makeNav('prev', labels['previous label']);
  const next = makeNav('next', labels['next label']);
  const updateNav = () => {
    prev.disabled = list.scrollLeft <= 1;
    next.disabled = list.scrollLeft + list.clientWidth >= list.scrollWidth - 1;
  };
  list.addEventListener('scroll', updateNav, { passive: true });
  window.addEventListener('resize', updateNav, { passive: true });

  const footer = el('div', 'destination-finder-footer');
  const notes = el('div', 'destination-finder-notes');
  if (disclaimer) notes.append(disclaimer);
  if (conditions) notes.append(conditions);
  if (notes.children.length) footer.append(notes);
  footer.append(controls);
  if (cta) footer.append(cta);

  const finderItem = finderCard ? el('li', 'destination-finder-item destination-finder-finder') : null;
  if (finderItem) finderItem.append(finderCard);

  let requestId = 0;
  async function load() {
    requestId += 1;
    const mine = requestId;
    list.setAttribute('aria-busy', 'true');
    let destinations = [];
    let originName = '';
    try {
      const route = destinationsRoute({ ...state, origin: state.origin.code }, locale);
      const { data, source } = await lhFetch(route);
      block.dataset.source = source;
      destinations = mapDestinations(data);
      originName = mapOriginName(data);
    } catch (e) {
      block.dataset.source = 'none';
    }
    if (mine !== requestId) return;
    if (originName && !state.origin.name) {
      state.origin.name = originName;
      originButton.textContent = originName;
      originButton.setAttribute('aria-label', `${labels['change origin label']}: ${originName}`);
    }
    const items = destinations
      .map((d) => renderDestination(d, state, labels, locale, Boolean(disclaimer)));
    if (finderItem) items.push(finderItem);
    list.replaceChildren(...items);
    list.scrollLeft = 0;
    list.removeAttribute('aria-busy');
    block.classList.toggle('destination-finder-empty', !destinations.length);
    updateAuthoredLinks(block, state);
    updateNav();
  }

  const combobox = createAirportCombobox({
    label: text('origin-input-label') || labels['origin input label'],
    name: 'origin',
    value: state.origin,
    noResultsLabel: labels['no results label'],
    fetchSuggestions: async (term) => {
      const { data } = await lhFetch(airportSuggestionsRoute(term, locale));
      return mapAirportSuggestions(data);
    },
    onChange: (airport) => {
      if (!airport || airport.code === state.origin.code) return;
      state.origin = { code: airport.code, name: airport.name || '' };
      originButton.textContent = state.origin.name || state.origin.code;
      originButton.setAttribute('aria-label', `${labels['change origin label']}: ${originButton.textContent}`);
      picker.hidden = true;
      originButton.setAttribute('aria-expanded', 'false');
      originButton.focus();
      load();
    },
  });
  picker.append(combobox.element);
  combobox.input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      picker.hidden = true;
      originButton.setAttribute('aria-expanded', 'false');
      originButton.focus();
    }
  });

  originButton.addEventListener('click', () => {
    const open = picker.hidden;
    picker.hidden = !open;
    originButton.setAttribute('aria-expanded', String(open));
    if (open) combobox.focus();
  });

  if (chips) {
    chips.addEventListener('change', (e) => {
      if (e.target.name !== `${uid}-trip-type`) return;
      state.tripType = e.target.value;
      load();
    });
  }

  block.replaceChildren(header, slider, footer);
  decorateExternalLinks(block);
  load();
}
