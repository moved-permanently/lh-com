import { getLocale, brandEntry } from '../../scripts/locale.js';
import { bookInApp } from '../../scripts/app-bridge.js';
import {
  readConfigRows, pick, resolveLabels, parseAirportCode, parseAirportName,
  decorateExternalLinks, cleanText,
} from '../../scripts/block-config.js';
import { createAirportCombobox } from '../../scripts/airport-combobox.js';
import {
  fareTeaserRecommendRequest, catalogRequest, fetchRequest, resolveOrigin,
  mapRecommendedOrigins, mapConditions, mapLocaleData, findOrigin, filterAirports,
  searchAirports, formatFare, destinationImageUrl, htmlToParagraphs, damPathReady,
  destinationFinderOffersRequest, mapDestinationFinderOffers, mapAffinities, mapRegions,
  fetchLabels, pickLabels, fillLabel,
} from '../../scripts/lh-api.js';
import { attachDamFallback } from '../../scripts/dam-path.js';
import { markSource } from '../../scripts/lh-data.js';

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
 * Destinations the slider shows: like the live component, 15 destinations and then the finder
 * card (homepages de/en, de/de, at/de, gb/en). www's recommendations come from the fare teaser
 * service (fareteaser/offers), which only answers www; the slider shows the destination finder's
 * answer instead (GET .../destinationfinder/destination/finder/{origin}/E?months=0_11&tripType=
 * RETURN|ONEWAY, direct, live only): the top deals first, then by price. www's recommendation
 * order is not reproduced.
 */
const MAX_DESTINATIONS = 15;

/** The slider's order: topDeal destinations first, then the lowest price. */
export function sliderOrder(offers) {
  return [...offers].sort((a, b) => Number(b.topDeal) - Number(a.topDeal) || a.price - b.price);
}

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
    // no authored origin: '' (resolved when the page is viewed: defaultAirport, else the
    // home airport, as flight search)
    origin: {
      code: parseAirportCode(originValue) || '',
      name: parseAirportCode(originValue) ? parseAirportName(originValue) : '',
    },
    fallbackOrigin: locale.homeAirport,
    tripTypes,
    tripType: TRIP_TYPE_CODES[oneWayFirst ? 1 : 0],
    tripDuration: parseInt(text('trip-duration', 'duration'), 10) || 14,
    airlineWhitelist: /^(y|yes|true|ja|1)$/i.test(text('airline-whitelist')),
  };
}

/** The live requests: destinations for the origin and trip type; origins, conditions, format. */
export function destinationFinderRequests(state) {
  return {
    offers: destinationFinderOffersRequest({
      origin: state.origin.code, cabin: 'E', tripType: state.tripType,
    }),
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
    // a price route: live or nothing (scripts/lh-data.js)
    const [{ data, source }] = await Promise.all([fetchRequest(request, locale), damPathReady()]);
    return {
      destinations: sliderOrder(mapDestinationFinderOffers(data).offers)
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
  const requests = destinationFinderRequests({ origin: { code: locale.homeAirport } });
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

/**
 * Link of one recommended destination: the destination page (authored, else the live site's
 * page under this locale) with OriginCode, tripType, DestinationCode and, for round trips,
 * TripDuration.
 * @param {string} [base] authored destination page URL
 */
export function buildDestinationLink({
  origin, destination, tripType, tripDuration,
}, locale, base) {
  const params = new URLSearchParams({
    OriginCode: origin, tripType, DestinationCode: destination,
  });
  if (tripType === 'RETURN') params.set('TripDuration', tripDuration);
  const page = base || `${locale.base}/book-and-manage/destination`;
  return `${page}${page.includes('?') ? '&' : '?'}${params}`;
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
    // live: labels/common common.user.disclaimerandconditions.linktext
    'conditions label': 'Conditions',
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
    'conditions label': 'Konditionen',
  },
  it: {
    heading: 'Offerte voli da',
    'origin input label': 'Scegli una città di partenza',
    'change origin label': 'Cambia partenza',
    'trip type label': 'Tipo di viaggio',
    'price label': 'Andata e ritorno da',
    'one way price label': 'Solo andata da',
    'previous label': 'Precedente',
    'next label': 'Successivo',
    'no results label': 'Nessun aeroporto corrispondente',
    'conditions label': 'Condizioni',
  },
  fr: {
    heading: 'Offres de vols au départ de',
    'origin input label': 'Veuillez choisir une ville de départ',
    'change origin label': 'Modifier le départ',
    'trip type label': 'Type de voyage',
    'price label': 'Aller-retour à partir de',
    'one way price label': 'Aller simple à partir de',
    'previous label': 'Précédent',
    'next label': 'Suivant',
    'no results label': 'Aucun aéroport correspondant',
    'conditions label': 'Conditions',
  },
  es: {
    heading: 'Ofertas de vuelos desde',
    'origin input label': 'Elija una ciudad de origen',
    'change origin label': 'Cambiar origen',
    'trip type label': 'Tipo de viaje',
    'price label': 'Ida y vuelta desde',
    'one way price label': 'Solo ida desde',
    'previous label': 'Anterior',
    'next label': 'Siguiente',
    'no results label': 'No hay aeropuertos que coincidan',
    'conditions label': 'Condiciones',
  },
  nl: {
    heading: 'Vluchtaanbiedingen vanaf',
    'origin input label': 'Kies een vertrekstad',
    'change origin label': 'Vertrekpunt wijzigen',
    'trip type label': 'Soort reis',
    'price label': 'Retour vanaf',
    'one way price label': 'Enkele reis vanaf',
    'previous label': 'Vorige',
    'next label': 'Volgende',
    'no results label': 'Geen overeenkomende luchthavens',
    'conditions label': 'Voorwaarden',
  },
  pt: {
    heading: 'Ofertas de voos saindo de',
    'origin input label': 'Escolha uma cidade de origem',
    'change origin label': 'Alterar origem',
    'trip type label': 'Tipo de viagem',
    'price label': 'Ida e volta a partir de',
    'one way price label': 'Somente ida a partir de',
    'previous label': 'Anterior',
    'next label': 'Próximo',
    'no results label': 'Nenhum aeroporto correspondente',
    'conditions label': 'Condições',
  },
  el: {
    heading: 'Προσφορές πτήσεων από',
    'origin input label': 'Επιλέξτε πόλη αναχώρησης',
    'change origin label': 'Αλλαγή αναχώρησης',
    'trip type label': 'Τύπος ταξιδιού',
    'price label': 'Με επιστροφή από',
    'one way price label': 'Μόνο μετάβαση από',
    'previous label': 'Προηγούμενο',
    'next label': 'Επόμενο',
    'no results label': 'Δεν βρέθηκαν αεροδρόμια',
    'conditions label': 'Όροι',
  },
  ja: {
    heading: '出発地別の航空券',
    'origin input label': '出発都市を選択してください',
    'change origin label': '出発地を変更',
    'trip type label': '旅程タイプ',
    'price label': '往復',
    'one way price label': '片道',
    'previous label': '前へ',
    'next label': '次へ',
    'no results label': '該当する空港はありません',
    'conditions label': '条件',
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
  // in the app's web view the app books (DestinationFinderBookingRequest, scripts/app-bridge.js)
  bookInApp(link, 'DestinationFinderBookingRequest');
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
    attachDamFallback(img, () => img.remove());
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
 * authored only the conditions title). Untitled conditions get the title (the slider's live
 * link reads "Conditions"/"Konditionen"; the grid's the catalog headline "General Conditions").
 * @param {string} [title] disclosure title; default: the catalog's conditionsHeadline
 */
function fillNotes(footer, notes, conditionsData, title) {
  if (!notes.querySelector('.destination-finder-disclaimer') && conditionsData.footerText) {
    const disclaimer = el('div', 'destination-finder-disclaimer');
    disclaimer.append(el('p', '', conditionsData.footerText));
    notes.prepend(disclaimer);
  }
  let conditions = notes.querySelector('.destination-finder-conditions');
  const paragraphs = htmlToParagraphs(conditionsData.html);
  if (paragraphs.length && (!conditions || !conditions.querySelector('details'))) {
    const authored = conditions ? conditions.textContent.trim() : '';
    if (authored.length <= 60) {
      if (!conditions) {
        conditions = el('div', 'destination-finder-conditions');
        notes.append(conditions);
      }
      const titleEl = el('p');
      titleEl.append(el('strong', '', authored || title || conditionsData.headline));
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

/* ---------------------------------------------------------------------------------------------
 * Grid mode ("Destination Finder (grid)"): the full-page live component dcep-destination-finder
 * ("Best offers") with a filter column and a grid of every destination. It loads
 *   GET /service/api/destinationfinder/destination/finder/{origin}/{cabin}?months=&tripType=
 *   GET /service/api/labels/destinationFinder/lh/{lang}
 *   GET /service/api/catalogs/affinities, catalogs/regions
 * plus fareteaser/recommend (origin cities), catalogs/conditions and catalogs/localeData like
 * the slider. Origin, travel class, months and trip type reload; the other filters, the sort
 * order and paging work client-side on the loaded offers. destinationfinder/* is called directly
 * on www.lufthansa.com with the market's X-Portal-* headers (scripts/lh-data.js), the
 * recordings as fallback; data-lh-source on the block tells which answered.
 * ------------------------------------------------------------------------------------------- */

/** Highlighting order of the live component (priorityOfHighlightingOffers). */
const HIGHLIGHT_PRIORITY = ['topDeal', 'previouslySeen', 'kClass'];
/** Tiles rendered at first and per "show more" (the live grid also loads more on scroll). */
const GRID_PAGE_SIZE = 48;
/** Activities shown before the "more" toggle, like the live filter. */
const VISIBLE_ACTIVITIES = 3;
const GRID_SORTS = ['topDeal', 'price', 'alphabet'];

/**
 * Settings of an authored grid block (the live component's data-dcep: tripDuration,
 * maxHighlightedOffers, priorityOfHighlightingOffers, aiSearchUrl, baseRedirectUrl).
 * @param {Object} config result of readConfigRows
 * @param {Object} locale result of getLocale()
 */
export function readGridSettings(config, locale) {
  const { origin, tripDuration } = readDestinationFinderSettings(config, locale);
  const entry = (...keys) => pick(config, ...keys) || {};
  const max = parseInt(entry('highlighted-offers', 'max-highlighted-offers').text, 10);
  const priority = (entry('highlight-priority', 'priority-of-highlighting-offers').list || []);
  const smart = entry('smart-search', 'smart-destination-search').link;
  const page = entry('destination-page', 'base-redirect-url');
  const pageText = page.text || '';
  let destinationPage = '';
  if (page.link) destinationPage = page.link.href;
  else if (/^(https?:\/\/|\/)\S+$/.test(pageText)) destinationPage = pageText;
  return {
    origin,
    tripDuration,
    maxHighlighted: Number.isFinite(max) && max >= 0 ? max : 6,
    priority: priority.length ? priority : HIGHLIGHT_PRIORITY,
    smartSearch: smart ? { href: smart.href, text: cleanText(smart) } : null,
    destinationPage,
  };
}

/**
 * Offers flagged "Recommended": up to max offers, taken in the service's order by the
 * priority list (topDeal, then kClass; previouslySeen needs the live visit history and is
 * skipped).
 * @param {Array} offers result of mapDestinationFinderOffers (filtered)
 * @param {number} max maxHighlightedOffers
 * @param {string[]} [priority]
 * @returns {Array} the highlighted offers in the service's order
 */
export function highlightedOffers(offers, max, priority = HIGHLIGHT_PRIORITY) {
  const tests = { topdeal: (o) => o.topDeal, kclass: (o) => o.kClass };
  const picked = [];
  priority.forEach((name) => {
    const test = tests[String(name).toLowerCase()];
    if (!test) return;
    offers.forEach((o) => {
      if (picked.length < max && test(o) && !picked.includes(o)) picked.push(o);
    });
  });
  return picked;
}

/**
 * Sort orders of the live grid: 'topDeal' (Recommended: the highlighted offers by price, then
 * all others by price), 'price' (ascending), 'alphabet' (city name in the page language).
 */
export function sortGridOffers(offers, sort, highlighted = [], lang = 'en') {
  const byPrice = (a, b) => a.price - b.price;
  if (sort === 'price') return [...offers].sort(byPrice);
  if (sort === 'alphabet') {
    return [...offers].sort((a, b) => (a.name || a.code).localeCompare(b.name || b.code, lang));
  }
  const top = new Set(highlighted);
  return [...highlighted].sort(byPrice).concat(offers.filter((o) => !top.has(o)).sort(byPrice));
}

/**
 * Client-side filters: destinations (cities, countries, regions; any of them), maximum price
 * (as displayed, rounded up), nonstop only, Lufthansa-operated only, activities (any of them).
 */
export function filterGridOffers(offers, {
  destinations = [], maxPrice = null, nonstop = false, tenantOnly = false, activities = [],
} = {}) {
  const matches = (o, d) => (d.kind === 'city' && d.code === o.code)
    || (d.kind === 'country' && d.code === o.countryCode)
    || (d.kind === 'region' && d.code === o.region);
  return offers.filter((o) => (!destinations.length || destinations.some((d) => matches(o, d)))
    && (!Number.isFinite(maxPrice) || Math.ceil(o.price - 1e-9) <= maxPrice)
    && (!nonstop || o.stops === 0)
    && (!tenantOnly || o.tenantOperating)
    && (!activities.length || activities.some((a) => o.affinities.includes(a))));
}

/** Destination filter options of the loaded offers: cities, countries, then regions. */
export function destinationFilterOptions(offers, regions = []) {
  const cities = new Map();
  const countries = new Map();
  const regionCodes = new Set();
  offers.forEach((o) => {
    if (!cities.has(o.code)) {
      cities.set(o.code, {
        kind: 'city', code: o.code, name: o.name || o.code, detail: o.country,
      });
    }
    if (o.countryCode && o.country && !countries.has(o.countryCode)) {
      countries.set(o.countryCode, { kind: 'country', code: o.countryCode, name: o.country });
    }
    if (o.region) regionCodes.add(o.region);
  });
  const regionOptions = regions.filter((r) => regionCodes.has(r.code))
    .map((r) => ({ kind: 'region', code: r.code, name: r.name }));
  return [...cities.values(), ...countries.values(), ...regionOptions];
}

const foldText = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/**
 * Typeahead matches by name (start of the name, start of a word, anywhere from 3 letters) or
 * city code, grouped like the live list: cities, countries, regions.
 */
export function matchDestinationOptions(options, term, perGroup = 6) {
  const q = foldText(term).trim();
  if (!q) return [];
  const score = (o) => {
    const name = foldText(o.name);
    if (name.startsWith(q) || (o.kind === 'city' && foldText(o.code) === q)) return 0;
    if (name.split(/[^a-z0-9]+/).some((w) => w.startsWith(q))) return 1;
    if (q.length >= 3 && name.includes(q)) return 2;
    return -1;
  };
  return ['city', 'country', 'region'].flatMap((kind) => options
    .filter((o) => o.kind === kind)
    .map((o) => ({ o, s: score(o) }))
    .filter(({ s }) => s >= 0)
    .sort((x, y) => x.s - y.s || x.o.name.localeCompare(y.o.name))
    .slice(0, perGroup)
    .map(({ o }) => o));
}

/**
 * Twelve travel months from the current one: [{ offset, label }]. Formatted in the page
 * language like the live selects ("Oct 2026", "Sep 2027"; en-DE would give "Sept").
 */
export function travelMonths(locale, now = new Date()) {
  const format = new Intl.DateTimeFormat(locale.lang, { month: 'short', year: 'numeric' });
  return Array.from({ length: 12 }, (v, offset) => ({
    offset,
    label: format.format(new Date(now.getFullYear(), now.getMonth() + offset, 1)),
  }));
}

/** Requests answered by settle() record their source; failures give the fallback. */
function settleRequest(sources, name, request, locale, mapper, fallback, options) {
  return fetchRequest(request, locale, options)
    .then(({ data, source }) => {
      sources[name] = source;
      return mapper(data);
    })
    .catch(() => {
      sources[name] = 'none';
      return fallback;
    });
}

/** Live labels used by the grid, by block label key (labels/destinationFinder). */
const GRID_LIVE_LABELS = Object.fromEntries(Object.entries({
  'filter heading': 'FilterSection.headline',
  'filter info': 'FilterSection.filterSrInfo',
  'where to fly label': 'FilterSection.OriginAndDestinationFilter',
  'destination label': 'FilterSection.destinationCode.label',
  'destination hint': 'FilterSection.destinationCode.hint',
  'destination no results label': 'FilterSection.typeAheadNoResults',
  'selected destinations label': 'FilterSection.destinationCode.chipSectionAriaLabel',
  'destination added label': 'FilterSection.destinationCode.optionAddedSrInfo',
  'destination removed label': 'FilterSection.destinationCode.optionRemovedSrInfo',
  'budget label': 'FilterSection.budgetFilter',
  'budget slider label': 'FilterSection.budgetFilterLabel',
  'budget value label': 'FilterSection.budgetFilterSliderLabel',
  'month label': 'FilterSection.monthFilter',
  'stops label': 'FilterSection.nonstopFilter',
  'nonstop label': 'FilterSection.nonstopFilterLabel',
  'stops info': 'FilterSection.nonStopAndAirlinesFiltersDisclaimer',
  'travel classes label': 'FilterSection.TravelClassFilter',
  'travel class label': 'FilterSection.TravelClassLabel',
  'airline label': 'FilterSection.partnerFlights',
  'all partners label': 'FilterSection.allPartners',
  'tenant only label': 'FilterSection.currentTenantOnly',
  'trip type label': 'FilterSection.tripType',
  'round trip label': 'FilterSection.tripTypeReturn',
  'one way label': 'FilterSection.tripTypeOneWay',
  'activities label': 'FilterSection.activityFilter',
  'activities info': 'FilterSection.srFilterActivitiesDescription',
  'no activities label': 'FilterSection.noActivitiesAvailable',
  'filters button label': 'FilterSection.modal',
  'reset label': 'FilterSection.resetFiltersButtonLabel',
  'reset done label': 'FilterSection.reset',
  'results count label': 'FilterSection.filterFooterResultsNumber',
  'results heading': 'resultSection.srResultListGlobalMode',
  'sort label': 'resultSection.sortFilter',
  'sort recommended label': 'resultSection.sortTop',
  'sort price label': 'resultSection.sortPrice',
  'sort alphabet label': 'resultSection.sortAlphabet',
  'sorted label': 'resultSection.srSortingChanged',
  'recommended label': 'resultSection.sortTop',
  'smart search label': 'common.aiSearchButtonLabel',
  'no results for origin heading': 'resultSection.noResultsForOriginHeadline',
  'no results for origin': 'resultSection.noResultsForOrigin',
  'no results for filters heading': 'resultSection.noResultsForFiltersHeadline',
  'no results for filters': 'resultSection.noResultsForFilters',
  'more loaded label': 'resultSection.moreDestinationsLoaded',
  'all loaded label': 'resultSection.allOffersLoaded',
}).map(([key, live]) => [key, `destinationFinder.destinationFinder.${live}`]));

/**
 * Defaults of the grid's strings (the live English labels and German equivalents); the live
 * labels replace them, any authored row of the same name replaces both.
 */
const GRID_DEFAULT_LABELS = {
  en: {
    'filter heading': 'Filter',
    'filter info': 'Offers will be displayed based on filter options available below',
    'where to fly label': 'Where to fly',
    'origin input label': 'From',
    'destination label': 'Destination',
    'destination hint': 'Add as many cities, countries and/or regions as you wish',
    'destination no results label': 'Nothing matches the entered query',
    'selected destinations label': 'These are currently set options. Use button/s below to remove selected option/s',
    'destination added label': '{OPTION} has been added to selected destinations',
    'destination removed label': '{OPTION} has been removed from selected destinations',
    'remove label': 'Remove',
    'budget label': 'Budget',
    'budget slider label': 'Slider to filter for budget',
    'budget value label': 'Max: {VALUE}',
    'month label': 'Month',
    'month from label': 'From',
    'month to label': 'To',
    'stops label': 'Stops',
    'nonstop label': 'Nonstop only',
    'stops info': 'Filters for stops and flight carrier affect only what destinations are displayed, it does not affect the price display: we always show the lowest price available for Lufthansa Group and our partners.',
    'info label': 'More information',
    'travel classes label': 'Travel classes',
    'travel class label': 'Travel class',
    'economy label': 'Economy',
    'premium economy label': 'Premium Economy',
    'business label': 'Business',
    'first label': 'First',
    'airline label': 'Airline',
    'all partners label': 'All partners',
    'tenant only label': 'Lufthansa only',
    'trip type label': 'Type of trip',
    'round trip label': 'Round trip',
    'one way label': 'One-way',
    'activities label': 'Activities',
    'activities info': 'Select one or more activities to filter destinations.',
    'no activities label': 'No activities available',
    'more activities label': 'More information',
    'fewer activities label': 'Less information',
    'filters button label': 'Filters',
    'reset label': 'Reset',
    'reset done label': 'Filters were reset to initial state.',
    'results count label': '{NUMBER} matching destinations',
    'results heading': 'Cities results. Select a destination city to display more options about it.',
    'sort label': 'Sort by',
    'sort recommended label': 'Recommended',
    'sort price label': 'Price',
    'sort alphabet label': 'Alphabet',
    'sorted label': 'The results were sorted by {OPTION}',
    'recommended label': 'Recommended',
    'smart search label': 'Smart destination search',
    'price label': 'Round trip from',
    'one way price label': 'One way from',
    'no results for origin heading': 'No results for your current origin selection',
    'no results for origin': 'For this selected origin we do not offer any destinations. Please select a different origin.',
    'no results for filters heading': 'No results for your selected filters',
    'no results for filters': 'No destinations match the current filters. Adjust the filters or reset them to explore all available options.',
    'show more label': 'Show more',
    'more loaded label': 'Loaded with extra {NUMBER} items',
    'all loaded label': 'Loaded all available offers. You can refine your search by applying filters of your preference',
    'no results label': 'No matching airports',
  },
  de: {
    'filter heading': 'Filter',
    'filter info': 'Die Angebote werden anhand der folgenden Filteroptionen angezeigt',
    'where to fly label': 'Wohin fliegen',
    'origin input label': 'Von',
    'destination label': 'Ziel',
    'destination hint': 'Fügen Sie beliebig viele Städte, Länder und/oder Regionen hinzu',
    'destination no results label': 'Keine Treffer für Ihre Eingabe',
    'selected destinations label': 'Aktuell gewählte Optionen. Mit den Schaltflächen unten entfernen Sie gewählte Optionen',
    'destination added label': '{OPTION} wurde zu den gewählten Zielen hinzugefügt',
    'destination removed label': '{OPTION} wurde aus den gewählten Zielen entfernt',
    'remove label': 'Entfernen',
    'budget label': 'Budget',
    'budget slider label': 'Schieberegler zum Filtern nach Budget',
    'budget value label': 'Max: {VALUE}',
    'month label': 'Monat',
    'month from label': 'Von',
    'month to label': 'Bis',
    'stops label': 'Stopps',
    'nonstop label': 'Nur Nonstop',
    'stops info': 'Die Filter für Stopps und Fluggesellschaft beeinflussen nur, welche Ziele angezeigt werden, nicht die Preisanzeige: Wir zeigen immer den niedrigsten verfügbaren Preis der Lufthansa Group und unserer Partner.',
    'info label': 'Weitere Informationen',
    'travel classes label': 'Reiseklassen',
    'travel class label': 'Reiseklasse',
    'economy label': 'Economy',
    'premium economy label': 'Premium Economy',
    'business label': 'Business',
    'first label': 'First',
    'airline label': 'Fluggesellschaft',
    'all partners label': 'Alle Partner',
    'tenant only label': 'Nur Lufthansa',
    'trip type label': 'Reiseart',
    'round trip label': 'Hin- und Rückflug',
    'one way label': 'Nur Hinflug',
    'activities label': 'Aktivitäten',
    'activities info': 'Wählen Sie eine oder mehrere Aktivitäten, um die Ziele zu filtern.',
    'no activities label': 'Keine Aktivitäten verfügbar',
    'more activities label': 'Weitere Informationen',
    'fewer activities label': 'Weniger Informationen',
    'filters button label': 'Filter',
    'reset label': 'Zurücksetzen',
    'reset done label': 'Die Filter wurden zurückgesetzt.',
    'results count label': '{NUMBER} passende Ziele',
    'results heading': 'Städte. Wählen Sie eine Stadt, um weitere Optionen zu sehen.',
    'sort label': 'Sortieren nach',
    'sort recommended label': 'Empfohlen',
    'sort price label': 'Preis',
    'sort alphabet label': 'Alphabet',
    'sorted label': 'Die Ergebnisse wurden nach {OPTION} sortiert',
    'recommended label': 'Empfohlen',
    'smart search label': 'Intelligente Zielsuche',
    'price label': 'Hin- und Rückflug ab',
    'one way price label': 'Hinflug ab',
    'no results for origin heading': 'Keine Ergebnisse für Ihren gewählten Abflugort',
    'no results for origin': 'Für diesen Abflugort bieten wir keine Ziele an. Bitte wählen Sie einen anderen Abflugort.',
    'no results for filters heading': 'Keine Ergebnisse für Ihre gewählten Filter',
    'no results for filters': 'Keine Ziele entsprechen den aktuellen Filtern. Passen Sie die Filter an oder setzen Sie sie zurück.',
    'show more label': 'Mehr anzeigen',
    'more loaded label': '{NUMBER} weitere Ziele geladen',
    'all loaded label': 'Alle verfügbaren Angebote wurden geladen. Mit den Filtern können Sie Ihre Suche verfeinern',
    'no results label': 'Keine passenden Flughäfen',
  },
  it: {
    'filter heading': 'Filtro',
    'filter info': 'Le offerte vengono mostrate in base ai filtri disponibili qui sotto',
    'where to fly label': 'Dove volare',
    'origin input label': 'Da',
    'destination label': 'Destinazione',
    'destination hint': 'Aggiungi tutte le città, i paesi e/o le regioni che desideri',
    'destination no results label': 'Nessun risultato per la ricerca inserita',
    'selected destinations label': 'Queste sono le opzioni attualmente impostate. Usa i pulsanti qui sotto per rimuovere le opzioni selezionate',
    'destination added label': '{OPTION} è stato aggiunto alle destinazioni selezionate',
    'destination removed label': '{OPTION} è stato rimosso dalle destinazioni selezionate',
    'remove label': 'Rimuovi',
    'budget label': 'Budget',
    'budget slider label': 'Cursore per filtrare per budget',
    'budget value label': 'Max: {VALUE}',
    'month label': 'Mese',
    'month from label': 'Da',
    'month to label': 'A',
    'stops label': 'Scali',
    'nonstop label': 'Solo voli diretti',
    'stops info': 'I filtri per scali e compagnia aerea influiscono solo sulle destinazioni mostrate, non sui prezzi: mostriamo sempre il prezzo più basso disponibile per il Gruppo Lufthansa e i nostri partner.',
    'info label': 'Ulteriori informazioni',
    'travel classes label': 'Classi di viaggio',
    'travel class label': 'Classe di viaggio',
    'economy label': 'Economy',
    'premium economy label': 'Premium Economy',
    'business label': 'Business',
    'first label': 'First',
    'airline label': 'Compagnia aerea',
    'all partners label': 'Tutti i partner',
    'tenant only label': 'Solo Lufthansa',
    'trip type label': 'Tipo di viaggio',
    'round trip label': 'Andata e ritorno',
    'one way label': 'Solo andata',
    'activities label': 'Attività',
    'activities info': 'Seleziona una o più attività per filtrare le destinazioni.',
    'no activities label': 'Nessuna attività disponibile',
    'more activities label': 'Ulteriori informazioni',
    'fewer activities label': 'Meno informazioni',
    'filters button label': 'Filtri',
    'reset label': 'Reimposta',
    'reset done label': 'I filtri sono stati reimpostati.',
    'results count label': '{NUMBER} destinazioni corrispondenti',
    'results heading': 'Risultati per città. Seleziona una città di destinazione per vedere altre opzioni.',
    'sort label': 'Ordina per',
    'sort recommended label': 'Consigliati',
    'sort price label': 'Prezzo',
    'sort alphabet label': 'Ordine alfabetico',
    'sorted label': 'I risultati sono stati ordinati per {OPTION}',
    'recommended label': 'Consigliato',
    'smart search label': 'Ricerca intelligente delle destinazioni',
    'price label': 'Andata e ritorno da',
    'one way price label': 'Solo andata da',
    'no results for origin heading': 'Nessun risultato per la partenza selezionata',
    'no results for origin': 'Per questa partenza non offriamo destinazioni. Seleziona un’altra partenza.',
    'no results for filters heading': 'Nessun risultato per i filtri selezionati',
    'no results for filters': 'Nessuna destinazione corrisponde ai filtri attuali. Modifica o reimposta i filtri per vedere tutte le opzioni disponibili.',
    'show more label': 'Mostra di più',
    'more loaded label': 'Caricati altri {NUMBER} elementi',
    'all loaded label': 'Tutte le offerte disponibili sono state caricate. Puoi affinare la ricerca con i filtri che preferisci',
    'no results label': 'Nessun aeroporto corrispondente',
  },
  fr: {
    'filter heading': 'Filtre',
    'filter info': 'Les offres sont affichées selon les filtres disponibles ci-dessous',
    'where to fly label': 'Où voler',
    'origin input label': 'De',
    'destination label': 'Destination',
    'destination hint': 'Ajoutez autant de villes, de pays et/ou de régions que vous le souhaitez',
    'destination no results label': 'Aucun résultat pour votre recherche',
    'selected destinations label': 'Voici les options actuellement définies. Utilisez les boutons ci-dessous pour supprimer les options sélectionnées',
    'destination added label': '{OPTION} a été ajouté aux destinations sélectionnées',
    'destination removed label': '{OPTION} a été retiré des destinations sélectionnées',
    'remove label': 'Supprimer',
    'budget label': 'Budget',
    'budget slider label': 'Curseur pour filtrer par budget',
    'budget value label': 'Max : {VALUE}',
    'month label': 'Mois',
    'month from label': 'De',
    'month to label': 'À',
    'stops label': 'Escales',
    'nonstop label': 'Vols directs uniquement',
    'stops info': 'Les filtres d’escales et de compagnie aérienne ne modifient que les destinations affichées, pas les prix : nous affichons toujours le prix le plus bas disponible pour le groupe Lufthansa et nos partenaires.',
    'info label': 'Plus d’informations',
    'travel classes label': 'Classes de voyage',
    'travel class label': 'Classe de voyage',
    'economy label': 'Economy',
    'premium economy label': 'Premium Economy',
    'business label': 'Business',
    'first label': 'First',
    'airline label': 'Compagnie aérienne',
    'all partners label': 'Tous les partenaires',
    'tenant only label': 'Lufthansa uniquement',
    'trip type label': 'Type de voyage',
    'round trip label': 'Aller-retour',
    'one way label': 'Aller simple',
    'activities label': 'Activités',
    'activities info': 'Sélectionnez une ou plusieurs activités pour filtrer les destinations.',
    'no activities label': 'Aucune activité disponible',
    'more activities label': 'Plus d’informations',
    'fewer activities label': 'Moins d’informations',
    'filters button label': 'Filtres',
    'reset label': 'Réinitialiser',
    'reset done label': 'Les filtres ont été réinitialisés.',
    'results count label': '{NUMBER} destinations correspondantes',
    'results heading': 'Résultats par ville. Sélectionnez une ville de destination pour afficher plus d’options.',
    'sort label': 'Trier par',
    'sort recommended label': 'Recommandés',
    'sort price label': 'Prix',
    'sort alphabet label': 'Ordre alphabétique',
    'sorted label': 'Les résultats ont été triés par {OPTION}',
    'recommended label': 'Recommandé',
    'smart search label': 'Recherche intelligente de destinations',
    'price label': 'Aller-retour à partir de',
    'one way price label': 'Aller simple à partir de',
    'no results for origin heading': 'Aucun résultat pour le départ sélectionné',
    'no results for origin': 'Nous ne proposons aucune destination au départ de cette ville. Veuillez choisir un autre départ.',
    'no results for filters heading': 'Aucun résultat pour les filtres sélectionnés',
    'no results for filters': 'Aucune destination ne correspond aux filtres actuels. Modifiez-les ou réinitialisez-les pour voir toutes les options disponibles.',
    'show more label': 'Afficher plus',
    'more loaded label': '{NUMBER} éléments supplémentaires chargés',
    'all loaded label': 'Toutes les offres disponibles ont été chargées. Vous pouvez affiner votre recherche avec les filtres de votre choix',
    'no results label': 'Aucun aéroport correspondant',
  },
  es: {
    'filter heading': 'Filtro',
    'filter info': 'Las ofertas se muestran según las opciones de filtro disponibles a continuación',
    'where to fly label': 'Adónde volar',
    'origin input label': 'Desde',
    'destination label': 'Destino',
    'destination hint': 'Añada tantas ciudades, países o regiones como desee',
    'destination no results label': 'No hay resultados para la búsqueda',
    'selected destinations label': 'Estas son las opciones seleccionadas. Use los botones de abajo para quitar las opciones seleccionadas',
    'destination added label': '{OPTION} se ha añadido a los destinos seleccionados',
    'destination removed label': '{OPTION} se ha quitado de los destinos seleccionados',
    'remove label': 'Quitar',
    'budget label': 'Presupuesto',
    'budget slider label': 'Control deslizante para filtrar por presupuesto',
    'budget value label': 'Máx.: {VALUE}',
    'month label': 'Mes',
    'month from label': 'Desde',
    'month to label': 'Hasta',
    'stops label': 'Escalas',
    'nonstop label': 'Solo vuelos directos',
    'stops info': 'Los filtros de escalas y aerolínea solo cambian los destinos mostrados, no los precios: siempre mostramos el precio más bajo disponible del Grupo Lufthansa y nuestros socios.',
    'info label': 'Más información',
    'travel classes label': 'Clases de viaje',
    'travel class label': 'Clase de viaje',
    'economy label': 'Economy',
    'premium economy label': 'Premium Economy',
    'business label': 'Business',
    'first label': 'First',
    'airline label': 'Aerolínea',
    'all partners label': 'Todos los socios',
    'tenant only label': 'Solo Lufthansa',
    'trip type label': 'Tipo de viaje',
    'round trip label': 'Ida y vuelta',
    'one way label': 'Solo ida',
    'activities label': 'Actividades',
    'activities info': 'Seleccione una o varias actividades para filtrar los destinos.',
    'no activities label': 'No hay actividades disponibles',
    'more activities label': 'Más información',
    'fewer activities label': 'Menos información',
    'filters button label': 'Filtros',
    'reset label': 'Restablecer',
    'reset done label': 'Los filtros se han restablecido.',
    'results count label': '{NUMBER} destinos coincidentes',
    'results heading': 'Resultados por ciudad. Seleccione una ciudad de destino para ver más opciones.',
    'sort label': 'Ordenar por',
    'sort recommended label': 'Recomendados',
    'sort price label': 'Precio',
    'sort alphabet label': 'Orden alfabético',
    'sorted label': 'Los resultados se han ordenado por {OPTION}',
    'recommended label': 'Recomendado',
    'smart search label': 'Búsqueda inteligente de destinos',
    'price label': 'Ida y vuelta desde',
    'one way price label': 'Solo ida desde',
    'no results for origin heading': 'No hay resultados para el origen seleccionado',
    'no results for origin': 'No ofrecemos destinos desde este origen. Seleccione otro origen.',
    'no results for filters heading': 'No hay resultados para los filtros seleccionados',
    'no results for filters': 'Ningún destino coincide con los filtros actuales. Ajuste o restablezca los filtros para ver todas las opciones disponibles.',
    'show more label': 'Mostrar más',
    'more loaded label': 'Se han cargado {NUMBER} elementos más',
    'all loaded label': 'Se han cargado todas las ofertas disponibles. Puede afinar la búsqueda con los filtros que prefiera',
    'no results label': 'No hay aeropuertos que coincidan',
  },
  nl: {
    'filter heading': 'Filter',
    'filter info': 'Aanbiedingen worden getoond op basis van de filteropties hieronder',
    'where to fly label': 'Waarheen vliegen',
    'origin input label': 'Van',
    'destination label': 'Bestemming',
    'destination hint': 'Voeg zoveel steden, landen en/of regio’s toe als u wilt',
    'destination no results label': 'Geen resultaten voor de ingevoerde zoekopdracht',
    'selected destinations label': 'Dit zijn de huidige opties. Gebruik de knoppen hieronder om geselecteerde opties te verwijderen',
    'destination added label': '{OPTION} is toegevoegd aan de geselecteerde bestemmingen',
    'destination removed label': '{OPTION} is verwijderd uit de geselecteerde bestemmingen',
    'remove label': 'Verwijderen',
    'budget label': 'Budget',
    'budget slider label': 'Schuifregelaar om op budget te filteren',
    'budget value label': 'Max: {VALUE}',
    'month label': 'Maand',
    'month from label': 'Van',
    'month to label': 'Tot',
    'stops label': 'Overstappen',
    'nonstop label': 'Alleen directe vluchten',
    'stops info': 'Filters voor overstappen en luchtvaartmaatschappij bepalen alleen welke bestemmingen worden getoond, niet de prijzen: we tonen altijd de laagste beschikbare prijs van de Lufthansa Group en onze partners.',
    'info label': 'Meer informatie',
    'travel classes label': 'Reisklassen',
    'travel class label': 'Reisklasse',
    'economy label': 'Economy',
    'premium economy label': 'Premium Economy',
    'business label': 'Business',
    'first label': 'First',
    'airline label': 'Luchtvaartmaatschappij',
    'all partners label': 'Alle partners',
    'tenant only label': 'Alleen Lufthansa',
    'trip type label': 'Soort reis',
    'round trip label': 'Retour',
    'one way label': 'Enkele reis',
    'activities label': 'Activiteiten',
    'activities info': 'Selecteer een of meer activiteiten om bestemmingen te filteren.',
    'no activities label': 'Geen activiteiten beschikbaar',
    'more activities label': 'Meer informatie',
    'fewer activities label': 'Minder informatie',
    'filters button label': 'Filters',
    'reset label': 'Opnieuw instellen',
    'reset done label': 'De filters zijn opnieuw ingesteld.',
    'results count label': '{NUMBER} overeenkomende bestemmingen',
    'results heading': 'Resultaten per stad. Selecteer een bestemming voor meer opties.',
    'sort label': 'Sorteren op',
    'sort recommended label': 'Aanbevolen',
    'sort price label': 'Prijs',
    'sort alphabet label': 'Alfabet',
    'sorted label': 'De resultaten zijn gesorteerd op {OPTION}',
    'recommended label': 'Aanbevolen',
    'smart search label': 'Slim zoeken naar bestemmingen',
    'price label': 'Retour vanaf',
    'one way price label': 'Enkele reis vanaf',
    'no results for origin heading': 'Geen resultaten voor uw vertrekpunt',
    'no results for origin': 'Voor dit vertrekpunt bieden we geen bestemmingen aan. Selecteer een ander vertrekpunt.',
    'no results for filters heading': 'Geen resultaten voor de geselecteerde filters',
    'no results for filters': 'Geen bestemmingen voldoen aan de huidige filters. Pas de filters aan of stel ze opnieuw in om alle opties te zien.',
    'show more label': 'Meer tonen',
    'more loaded label': '{NUMBER} extra items geladen',
    'all loaded label': 'Alle beschikbare aanbiedingen zijn geladen. U kunt uw zoekopdracht verfijnen met de filters van uw keuze',
    'no results label': 'Geen overeenkomende luchthavens',
  },
  pt: {
    'filter heading': 'Filtro',
    'filter info': 'As ofertas são exibidas de acordo com as opções de filtro abaixo',
    'where to fly label': 'Para onde voar',
    'origin input label': 'De',
    'destination label': 'Destino',
    'destination hint': 'Adicione quantas cidades, países e/ou regiões desejar',
    'destination no results label': 'Nenhum resultado para a pesquisa',
    'selected destinations label': 'Estas são as opções definidas. Use os botões abaixo para remover as opções selecionadas',
    'destination added label': '{OPTION} foi adicionado aos destinos selecionados',
    'destination removed label': '{OPTION} foi removido dos destinos selecionados',
    'remove label': 'Remover',
    'budget label': 'Orçamento',
    'budget slider label': 'Controle deslizante para filtrar por orçamento',
    'budget value label': 'Máx.: {VALUE}',
    'month label': 'Mês',
    'month from label': 'De',
    'month to label': 'Até',
    'stops label': 'Escalas',
    'nonstop label': 'Somente voos diretos',
    'stops info': 'Os filtros de escalas e companhia aérea alteram apenas os destinos exibidos, não os preços: sempre mostramos o menor preço disponível do Grupo Lufthansa e de nossos parceiros.',
    'info label': 'Mais informações',
    'travel classes label': 'Classes de viagem',
    'travel class label': 'Classe de viagem',
    'economy label': 'Economy',
    'premium economy label': 'Premium Economy',
    'business label': 'Business',
    'first label': 'First',
    'airline label': 'Companhia aérea',
    'all partners label': 'Todos os parceiros',
    'tenant only label': 'Somente Lufthansa',
    'trip type label': 'Tipo de viagem',
    'round trip label': 'Ida e volta',
    'one way label': 'Somente ida',
    'activities label': 'Atividades',
    'activities info': 'Selecione uma ou mais atividades para filtrar os destinos.',
    'no activities label': 'Nenhuma atividade disponível',
    'more activities label': 'Mais informações',
    'fewer activities label': 'Menos informações',
    'filters button label': 'Filtros',
    'reset label': 'Redefinir',
    'reset done label': 'Os filtros foram redefinidos.',
    'results count label': '{NUMBER} destinos correspondentes',
    'results heading': 'Resultados por cidade. Selecione uma cidade de destino para ver mais opções.',
    'sort label': 'Ordenar por',
    'sort recommended label': 'Recomendados',
    'sort price label': 'Preço',
    'sort alphabet label': 'Ordem alfabética',
    'sorted label': 'Os resultados foram ordenados por {OPTION}',
    'recommended label': 'Recomendado',
    'smart search label': 'Pesquisa inteligente de destinos',
    'price label': 'Ida e volta a partir de',
    'one way price label': 'Somente ida a partir de',
    'no results for origin heading': 'Nenhum resultado para a origem selecionada',
    'no results for origin': 'Não oferecemos destinos a partir desta origem. Selecione outra origem.',
    'no results for filters heading': 'Nenhum resultado para os filtros selecionados',
    'no results for filters': 'Nenhum destino corresponde aos filtros atuais. Ajuste ou redefina os filtros para ver todas as opções disponíveis.',
    'show more label': 'Mostrar mais',
    'more loaded label': '{NUMBER} itens adicionais carregados',
    'all loaded label': 'Todas as ofertas disponíveis foram carregadas. Você pode refinar a pesquisa com os filtros de sua preferência',
    'no results label': 'Nenhum aeroporto correspondente',
  },
  el: {
    'filter heading': 'Φίλτρο',
    'filter info': 'Οι προσφορές εμφανίζονται σύμφωνα με τις επιλογές φίλτρων παρακάτω',
    'where to fly label': 'Πού να πετάξετε',
    'origin input label': 'Από',
    'destination label': 'Προορισμός',
    'destination hint': 'Προσθέστε όσες πόλεις, χώρες ή/και περιοχές θέλετε',
    'destination no results label': 'Δεν βρέθηκαν αποτελέσματα για την αναζήτηση',
    'selected destinations label': 'Αυτές είναι οι τρέχουσες επιλογές. Χρησιμοποιήστε τα κουμπιά παρακάτω για να αφαιρέσετε επιλογές',
    'destination added label': 'Το {OPTION} προστέθηκε στους επιλεγμένους προορισμούς',
    'destination removed label': 'Το {OPTION} αφαιρέθηκε από τους επιλεγμένους προορισμούς',
    'remove label': 'Αφαίρεση',
    'budget label': 'Προϋπολογισμός',
    'budget slider label': 'Ρυθμιστικό για φιλτράρισμα κατά προϋπολογισμό',
    'budget value label': 'Μέγ.: {VALUE}',
    'month label': 'Μήνας',
    'month from label': 'Από',
    'month to label': 'Έως',
    'stops label': 'Ενδιάμεσες στάσεις',
    'nonstop label': 'Μόνο απευθείας πτήσεις',
    'stops info': 'Τα φίλτρα στάσεων και αεροπορικής εταιρείας αλλάζουν μόνο τους προορισμούς που εμφανίζονται, όχι τις τιμές: δείχνουμε πάντα τη χαμηλότερη διαθέσιμη τιμή του Ομίλου Lufthansa και των συνεργατών μας.',
    'info label': 'Περισσότερες πληροφορίες',
    'travel classes label': 'Θέσεις ταξιδιού',
    'travel class label': 'Θέση ταξιδιού',
    'economy label': 'Economy',
    'premium economy label': 'Premium Economy',
    'business label': 'Business',
    'first label': 'First',
    'airline label': 'Αεροπορική εταιρεία',
    'all partners label': 'Όλοι οι συνεργάτες',
    'tenant only label': 'Μόνο Lufthansa',
    'trip type label': 'Τύπος ταξιδιού',
    'round trip label': 'Με επιστροφή',
    'one way label': 'Μόνο μετάβαση',
    'activities label': 'Δραστηριότητες',
    'activities info': 'Επιλέξτε μία ή περισσότερες δραστηριότητες για να φιλτράρετε τους προορισμούς.',
    'no activities label': 'Δεν υπάρχουν διαθέσιμες δραστηριότητες',
    'more activities label': 'Περισσότερες πληροφορίες',
    'fewer activities label': 'Λιγότερες πληροφορίες',
    'filters button label': 'Φίλτρα',
    'reset label': 'Επαναφορά',
    'reset done label': 'Τα φίλτρα επανήλθαν στην αρχική κατάσταση.',
    'results count label': '{NUMBER} προορισμοί που ταιριάζουν',
    'results heading': 'Αποτελέσματα ανά πόλη. Επιλέξτε πόλη προορισμού για περισσότερες επιλογές.',
    'sort label': 'Ταξινόμηση κατά',
    'sort recommended label': 'Προτεινόμενα',
    'sort price label': 'Τιμή',
    'sort alphabet label': 'Αλφαβητικά',
    'sorted label': 'Τα αποτελέσματα ταξινομήθηκαν κατά {OPTION}',
    'recommended label': 'Προτείνεται',
    'smart search label': 'Έξυπνη αναζήτηση προορισμών',
    'price label': 'Με επιστροφή από',
    'one way price label': 'Μόνο μετάβαση από',
    'no results for origin heading': 'Δεν βρέθηκαν αποτελέσματα για την επιλεγμένη αναχώρηση',
    'no results for origin': 'Δεν προσφέρουμε προορισμούς από αυτή την αναχώρηση. Επιλέξτε άλλη αναχώρηση.',
    'no results for filters heading': 'Δεν βρέθηκαν αποτελέσματα για τα επιλεγμένα φίλτρα',
    'no results for filters': 'Κανένας προορισμός δεν ταιριάζει με τα τρέχοντα φίλτρα. Αλλάξτε ή επαναφέρετε τα φίλτρα για να δείτε όλες τις επιλογές.',
    'show more label': 'Εμφάνιση περισσότερων',
    'more loaded label': 'Φορτώθηκαν {NUMBER} επιπλέον στοιχεία',
    'all loaded label': 'Φορτώθηκαν όλες οι διαθέσιμες προσφορές. Μπορείτε να περιορίσετε την αναζήτηση με τα φίλτρα που προτιμάτε',
    'no results label': 'Δεν βρέθηκαν αεροδρόμια',
  },
  ja: {
    'filter heading': '絞り込み',
    'filter info': '以下の絞り込み条件に基づいて航空券を表示します',
    'where to fly label': '行き先',
    'origin input label': '出発地',
    'destination label': '目的地',
    'destination hint': '都市・国・地域をいくつでも追加できます',
    'destination no results label': '入力内容に一致する結果はありません',
    'selected destinations label': '現在設定されている条件です。下のボタンで選択した条件を削除できます',
    'destination added label': '{OPTION}を選択した目的地に追加しました',
    'destination removed label': '{OPTION}を選択した目的地から削除しました',
    'remove label': '削除',
    'budget label': '予算',
    'budget slider label': '予算で絞り込むスライダー',
    'budget value label': '上限: {VALUE}',
    'month label': '月',
    'month from label': '開始',
    'month to label': '終了',
    'stops label': '乗り継ぎ',
    'nonstop label': '直行便のみ',
    'stops info': '乗り継ぎと航空会社の絞り込みは表示される目的地にのみ影響し、価格には影響しません。ルフトハンザグループおよび提携航空会社の最安値を常に表示します。',
    'info label': '詳細',
    'travel classes label': '搭乗クラス',
    'travel class label': '搭乗クラス',
    'economy label': 'エコノミー',
    'premium economy label': 'プレミアムエコノミー',
    'business label': 'ビジネス',
    'first label': 'ファースト',
    'airline label': '航空会社',
    'all partners label': 'すべての提携航空会社',
    'tenant only label': 'Lufthansaのみ',
    'trip type label': '旅程タイプ',
    'round trip label': '往復',
    'one way label': '片道',
    'activities label': 'アクティビティ',
    'activities info': '目的地を絞り込むアクティビティを1つ以上選択してください。',
    'no activities label': '利用できるアクティビティはありません',
    'more activities label': '詳細',
    'fewer activities label': '詳細を閉じる',
    'filters button label': '絞り込み',
    'reset label': 'リセット',
    'reset done label': '絞り込み条件をリセットしました。',
    'results count label': '一致する目的地: {NUMBER}件',
    'results heading': '都市別の結果です。目的地の都市を選択すると詳細が表示されます。',
    'sort label': '並べ替え',
    'sort recommended label': 'おすすめ',
    'sort price label': '価格',
    'sort alphabet label': '五十音順',
    'sorted label': '{OPTION}で並べ替えました',
    'recommended label': 'おすすめ',
    'smart search label': 'スマート目的地検索',
    'price label': '往復',
    'one way price label': '片道',
    'no results for origin heading': '選択した出発地の結果はありません',
    'no results for origin': 'この出発地からご利用いただける目的地はありません。別の出発地を選択してください。',
    'no results for filters heading': '選択した条件の結果はありません',
    'no results for filters': '現在の条件に一致する目的地はありません。条件を変更するか、リセットしてすべての選択肢をご覧ください。',
    'show more label': 'もっと見る',
    'more loaded label': 'さらに{NUMBER}件を読み込みました',
    'all loaded label': 'ご利用いただけるすべての航空券を読み込みました。お好みの条件で絞り込むことができます',
    'no results label': '該当する空港はありません',
  },
};

/** Labels and catalogs of the grid: live labels, activities and regions. */
export async function loadGridContext(locale) {
  const sources = {};
  const [live, affinities, regions] = await Promise.all([
    fetchLabels(['destinationFinder'], locale),
    settleRequest(sources, 'affinities', catalogRequest('affinities'), locale, mapAffinities, []),
    settleRequest(sources, 'regions', catalogRequest('regions'), locale, mapRegions, []),
  ]);
  Object.entries(live.sources).forEach(([bundle, source]) => { sources[`labels/${bundle}`] = source; });
  return {
    labels: pickLabels(live.labels, GRID_LIVE_LABELS), affinities, regions, sources,
  };
}

/**
 * Every destination for an origin, travel class, month range and trip type. exact: the
 * recording of another request (e.g. round-trip prices for one way) is never shown; no answer
 * gives no offers ("no results for your current origin selection").
 * @param {{origin: string, cabin: string, months: number[], tripType: string}} query
 * @returns {Promise<{originName: string, offers: Array, source: string}>}
 */
export async function loadGridOffers(query, locale) {
  try {
    const request = destinationFinderOffersRequest(query);
    const { data, source } = await fetchRequest(request, locale, { exact: true });
    const { originName, offers } = mapDestinationFinderOffers(data);
    return { originName, offers: offers.filter((o) => o.code !== query.origin), source };
  } catch (e) {
    return { originName: '', offers: [], source: 'none' };
  }
}

const SPARKLE_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M10 2.5 11.8 8.2 17.5 10l-5.7 1.8L10 17.5l-1.8-5.7L2.5 10l5.7-1.8zM18 13l.9 2.6 2.6.9-2.6.9L18 20l-.9-2.6-2.6-.9 2.6-.9zM18.5 1.5l.6 1.9 1.9.6-1.9.6-.6 1.9-.6-1.9-1.9-.6 1.9-.6z"/></svg>';

function renderTile(offer, highlighted, view) {
  const li = el('li', 'destination-finder-tile');
  const link = el('a', 'destination-finder-tile-link');
  // in the app's web view the app books (DestinationFinderBookingRequest, scripts/app-bridge.js)
  bookInApp(link, 'DestinationFinderBookingRequest');
  link.href = buildDestinationLink({
    origin: view.origin,
    destination: offer.code,
    tripType: view.tripType,
    tripDuration: view.tripDuration,
  }, view.locale, view.destinationPage);

  const imageWrap = el('div', 'destination-finder-tile-image');
  const src = destinationImageUrl(offer.code, 720);
  if (src) {
    // created at runtime only: the 590 destination images are never authored
    const img = el('img');
    img.src = src;
    img.srcset = `${destinationImageUrl(offer.code, 360)} 360w, ${src} 720w`;
    img.sizes = '(width >= 1025px) 25vw, (width >= 768px) 33vw, 50vw';
    img.alt = '';
    img.loading = 'lazy';
    img.decoding = 'async';
    attachDamFallback(img, () => img.remove());
    imageWrap.append(img);
  }
  if (highlighted) imageWrap.append(el('span', 'destination-finder-tile-badge', view.labels['recommended label']));

  const body = el('div', 'destination-finder-tile-body');
  body.append(el('h3', 'destination-finder-tile-city', offer.name || offer.code));
  if (offer.country) body.append(el('p', 'destination-finder-tile-country', offer.country));
  const price = formatFare(offer.price, offer, view.locale, view.localeData);
  if (price) {
    const offerEl = el('p', 'destination-finder-tile-offer');
    const label = view.tripType === 'ONEWAY' ? view.labels['one way price label'] : view.labels['price label'];
    const priceEl = el('span', 'destination-finder-tile-price', price);
    if (view.hasDisclaimer) priceEl.append('*');
    offerEl.append(el('span', 'destination-finder-tile-price-label', label), priceEl);
    body.append(offerEl);
  }
  link.append(imageWrap, body);
  li.append(link);
  return li;
}

/** Filter group: a section with a heading, or a fieldset whose legend is the heading. */
function filterGroup(title, { fieldset = false } = {}) {
  const group = el(fieldset ? 'fieldset' : 'section', 'destination-finder-filter');
  group.append(el(fieldset ? 'legend' : 'h3', 'destination-finder-filter-heading', title));
  return group;
}

/** Info toggle next to a filter heading (the live tooltip): reveals the text below. */
function addInfo(group, text, label, id) {
  if (!text) return;
  const heading = group.querySelector('.destination-finder-filter-heading');
  const button = el('button', 'destination-finder-info-toggle');
  button.type = 'button';
  button.setAttribute('aria-label', label);
  button.setAttribute('aria-expanded', 'false');
  button.setAttribute('aria-controls', id);
  const info = el('p', 'destination-finder-info', text);
  info.id = id;
  info.hidden = true;
  button.addEventListener('click', () => {
    info.hidden = !info.hidden;
    button.setAttribute('aria-expanded', String(!info.hidden));
  });
  if (!heading) {
    group.append(button, info);
    return;
  }
  heading.append(button);
  heading.parentNode.insertBefore(info, heading.nextSibling);
}

function choice(type, name, value, text, checked = false) {
  const label = el('label', `destination-finder-${type === 'radio' ? 'radio' : 'check'}`);
  const input = el('input');
  input.type = type;
  input.name = name;
  input.value = value;
  input.checked = checked;
  label.append(input, el('span', '', text));
  return { label, input };
}

function selectField(id, text, options, value) {
  const field = el('div', 'destination-finder-field');
  const label = el('label', '', text);
  label.htmlFor = id;
  const select = el('select');
  select.id = id;
  options.forEach(([optionValue, optionText]) => {
    const option = el('option', '', optionText);
    option.value = String(optionValue);
    select.append(option);
  });
  select.value = String(value);
  field.append(label, select);
  return { field, select };
}

async function decorateGrid(block, uid) {
  // the tiles' images need scripts/dam-path.js (lh-api damPathReady): loading while the rest runs
  const damReady = damPathReady();
  const locale = getLocale();
  const config = readConfigRows(block);
  const settings = readGridSettings(config, locale);
  if (!settings.origin.code) {
    // no authored origin: the market default airport, else the home airport (as flight search)
    const { code, name } = await resolveOrigin(null, locale);
    settings.origin = { code, name };
  }
  await damReady;
  const cell = (...keys) => (pick(config, ...keys) || {}).cell;
  const disclaimer = moveCell(cell('disclaimer'), 'destination-finder-disclaimer');
  const conditions = moveCell(cell('conditions', 'conditions-label'), 'destination-finder-conditions');
  if (conditions) decorateConditions(conditions);

  const initial = {
    cabin: 'E', months: [0, 11], tripType: 'RETURN',
  };
  const state = {
    origin: { ...settings.origin },
    ...initial,
    months: [...initial.months],
    sort: GRID_SORTS[0],
    destinations: [],
    maxPrice: null,
    nonstop: false,
    tenantOnly: false,
    activities: [],
  };
  // every request starts now; the filters are built once the labels are there
  const contextPromise = loadFinderContext(locale);
  const gridContextPromise = loadGridContext(locale);
  const cityOf = (origins, origin) => {
    const city = findOrigin(origins, origin.code);
    return city ? { code: city.code, name: origin.name || city.name } : origin;
  };
  const query = () => ({
    origin: state.origin.code, cabin: state.cabin, months: state.months, tripType: state.tripType,
  });
  // the default origin keeps its airport code, as live asks for it (gb/en: finder/LHR/E,
  // recorded from the live page); only its name comes from the origin city (London)
  const firstOffers = contextPromise.then((context) => {
    const city = cityOf(context.origins, state.origin);
    state.origin = { code: state.origin.code, name: state.origin.name || city.name || '' };
    return { query: query(), result: loadGridOffers(query(), locale) };
  });

  block.replaceChildren();
  block.setAttribute('aria-busy', 'true');
  const [context, gridContext] = await Promise.all([contextPromise, gridContextPromise]);
  const labels = resolveLabels({
    [locale.lang]: {
      ...(GRID_DEFAULT_LABELS[locale.lang] || GRID_DEFAULT_LABELS.en), ...gridContext.labels,
    },
  }, config, locale.lang);
  // a brand page: the airline filter names the brand ("Lufthansa only" on lh-com)
  const brand = brandEntry();
  if (brand && labels['tenant only label']) {
    labels['tenant only label'] = labels['tenant only label'].replace('Lufthansa', brand.name);
  }
  const hasDisclaimer = Boolean(disclaimer || context.conditions.footerText);
  // the live grid groups thousands by page language ("1,902 €" on de/en), not by the
  // market's catalogs/localeData (a space for de/en)
  const group = new Intl.NumberFormat(locale.lang).formatToParts(1000)
    .find((part) => part.type === 'group');
  const fareFormat = { ...context.localeData, group: group ? group.value : undefined };

  const status = el('p', 'destination-finder-sr-only');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  let announceTimer;
  const announce = (text) => {
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => { status.textContent = text; }, 300);
  };

  /* filter column */
  const filters = el('div', 'destination-finder-filters');
  const filtersHeading = el('h2', 'destination-finder-filters-heading', labels['filter heading']);
  filtersHeading.id = `${uid}-filters-heading`;
  filtersHeading.tabIndex = -1;
  const filtersInfo = el('p', 'destination-finder-sr-only', labels['filter info']);
  filtersInfo.id = `${uid}-filters-info`;
  filters.setAttribute('role', 'group');
  filters.setAttribute('aria-labelledby', filtersHeading.id);
  filters.setAttribute('aria-describedby', filtersInfo.id);
  filters.append(filtersHeading, filtersInfo);

  // where to fly: origin (reloads) and destinations (client-side, as removable tags)
  const where = filterGroup(labels['where to fly label']);
  const originBox = createAirportCombobox({
    label: labels['origin input label'],
    name: 'originCode',
    value: state.origin,
    noResultsLabel: labels['no results label'],
    fetchSuggestions: async (term) => {
      if (!context.origins.length) return searchAirports(term, locale);
      return filterAirports(context.origins.map((o) => ({ ...o, label: `${o.name} (${o.code})` })), term);
    },
    // eslint-disable-next-line no-use-before-define
    onChange: (airport) => changeOrigin(airport),
  });
  originBox.element.classList.add('destination-finder-field');

  let destinationOptions = [];
  const tags = el('ul', 'destination-finder-tags');
  tags.setAttribute('aria-label', labels['selected destinations label']);
  tags.hidden = true;
  const destinationBox = createAirportCombobox({
    label: labels['destination label'],
    name: 'selectedDestinationFilterOptions',
    noResultsLabel: labels['destination no results label'],
    fetchSuggestions: async (term) => matchDestinationOptions(destinationOptions
      .filter((o) => !state.destinations.some((d) => d.kind === o.kind && d.code === o.code)), term)
      .map((o) => ({
        code: `${o.kind}:${o.code}`,
        name: o.name,
        label: o.detail ? `${o.name}, ${o.detail}` : o.name,
        option: o,
      })),
    // eslint-disable-next-line no-use-before-define
    onChange: (value) => addDestination(value),
  });
  destinationBox.element.classList.add('destination-finder-field');
  const hint = el('p', 'destination-finder-hint', labels['destination hint']);
  hint.id = `${uid}-destination-hint`;
  destinationBox.input.setAttribute('aria-describedby', hint.id);
  destinationBox.element.append(hint);
  where.append(originBox.element, destinationBox.element, tags);

  // mobile: the other filters collapse behind a "Filters" button
  const toggle = el('button', 'destination-finder-filters-toggle', labels['filters button label']);
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', `${uid}-filters-panel`);
  const panel = el('div', 'destination-finder-filters-panel');
  panel.id = `${uid}-filters-panel`;
  toggle.addEventListener('click', () => {
    const open = !panel.classList.contains('is-open');
    panel.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  // budget
  const budget = filterGroup(labels['budget label']);
  const budgetValue = el('p', 'destination-finder-range-value');
  budgetValue.setAttribute('aria-hidden', 'true');
  const range = el('input', 'destination-finder-range');
  range.type = 'range';
  range.step = '1';
  range.setAttribute('aria-label', labels['budget slider label']);
  budget.append(budgetValue, range);

  // months
  const months = travelMonths(locale).map(({ offset, label }) => [offset, label]);
  const monthGroup = filterGroup(labels['month label']);
  const monthRow = el('div', 'destination-finder-months');
  const monthFrom = selectField(`${uid}-month-from`, labels['month from label'], months, state.months[0]);
  const monthTo = selectField(`${uid}-month-to`, labels['month to label'], months, state.months[1]);
  monthRow.append(monthFrom.field, monthTo.field);
  monthGroup.append(monthRow);

  // stops
  const stops = filterGroup(labels['stops label']);
  const nonstop = choice('checkbox', 'nonstop', 'nonstop', labels['nonstop label']);
  stops.append(nonstop.label);
  addInfo(stops, labels['stops info'], labels['info label'], `${uid}-stops-info`);

  // travel class (reloads)
  const cabinGroup = filterGroup(labels['travel classes label']);
  const cabin = selectField(`${uid}-cabin`, labels['travel class label'], [
    ['E', labels['economy label']], ['N', labels['premium economy label']],
    ['B', labels['business label']], ['F', labels['first label']],
  ], state.cabin);
  cabinGroup.append(cabin.field);

  // airline
  const airline = filterGroup(labels['airline label'], { fieldset: true });
  const allPartners = choice('radio', `${uid}-airline`, 'all-partners', labels['all partners label'], true);
  const tenantOnly = choice('radio', `${uid}-airline`, 'one-only', labels['tenant only label']);
  airline.append(allPartners.label, tenantOnly.label);
  addInfo(airline, labels['stops info'], labels['info label'], `${uid}-airline-info`);

  // trip type (reloads)
  const trip = filterGroup(labels['trip type label'], { fieldset: true });
  const roundTrip = choice('radio', `${uid}-trip-type`, 'RETURN', labels['round trip label'], true);
  const oneWay = choice('radio', `${uid}-trip-type`, 'ONEWAY', labels['one way label']);
  trip.append(roundTrip.label, oneWay.label);

  // activities: the first three, the rest behind a toggle
  const activities = filterGroup(labels['activities label'], { fieldset: true });
  const activityInputs = gridContext.affinities
    .map((a) => choice('checkbox', `activity.${a.code}`, a.code, a.name));
  if (activityInputs.length) {
    activities.append(...activityInputs.slice(0, VISIBLE_ACTIVITIES).map((a) => a.label));
    const rest = activityInputs.slice(VISIBLE_ACTIVITIES);
    if (rest.length) {
      const more = el('div', 'destination-finder-more-activities');
      more.id = `${uid}-activities-more`;
      more.hidden = true;
      more.append(...rest.map((a) => a.label));
      const moreToggle = el('button', 'destination-finder-activities-toggle', labels['more activities label']);
      moreToggle.type = 'button';
      moreToggle.setAttribute('aria-expanded', 'false');
      moreToggle.setAttribute('aria-controls', more.id);
      moreToggle.addEventListener('click', () => {
        more.hidden = !more.hidden;
        moreToggle.setAttribute('aria-expanded', String(!more.hidden));
        moreToggle.textContent = labels[more.hidden ? 'more activities label' : 'fewer activities label'];
      });
      activities.append(more, moreToggle);
    }
  } else {
    activities.append(el('p', 'destination-finder-hint', labels['no activities label']));
  }

  const reset = el('button', 'destination-finder-reset', labels['reset label']);
  reset.type = 'button';
  reset.hidden = true;

  panel.append(budget, monthGroup, stops, cabinGroup, airline, trip, activities, reset);
  filters.append(where, toggle, panel);

  /* results column */
  const results = el('div', 'destination-finder-results');
  const resultsHeading = el('h2', 'destination-finder-sr-only', labels['results heading']);
  resultsHeading.id = `${uid}-results-heading`;
  const toolbar = el('div', 'destination-finder-toolbar');
  const sort = selectField(`${uid}-sort`, labels['sort label'], [
    ['topDeal', labels['sort recommended label']], ['price', labels['sort price label']],
    ['alphabet', labels['sort alphabet label']],
  ], state.sort);
  sort.field.classList.add('destination-finder-sort');
  toolbar.append(sort.field);
  if (settings.smartSearch) {
    const smart = el('a', 'button secondary destination-finder-smart-search');
    smart.href = settings.smartSearch.href;
    smart.innerHTML = SPARKLE_ICON;
    smart.append(el('span', '', settings.smartSearch.text || labels['smart search label']));
    toolbar.append(smart);
  }
  const message = el('div', 'destination-finder-message');
  message.hidden = true;
  const grid = el('ol', 'destination-finder-grid');
  grid.setAttribute('aria-labelledby', resultsHeading.id);
  const moreWrap = el('div', 'destination-finder-more');
  const moreButton = el('button', 'button secondary destination-finder-more-button', labels['show more label']);
  moreButton.type = 'button';
  moreWrap.append(moreButton);
  moreWrap.hidden = true;

  const footer = el('div', 'destination-finder-footer');
  const notes = el('div', 'destination-finder-notes');
  if (disclaimer) notes.append(disclaimer);
  if (conditions) notes.append(conditions);
  if (notes.children.length) footer.append(notes);
  fillNotes(footer, notes, context.conditions);
  decorateExternalLinks(footer);

  results.append(resultsHeading, toolbar, message, grid, moreWrap, status, footer);
  const layout = el('div', 'destination-finder-layout');
  layout.append(filters, results);
  block.replaceChildren(layout);
  block.removeAttribute('aria-busy');

  /* rendering */
  let loaded = {
    origin: state.origin.code, tripType: state.tripType, offers: [], source: 'none',
  };
  let sorted = [];
  let highlighted = new Set();
  let shown = 0;

  const view = () => ({
    origin: loaded.origin,
    tripType: loaded.tripType,
    tripDuration: settings.tripDuration,
    destinationPage: settings.destinationPage,
    labels,
    locale,
    localeData: fareFormat,
    hasDisclaimer,
  });

  const showMessage = (heading, text) => {
    message.replaceChildren(el('h3', 'destination-finder-message-heading', heading), el('p', '', text));
    message.hidden = false;
  };

  const showMore = (count = GRID_PAGE_SIZE) => {
    const next = sorted.slice(shown, shown + count);
    const current = view();
    grid.append(...next.map((o) => renderTile(o, highlighted.has(o), current)));
    shown += next.length;
    moreWrap.hidden = shown >= sorted.length;
    return next.length;
  };

  const isFiltered = () => state.destinations.length > 0 || Number.isFinite(state.maxPrice)
    || state.nonstop || state.tenantOnly || state.activities.length > 0
    || state.cabin !== initial.cabin || state.tripType !== initial.tripType
    || state.months[0] !== initial.months[0] || state.months[1] !== initial.months[1];

  function render() {
    const filtered = filterGridOffers(loaded.offers, state);
    const picked = highlightedOffers(filtered, settings.maxHighlighted, settings.priority);
    highlighted = new Set(picked);
    sorted = sortGridOffers(filtered, state.sort, picked, locale.lang);
    grid.replaceChildren();
    shown = 0;
    showMore();
    message.hidden = true;
    if (!loaded.offers.length) {
      showMessage(labels['no results for origin heading'], labels['no results for origin']);
    } else if (!filtered.length) {
      showMessage(labels['no results for filters heading'], labels['no results for filters']);
    }
    block.classList.toggle('destination-finder-empty', !sorted.length);
    reset.hidden = !isFiltered();
    announce(fillLabel(labels['results count label'], { NUMBER: sorted.length }));
  }

  function updateBudget() {
    const prices = loaded.offers.map((o) => Math.ceil(o.price - 1e-9));
    const currency = loaded.offers[0] || {};
    budget.hidden = !prices.length;
    if (!prices.length) return;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    range.min = String(min);
    range.max = String(max);
    const value = Number.isFinite(state.maxPrice)
      ? Math.min(Math.max(state.maxPrice, min), max) : max;
    state.maxPrice = value < max ? value : null;
    range.value = String(value);
    const fare = formatFare(value, currency, locale, fareFormat);
    budgetValue.textContent = fillLabel(labels['budget value label'], { VALUE: fare });
    range.setAttribute('aria-valuetext', fare);
  }

  function apply(result, forQuery) {
    loaded = {
      origin: forQuery.origin,
      tripType: forQuery.tripType,
      offers: result.offers,
      source: result.source,
    };
    if (result.originName && !state.origin.name && state.origin.code === forQuery.origin) {
      state.origin.name = result.originName;
      originBox.setValue(state.origin, { silent: true });
    }
    markSource(block, {
      offers: result.source, ...context.sources, ...gridContext.sources,
    }, ['offers']);
    destinationOptions = destinationFilterOptions(loaded.offers, gridContext.regions);
    updateBudget();
    grid.removeAttribute('aria-busy');
    render();
  }

  let requestId = 0;
  async function reload() {
    requestId += 1;
    const mine = requestId;
    grid.setAttribute('aria-busy', 'true');
    const forQuery = query();
    const result = await loadGridOffers(forQuery, locale);
    if (mine === requestId) apply(result, forQuery);
  }

  /* events */
  function changeOrigin(airport) {
    if (!airport) {
      originBox.setValue(state.origin, { silent: true });
      return;
    }
    const origin = cityOf(context.origins, { code: airport.code, name: airport.name || '' });
    if (origin.code === state.origin.code) return;
    state.origin = origin;
    originBox.setValue(origin, { silent: true });
    reload();
  }

  function renderTags() {
    tags.replaceChildren(...state.destinations.map((d) => {
      const li = el('li', 'destination-finder-tag');
      const remove = el('button', 'destination-finder-tag-remove');
      remove.type = 'button';
      remove.setAttribute('aria-label', `${labels['remove label']}: ${d.name}`);
      remove.addEventListener('click', () => {
        state.destinations = state.destinations.filter((x) => x !== d);
        renderTags();
        render();
        announce(fillLabel(labels['destination removed label'], { OPTION: d.name }));
        destinationBox.focus();
      });
      li.append(el('span', '', d.name), remove);
      return li;
    }));
    tags.hidden = !state.destinations.length;
  }

  function addDestination(value) {
    if (!value) return;
    let { option } = value;
    // a typed city code (the combobox keeps three letters on blur)
    if (!option && /^[A-Z]{3}$/.test(value.code || '')) {
      option = destinationOptions.find((o) => o.kind === 'city' && o.code === value.code);
    }
    destinationBox.setValue(null, { silent: true });
    const selected = (o) => state.destinations.some((d) => d.kind === o.kind && d.code === o.code);
    if (!option || selected(option)) return;
    state.destinations = [...state.destinations, option];
    renderTags();
    render();
    announce(fillLabel(labels['destination added label'], { OPTION: option.name }));
  }

  range.addEventListener('input', () => {
    state.maxPrice = Number(range.value);
    updateBudget();
    render();
  });

  const onMonth = (changed) => {
    let from = Number(monthFrom.select.value);
    let to = Number(monthTo.select.value);
    if (from > to) {
      if (changed === 'from') to = from;
      else from = to;
    }
    monthFrom.select.value = String(from);
    monthTo.select.value = String(to);
    if (from === state.months[0] && to === state.months[1]) return;
    state.months = [from, to];
    reload();
  };
  monthFrom.select.addEventListener('change', () => onMonth('from'));
  monthTo.select.addEventListener('change', () => onMonth('to'));

  nonstop.input.addEventListener('change', () => {
    state.nonstop = nonstop.input.checked;
    render();
  });
  cabin.select.addEventListener('change', () => {
    state.cabin = cabin.select.value;
    reload();
  });
  airline.addEventListener('change', () => {
    state.tenantOnly = tenantOnly.input.checked;
    render();
  });
  trip.addEventListener('change', () => {
    state.tripType = oneWay.input.checked ? 'ONEWAY' : 'RETURN';
    reload();
  });
  activities.addEventListener('change', () => {
    state.activities = activityInputs.filter((a) => a.input.checked).map((a) => a.input.value);
    render();
  });
  sort.select.addEventListener('change', () => {
    state.sort = GRID_SORTS.includes(sort.select.value) ? sort.select.value : GRID_SORTS[0];
    render();
    announce(fillLabel(labels['sorted label'], {
      OPTION: sort.select.options[sort.select.selectedIndex].textContent,
    }));
  });

  reset.addEventListener('click', () => {
    const needsReload = state.cabin !== initial.cabin || state.tripType !== initial.tripType
      || state.months[0] !== initial.months[0] || state.months[1] !== initial.months[1];
    Object.assign(state, {
      ...initial,
      months: [...initial.months],
      destinations: [],
      maxPrice: null,
      nonstop: false,
      tenantOnly: false,
      activities: [],
    });
    nonstop.input.checked = false;
    allPartners.input.checked = true;
    roundTrip.input.checked = true;
    activityInputs.forEach((a) => { a.input.checked = false; });
    cabin.select.value = state.cabin;
    monthFrom.select.value = String(state.months[0]);
    monthTo.select.value = String(state.months[1]);
    renderTags();
    if (needsReload) {
      reload();
    } else {
      updateBudget();
      render();
    }
    announce(labels['reset done label']);
    filtersHeading.focus();
  });

  moreButton.addEventListener('click', () => {
    const added = showMore();
    announce(shown >= sorted.length ? labels['all loaded label']
      : fillLabel(labels['more loaded label'], { NUMBER: added }));
  });
  if ('IntersectionObserver' in window) {
    // like the live grid: more tiles when the end of the list comes near
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting) && !moreWrap.hidden) showMore();
    }, { rootMargin: '600px 0px' });
    observer.observe(moreWrap);
  }

  /* first load */
  grid.setAttribute('aria-busy', 'true');
  requestId += 1;
  const mine = requestId;
  const first = await firstOffers;
  const result = await first.result;
  if (mine === requestId) apply(result, first.query);
}

export default async function decorate(block) {
  instanceCount += 1;
  const uid = `destination-finder-${instanceCount}`;
  if (block.classList.contains('grid')) {
    decorateGrid(block, uid);
    return;
  }
  const locale = getLocale();
  const config = readConfigRows(block);
  const labels = resolveLabels(DEFAULT_LABELS, config, locale.lang);
  const text = (...keys) => (pick(config, ...keys) || {}).text || '';
  const cell = (...keys) => (pick(config, ...keys) || {}).cell;

  const settings = readDestinationFinderSettings(config, locale);
  if (!settings.origin.code) {
    // no authored origin: the market default airport, else the home airport (as flight search)
    const { code, name } = await resolveOrigin(null, locale);
    settings.origin = { code, name };
  }
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
    fillNotes(footer, notes, context.conditions, labels['conditions label']);
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
    markSource(block, { offers: source, ...context.sources }, ['offers']);
    const hasDisclaimer = Boolean(disclaimer || context.conditions.footerText);
    const items = destinations.slice(0, MAX_DESTINATIONS)
      .map((d) => renderDestination(d, state, labels, locale, {
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
