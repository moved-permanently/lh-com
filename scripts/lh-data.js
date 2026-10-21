/**
 * Live data for the lufthansa.com widgets (flight search, fare teasers, destination finder,
 * labels). Requests go to the lh-proxy worker when it is configured and answers; otherwise
 * they are served from the responses recorded at import time under /data/recorded/.
 */
import { getLocale, LOCALES } from './locale.js';

// Origin of the deployed lh-proxy worker, e.g. 'https://lh-proxy.example.workers.dev'.
// Empty until the worker is deployed (see tools/workers/DEPLOY-PROMPT.md).
export const PROXY_ORIGIN = 'https://lh-proxy.aem-poc-lab.workers.dev';

const PROXY_TIMEOUT_MS = 4000;
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
  return `${method.toUpperCase()} ${url.pathname}${query}${bodyHash}`;
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

/**
 * Fetches a lufthansa.com API route, live through the proxy or from recorded data.
 * @param {string} route path and query on www.lufthansa.com, e.g. '/service/api/defaultAirport'
 * @param {Object} [options]
 * @param {string} [options.method] HTTP method, GET by default
 * @param {string|Object} [options.body] request body (JSON) for POST routes
 * @param {string} [options.market] locale key, defaults to the current page's locale
 * @param {boolean} [options.exact] recorded fallback only for this exact request (no answer
 *   of the same route for other parameters, e.g. another search term)
 * @returns {Promise<{data: *, source: 'live'|'recorded', recordedAt?: string}>}
 */
export async function lhFetch(route, {
  method = 'GET', body, market = getLocale().key, exact = false,
} = {}) {
  const key = requestKey(method, route, body);
  const origin = proxyOrigin();
  if (origin) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);
    try {
      const init = { method, signal: controller.signal, headers: { Accept: 'application/json' } };
      const language = acceptLanguage(market);
      if (language) init.headers['Accept-Language'] = language;
      if (market) init.headers['X-LH-Market'] = market;
      if (body !== undefined) {
        init.body = typeof body === 'string' ? body : JSON.stringify(body);
        init.headers['Content-Type'] = 'application/json';
      }
      const resp = await fetch(`${origin}${route}`, init);
      if (resp.ok) return { data: await resp.json(), source: 'live' };
    } catch (e) {
      // proxy missing, refused or blocked upstream: fall back to recorded data
    } finally {
      clearTimeout(timer);
    }
  }
  return fetchRecorded(market, key, exact);
}
