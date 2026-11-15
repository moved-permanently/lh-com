/**
 * Pass-through to the Edge Delivery origin, after Adobe's reference Worker
 * (https://github.com/adobe/aem-cloudflare-prod-worker, src/index.mjs): the same query parameter
 * rules, origin headers, redirect and 304 handling. Deviations (README "Deviations"):
 * - X-Forwarded-Host comes from the var PUBLIC_HOST (fallback: the request's host), as the
 *   Worker answers on several hosts (workers.dev, the demo host) for one public site;
 * - the origin var is ORIGIN (the reference: ORIGIN_HOSTNAME);
 * - originFetch() is also used by the compatibility routes (solo pages, the alias sheet);
 * - EDGE_TTL caps the edge cache and EDGE_CACHE_VERSION versions it (hosts without push
 *   invalidation); there pages and JSON are kept in the Cache API, never revalidated
 *   (storedFetch), not in the fetch cache.
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
 * The query parameter that carries EDGE_CACHE_VERSION. Cloudflare's cache key is the URL, so a
 * new value is a new set of entries: changing it drops lh-edge's edge cache (custom cache keys
 * and per-host purge aren't available on the plan). aem.live ignores it on pages, .plain.html,
 * JSON, code and media (width/format still apply); it echoes it on redirects, where it is removed.
 */
export const CACHE_VERSION_PARAM = 'lh-edge-cache';

function withCacheVersion(url, request, env) {
  const version = String(env.EDGE_CACHE_VERSION ?? '').trim();
  if (!version || !['GET', 'HEAD'].includes(request.method)) return url;
  const versioned = new URL(url);
  versioned.searchParams.set(CACHE_VERSION_PARAM, version);
  return versioned;
}

function withoutCacheVersion(resp) {
  const location = resp.headers.get('location');
  if (!location || !location.includes(CACHE_VERSION_PARAM)) return;
  const u = new URL(location, 'https://x');
  u.searchParams.delete(CACHE_VERSION_PARAM);
  const rel = !/^[a-z]+:/i.test(location);
  resp.headers.set('location', rel ? `${u.pathname}${u.search}${u.hash}` : u.href);
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

/** EDGE_TTL in seconds, or null (a host with push invalidation). */
function edgeTtl(env) {
  const ttl = Number.parseInt(env.EDGE_TTL, 10);
  if (!Number.isFinite(ttl) || ttl < 0 || String(env.EDGE_TTL ?? '').trim() === '') return null;
  return ttl;
}

/**
 * What a publish or a code push changes under the same URL: pages, .html and .json (standing
 * order 31), code, styles, icons and fonts (standing order 32: aem.live answers them 304 on the
 * same If-Modified-Since alone, its ETag ignored). Not media_<hash> files: a new file is a new URL.
 */
const isStored = (url) => !isMediaRequest(url);

// the largest answer kept in a copy (it is buffered while the copy is written): pages, sheets, code
const STORE_MAX_BYTES = 8 * 1024 * 1024;
// the origin's own cache headers, kept beside the copy's capped ones and given back on a hit
const ORIGIN_CC = 'x-lh-edge-origin-cache-control';
const ORIGIN_CDN_CC = 'x-lh-edge-origin-cdn-cache-control';

const STORE_HOST = 'https://lufthansa.turnsthe.page';

/**
 * The Cache API key of a page or JSON copy: the version, the public host (aem.live varies on
 * X-Forwarded-Host), the origin URL with the query parameters it uses.
 */
export function edgeStoreKey(url, env, forwardedHost) {
  const version = String(env.EDGE_CACHE_VERSION ?? '').trim() || '0';
  const u = new URL(url);
  u.searchParams.delete(CACHE_VERSION_PARAM);
  return `${STORE_HOST}/.lh-edge-cache/edge/${encodeURIComponent(version)}/${encodeURIComponent(forwardedHost)}/${u.host}${u.pathname}${u.search}`;
}

/**
 * Pages, JSON and code on a host without push invalidation (standing order 31, 2026-11-15:
 * austrian.turnsthe.page served /at/en/healthy-travel from before its publish for about 4 h).
 * aem.live's Last-Modified is the DA edit time, not the publish, and it answers 304 to an
 * If-Modified-Since equal to it; Cloudflare's fetch cache revalidates an expired copy that way,
 * so an old body held under the new date was kept by every revalidation. The Cache API never asks
 * the origin: a copy (200: EDGE_TTL, 404: 60 s) is gone when it expires, a miss fetches the whole
 * answer without conditions, and every answer is whole (aem.live sends no ETag; the visitor's or
 * the CDN's If-Modified-Since would get the same wrong 304 one step later). Code has an ETag, but
 * aem.live answers its If-Modified-Since with 304 whatever If-None-Match says (standing order 32):
 * the same race, so code, styles, icons and fonts are kept so too. A hit answers with the origin's
 * own cache headers (the copy's are capped for its lifetime only).
 */
async function storedFetch(req, url, env, forwardedHost, ttl) {
  const cache = caches.default;
  const key = edgeStoreKey(url, env, forwardedHost);
  const hit = await cache.match(new Request(key)).catch(() => null);
  if (hit) {
    const resp = new Response(req.method === 'HEAD' ? null : hit.body, hit);
    if (req.method === 'HEAD' && hit.body) hit.body.cancel().catch(() => {});
    [[ORIGIN_CC, 'cache-control'], [ORIGIN_CDN_CC, 'cdn-cache-control']].forEach(([kept, name]) => {
      if (resp.headers.has(kept)) resp.headers.set(name, resp.headers.get(kept));
      else resp.headers.delete(name);
      resp.headers.delete(kept);
    });
    resp.headers.set('x-lh-edge-cache', 'hit');
    return resp;
  }
  const whole = new Request(req);
  whole.headers.delete('if-modified-since');
  whole.headers.delete('if-none-match');
  const resp = await fetch(whole, { method: req.method, cache: 'no-store' });
  const keep = resp.status === 404 ? Math.min(60, ttl) : (resp.status === 200 && ttl);
  if (req.method !== 'GET' || !keep || !resp.body) return resp;
  if (Number(resp.headers.get('content-length')) > STORE_MAX_BYTES) return resp;
  const out = new Response(resp.body, resp);
  const copy = out.clone();
  const stored = new Response(copy.body, copy);
  stored.headers.delete('set-cookie');
  [[ORIGIN_CC, 'cache-control'], [ORIGIN_CDN_CC, 'cdn-cache-control']].forEach(([kept, name]) => {
    if (stored.headers.has(name)) stored.headers.set(kept, stored.headers.get(name));
  });
  ['cache-control', 'cdn-cache-control'].forEach((name) => {
    const cc = stored.headers.get(name) || '';
    const m = cc.match(/max-age=(\d+)/);
    if (!m) stored.headers.set(name, name === 'cache-control' ? `max-age=${keep}` : cc);
    else if (Number(m[1]) > keep) stored.headers.set(name, cc.replace(/max-age=\d+/, `max-age=${keep}`));
    if (!stored.headers.get(name)) stored.headers.delete(name);
  });
  // stored before the answer goes on (no ctx here): a page, a sheet or code, not a large file
  await cache.put(new Request(key), stored).catch(() => {});
  out.headers.set('x-lh-edge-cache', 'miss');
  return out;
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
  // SWISS's market index with its market roots' own search indexes the shared index leaves out
  // (src/sites.js MARKET_INDEX_EXCLUDED_ROOTS, siteEnv MARKET_EXTRA_INDEXES)
  if (env.MARKET_EXTRA_INDEXES && url.pathname === '/market-pages.json' && ['GET', 'HEAD'].includes(request.method)) {
    // eslint-disable-next-line no-use-before-define
    return mergedMarketIndex(request, env, url, options);
  }
  // a site's language versions' index under its own name (src/sites.js SITE_INDEX_PATHS: SWISS)
  const indexPath = env.INDEX_PATHS && env.INDEX_PATHS[url.pathname];
  if (indexPath) url.pathname = indexPath;
  // aem.page: a test against the preview origin (wrangler dev --var ORIGIN:main--…aem.page)
  if (!url.origin.match(/^https:\/\/main--.*--.*\.aem\.(live|page)$/)) {
    return new Response('Invalid ORIGIN', { status: 500 });
  }
  const edgeCache = options.edgeCache !== false;
  const req = new Request(edgeCache ? withCacheVersion(url, request, env) : url, request);
  const forwardedHost = env.PUBLIC_HOST || new URL(request.url).host;
  req.headers.set('x-forwarded-host', forwardedHost);
  req.headers.set('x-byo-cdn-type', 'cloudflare');
  if (env.PUSH_INVALIDATION !== 'disabled') req.headers.set('x-push-invalidation', 'enabled');
  if (env.ORIGIN_AUTHENTICATION) req.headers.set('authorization', `token ${env.ORIGIN_AUTHENTICATION}`);
  const ttl = edgeTtl(env);
  const stored = edgeCache && ttl !== null && ['GET', 'HEAD'].includes(req.method) && isStored(url)
    && !req.headers.has('range')
    && typeof caches !== 'undefined' && caches && caches.default;
  const init = !edgeCache
    ? { method: req.method, cache: 'no-store' }
    // cf doesn't cache html by default: need to override the default behavior
    : { method: req.method, cf: edgeCacheOptions(env) };
  let resp = stored ? await storedFetch(req, url, env, forwardedHost, ttl) : await fetch(req, init);
  resp = new Response(resp.body, resp);
  if (resp.status === 304) resp.headers.delete('Content-Security-Policy');
  resp.headers.delete('age');
  resp.headers.delete('x-robots-tag');
  withoutCacheVersion(resp);
  capBrowserCache(resp, env);
  return resp;
}

/**
 * /market-pages.json with the rows of env.MARKET_EXTRA_INDEXES (a row of the market index first,
 * one row a path): every page of each read, the request's offset and limit applied to the merged
 * rows. The market index's answer as it is when it is not a sheet (a 304, an error).
 */
async function mergedMarketIndex(request, env, url, options) {
  const { MARKET_EXTRA_INDEXES: extra, ...plain } = env;
  const get = new Request(request.url, { method: 'GET', headers: request.headers });
  const readAll = async (path) => {
    const rows = [];
    let first = null;
    for (let offset = 0; ;) {
      const u = new URL(path, url);
      u.searchParams.set('offset', String(offset));
      u.searchParams.set('limit', '1000');
      // eslint-disable-next-line no-await-in-loop
      const resp = await originFetch(get, plain, u, options);
      if (!resp.ok) return first ? { first, rows } : { first: resp, rows: null };
      let body;
      try {
        // eslint-disable-next-line no-await-in-loop
        body = await resp.clone().json();
      } catch (e) {
        return { first: first || resp, rows: first ? rows : null };
      }
      if (!first) first = { resp, body };
      const data = Array.isArray(body.data) ? body.data : [];
      rows.push(...data);
      offset += data.length;
      if (!data.length || offset >= Number(body.total || 0)) return { first, rows };
    }
  };
  const main = await readAll(url.pathname);
  if (!main.rows || !main.first.body) return main.first.resp || main.first;
  const extras = await Promise.all(extra.map((p) => readAll(p).catch(() => ({ rows: [] }))));
  const byPath = new Map();
  [main.rows, ...extras.map((x) => x.rows || [])].flat().forEach((r) => {
    if (r && typeof r.path === 'string' && !byPath.has(r.path)) byPath.set(r.path, r);
  });
  const all = [...byPath.values()];
  const offset = Math.max(0, Number.parseInt(url.searchParams.get('offset'), 10) || 0);
  const limit = Math.max(1, Number.parseInt(url.searchParams.get('limit'), 10) || 1000);
  const body = {
    ...main.first.body, total: all.length, offset, limit, data: all.slice(offset, offset + limit),
  };
  const headers = new Headers(main.first.resp.headers);
  headers.delete('content-length');
  headers.delete('etag');
  headers.set('content-type', 'application/json');
  return new Response(request.method === 'HEAD' ? null : JSON.stringify(body), { status: 200, headers });
}

/**
 * The public host for absolute links (app screens): X-LH-Public-Host (a CDN in front that
 * sends chosen paths to lh-edge), else X-Forwarded-Host, else the var PUBLIC_HOST, else the
 * request's host.
 */
export function publicHost(request, env) {
  const h = request.headers;
  const first = (v) => String(v || '').split(',')[0].trim();
  return first(h.get('x-lh-public-host')) || first(h.get('x-forwarded-host')) || env.PUBLIC_HOST || new URL(request.url).host;
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
