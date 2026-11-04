/**
 * www's large DAM files from an AEM as a Cloud Service publish tier (var AEM_PUBLISH, its origin;
 * empty: off), the only source of the files Edge Delivery can't hold (mp4 over 36 MB, every
 * .vtt, PDFs over 20 MB) and of the files authors pick from the AEM Assets sandbox in DA's "AEM
 * Assets" panel (links https://<brand host>/content/dam/<their AEM path>, brief 334): they are
 * published there under the same names (scripts/dam-path.js edsDamPath). A DAM step (src/dam.js
 * DAM_STEPS):
 * - GET and HEAD of a valid asset path without rendition, of a type the publish tier's
 *   dispatcher serves under /content (MEDIA_TYPES; html stays out): .mp4 and .vtt first (before
 *   DA); every other type (AFTER_DA) only after the DA copies answered 404 (src/dam.js:
 *   info.afterDa; a file DA serves costs no AEM call). Not with the site's own media parameters
 *   (?width=, info.mediaParams: DA's renditions) and not for www's offers images (src/dam.js:
 *   their fallback).
 * - The AEM request has the same method and only range, if-none-match and if-modified-since; its
 *   headers must arrive within AEM_HEADER_TIMEOUT_MS (30 s: a cold publish tier takes 10-20 s for
 *   its first answers, then about 0.5 s; a cold file loads slowly instead of failing). The body
 *   is streamed (an 869 MB video, the 10 ms CPU limit of Workers Free).
 * - Used when AEM answers 200 or 206 with the file's media type or one of its other names
 *   (ACCEPTED: text/javascript for .js, image/vnd.microsoft.icon for .ico …; a 200 to a request
 *   with a Range header too: the whole file, valid HTTP, players handle it), 304 or 416.
 * - Not there: 404 (also 403, 410): null, the DA copies answer (the mp4s up to 36 MB live there),
 *   else the route's 404.
 * - Unavailable: a 200 or 206 of another type (a hibernated environment answers every path with
 *   a 200 text/html page), 5xx, a timeout, a network error: null with info.aemUnavailable, and the
 *   route answers aemUnavailable() (503, Retry-After: 120, no-store, x-lh-edge-route:
 *   dam-aem-unavailable) unless the DA copies have the file; never AEM's page.
 * - The subrequest goes past Cloudflare's cache (cache: 'no-store'): on a cold miss Cloudflare's
 *   cache fetches the whole file without the Range and answers 200 with all of it (Cloudflare's
 *   "Range request behavior"), and a file over the 512 MB cacheable size (Free to Business) is
 *   never stored. The publish tier's own CDN still caches (it ignores the request's no-cache
 *   headers).
 * - This zone's cache (brief 355; the Cache API, caches.default; var DAM_AEM_CACHE "off": none):
 *   AEM's real file answers are kept, so a file nobody asked for in an hour (AEM's CDN forgets
 *   it; the next answer took 10-30 s) answers at once. One key per file for every host
 *   (damCacheKey: https://lufthansa.turnsthe.page/.lh-edge-cache/dam-aem/<EDGE_CACHE_VERSION>
 *   <the AEM path>), kept 30 days (the stored copy's cache-control, the visitors' max-age=2592000;
 *   Cloudflare may drop it sooner). Stored: only a 200 with the file's media type and a
 *   content-length up to 512 MB (DAM_CACHE_MAX_BYTES; the 869 MB video stays as before), never
 *   the hibernation page, a 304, a 206, a 5xx or a timeout. A hit answers the client's own
 *   request from the stored file (its Range as 206, its If-None-Match as 304), no AEM request,
 *   x-lh-edge-cache: hit. A miss answers as before (x-lh-edge-cache: miss) and stores the file: a
 *   200 up to 8 MB on the way (the body teed), a larger one or a Range's 206 by one whole-file GET
 *   in the background (ctx.waitUntil; one per file and isolate at a time; a fill cut short by the
 *   Worker's limits stores nothing and the next miss tries again). Drop one file (a replaced
 *   one): purge its key URL above (Cloudflare's purge by URL, 5 a minute on the Free plan), or
 *   wait the 30 days; drop them all: a new EDGE_CACHE_VERSION and a deploy.
 * - Headers: content-type of MEDIA_TYPES, cache-control public, max-age=2592000, accept-ranges
 *   bytes; content-length, content-range, etag and last-modified from AEM; no other AEM header;
 *   an SVG content-security-policy script-src 'none' (it can't run scripts on our hosts).
 *   x-lh-edge-route: dam-aem.
 */
/* eslint-disable import/no-relative-packages */
import { edsDamPath } from '../../../../scripts/dam-path.js';
/* eslint-enable import/no-relative-packages */

/**
 * The file types on the publish tier (its dispatcher's under /content) and the media type each is
 * answered with.
 */
export const MEDIA_TYPES = {
  mp4: 'video/mp4',
  vtt: 'text/vtt; charset=utf-8',
  pdf: 'application/pdf',
  css: 'text/css; charset=utf-8',
  eot: 'application/vnd.ms-fontobject',
  gif: 'image/gif',
  ico: 'image/x-icon',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  js: 'application/javascript',
  m4v: 'video/x-m4v',
  mov: 'video/quicktime',
  png: 'image/png',
  svg: 'image/svg+xml',
  swf: 'application/x-shockwave-flash',
  ttf: 'font/ttf',
  woff: 'font/woff',
  woff2: 'font/woff2',
};

/** The other names a publish tier gives these types (the answer counts as the file then). */
const ACCEPTED = {
  ico: ['image/vnd.microsoft.icon'],
  jpeg: ['image/jpg'],
  jpg: ['image/jpg'],
  js: ['text/javascript', 'application/x-javascript'],
  m4v: ['video/mp4'],
  swf: ['application/vnd.adobe.flash.movie'],
  ttf: ['application/x-font-ttf', 'application/x-font-truetype', 'font/sfnt', 'application/font-sfnt'],
  woff: ['application/font-woff', 'application/x-font-woff'],
  woff2: ['application/font-woff2'],
};

/** The types asked of AEM only after the DA copies answered 404 (all but mp4 and vtt). */
export const AFTER_DA = new Set(Object.keys(MEDIA_TYPES).filter((x) => !['mp4', 'vtt'].includes(x)));

/** The extension of an asset path, lower case ('' without one). */
export const extOf = (asset) => ((String(asset).match(/\.([a-z0-9]+)$/i) || [])[1] || '').toLowerCase();

/** The largest file kept in the zone's cache (Cloudflare's cacheable size, Free to Business). */
export const DAM_CACHE_MAX_BYTES = 512 * 1024 * 1024;
// up to this size a miss's 200 is stored on the way (teed); larger files by a background GET, as a
// teed body would be buffered in memory while the visitor reads slower than the cache
const TEE_MAX_BYTES = 8 * 1024 * 1024;
const CACHE_HOST = 'https://lufthansa.turnsthe.page';
const VISITORS = 'public, max-age=2592000';

/** The zone cache's key of an asset: one per file for every host, versioned. */
export function damCacheKey(asset, env = {}) {
  const version = String(env.EDGE_CACHE_VERSION ?? '').trim() || '0';
  return `${CACHE_HOST}/.lh-edge-cache/dam-aem/${encodeURIComponent(version)}${edsDamPath(asset)}`;
}

/** The file's whole size from an answer: a 200's content-length, a 206's content-range total. */
function totalOf(resp) {
  if (resp.status === 206) return Number(((resp.headers.get('content-range') || '').match(/\/(\d+)$/) || [])[1]) || 0;
  return Number(resp.headers.get('content-length')) || 0;
}

/** The headers a stored copy keeps: our media type and cache-control, AEM's file headers. */
function storedHeaders(resp, type, ext) {
  const out = new Headers({ 'content-type': type, 'cache-control': VISITORS, 'accept-ranges': 'bytes' });
  ['content-length', 'etag', 'last-modified'].forEach((h) => { if (resp.headers.has(h)) out.set(h, resp.headers.get(h)); });
  if (ext === 'svg') out.set('content-security-policy', "script-src 'none'");
  return out;
}

// the background fills running in this isolate, by key (a player's many ranges: one fill)
const filling = new Map();

/** Stores a file's body under its key (errors and a cut-short body store nothing). */
function store(cache, key, body, resp, type, ext) {
  const copy = new Response(body, { status: 200, headers: storedHeaders(resp, type, ext) });
  return cache.put(key, copy).catch(() => {});
}

/** One whole-file GET of AEM, stored when it is the file (200, its type, a length in the limit). */
function fill(cache, key, url, names, type, ext) {
  if (filling.has(key)) return filling.get(key);
  const run = (async () => {
    try {
      const resp = await fetch(url, { method: 'GET', redirect: 'manual', cache: 'no-store' });
      const got = (resp.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
      const size = totalOf(resp);
      if (resp.status !== 200 || !names.includes(got) || !size || size > DAM_CACHE_MAX_BYTES) {
        if (resp.body) resp.body.cancel().catch(() => {});
        return;
      }
      await store(cache, key, resp.body, resp, type, ext);
    } catch (e) {
      // the next miss tries again
    } finally {
      filling.delete(key);
    }
  })();
  filling.set(key, run);
  return run;
}

/** The client's answer from a stored copy (its own Range, If-None-Match, If-Modified-Since). */
function fromCache(request, hit) {
  const out = new Headers(hit.headers);
  out.set('cache-control', VISITORS);
  out.set('x-lh-edge-route', 'dam-aem');
  out.set('x-lh-edge-cache', 'hit');
  const empty = request.method === 'HEAD' || hit.status === 304;
  if (empty && hit.body) hit.body.cancel().catch(() => {});
  return new Response(empty ? null : hit.body, { status: hit.status, headers: out });
}

/** How long AEM may take for its response headers. */
export const AEM_HEADER_TIMEOUT_MS = 30000;
const FORWARD = ['range', 'if-none-match', 'if-modified-since'];
const KEEP = ['content-length', 'content-range', 'etag', 'last-modified'];
const NOT_THERE = [403, 404, 410];

/** fetch with a time limit on the response headers (the body is not limited). */
async function fetchHeaders(url, init, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** The answer when the publish tier can't answer and DA has no copy. */
export function aemUnavailable(request) {
  return new Response(request.method === 'HEAD' ? null : 'Service Unavailable', {
    status: 503,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'retry-after': '120',
      'cache-control': 'no-store',
      'x-lh-edge-route': 'dam-aem-unavailable',
    },
  });
}

/** The DAM step. */
export async function damAem(request, env, ctx, info) {
  const base = String(env.AEM_PUBLISH || '').trim().replace(/\/+$/, '');
  if (!base || info.rendition || !info.valid || info.mediaParams) return null;
  if (request.method !== 'GET' && request.method !== 'HEAD') return null;
  const ext = extOf(info.asset);
  const type = MEDIA_TYPES[ext];
  if (!type) return null;
  // every type but mp4 and vtt: after DA (src/dam.js), mp4 and vtt: before it
  if (AFTER_DA.has(ext) !== Boolean(info.afterDa)) return null;
  const headers = new Headers();
  FORWARD.forEach((h) => { if (request.headers.has(h)) headers.set(h, request.headers.get(h)); });
  // the zone's cache first (brief 355): a stored file answers without AEM
  const cached = String(env.DAM_AEM_CACHE || '').trim() !== 'off' && typeof caches !== 'undefined';
  const cache = cached ? caches.default : null;
  const key = cache && damCacheKey(info.asset, env);
  if (cache) {
    const hit = await cache.match(new Request(key, { headers })).catch(() => null);
    if (hit) return fromCache(request, hit);
  }
  const url = `${base}${edsDamPath(info.asset)}`;
  let resp;
  try {
    resp = await fetchHeaders(url, {
      method: request.method, headers, redirect: 'manual', cache: 'no-store',
    }, Number(env.AEM_HEADER_TIMEOUT_MS) || AEM_HEADER_TIMEOUT_MS);
  } catch (e) {
    // a timeout or a network error
    info.aemUnavailable = true;
    return null;
  }
  const got = (resp.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  const names = [type.split(';')[0], ...(ACCEPTED[ext] || [])];
  const file = (resp.status === 200 || resp.status === 206) && names.includes(got);
  if (!file && resp.status !== 304 && resp.status !== 416) {
    if (resp.body) resp.body.cancel().catch(() => {});
    if (!NOT_THERE.includes(resp.status)) info.aemUnavailable = true;
    return null;
  }
  const out = new Headers({
    'content-type': type,
    'cache-control': 'public, max-age=2592000',
    'accept-ranges': 'bytes',
    'x-lh-edge-route': 'dam-aem',
  });
  KEEP.forEach((h) => { if (resp.headers.has(h)) out.set(h, resp.headers.get(h)); });
  if (ext === 'svg') out.set('content-security-policy', "script-src 'none'");
  const empty = request.method === 'HEAD' || resp.status === 304;
  if (empty && resp.body) resp.body.cancel().catch(() => {});
  let body = empty ? null : resp.body;
  // a miss: the file into the zone's cache, on the way (a small 200) or in the background
  const size = file ? totalOf(resp) : 0;
  if (cache && request.method === 'GET' && file && size && size <= DAM_CACHE_MAX_BYTES) {
    out.set('x-lh-edge-cache', 'miss');
    const later = ctx && ctx.waitUntil ? (p) => ctx.waitUntil(p) : null;
    if (later && resp.status === 200 && size <= TEE_MAX_BYTES && body) {
      const [client, stored] = body.tee();
      body = client;
      later(store(cache, key, stored, resp, type, ext));
    } else if (later) {
      later(fill(cache, key, url, names, type, ext));
    }
  } else if (cache && file) {
    out.set('x-lh-edge-cache', 'pass');
  }
  return new Response(body, { status: resp.status, headers: out });
}
