/**
 * Pass-through to the Edge Delivery origin, after Adobe's reference Worker
 * (https://github.com/adobe/aem-cloudflare-prod-worker, src/index.mjs): the same query parameter
 * rules, origin headers, redirect and 304 handling. Deviations (README "Deviations"):
 * - X-Forwarded-Host comes from the var PUBLIC_HOST (fallback: the request's host), as the
 *   Worker answers on several hosts (workers.dev, the demo host) for one public site;
 * - the origin var is ORIGIN (the reference: ORIGIN_HOSTNAME);
 * - originFetch() is also used by the compatibility routes (solo pages, the alias sheet).
 */

const getExtension = (path) => {
  const basename = path.split('/').pop();
  const pos = basename.lastIndexOf('.');
  return (basename === '' || pos < 1) ? '' : basename.slice(pos + 1);
};

export const isMediaRequest = (url) => /\/media_[0-9a-f]{40,}[/a-zA-Z0-9_-]*\.[0-9a-z]+$/.test(url.pathname);
const isRUMRequest = (url) => /\/\.(rum|optel)\/.*/.test(url.pathname);

/**
 * The checks the reference runs before anything else: other ports redirect to 443, /drafts/ is
 * not served, RUM only takes GET, POST and OPTIONS.
 * @returns {Response|null} an answer, or null to go on
 */
export function prelude(request) {
  const url = new URL(request.url);
  if (url.port) {
    const redirectTo = new URL(request.url);
    redirectTo.port = '';
    return new Response(`Moved permanently to ${redirectTo.href}`, {
      status: 301,
      headers: { location: redirectTo.href },
    });
  }
  if (url.pathname.startsWith('/drafts/')) return new Response('Not Found', { status: 404 });
  if (isRUMRequest(url) && !['GET', 'POST', 'OPTIONS'].includes(request.method)) {
    return new Response('Method Not Allowed', { status: 405 });
  }
  return null;
}

/** The origin URL of a request URL: host ORIGIN and only the query parameters EDS uses. */
export function originUrl(requestUrl, env) {
  const url = new URL(requestUrl);
  const extension = getExtension(url.pathname);
  const { searchParams } = url;
  if (isMediaRequest(url)) {
    [...searchParams.keys()].forEach((key) => {
      if (!['format', 'height', 'optimize', 'width'].includes(key)) searchParams.delete(key);
    });
  } else if (extension === 'json') {
    [...searchParams.keys()].forEach((key) => {
      if (!['limit', 'offset', 'sheet'].includes(key)) searchParams.delete(key);
    });
  } else {
    // neither media nor json request: strip search params
    url.search = '';
  }
  searchParams.sort();
  url.protocol = 'https:';
  url.port = '';
  url.hostname = env.ORIGIN;
  return url;
}

/**
 * The edge cache of origin answers. As the reference: cacheEverything, the origin's max-age
 * (7200 s for pages) — right for a zone with push invalidation, which purges on publish. Without
 * push invalidation (the var EDGE_TTL set, in seconds) answers are kept at most EDGE_TTL
 * (2xx) and 60 s (404), so a publish shows within about EDGE_TTL.
 */
export function edgeCacheOptions(env) {
  const ttl = Number.parseInt(env.EDGE_TTL, 10);
  if (!Number.isFinite(ttl) || ttl < 0 || String(env.EDGE_TTL ?? '').trim() === '') return { cacheEverything: true };
  return { cacheEverything: true, cacheTtlByStatus: { '200-299': ttl, 404: 60 } };
}

/**
 * With EDGE_TTL set (no push invalidation), pages and JSON tell browsers and app web views the
 * same limit instead of the origin's max-age=7200; media (content-addressed) keep theirs.
 */
function capBrowserCache(resp, env) {
  const ttl = Number.parseInt(env.EDGE_TTL, 10);
  if (!Number.isFinite(ttl) || String(env.EDGE_TTL ?? '').trim() === '') return;
  const type = resp.headers.get('content-type') || '';
  if (!/text\/html|application\/json/.test(type)) return;
  ['cache-control', 'cdn-cache-control'].forEach((name) => {
    // aem.live sends cdn-cache-control: max-age=172800 for BYO CDNs (purged by push invalidation)
    const cc = resp.headers.get(name) || '';
    const m = cc.match(/max-age=(\d+)/);
    if (m && Number(m[1]) > ttl) resp.headers.set(name, cc.replace(/max-age=\d+/, `max-age=${ttl}`));
  });
}

/**
 * Fetches from the origin with the headers of the reference.
 * @param {Request} request the incoming request (method, headers, body)
 * @param {Object} env
 * @param {URL|string} [target] another origin URL (default: the request's)
 * @param {Object} [options] { edgeCache: false } fetches past Cloudflare's cache (sheets the
 *   Worker reads itself)
 */
export async function originFetch(request, env, target, options = {}) {
  const url = target ? new URL(target) : originUrl(request.url, env);
  if (!url.origin.match(/^https:\/\/main--.*--.*\.aem\.live/)) {
    return new Response('Invalid ORIGIN', { status: 500 });
  }
  const req = new Request(url, request);
  const publicHost = env.PUBLIC_HOST || new URL(request.url).host;
  req.headers.set('x-forwarded-host', publicHost);
  req.headers.set('x-byo-cdn-type', 'cloudflare');
  if (env.PUSH_INVALIDATION !== 'disabled') req.headers.set('x-push-invalidation', 'enabled');
  if (env.ORIGIN_AUTHENTICATION) req.headers.set('authorization', `token ${env.ORIGIN_AUTHENTICATION}`);
  const init = options.edgeCache === false
    ? { method: req.method, cache: 'no-store' }
    // cf doesn't cache html by default: need to override the default behavior
    : { method: req.method, cf: edgeCacheOptions(env) };
  let resp = await fetch(req, init);
  resp = new Response(resp.body, resp);
  if (resp.status === 304) resp.headers.delete('Content-Security-Policy');
  resp.headers.delete('age');
  resp.headers.delete('x-robots-tag');
  capBrowserCache(resp, env);
  return resp;
}

/** The route of everything else: the request as it is, to the origin. */
export async function passThrough(request, env) {
  const savedSearch = new URL(request.url).search;
  const resp = await originFetch(request, env);
  if (resp.status === 301 && savedSearch) {
    const location = resp.headers.get('location');
    if (location && !location.match(/\?.*$/)) resp.headers.set('location', `${location}${savedSearch}`);
  }
  return resp;
}
