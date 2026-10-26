/**
 * Aircraft list (AMS rest A3): any web page URL with the selector `aircraft`
 * (`<page>.aircraft.json`) answers `{"aircrafts":[{name, title, url}]}`, one entry per aircraft
 * page of the fleet in the page's locale (/<cc>/<ll>/..., also /content/lh/markets/<cc>/<ll>/...),
 * in the fleet overview's order: `name` the aircraft code (the last segment of the fleet URL
 * /<cc>/<ll>/discover-lufthansa/lufthansa-fleet/<code>), `title` the page title without the
 * " | Lufthansa" suffix, `url` the page path. From the query index /fleet-index.json (metadata
 * aircraft-code, aircraft-order). `application/json`, no cache headers; an empty list for a
 * locale without fleet pages.
 */
import { readSheet } from './sheet.js';

export const FLEET_INDEX = '/fleet-index.json';
const SUFFIX = /\.aircraft\.json$/;
export const isAircraftPath = (pathname) => SUFFIX.test(pathname);

/** The locale prefix /<cc>/<ll> of a page path, or null. */
export function localeOf(pathname) {
  const m = pathname.replace(/^\/content\/lh\/markets(?=\/)/, '').match(/^\/([a-z]{2})\/([a-z]{2})(\/|$|\.)/);
  return m ? `/${m[1]}/${m[2]}` : null;
}

/** The aircraft of a locale from the index rows. */
export function aircraftOf(rows, locale) {
  if (!locale) return [];
  return rows.filter((r) => String(r.path || '').startsWith(`${locale}/`) && r['aircraft-code'])
    .sort((a, b) => (Number(a['aircraft-order']) || 99) - (Number(b['aircraft-order']) || 99) || a.path.localeCompare(b.path))
    .map((r) => ({ name: r['aircraft-code'], title: String(r.title || '').replace(/\s*\|\s*Lufthansa\s*$/, ''), url: r.path }));
}

export async function aircraftList(request, env) {
  const pathname = new URL(request.url).pathname.replace(SUFFIX, '');
  const rows = await readSheet(request, env, FLEET_INDEX);
  const body = JSON.stringify({ aircrafts: aircraftOf(rows, localeOf(pathname)) });
  return new Response(request.method === 'HEAD' ? null : body, {
    headers: { 'content-type': 'application/json', 'x-lh-edge-route': 'aircraft' },
  });
}
