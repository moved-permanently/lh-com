/**
 * www's small booking endpoints (README "Small endpoints"):
 * - GET /service/secured/api/core/booking/defaultairport: the market's default airports
 *   (flight search, B2B portal, app). With X-Portal: LH, X-Portal-Site, X-Portal-Language:
 *   200 {"globalDefaultAirport": {iataCode, name}, "marketDefaultAirport": {iataCode, name}};
 *   without them 400 {"error":"Missing headers","errors":[],"validationErrors":[]}. The market
 *   is X-Portal-Site, as on www; the table is the sheet /app/config/default-airports (market,
 *   global IATA, global name, market IATA, market name; until it exists, its seed: DE, AT, GB as
 *   recorded); a market not in it gets FRA Frankfurt.
 * - GET /service/secured/api/core/booking/bookinglist: 204, empty body, as www (a signed-in
 *   visitor's bookings come from www's backend, not here); the caller's user agent is logged.
 * Both with cache-control private, no-cache, no-store, must-revalidate.
 */
import { readSheet } from './sheet.js';
import { NO_STORE } from './login.js';

export const DEFAULT_AIRPORT_PATH = '/service/secured/api/core/booking/defaultairport';
export const BOOKING_LIST_PATH = '/service/secured/api/core/booking/bookinglist';
const SHEET = '/app/config/default-airports.json';
const FALLBACK = { iataCode: 'FRA', name: 'Frankfurt' };
// the sheet's seed (www's answers, 2026-10-25): used until the sheet is in place
const SEED = [
  {
    market: 'DE', 'global IATA': 'FRA', 'global name': 'Frankfurt', 'market IATA': 'FRA', 'market name': 'Frankfurt',
  },
  {
    market: 'AT', 'global IATA': 'VIE', 'global name': 'Wien', 'market IATA': 'VIE', 'market name': 'Wien',
  },
  {
    market: 'GB', 'global IATA': 'LHR', 'global name': 'London', 'market IATA': 'LHR', 'market name': 'London',
  },
];

const json = (body, status, route) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json', 'cache-control': NO_STORE, 'x-lh-edge-route': route },
});

/** The airports of a market from the sheet rows. */
export function marketAirports(rows, market) {
  const row = rows.find((r) => String(r.market || '').trim().toUpperCase() === market);
  const airport = (code, name) => {
    const iataCode = String((row && row[code]) || '').trim().toUpperCase();
    return /^[A-Z]{3}$/.test(iataCode) ? { iataCode, name: String(row[name] || '').trim() } : { ...FALLBACK };
  };
  return {
    globalDefaultAirport: airport('global IATA', 'global name'),
    marketDefaultAirport: airport('market IATA', 'market name'),
  };
}

/** GET .../defaultairport */
export async function defaultAirport(request, env) {
  const h = request.headers;
  const market = String(h.get('x-portal-site') || '').trim().toUpperCase();
  if (String(h.get('x-portal') || '').toUpperCase() !== 'LH' || !/^[A-Z]{2}$/.test(market) || !h.get('x-portal-language')) {
    return json({ error: 'Missing headers', errors: [], validationErrors: [] }, 400, 'default-airport');
  }
  const rows = await readSheet(request, env, SHEET);
  return json(marketAirports(rows.length ? rows : SEED, market), 200, 'default-airport');
}

/** GET .../bookinglist */
export function bookingList(request) {
  // who still calls it (the app, the B2B portal ...): the user agent only, nothing stored
  // eslint-disable-next-line no-console
  console.log(`bookinglist: ${String(request.headers.get('user-agent') || '-').slice(0, 200)}`);
  return new Response(null, {
    status: 204,
    headers: { 'cache-control': NO_STORE, 'x-lh-edge-route': 'booking-list' },
  });
}
