/**
 * www's large DAM files from an AEM as a Cloud Service publish tier (var AEM_PUBLISH, its origin;
 * empty: off), ahead of the R2 copies (src/dam-media.js): the files Edge Delivery can't hold are
 * published there under the same names (scripts/dam-path.js edsDamPath, the R2 key with its
 * leading slash). A DAM step (src/dam.js DAM_STEPS):
 * - GET and HEAD of a valid asset path without rendition: .mp4 and .vtt always; .pdf only when R2
 *   has the key (most PDFs live in DA: no AEM round trip for them).
 * - The AEM request has the same method and only range, if-none-match and if-modified-since; its
 *   headers must arrive within AEM_HEADER_TIMEOUT_MS, the body is streamed (an 869 MB video, the
 *   10 ms CPU limit of Workers Free).
 * - Used when AEM answers 200 or 206 with the file's media type, 304 or 416. Anything else (404,
 *   5xx, a timeout, a network error, and a hibernated sandbox's 200 text/html page for every path)
 *   is null: the R2 step answers as before. So is a 200 to a request with a Range header: R2
 *   answers the range (206).
 * - The subrequest goes past Cloudflare's cache (cache: 'no-store'): on a cold miss Cloudflare's
 *   cache fetches the whole file without the Range and answers 200 with all of it (Cloudflare's
 *   "Range request behavior"), and a file over the 512 MB cacheable size (Free to Business) is
 *   never stored, so the 869 MB video's first range request in a data centre got 869 MB. The
 *   publish tier's own CDN still caches (it ignores the request's no-cache headers).
 * - Headers as the R2 step's: content-type of MEDIA_TYPES, cache-control public, max-age=2592000,
 *   accept-ranges bytes; content-length, content-range, etag and last-modified from AEM; no other
 *   AEM header. x-lh-edge-route: dam-aem.
 */
import { MEDIA_TYPES, mediaKey } from './dam-media.js';
/* eslint-disable import/no-relative-packages */
import { edsDamPath } from '../../../../scripts/dam-path.js';
/* eslint-enable import/no-relative-packages */

/** How long AEM may take for its response headers before R2 answers. */
export const AEM_HEADER_TIMEOUT_MS = 5000;
const FORWARD = ['range', 'if-none-match', 'if-modified-since'];
const KEEP = ['content-length', 'content-range', 'etag', 'last-modified'];

/** The R2 head of an asset, once per request (the R2 step reads the same). */
export function mediaHead(env, info) {
  if (!env.DAM_MEDIA) return Promise.resolve(null);
  if (!info.mediaHead) info.mediaHead = env.DAM_MEDIA.head(mediaKey(info.asset));
  return info.mediaHead;
}

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

/** The DAM step. */
export async function damAem(request, env, ctx, info) {
  const base = String(env.AEM_PUBLISH || '').trim().replace(/\/+$/, '');
  if (!base || info.rendition || !info.valid) return null;
  if (request.method !== 'GET' && request.method !== 'HEAD') return null;
  const ext = (info.asset.match(/\.([a-z0-9]+)$/i) || [])[1]?.toLowerCase();
  const type = MEDIA_TYPES[ext];
  if (!type) return null;
  if (ext === 'pdf' && !(await mediaHead(env, info))) return null;
  const headers = new Headers();
  FORWARD.forEach((h) => { if (request.headers.has(h)) headers.set(h, request.headers.get(h)); });
  let resp;
  try {
    resp = await fetchHeaders(`${base}${edsDamPath(info.asset)}`, {
      method: request.method, headers, redirect: 'manual', cache: 'no-store',
    }, Number(env.AEM_HEADER_TIMEOUT_MS) || AEM_HEADER_TIMEOUT_MS);
  } catch (e) {
    return null;
  }
  const got = (resp.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
  // a 200 to a range request (the whole file) is no answer: R2 answers the range
  const whole = resp.status === 200 && request.headers.has('range');
  const usable = (((resp.status === 200 && !whole) || resp.status === 206) && got === type.split(';')[0])
    || resp.status === 304 || resp.status === 416;
  if (!usable) {
    if (resp.body) resp.body.cancel().catch(() => {});
    return null;
  }
  const out = new Headers({
    'content-type': type,
    'cache-control': 'public, max-age=2592000',
    'accept-ranges': 'bytes',
    'x-lh-edge-route': 'dam-aem',
  });
  KEEP.forEach((h) => { if (resp.headers.has(h)) out.set(h, resp.headers.get(h)); });
  const empty = request.method === 'HEAD' || resp.status === 304;
  if (empty && resp.body) resp.body.cancel().catch(() => {});
  return new Response(empty ? null : resp.body, { status: resp.status, headers: out });
}
