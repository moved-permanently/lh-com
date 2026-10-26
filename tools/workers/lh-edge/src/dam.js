/**
 * www's DAM URLs (/content/dam/...): the copies in Document Authoring
 * (tools/importer/dam-copy.mjs), served from the Edge Delivery origin under the names of
 * scripts/dam-path.js (the same function the copy script and the site use). README "DAM URLs".
 *
 * - The path is decoded first (%20, %27, umlauts), then named as Edge Delivery names it.
 * - Renditions .../x.jpg.transform/lh-dcep-transform-width-<n>/img.<ext>: the media of x.jpg with
 *   width (180 ... 2560; 2880 with height), format (webply, jpeg; png: none) and optimize=medium;
 *   any other rendition name answers 404, as www. Originals: the original file. Requests in the
 *   site's own form (/content/dam/<name>?width=...) keep their media parameters.
 * - Edge Delivery answers the asset path with a 301 to its media; lh-edge follows it and returns
 *   the bytes: cache-control public, max-age=2592000 (30 days); 404 max-age=60.
 * - A missing image below /content/dam/<tenant>/images/offers/ (lh, lx, bel, four_y, ita,
 *   austrian/global) answers 302 as www: to /content/dam/lufthansa-group/images/destination/
 *   <name>.jpg when that exists (not for ita and four_y), else to the tenant's
 *   images/offers/fallback/generic<suffix>.jpg (suffix: from the last "-" of the name,
 *   "zzq-square" -> "-square"), with the rendition kept. www sends the other airlines' fallbacks
 *   to their own sites (www.swiss.com ...); Lufthansa's stay on the request's host.
 * - DAM_STEPS run first (a step returns a Response or null): for paths another source answers
 *   (the synced brand assets of /content/dam/<tenant>/images/frontify/..., a later package).
 */
import { originFetch } from './edge.js';
// the site's own module: one naming rule for the site, the copies and the Worker (wrangler
// bundles it)
/* eslint-disable import/no-relative-packages */
import {
  parseDamPath, edsDamPath, renditionParams, decodePath,
} from '../../../../scripts/dam-path.js';
/* eslint-enable import/no-relative-packages */

export const isDamPath = (pathname) => pathname.startsWith('/content/dam/');

/** Steps before the copies: async (request, env, ctx, dam) => Response | null. */
export const DAM_STEPS = [];

const ASSET_CACHE = 'public, max-age=2592000';
const NOT_FOUND_CACHE = 'public, max-age=60';
const MEDIA_PARAMS = ['width', 'height', 'format', 'optimize'];
const OFFERS = /^\/content\/dam\/(lh|lx|bel|four_y|ita|austrian\/global)\/images\/offers\/(?:(.+)\/)?([^/]+)\.jpg$/i;
// where www sends a tenant's fallback image (lh: the request's own host)
const TENANT_HOSTS = {
  lx: 'www.swiss.com',
  bel: 'www.brusselsairlines.com',
  four_y: 'www.discover-airlines.com',
  ita: 'www.ita-airways.com',
  'austrian/global': 'www.austrian.com',
};
const NO_DESTINATION_FALLBACK = ['ita', 'four_y'];
// headers of the origin's answer that a DAM file keeps
const KEEP = ['content-type', 'content-length', 'last-modified', 'etag', 'accept-ranges', 'content-range'];

function notFound(request) {
  return new Response(request.method === 'HEAD' ? null : 'Not Found', {
    status: 404,
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': NOT_FOUND_CACHE,
      'x-lh-edge-route': 'dam',
    },
  });
}

/**
 * The origin's answer for an Edge Delivery path, with its 301/302 to the media followed (at most
 * three hops, same origin only).
 */
export async function fetchDamAsset(request, env, edsPath, params) {
  const get = new Request(request.url, {
    method: request.method === 'HEAD' ? 'HEAD' : 'GET', headers: request.headers, redirect: 'manual',
  });
  let url = new URL(`https://${env.ORIGIN}${edsPath}`);
  if (params && [...params.keys()].length) url.search = params.toString();
  for (let hop = 0; hop < 4; hop += 1) {
    // eslint-disable-next-line no-await-in-loop
    const resp = await originFetch(get, env, url);
    const location = resp.headers.get('location');
    if (![301, 302, 307, 308].includes(resp.status) || !location) return resp;
    const next = new URL(location, url);
    if (next.origin !== url.origin) return resp;
    url = next;
  }
  return new Response('Too many redirects', { status: 508 });
}

function assetResponse(request, resp) {
  const headers = new Headers({ 'cache-control': ASSET_CACHE, 'x-lh-edge-route': 'dam' });
  KEEP.forEach((h) => { if (resp.headers.has(h)) headers.set(h, resp.headers.get(h)); });
  return new Response(request.method === 'HEAD' ? null : resp.body, { status: resp.status, headers });
}

function redirect(location) {
  return new Response(null, {
    status: 302,
    headers: { location, 'cache-control': ASSET_CACHE, 'x-lh-edge-route': 'dam' },
  });
}

/** www's answer for a missing offers image: the 302 target, or null. */
async function offersFallback(request, env, asset, renditionSuffix) {
  const m = asset.match(OFFERS);
  if (!m) return null;
  const [, tenant, folder = '', name] = m;
  if (/^fallback(\/|$)/i.test(folder)) return null; // the fallback itself is missing
  const self = new URL(request.url).origin;
  if (!NO_DESTINATION_FALLBACK.includes(tenant.toLowerCase())) {
    const destination = `/content/dam/lufthansa-group/images/destination/${name}.jpg`;
    const head = new Request(request.url, { method: 'HEAD', headers: request.headers, redirect: 'manual' });
    const found = await fetchDamAsset(head, env, edsDamPath(destination));
    if (found.status === 200) return `${self}${destination}${renditionSuffix}`;
  }
  const dash = name.lastIndexOf('-');
  const suffix = dash >= 0 ? name.slice(dash) : '';
  const host = TENANT_HOSTS[tenant.toLowerCase()];
  const fallback = `/content/dam/${tenant}/images/offers/fallback/generic${suffix}.jpg${renditionSuffix}`;
  return host ? `https://${host}${fallback}` : `${self}${fallback}`;
}

/** The /content/dam/* route. */
export async function dam(request, env, ctx) {
  const url = new URL(request.url);
  const parsed = parseDamPath(url.pathname);
  const info = { ...parsed, url };
  for (let i = 0; i < DAM_STEPS.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const answer = await DAM_STEPS[i](request, env, ctx, info);
    if (answer) return answer;
  }
  if (!parsed.valid) return notFound(request);
  let params;
  if (parsed.rendition) params = renditionParams(parsed.rendition);
  else {
    params = new URLSearchParams();
    MEDIA_PARAMS.filter((k) => url.searchParams.has(k))
      .forEach((k) => params.set(k, url.searchParams.get(k)));
  }
  const resp = await fetchDamAsset(request, env, edsDamPath(parsed.asset), params);
  if (resp.status === 200 || resp.status === 206) return assetResponse(request, resp);
  if (resp.status === 404) {
    const raw = decodePath(url.pathname);
    // the rendition, or the site's own media parameters, go with the redirect
    const suffix = parsed.rendition ? raw.slice(parsed.asset.length) : url.search;
    const target = await offersFallback(request, env, parsed.asset, suffix);
    if (target) return redirect(target);
    return notFound(request);
  }
  return resp;
}
