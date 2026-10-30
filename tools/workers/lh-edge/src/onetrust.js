/**
 * OneTrust from the page's own host (brief 150), and two first-party helpers for the site:
 * - /onetrust/* answers https://cdn.cookielaw.org/* and /logos/* answers
 *   https://cdn.cookielaw.org/logos/*, byte for byte, cached at the edge for the upstream's
 *   cache-control (cacheEverything). OneTrust derives every URL from its stub's own URL (the SDK,
 *   the config and language JSON, the assets), so a stub loaded from /onetrust/ fetches them all
 *   from there; only the two logos come from <origin>/logos/... No request cookies go upstream;
 *   no upstream cookie comes back.
 * - /fonts/lufthansa/v<version>/*: the site's versioned brand fonts with
 *   `cache-control: public, max-age=31536000, immutable` (a new version is a new path).
 * - lh-geo=<the visitor's country> (upper case, Cloudflare's; readable, path /, SameSite=Lax, a
 *   session cookie) on HTML answers, so the site hands OneTrust its geolocation without a request
 *   to geolocation.onetrust.com (scripts/consent.js). Not set when the country is unknown or the
 *   request already carries the same value.
 */
import { visitorCountry } from './changelocale.js';

export const ONETRUST_ORIGIN = 'https://cdn.cookielaw.org';
const ONETRUST = /^\/onetrust\/(.+)$/;
const LOGOS = /^\/logos\/.+$/;
export const FONTS = /^\/fonts\/lufthansa\/v\d+(\.\d+)*\/[^/]+$/;
export const IMMUTABLE = 'public, max-age=31536000, immutable';

/** The cdn.cookielaw.org URL of a request path, or null. */
export function onetrustUpstream(pathname, search = '') {
  const m = pathname.match(ONETRUST);
  if (m) return `${ONETRUST_ORIGIN}/${m[1]}${search}`;
  if (LOGOS.test(pathname)) return `${ONETRUST_ORIGIN}${pathname}${search}`;
  return null;
}

export const isOnetrustPath = (pathname) => onetrustUpstream(pathname) !== null;
export const isFontsPath = (pathname) => FONTS.test(pathname);

/** /onetrust/* and /logos/*: cdn.cookielaw.org's answer, without cookies either way. */
export async function onetrust(request) {
  const url = new URL(request.url);
  const upstream = onetrustUpstream(url.pathname, url.search);
  const headers = new Headers();
  ['accept', 'accept-encoding', 'accept-language', 'user-agent'].forEach((h) => {
    if (request.headers.has(h)) headers.set(h, request.headers.get(h));
  });
  const resp = await fetch(upstream, {
    method: request.method === 'HEAD' ? 'HEAD' : 'GET', headers, cf: { cacheEverything: true },
  });
  const out = new Response(request.method === 'HEAD' ? null : resp.body, resp);
  out.headers.delete('set-cookie');
  // the edge fetch can hand on one header twice (live: "application/javascript,
  // application/javascript" where cdn.cookielaw.org sends it once): the value once
  ['content-type', 'cache-control'].forEach((h) => {
    const values = String(out.headers.get(h) || '').split(/,\s*/);
    if (values.length > 1 && values.every((v) => v === values[0])) out.headers.set(h, values[0]);
  });
  out.headers.set('x-lh-edge-route', 'onetrust');
  return out;
}

/** The versioned fonts: the origin's answer (passThrough) with an immutable cache-control. */
export async function fonts(request, env, passThrough) {
  const resp = await passThrough(request, env);
  if (resp.status !== 200) return resp;
  const out = new Response(resp.body, resp);
  out.headers.set('cache-control', IMMUTABLE);
  out.headers.delete('cdn-cache-control');
  out.headers.delete('surrogate-control');
  return out;
}

const cookieValue = (request, name) => {
  const m = String(request.headers.get('cookie') || '').match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return m ? m[1] : null;
};

/** The answer with lh-geo=<country> when it is an HTML page and the cookie differs. */
export function withGeoCookie(resp, request) {
  const type = resp.headers.get('content-type') || '';
  if (!type.includes('text/html')) return resp;
  const country = visitorCountry(request).toUpperCase();
  if (!country || cookieValue(request, 'lh-geo') === country) return resp;
  const out = new Response(resp.body, resp);
  out.headers.append('set-cookie', `lh-geo=${country}; Path=/; SameSite=Lax; Secure`);
  return out;
}
