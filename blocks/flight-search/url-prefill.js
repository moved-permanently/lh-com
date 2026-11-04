/**
 * The flight search prefilled from the page URL, as www.lufthansa.com's flight manager: on load
 * it reads the query string and the part after # (key=value&..., the hash laid over the query),
 * URL-decoded, by www's names (case-sensitive), fills the form and takes exactly these parameters
 * off the address bar (history.replaceState; every other parameter and hash stay). www's other
 * names (PaxInfantsOnSeat, AccessCode, ActiveTab, Duration, Month, Year, AirlineCode …) have no
 * field here and are left alone.
 */

import { clampPassengers } from './passenger-picker.js';

/** www's names the block reads. */
export const PREFILL_PARAMS = ['OriginCode', 'DestinationCode', 'TripType', 'IsOneWay', 'DepartureDate', 'ReturnDate', 'PaxAdults', 'PaxYoungAdults', 'PaxChildren', 'PaxInfants', 'Cabin'];

const keyValues = (part) => {
  const text = String(part || '').replace(/^[?#]/, '');
  return text.includes('=') ? new URLSearchParams(text) : null;
};

/**
 * The prefill parameters of a URL's query and hash ({name: decoded value}); the hash wins.
 * @param {string} search location.search
 * @param {string} hash location.hash
 */
export function readPrefillParams(search, hash) {
  const out = {};
  [search, hash].forEach((part) => {
    const params = keyValues(part);
    if (!params) return;
    PREFILL_PARAMS.forEach((name) => { if (params.has(name)) out[name] = params.get(name); });
  });
  return out;
}

const code = (value) => (/^[A-Za-z]{3}$/.test(value || '') ? value.toUpperCase() : '');
const count = (value) => (/^\d+$/.test(value || '') ? Number(value) : undefined);

/** A YYYY-MM-DD date that exists and is today or later, else ''. */
function dateFrom(value, today) {
  const m = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return '';
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (d.toISOString().slice(0, 10) !== value) return '';
  return value >= today ? value : '';
}

function tripTypeOf(params) {
  const type = String(params.TripType || '').toLowerCase();
  if (type === 'roundtrip') return 'RETURN';
  if (type === 'oneway') return 'ONEWAY';
  if (/^(true|1|yes)$/i.test(params.IsOneWay || '')) return 'ONEWAY';
  if (/^(false|0|no)$/i.test(params.IsOneWay || '')) return 'RETURN';
  return '';
}

/**
 * What the URL sets: origin, destination (codes), tripType (RETURN | ONEWAY), departureDate,
 * returnDate, passengers (within the picker's limits), cabin (E, P, B, F); a value it doesn't
 * set (or sets wrongly) is absent.
 * @param {Object<string, string>} params readPrefillParams
 * @param {Object} options
 * @param {string} options.today YYYY-MM-DD (local)
 * @param {string[]} [options.cabins] the cabins the block offers (its Cabins row)
 * @param {boolean} [options.youngAdults] the Young adults row is on for the root: PaxYoungAdults
 *   counts; else they are adults, as www where the route has none
 * @param {number} [options.adults] the authored adults (the default for PaxAdults)
 */
export function parsePrefill(params, {
  today, cabins = ['E', 'P', 'B', 'F'], youngAdults = false, adults = 1,
} = {}) {
  const out = {};
  if (code(params.OriginCode)) out.origin = code(params.OriginCode);
  if (code(params.DestinationCode)) out.destination = code(params.DestinationCode);
  const tripType = tripTypeOf(params);
  if (tripType) out.tripType = tripType;
  const departure = dateFrom(params.DepartureDate, today);
  if (departure) out.departureDate = departure;
  const back = dateFrom(params.ReturnDate, today);
  if (back && tripType !== 'ONEWAY' && (!departure || back >= departure)) out.returnDate = back;
  if (['PaxAdults', 'PaxYoungAdults', 'PaxChildren', 'PaxInfants'].some((n) => n in params)) {
    let a = count(params.PaxAdults) ?? adults;
    let y = count(params.PaxYoungAdults) ?? 0;
    if (!youngAdults) {
      a += y;
      y = undefined;
    }
    out.passengers = clampPassengers({
      adults: a,
      youngAdults: y,
      children: count(params.PaxChildren) ?? 0,
      infants: count(params.PaxInfants) ?? 0,
    });
  }
  const cabin = String(params.Cabin || '').toUpperCase().replace(/^N$/, 'P');
  if (/^[EPBF]$/.test(cabin) && cabins.includes(cabin)) out.cabin = cabin;
  return out;
}

/** The URL without the prefill parameters (query and hash), or null when it has none. */
export function withoutPrefillParams(href) {
  const url = new URL(href);
  let changed = false;
  PREFILL_PARAMS.forEach((name) => {
    if (url.searchParams.has(name)) {
      url.searchParams.delete(name);
      changed = true;
    }
  });
  const hash = keyValues(url.hash);
  if (hash && PREFILL_PARAMS.some((name) => hash.has(name))) {
    PREFILL_PARAMS.forEach((name) => hash.delete(name));
    url.hash = hash.toString();
    changed = true;
  }
  return changed ? url.href.replace(/#$/, '') : null;
}

// the page's parameters, read once (the first block takes them off the address bar; a second
// flight search on the page reads the same)
let read = null;

/** The page URL's prefill parameters, read once per page; the address bar cleaned after. */
export function pagePrefillParams() {
  const { href, search, hash } = window.location;
  if (read && (read.href === href || read.after === href)) return read.params;
  const params = readPrefillParams(search, hash);
  const after = Object.keys(params).length ? withoutPrefillParams(href) : null;
  read = { href, after, params };
  if (after && window.history && window.history.replaceState) {
    try {
      window.history.replaceState(window.history.state, '', after);
    } catch (e) {
      // a URL the browser refuses (another origin): the address bar stays
    }
  }
  return params;
}
