/**
 * Live data for the lufthansa.com widgets (flight search, fare teasers, destination finder,
 * price bar, labels). Three sources, in this order:
 *
 * 0. Recorded only: /service/secured/api/pointsOfInterest/* (poi-map) answers its points only to
 *    same-origin calls on www.lufthansa.com (204 without a body from aem.page): recordings only.
 * 1. Direct: routes www.lufthansa.com answers with Access-Control-Allow-Origin: * (airport
 *    suggestions, labels, catalogs, defaultAirport, core/feature/list, destinationfinder/*) are
 *    called from the visitor's browser without credentials, with the query and X-Portal-*
 *    headers the live page sends for the market (destinationfinder answers 400 "Invalid site"
 *    without X-Portal-Site). Any failure (CORS or network error, timeout, non-2xx, Cloudflare's
 *    HTML block page, unparsable JSON) falls back to the recordings; lh-proxy is not used.
 * 2. lh-proxy: the other routes (lhg-fare-teaser/*, which answers 403 "Invalid CORS request" to
 *    foreign origins) go through the worker.
 *    The recorded answer is looked up at the same time, so a refused proxy (502
 *    upstream-blocked) costs no extra wait; a refused proxy is remembered for the session.
 * 3. Recorded: the responses recorded at import time under /data/recorded/ (never for prices:
 *    PRICE_ROUTES answer live or not at all).
 */
import { getLocale, LOCALES, LIVE_ORIGIN } from './locale.js';

// Origin of the deployed lh-proxy worker (see tools/workers/DEPLOY-PROMPT.md).
export const PROXY_ORIGIN = 'https://lh-proxy.aem-poc-lab.workers.dev';

/**
 * Routes www.lufthansa.com serves cross-origin (ACAO *, preflight passes with X-Portal-*).
 * destinationfinder/*: GET .../destination/finder/FRA/E with X-Portal: LH, X-Portal-Site: DE,
 * X-Portal-Language: en and credentials 'omit' answers 200 JSON readable from
 * main--lh-com--moved-permanently.aem.page (tested by Ben, 2026-10-22).
 */
const DIRECT_ROUTES = /^\/service\/api\/(suggestions\/airports|labels\/|catalogs\/|defaultAirport(?:[/?]|$)|core\/feature\/list\/|destinationfinder\/|flight-prices\/|teaser\/price\/)/;

/**
 * Price routes: their recorded answers are never used (a recorded price is a price of another
 * day). Live or nothing: a failing call fails, the widget shows no price. The fare teaser's
 * origin list (fareteaser/recommend) holds no prices and keeps its recording, like labels,
 * catalogs and suggestions.
 */
const PRICE_ROUTES = /^\/service\/api\/(lhg-fare-teaser\/fareteaser\/(?!recommend)|destinationfinder\/destination\/finder\/|flight-prices\/|teaser\/price\/)/;

/** Whether the recordings may answer for a route (not for prices). */
export function isPriceRoute(route) {
  return PRICE_ROUTES.test(route);
}

/**
 * Routes served from the recordings only. pointsOfInterest/{id} (poi-map): the live client calls
 * GET /service/secured/api/pointsOfInterest/{id}; www answers 200 with the points to same-origin
 * calls with X-Portal: LH, X-Portal-Site, X-Portal-Language (an empty list without them) and
 * 204 without a body to aem.page (Ben, 2026-10-23), so a live call can never succeed here.
 */
const RECORDED_ONLY_ROUTES = /^\/service\/secured\/api\/pointsOfInterest\//;

const DIRECT_TIMEOUT_MS = 3000;
const PROXY_TIMEOUT_MS = 2500;
/** How long a refused proxy or a blocked direct route is skipped (sessionStorage). */
const BLOCKED_TTL_MS = 10 * 60 * 1000;
const PROXY_BLOCKED_KEY = 'lh-proxy-blocked';
const DIRECT_BLOCKED_KEY = 'lh-direct-blocked';
const RECORDED_BASE = '/data/recorded';

function proxyOrigin() {
  try {
    // lets a tester point a page at another worker without a code change
    return window.localStorage.getItem('lh-proxy') || PROXY_ORIGIN;
  } catch (e) {
    return PROXY_ORIGIN;
  }
}

/**
 * Origin of the direct calls: www.lufthansa.com; a tester may point a page at a mock server
 * (localStorage 'lh-live-origin', like 'lh-proxy') to try answers www does not give them.
 */
function liveOrigin() {
  try {
    return window.localStorage.getItem('lh-live-origin') || LIVE_ORIGIN;
  } catch (e) {
    return LIVE_ORIGIN;
  }
}

/** Whether a route is called directly on www.lufthansa.com (else through lh-proxy). */
export function isDirectRoute(route) {
  return DIRECT_ROUTES.test(route);
}

/**
 * Request headers the live page sends with every /service/api call of a market (real-browser
 * HARs, tools/source-export/har/{de-en,de-de,at-de,gb-en}/homepage.har), e.g. for de/en:
 * X-Portal: LH, X-Portal-Site: DE, X-Portal-Language: en, X-Portal-Taxonomy: '',
 * X-Portal-CountryId: ''. The live page also sends "line: b" and an Accept-Language built from
 * navigator.languages; neither is sent here (the cross-origin preflight was verified with the
 * X-Portal-* headers only, and the browser sends the visitor's own Accept-Language).
 * @param {string} market locale key, e.g. 'de/en'
 * @returns {Object<string, string>}
 */
export function portalHeaders(market) {
  const locale = LOCALES[market];
  if (!locale) return {};
  return {
    'X-Portal': 'LH',
    'X-Portal-Site': locale.country.toUpperCase(),
    'X-Portal-Language': locale.lang,
    'X-Portal-Taxonomy': '',
    'X-Portal-CountryId': '',
  };
}

/* Session memo of refused sources: { [key]: { origin, until } } in sessionStorage. */
function storage() {
  try {
    return window.sessionStorage;
  } catch (e) {
    return null;
  }
}

function isBlocked(key, origin) {
  try {
    const memo = JSON.parse(storage().getItem(key) || 'null');
    return Boolean(memo && memo.origin === origin && memo.until > Date.now());
  } catch (e) {
    return false;
  }
}

function setBlocked(key, origin, reason) {
  try {
    storage().setItem(key, JSON.stringify({ origin, reason, until: Date.now() + BLOCKED_TTL_MS }));
  } catch (e) {
    // no sessionStorage (privacy mode, sandboxed frame): every call tries again
  }
}

/**
 * Reads a JSON answer; anything else (Cloudflare's HTML challenge, an empty body, a scalar)
 * is a failure.
 */
async function readJson(resp) {
  const text = await resp.text();
  const data = JSON.parse(text);
  if (!data || typeof data !== 'object') throw new Error('not a JSON object');
  return data;
}

/** fetch with a timeout; resolves with the response or { error } (never rejects). */
async function timedFetch(url, init, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(url, { ...init, signal: controller.signal });
    if (!resp.ok) return { resp, error: `HTTP ${resp.status}` };
    try {
      return { resp, data: await readJson(resp) };
    } catch (e) {
      return { resp, error: 'not JSON' };
    }
  } catch (e) {
    return { error: controller.signal.aborted ? 'timeout' : `network: ${e.message}` };
  } finally {
    clearTimeout(timer);
  }
}

/** Cloudflare's block page: an HTML answer with a 403/429/503 status. */
function isEdgeBlock(resp) {
  return Boolean(resp && [403, 429, 503].includes(resp.status)
    && /text\/html/i.test(resp.headers.get('content-type') || ''));
}

/**
 * 32-bit FNV-1a hash as 8 hex chars; also used by the recorder in Node.
 * @param {string} str
 * @returns {string}
 */
/* eslint-disable no-bitwise */
export function fnv1a(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}
/* eslint-enable no-bitwise */

/**
 * Request fields that change with every call or client and do not change the answer, left out
 * of the key so a recording still matches: the fare teaser "offers" body carries the client's
 * local time and UTC offset ({"timestamp":"2026-10-21T21:06:26","timezone":120,...}).
 */
const VOLATILE_BODY_FIELDS = ['timestamp', 'timezone'];
const VOLATILE_QUERY_PARAMS = ['_', 'timestamp'];

/**
 * Stable key of a request: method, path, sorted query and a hash of the body, all without
 * the volatile fields above. Shared with tools/importer/record-live-data.mjs.
 * @param {string} method
 * @param {string} route path and query, e.g. '/service/api/suggestions/airports?query=Wien'
 * @param {string|Object} [body]
 * @returns {string}
 */
export function requestKey(method, route, body) {
  const url = new URL(route, 'https://www.lufthansa.com');
  const params = [...url.searchParams.entries()]
    .filter(([name]) => !VOLATILE_QUERY_PARAMS.includes(name))
    .sort(([a], [b]) => a.localeCompare(b));
  const query = params.length ? `?${new URLSearchParams(params)}` : '';
  let bodyHash = '';
  if (body !== undefined && body !== null && body !== '') {
    const text = typeof body === 'string' ? body : JSON.stringify(body);
    let canonical = text;
    try {
      const sortKeys = (v, top) => {
        if (Array.isArray(v)) return v.map((x) => sortKeys(x));
        if (v && typeof v === 'object') {
          return Object.fromEntries(Object.keys(v)
            .filter((k) => !top || !VOLATILE_BODY_FIELDS.includes(k))
            .sort()
            .map((k) => [k, sortKeys(v[k])]));
        }
        return v;
      };
      canonical = JSON.stringify(sortKeys(JSON.parse(text), true));
    } catch (e) {
      // not JSON, hash as is
    }
    bodyHash = `#${fnv1a(canonical)}`;
  }
  // a base64 path parameter (pointsOfInterest/{id}) matches with "=" or "%3D" alike
  const pathname = url.pathname.replace(/%3D/gi, '=');
  return `${method.toUpperCase()} ${pathname}${query}${bodyHash}`;
}

let recordedIndex;

async function loadRecordedIndex() {
  if (!recordedIndex) {
    recordedIndex = fetch(`${RECORDED_BASE}/index.json`)
      .then((resp) => (resp.ok ? resp.json() : { entries: {} }))
      .catch(() => ({ entries: {} }));
  }
  return recordedIndex;
}

const pathOf = (rest) => rest.replace(/[?#].*$/, '');

/**
 * Finds the recorded response closest to a request: same market and request first,
 * then the same request in any market, then (unless exact) the same method and path in this
 * market. Never another market's response for a different request: it could show the wrong
 * prices or currency. Callers of the path fallback must check the answer belongs to their
 * request (e.g. the fare mappers match origin and destination).
 */
async function fetchRecorded(market, key, exact) {
  const { entries = {} } = await loadRecordedIndex();
  const [method, rest] = key.split(' ');
  const path = pathOf(rest);
  const keys = Object.keys(entries);
  const samePath = (k) => {
    const [, , m, r] = k.match(/^([^|]+)\|(\S+) (.*)$/) || [];
    return m === method && r && pathOf(r) === path;
  };
  const hit = entries[`${market}|${key}`]
    || entries[keys.find((k) => k.endsWith(`|${key}`))]
    || (!exact && entries[keys.find((k) => k.startsWith(`${market}|`) && samePath(k))]);
  if (!hit) throw new Error(`no recorded data for ${key}`);
  const resp = await fetch(`${RECORDED_BASE}/${hit.file}`);
  if (!resp.ok) throw new Error(`recorded data missing: ${hit.file}`);
  return { data: await resp.json(), source: 'recorded', recordedAt: hit.recordedAt };
}

/**
 * All recorded responses of a market whose path starts with a prefix, e.g. every recorded
 * airport suggestion. Used for offline fallbacks (filtering known airports client-side).
 * @param {string} pathPrefix e.g. '/service/api/suggestions/airports'
 * @param {Object} [options]
 * @param {string} [options.method] GET by default
 * @param {string} [options.market] locale key, defaults to the current page's locale
 * @returns {Promise<Array<*>>} response bodies; unreadable recordings are skipped
 */
export async function lhRecorded(pathPrefix, { method = 'GET', market = getLocale().key } = {}) {
  const { entries = {} } = await loadRecordedIndex();
  const prefix = `${market}|${method.toUpperCase()} ${pathPrefix}`;
  const files = Object.keys(entries)
    .filter((k) => k.startsWith(prefix)).map((k) => entries[k].file);
  const results = await Promise.allSettled([...new Set(files)].map(async (file) => {
    const resp = await fetch(`${RECORDED_BASE}/${file}`);
    if (!resp.ok) throw new Error(file);
    return resp.json();
  }));
  return results.filter((r) => r.status === 'fulfilled').map((r) => r.value);
}

/** Accept-Language of a market (the proxy forwards it; the live site localizes by it). */
function acceptLanguage(market) {
  const locale = LOCALES[market];
  if (!locale) return '';
  return `${locale.lang}-${locale.country.toUpperCase()},${locale.lang};q=0.9`;
}

const bodyText = (body) => (typeof body === 'string' ? body : JSON.stringify(body));

/**
 * The direct request to www.lufthansa.com: the live URL and the market's X-Portal-* headers,
 * no cookies. Exported for tools/importer/test-widgets.mjs.
 * @returns {{url: string, init: RequestInit}}
 */
export function directRequest(route, { method = 'GET', body, market } = {}) {
  const init = {
    method, mode: 'cors', credentials: 'omit', headers: portalHeaders(market),
  };
  if (body !== undefined && body !== null) {
    init.body = bodyText(body);
    init.headers['Content-Type'] = 'application/json';
  }
  return { url: `${liveOrigin()}${route}`, init };
}

/**
 * The request to lh-proxy (headers within its CORS allowlist: Content-Type, Accept,
 * Accept-Language, X-LH-Market).
 */
function proxyRequest(origin, route, { method, body, market }) {
  const init = { method, headers: { Accept: 'application/json' } };
  const language = acceptLanguage(market);
  if (language) init.headers['Accept-Language'] = language;
  if (market) init.headers['X-LH-Market'] = market;
  if (body !== undefined && body !== null) {
    init.body = bodyText(body);
    init.headers['Content-Type'] = 'application/json';
  }
  return { url: `${origin}${route}`, init };
}

/**
 * Fetches a lufthansa.com API route: live (directly or through lh-proxy, see the top of this
 * file) or from the recordings.
 * @param {string} route path and query on www.lufthansa.com, e.g. '/service/api/defaultAirport'
 * @param {Object} [options]
 * @param {string} [options.method] HTTP method, GET by default
 * @param {string|Object} [options.body] request body (JSON) for POST routes
 * @param {string} [options.market] locale key, defaults to the current page's locale
 * @param {boolean} [options.exact] recorded fallback only for this exact request (no answer
 *   of the same route for other parameters, e.g. another search term)
 * @returns {Promise<{data: *, source: 'live'|'recorded', via: 'direct'|'proxy'|'recording',
 *   recordedAt?: string}>}
 */
export async function lhFetch(route, {
  method = 'GET', body, market = getLocale().key, exact = false,
} = {}) {
  const key = requestKey(method, route, body);
  const options = { method, body, market };
  const priceRoute = isPriceRoute(route);
  // the recorded answer is looked up right away: a failing live call costs no extra wait
  let recordedLookup;
  const recorded = () => {
    if (!recordedLookup) {
      recordedLookup = fetchRecorded(market, key, exact)
        .then((value) => ({ value }), (error) => ({ error }));
    }
    return recordedLookup;
  };
  const fromRecording = async () => {
    if (isPriceRoute(route)) throw new Error(`no live answer for ${route} (prices are never recorded answers)`);
    const { value, error } = await recorded();
    if (error) throw error;
    return { ...value, via: 'recording' };
  };

  if (RECORDED_ONLY_ROUTES.test(route)) return fromRecording();

  if (isDirectRoute(route)) {
    if (isBlocked(DIRECT_BLOCKED_KEY, LIVE_ORIGIN)) return fromRecording();
    if (!priceRoute) recorded();
    const { url, init } = directRequest(route, options);
    const { data, resp, error } = await timedFetch(url, init, DIRECT_TIMEOUT_MS);
    if (!error) return { data, source: 'live', via: 'direct' };
    // CORS or network error, timeout or Cloudflare's block page: the visitor cannot reach the
    // site directly for now; another status or a bad body only concerns this request
    if (!resp || isEdgeBlock(resp)) setBlocked(DIRECT_BLOCKED_KEY, LIVE_ORIGIN, error);
    return fromRecording();
  }

  const origin = proxyOrigin();
  if (!origin || isBlocked(PROXY_BLOCKED_KEY, origin)) return fromRecording();
  if (!priceRoute) recorded();
  const { url, init } = proxyRequest(origin, route, options);
  const { data, resp, error } = await timedFetch(url, init, PROXY_TIMEOUT_MS);
  if (!error) return { data, source: 'live', via: 'proxy' };
  // 502 upstream-blocked (Cloudflare refuses the worker), 5xx, unreachable or too slow: skip
  // the proxy for a while; a 4xx (e.g. a route outside its allowlist) only concerns this route
  if (!resp || resp.status >= 500 || resp.status === 403 || resp.status === 429) {
    setBlocked(PROXY_BLOCKED_KEY, origin, error);
  }
  return fromRecording();
}

/**
 * Marks a widget with where its main content came from: data-lh-source="live" when every
 * primary request answered live, else "recorded" when a primary request was answered from the
 * recordings, else "none" (labels or catalogs from the recordings do not count: a widget whose
 * prices did not load is "none", never "recorded"); data-lh-sources lists every request
 * ("fares:live labels/fareteaserstatic:recorded").
 * @param {HTMLElement} block
 * @param {Object<string, string>} sources request name → 'live'|'recorded'|'none'
 * @param {string[]} primary names of the requests the widget's main content comes from
 * @returns {string} the data-lh-source value
 */
export function markSource(block, sources, primary) {
  const main = primary.map((name) => sources[name] || 'none');
  let source = 'none';
  if (main.length && main.every((s) => s === 'live')) source = 'live';
  else if (main.includes('recorded')) source = 'recorded';
  block.dataset.lhSource = source;
  block.dataset.lhSources = Object.entries(sources).map(([name, s]) => `${name}:${s}`).join(' ');
  return source;
}
