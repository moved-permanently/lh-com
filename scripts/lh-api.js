/**
 * Data contract of the lufthansa.com service API used by the widgets, taken from the requests
 * the live pages make themselves (tools/source-export/api/*.ndjson). Request builders produce
 * exactly the live request (path, query, POST body) so recorded answers match; mappers turn
 * the live response shapes into plain view data. Blocks fetch through lhFetch (scripts/lh-data.js).
 */
import { LIVE_ORIGIN } from './locale.js';
import { lhFetch, lhRecorded } from './lh-data.js';

/* ------------------------------------------------------------------------------------------- */
/* Requests                                                                                    */
/* ------------------------------------------------------------------------------------------- */

/** All twelve months, the fare teaser default when the component sets none. */
export const ALL_TRAVEL_MONTHS = '1,2,3,4,5,6,7,8,9,10,11,12';

/**
 * Trip type code of the fare services: 'R' round trip (recorded), 'O' one way (assumed, no
 * one-way request recorded yet).
 * @param {string} tripType 'RETURN' or 'ONEWAY' (block values) or an API code
 * @returns {'R'|'O'}
 */
export function apiTripType(tripType) {
  return ['ONEWAY', 'O'].includes(String(tripType || '').toUpperCase()) ? 'O' : 'R';
}

/**
 * Airport autocomplete, e.g.
 * GET /service/api/suggestions/airports
 *   ?rep=airportsReq&start=0&rd=y&site=DE&lang=de&portal=LH&query=Frankfurt
 */
export function airportSuggestionsRequest(term, locale) {
  const params = new URLSearchParams({
    rep: 'airportsReq',
    start: '0',
    rd: 'y',
    site: locale.country.toUpperCase(),
    lang: locale.lang,
    portal: 'LH',
    query: term,
  });
  return { method: 'GET', route: `/service/api/suggestions/airports?${params}` };
}

/**
 * Catalog (no parameters: the live site localizes by market),
 * e.g. GET /service/api/catalogs/conditions
 * @param {'airportnames'|'airlines'|'calendar'|'localeData'|'conditions'|'countryselector'} name
 */
export function catalogRequest(name) {
  return { method: 'GET', route: `/service/api/catalogs/${name}` };
}

/** UI labels of a component, e.g. GET /service/api/labels/flightmanager/lh/de */
export function labelsRequest(bundle, locale) {
  return { method: 'GET', route: `/service/api/labels/${bundle}/lh/${locale.lang}` };
}

/** Default origin of the market (by geo on the live site): GET /service/api/defaultAirport */
export function defaultAirportRequest() {
  return { method: 'GET', route: '/service/api/defaultAirport' };
}

/** Origin cities of the market for the fare widgets: GET .../fareteaser/recommend */
export function fareTeaserRecommendRequest() {
  return { method: 'GET', route: '/service/api/lhg-fare-teaser/fareteaser/recommend' };
}

/**
 * Lowest fares for authored routes:
 * POST /service/api/lhg-fare-teaser/fareteaser/manual
 * {"fareTeaserManualTravels":[{"destination":"CHI","origin":"FRA"}],"cabin":"E","tripType":"R",
 *  "tripDuration":7,"travelMonths":"1,2,3,10,11,12"}
 */
export function fareTeaserManualRequest({
  travels, cabin = 'E', tripType = 'R', tripDuration = 7, travelMonths = ALL_TRAVEL_MONTHS,
}) {
  return {
    method: 'POST',
    route: '/service/api/lhg-fare-teaser/fareteaser/manual',
    body: {
      fareTeaserManualTravels: travels.map(({ destination, origin }) => ({ destination, origin })),
      cabin,
      tripType: apiTripType(tripType),
      tripDuration: Number(tripDuration),
      travelMonths,
    },
  };
}

/** Local time as the live widget sends it: 2026-10-21T21:06:26 (no zone). */
function localTimestamp(date) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/**
 * Destinations the service recommends from an origin (destination finder):
 * POST /service/api/lhg-fare-teaser/fareteaser/offers/FRA
 * {"touchPointId":"200","decisionTypeId":"50","timestamp":"2026-10-21T21:05:44","timezone":120,
 *  "tripType":"R","airlineDestWhitelist":false}
 * timestamp and timezone (minutes east of UTC) are the client's; lhFetch ignores both when
 * matching recordings.
 */
export function fareTeaserOffersRequest({
  origin, tripType = 'R', airlineDestWhitelist = false,
}, now = new Date()) {
  return {
    method: 'POST',
    route: `/service/api/lhg-fare-teaser/fareteaser/offers/${encodeURIComponent(origin)}`,
    body: {
      touchPointId: '200',
      decisionTypeId: '50',
      timestamp: localTimestamp(now),
      timezone: -now.getTimezoneOffset(),
      tripType: apiTripType(tripType),
      airlineDestWhitelist: Boolean(airlineDestWhitelist),
    },
  };
}

/**
 * Fetches a request built above.
 * @param {{method: string, route: string, body?: Object}} request
 * @param {Object} locale result of getLocale()
 * @param {Object} [options] extra lhFetch options (exact)
 */
export function fetchRequest(request, locale, options = {}) {
  return lhFetch(request.route, {
    method: request.method, body: request.body, market: locale.key, ...options,
  });
}

/* ------------------------------------------------------------------------------------------- */
/* Responses                                                                                   */
/* ------------------------------------------------------------------------------------------- */

const isCode = (value) => typeof value === 'string' && /^[A-Z]{3}$/.test(value.toUpperCase());

/**
 * {"items":[{"airport":"Frankfurt, Alle Flughäfen","code":"FRA","country":"Deutschland",
 *  "type":"CITY","items":[{"airport":"Frankfurt/Main International","code":"FRA",...,
 *  "distance":{"value":8,"unit":"km"}?}]}]}
 * → [{ code, name, country, type, label }], cities/airports before their sub-entries, one entry
 * per code.
 */
export function mapAirportSuggestions(data) {
  const list = [];
  const add = (item) => {
    if (!item || !isCode(item.code)) return;
    const code = item.code.toUpperCase();
    if (list.some((a) => a.code === code)) return;
    const name = item.airport || item.name || '';
    list.push({
      code,
      name,
      country: item.country || '',
      type: item.type || '',
      label: [name ? `${name} (${code})` : code, item.country].filter(Boolean).join(', '),
    });
  };
  ((data && data.items) || []).forEach((item) => {
    add(item);
    (item.items || []).forEach(add);
  });
  return list;
}

/** {"airports":[{"code":"FRA","airport":"Frankfurt/Main International"}]} → [{ code, name }] */
export function mapAirportNames(data) {
  return ((data && data.airports) || [])
    .filter((a) => isCode(a.code))
    .map((a) => ({ code: a.code.toUpperCase(), name: a.airport || a.name || '' }));
}

/**
 * {"globalDefaultAirport":{"iataCode":"FRA","name":"Frankfurt"},"marketDefaultAirport":{...}}
 * → { code, name } of the market (else global) default, or null
 */
export function mapDefaultAirport(data) {
  const hit = [data && data.marketDefaultAirport, data && data.globalDefaultAirport]
    .find((a) => a && isCode(a.iataCode));
  return hit ? { code: hit.iataCode.toUpperCase(), name: hit.name || '' } : null;
}

/**
 * {"fareTeaserRecommends":[{"airportCodes":["FRA","ZRB"],"cityName":"Frankfurt",
 *  "cityNameUrl":"frankfurt","origin":"FRA"}]} → [{ code, name, slug, airportCodes }]
 */
export function mapRecommendedOrigins(data) {
  return ((data && data.fareTeaserRecommends) || [])
    .filter((o) => isCode(o.origin))
    .map((o) => ({
      code: o.origin.toUpperCase(),
      name: o.cityName || '',
      slug: o.cityNameUrl || '',
      airportCodes: Array.isArray(o.airportCodes) ? o.airportCodes : [],
    }));
}

/** The recommended origin city for a city or airport code (LHR → London/LON). */
export function findOrigin(origins, code) {
  return origins.find((o) => o.code === code)
    || origins.find((o) => o.airportCodes.includes(code)) || null;
}

/**
 * {"fareTeaserManualOffers":[{"currency":"EUR","currencySymbol":"€","currencySymbolPrefixed":false,
 *  "destination":"CHI","destinationCityName":"Chicago","destinationCityNameUrl":"chicago",
 *  "origin":"FRA","originCityName":"Frankfurt","originCityNameUrl":"frankfurt","price":716.06}]}
 * → [{ origin, originName, destination, destinationName, price, currency, symbol, prefixed }]
 */
export function mapManualOffers(data) {
  return ((data && data.fareTeaserManualOffers) || [])
    .filter((o) => isCode(o.destination) && isCode(o.origin))
    .map((o) => ({
      origin: o.origin.toUpperCase(),
      originName: o.originCityName || '',
      destination: o.destination.toUpperCase(),
      destinationName: o.destinationCityName || '',
      price: Number(o.price),
      currency: o.currency || '',
      symbol: o.currencySymbol || '',
      prefixed: typeof o.currencySymbolPrefixed === 'boolean' ? o.currencySymbolPrefixed : undefined,
    }))
    .filter((o) => Number.isFinite(o.price) && o.price > 0);
}

/**
 * {"currency":"EUR","currencySymbol":"€","currencySymbolPrefixed":false,"decisionId":"...",
 *  "fareTeaserOffers":[{"city":"SIN","cityName":"Singapur","cityNameUrl":"singapur",
 *  "price":829.0,"topDeal":false}]}
 * → [{ code, name, price, topDeal, currency, symbol, prefixed }] in the service's order
 */
export function mapOffers(data) {
  if (!data || !Array.isArray(data.fareTeaserOffers)) return [];
  const currency = {
    currency: data.currency || '',
    symbol: data.currencySymbol || '',
    prefixed: typeof data.currencySymbolPrefixed === 'boolean' ? data.currencySymbolPrefixed : undefined,
  };
  return data.fareTeaserOffers
    .filter((o) => isCode(o.city))
    .map((o) => ({
      code: o.city.toUpperCase(),
      name: o.cityName || '',
      price: Number(o.price),
      topDeal: Boolean(o.topDeal),
      ...currency,
    }));
}

/**
 * {"conditions":"<p>...</p>","conditionsHeadline":"Allgemeine Bedingungen",
 *  "footerText":"*Die Preise..."}
 * → { headline, html, footerText }
 */
export function mapConditions(data) {
  return {
    headline: (data && data.conditionsHeadline) || '',
    html: (data && data.conditions) || '',
    footerText: (data && data.footerText) || '',
  };
}

/**
 * catalogs/localeData → { group, prefixed, currencies } (number grouping symbol, whether the
 * market writes the currency first, currency symbols by ISO code)
 */
export function mapLocaleData(data) {
  const number = (data && data.number) || {};
  const symbols = (number.symbols && number.symbols.numberingSystem) || {};
  const pattern = number.patterns && number.patterns.currency
    && number.patterns.currency.currencypatternsDefault
    && number.patterns.currency.currencypatternsDefault.positivePattern;
  return {
    group: typeof symbols.group === 'string' ? symbols.group : undefined,
    decimal: typeof symbols.decimal === 'string' ? symbols.decimal : undefined,
    prefixed: typeof pattern === 'string' ? pattern.trim().startsWith('{currency}') : undefined,
    currencies: number.currencies || {},
  };
}

/**
 * Fare as the live widgets show it, the response's currency symbol before or after. Fare teasers
 * and the destination finder round up to whole units ("717 €", "€ 612"); the sticky price bar
 * (maui-price-display) keeps the cents ("141.26 €"): pass { decimals: true }.
 * Group and decimal separators come from the market's locale data when it is loaded.
 * @param {number} amount
 * @param {{currency?: string, symbol?: string, prefixed?: boolean}} currency from the response
 * @param {Object} locale result of getLocale()
 * @param {Object} [localeData] result of mapLocaleData
 * @param {{decimals?: boolean}} [options] decimals: two decimals (whole amounts stay whole)
 * @returns {string} '' without a valid amount
 */
export function formatFare(amount, currency = {}, locale = {}, localeData = {}, options = {}) {
  const value = Number(amount);
  if (amount === null || amount === undefined || amount === '' || !Number.isFinite(value) || value <= 0) return '';
  const cents = Math.round(value * 100) / 100;
  const digits = options.decimals && !Number.isInteger(cents) ? 2 : 0;
  const rounded = digits ? cents : Math.ceil(value - 1e-9);
  const tag = locale.lang && locale.country ? `${locale.lang}-${locale.country.toUpperCase()}` : undefined;
  const number = new Intl.NumberFormat(tag, {
    minimumFractionDigits: digits, maximumFractionDigits: digits,
  }).formatToParts(rounded).map(({ type, value: part }) => {
    if (type === 'group' && localeData.group !== undefined) return localeData.group;
    if (type === 'decimal' && localeData.decimal !== undefined) return localeData.decimal;
    return part;
  }).join('');
  const code = currency.currency || locale.currency || '';
  const symbol = currency.symbol || (localeData.currencies || {})[code] || code;
  let prefixed = currency.prefixed ?? localeData.prefixed;
  if (prefixed === undefined) prefixed = locale.lang === 'en';
  if (!symbol) return number;
  // non-breaking space: price and currency never wrap apart
  return prefixed ? `${symbol}\u00a0${number}` : `${number}\u00a0${symbol}`;
}

/**
 * Paragraphs of an HTML text from the API (catalogs/conditions), as plain-text <p> elements:
 * parsed in an inert document, nothing but the text is kept. Browser only.
 * @param {string} html
 * @returns {HTMLParagraphElement[]}
 */
export function htmlToParagraphs(html) {
  if (!html) return [];
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const blocks = [...doc.body.querySelectorAll('p, li')];
  const texts = (blocks.length ? blocks : [doc.body])
    .map((n) => n.textContent.trim()).filter(Boolean);
  return texts.map((text) => {
    const p = document.createElement('p');
    p.textContent = text;
    return p;
  });
}

/** Square destination image of the live fare widgets (720 or 180 px wide). */
export function destinationImageUrl(code, width = 720) {
  if (!isCode(code)) return '';
  return `${LIVE_ORIGIN}/content/dam/lh/images/offers/destination/${code.toLowerCase()}-square.jpg.transform/lh-dcep-transform-width-${width}/img.jpg`;
}

/**
 * Replaces {NAME} placeholders of a live label ("Von {ORIGIN} nach {DESTINATION}").
 * Placeholders without a value are removed.
 */
export function fillLabel(text, values = {}) {
  return String(text || '')
    .replace(/\{([A-Z_]+)\}/g, (m, name) => (values[name] !== undefined ? String(values[name]) : ''))
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/**
 * Labels of several bundles merged into one flat map (key → text); bundles that fail to load
 * are left out.
 * @param {string[]} bundles e.g. ['flightmanager']
 * @param {Object} locale result of getLocale()
 * @returns {Promise<{labels: Object<string, string>, sources: Object<string, string>}>}
 */
export async function fetchLabels(bundles, locale) {
  const results = await Promise.allSettled(bundles
    .map((bundle) => fetchRequest(labelsRequest(bundle, locale), locale, { exact: true })));
  const labels = {};
  const sources = {};
  results.forEach((r, i) => {
    sources[bundles[i]] = r.status === 'fulfilled' ? r.value.source : 'none';
    if (r.status !== 'fulfilled' || !r.value.data || typeof r.value.data !== 'object') return;
    Object.entries(r.value.data).forEach(([key, value]) => {
      if (typeof value === 'string' && value.trim()) labels[key] = value.trim();
    });
  });
  return { labels, sources };
}

/**
 * Block label map from live labels: { 'submit label': 'flightmanager.flight.searchButton.default' }
 * gives { 'submit label': 'Flüge suchen' } for the keys the live labels have.
 */
export function pickLabels(liveLabels, keyMap) {
  return Object.fromEntries(Object.entries(keyMap)
    .filter(([, liveKey]) => liveLabels[liveKey])
    .map(([key, liveKey]) => [key, liveLabels[liveKey]]));
}

/* ------------------------------------------------------------------------------------------- */
/* Airport search                                                                              */
/* ------------------------------------------------------------------------------------------- */

const fold = (s) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const knownAirportsByMarket = {};

/**
 * Airports known from the recorded answers of a market: every recorded airport suggestion,
 * the recommended origin cities, the recorded fare destinations, the airport names catalog and
 * the default airport. The offline stand-in for a typed search that was never recorded.
 */
export function knownAirports(locale) {
  if (!knownAirportsByMarket[locale.key]) {
    const market = { market: locale.key };
    const load = (prefix, method, mapper) => lhRecorded(prefix, { ...market, method })
      .then((list) => list.flatMap(mapper)).catch(() => []);
    knownAirportsByMarket[locale.key] = Promise.all([
      load('/service/api/suggestions/airports', 'GET', mapAirportSuggestions),
      load('/service/api/lhg-fare-teaser/fareteaser/recommend', 'GET', mapRecommendedOrigins),
      load('/service/api/lhg-fare-teaser/fareteaser/offers/', 'POST', mapOffers),
      load('/service/api/lhg-fare-teaser/fareteaser/manual', 'POST', (d) => mapManualOffers(d).flatMap((o) => [
        { code: o.origin, name: o.originName }, { code: o.destination, name: o.destinationName }])),
      load('/service/api/catalogs/airportnames', 'GET', mapAirportNames),
      load('/service/api/defaultAirport', 'GET', (d) => [mapDefaultAirport(d)].filter(Boolean)),
    ]).then((groups) => {
      const byCode = new Map();
      groups.flat().forEach((a) => {
        if (a && isCode(a.code) && a.name && !byCode.has(a.code)) {
          byCode.set(a.code, {
            code: a.code,
            name: a.name,
            label: a.label || `${a.name} (${a.code})`,
            type: a.type || '',
          });
        }
      });
      return [...byCode.values()];
    });
  }
  return knownAirportsByMarket[locale.key];
}

/** Airports whose code or a word of whose name starts with the term, best matches first. */
export function filterAirports(airports, term, max = 10) {
  const q = fold(term).trim();
  if (!q) return [];
  const score = (a) => {
    const name = fold(a.name);
    if (fold(a.code) === q) return 0;
    if (name.startsWith(q)) return 1;
    if (name.split(/[^a-z0-9]+/).some((w) => w.startsWith(q))) return 2;
    if (q.length >= 3 && name.includes(q)) return 3;
    return -1;
  };
  // cities and airports before rail stations, like the live suggestions
  const rank = (a) => ({ CITY: 0, AIRPORT: 1 }[a.type] ?? (a.type ? 3 : 2));
  return airports
    .map((a) => ({ a, s: score(a) }))
    .filter(({ s }) => s >= 0)
    .sort((x, y) => x.s - y.s || rank(x.a) - rank(y.a) || x.a.name.localeCompare(y.a.name))
    .slice(0, max)
    .map(({ a }) => a);
}

/**
 * Airport autocomplete: the live suggestions for the term (proxy or the exact recording),
 * else the known airports of the market filtered client-side.
 * @returns {Promise<Array<{code: string, name: string, label: string}>>}
 */
export async function searchAirports(term, locale) {
  try {
    const request = airportSuggestionsRequest(term, locale);
    const { data, source } = await fetchRequest(request, locale, { exact: true });
    const list = mapAirportSuggestions(data);
    if (list.length || source === 'live') return list;
  } catch (e) {
    // term never recorded and no proxy: search what the market's recordings know
  }
  return filterAirports(await knownAirports(locale), term);
}
