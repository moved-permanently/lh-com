import { getLocale } from '../../scripts/locale.js';
import {
  readConfigRows, pick, resolveLabels, parseAirportCode, parseAirportName,
  decorateExternalLinks,
} from '../../scripts/block-config.js';
import { createAirportCombobox } from '../../scripts/airport-combobox.js';
import {
  fareTeaserOffersRequest, fareTeaserRecommendRequest, catalogRequest, fetchRequest,
  mapOffers, mapRecommendedOrigins, mapConditions, mapLocaleData, findOrigin, filterAirports,
  searchAirports, formatFare, destinationImageUrl, htmlToParagraphs,
} from '../../scripts/lh-api.js';

/* ---------------------------------------------------------------------------------------------
 * Data contract (see scripts/lh-api.js for the live request and response shapes). The live
 * "Flight offers from" component (fareteaserdynamicevo) loads
 *   POST /service/api/lhg-fare-teaser/fareteaser/offers/{origin}  the recommended destinations
 *   GET  /service/api/lhg-fare-teaser/fareteaser/recommend        the origin cities to pick from
 * plus catalogs/conditions (disclaimer and conditions) and catalogs/localeData (number format).
 * ------------------------------------------------------------------------------------------- */

/** Trip type codes by authored chip position: first chip is round trip, second one way. */
const TRIP_TYPE_CODES = ['RETURN', 'ONEWAY'];

/**
 * Settings of an authored block (the live component's data-dcep: preselectedOrigin,
 * isOneWayDefault, airlineWhitelistingEnabled; TripDuration of its links).
 * @param {Object} config result of readConfigRows
 * @param {Object} locale result of getLocale()
 */
export function readDestinationFinderSettings(config, locale) {
  const text = (...keys) => (pick(config, ...keys) || {}).text || '';
  const originValue = text('default-origin', 'origin');
  const tripTypes = (pick(config, 'trip-types', 'trip-type') || { list: [] }).list.slice(0, 2);
  const defaultTrip = text('default-trip-type').toLowerCase();
  const oneWayFirst = Boolean(defaultTrip) && tripTypes.length > 1
    && tripTypes[1].toLowerCase() === defaultTrip;
  return {
    origin: {
      code: parseAirportCode(originValue) || locale.homeAirport,
      name: parseAirportCode(originValue) ? parseAirportName(originValue) : '',
    },
    tripTypes,
    tripType: TRIP_TYPE_CODES[oneWayFirst ? 1 : 0],
    tripDuration: parseInt(text('trip-duration', 'duration'), 10) || 14,
    airlineWhitelist: /^(y|yes|true|ja|1)$/i.test(text('airline-whitelist')),
  };
}

/** The live requests: destinations for the origin and trip type; origins, conditions, format. */
export function destinationFinderRequests(state, locale, now) {
  return {
    offers: fareTeaserOffersRequest({
      origin: state.origin.code,
      tripType: state.tripType,
      airlineDestWhitelist: state.airlineWhitelist,
    }, now),
    origins: fareTeaserRecommendRequest(),
    conditions: catalogRequest('conditions'),
    localeData: catalogRequest('localeData'),
  };
}

/**
 * Recommended destinations for the current origin and trip type:
 * [{ code, name, price, currency, symbol, prefixed, image }].
 * @returns {Promise<{destinations: Array, source: string}>}
 */
export async function loadDestinations(state, locale) {
  try {
    const request = destinationFinderRequests(state, locale).offers;
    // exact: the round-trip recording must never stand in for one-way prices
    const { data, source } = await fetchRequest(request, locale, { exact: true });
    return {
      destinations: mapOffers(data)
        .filter((d) => d.code !== state.origin.code)
        .map((d) => ({ ...d, image: destinationImageUrl(d.code, 720) })),
      source,
    };
  } catch (e) {
    return { destinations: [], source: 'none' };
  }
}

/**
 * Data that does not depend on the origin: origin cities, conditions and number format.
 * @returns {Promise<{origins: Array, conditions: Object, localeData: Object,
 *   sources: Object<string, string>}>}
 */
export async function loadFinderContext(locale) {
  const requests = destinationFinderRequests({ origin: { code: locale.homeAirport } }, locale);
  const sources = {};
  const settle = (name, mapper, fallback) => fetchRequest(requests[name], locale)
    .then(({ data, source }) => {
      sources[name] = source;
      return mapper(data);
    })
    .catch(() => {
      sources[name] = 'none';
      return fallback;
    });
  const [origins, conditions, localeData] = await Promise.all([
    settle('origins', mapRecommendedOrigins, []),
    settle('conditions', mapConditions, mapConditions()),
    settle('localeData', mapLocaleData, {}),
  ]);
  return {
    origins, conditions, localeData, sources,
  };
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

function renderDestination(dest, state, labels, locale, context) {
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
    img.addEventListener('error', () => img.remove());
    imageWrap.append(img);
  }
  link.append(imageWrap, el('span', 'destination-finder-city', dest.name || dest.code));
  li.append(link);

  const price = formatFare(dest.price, dest, locale, context.localeData);
  if (price) {
    const offer = el('p', 'destination-finder-offer');
    const label = state.tripType === 'ONEWAY' ? labels['one way price label'] : labels['price label'];
    const priceEl = el('span', 'destination-finder-price', price);
    if (context.hasDisclaimer) priceEl.append(el('sup', '', '*'));
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

/**
 * Disclaimer and conditions from catalogs/conditions where the author left them out (or
 * authored only the conditions title).
 */
function fillNotes(footer, notes, conditionsData) {
  if (!notes.querySelector('.destination-finder-disclaimer') && conditionsData.footerText) {
    const disclaimer = el('div', 'destination-finder-disclaimer');
    disclaimer.append(el('p', '', conditionsData.footerText));
    notes.prepend(disclaimer);
  }
  let conditions = notes.querySelector('.destination-finder-conditions');
  const paragraphs = htmlToParagraphs(conditionsData.html);
  if (paragraphs.length && (!conditions || !conditions.querySelector('details'))) {
    const title = conditions ? conditions.textContent.trim() : '';
    if (title.length <= 60) {
      if (!conditions) {
        conditions = el('div', 'destination-finder-conditions');
        notes.append(conditions);
      }
      const titleEl = el('p');
      titleEl.append(el('strong', '', title || conditionsData.headline));
      conditions.replaceChildren(titleEl, ...paragraphs);
      decorateConditions(conditions);
    }
  }
  if (notes.children.length && !notes.parentNode) footer.prepend(notes);
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

  const settings = readDestinationFinderSettings(config, locale);
  const { tripTypes } = settings;
  const state = {
    origin: { ...settings.origin },
    tripType: settings.tripType,
    tripDuration: settings.tripDuration,
    airlineWhitelist: settings.airlineWhitelist,
  };
  const contextPromise = loadFinderContext(locale);

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
  const showOrigin = () => {
    originButton.textContent = state.origin.name || state.origin.code;
    originButton.setAttribute('aria-label', `${labels['change origin label']}: ${originButton.textContent}`);
  };
  showOrigin();
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
      input.checked = TRIP_TYPE_CODES[i] === state.tripType;
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

  // origin cities of the market name the origin and are what the picker offers
  contextPromise.then((context) => {
    fillNotes(footer, notes, context.conditions);
    const city = findOrigin(context.origins, state.origin.code);
    if (city && !state.origin.name) {
      state.origin.name = city.name;
      showOrigin();
    }
  });

  let requestId = 0;
  async function load() {
    requestId += 1;
    const mine = requestId;
    list.setAttribute('aria-busy', 'true');
    const [context, { destinations, source }] = await Promise.all([
      contextPromise, loadDestinations(state, locale),
    ]);
    if (mine !== requestId) return;
    block.dataset.source = source;
    const hasDisclaimer = Boolean(disclaimer || context.conditions.footerText);
    const items = destinations.map((d) => renderDestination(d, state, labels, locale, {
      localeData: context.localeData, hasDisclaimer,
    }));
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
    // like the live picker: the market's origin cities; the airport search when none load
    fetchSuggestions: async (term) => {
      const { origins } = await contextPromise;
      if (!origins.length) return searchAirports(term, locale);
      return filterAirports(origins.map((o) => ({ ...o, label: `${o.name} (${o.code})` })), term);
    },
    onChange: (airport) => {
      if (!airport || airport.code === state.origin.code) return;
      state.origin = { code: airport.code, name: airport.name || '' };
      showOrigin();
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
