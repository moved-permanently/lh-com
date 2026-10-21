import { getLocale } from '../../scripts/locale.js';
import {
  readConfigRows, pick, resolveLabels, parseAirportCode, parseAirportName,
} from '../../scripts/block-config.js';
import { createAirportCombobox, airportDisplay } from '../../scripts/airport-combobox.js';
import {
  labelsRequest, catalogRequest, defaultAirportRequest, fetchRequest, fetchLabels, pickLabels,
  mapDefaultAirport, mapAirportNames, searchAirports, fillLabel,
} from '../../scripts/lh-api.js';

/* ---------------------------------------------------------------------------------------------
 * Data contract (see scripts/lh-api.js for the live request and response shapes). The live
 * flight manager loads labels/flightmanager, defaultAirport (the prefilled origin) and
 * catalogs/airportnames, and asks suggestions/airports for every typed term.
 * ------------------------------------------------------------------------------------------- */

/** Live labels used by the block, by block label key (labels/flightmanager, labels/common). */
const LIVE_LABELS = {
  'round trip label': 'flightmanager.flight.tripType.roundtrip.label',
  'one way label': 'flightmanager.flight.tripType.oneway.label',
  'trip type label': 'flightmanager.flight.travelDetails.tripTypeLabel',
  'date label': 'flightmanager.flight.dateInputGrouped.roundtrip',
  'one way date label': 'flightmanager.flight.dateInputGrouped.oneway',
  'date error': 'flightmanager.flight.dateInputGrouped.dateRequired',
  'return date error': 'flightmanager.flight.od.returnDateRequired',
  'submit label': 'flightmanager.flight.searchButton.default',
  'swap label': 'flightmanager.flight.swapButton.label',
  'origin error': 'flightmanager.flight.od.originCodeErrorRequired',
  'destination error': 'flightmanager.flight.od.destinationCodeErrorRequired',
  'same airport error': 'flightmanager.flight.od.destinationCodeErrorNot',
  'from label': 'common.od.originCode.label',
  'to label': 'common.od.destinationCode.label',
};

/** Live label bundles: flightmanager (homepage), common (loaded by the live site elsewhere). */
const LABEL_BUNDLES = ['flightmanager', 'common'];

/**
 * Settings of an authored block.
 * @param {Object} config result of readConfigRows
 * @param {Object} locale result of getLocale()
 */
export function readFlightSearchSettings(config, locale) {
  const text = (...keys) => (pick(config, ...keys) || {}).text || '';
  const originValue = text('default-origin', 'origin');
  const destinationValue = text('default-destination', 'destination');
  const destinationCode = parseAirportCode(destinationValue);
  return {
    tabs: (pick(config, 'tabs', 'tab') || { list: [] }).list,
    tripTypes: (pick(config, 'trip-types', 'trip-type') || { list: [] }).list.slice(0, 2),
    defaultTripType: text('default-trip-type'),
    // null: the market default airport (defaultAirport), like the live prefilled origin
    origin: parseAirportCode(originValue)
      ? { code: parseAirportCode(originValue), name: parseAirportName(originValue) } : null,
    destination: destinationCode
      ? { code: destinationCode, name: parseAirportName(destinationValue) } : null,
    adults: parseInt(text('adults', 'travellers'), 10) || 1,
    cabin: (text('cabin') || 'E').toUpperCase(),
    travellerLabel: text('traveller-label', 'travellers-label'),
    nonstopLabel: text('nonstop-label', 'nonstop'),
    fallbackOrigin: locale.homeAirport,
  };
}

/** The live requests of the block (the typed-term suggestions come from searchAirports). */
export function flightSearchRequests(settings, locale) {
  return {
    labels: LABEL_BUNDLES.map((bundle) => labelsRequest(bundle, locale)),
    defaultAirport: defaultAirportRequest(),
    airportNames: catalogRequest('airportnames'),
  };
}

/**
 * Loads the live labels and the origin to prefill: the authored one (named from the airport
 * names catalog or the default airport when authored as a bare code), else the market default.
 * @returns {Promise<{labels: Object<string, string>, origin: {code: string, name: string},
 *   sources: Object<string, string>}>}
 */
export async function loadFlightSearchData(settings, locale) {
  const requests = flightSearchRequests(settings, locale);
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
  const [live, defaultAirport, airportNames] = await Promise.all([
    fetchLabels(LABEL_BUNDLES, locale),
    settle('defaultAirport', mapDefaultAirport, null),
    settle('airportNames', mapAirportNames, []),
  ]);
  Object.entries(live.sources).forEach(([bundle, source]) => { sources[`labels/${bundle}`] = source; });
  let origin = settings.origin || defaultAirport || { code: settings.fallbackOrigin, name: '' };
  if (!origin.name) {
    const named = airportNames.find((a) => a.code === origin.code)
      || (defaultAirport && defaultAirport.code === origin.code ? defaultAirport : null);
    if (named) origin = { code: origin.code, name: named.name };
  }
  return { labels: pickLabels(live.labels, LIVE_LABELS), origin, sources };
}

/** Trip type codes by authored position: first trip type is round trip, second one way. */
const TRIP_TYPE_CODES = ['RETURN', 'ONEWAY'];

/**
 * Builds the shop.lufthansa.com URL the search hands off to, like the live flight manager.
 * This function is the single place where the form fields are mapped to the shop's
 * query parameter names and values.
 * @param {Object} query collected form values
 * @param {Object} locale result of getLocale()
 * @returns {string}
 */
function buildShopHandoffUrl(query, locale) {
  const url = new URL('https://shop.lufthansa.com/booking/flight-search');
  const params = {
    country: locale.country.toUpperCase(),
    lang: locale.lang,
    tripType: query.tripType,
    origin: query.origin,
    destination: query.destination,
    outboundDate: query.departureDate,
    inboundDate: query.tripType === 'RETURN' ? query.returnDate : '',
    adults: query.adults,
    cabinClass: query.cabin,
    nonstop: query.nonstop ? 'true' : '',
  };
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  });
  return url.toString();
}

/* ------------------------------------------------------------------------------------------- */

/**
 * UI strings that are not visible authored content. Order of precedence: an authored row of
 * the same name, the live label (LIVE_LABELS), these defaults.
 */
const DEFAULT_LABELS = {
  en: {
    'from label': 'From',
    'to label': 'To',
    'submit label': 'Search flights',
    'date label': 'Departure - Return',
    'one way date label': 'Departure',
    'date error': 'Please provide travel date(s)',
    'return date error': 'Please enter your return date and try again.',
    'trip type label': 'Type of trip',
    'round trip label': 'Round trip',
    'one way label': 'One-way',
    'swap label': 'Swap origin and destination',
    'departure label': 'Departure',
    'return label': 'Return',
    'origin error': 'Please select an origin',
    'destination error': 'Please select a destination',
    'same airport error': 'Origin and destination are the same. Please check your input and try again.',
    'no results label': 'No matching airports',
  },
  de: {
    'from label': 'Von',
    'to label': 'Nach',
    'submit label': 'Flüge suchen',
    'date label': 'Hinflug - Rückflug',
    'one way date label': 'Hinflug',
    'date error': 'Bitte geben Sie Reisedaten an',
    'return date error': 'Bitte geben Sie Ihr Rückflugdatum ein und versuchen es erneut.',
    'trip type label': 'Reiseart',
    'round trip label': 'Hin- und Rückflug',
    'one way label': 'Einfacher Flug',
    'swap label': 'Abflug- und Zielort tauschen',
    'departure label': 'Hinflug',
    'return label': 'Rückflug',
    'origin error': 'Bitte wählen Sie einen Abflugort',
    'destination error': 'Bitte wählen Sie ein Ziel',
    'same airport error': 'Abflug- und Zielflughafen sind identisch. Bitte überprüfen Sie Ihre Angaben.',
    'no results label': 'Keine passenden Flughäfen',
  },
};

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function isoDate(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

/**
 * Splits the grouped date label "Departure - Return" into its two parts; an authored
 * Departure label / Return label row wins.
 */
function dateLabels(labels, config) {
  const parts = (labels['date label'] || '').split(/\s+[-–/]\s+/);
  const authored = (key) => config[key] && config[key].text;
  return {
    departure: authored('departure-label') || (parts.length === 2 ? parts[0] : labels['departure label']),
    return: authored('return-label') || (parts.length === 2 ? parts[1] : labels['return label']),
  };
}

/**
 * AirCore stage (section.hero-full-width: .flight-manager-full-width, then .hero-image): the
 * panorama authored as an image paragraph right after the block becomes the stage image, and
 * the section spans the full width like the source.
 * @param {Element} block
 */
function adoptStageImage(block) {
  const wrapper = block.parentElement;
  const next = wrapper && wrapper.nextElementSibling;
  if (next && next.classList.contains('default-content-wrapper')) {
    const first = next.firstElementChild;
    const picture = first && first.tagName === 'P' && !first.textContent.trim()
      && first.querySelector(':scope > picture');
    if (picture) {
      const stage = el('div', 'flight-search-image');
      stage.append(picture);
      block.append(stage);
      first.remove();
      if (!next.children.length) next.remove();
    }
  }
  const section = block.closest('.section');
  if (section) section.classList.add('full-bleed');
}

export default function decorate(block) {
  const locale = getLocale();
  const config = readConfigRows(block);
  const settings = readFlightSearchSettings(config, locale);
  let labels = resolveLabels(DEFAULT_LABELS, config, locale.lang);
  const text = (...keys) => (pick(config, ...keys) || {}).text || '';
  const links = (pick(config, 'where-we-fly', 'links', 'link') || {}).cell;
  // texts that follow the live labels once they load (authored rows always win)
  const refreshers = [];
  const bind = (fn) => {
    refreshers.push(fn);
    fn(labels);
  };

  const content = document.createDocumentFragment();

  if (settings.tabs.length) {
    const tabBar = el('div', 'flight-search-tabs');
    tabBar.append(el('span', 'flight-search-tab', settings.tabs[0]));
    content.append(tabBar);
  }

  const form = el('form', 'flight-search-form');
  form.noValidate = true;
  // the form never posts anywhere: submit builds the shop handoff URL and navigates

  // options row: trip type, travellers, nonstop
  const optionsRow = el('div', 'flight-search-options');
  let tripTypeSelect;
  if (settings.tripTypes.length) {
    const wrap = el('div', 'flight-search-trip-type');
    const label = el('label', 'flight-search-sr-only');
    bind((l) => { label.textContent = l['trip type label']; });
    tripTypeSelect = el('select');
    tripTypeSelect.name = 'tripType';
    tripTypeSelect.id = `flight-search-trip-type-${Math.random().toString(36).slice(2, 8)}`;
    label.htmlFor = tripTypeSelect.id;
    // the live flight manager always offers both: a missing second type gets the live label
    TRIP_TYPE_CODES.forEach((code, i) => {
      const option = el('option');
      option.value = code;
      if (settings.tripTypes[i]) option.textContent = settings.tripTypes[i];
      else bind((l) => { option.textContent = l[i ? 'one way label' : 'round trip label']; });
      option.selected = Boolean(settings.defaultTripType)
        && option.textContent.toLowerCase() === settings.defaultTripType.toLowerCase();
      tripTypeSelect.append(option);
    });
    wrap.append(label, tripTypeSelect);
    optionsRow.append(wrap);
  }
  if (settings.travellerLabel) optionsRow.append(el('span', 'flight-search-travellers', settings.travellerLabel));
  let nonstop;
  if (settings.nonstopLabel) {
    const label = el('label', 'flight-search-nonstop');
    nonstop = el('input');
    nonstop.type = 'checkbox';
    nonstop.name = 'nonstop';
    label.append(nonstop, document.createTextNode(` ${settings.nonstopLabel}`));
    optionsRow.append(label);
  }
  if (optionsRow.children.length) form.append(optionsRow);

  // fields row: origin, swap, destination, dates, submit
  const fields = el('div', 'flight-search-fields');
  let originTouched = false;
  const origin = createAirportCombobox({
    label: text('origin-label', 'from') || labels['from label'],
    name: 'origin',
    value: settings.origin || { code: settings.fallbackOrigin, name: '' },
    fetchSuggestions: (term) => searchAirports(term, locale),
    onChange: () => { originTouched = true; },
    noResultsLabel: labels['no results label'],
  });
  origin.element.classList.add('flight-search-origin');
  const destination = createAirportCombobox({
    label: text('destination-label', 'to') || labels['to label'],
    name: 'destination',
    value: settings.destination,
    fetchSuggestions: (term) => searchAirports(term, locale),
    noResultsLabel: labels['no results label'],
  });
  destination.element.classList.add('flight-search-destination');
  if (!text('origin-label', 'from')) {
    bind((l) => { origin.element.querySelector('label').textContent = l['from label']; });
  }
  if (!text('destination-label', 'to')) {
    bind((l) => { destination.element.querySelector('label').textContent = l['to label']; });
  }

  const swap = el('button', 'flight-search-swap');
  swap.type = 'button';
  // authored or built-in, without placeholders: used until both airports are set
  const plainSwapLabel = labels['swap label'];
  const updateSwapLabel = () => {
    // live: "Click here to switch the origin {ORIGIN} and destination {DESTINATION}."
    const from = airportDisplay(origin.getValue());
    const to = airportDisplay(destination.getValue());
    const label = /\{[A-Z_]+\}/.test(labels['swap label']) && !(from && to)
      ? plainSwapLabel
      : fillLabel(labels['swap label'], { ORIGIN: from, DESTINATION: to });
    swap.setAttribute('aria-label', label);
    swap.title = label;
  };
  bind(updateSwapLabel);
  swap.addEventListener('click', () => {
    const from = origin.getValue();
    origin.setValue(destination.getValue());
    destination.setValue(from);
    updateSwapLabel();
  });
  [origin, destination].forEach((c) => c.input.addEventListener('change', updateSwapLabel));

  const dates = el('fieldset', 'flight-search-dates');
  const legend = el('legend');
  dates.append(legend);
  const makeDate = (name) => {
    const label = el('label', `flight-search-date flight-search-${name}`);
    const span = el('span', 'flight-search-date-label');
    const input = el('input');
    input.type = 'date';
    input.name = name;
    input.required = true; // form is noValidate; lets the CSS tell empty fields (:invalid) apart
    input.min = isoDate(new Date());
    label.append(span, input);
    dates.append(label);
    return { label, input, span };
  };
  const departure = makeDate('departure');
  const ret = makeDate('return');
  departure.input.addEventListener('change', () => {
    ret.input.min = departure.input.value || isoDate(new Date());
    if (ret.input.value && ret.input.value < departure.input.value) ret.input.value = '';
  });

  const submit = el('button', 'flight-search-submit button primary');
  submit.type = 'submit';
  bind((l) => { submit.textContent = text('submit') || l['submit label']; });

  fields.append(origin.element, swap, destination.element, dates, submit);
  form.append(fields);

  const error = el('p', 'flight-search-error');
  error.setAttribute('role', 'alert');
  error.hidden = true;
  form.append(error);

  const updateTripType = () => {
    const oneWay = tripTypeSelect && tripTypeSelect.value === 'ONEWAY';
    ret.label.hidden = oneWay;
    ret.input.disabled = oneWay;
    form.dataset.tripType = oneWay ? 'ONEWAY' : 'RETURN';
    const parts = dateLabels(labels, config);
    legend.textContent = oneWay ? labels['one way date label'] : labels['date label'];
    departure.span.textContent = parts.departure;
    ret.span.textContent = parts.return;
  };
  if (tripTypeSelect) tripTypeSelect.addEventListener('change', updateTripType);
  bind(updateTripType);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = {
      tripType: form.dataset.tripType,
      origin: (origin.getValue() || {}).code,
      destination: (destination.getValue() || {}).code,
      departureDate: departure.input.value,
      returnDate: ret.input.value,
      adults: settings.adults,
      cabin: settings.cabin,
      nonstop: Boolean(nonstop && nonstop.checked),
    };
    let message = '';
    let focus;
    if (!query.origin) {
      message = labels['origin error'];
      focus = origin.input;
    } else if (!query.destination) {
      message = labels['destination error'];
      focus = destination.input;
    } else if (query.origin === query.destination) {
      message = labels['same airport error'];
      focus = destination.input;
    } else if (!query.departureDate) {
      message = labels['date error'];
      focus = departure.input;
    } else if (query.tripType === 'RETURN' && !query.returnDate) {
      message = labels['return date error'];
      focus = ret.input;
    }
    error.textContent = message;
    error.hidden = !message;
    if (message) {
      focus.focus();
      return;
    }
    window.location.assign(buildShopHandoffUrl(query, locale));
  });

  content.append(form);

  if (links && links.querySelector('a[href]')) {
    const linkRow = el('div', 'flight-search-links');
    linkRow.append(...links.childNodes);
    content.append(linkRow);
  }

  block.replaceChildren(content);
  if (locale.aircore) adoptStageImage(block);

  loadFlightSearchData(settings, locale).then((data) => {
    block.dataset.source = data.sources['labels/flightmanager'];
    labels = resolveLabels({
      [locale.lang]: { ...(DEFAULT_LABELS[locale.lang] || DEFAULT_LABELS.en), ...data.labels },
    }, config, locale.lang);
    refreshers.forEach((fn) => fn(labels));
    // prefill like the live site (authored origin named, else the market default airport)
    // unless the visitor already picked an origin
    if (!originTouched) {
      origin.setValue(data.origin, { silent: true });
      updateSwapLabel();
    }
  });
}
