/**
 * booking-box's TAP format (tools/reports/tap/booking-spec.md): the hand-off to TAP's booking
 * engine as www.flytap.com builds it (3.1), TAP's check-in and manage-booking links (5.4) and its
 * passenger rules (2.3). Pure functions, no DOM: test/booking-box-tap.test.mjs.
 */

export const TAP_BOOKING_HOST = 'booking.flytap.com';
const DEEPLINK = `https://${TAP_BOOKING_HOST}/booking/flights/deeplink`;
const MULTICITY = `https://${TAP_BOOKING_HOST}/booking/flights-multicity/deeplink`;

/** At most this many flights in a multi-city search (www: origin1 to origin5 after the first). */
export const MAX_FLIGHTS = 6;
/** At most this many people in a search, infants included. */
export const MAX_PASSENGERS = 9;

/** The airports on which TAP offers young adults (12 to 15). */
export const UK_AIRPORTS = new Set(('LCY LGW LHR MAN EDI BHD ABZ GLA BRS NCL SOU IOM BPR TPB CFW CWL ZXE EXT ZGG GLO '
  + 'INV XQL LPL LXL LON NQY NWI OXF XPT SZD ZFG').split(' '));

/** The market's airport (TAP's market settings, spec 2.3) when a root names none. */
const MARKET_ORIGINS = {
  PT: 'LIS', ES: 'MAD', FR: 'PAR', DE: 'FRA', IT: 'FCO', PL: 'WAW', GB: 'LON', US: 'NYC', BR: 'RIO',
};

/**
 * The default origin of a search: the root's home airport (scripts/site-languages.js, www's
 * market settings: de-ch GVA), else the market's; '' when neither is known.
 */
export function marketOrigin(market, homeAirport) {
  return String(homeAirport || MARKET_ORIGINS[String(market || '').toUpperCase()] || '');
}

/** Whether a route touches one of the UK airports (young adults then count). */
export function isUkRoute(flights = []) {
  return flights.some((f) => f && (UK_AIRPORTS.has(f.origin) || UK_AIRPORTS.has(f.destination)));
}

const TRIP_TYPES = {
  return: 'return', 'round-trip': 'return', 'one-way': 'single', single: 'single', 'multi-city': 'openJaw', openJaw: 'openJaw',
};

/** ISO YYYY-MM-DD to TAP's dd.MM.yyyy, the date as picked (no time zone involved). */
function tapDate(iso, what) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
  if (!m) throw new Error(`${what}: a date YYYY-MM-DD`);
  return `${m[3]}.${m[2]}.${m[1]}`;
}

/**
 * Whether the passengers are a search TAP accepts: at most 9 people with the infants, adults (plus
 * young adults on a UK route) at least 1, at most one infant per adult, at most 7 children per
 * adult and fewer with infants (TAP: 1 adult with 1 infant allows 3 children; here 4 fewer per
 * infant).
 * @param {{adults?: number, youngAdults?: number, children?: number, infants?: number}} p
 * @param {boolean} [ukRoute] young adults count (otherwise they are left out)
 */
export function passengersValid(p, ukRoute = false) {
  const adults = p.adults || 0;
  const young = ukRoute ? p.youngAdults || 0 : 0;
  const children = p.children || 0;
  const infants = p.infants || 0;
  if ([adults, young, children, infants].some((n) => !Number.isInteger(n) || n < 0)) return false;
  if (!ukRoute && (p.youngAdults || 0) > 0) return false;
  if (adults + young < 1) return false;
  if (adults + young + children + infants > MAX_PASSENGERS) return false;
  if (infants > adults) return false;
  return children <= 7 * adults - 4 * infants;
}

/** Whether a passenger stepper may move by delta (+1, -1) from a state. */
export function canChange(p, type, delta, ukRoute = false) {
  const next = { ...p, [type]: (p[type] || 0) + delta };
  if (next[type] < 0) return false;
  if (type === 'youngAdults' && !ukRoute) return false;
  return passengersValid(next, ukRoute);
}

/**
 * The URL of a search on TAP's booking engine (spec 3.1, the parameters in TAP's order).
 * @param {Object} search
 * @param {string} search.market market code (PT, ES …)
 * @param {string} search.language the root's language (pt, en …)
 * @param {string} search.tripType return | one-way | multi-city
 * @param {Array<{origin: string, destination: string, date: string}>} search.flights ISO dates
 * @param {string} [search.returnDate] ISO date, for a return
 * @param {number} [search.adults] (default 1) @param {number} [search.youngAdults]
 * @param {number} [search.children] @param {number} [search.infants]
 * @param {boolean} [search.payWithMiles]
 * @param {string} uuid x_tap_correlationid (the page: crypto.randomUUID())
 * @returns {string}
 */
export function buildTapDeeplink(search, uuid) {
  const {
    market, language, tripType, flights = [], returnDate, adults = 1, youngAdults = 0, children = 0,
    infants = 0,
    payWithMiles = false,
  } = search;
  const flightType = TRIP_TYPES[tripType];
  if (!flightType) throw new Error(`trip type ${tripType}`);
  if (!market || !language) throw new Error('market and language');
  const legs = flightType === 'openJaw' ? flights : flights.slice(0, 1);
  if (!legs.length) throw new Error('a flight');
  if (legs.length > MAX_FLIGHTS) throw new Error(`at most ${MAX_FLIGHTS} flights`);
  if (flightType === 'openJaw' && legs.length < 2) throw new Error('multi-city: at least 2 flights');
  const dates = legs.map((f, i) => {
    if (!f || !f.origin) throw new Error(`flight ${i + 1}: origin`);
    if (!f.destination) throw new Error(`flight ${i + 1}: destination`);
    if (f.origin === f.destination) throw new Error(`flight ${i + 1}: origin and destination the same`);
    const d = tapDate(f.date, `flight ${i + 1}`);
    if (i && f.date < legs[i - 1].date) throw new Error(`flight ${i + 1}: date before flight ${i}`);
    return d;
  });
  let ret = '';
  if (flightType === 'return') {
    if (!returnDate) throw new Error('return: a return date');
    ret = tapDate(returnDate, 'return');
    if (returnDate < legs[0].date) throw new Error('return: the return date before the departure');
  }
  const uk = isUkRoute(legs);
  const yth = uk ? youngAdults : 0;
  if (!passengersValid({
    adults, youngAdults: yth, children, infants,
  }, uk)) throw new Error('passengers');

  const q = new URLSearchParams();
  q.append('market', String(market).toUpperCase());
  q.append('language', String(language).slice(0, 2).toLowerCase());
  q.append('origin', legs[0].origin);
  q.append('destination', legs[0].destination);
  q.append('flexibleDates', 'false');
  q.append('flightType', flightType);
  q.append('adt', String(adults));
  q.append('chd', String(children));
  q.append('inf', String(infants));
  q.append('yth', String(yth));
  q.append('depDate', dates[0]);
  q.append('headerfooterhidden', 'false');
  if (ret) q.append('retDate', ret);
  legs.slice(1).forEach((f, i) => {
    q.append(`origin${i + 1}`, f.origin);
    q.append(`destination${i + 1}`, f.destination);
    q.append(`depDate${i + 1}`, dates[i + 1]);
  });
  q.append('x_tap_source', 'WEB');
  q.append('x_tap_username', '');
  q.append('x_tap_correlationid', uuid);
  if (payWithMiles) q.append('award', 'true');
  return `${flightType === 'openJaw' ? MULTICITY : DEEPLINK}?${q}`;
}

/** A booking code: 6 letters or digits, or a 13-digit ticket number. */
export function isBookingCode(code) {
  const c = String(code || '').trim();
  return /^[A-Za-z0-9]{6}$/.test(c) || /^\d{13}$/.test(c);
}

/** TAP's check-in (its dynamic link check-in-link: Amadeus' check-in for TP). */
export function tapCheckinUrl({ code, lastName, language }) {
  const q = new URLSearchParams({
    Redirected: 'true',
    ISurname: String(lastName || '').trim(),
    IFormOfIdentification: 'PNR',
    IIdentification: String(code || '').trim().toUpperCase(),
    ln: String(language || 'en').slice(0, 2).toLowerCase(),
  });
  return `https://checkin.si.amadeus.net/static/PRD/TP/#/checkindirect?${q}`;
}

/** TAP's manage booking (myb.flytap.com) for a booking code and last name. */
export function tapManageUrl({
  code, lastName, market, language,
}) {
  const c = encodeURIComponent(String(code || '').trim().toUpperCase());
  const n = encodeURIComponent(String(lastName || '').trim());
  const q = new URLSearchParams({
    market: String(market || '').toUpperCase(),
    language: String(language || 'en').slice(0, 2).toLowerCase(),
  });
  return `https://myb.flytap.com/my-bookings/details/${c}/${n}?${q}`;
}
