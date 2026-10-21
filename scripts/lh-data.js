/**
 * Live data for the lufthansa.com widgets (flight search, fare teasers, destination finder,
 * labels). Requests go to the lh-proxy worker when it is configured and answers; otherwise
 * they are served from the responses recorded at import time under /data/recorded/.
 */
import { getLocale } from './locale.js';

// Origin of the deployed lh-proxy worker, e.g. 'https://lh-proxy.example.workers.dev'.
// Empty until the worker is deployed (see tools/workers/DEPLOY-PROMPT.md).
export const PROXY_ORIGIN = '';

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
 * Stable key of a request: method, path, sorted query and a hash of the body.
 * @param {string} method
 * @param {string} route path and query, e.g. '/service/api/catalogs/airlines?lang=en'
 * @param {string|Object} [body]
 * @returns {string}
 */
export function requestKey(method, route, body) {
  const url = new URL(route, 'https://www.lufthansa.com');
  const params = [...url.searchParams.entries()].sort(([a], [b]) => a.localeCompare(b));
  const query = params.length ? `?${new URLSearchParams(params)}` : '';
  let bodyHash = '';
  if (body !== undefined && body !== null && body !== '') {
    const text = typeof body === 'string' ? body : JSON.stringify(body);
    let canonical = text;
    try {
      const sortKeys = (v) => {
        if (Array.isArray(v)) return v.map(sortKeys);
        if (v && typeof v === 'object') {
          return Object.fromEntries(Object.keys(v).sort().map((k) => [k, sortKeys(v[k])]));
        }
        return v;
      };
      canonical = JSON.stringify(sortKeys(JSON.parse(text)));
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

/**
 * Finds the recorded response closest to a request: same market and request first,
 * then the same request in any market, then the same method and path in this market.
 * Never another market's response for a different request: it could show the wrong
 * prices or currency.
 */
async function fetchRecorded(market, key) {
  const { entries = {} } = await loadRecordedIndex();
  const [method, rest] = key.split(' ');
  const path = rest.replace(/[?#].*$/, '');
  const keys = Object.keys(entries);
  const samePath = (k) => {
    const [, , m, r] = k.match(/^([^|]+)\|(\S+) (.*)$/) || [];
    return m === method && r && r.replace(/[?#].*$/, '') === path;
  };
  const hit = entries[`${market}|${key}`]
    || entries[keys.find((k) => k.endsWith(`|${key}`))]
    || entries[keys.find((k) => k.startsWith(`${market}|`) && samePath(k))];
  if (!hit) throw new Error(`no recorded data for ${key}`);
  const resp = await fetch(`${RECORDED_BASE}/${hit.file}`);
  if (!resp.ok) throw new Error(`recorded data missing: ${hit.file}`);
  return { data: await resp.json(), source: 'recorded', recordedAt: hit.recordedAt };
}

/**
 * Fetches a lufthansa.com API route, live through the proxy or from recorded data.
 * @param {string} route path and query on www.lufthansa.com, e.g. '/service/api/defaultAirport'
 * @param {Object} [options]
 * @param {string} [options.method] HTTP method, GET by default
 * @param {string|Object} [options.body] request body (JSON) for POST routes
 * @param {string} [options.market] locale key, defaults to the current page's locale
 * @returns {Promise<{data: *, source: 'live'|'recorded', recordedAt?: string}>}
 */
export async function lhFetch(route, { method = 'GET', body, market = getLocale().key } = {}) {
  const key = requestKey(method, route, body);
  const origin = proxyOrigin();
  if (origin) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PROXY_TIMEOUT_MS);
    try {
      const init = { method, signal: controller.signal, headers: { Accept: 'application/json' } };
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
  return fetchRecorded(market, key);
}
