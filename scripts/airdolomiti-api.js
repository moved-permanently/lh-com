/**
 * Air Dolomiti's API (api.airdolomiti.it, Access-Control-Allow-Origin *) as www.airdolomiti.it's
 * widgets call it (recorded 2026-11-01 on www.airdolomiti.it and .eu): the airports, a route's
 * dates, and the two searches whose answer names the booking engine's page and what to post
 * there (the timetable; the booking retrieval, whose dxMMBTripFlow the server encrypts, so only
 * the API can build it). The hand-off is a POST form to digital.airdolomiti.it, nowhere else.
 * Used by blocks/flight-timetable and blocks/manage-booking (brand airdolomiti only).
 */

export const AD_API = 'https://api.airdolomiti.it/v1';

/**
 * The consent block of a search: not given (www sends false, null and null without a choice)
 * until a consent tool provides the visitor's choice.
 */
export const NO_CONSENT = Object.freeze({
  statistics_consent: false,
  marketing_consent: false,
  experience_consent: false,
  consent_date: null,
  consent_id: null,
});

/** The page's language for the API (Accept-Language): en and de by their root, else it. */
export function adLang(pathname = (typeof window !== 'undefined' ? window.location.pathname : '/')) {
  const m = String(pathname).replace(/^\/content(?=\/)/, '').match(/^\/(en|de)(\/|$)/);
  return m ? m[1] : 'it';
}

/** yyyy-mm-dd -> dd/mm/yyyy (the API's dates). */
export const apiDate = (iso) => String(iso).split('-').reverse().join('/');

/** dd/mm/yyyy -> yyyy-mm-dd, or null when it is no real date. */
export function isoDate(value) {
  const m = String(value || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [, d, mo, y] = m;
  const date = new Date(Date.UTC(+y, +mo - 1, +d));
  return date.getUTCDate() === +d && date.getUTCMonth() === +mo - 1 ? `${y}-${mo}-${d}` : null;
}

/** Whether a hand-off address is Air Dolomiti's engine (https, digital.airdolomiti.it). */
export function adHandoffUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'digital.airdolomiti.it';
  } catch (e) {
    return false;
  }
}

const CODE = /^[A-Z]{3}$/;

async function json(response, what) {
  if (!response.ok) throw new Error(`${what}: ${response.status}`);
  return response.json();
}

/** GET /airports: every airport with its connections (names in it, en, de). */
export async function fetchAirports(fetchImpl = fetch) {
  return json(await fetchImpl(`${AD_API}/airports`), 'airports');
}

/** GET /flights/dates/<ORIG>-<DEST>: the route's flight dates (dd/mm/yyyy). */
export async function fetchFlightDates(origin, destination, fetchImpl = fetch) {
  if (!CODE.test(origin) || !CODE.test(destination)) throw new Error('airport code expected');
  return json(await fetchImpl(`${AD_API}/flights/dates/${origin}-${destination}`), 'dates');
}

/**
 * The timetable search, as www's widget posts it: trip type O (one way, return 01/01/1970) or R.
 * @param {Object} q origin, destination (codes), departureDate, returnDate (yyyy-mm-dd), tripType
 *   ('O' one way, 'R' round trip)
 * @param {string} lang it, en or de
 */
export function timetableRequest(q, lang) {
  if (!CODE.test(q.origin) || !CODE.test(q.destination)) throw new Error('airport code expected');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(q.departureDate || '')) throw new Error('departure date expected');
  const round = q.tripType === 'R';
  if (round && !/^\d{4}-\d{2}-\d{2}$/.test(q.returnDate || '')) throw new Error('return date expected');
  const body = {
    departure_date: apiDate(q.departureDate),
    return_date: round ? apiDate(q.returnDate) : '01/01/1970',
    departure_airport: q.origin,
    destination_airport: q.destination,
    trip_type: round ? 'R' : 'O',
    consent: { ...NO_CONSENT },
  };
  return {
    url: `${AD_API}/bookings/timetable`,
    init: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept-Language': lang },
      body: JSON.stringify(body),
    },
  };
}

/** The engine's address of an answer, refused unless it is Air Dolomiti's. */
function engineUrl(answer) {
  if (!answer || !adHandoffUrl(answer.url)) throw new Error('no booking engine address in the answer');
  return answer.url;
}

/** POSTs the timetable search; the hand-off: its url, the field search (JSON of payload.search). */
export async function requestTimetable(q, lang, fetchImpl = fetch) {
  const { url, init } = timetableRequest(q, lang);
  const answer = await json(await fetchImpl(url, init), 'timetable');
  const action = engineUrl(answer);
  const search = answer.payload && answer.payload.search;
  if (!search || typeof search !== 'object') throw new Error('no search in the answer');
  return { action, fields: { search: JSON.stringify(search) } };
}

/** The booking retrieval, as www's form posts it (surname and booking code, trimmed). */
export function manageRequest({ surname, bookingCode }, lang) {
  const s = String(surname || '').trim();
  const c = String(bookingCode || '').trim();
  if (!s) throw new Error('surname expected');
  if (!c) throw new Error('booking code expected');
  return {
    url: `${AD_API}/bookings/retrieve-pnr`,
    init: {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json', 'Accept-Language': lang },
      body: JSON.stringify({ surname: s, booking_code: c }),
    },
  };
}

/**
 * POSTs the retrieval; the hand-off: its url, recLoc, lastName, dxMMBTripFlow and portalFacts
 * (the answer's, as www posts them; without them the car rental fact with the time now).
 */
export async function requestManage(q, lang, fetchImpl = fetch, now = new Date()) {
  const { url, init } = manageRequest(q, lang);
  const answer = await json(await fetchImpl(url, init), 'retrieve-pnr');
  const action = engineUrl(answer);
  const p = answer.payload || {};
  if (typeof p.dxMMBTripFlow !== 'string' || !p.dxMMBTripFlow) throw new Error('no dxMMBTripFlow in the answer');
  const facts = Array.isArray(p.portalFacts) && p.portalFacts.length
    ? p.portalFacts
    : [{ key: 'carsDateandTime', value: now.toISOString() }];
  return {
    action,
    fields: {
      recLoc: String(p.recLoc ?? ''),
      lastName: String(p.lastName ?? ''),
      dxMMBTripFlow: p.dxMMBTripFlow,
      portalFacts: JSON.stringify(facts),
    },
  };
}
