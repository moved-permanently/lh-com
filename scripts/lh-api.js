/**
 * Data contract of the lufthansa.com service API used by the widgets, taken from the requests
 * the live pages make themselves (tools/source-export/api/*.ndjson). Request builders produce
 * exactly the live request (path, query, POST body) so recorded answers match; mappers turn
 * the live response shapes into plain view data. Blocks fetch through lhFetch (scripts/lh-data.js:
 * suggestions, labels, catalogs, defaultAirport and the destinationfinder routes directly from
 * www.lufthansa.com, the fare teaser services through lh-proxy, the recordings as
 * fallback).
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
 * @param {'airportnames'|'airlines'|'calendar'|'localeData'|'conditions'|'countryselector'
 *   |'affinities'|'regions'} name
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

/** Travel class codes of the live destination finder's select (economy recorded). */
export const DESTINATION_FINDER_CABINS = ['E', 'N', 'B', 'F'];

/**
 * Every destination with its lowest fare from an origin (the full-page destination finder,
 * "Best offers"), e.g.
 * GET /service/api/destinationfinder/destination/finder/FRA/E?months=0_11&tripType=RETURN
 * Path: origin city code and cabin. Only E (economy) is recorded; N (premium economy),
 * B (business) and F (first) are the option values of the live travel class select and are
 * assumed to be sent the same way. months: first and last travel month as offsets from the
 * current month ("0_11" = the next twelve months, the live default). tripType: RETURN
 * (recorded) or ONEWAY (the live radio value, assumed). Called directly on www.lufthansa.com
 * with the market's X-Portal-* headers (X-Portal-Site is required: 400 "Invalid site"
 * without it), the recordings as fallback.
 * @param {{origin: string, cabin?: string, months?: number[], tripType?: string}} options
 */
export function destinationFinderOffersRequest({
  origin, cabin = 'E', months = [0, 11], tripType = 'RETURN',
}) {
  const [from = 0, to = 11] = months;
  const params = new URLSearchParams({
    months: `${from}_${to}`,
    tripType: apiTripType(tripType) === 'O' ? 'ONEWAY' : 'RETURN',
  });
  const cabinCode = DESTINATION_FINDER_CABINS.includes(cabin) ? cabin : 'E';
  return {
    method: 'GET',
    route: `/service/api/destinationfinder/destination/finder/${encodeURIComponent(origin)}/${cabinCode}?${params}`,
  };
}

/**
 * The sticky price of an Insights article (dcep-sticky-price): the lowest round trip from the
 * visitor's market to the destination, e.g. GET /service/api/teaser/price/BER →
 * {"currency":"EUR","destination":"Berlin","price":141.26}. Direct, X-Portal-* headers of the
 * market; no recording is ever used (a price route).
 */
export function teaserPriceRequest(destination) {
  return { method: 'GET', route: `/service/api/teaser/price/${encodeURIComponent(destination)}` };
}

/** {"currency":"EUR","destination":"Berlin","price":141.26} → { price, currency, name } or null */
export function mapTeaserPrice(data) {
  const price = Number(data && data.price);
  if (!Number.isFinite(price) || price <= 0) return null;
  return { price, currency: (data.currency || '').toUpperCase(), name: data.destination || '' };
}

/**
 * The destination page (dcep-single-offer-display), as www's page calls it (recorded
 * 2026-10-25, tools/source-export/api/watched/):
 *   GET /service/api/destinationfinder/destination/content/CHI   city text, visit duration,
 *       recommended stays, categories (sightseeing, cuisine, neighbourhoods, transport)
 *   GET /service/api/destinationfinder/flightinfo/FRA?destination=CHI   flight time, stops
 *   GET /service/api/flight-prices/FRA/CHI/E/2026-10-25T23:00:00/7?mode=MONTHS   lowest fare
 *       per month (12 months from tomorrow, local midnight written in UTC);
 *       ?monthsToFetch=2&mode=DAYS per day for the month shown and the next one
 */
export function destinationContentRequest(destination) {
  return { method: 'GET', route: `/service/api/destinationfinder/destination/content/${encodeURIComponent(destination)}` };
}

export function flightInfoRequest(origin, destination) {
  return { method: 'GET', route: `/service/api/destinationfinder/flightinfo/${encodeURIComponent(origin)}?${new URLSearchParams({ destination })}` };
}

/** A local day's midnight written in UTC without milliseconds and zone, as www sends it. */
export function flightPricesDate(date) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return d.toISOString().replace(/\.\d{3}Z$/, '');
}

/** The first travel day of the price calendar: tomorrow. */
export function flightPricesStart(now = new Date()) {
  return flightPricesDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1));
}

/**
 * @param {{origin, destination, cabin, start, tripDuration, mode: 'MONTHS'|'DAYS', months?}} o
 *   start: flightPricesStart(), or flightPricesDate() of the first day of a month for DAYS
 */
export function flightPricesRequest({
  origin, destination, cabin = 'E', start, tripDuration = 7, mode = 'MONTHS', months = 2,
}) {
  const params = mode === 'DAYS' ? { monthsToFetch: String(months), mode } : { mode };
  const path = [origin, destination, cabin, start, tripDuration].map((v) => encodeURIComponent(v)).join('/');
  return { method: 'GET', route: `/service/api/flight-prices/${path}?${new URLSearchParams(params)}` };
}

/**
 * {"currency":"EUR","currencySymbol":"€","currencySymbolPrefixed":false,"originCityName":
 *  "Frankfurt","destinationCityName":"Chicago","farePerDates":[{"outboundDate":
 *  "2026-11-08T00:00:00.000+00:00","price":693.04,"bestPriceInMonth":false}]}
 * → { originName, destinationName, currency, symbol, prefixed, fares: [{ date, price, best }] }
 */
export function mapFlightPrices(data) {
  const fares = ((data && Array.isArray(data.farePerDates) && data.farePerDates) || [])
    .map((f) => ({ date: String(f.outboundDate || '').slice(0, 10), price: Number(f.price), best: Boolean(f.bestPriceInMonth) }))
    .filter((f) => /^\d{4}-\d{2}-\d{2}$/.test(f.date) && Number.isFinite(f.price) && f.price > 0);
  return {
    originName: (data && data.originCityName) || '',
    destinationName: (data && data.destinationCityName) || '',
    currency: (data && data.currency) || '',
    symbol: (data && data.currencySymbol) || '',
    prefixed: typeof (data && data.currencySymbolPrefixed) === 'boolean' ? data.currencySymbolPrefixed : undefined,
    fares,
  };
}

/**
 * Options of the live lounge finder's "Travel Class or Frequent Flyer Status" select, in the
 * live order (initialState.statuses of the LoungeFinder app, 4ca8ff36.chunk.js): travel classes
 * First, Business, Economy, then the frequent flyer statuses HON Circle, Senator, Frequent
 * Traveller, Star Alliance Gold. ECO is offered only with the feature switch
 * TEX-APEX-DHTE-22006-lounge-purchase (on in core/feature/list/lh/DE, 2026-10-21) and then
 * searches purchasable lounges (see the lounge-finder block).
 */
export const LOUNGE_STATUSES = [
  { id: 'FIR', group: 'class' },
  { id: 'BUS', group: 'class' },
  { id: 'ECO', group: 'class' },
  { id: 'HON', group: 'card' },
  { id: 'SEN', group: 'card' },
  { id: 'FTL', group: 'card' },
  { id: 'STA', group: 'card' },
];

/** Cities the lounge finder offers: GET /service/api/catalogs/lounges/cities */
export function loungeCitiesRequest() {
  return catalogRequest('lounges/cities');
}

/**
 * Lounges of a city for a travel class or status (catalogs_lounges_customerStatus_citycode_get
 * of d9631429.chunk.js), e.g. GET /service/api/catalogs/lounges/SEN/FRA
 * Path: status (FIR, BUS, HON, SEN, FTL, STA; the Economy flow asks for BUS) and the city code
 * of catalogs/lounges/cities. No query, no body; localized by the X-Portal-* headers.
 * @param {{status: string, city: string}} options
 */
export function loungesRequest({ status, city }) {
  return {
    method: 'GET',
    route: `/service/api/catalogs/lounges/${encodeURIComponent(String(status).toUpperCase())}/${encodeURIComponent(String(city).toUpperCase())}`,
  };
}

/**
 * Id of a POI map: the live data-dcep id is the base64 of the component's JCR path
 * (/content/lh/markets/de/en/.../poimapping). Accepts the path (encoded here) or the id.
 * @param {string} text authored Source value
 * @returns {string} base64 id or ''
 */
export function poiMapId(text) {
  const value = String(text || '').trim();
  if (value.startsWith('/content/')) {
    try {
      return btoa(value);
    } catch (e) {
      return '';
    }
  }
  return /^[A-Za-z0-9+/]+={0,2}$/.test(value) ? value : '';
}

/**
 * Points of a POI map (saga fetchPointOfInterest of the live bundle): GET
 * /service/secured/api/pointsOfInterest/{id}, id = the base64 data-dcep id
 * (/service/api/pointsOfInterest answers 404). www.lufthansa.com answers it with the points only
 * same-origin with the market's X-Portal-* headers (204 without a body from aem.page), so the
 * answers are recorded (tools/importer/bd-record-api.mjs --set poi) and lhFetch reads only the
 * recordings for this route. "=" is kept unencoded; recordings match with "=" or "%3D".
 * @param {string} id
 */
export function pointsOfInterestRequest(id) {
  return {
    method: 'GET',
    route: `/service/secured/api/pointsOfInterest/${encodeURIComponent(id).replace(/%3D/g, '=')}`,
  };
}

/**
 * {"pointsOfInterest":[{"lat":41.38,"lng":2.17,"title":"Parc de la Ciutadella","link":"https://…"?,
 *  "linkLabel":"…"?, "linkExternal":true?, "topDeal":false?}]} (fields read by the live
 * selectors; 52 answers recorded 2026-10-23)
 * → [{ lat, lng, title, link, linkLabel, linkExternal }]; points without valid coordinates are
 * left out, one point per position (the live key).
 */
export function mapPointsOfInterest(data) {
  const list = data && Array.isArray(data.pointsOfInterest) ? data.pointsOfInterest : [];
  const seen = new Set();
  return list.map((p) => ({
    lat: Number(p && p.lat),
    lng: Number(p && p.lng),
    title: p && typeof p.title === 'string' ? p.title.trim() : '',
    link: p && typeof p.link === 'string' ? p.link.trim() : '',
    linkLabel: p && typeof p.linkLabel === 'string' ? p.linkLabel.trim() : '',
    linkExternal: Boolean(p && p.linkExternal),
  })).filter((p) => {
    const key = `${p.lat}-${p.lng}`;
    if (!Number.isFinite(p.lat) || !Number.isFinite(p.lng) || Math.abs(p.lat) > 90
      || Math.abs(p.lng) > 180 || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
 * {"destinationFinderOffers":[{"city":"SCQ","cityName":"Santiago de Compostela","topDeal":false,
 *  "cityRegion":"EU","countryName":"Spain","countryCode":"ES","affinities":["HI","NA"],
 *  "minimumFlightDuration":155?,"price":248.77,"numberOfStopovers":0,"tenantAirlineStopovers":0,
 *  "isTenantAirlineOperating":true,"isKClass":false}],
 *  "currencyInfo":{"currency":"EUR","currencySymbol":"€","currencySymbolPrefixed":false},
 *  "originCityName":"Frankfurt"}
 * → { originName, offers: [{ code, name, country, countryCode, region, affinities, price,
 *   stops, tenantOperating, kClass, topDeal, duration, currency, symbol, prefixed }] } in the
 * service's order; offers without a valid price are left out.
 */
export function mapDestinationFinderOffers(data) {
  const info = (data && data.currencyInfo) || {};
  const currency = {
    currency: info.currency || '',
    symbol: info.currencySymbol || '',
    prefixed: typeof info.currencySymbolPrefixed === 'boolean' ? info.currencySymbolPrefixed : undefined,
  };
  const offers = ((data && Array.isArray(data.destinationFinderOffers)
    && data.destinationFinderOffers) || [])
    .filter((o) => o && isCode(o.city))
    .map((o) => ({
      code: o.city.toUpperCase(),
      name: o.cityName || '',
      country: o.countryName || '',
      countryCode: (o.countryCode || '').toUpperCase(),
      region: (o.cityRegion || '').toUpperCase(),
      affinities: (Array.isArray(o.affinities) ? o.affinities : [])
        .map((a) => String(a).toUpperCase()),
      price: Number(o.price),
      stops: Number.isFinite(Number(o.numberOfStopovers)) ? Number(o.numberOfStopovers) : undefined,
      tenantOperating: Boolean(o.isTenantAirlineOperating),
      kClass: Boolean(o.isKClass),
      topDeal: Boolean(o.topDeal),
      duration: Number(o.minimumFlightDuration) || undefined,
      ...currency,
    }))
    .filter((o) => Number.isFinite(o.price) && o.price > 0);
  return { originName: (data && data.originCityName) || '', offers };
}

/** {"affinities":[{"code":"BE","name":"Beach"}]} → [{ code, name }] (catalogs/affinities) */
export function mapAffinities(data) {
  return ((data && data.affinities) || [])
    .filter((a) => a && a.code && a.name)
    .map((a) => ({ code: String(a.code).toUpperCase(), name: a.name }));
}

/** {"regions":[{"code":"EU","region":"Europe"}]} → [{ code, name }] (catalogs/regions) */
export function mapRegions(data) {
  return ((data && data.regions) || [])
    .filter((r) => r && r.code && (r.region || r.name))
    .map((r) => ({ code: String(r.code).toUpperCase(), name: r.region || r.name }));
}

/** {"cities":[{"code":"ABV","city":"Abuja"}]} → [{ code, name }] (catalogs/lounges/cities) */
export function mapLoungeCities(data) {
  return ((data && data.cities) || [])
    .filter((c) => c && isCode(c.code) && c.city)
    .map((c) => ({ code: c.code.toUpperCase(), name: c.city }));
}

/** Image width of the live lounge card (MauiImage size S) and its srcset widths. */
const LOUNGE_IMAGE_WIDTHS = [2560, 1440, 720, 360, 180];

/**
 * Square lounge image as the live app builds it from imageBaseUrl (data-dcep):
 * {base}/{loungeid}-square.jpg.transform/lh-dcep-transform-width-{width}/img.jpg, on
 * www.lufthansa.com; {base}/fallback-square.jpg... when the lounge has no image (404).
 * @param {string} base e.g. /content/dam/lh/images/lounges
 * @param {string} id loungeid or 'fallback'
 * @param {number} [width]
 */
export function loungeImageUrl(base, id, width) {
  if (!id) return '';
  const root = String(base || '/content/dam/lh/images/lounges').replace(/\/+$/, '');
  const path = `${root}/${String(id).toLowerCase()}-square.jpg`;
  const url = width ? `${path}.transform/lh-dcep-transform-width-${width}/img.jpg` : path;
  return /^https?:/.test(url) ? url : `${LIVE_ORIGIN}${url}`;
}

/** srcset of a lounge image (every live width). */
export function loungeImageSrcset(base, id) {
  return LOUNGE_IMAGE_WIDTHS.map((w) => `${loungeImageUrl(base, id, w)} ${w}w`).join(', ');
}

const loungeText = (v) => (typeof v === 'string' || typeof v === 'number' ? String(v).trim() : '');

/**
 * Opening hours of the week (loungeOpeningHours: seven lists, Monday first, of
 * {"from":"05:30","to":"22:00"}) → seven lists of { from, to } sorted by start; [] = closed.
 * Anything else (missing, not seven entries) → [] (the card then shows openingHours text).
 */
function mapOpeningWeek(week) {
  if (!Array.isArray(week) || week.length !== 7) return [];
  return week.map((day) => (Array.isArray(day) ? day : [])
    .map((t) => ({ from: loungeText(t && t.from), to: loungeText(t && t.to) }))
    .filter((t) => t.from || t.to)
    .sort((a, b) => (a.from > b.from ? 1 : -1)));
}

/**
 * Lounges answer (shape from the live LoungeFinder selectors, 4ca8ff36.chunk.js; no answer
 * recorded yet):
 * {"lounges":[{"loungeid":"14072","loungename":"Lufthansa Senator Lounge","category":
 *  "SENATOR_LOUNGE","airportname":"Frankfurt/Main","loungeLocation":{"terminal":"Terminal 1",
 *  "level":"Level 3","gateInfo":"near gate A26"},"plainLocation":"...","openingHours":"...",
 *  "loungeOpeningHours":[[{"from":"05:00","to":"22:30"}],...7 days, Monday first],
 *  "loungeDescription":"...","loungefeatures":["WLAN","SHOWER",...]}]}
 * → [{ id, name, category, airportName, location: {terminal, level, gateInfo} | string,
 *   openingHours, week, description, features, image, srcset, fallbackImage }]
 * The live app reads the first property of the answer as the list; so does this mapper.
 * @param {Object} data
 * @param {string} [imageBase] data-dcep imageBaseUrl
 */
export function mapLounges(data, imageBase) {
  const list = data && (Array.isArray(data.lounges) ? data.lounges
    : Object.values(data).find(Array.isArray));
  return (list || []).filter((l) => l && typeof l === 'object' && (l.loungeid || l.loungename))
    .map((l) => {
      const where = l.loungeLocation || {};
      const located = ['terminal', 'level', 'gateInfo'].some((k) => loungeText(where[k]));
      const id = loungeText(l.loungeid);
      return {
        id,
        name: loungeText(l.loungename),
        category: loungeText(l.category).toUpperCase(),
        airportName: loungeText(l.airportname),
        location: located ? {
          terminal: loungeText(where.terminal),
          level: loungeText(where.level),
          gateInfo: loungeText(where.gateInfo),
        } : loungeText(l.plainLocation),
        openingHours: loungeText(l.openingHours),
        week: mapOpeningWeek(l.loungeOpeningHours),
        description: loungeText(l.loungeDescription),
        features: (Array.isArray(l.loungefeatures) ? l.loungefeatures : [])
          .map((f) => loungeText(f).toUpperCase()).filter(Boolean),
        image: id ? loungeImageUrl(imageBase, id, 720) : '',
        srcset: id ? loungeImageSrcset(imageBase, id) : '',
        fallbackImage: loungeImageUrl(imageBase, 'fallback', 720),
      };
    });
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
 * Airport autocomplete with the source of the answer: the live suggestions for the term
 * (www.lufthansa.com directly, else the exact recording), else the known airports of the
 * market filtered client-side (source 'recorded').
 * @returns {Promise<{list: Array<{code: string, name: string, label: string}>,
 *   source: 'live'|'recorded'}>}
 */
export async function searchAirportsWithSource(term, locale) {
  try {
    const request = airportSuggestionsRequest(term, locale);
    const { data, source } = await fetchRequest(request, locale, { exact: true });
    const list = mapAirportSuggestions(data);
    if (list.length || source === 'live') return { list, source };
  } catch (e) {
    // term never recorded and the site not reachable: search what the recordings know
  }
  return { list: filterAirports(await knownAirports(locale), term), source: 'recorded' };
}

/**
 * Airport autocomplete (see searchAirportsWithSource).
 * @returns {Promise<Array<{code: string, name: string, label: string}>>}
 */
export async function searchAirports(term, locale) {
  return (await searchAirportsWithSource(term, locale)).list;
}

/**
 * The origin of a widget, in the order flight search uses: the authored airport, else the
 * market default airport (GET /service/api/defaultAirport: www answers by the visitor's
 * location), else the locale's home airport.
 * @param {{code: string, name?: string}|null} authored
 * @returns {Promise<{code: string, name: string, from: 'authored'|'defaultAirport'|'home'}>}
 */
export async function resolveOrigin(authored, locale) {
  if (authored && authored.code) return { name: '', ...authored, from: 'authored' };
  try {
    const { data } = await lhFetch(defaultAirportRequest().route, { market: locale.key });
    const airport = mapDefaultAirport(data);
    if (airport) return { ...airport, from: 'defaultAirport' };
  } catch (e) {
    // no answer: the home airport
  }
  return { code: locale.homeAirport, name: '', from: 'home' };
}
