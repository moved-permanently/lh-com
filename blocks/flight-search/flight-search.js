import { getLocale, LIVE_ORIGIN } from '../../scripts/locale.js';
import {
  readConfigRows, pick, resolveLabels, parseAirportCode, parseAirportName,
} from '../../scripts/block-config.js';
import { createAirportCombobox, airportDisplay } from '../../scripts/airport-combobox.js';
import {
  labelsRequest, catalogRequest, defaultAirportRequest, fetchRequest, fetchLabels, pickLabels,
  mapDefaultAirport, mapAirportNames, searchAirportsWithSource, fillLabel,
} from '../../scripts/lh-api.js';
import { markSource } from '../../scripts/lh-data.js';
import { buildShopHandoff, submitShopHandoff } from '../../scripts/shop-handoff.js';

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
  // an authored destination code ("CPT") shows its name like the live field ("Cape Town")
  let { destination } = settings;
  if (destination && !destination.name) {
    const named = airportNames.find((a) => a.code === destination.code);
    if (named) destination = { code: destination.code, name: named.name };
  }
  return {
    labels: pickLabels(live.labels, LIVE_LABELS), origin, destination, sources,
  };
}

/** Trip type codes by authored position: first trip type is round trip, second one way. */
const TRIP_TYPE_CODES = ['RETURN', 'ONEWAY'];

/**
 * Requests the block's main content comes from (data-lh-source): the live labels and, unless
 * an origin is authored, the market default airport that prefills the origin.
 */
export function flightSearchPrimary(settings) {
  return settings.origin ? ['labels/flightmanager'] : ['labels/flightmanager', 'defaultAirport'];
}

// the shop handoff (buildShopHandoff, submitShopHandoff) lives in scripts/shop-handoff.js
export { buildShopHandoff };

/* ------------------------------------------------------------------------------------------- */

/**
 * UI strings that are not visible authored content. Order of precedence: an authored row of
 * the same name, the live label (LIVE_LABELS), these defaults.
 */
const DEFAULT_LABELS = {
  en: {
    'from label': 'From',
    'to label': 'To',
    'submit label': 'Find flights',
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

/**
 * Hotel tab (Booking.com) texts: the live hotel tab's built-in texts (dcep bundle, chunk of the
 * HotelTab component), which the live page shows in every market; the tooltip and the close
 * button follow the page language. Authored rows of the same name win.
 */
const HOTEL_LABELS_EN = {
  'location label': 'Location',
  'location hint': 'City name',
  'location error': 'Please enter a destination.',
  'check-in label': 'Check-In',
  'check-in hint': 'Date of arrival',
  'check-in error': 'The check-in date is required.',
  'check-out label': 'Check-Out',
  'check-out hint': 'Date of departure',
  'check-out error': 'The check-out date is required.',
  'check-out order error': 'Check-Out has to be after Check-In.',
  'hotel footnote': 'The contract for your accommodation is directly with our hotel partner Booking.com and separate to the Lufthansa flight booking.',
  'hotel submit label': 'Search hotel',
  'hotel external note': 'Please note that with this link you are visiting an external website that may not follow the same privacy, security or accessibility policies.',
  'close label': 'Close',
};
/** Hotel tab texts taken from the live label bundle (labels/flightmanager), by label key. */
const HOTEL_LIVE_LABELS = {
  'hotel submit label': 'flightmanager.hotel.default.searchButton',
};
const HOTEL_LABELS = {
  en: HOTEL_LABELS_EN,
  de: {
    ...HOTEL_LABELS_EN,
    'hotel external note': 'Bitte beachten Sie, dass Sie mit diesem Link eine externe Website besuchen, die möglicherweise nicht den gleichen Datenschutz-, Sicherheits- oder Barrierefreiheitsrichtlinien folgt.',
    'close label': 'Schließen',
  },
};

/**
 * Kind of a tab by its label: the live flight manager's tabs (Flights / Flüge, Rental car /
 * Mietwagen, Flug & Hotel, Hotel). Only the flight and hotel tabs have a form here; other tabs
 * open the page on the live site.
 * @param {string} label
 * @returns {'flight'|'hotel'|'holiday'|'car'|'other'}
 */
export function tabKind(label) {
  const text = (label || '').toLowerCase();
  if (/holiday|urlaub|(flug|flight)\s*[&+]\s*hotel/.test(text)) return 'holiday';
  if (/hotel/.test(text)) return 'hotel';
  if (/car\b|mietwagen|auto/.test(text)) return 'car';
  if (/flight|fl[uü]ge?\b/.test(text)) return 'flight';
  return 'other';
}

/** The live page of the current replica page (same path on www.lufthansa.com). */
function livePageUrl(config) {
  const authored = config['live-page'] && config['live-page'].link;
  if (authored) return authored.href;
  return `${LIVE_ORIGIN}${window.location.pathname.replace(/^\/content\//, '/')}`;
}

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
 * Like the live flight manager, a chosen airport shows its name only ("Frankfurt", the code is
 * the field's value); airports without a name (a typed code) show the code. The combobox writes
 * "Name (CODE)": rewritten after every change and after its blur handler.
 * @param {{input: HTMLInputElement, getValue: function, setValue: function}} combobox
 */
function showAirportNames(combobox) {
  const show = () => {
    const airport = combobox.getValue();
    if (airport && airport.name) combobox.input.value = airport.name;
  };
  const { setValue } = combobox;
  combobox.setValue = (airport, options) => {
    setValue(airport, options);
    show();
  };
  combobox.input.addEventListener('blur', show);
  show();
  return show;
}

/**
 * Background image (local promotion pages, live .flightmanager-container.full-width-bg): the
 * block's wrapper becomes a full-width band (min 500px) with the image as cover, and the card
 * sits at its bottom in the content column. The mobile image (if any) is used below 1025px.
 * @param {Element} block
 * @param {Element} cell the Background image cell
 * @param {Element} [mobileCell] the Background image mobile cell
 */
function addBackground(block, cell, mobileCell) {
  const img = cell.querySelector('img');
  if (!img) return;
  const band = el('div', 'flight-search-background');
  const picture = document.createElement('picture');
  const mobile = mobileCell && mobileCell.querySelector('img');
  if (mobile) {
    const source = document.createElement('source');
    source.media = '(width < 1025px)';
    source.srcset = mobile.currentSrc || mobile.src;
    picture.append(source);
  }
  const image = el('img');
  image.src = img.src;
  image.alt = '';
  image.loading = 'lazy';
  picture.append(image);
  band.append(picture);
  const wrapper = block.parentElement;
  if (wrapper) {
    wrapper.classList.add('flight-search-band');
    wrapper.prepend(band);
  }
}

const DAY_MS = 86400000;

/**
 * Hotel tab: Location, Check-In (today), Check-Out (tomorrow), like the live tab's initial
 * values; footnote and "Search hotel". The live tab posts the search to its booking service,
 * which answers with the Booking.com address for a new window; that service is not reachable
 * from here, so a valid search opens the live page in a new tab (nothing is sent).
 * @param {Object} config result of readConfigRows
 * @param {Object} locale result of getLocale()
 * @param {function} onClose the close button's handler
 * @returns {HTMLElement} the panel
 */
function buildHotelPanel(config, locale, onClose) {
  const labels = resolveLabels(HOTEL_LABELS, config, locale.lang);
  const panel = el('div', 'flight-search-panel flight-search-hotel');
  const form = el('form', 'flight-search-hotel-form');
  form.noValidate = true;
  const uid = Math.random().toString(36).slice(2, 8);
  const fields = el('div', 'flight-search-hotel-fields');
  const field = (name, input) => {
    const wrap = el('div', `flight-search-hotel-field flight-search-hotel-${name}`);
    input.classList.add('flight-search-hotel-input');
    input.id = `flight-search-hotel-${name}-${uid}`;
    const label = el('label', 'flight-search-hotel-label', labels[`${name} label`]);
    label.htmlFor = input.id;
    const hint = el('p', 'flight-search-hotel-hint', labels[`${name} hint`]);
    hint.id = `${input.id}-hint`;
    const error = el('p', 'flight-search-hotel-error');
    error.id = `${input.id}-error`;
    error.hidden = true;
    input.setAttribute('aria-describedby', `${hint.id} ${error.id}`);
    wrap.append(label, input, hint, error);
    fields.append(wrap);
    return { wrap, input, error };
  };
  const cityInput = el('input');
  cityInput.type = 'text';
  cityInput.name = 'cityName';
  cityInput.autocomplete = 'off';
  cityInput.required = true;
  // an empty placeholder lets the CSS show the label in the empty field (:placeholder-shown)
  cityInput.placeholder = ' ';
  const city = field('location', cityInput);
  const dateInput = (name, date) => {
    const input = el('input');
    input.type = 'date';
    input.name = name;
    input.required = true;
    input.value = isoDate(date);
    input.min = isoDate(new Date());
    return input;
  };
  const today = new Date();
  const checkIn = field('check-in', dateInput('checkInDate', today));
  const checkOut = field('check-out', dateInput('checkOutDate', new Date(today.getTime() + DAY_MS)));
  checkOut.input.min = checkOut.input.value;
  checkIn.input.addEventListener('change', () => {
    if (!checkIn.input.value) return;
    const next = isoDate(new Date(new Date(`${checkIn.input.value}T12:00`).getTime() + DAY_MS));
    checkOut.input.min = next;
    if (!checkOut.input.value || checkOut.input.value < next) checkOut.input.value = next;
  });
  form.append(fields);

  const footer = el('div', 'flight-search-hotel-footer');
  footer.append(el('p', 'flight-search-hotel-footnote', labels['hotel footnote']));
  const submit = el('button', 'flight-search-hotel-submit button primary', labels['hotel submit label']);
  submit.type = 'submit';
  // the live "external website" tooltip of the button
  submit.title = labels['hotel external note'];
  const note = el('span', 'flight-search-sr-only', labels['hotel external note']);
  note.id = `flight-search-hotel-note-${uid}`;
  submit.setAttribute('aria-describedby', note.id);
  footer.append(submit, note);
  form.append(footer);
  // the button text of the live label bundle (labels/flightmanager), as the flight tab gets its
  // labels: de "Hotelsuche", en "Search hotel"; a "Hotel submit label" row other than the
  // built-in English text (which the importer copies from the rendered live tab) wins
  const builtIn = (HOTEL_LABELS[locale.lang] || HOTEL_LABELS.en)['hotel submit label'];
  if (labels['hotel submit label'] === builtIn) {
    fetchLabels(['flightmanager'], locale).then((live) => {
      const text = pickLabels(live.labels, HOTEL_LIVE_LABELS)['hotel submit label'];
      if (text) submit.textContent = text;
    }).catch(() => {});
  }

  const close = el('button', 'flight-search-close');
  close.type = 'button';
  close.setAttribute('aria-label', labels['close label']);
  close.title = labels['close label'];
  close.addEventListener('click', onClose);
  form.append(close);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const checks = [
      [city, !cityInput.value.trim() && labels['location error']],
      [checkIn, !checkIn.input.value && labels['check-in error']],
      [checkOut, (!checkOut.input.value && labels['check-out error'])
        || (checkIn.input.value && checkOut.input.value <= checkIn.input.value
          && labels['check-out order error'])],
    ];
    checks.forEach(([f, message]) => {
      f.error.textContent = message || '';
      f.error.hidden = !message;
      f.wrap.classList.toggle('invalid', Boolean(message));
      f.input.setAttribute('aria-invalid', message ? 'true' : 'false');
    });
    const invalid = checks.find(([, message]) => message);
    if (invalid) {
      invalid[0].input.focus();
      return;
    }
    window.open(livePageUrl(config), '_blank', 'noopener');
  });
  panel.append(form);
  return panel;
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
  // standalone design (every page but the homepage): a card with a tab bar; a hotel tab or
  // further tabs (cash-and-miles: Flights, Rental car, Hotel) get the tab bar in any design
  const tabKinds = settings.tabs.map(tabKind);
  const hasFlight = !settings.tabs.length || tabKinds.includes('flight');
  const tabbed = settings.tabs.length > 0
    && (block.classList.contains('standalone') || tabKinds.some((k) => k !== 'flight'));

  if (settings.tabs.length && !tabbed) {
    const tabBar = el('div', 'flight-search-tabs');
    tabBar.append(el('span', 'flight-search-tab', settings.tabs[0]));
    content.append(tabBar);
  }

  const form = el('form', 'flight-search-form');
  form.noValidate = true;
  // the visible form never posts itself: submit validates, then posts a hidden shop handoff form

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

  // where the data came from (data-lh-source); typed suggestions are listed in the detail
  const sources = {};
  const primary = flightSearchPrimary(settings);
  const suggest = async (term) => {
    const { list, source } = await searchAirportsWithSource(term, locale);
    sources.suggestions = source;
    markSource(block, sources, primary);
    return list;
  };

  // fields row: origin, swap, destination, dates, submit
  const fields = el('div', 'flight-search-fields');
  let originTouched = false;
  let destinationTouched = false;
  // set below: the name-only display of each field (showAirportNames)
  const shown = {};
  const origin = createAirportCombobox({
    label: text('origin-label', 'from') || labels['from label'],
    name: 'origin',
    value: settings.origin || { code: settings.fallbackOrigin, name: '' },
    fetchSuggestions: (term) => suggest(term),
    onChange: () => {
      originTouched = true;
      if (shown.origin) shown.origin();
    },
    noResultsLabel: labels['no results label'],
  });
  origin.element.classList.add('flight-search-origin');
  const destination = createAirportCombobox({
    label: text('destination-label', 'to') || labels['to label'],
    name: 'destination',
    value: settings.destination,
    fetchSuggestions: (term) => suggest(term),
    onChange: () => {
      destinationTouched = true;
      if (shown.destination) shown.destination();
    },
    noResultsLabel: labels['no results label'],
  });
  destination.element.classList.add('flight-search-destination');
  shown.origin = showAirportNames(origin);
  shown.destination = showAirportNames(destination);
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
    // consent.js loads lazily: it pulls in aem.js, which the offline widget test cannot run
    import('../../scripts/consent.js')
      .then(({ getStoredConsent }) => (getStoredConsent() || {}).groups)
      .catch(() => [])
      .then((consentGroups) => {
        submitShopHandoff(buildShopHandoff({ ...query, consentGroups }, locale));
      });
  });

  const flightContent = [form];
  if (links && links.querySelector('a[href]')) {
    const linkRow = el('div', 'flight-search-links');
    linkRow.append(...links.childNodes);
    flightContent.push(linkRow);
  }

  if (!tabbed) {
    content.append(...flightContent);
  } else {
    const uid = Math.random().toString(36).slice(2, 8);
    const panels = {};
    if (hasFlight) {
      panels.flight = el('div', 'flight-search-panel flight-search-flight');
      panels.flight.append(...flightContent);
    }
    const tabBar = el('div', 'flight-search-tabs');
    tabBar.setAttribute('role', 'tablist');
    const tabButtons = [];
    // i < 0: every panel closed (the hotel tab's close button), the tabs open them again
    const select = (i) => {
      tabButtons.forEach((tab, j) => {
        tab.setAttribute('aria-selected', String(j === i));
        tab.tabIndex = j === i || (i < 0 && j === 0) ? 0 : -1;
      });
      Object.entries(panels).forEach(([kind, panel]) => {
        panel.hidden = i < 0 || tabKinds[i] !== kind;
      });
      block.classList.toggle('flight-search-closed', i < 0);
    };
    if (tabKinds.includes('hotel')) panels.hotel = buildHotelPanel(config, locale, () => select(-1));
    settings.tabs.forEach((label, i) => {
      const kind = tabKinds[i];
      const tab = el('button', `flight-search-tab flight-search-tab-${kind}`);
      tab.type = 'button';
      tab.setAttribute('role', 'tab');
      tab.id = `flight-search-tab-${kind}-${uid}`;
      tab.append(el('span', 'flight-search-tab-label', label));
      const panel = panels[kind];
      if (panel && !panel.id) {
        panel.id = `flight-search-panel-${kind}-${uid}`;
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', tab.id);
        tab.setAttribute('aria-controls', panel.id);
      }
      // tabs without a form here (rental car) open the page on the live site
      tab.addEventListener('click', () => {
        if (panel) select(i);
        else window.open(livePageUrl(config), '_blank', 'noopener');
      });
      tab.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const next = tabButtons[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabButtons.length)
          % tabButtons.length];
        next.focus();
      });
      tabButtons.push(tab);
      tabBar.append(tab);
    });
    content.append(tabBar, ...Object.values(panels));
    const authoredActive = text('active-tab').toLowerCase();
    const active = settings.tabs.findIndex((l) => l.toLowerCase() === authoredActive);
    select(active >= 0 && panels[tabKinds[active]] ? active : tabKinds.findIndex((k) => panels[k]));
  }

  // read before the rows are replaced: the pictures move into the band
  const background = pick(config, 'background-image');
  const backgroundMobile = pick(config, 'background-image-mobile');
  block.replaceChildren(content);
  if (background) addBackground(block, background.cell, backgroundMobile && backgroundMobile.cell);

  if (!hasFlight) {
    // hotel only: no live data (the live hotel tab shows its built-in texts)
    markSource(block, {}, []);
    return;
  }

  loadFlightSearchData(settings, locale).then((data) => {
    Object.assign(sources, data.sources);
    markSource(block, sources, primary);
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
    if (data.destination && data.destination.name && !destinationTouched) {
      destination.setValue(data.destination, { silent: true });
      updateSwapLabel();
    }
  });
}
