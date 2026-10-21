/*
 * lh-proxy: Cloudflare Worker that forwards an allowlist of www.lufthansa.com
 * same-origin API routes and adds CORS so widgets on the Edge Delivery
 * Services preview/live hosts can call them cross-origin.
 *
 * No dependencies. See ../README.md.
 */

// One path segment. Encoded slashes / backslashes are rejected separately.
const SEG = '[A-Za-z0-9_.,:~+%-]+';
const CATALOGS = 'airlines|airportnames|calendar|localeData|conditions|regions|affinities|countryselector';

/*
 * ALLOWLIST: [method, path pattern (anchored, no query), note]
 * The query string is always passed through unchanged.
 */
const ALLOWLIST = [
  ['GET', '/service/api/suggestions/airports', 'airport autocomplete'],
  ['GET', `/service/api/catalogs/(?:${CATALOGS})(?:/${SEG})*`, 'catalogs'],
  ['GET', '/service/api/defaultAirport', 'default airport by geo'],
  ['GET', '/service/api/labels/[A-Za-z0-9_-]+/lh/(?<lang>[a-z]{2})', 'i18n labels'],
  ['POST', '/service/api/lhg-fare-teaser/fareteaser/offers/[A-Z]{3}', 'fare teaser offers'],
  ['POST', '/service/api/lhg-fare-teaser/fareteaser/manual', 'fare teaser manual'],
  ['GET', '/service/api/lhg-fare-teaser/fareteaser/recommend', 'fare teaser recommend'],
  ['GET', `/service/api/destinationfinder/campaign/${SEG}`, 'destination finder campaign'],
  ['GET', `/service/api/destinationfinder/destination/finder/${SEG}/${SEG}`, 'destination finder'],
  ['GET', `/aircore/weather(?:/${SEG})*`, 'weather'],
  ['GET', `/aircore/geolocation(?:/${SEG})*`, 'geolocation'],
].map(([method, pattern, note]) => ({ method, re: new RegExp(`^${pattern}$`), note }));

const DEFAULTS = {
  UPSTREAM_ORIGIN: 'https://www.lufthansa.com',
  ALLOWED_ORIGIN_PATTERN: '^https://[a-z0-9-]+--(lh-com|lh-flynet)--moved-permanently\\.aem\\.(page|live)$',
  EXTRA_ALLOWED_ORIGINS: 'http://localhost:3000',
  CACHE_TTL: 300,
  UPSTREAM_TIMEOUT_MS: 8000,
};

const MAX_BODY_BYTES = 64 * 1024;
const FORWARDED_HEADERS = ['accept', 'accept-language', 'content-type'];
const DEFAULT_ACCEPT = 'application/json, text/plain, */*';
const DEFAULT_ACCEPT_LANGUAGE = 'en-US,en;q=0.9';
const REGION = {
  en: 'US', ja: 'JP', zh: 'CN', ko: 'KR', sv: 'SE', da: 'DK', cs: 'CZ', el: 'GR', uk: 'UA', he: 'IL', nb: 'NO',
};
const NULL_BODY_STATUS = [101, 204, 205, 304];
const BAD_PATH = /%2f|%5c|%00|\\/i;

const regexCache = new Map();
function originRegex(pattern) {
  if (!regexCache.has(pattern)) {
    let re = null;
    try {
      re = new RegExp(pattern);
    } catch (e) {
      re = null;
    }
    regexCache.set(pattern, re);
  }
  return regexCache.get(pattern);
}

function config(env = {}) {
  const num = (v, d) => {
    const n = Number(v);
    return v !== undefined && v !== '' && Number.isFinite(n) && n >= 0 ? n : d;
  };
  return {
    upstream: (env.UPSTREAM_ORIGIN || DEFAULTS.UPSTREAM_ORIGIN).replace(/\/+$/, ''),
    originPattern: env.ALLOWED_ORIGIN_PATTERN || DEFAULTS.ALLOWED_ORIGIN_PATTERN,
    extraOrigins: (env.EXTRA_ALLOWED_ORIGINS ?? DEFAULTS.EXTRA_ALLOWED_ORIGINS)
      .split(',').map((s) => s.trim()).filter(Boolean),
    cacheTtl: num(env.CACHE_TTL, DEFAULTS.CACHE_TTL),
    timeoutMs: num(env.UPSTREAM_TIMEOUT_MS, DEFAULTS.UPSTREAM_TIMEOUT_MS),
  };
}

function isOriginAllowed(origin, cfg) {
  if (cfg.extraOrigins.includes(origin)) return true;
  const re = originRegex(cfg.originPattern);
  return !!re && re.test(origin);
}

function corsHeaders(origin) {
  const h = new Headers({ Vary: 'Origin' });
  if (origin) {
    h.set('Access-Control-Allow-Origin', origin);
    h.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    h.set('Access-Control-Allow-Headers', 'Content-Type, Accept, Accept-Language');
    h.set('Access-Control-Max-Age', '86400');
  }
  return h;
}

function withCors(response, origin, extra = {}) {
  const headers = new Headers(response.headers);
  corsHeaders(origin).forEach((v, k) => headers.set(k, v));
  Object.entries(extra).forEach(([k, v]) => headers.set(k, v));
  headers.set('x-lh-proxy', '1');
  return new Response(response.body, { status: response.status, headers });
}

function json(status, data, origin, extra = {}) {
  const res = new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });
  return withCors(res, origin, extra);
}

function matchRoute(method, pathname) {
  if (BAD_PATH.test(pathname)) return null;
  const route = ALLOWLIST.find((r) => r.method === method && r.re.test(pathname));
  if (!route) return null;
  return { route, groups: route.re.exec(pathname).groups || {} };
}

function acceptLanguageFor(lang) {
  if (!lang) return DEFAULT_ACCEPT_LANGUAGE;
  if (lang === 'en') return DEFAULT_ACCEPT_LANGUAGE;
  const region = REGION[lang] || lang.toUpperCase();
  return `${lang}-${region},${lang};q=0.9,en;q=0.8`;
}

async function readLimited(stream, max) {
  if (!stream) return new Uint8Array(0);
  const reader = stream.getReader();
  const chunks = [];
  let size = 0;
  const pump = async () => {
    const { done, value } = await reader.read();
    if (done) return true;
    size += value.byteLength;
    if (size > max) {
      await reader.cancel();
      return false;
    }
    chunks.push(value);
    return pump();
  };
  if (!(await pump())) return null;
  const out = new Uint8Array(size);
  let offset = 0;
  chunks.forEach((c) => {
    out.set(c, offset);
    offset += c.byteLength;
  });
  return out;
}

function isBlocked(res) {
  const type = (res.headers.get('content-type') || '').toLowerCase();
  if ((res.headers.get('cf-mitigated') || '').toLowerCase() === 'challenge') return true;
  return (res.status === 403 || res.status === 503) && type.includes('text/html');
}

function sanitizeResponseHeaders(src) {
  const headers = new Headers(src);
  headers.delete('set-cookie');
  headers.delete('set-cookie2');
  [...headers.keys()]
    .filter((k) => k.toLowerCase().startsWith('access-control-'))
    .forEach((k) => headers.delete(k));
  return headers;
}

function getCache() {
  try {
    return typeof caches !== 'undefined' && caches && caches.default ? caches.default : null;
  } catch (e) {
    return null;
  }
}

async function handle(request, env, ctx) {
  const cfg = config(env);
  const url = new URL(request.url);
  const origin = request.headers.get('Origin');

  if (origin && !isOriginAllowed(origin, cfg)) {
    return json(403, { error: 'origin-not-allowed' }, null);
  }

  if (request.method === 'OPTIONS') {
    const wanted = (request.headers.get('Access-Control-Request-Method') || 'GET').toUpperCase();
    const ok = url.pathname === '/health' ? wanted === 'GET' : matchRoute(wanted, url.pathname);
    if (!ok) return json(404, { error: 'not-allowed' }, origin);
    const headers = corsHeaders(origin);
    headers.set('x-lh-proxy', '1');
    return new Response(null, { status: 204, headers });
  }

  if (request.method === 'GET' && url.pathname === '/health') {
    return json(200, { ok: true, upstream: cfg.upstream }, origin);
  }

  const match = matchRoute(request.method, url.pathname);
  if (!match) return json(404, { error: 'not-allowed' }, origin);

  const upstreamUrl = `${cfg.upstream}${url.pathname}${url.search}`;
  const isGet = request.method === 'GET';
  const cache = isGet && cfg.cacheTtl > 0 ? getCache() : null;
  const cacheKey = cache ? new Request(upstreamUrl, { method: 'GET' }) : null;

  if (cache) {
    const hit = await cache.match(cacheKey);
    if (hit) return withCors(hit, origin, { 'x-lh-proxy-cache': 'HIT' });
  }

  // Build sanitized upstream request headers.
  const headers = new Headers();
  FORWARDED_HEADERS.forEach((name) => {
    const v = request.headers.get(name);
    if (v) headers.set(name, v);
  });
  if (!headers.has('accept')) headers.set('accept', DEFAULT_ACCEPT);
  if (!headers.has('accept-language')) {
    const lang = match.groups.lang || url.searchParams.get('lang');
    headers.set('accept-language', acceptLanguageFor(/^[a-z]{2}$/.test(lang || '') ? lang : null));
  }
  headers.set('origin', cfg.upstream);
  headers.set('referer', `${cfg.upstream}/`);

  let body;
  if (request.method === 'POST') {
    const declared = Number(request.headers.get('content-length'));
    if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
      return json(413, { error: 'payload-too-large', limit: MAX_BODY_BYTES }, origin);
    }
    body = await readLimited(request.body, MAX_BODY_BYTES);
    if (body === null) {
      return json(413, { error: 'payload-too-large', limit: MAX_BODY_BYTES }, origin);
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), cfg.timeoutMs);
  let upstream;
  try {
    upstream = await fetch(upstreamUrl, {
      method: request.method,
      headers,
      body,
      redirect: 'manual',
      signal: controller.signal,
    });
  } catch (e) {
    if (controller.signal.aborted) return json(504, { error: 'upstream-timeout' }, origin);
    return json(502, { error: 'upstream-error' }, origin);
  } finally {
    clearTimeout(timer);
  }

  const status = String(upstream.status);
  if (isBlocked(upstream)) {
    if (upstream.body) upstream.body.cancel().catch(() => {});
    return json(502, { error: 'upstream-blocked', status: upstream.status }, origin, {
      'x-lh-proxy-upstream-status': status,
    });
  }

  const resHeaders = sanitizeResponseHeaders(upstream.headers);
  resHeaders.set('x-lh-proxy-upstream-status', status);
  const nullBody = NULL_BODY_STATUS.includes(upstream.status);

  if (cache && upstream.status === 200) {
    const buf = await upstream.arrayBuffer();
    const stored = new Headers(resHeaders);
    stored.set('Cache-Control', `public, max-age=${cfg.cacheTtl}`);
    const put = cache.put(cacheKey, new Response(buf, { status: 200, headers: stored }))
      .catch(() => {});
    if (ctx && typeof ctx.waitUntil === 'function') ctx.waitUntil(put);
    else await put;
    return withCors(new Response(buf, { status: 200, headers: resHeaders }), origin, {
      'x-lh-proxy-cache': 'MISS',
    });
  }

  return withCors(
    new Response(nullBody ? null : upstream.body, { status: upstream.status, headers: resHeaders }),
    origin,
  );
}

// Only a default export: workerd treats extra named exports as entrypoints.
export default {
  async fetch(request, env, ctx) {
    try {
      return await handle(request, env || {}, ctx);
    } catch (e) {
      return json(500, { error: 'proxy-error' }, null);
    }
  },
};
