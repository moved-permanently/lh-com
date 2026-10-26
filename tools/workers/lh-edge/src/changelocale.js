/**
 * www's country and language selector (AMS rest A4): POST <page>.changelocale (also
 * <page>.changelocale.html), called by the selector in the header of www's pages.
 * - Country lookup: JSON {"geolocation": true, "language": "<ll>"}: 200 application/json
 *   {"country": "<the visitor's country from the CDN, lower case, or empty>"}; nothing else.
 * - Switch: a form (application/x-www-form-urlencoded) with `country` and `language` (two
 *   letters each) plus the page's query parameters: 302 to the same page in the chosen market
 *   and language when the replica has it (the locale map /data/locale-map.json, as
 *   scripts/locale.js getCounterpartPath), else to that locale's homepage (www's homepage for a
 *   market the replica does not have, as scripts/locale.js getHomepageUrl); the other form
 *   fields go on as the query. Sets `dcep.prehpsettings=<country>/<language>` (lower case,
 *   Path=/, 400 days, Secure, readable by scripts). With only `language` valid the current
 *   market is kept.
 * - Any other body: 400.
 */
/* eslint-disable import/no-relative-packages */
import { LOCALES, getHomepageUrl } from '../../../../scripts/locale.js';
/* eslint-enable import/no-relative-packages */
import { readOrigin } from './sheet.js';

const SUFFIX = /\.changelocale(\.html)?$/;
export const LOCALE_MAP = '/data/locale-map.json';
export const COOKIE = 'dcep.prehpsettings';
const MAX_AGE = 400 * 24 * 3600;
const TWO = /^[a-z]{2}$/;

export const isChangeLocalePath = (pathname) => SUFFIX.test(pathname);

/** The page path without the selector and the market prefix of repository paths. */
export const pageOf = (pathname) => pathname.replace(SUFFIX, '').replace(/\.html$/, '').replace(/^\/content\/lh\/markets(?=\/)/, '').replace(/\/$/, '');

/** The visitor's country (Cloudflare), lower case, or '' (unknown, Tor, none). */
export function visitorCountry(request) {
  const c = String((request.cf && request.cf.country) || request.headers.get('cf-ipcountry') || '').toLowerCase();
  return TWO.test(c) && c !== 'xx' && c !== 't1' ? c : '';
}

/**
 * The target of a switch: the page's counterpart in `cc/ll` from the locale map rows, else the
 * locale's homepage (www's for a market the replica does not have).
 */
export function switchTarget(page, cc, ll, rows) {
  const key = `${cc}/${ll}`;
  if (!LOCALES[key]) return getHomepageUrl(cc, ll);
  const row = (rows || []).find((r) => Object.values(r).includes(page));
  return (row && row[key]) || `/${key}/homepage`;
}

const json = (body, status = 200, extra = {}) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'content-type': 'application/json', 'cache-control': 'no-store', 'x-lh-edge-route': 'changelocale', ...extra,
  },
});

export async function changeLocale(request, env) {
  const type = (request.headers.get('content-type') || '').toLowerCase();
  const text = await request.text();
  if (type.includes('application/json')) {
    let body;
    try { body = JSON.parse(text); } catch (e) { body = null; }
    if (body && body.geolocation === true) return json({ country: visitorCountry(request) });
    return json({}, 400);
  }
  if (!type.includes('application/x-www-form-urlencoded')) return json({}, 400);
  const form = new URLSearchParams(text);
  const country = String(form.get('country') || '').trim().toLowerCase();
  const language = String(form.get('language') || '').trim().toLowerCase();
  const page = pageOf(new URL(request.url).pathname);
  const current = page.match(/^\/([a-z]{2})\/([a-z]{2})(?:\/|$)/);
  if (!TWO.test(language) || (!TWO.test(country) && !current)) return json({}, 400);
  const cc = TWO.test(country) ? country : current[1];
  let rows = [];
  try { rows = JSON.parse((await readOrigin(request, env, LOCALE_MAP)) || '{}').pages || []; } catch (e) { rows = []; }
  const target = switchTarget(page, cc, language, rows);
  ['country', 'language'].forEach((k) => form.delete(k));
  const query = form.toString();
  const location = query ? `${target}${target.includes('?') ? '&' : '?'}${query}` : target;
  return new Response(null, {
    status: 302,
    headers: {
      location,
      'set-cookie': `${COOKIE}=${cc}/${language}; Path=/; Max-Age=${MAX_AGE}; Secure`,
      'cache-control': 'no-store',
      'x-lh-edge-route': 'changelocale',
    },
  });
}
