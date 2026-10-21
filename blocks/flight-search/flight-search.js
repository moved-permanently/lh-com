import { getLocale } from '../../scripts/locale.js';
import { lhFetch } from '../../scripts/lh-data.js';
import {
  readConfigRows, pick, resolveLabels, parseAirportCode, parseAirportName,
} from '../../scripts/block-config.js';
import { createAirportCombobox } from '../../scripts/airport-combobox.js';

/* ---------------------------------------------------------------------------------------------
 * Data contract. Request building and response mapping live here so the recorded responses
 * from the live site only require changes in this section.
 * ------------------------------------------------------------------------------------------- */

/** Airport autocomplete request. */
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
    const code = item.code || item.iataCode || item.airportCode || item.cityCode || item.id || '';
    const name = item.cityName || item.name || item.airportName || item.label || '';
    const country = item.countryName || item.country || '';
    return {
      code: String(code).toUpperCase(),
      name,
      label: [name && `${name} (${String(code).toUpperCase()})`, country].filter(Boolean).join(', '),
    };
  }).filter((a) => /^[A-Z]{3}$/.test(a.code));
}

/** Airport names catalog request (used to name the default origin). */
function airportNamesRoute(locale) {
  return `/service/api/catalogs/airportnames?${new URLSearchParams({ lang: locale.lang })}`;
}

/** Maps the airport names catalog to a display name for one code. */
function mapAirportName(data, code) {
  if (!data || !code) return '';
  const source = data.airportnames || data.airports || data.data || data;
  if (Array.isArray(source)) {
    const hit = source.find((a) => [a.code, a.iataCode, a.airportCode].includes(code));
    return hit ? hit.cityName || hit.name || hit.airportName || '' : '';
  }
  const hit = source[code];
  if (!hit) return '';
  return typeof hit === 'string' ? hit : hit.cityName || hit.name || '';
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

/** UI strings that are not visible authored content; any can be overridden by a block row. */
const DEFAULT_LABELS = {
  en: {
    'from label': 'From',
    'to label': 'To',
    'submit label': 'Search flights',
    'date error': 'Please provide travel date(s)',
    'trip type label': 'Type of trip',
    'swap label': 'Swap origin and destination',
    'departure label': 'Departure',
    'return label': 'Return',
    'origin error': 'Please select an origin',
    'destination error': 'Please select a destination',
    'no results label': 'No matching airports',
  },
  de: {
    'from label': 'Von',
    'to label': 'Nach',
    'submit label': 'Flüge suchen',
    'date error': 'Bitte geben Sie Reisedaten an',
    'trip type label': 'Reiseart',
    'swap label': 'Abflug- und Zielort tauschen',
    'departure label': 'Hinflug',
    'return label': 'Rückflug',
    'origin error': 'Bitte wählen Sie einen Abflugort',
    'destination error': 'Bitte wählen Sie ein Ziel',
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

async function fetchSuggestions(term, locale) {
  const { data } = await lhFetch(airportSuggestionsRoute(term, locale));
  return mapAirportSuggestions(data);
}

async function nameDefaultOrigin(combobox, code, locale) {
  try {
    const { data } = await lhFetch(airportNamesRoute(locale));
    const name = mapAirportName(data, code);
    const value = combobox.getValue();
    if (name && value && value.code === code && !value.name) {
      combobox.setValue({ code, name }, { silent: true });
    }
  } catch (e) {
    // no catalog: the code alone stays visible
  }
}

/**
 * Reads the authored label and splits "Departure - return" into its two parts.
 */
function dateLabels(dateLabel, labels) {
  const parts = (dateLabel || '').split(/\s+[-–/]\s+/);
  if (parts.length === 2) return { departure: parts[0], return: parts[1] };
  return { departure: labels['departure label'], return: labels['return label'] };
}

export default function decorate(block) {
  const locale = getLocale();
  const config = readConfigRows(block);
  const labels = resolveLabels(DEFAULT_LABELS, config, locale.lang);
  const text = (...keys) => (pick(config, ...keys) || {}).text || '';

  const tabs = (pick(config, 'tabs', 'tab') || { list: [] }).list;
  const tripTypes = (pick(config, 'trip-types', 'trip-type') || { list: [] }).list.slice(0, 2);
  const defaultTripType = text('default-trip-type');
  const originValue = text('default-origin', 'origin');
  const originCode = parseAirportCode(originValue) || locale.homeAirport;
  const originName = parseAirportCode(originValue) ? parseAirportName(originValue) : '';
  const destinationValue = text('default-destination', 'destination');
  const destinationCode = parseAirportCode(destinationValue);
  const adults = parseInt(text('adults', 'travellers'), 10) || 1;
  const cabin = text('cabin') || 'E';
  const links = (pick(config, 'where-we-fly', 'links', 'link') || {}).cell;

  const content = document.createDocumentFragment();

  if (tabs.length) {
    const tabBar = el('div', 'flight-search-tabs');
    tabBar.append(el('span', 'flight-search-tab', tabs[0]));
    content.append(tabBar);
  }

  const form = el('form', 'flight-search-form');
  form.noValidate = true;
  // the form never posts anywhere: submit builds the shop handoff URL and navigates

  // options row: trip type, travellers, nonstop
  const optionsRow = el('div', 'flight-search-options');
  let tripTypeSelect;
  if (tripTypes.length) {
    const wrap = el('div', 'flight-search-trip-type');
    const label = el('label', 'flight-search-sr-only', labels['trip type label']);
    tripTypeSelect = el('select');
    tripTypeSelect.name = 'tripType';
    tripTypeSelect.id = `flight-search-trip-type-${Math.random().toString(36).slice(2, 8)}`;
    label.htmlFor = tripTypeSelect.id;
    tripTypes.forEach((type, i) => {
      const option = el('option', '', type);
      option.value = TRIP_TYPE_CODES[i];
      option.selected = Boolean(defaultTripType)
        && type.toLowerCase() === defaultTripType.toLowerCase();
      tripTypeSelect.append(option);
    });
    wrap.append(label, tripTypeSelect);
    optionsRow.append(wrap);
  }
  const travellerLabel = text('traveller-label', 'travellers-label');
  if (travellerLabel) optionsRow.append(el('span', 'flight-search-travellers', travellerLabel));
  let nonstop;
  const nonstopLabel = text('nonstop-label', 'nonstop');
  if (nonstopLabel) {
    const label = el('label', 'flight-search-nonstop');
    nonstop = el('input');
    nonstop.type = 'checkbox';
    nonstop.name = 'nonstop';
    label.append(nonstop, document.createTextNode(` ${nonstopLabel}`));
    optionsRow.append(label);
  }
  if (optionsRow.children.length) form.append(optionsRow);

  // fields row: origin, swap, destination, dates, submit
  const fields = el('div', 'flight-search-fields');
  const origin = createAirportCombobox({
    label: text('origin-label', 'from') || labels['from label'],
    name: 'origin',
    value: { code: originCode, name: originName },
    fetchSuggestions: (term) => fetchSuggestions(term, locale),
    noResultsLabel: labels['no results label'],
  });
  origin.element.classList.add('flight-search-origin');
  const destination = createAirportCombobox({
    label: text('destination-label', 'to') || labels['to label'],
    name: 'destination',
    value: destinationCode
      ? { code: destinationCode, name: parseAirportName(destinationValue) }
      : null,
    fetchSuggestions: (term) => fetchSuggestions(term, locale),
    noResultsLabel: labels['no results label'],
  });
  destination.element.classList.add('flight-search-destination');

  const swap = el('button', 'flight-search-swap');
  swap.type = 'button';
  swap.setAttribute('aria-label', labels['swap label']);
  swap.title = labels['swap label'];
  swap.addEventListener('click', () => {
    const from = origin.getValue();
    origin.setValue(destination.getValue());
    destination.setValue(from);
  });

  const dates = el('fieldset', 'flight-search-dates');
  const dateLabel = text('date-label', 'dates-label');
  if (dateLabel) dates.append(el('legend', '', dateLabel));
  const { departure: departureText, return: returnText } = dateLabels(dateLabel, labels);
  const makeDate = (name, labelText) => {
    const label = el('label', `flight-search-date flight-search-${name}`);
    const span = el('span', 'flight-search-date-label', labelText);
    const input = el('input');
    input.type = 'date';
    input.name = name;
    input.required = true; // form is noValidate; lets the CSS tell empty fields (:invalid) apart
    input.min = isoDate(new Date());
    label.append(span, input);
    dates.append(label);
    return { label, input };
  };
  const departure = makeDate('departure', departureText);
  const ret = makeDate('return', returnText);
  departure.input.addEventListener('change', () => {
    ret.input.min = departure.input.value || isoDate(new Date());
    if (ret.input.value && ret.input.value < departure.input.value) ret.input.value = '';
  });

  const submit = el('button', 'flight-search-submit button primary', text('submit') || labels['submit label']);
  submit.type = 'submit';

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
  };
  if (tripTypeSelect) tripTypeSelect.addEventListener('change', updateTripType);
  updateTripType();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = {
      tripType: form.dataset.tripType,
      origin: (origin.getValue() || {}).code,
      destination: (destination.getValue() || {}).code,
      departureDate: departure.input.value,
      returnDate: ret.input.value,
      adults,
      cabin,
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
    } else if (!query.departureDate || (query.tripType === 'RETURN' && !query.returnDate)) {
      message = labels['date error'];
      focus = query.departureDate ? ret.input : departure.input;
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

  if (!originName) nameDefaultOrigin(origin, originCode, locale);
}
