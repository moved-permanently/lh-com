/**
 * /digitalhangar/*: www's design-system files, above all the brand fonts that every www loads from
 * /digitalhangar/design-system/releases/<release>/standalone/fonts/ (styles/fonts.css, the
 * themes), from the host's brand www: a site's SITE_DESIGN_HOSTS host (siteEnv's DESIGN_HOST;
 * Cargo uses Lufthansa's; a site without one doesn't take this route), else WWW_HOST (lh-com's
 * hosts), else www.lufthansa.com. Upstream's status and headers are handed on as they are
 * (cache-control included: www's max-age), cached at the edge for that cache-control
 * (cacheEverything); a revalidation's conditions go upstream, so its 304 comes back.
 * Release files (a folder under releases/ with a version, mausy-v1.40.1): www publishes each
 * release in a folder of its own, so such a file never changes; its 200, 206 and 304 answers get
 * a year in the browser (immutable, without www's Expires), 2xx a year at the edge
 * (cf.cacheTtlByStatus), every other answer (404, a 403 challenge, 5xx, a redirect) www's headers
 * and no edge copy at all.
 * No request cookies go upstream; no upstream cookie comes back (www's bot cookies are for www).
 */
export const DIGITALHANGAR = /^\/digitalhangar\/.+$/;
export const DEFAULT_WWW = 'www.lufthansa.com';
// a release folder: v<major>.<minor>.<patch>, optionally after a name (mausy-v1.40.1, v1.38.0)
export const RELEASE = /^\/digitalhangar\/design-system\/releases\/(?:[a-z0-9]+-)*v\d+\.\d+\.\d+\/[^?#]+$/i;
export const YEAR = 'public, max-age=31536000, immutable';
// the edge: 2xx a year; anything from 300 to 599 never kept (a negative TTL: not cached)
const RELEASE_EDGE = { cacheEverything: true, cacheTtlByStatus: { '200-299': 31536000, '300-599': -1 } };

const FORWARDED = ['accept', 'accept-encoding', 'accept-language', 'user-agent', 'if-modified-since', 'if-none-match', 'range'];

export const isDigitalhangarPath = (pathname) => DIGITALHANGAR.test(pathname);
export const isReleasePath = (pathname) => RELEASE.test(pathname);

/** The www URL of a /digitalhangar/ request. */
export function digitalhangarUpstream(url, env = {}) {
  const host = String(env.DESIGN_HOST || env.WWW_HOST || '').trim() || DEFAULT_WWW;
  return `https://${host}${url.pathname}${url.search}`;
}

/** /digitalhangar/*: the brand www's answer. */
export async function digitalhangar(request, env) {
  const url = new URL(request.url);
  const upstream = digitalhangarUpstream(url, env);
  const release = isReleasePath(url.pathname);
  const headers = new Headers();
  FORWARDED.forEach((h) => {
    if (request.headers.has(h)) headers.set(h, request.headers.get(h));
  });
  const resp = await fetch(upstream, {
    method: request.method === 'HEAD' ? 'HEAD' : 'GET', headers, redirect: 'manual', cf: release ? RELEASE_EDGE : { cacheEverything: true },
  });
  const out = new Response(request.method === 'HEAD' ? null : resp.body, resp);
  out.headers.delete('set-cookie');
  if (release && [200, 206, 304].includes(resp.status)) {
    out.headers.set('cache-control', YEAR);
    out.headers.delete('expires');
  }
  out.headers.set('x-lh-edge-route', 'digitalhangar');
  return out;
}
