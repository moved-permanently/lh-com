/**
 * /digitalhangar/*: www's design-system files, above all the brand fonts that every www loads from
 * /digitalhangar/design-system/releases/<release>/standalone/fonts/ (styles/fonts.css, the
 * themes), from the host's brand www: a site's SITE_DESIGN_HOSTS host (siteEnv's DESIGN_HOST;
 * Cargo uses Lufthansa's; a site without one doesn't take this route), else WWW_HOST (lh-com's
 * hosts), else www.lufthansa.com. Upstream's status and headers are handed on as they are
 * (cache-control included: www's max-age); a revalidation's conditions go upstream, so its 304
 * comes back.
 * Release files (a folder under releases/ with a version, mausy-v1.40.1): www publishes each
 * release in a folder of its own, so such a file never changes. They are kept in this zone's
 * cache (the Cache API, caches.default) for a year: a fetch of www (another Cloudflare zone) only
 * reads through www's own cache with www's 5 minutes, whatever its cf options say. A miss fetches
 * the whole file (no conditions, no range) and stores only a 200, with cache-control public,
 * max-age=31536000, immutable (www's Expires dropped); the client's request (200, 206 for a
 * Range, 304 for its If-None-Match) is answered from the stored copy (x-lh-edge-cache: hit or
 * miss). Every other answer of www (404, a 403 challenge, 5xx, a redirect) goes out with www's
 * headers and is never stored (x-lh-edge-cache: pass). Without a Cache API (tests, local runs):
 * the request as before, with the year on 200, 206 and 304.
 * No request cookies go upstream; no upstream cookie comes back (www's bot cookies are for www).
 * Files www refuses lh-edge (403: the help center's features and texts, COPIES) answer from our
 * copy when there is one: the site's origin at /digitalhangar-copies/<the path below
 * /digitalhangar/> (committed in the code repository), 200 with the origin's headers
 * (x-lh-edge-copy: origin); without a copy (any other answer) www's answer as before.
 */
import { originFetch } from './edge.js';

export const DIGITALHANGAR = /^\/digitalhangar\/.+$/;
export const DEFAULT_WWW = 'www.lufthansa.com';
// a release folder: v<major>.<minor>.<patch>, optionally after a name (mausy-v1.40.1, v1.38.0)
export const RELEASE = /^\/digitalhangar\/design-system\/releases\/(?:[a-z0-9]+-)*v\d+\.\d+\.\d+\/[^?#]+$/i;
export const YEAR = 'public, max-age=31536000, immutable';
// files www answers lh-edge with 403 (its WAF): the help center's feature switches and texts
// (cs-help-center/feature-manager/<tenant>/, translations/web/<tenant>/, topics/<tenant>/; briefs
// 270, 272)
export const COPIES = /^\/digitalhangar\/cs-help-center\/(?:feature-manager|translations|topics)\/[^?#]+\.json$/;
/** The path of our copy of a /digitalhangar/ file on the site's origin. */
export const copyPath = (pathname) => `/digitalhangar-copies${pathname.slice('/digitalhangar'.length)}`;

/*
 * /etc.clientlibs/ files www refuses to other sites, from our copies only (brief 403): the SWISS
 * magazine's serif (Pensum Pro, www's /etc.clientlibs/swissstoryhub/.../Pensum-Pro-Regular.woff
 * and .woff2) on the sites of ETC_COPY_SITES, from the site's origin at /etc.clientlibs-copies/
 * <the path below /etc.clientlibs/> (committed in the code repository); www is never asked, a
 * missing copy is a 404.
 */
export const ETC_COPIES = /^\/etc\.clientlibs\/swissstoryhub\/clientlibs\/clientlib-site\/resources\/fonts\/Pensum-Pro-Regular\.woff2?$/;
export const ETC_COPY_SITES = ['swiss'];
export const isEtcCopyPath = (pathname) => ETC_COPIES.test(pathname);
/** The path of our copy of an /etc.clientlibs/ file on the site's origin. */
export const etcCopyPath = (pathname) => `/etc.clientlibs-copies${pathname.slice('/etc.clientlibs'.length)}`;

const CLIENT = ['accept', 'accept-encoding', 'accept-language', 'user-agent'];
const CONDITIONS = ['if-modified-since', 'if-none-match', 'range'];
const FORWARDED = [...CLIENT, ...CONDITIONS];
// upstream headers a stored copy doesn't keep (www's cache state, its 5-minute Expires, cookies)
const NOT_STORED = ['set-cookie', 'expires', 'age', 'cf-cache-status', 'cf-ray'];

export const isDigitalhangarPath = (pathname) => DIGITALHANGAR.test(pathname);
export const isReleasePath = (pathname) => RELEASE.test(pathname);

/** The www URL of a /digitalhangar/ request. */
export function digitalhangarUpstream(url, env = {}) {
  const host = String(env.DESIGN_HOST || env.WWW_HOST || '').trim() || DEFAULT_WWW;
  return `https://${host}${url.pathname}${url.search}`;
}

const pick = (request, names) => {
  const headers = new Headers();
  names.forEach((h) => {
    if (request.headers.has(h)) headers.set(h, request.headers.get(h));
  });
  return headers;
};

/** The answer to the client: no body for HEAD, no cookies, a release file's 2xx/304 the year. */
function toClient(request, resp, release, state) {
  const out = new Response(request.method === 'HEAD' ? null : resp.body, resp);
  out.headers.delete('set-cookie');
  if (release && [200, 206, 304].includes(resp.status)) {
    out.headers.set('cache-control', YEAR);
    out.headers.delete('expires');
  }
  if (state) out.headers.set('x-lh-edge-cache', state);
  out.headers.set('x-lh-edge-route', 'digitalhangar');
  return out;
}

/** A release file from this zone's cache, else from www (stored when www answers 200). */
async function releaseFile(request, upstream, url, cache) {
  // the request's host and the upstream host in the key: each host's copy of its www's file
  const key = `${url.origin}${url.pathname}?digitalhangar-release=1&from=${encodeURIComponent(new URL(upstream).host)}`;
  const ask = () => new Request(key, { headers: pick(request, CONDITIONS) });
  const hit = await cache.match(ask());
  if (hit) return toClient(request, hit, true, 'hit');
  const resp = await fetch(upstream, {
    method: 'GET', headers: pick(request, CLIENT), redirect: 'manual', cf: { cacheEverything: true },
  });
  if (resp.status !== 200) return toClient(request, resp, false, 'pass');
  const stored = new Response(resp.body, resp);
  NOT_STORED.forEach((h) => stored.headers.delete(h));
  stored.headers.set('cache-control', YEAR);
  await cache.put(key, stored.clone());
  // the client's own request (its Range, its If-None-Match) against the stored copy
  const again = await cache.match(ask());
  return toClient(request, again || stored, true, 'miss');
}

/** Our copy of a COPIES file from the site's origin (200), else null. */
async function ownCopy(request, env, url) {
  if (!COPIES.test(url.pathname) || !env.ORIGIN) return null;
  const get = new Request(request.url, { method: request.method === 'HEAD' ? 'HEAD' : 'GET', headers: pick(request, CLIENT) });
  const resp = await originFetch(get, env, `https://${env.ORIGIN}${copyPath(url.pathname)}`);
  if (resp.status !== 200) {
    if (resp.body) resp.body.cancel().catch(() => {});
    return null;
  }
  const out = new Response(request.method === 'HEAD' ? null : resp.body, resp);
  out.headers.delete('set-cookie');
  out.headers.set('x-lh-edge-route', 'digitalhangar');
  out.headers.set('x-lh-edge-copy', 'origin');
  return out;
}

/** An ETC_COPIES file from our copy on the site's origin (its status and headers), never www. */
export async function etcClientlibsCopy(request, env) {
  const url = new URL(request.url);
  const get = new Request(request.url, { method: request.method === 'HEAD' ? 'HEAD' : 'GET', headers: pick(request, FORWARDED) });
  const resp = await originFetch(get, env, `https://${env.ORIGIN}${etcCopyPath(url.pathname)}`);
  const ok = resp.status === 200 || resp.status === 304 || resp.status === 206;
  if (!ok && resp.body) resp.body.cancel().catch(() => {});
  const out = ok
    ? new Response(request.method === 'HEAD' ? null : resp.body, resp)
    : new Response('Not Found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  out.headers.delete('set-cookie');
  out.headers.set('x-lh-edge-route', 'etc-clientlibs');
  if (ok) out.headers.set('x-lh-edge-copy', 'origin');
  return out;
}

/** /digitalhangar/*: our copy of a file www refuses lh-edge, else the brand www's answer. */
export async function digitalhangar(request, env) {
  const url = new URL(request.url);
  const copy = await ownCopy(request, env, url);
  if (copy) return copy;
  const upstream = digitalhangarUpstream(url, env);
  const release = isReleasePath(url.pathname);
  const cache = typeof caches !== 'undefined' ? caches.default : null;
  if (release && cache) return releaseFile(request, upstream, url, cache);
  const resp = await fetch(upstream, {
    method: request.method === 'HEAD' ? 'HEAD' : 'GET', headers: pick(request, FORWARDED), redirect: 'manual', cf: { cacheEverything: true },
  });
  return toClient(request, resp, release, null);
}
