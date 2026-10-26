/**
 * www's videos and subtitles that Edge Delivery can't hold (mp4 over 36 MB, every .vtt): objects
 * of the R2 bucket bound as DAM_MEDIA (bucket name in wrangler.toml), key = the Edge Delivery
 * name of the www path without the leading slash (scripts/dam-path.js edsDamPath, the same as the
 * DA copies). A DAM step (src/dam.js DAM_STEPS): it answers when the object exists, otherwise the
 * request goes on to the next steps and the DA copies.
 * - .vtt: text/vtt; charset=utf-8; .mp4: video/mp4 with range requests (206, content-range,
 *   accept-ranges: bytes): browsers seek in videos.
 * - cache-control public, max-age=2592000, as the other DAM answers; etag and last-modified of
 *   the object.
 */
/* eslint-disable import/no-relative-packages */
import { edsDamPath } from '../../../../scripts/dam-path.js';
/* eslint-enable import/no-relative-packages */

// the file types kept in R2 (no lookup for images and documents: they live in DA)
export const MEDIA_TYPES = {
  mp4: 'video/mp4',
  vtt: 'text/vtt; charset=utf-8',
};

/** The R2 key of a www DAM asset path. */
export const mediaKey = (asset) => edsDamPath(asset).replace(/^\/+/, '');

/** The byte range of a Range header for an object of `size` bytes, or null (whole object). */
export function parseRange(header, size) {
  const m = String(header || '').match(/^bytes=(\d*)-(\d*)$/);
  if (!m || (m[1] === '' && m[2] === '')) return null;
  let start;
  let end;
  if (m[1] === '') {
    const suffix = Math.min(Number(m[2]), size);
    start = size - suffix;
    end = size - 1;
  } else {
    start = Number(m[1]);
    end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
  }
  if (start > end || start >= size) return { invalid: true };
  return { offset: start, length: end - start + 1 };
}

/** The DAM step. */
export async function damMedia(request, env, ctx, info) {
  if (!env.DAM_MEDIA || info.rendition || !info.valid) return null;
  const ext = (info.asset.match(/\.([a-z0-9]+)$/i) || [])[1]?.toLowerCase();
  const type = MEDIA_TYPES[ext];
  if (!type) return null;
  const key = mediaKey(info.asset);
  const head = await env.DAM_MEDIA.head(key);
  if (!head) return null;
  const headers = new Headers({
    'content-type': type,
    'cache-control': 'public, max-age=2592000',
    'accept-ranges': 'bytes',
    'x-lh-edge-route': 'dam-media',
  });
  if (head.httpEtag) headers.set('etag', head.httpEtag);
  if (head.uploaded) headers.set('last-modified', new Date(head.uploaded).toUTCString());
  const range = parseRange(request.headers.get('range'), head.size);
  if (range && range.invalid) {
    headers.set('content-range', `bytes */${head.size}`);
    return new Response(null, { status: 416, headers });
  }
  if (request.method === 'HEAD') {
    headers.set('content-length', String(range ? range.length : head.size));
    if (range) headers.set('content-range', `bytes ${range.offset}-${range.offset + range.length - 1}/${head.size}`);
    return new Response(null, { status: range ? 206 : 200, headers });
  }
  const object = await env.DAM_MEDIA.get(key, range ? { range } : {});
  if (!object) return null;
  headers.set('content-length', String(range ? range.length : head.size));
  if (range) headers.set('content-range', `bytes ${range.offset}-${range.offset + range.length - 1}/${head.size}`);
  return new Response(object.body, { status: range ? 206 : 200, headers });
}
