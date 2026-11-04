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
  let resp;
  try {
    resp = await fetchHeaders(`${base}${edsDamPath(info.asset)}`, {
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
  return new Response(empty ? null : resp.body, { status: resp.status, headers: out });
}
