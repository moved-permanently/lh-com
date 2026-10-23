/* eslint-disable no-console, import/extensions, max-classes-per-file, no-use-before-define */
/* global globalThis */
/**
 * Offline test of the live-data widgets (scripts/lh-data.js) against the recorded
 * lufthansa.com responses. No browser, no network: fetch is stubbed.
 *
 * For every imported page with a widget block (content/**.plain.html) it
 *  - runs the block's loaders (the same request builders and mappers the block uses) and
 *  - runs the block's decorate() in a minimal DOM and reads data-lh-source / data-lh-sources,
 * in these runs:
 *   A  direct www.lufthansa.com calls fail with a CORS TypeError, lh-proxy answers 502
 *   B  direct calls get Cloudflare's HTML 403 block page, lh-proxy answers 502
 *   C  direct calls answer 200 with ACAO * (the recorded JSON), lh-proxy answers 502
 *   D  direct calls and lh-proxy answer 200 (the recorded JSON)
 * plus timing checks (proxy 502 after 300 ms, refused-proxy memo, proxy and direct timeouts),
 * the destinationfinder routes (direct, never lh-proxy: direct fails -> recorded, direct ok ->
 * live, X-Portal-* headers of the market) and a comparison of every direct request (URL, X-Portal-* headers, credentials) with the
 * request the live page sent for that market (tools/source-export/har, api/*.ndjson).
 *
 * Usage: node tools/importer/test-widgets.mjs [--verbose]
 * Exit code 1 on a required miss, a wrong data-lh-source, a header mismatch or a slow fallback.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PROXY_ORIGIN, requestKey, isDirectRoute, portalHeaders,
} from '../../scripts/lh-data.js';
import { getLocale, LIVE_ORIGIN, LOCALES } from '../../scripts/locale.js';
import { readConfigRows } from '../../scripts/block-config.js';
import {
  airportSuggestionsRequest, fetchRequest, mapAirportSuggestions, searchAirports,
  searchAirportsWithSource, formatFare, fareTeaserOffersRequest, destinationFinderOffersRequest,
  fareTeaserManualRequest, mapDestinationFinderOffers,
} from '../../scripts/lh-api.js';
import decorateFlightSearch, {
  readFlightSearchSettings, loadFlightSearchData, flightSearchPrimary,
} from '../../blocks/flight-search/flight-search.js';
import decorateFareTeaser, {
  readFareTeaserSettings, fareTeaserRequests, loadFareTeaserData,
} from '../../blocks/fare-teaser/fare-teaser.js';
import decorateDestinationFinder, {
  readDestinationFinderSettings, destinationFinderRequests, loadDestinations, loadFinderContext,
} from '../../blocks/destination-finder/destination-finder.js';
import decoratePriceBar, {
  readPriceBarSettings, priceBarRequests, loadPriceBarData,
} from '../../blocks/price-bar/price-bar.js';
import decorateWeather, { weatherRequest, loadWeather } from '../../blocks/weather/weather.js';
import decorateFlightStatus from '../../blocks/flight-status/flight-status.js';
import decorateLoungeFinder, {
  readLoungeFinderSettings, loadLoungeFinderContext, loadLounges, loungeStatuses,
} from '../../blocks/lounge-finder/lounge-finder.js';
import { loungesRequest } from '../../scripts/lh-api.js';
import decorateCarRental, {
  readCarRentalSettings, TIMING as CAR_RENTAL_TIMING,
} from '../../blocks/car-rental/car-rental.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const verbose = process.argv.includes('--verbose');
const WIDGETS = ['flight-search', 'fare-teaser', 'destination-finder', 'price-bar', 'weather', 'flight-status', 'lounge-finder'];
const PREVIEW_ORIGIN = 'https://main--lh-com--moved-permanently.aem.page';
const sleep = (ms) => new Promise((resolve) => { setTimeout(resolve, ms); });

/* ------------------------------------------------------------------------------------------- */
/* Minimal DOM: enough for readConfigRows and the widgets' decorate()                          */
/* ------------------------------------------------------------------------------------------- */

const VOID = new Set(['img', 'source', 'br', 'hr', 'meta', 'link', 'input', 'wbr']);
const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
};
const decode = (s) => s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
  if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
  return ENTITIES[e.toLowerCase()] ?? m;
});
const kebab = (s) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

class BaseNode {
  constructor(nodeType) {
    this.nodeType = nodeType;
    this.parentNode = null;
  }

  get parentElement() { return this.parentNode && this.parentNode.nodeType === 1 ? this.parentNode : null; }

  get nextElementSibling() {
    if (!this.parentNode) return null;
    const siblings = this.parentNode.children;
    return siblings[siblings.indexOf(this) + 1] || null;
  }

  remove() { if (this.parentNode) this.parentNode.removeChild(this); }

  before(...nodes) { nodes.forEach((n) => this.parentNode.insertBefore(toNode(n), this)); }

  replaceWith(...nodes) {
    this.before(...nodes);
    this.remove();
  }
}

class TextNode extends BaseNode {
  constructor(text) {
    super(3);
    this.data = String(text);
  }

  get textContent() { return this.data; }

  set textContent(value) { this.data = String(value); }
}

const toNode = (n) => (typeof n === 'string' ? new TextNode(n) : n);

const SIMPLE = /^([a-z0-9]*)((?:\.[\w-]+)*)((?:\[[\w-]+(?:="[^"]*")?\])*)(:checked)?$/i;

class Element extends BaseNode {
  constructor(tagName, attrs = {}, nodeType = 1) {
    super(nodeType);
    this.tagName = tagName.toUpperCase();
    this.attrs = { ...attrs };
    this.childNodes = [];
    this.listeners = {};
    const el = this;
    this.dataset = new Proxy({}, {
      get: (t, key) => (typeof key === 'string' ? el.attrs[`data-${kebab(key)}`] : undefined),
      set: (t, key, value) => {
        el.attrs[`data-${kebab(key)}`] = String(value);
        return true;
      },
    });
  }

  get children() { return this.childNodes.filter((n) => n.nodeType === 1); }

  get firstElementChild() { return this.children[0] || null; }

  get textContent() { return this.childNodes.map((n) => n.textContent).join(''); }

  set textContent(value) { this.replaceChildren(...(value === '' || value === null || value === undefined ? [] : [String(value)])); }

  get className() { return this.attrs.class || ''; }

  set className(value) { this.attrs.class = String(value); }

  get id() { return this.attrs.id || ''; }

  set id(value) { this.attrs.id = String(value); }

  get href() {
    if (!('href' in this.attrs)) return '';
    try {
      return new URL(this.attrs.href, window.location.href).toString();
    } catch (e) {
      return this.attrs.href;
    }
  }

  set href(value) { this.attrs.href = String(value); }

  get classList() {
    const list = () => this.className.split(/\s+/).filter(Boolean);
    const write = (l) => { this.className = [...new Set(l)].join(' '); };
    return {
      contains: (c) => list().includes(c),
      add: (...c) => write([...list(), ...c]),
      remove: (...c) => write(list().filter((x) => !c.includes(x))),
      toggle: (c, force) => {
        const on = force === undefined ? !list().includes(c) : Boolean(force);
        if (on) write([...list(), c]); else write(list().filter((x) => x !== c));
        return on;
      },
    };
  }

  getAttribute(name) { return name in this.attrs ? this.attrs[name] : null; }

  setAttribute(name, value) { this.attrs[name] = String(value); }

  removeAttribute(name) { delete this.attrs[name]; }

  hasAttribute(name) { return name in this.attrs; }

  appendChild(node) {
    if (node.nodeType === 11) {
      [...node.childNodes].forEach((n) => this.appendChild(n));
      return node;
    }
    node.remove();
    node.parentNode = this;
    this.childNodes.push(node);
    return node;
  }

  insertBefore(node, ref) {
    if (node.nodeType === 11) {
      [...node.childNodes].forEach((n) => this.insertBefore(n, ref));
      return node;
    }
    node.remove();
    const i = ref ? this.childNodes.indexOf(ref) : -1;
    node.parentNode = this;
    if (i < 0) this.childNodes.push(node); else this.childNodes.splice(i, 0, node);
    return node;
  }

  removeChild(node) {
    const i = this.childNodes.indexOf(node);
    if (i >= 0) this.childNodes.splice(i, 1);
    node.parentNode = null;
    return node;
  }

  append(...nodes) { nodes.forEach((n) => this.appendChild(toNode(n))); }

  prepend(...nodes) {
    const first = this.childNodes[0] || null;
    nodes.forEach((n) => this.insertBefore(toNode(n), first));
  }

  replaceChildren(...nodes) {
    [...this.childNodes].forEach((n) => this.removeChild(n));
    this.append(...nodes);
  }

  addEventListener(type, fn) { (this.listeners[type] = this.listeners[type] || []).push(fn); }

  dispatch(type, extra = {}) {
    const event = {
      type, target: this, preventDefault() {}, ...extra,
    };
    (this.listeners[type] || []).forEach((fn) => fn(event));
  }

  focus() { document.activeElement = this; }

  select() {}

  scrollBy() {}

  scrollIntoView() {}

  getBoundingClientRect() {
    return {
      top: 0, bottom: 0, left: 0, right: 0, width: 0, height: 0,
    };
  }

  matchesSimple(selector) {
    const m = selector.match(SIMPLE);
    if (!m) return false;
    const [, tag, classes, attrs, checked] = m;
    if (tag && this.tagName !== tag.toUpperCase()) return false;
    if (classes && !classes.split('.').filter(Boolean).every((c) => this.classList.contains(c))) return false;
    if (attrs) {
      const ok = [...attrs.matchAll(/\[([\w-]+)(?:="([^"]*)")?\]/g)]
        .every(([, name, value]) => name in this.attrs
          && (value === undefined || this.attrs[name] === value));
      if (!ok) return false;
    }
    return !checked || Boolean(this.checked);
  }

  matches(selector, scope) {
    return selector.split(',').map((s) => s.trim()).some((s) => {
      const child = s.match(/^:scope\s*>\s*(.+)$/);
      if (child) return this.parentNode === scope && this.matchesSimple(child[1]);
      return this.matchesSimple(s);
    });
  }

  querySelectorAll(selector) {
    const found = [];
    const visit = (node) => node.children.forEach((child) => {
      if (child.matches(selector, this)) found.push(child);
      visit(child);
    });
    visit(this);
    return found;
  }

  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }

  closest(selector) {
    let node = this;
    while (node && node.nodeType === 1) {
      if (node.matches(selector)) return node;
      node = node.parentNode;
    }
    return null;
  }
}

function parseHtml(html) {
  const doc = new Element('body');
  const stack = [doc];
  const re = /<!--[\s\S]*?-->|<\/([a-z0-9-]+)\s*>|<([a-z0-9-]+)((?:\s+[^\s=>/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?)>|([^<]+)/gi;
  let m;
  // eslint-disable-next-line no-cond-assign
  while ((m = re.exec(html))) {
    const [, close, open, attrText, selfClose, text] = m;
    const top = stack[stack.length - 1];
    if (text !== undefined) top.appendChild(new TextNode(decode(text)));
    else if (close) {
      const i = stack.map((e) => e.tagName).lastIndexOf(close.toUpperCase());
      if (i > 0) stack.length = i;
    } else if (open) {
      const attrs = {};
      (attrText || '').replace(/([^\s=>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g, (a, n, v1, v2, v3) => {
        attrs[n.toLowerCase()] = decode(v1 ?? v2 ?? v3 ?? '');
        return a;
      });
      const el = new Element(open, attrs);
      top.appendChild(el);
      if (!selfClose && !VOID.has(open.toLowerCase())) stack.push(el);
    }
  }
  return doc;
}

const memoryStorage = () => {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
  };
};

globalThis.Node = { ELEMENT_NODE: 1, TEXT_NODE: 3 };
globalThis.document = {
  activeElement: null,
  createElement: (tag) => new Element(tag),
  createTextNode: (text) => new TextNode(text),
  createDocumentFragment: () => new Element('#fragment', {}, 11),
  querySelector: () => null,
};
globalThis.DOMParser = class {
  // eslint-disable-next-line class-methods-use-this
  parseFromString(html) { return { body: parseHtml(html) }; }
};
globalThis.window = {
  location: {},
  localStorage: memoryStorage(),
  sessionStorage: memoryStorage(),
  addEventListener() {},
};

function setPage(page) {
  const url = new URL(page, PREVIEW_ORIGIN);
  window.location = {
    pathname: url.pathname,
    href: url.href,
    origin: url.origin,
    assign(href) { this.assigned = href; },
  };
}

/* ------------------------------------------------------------------------------------------- */
/* Live reference: what the live page sent (HAR headers, HAR + ndjson URLs) per market          */
/* ------------------------------------------------------------------------------------------- */

const srcDir = path.join(root, 'tools/source-export');
const liveRequests = {}; // market → Map(url → headers or null)
Object.keys(LOCALES).forEach((market) => { liveRequests[market] = new Map(); });
const marketOfFolder = (name) => name.replace('-', '/');
fs.readdirSync(path.join(srcDir, 'har')).forEach((folder) => {
  const market = marketOfFolder(folder);
  if (!liveRequests[market]) return;
  fs.readdirSync(path.join(srcDir, 'har', folder)).filter((f) => f.endsWith('.har')).forEach((f) => {
    const har = JSON.parse(fs.readFileSync(path.join(srcDir, 'har', folder, f), 'utf8'));
    har.log.entries.forEach(({ request }) => {
      if (!request.url.startsWith(`${LIVE_ORIGIN}/service/api/`)) return;
      const headers = Object.fromEntries(request.headers
        .filter((h) => /^x-portal/i.test(h.name)).map((h) => [h.name, h.value]));
      if (!liveRequests[market].has(request.url)) liveRequests[market].set(request.url, headers);
    });
  });
});
fs.readdirSync(path.join(srcDir, 'api')).filter((f) => f.endsWith('.ndjson')).forEach((f) => {
  const market = marketOfFolder(f.replace('.ndjson', ''));
  if (!liveRequests[market]) return;
  fs.readFileSync(path.join(srcDir, 'api', f), 'utf8').split('\n').filter(Boolean).forEach((line) => {
    const { url } = JSON.parse(line);
    const href = new URL(url, LIVE_ORIGIN).toString();
    if (!liveRequests[market].has(href)) liveRequests[market].set(href, null);
  });
});
/** The X-Portal-* headers the live page sent with its /service/api GETs in a market (HAR). */
const marketHeaders = (market) => [...liveRequests[market].values()].find(Boolean) || null;

/* ------------------------------------------------------------------------------------------- */
/* fetch stub                                                                                   */
/* ------------------------------------------------------------------------------------------- */

const index = JSON.parse(fs.readFileSync(path.join(root, 'data/recorded/index.json'), 'utf8')).entries;
/** Whether the exact request is recorded (in the market or, like lhFetch, any market). */
const isRecorded = (market, request) => {
  const key = requestKey(request.method, request.route, request.body);
  return Boolean(index[`${market}|${key}`] || Object.keys(index).some((k) => k.endsWith(`|${key}`)));
};
const recordedFile = (market, method, route, body) => {
  const hit = index[`${market}|${requestKey(method, route, body)}`];
  return hit ? fs.readFileSync(path.join(root, 'data/recorded', hit.file)) : null;
};

const CLOUDFLARE_403 = '<!DOCTYPE html><html lang="en-US"><head><title>Attention Required! | Cloudflare</title></head><body><h1>Sorry, you have been blocked</h1><p>Cloudflare Ray ID: 8d2f0c1a2b3c4d5e</p></body></html>';

/** What the stub does: direct 'cors' | 'cloudflare' | 'ok' | 'hang'; proxy '502' | 'ok' | 'hang'. */
let scenario = { direct: 'cors', proxy: '502', proxyDelay: 0 };
/**
 * Answers for requests no recording has (synthetic fixtures of the lounge finder checks):
 * URL → JSON text. Direct www.lufthansa.com calls use them only when direct calls answer;
 * other hosts (Yilu) answer them, every other foreign host fails like a blocked network.
 */
const stubResponses = new Map();
let calls = [];
const directCalls = [];

const hang = (signal) => new Promise((resolve, reject) => {
  signal.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')));
});
const jsonResponse = (body, status, headers = {}) => new Response(body, {
  status, headers: { 'Content-Type': 'application/json', ...headers },
});

globalThis.fetch = async (url, init = {}) => {
  const href = String(url);
  const method = init.method || 'GET';
  if (href.startsWith('/data/recorded/')) {
    calls.push({ kind: 'recorded', href });
    const file = path.join(root, href.split('?')[0]);
    if (!fs.existsSync(file)) return new Response('not found', { status: 404 });
    return jsonResponse(fs.readFileSync(file), 200);
  }
  if (href.startsWith(`${LIVE_ORIGIN}/`)) {
    const headers = init.headers || {};
    const market = `${String(headers['X-Portal-Site'] || '').toLowerCase()}/${headers['X-Portal-Language'] || ''}`;
    calls.push({ kind: 'direct', href });
    directCalls.push({
      href, init, market, page: currentPage,
    });
    if (scenario.direct === 'cors') throw new TypeError('Failed to fetch (CORS: blocked by test)');
    if (scenario.direct === 'cloudflare') {
      return new Response(CLOUDFLARE_403, { status: 403, headers: { 'Content-Type': 'text/html; charset=UTF-8', 'cf-ray': '8d2f0c1a2b3c4d5e-FRA' } });
    }
    if (scenario.direct === 'hang') return hang(init.signal);
    if (stubResponses.has(href)) return jsonResponse(stubResponses.get(href), 200, { 'Access-Control-Allow-Origin': '*' });
    const { pathname, search } = new URL(href);
    const body = LOCALES[market] && recordedFile(market, method, `${pathname}${search}`, init.body);
    return body
      ? jsonResponse(body, 200, { 'Access-Control-Allow-Origin': '*' })
      : jsonResponse('{"error":"not recorded"}', 404, { 'Access-Control-Allow-Origin': '*' });
  }
  if (href.startsWith(PROXY_ORIGIN)) {
    calls.push({ kind: 'proxy', href });
    if (scenario.proxyDelay) await sleep(scenario.proxyDelay);
    if (scenario.proxy === 'hang') return hang(init.signal);
    if (scenario.proxy === '502') {
      return jsonResponse(JSON.stringify({ error: 'upstream-blocked', status: 403 }), 502, { 'x-lh-proxy-upstream-status': '403' });
    }
    const { pathname, search } = new URL(href);
    const market = (init.headers || {})['X-LH-Market'];
    const body = recordedFile(market, method, `${pathname}${search}`, init.body);
    return body ? jsonResponse(body, 200) : jsonResponse('{"error":"not recorded"}', 404);
  }
  if (stubResponses.has(href)) {
    calls.push({ kind: 'foreign', href });
    return jsonResponse(stubResponses.get(href), 200, { 'Access-Control-Allow-Origin': '*' });
  }
  throw new TypeError(`network access blocked in test: ${href}`);
};

let currentPage = '';
function startRun(next) {
  scenario = { proxyDelay: 0, ...next };
  window.sessionStorage.clear();
  calls = [];
}

/* ------------------------------------------------------------------------------------------- */
/* Results                                                                                      */
/* ------------------------------------------------------------------------------------------- */

const rows = [];
let failures = 0;

/**
 * @param {Object} row { run, page, locale, block, check }
 * @param {boolean} hit data arrived and mapped (or the expectation held)
 * @param {boolean} required a miss fails the run
 * @param {string} sample short sample of the mapped data
 */
function record(row, hit, required, sample = '') {
  if (!hit && required) failures += 1;
  rows.push({
    ...row, result: (!hit && required && 'FAIL') || (hit ? 'ok' : 'miss'), sample,
  });
}

/* ------------------------------------------------------------------------------------------- */
/* Loader checks per widget (fallback runs: every answer must come from the recordings)        */
/* ------------------------------------------------------------------------------------------- */

async function checkFlightSearch(base, config, locale) {
  const settings = readFlightSearchSettings(config, locale);
  const data = await loadFlightSearchData(settings, locale);
  const labelCount = Object.keys(data.labels).length;
  record(
    { ...base, check: 'labels/flightmanager' },
    data.sources['labels/flightmanager'] === 'recorded' && labelCount > 0,
    true,
    `${labelCount} labels, submit "${data.labels['submit label'] || ''}", dates "${data.labels['date label'] || ''}"`,
  );
  record(
    { ...base, check: 'labels/common' },
    data.sources['labels/common'] === 'recorded',
    false,
    data.labels['from label'] ? `from "${data.labels['from label']}"` : 'not recorded for this market',
  );
  record(
    { ...base, check: 'defaultAirport' },
    data.sources.defaultAirport === 'recorded',
    true,
    `origin ${data.origin.code} "${data.origin.name}"`,
  );
  record({ ...base, check: 'catalogs/airportnames' }, data.sources.airportNames === 'recorded', true);
  // a term the live page typed (recorded), then one never recorded (offline filter)
  const term = data.origin.name.split(/[ ,/]/)[0];
  const request = airportSuggestionsRequest(term, locale);
  let list = [];
  let source = 'none';
  try {
    const resp = await fetchRequest(request, locale, { exact: true });
    source = resp.source;
    list = mapAirportSuggestions(resp.data);
  } catch (e) { /* miss */ }
  record(
    { ...base, check: `suggestions "${term}"` },
    source === 'recorded' && list.length > 0,
    isRecorded(locale.key, request),
    list.slice(0, 3).map((a) => a.label).join(' | '),
  );
  const offline = await searchAirports(OFFLINE_TERM, locale);
  record(
    { ...base, check: `suggestions "${OFFLINE_TERM}" (offline filter)` },
    !isRecorded(locale.key, airportSuggestionsRequest(OFFLINE_TERM, locale)) && offline.length > 0,
    true,
    offline.slice(0, 3).map((a) => a.label).join(' | '),
  );
}
const OFFLINE_TERM = 'Frankf';

async function checkFareTeaser(base, config, locale) {
  const settings = readFareTeaserSettings(config, locale);
  const { fares } = fareTeaserRequests(settings, locale);
  if (verbose) console.log(`  ${base.locale} fare-teaser request: ${fares.method} ${fares.route} ${JSON.stringify(fares.body)}`);
  const data = await loadFareTeaserData(settings, locale);
  const priced = data.offers.filter((o) => o.price > 0);
  const sample = priced.slice(0, 2)
    .map((o) => `${o.originName || o.origin}-${o.destinationName || o.destination} ${formatFare(o.price, o, locale, data.localeData)}`)
    .join(', ');
  record(
    { ...base, check: `fares ${fares.route.split('/').pop()} (exact body)` },
    data.sources.fares === 'recorded' && priced.length > 0 && isRecorded(locale.key, fares),
    true,
    `${priced.length}/${settings.destinations.length || priced.length} priced, ${priced[0] ? priced[0].currency : ''}: ${sample}`,
  );
  record(
    { ...base, check: 'labels/fareteaserstatic' },
    data.sources['labels/fareteaserstatic'] === 'recorded' && Object.keys(data.labels).length > 0,
    true,
    `show more "${data.labels['show more'] || ''}"`,
  );
  record(
    { ...base, check: 'catalogs/conditions' },
    data.sources.conditions === 'recorded' && Boolean(data.conditions.html),
    true,
    `"${data.conditions.headline}"`,
  );
  record(
    { ...base, check: 'catalogs/localeData' },
    data.sources.localeData === 'recorded',
    true,
    `group "${data.localeData.group}", currency first ${data.localeData.prefixed}`,
  );
}

async function checkDestinationFinder(base, config, locale) {
  const settings = readDestinationFinderSettings(config, locale);
  const state = { ...settings, origin: { ...settings.origin } };
  const { offers } = destinationFinderRequests(state, locale);
  const [context, result] = await Promise.all([
    loadFinderContext(locale), loadDestinations(state, locale),
  ]);
  const sample = result.destinations.slice(0, 3)
    .map((d) => `${d.name} ${formatFare(d.price, d, locale, context.localeData)}`).join(', ');
  record(
    { ...base, check: `offers/${state.origin.code} (${state.tripType})` },
    result.source === 'recorded' && result.destinations.length > 0,
    isRecorded(locale.key, offers),
    `${result.destinations.length} destinations, ${result.destinations[0] ? result.destinations[0].currency : ''}: ${sample}`,
  );
  record(
    { ...base, check: 'fareteaser/recommend' },
    context.sources.origins === 'recorded' && context.origins.length > 0,
    true,
    `${context.origins.length} origins, ${state.origin.code} = "${(context.origins.find((o) => o.code === state.origin.code || o.airportCodes.includes(state.origin.code)) || {}).name || '?'}"`,
  );
  record(
    { ...base, check: 'catalogs/conditions' },
    context.sources.conditions === 'recorded',
    true,
    `"${context.conditions.footerText.slice(0, 40)}..."`,
  );
  // origin switch: the first origin city of the picker (recommend) whose offers are recorded
  const switched = context.origins
    .filter((o) => o.code !== state.origin.code)
    .map((o) => ({ ...state, origin: { code: o.code, name: o.name } }))
    .find((s) => isRecorded(locale.key, destinationFinderRequests(s, locale).offers));
  if (switched) {
    const switchedResult = await loadDestinations(switched, locale);
    record(
      { ...base, check: `origin switch offers/${switched.origin.code}` },
      switchedResult.source === 'recorded' && switchedResult.destinations.length > 0,
      true,
      switchedResult.destinations.slice(0, 3)
        .map((d) => `${d.name} ${formatFare(d.price, d, locale, context.localeData)}`).join(', '),
    );
  }
  // the other trip type: the one-way request was never recorded
  const other = { ...state, tripType: state.tripType === 'ONEWAY' ? 'RETURN' : 'ONEWAY' };
  const otherRequest = destinationFinderRequests(other, locale).offers;
  const otherResult = await loadDestinations(other, locale);
  record(
    { ...base, check: `offers/${other.origin.code} (${other.tripType})` },
    otherResult.source === 'recorded' && otherResult.destinations.length > 0,
    isRecorded(locale.key, otherRequest),
    isRecorded(locale.key, otherRequest) ? '' : 'not recorded',
  );
}

async function checkPriceBar(base, config, locale) {
  const settings = readPriceBarSettings(config);
  const data = await loadPriceBarData(settings, locale);
  const { fares } = priceBarRequests(settings, locale, data.origin);
  record(
    { ...base, check: `fares ${data.origin}-${settings.destination}` },
    Boolean(data.lowest),
    isRecorded(locale.key, fares),
    data.lowest ? formatFare(data.lowest.price, data.lowest, locale, data.localeData, { decimals: true }) : 'not recorded (no other route\'s price shown)',
  );
  record(
    { ...base, check: 'labels/stickyprice' },
    data.sources['labels/stickyprice'] === 'recorded',
    locale.lang === 'en',
    data.labels['link label'] ? `link "${data.labels['link label']}"` : 'not recorded for this language',
  );
  record({ ...base, check: 'defaultAirport' }, settings.origin || data.sources.defaultAirport === 'recorded', true, `origin ${data.origin}`);
}

const weatherLocation = (config) => (((config.location || {}).text || '').match(/[A-Z]{3}/) || [''])[0];

async function checkWeather(base, config, locale) {
  const location = weatherLocation(config);
  const request = weatherRequest({ location }, locale);
  const { weather, source } = await loadWeather({ location, unit: 'C' }, locale);
  record(
    { ...base, check: request.route },
    source === 'recorded' && Boolean(weather),
    isRecorded(locale.key, request),
    weather ? `${weather.days.length} days, today ${weather.current.temp}°C ${weather.current.condition}, humidity ${weather.current.humidity}` : 'not recorded',
  );
}

async function checkFlightStatus(base, config, locale) {
  const term = FLIGHT_STATUS_TERM[locale.lang];
  const { list, source } = await searchAirportsWithSource(term, locale);
  record(
    { ...base, check: `suggestions "${term}"` },
    source === 'recorded' && list.length > 0,
    true,
    list.slice(0, 3).map((a) => a.label).join(' | '),
  );
}
const FLIGHT_STATUS_TERM = { en: 'Frankfurt', de: 'Frankfurt' };

/** Home city of a market's lounge searches (catalogs/lounges/{status}/{city}). */
const LOUNGE_HOME_CITY = {
  'de/en': 'FRA', 'de/de': 'FRA', 'at/de': 'VIE', 'gb/en': 'LON',
};
/** The lounge finder's heading in the page language (recorded labels/loungefinder). */
const LOUNGE_HEADING = { de: 'Finden Sie Ihre Lounge', en: 'Find your airport lounge' };

async function checkLoungeFinder(base, config, locale) {
  const settings = readLoungeFinderSettings(config);
  const context = await loadLoungeFinderContext(locale);
  const heading = context.labels['loungefinder.form.headline.redesignHeadlineText'];
  record(
    { ...base, check: `labels/loungefinder/lh/${locale.lang}` },
    context.sources.labels === 'recorded' && heading === LOUNGE_HEADING[locale.lang],
    true,
    `${Object.keys(context.labels).length} labels, heading "${heading || ''}", submit "${context.labels['loungefinder.form.submit.cta'] || ''}"`,
  );
  record(
    { ...base, check: 'catalogs/lounges/cities' },
    context.sources.cities === 'recorded' && context.cities.length > 0,
    true,
    `${context.cities.length} cities: ${context.cities.slice(0, 3).map((c) => `${c.name} (${c.code})`).join(', ')}`,
  );
  // every status of the select for the market's home city: recorded or a known gap
  const city = LOUNGE_HOME_CITY[locale.key];
  await inSequence(loungeStatuses(settings).filter((st) => st.id !== 'ECO').map(({ id }) => async () => {
    const request = loungesRequest({ status: id, city });
    const found = await loadLounges({ status: id, city }, locale, settings);
    record(
      { ...base, check: `lounges/${id}/${city}` },
      found.sources.lounges === 'recorded' && found.lounges.length > 0,
      isRecorded(locale.key, request),
      isRecorded(locale.key, request) ? `${found.lounges.length} lounges` : 'not recorded yet',
    );
  }));
}

const CHECKS = {
  'flight-search': checkFlightSearch,
  'fare-teaser': checkFareTeaser,
  'destination-finder': checkDestinationFinder,
  'price-bar': checkPriceBar,
  weather: checkWeather,
  'flight-status': checkFlightStatus,
  'lounge-finder': checkLoungeFinder,
};

/* ------------------------------------------------------------------------------------------- */
/* decorate() checks: data-lh-source on the block and the rendered data                         */
/* ------------------------------------------------------------------------------------------- */

const DECORATE = {
  'flight-search': decorateFlightSearch,
  'fare-teaser': decorateFareTeaser,
  'destination-finder': decorateDestinationFinder,
  'price-bar': decoratePriceBar,
  weather: decorateWeather,
  'flight-status': decorateFlightStatus,
  'lounge-finder': decorateLoungeFinder,
};

/** Whether the block's primary data is recorded (so the fallback can show it). */
function primaryRecorded(name, config, locale) {
  if (name === 'fare-teaser') return isRecorded(locale.key, fareTeaserRequests(readFareTeaserSettings(config, locale), locale).fares);
  if (name === 'destination-finder') {
    const settings = readDestinationFinderSettings(config, locale);
    return isRecorded(locale.key, destinationFinderRequests(settings, locale).offers);
  }
  if (name === 'price-bar') {
    const settings = readPriceBarSettings(config);
    const recordedDefault = recordedFile(locale.key, 'GET', '/service/api/defaultAirport');
    const origin = settings.origin || (recordedDefault && JSON.parse(recordedDefault).marketDefaultAirport.iataCode) || locale.homeAirport;
    return Boolean(settings.destination) && isRecorded(locale.key, priceBarRequests(settings, locale, origin).fares);
  }
  if (name === 'weather') return isRecorded(locale.key, weatherRequest({ location: weatherLocation(config) }, locale));
  if (name === 'flight-status') return isRecorded(locale.key, airportSuggestionsRequest(FLIGHT_STATUS_TERM[locale.lang], locale));
  return true; // flight-search: labels/flightmanager and defaultAirport are recorded in every market
}

/**
 * Whether a grid destination finder's offers (destinationfinder/destination/finder, a direct
 * route) are recorded in the block's own market: the stub answers a direct call only with that
 * market's recording, else lhFetch falls back to another market's recording ('recorded').
 */
const gridRecordedInMarket = (market) => Object.keys(index)
  .some((k) => k.startsWith(`${market}|GET /service/api/destinationfinder/destination/finder/`));

/** Which data-lh-source a block must show in a run. */
function expectedSource(name, run, recorded, { grid = false, market = '', own = true } = {}) {
  const directPrimary = ['flight-search', 'flight-status', 'lounge-finder'].includes(name) || grid;
  const live = run === 'D' || (run === 'C' && directPrimary);
  if (live && grid && recorded) return gridRecordedInMarket(market) ? 'live' : 'recorded';
  // the stub answers only the market's own recordings; another market's copy is the fallback
  if (live && recorded && !own) return 'recorded';
  if (live) return recorded ? 'live' : null; // the stub answers live only what is recorded
  return recorded ? 'recorded' : null;
}

/** What the block rendered, as a short text (and whether it shows data). */
function renderedSample(name, block) {
  const count = (sel) => block.querySelectorAll(sel).length;
  switch (name) {
    case 'flight-search': {
      const field = block.querySelector('.flight-search-origin');
      const input = field && field.querySelector('input');
      const submit = block.querySelector('.flight-search-submit');
      const value = input ? input.value : '';
      return { ok: Boolean(value), text: `origin "${value}", submit "${submit ? submit.textContent : ''}"` };
    }
    case 'fare-teaser': {
      const prices = block.querySelectorAll('.fare-teaser-price').map((p) => p.textContent).filter(Boolean);
      return { ok: prices.length > 0, text: `${prices.length} prices: ${prices.slice(0, 3).join(', ')}` };
    }
    case 'destination-finder': {
      const prices = block.querySelectorAll('.destination-finder-price, .destination-finder-tile-price').map((p) => p.textContent);
      return { ok: prices.length > 0, text: `${count('.destination-finder-item, .destination-finder-tile-link')} items: ${prices.slice(0, 3).join(', ')}` };
    }
    case 'price-bar': {
      const price = block.querySelector('.price-bar-price');
      return { ok: Boolean(price && price.textContent), text: `price "${price ? price.textContent : ''}"` };
    }
    case 'weather':
      return { ok: block.classList.contains('weather-loaded'), text: `${count('.weather-day')} days, ${(block.querySelector('.weather-temp') || { textContent: '' }).textContent}` };
    case 'flight-status': {
      const options = block.querySelectorAll('li[role="option"]').map((li) => li.textContent);
      return { ok: options.length > 0, text: `${options.length} suggestions: ${options.slice(0, 2).join(' | ')}` };
    }
    case 'lounge-finder': {
      const title = block.querySelector('.lounge-finder-heading');
      const options = block.querySelectorAll('option').filter((o) => o.value);
      return { ok: Boolean(title && title.textContent) && options.length > 0, text: `heading "${title ? title.textContent : ''}", ${options.length} statuses` };
    }
    default: return { ok: false, text: '' };
  }
}

async function waitFor(test, timeoutMs = 8000) {
  const start = Date.now();
  while (!test()) {
    if (Date.now() - start > timeoutMs) return false;
    // eslint-disable-next-line no-await-in-loop
    await sleep(5);
  }
  return true;
}

async function checkDecorate(run, { page, html }, name, blockIndex) {
  const locale = getLocale(page);
  setPage(page);
  currentPage = page;
  const doc = parseHtml(html);
  const block = doc.querySelectorAll(`div.${name}`)[blockIndex];
  const config = readConfigRows(block);
  const recorded = primaryRecorded(name, config, locale);
  const grid = name === 'destination-finder' && block.classList.contains('grid');
  const own = name !== 'weather'
    || Boolean(index[`${locale.key}|${requestKey('GET', weatherRequest({ location: weatherLocation(config) }, locale).route)}`]);
  const expected = expectedSource(name, run, recorded, { grid, market: locale.key, own });
  const start = Date.now();
  const result = DECORATE[name](block);
  if (name === 'flight-status') {
    // type into the first airport field (route tab) like a visitor
    const input = block.querySelector('input[role="combobox"]');
    input.value = FLIGHT_STATUS_TERM[locale.lang];
    input.focus();
    input.dispatch('input');
  }
  await result;
  const marked = await waitFor(() => block.hasAttribute('data-lh-source')
    && (name !== 'flight-status' || block.querySelectorAll('li[role="option"]').length > 0
      || block.getAttribute('data-lh-source') === 'none'));
  // the last renders run right after the marker
  await sleep(1);
  const source = block.getAttribute('data-lh-source');
  const rendered = renderedSample(name, block);
  const ok = marked && (expected ? source === expected && rendered.ok : true);
  record(
    {
      run, locale: locale.key, page, block: name, check: `data-lh-source=${source || '(unset)'}${expected ? ` (expect ${expected})` : ' (primary not recorded)'}`,
    },
    ok,
    Boolean(expected),
    `${rendered.text}; ${Date.now() - start} ms; ${block.getAttribute('data-lh-sources') || ''}`,
  );
}

/* ------------------------------------------------------------------------------------------- */
/* Pages                                                                                        */
/* ------------------------------------------------------------------------------------------- */

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    if (d.isDirectory()) return walk(p);
    return d.name.endsWith('.plain.html') ? [p] : [];
  });
}

const contentDir = path.join(root, 'content');
const pages = walk(contentDir)
  .map((file) => ({
    file,
    html: fs.readFileSync(file, 'utf8'),
    page: `/${path.relative(contentDir, file).replace(/\\/g, '/').replace(/\.plain\.html$/, '')}`,
  }))
  .filter(({ html }) => WIDGETS.some((w) => html.includes(`class="${w}`)));
const blocks = pages.flatMap((p) => {
  const doc = parseHtml(p.html);
  return WIDGETS.flatMap((name) => doc.querySelectorAll(`div.${name}`).map((b, i) => ({
    ...p, name, index: i, config: readConfigRows(b),
  })));
});

const inSequence = (jobs) => jobs.reduce((done, job) => done.then(job), Promise.resolve());

async function loaderRun(run) {
  await inSequence(blocks.map((b) => () => {
    const locale = getLocale(b.page);
    currentPage = b.page;
    return CHECKS[b.name]({
      run, locale: locale.key, page: b.page, block: b.name,
    }, b.config, locale);
  }));
}

const decorateRun = (run) => inSequence(blocks.map((b) => () => checkDecorate(run, b, b.name, b.index)));

const proxyCallsToDirectRoutes = () => calls.filter((c) => c.kind === 'proxy'
  && isDirectRoute(c.href.slice(PROXY_ORIGIN.length))).length;
const summary = {};
const summarize = (run) => {
  summary[run] = {
    direct: calls.filter((c) => c.kind === 'direct').length,
    proxy: calls.filter((c) => c.kind === 'proxy').length,
    recorded: calls.filter((c) => c.kind === 'recorded').length,
    proxyDirectRoutes: proxyCallsToDirectRoutes(),
  };
  if (summary[run].proxyDirectRoutes) {
    record({ run, check: 'direct routes never go through lh-proxy' }, false, true, `${summary[run].proxyDirectRoutes} calls`);
  }
};

// A: CORS TypeError on direct calls, proxy 502
startRun({ direct: 'cors', proxy: '502' });
await loaderRun('A');
await decorateRun('A');
summarize('A');

// B: Cloudflare HTML 403 on direct calls, proxy 502
startRun({ direct: 'cloudflare', proxy: '502' });
await loaderRun('B');
await decorateRun('B');
summarize('B');

// C: direct calls answer (ACAO *), proxy 502
startRun({ direct: 'ok', proxy: '502' });
await decorateRun('C');
summarize('C');

// D: direct calls and proxy answer
startRun({ direct: 'ok', proxy: 'ok' });
await decorateRun('D');
summarize('D');

/* ------------------------------------------------------------------------------------------- */
/* Timing: the fallback adds no visible delay                                                   */
/* ------------------------------------------------------------------------------------------- */

currentPage = '';
const deEn = getLocale('/de/en/homepage');
const offersFra = fareTeaserOffersRequest({ origin: 'FRA', tripType: 'R' });
async function timed(fn) {
  const start = performance.now();
  const value = await fn();
  return { value, ms: Math.round(performance.now() - start) };
}
const callsOf = (kind) => calls.filter((c) => c.kind === kind).length;

{
  // warm the recorded index (one fetch per page view in the browser, done long before)
  startRun({ direct: 'cors', proxy: '502' });
  await fetchRequest(offersFra, deEn, { exact: true });

  startRun({ direct: 'cors', proxy: '502', proxyDelay: 300 });
  const slow502 = await timed(() => fetchRequest(offersFra, deEn, { exact: true }));
  record(
    { run: 'T', locale: 'de/en', check: 'proxy 502 after 300 ms -> recorded within 350 ms' },
    slow502.value.source === 'recorded' && slow502.ms <= 350,
    true,
    `${slow502.ms} ms, source ${slow502.value.source}, proxy calls ${callsOf('proxy')}`,
  );
  const memoBefore = callsOf('proxy');
  const memo = await timed(() => fetchRequest(offersFra, deEn, { exact: true }));
  record(
    { run: 'T', locale: 'de/en', check: 'refused proxy remembered -> no proxy call' },
    memo.value.source === 'recorded' && callsOf('proxy') === memoBefore,
    true,
    `${memo.ms} ms, proxy calls during the request ${callsOf('proxy') - memoBefore}, memo ${window.sessionStorage.getItem('lh-proxy-blocked')}`,
  );

  startRun({ direct: 'cors', proxy: 'hang' });
  const hung = await timed(() => fetchRequest(offersFra, deEn, { exact: true }));
  record(
    { run: 'T', locale: 'de/en', check: 'proxy hangs -> recorded after the 2.5 s cap' },
    hung.value.source === 'recorded' && hung.ms >= 2400 && hung.ms <= 2700,
    true,
    `${hung.ms} ms`,
  );

  const labelsRoute = { method: 'GET', route: '/service/api/labels/flightmanager/lh/en' };
  startRun({ direct: 'cors', proxy: '502' });
  const cors = await timed(() => fetchRequest(labelsRoute, deEn));
  record(
    { run: 'T', locale: 'de/en', check: 'direct CORS error -> recorded at once' },
    cors.value.source === 'recorded' && cors.ms <= 50,
    true,
    `${cors.ms} ms`,
  );
  startRun({ direct: 'hang', proxy: '502' });
  const directHung = await timed(() => fetchRequest(labelsRoute, deEn));
  record(
    { run: 'T', locale: 'de/en', check: 'direct call hangs -> recorded after the 3 s cap' },
    directHung.value.source === 'recorded' && directHung.ms >= 2900 && directHung.ms <= 3200,
    true,
    `${directHung.ms} ms`,
  );
  startRun({ direct: 'ok', proxy: '502' });
  const live = await timed(() => fetchRequest(labelsRoute, deEn));
  record(
    { run: 'T', locale: 'de/en', check: 'direct call answers -> live, no proxy call' },
    live.value.source === 'live' && live.value.via === 'direct' && callsOf('proxy') === 0,
    true,
    `${live.ms} ms, via ${live.value.via}`,
  );
}

/* ------------------------------------------------------------------------------------------- */
/* Destination finder (destinationfinder/*): direct call, recordings as fallback, no lh-proxy  */
/* ------------------------------------------------------------------------------------------- */

{
  const fraOffers = destinationFinderOffersRequest({ origin: 'FRA', cabin: 'E', months: [0, 11], tripType: 'RETURN' });
  record(
    { run: 'G', check: 'destinationfinder routes are direct; fare teaser and weather are not' },
    isDirectRoute(fraOffers.route) && isDirectRoute('/service/api/destinationfinder/campaign/FRA')
      && !isDirectRoute(fareTeaserOffersRequest({ origin: 'FRA' }).route)
      && !isDirectRoute(fareTeaserManualRequest({ travels: [{ origin: 'FRA', destination: 'NYC' }] }).route)
      && !isDirectRoute('/service/api/lhg-fare-teaser/fareteaser/recommend')
      && !isDirectRoute('/service/api/aircore/weather/FRA'),
    true,
    fraOffers.route,
  );
  const offerCount = (value) => mapDestinationFinderOffers(value.data).offers.length;
  // the proxy answers in every scenario: a destinationfinder call must still never use it
  await inSequence([['cors', 'direct CORS error'], ['cloudflare', 'direct Cloudflare 403 page']].map(([direct, label]) => async () => {
    startRun({ direct, proxy: 'ok' });
    const r = await timed(() => fetchRequest(fraOffers, deEn, { exact: true }));
    record(
      { run: 'G', locale: 'de/en', check: `${label} -> recorded, no proxy call` },
      r.value.source === 'recorded' && r.value.via === 'recording' && offerCount(r.value) > 0
        && callsOf('proxy') === 0 && callsOf('direct') === 1 && r.ms <= 50,
      true,
      `${r.ms} ms, ${offerCount(r.value)} offers via ${r.value.via}, direct ${callsOf('direct')}, proxy ${callsOf('proxy')}`,
    );
  }));
  startRun({ direct: 'hang', proxy: 'ok' });
  const hung = await timed(() => fetchRequest(fraOffers, deEn, { exact: true }));
  record(
    { run: 'G', locale: 'de/en', check: 'direct call hangs -> recorded after the 3 s cap' },
    hung.value.source === 'recorded' && hung.ms >= 2900 && hung.ms <= 3200 && callsOf('proxy') === 0,
    true,
    `${hung.ms} ms, proxy ${callsOf('proxy')}`,
  );
  // direct answers: live in every market that has a grid, with that market's X-Portal-* headers
  const gridMarkets = { 'de/en': 'FRA', 'de/de': 'FRA', 'at/de': 'VIE', 'gb/en': 'LHR' };
  await inSequence(Object.entries(gridMarkets).map(([market, origin]) => async () => {
    startRun({ direct: 'ok', proxy: 'ok' });
    const locale = getLocale(`/${market}/homepage`);
    const request = destinationFinderOffersRequest({ origin });
    const from = directCalls.length;
    const r = await fetchRequest(request, locale, { exact: true }).catch((e) => ({ error: e.message }));
    const sent = directCalls.slice(from).find((c) => c.href === `${LIVE_ORIGIN}${request.route}`);
    const headers = sent ? sent.init.headers : {};
    const sameHeaders = JSON.stringify(headers) === JSON.stringify(portalHeaders(market))
      && headers['X-Portal-Site'] === locale.country.toUpperCase()
      && headers['X-Portal-Language'] === locale.lang
      && headers['X-Portal'] === 'LH';
    const live = gridRecordedInMarket(market) && isRecorded(market, request);
    const expect = live ? 'live' : 'recorded or none';
    const got = r.error ? 'none' : r.source;
    record(
      { run: 'G', locale: market, check: `offers/${origin}: direct, market headers, ${expect}` },
      Boolean(sent) && sameHeaders && sent.init.credentials === 'omit' && sent.init.mode === 'cors'
        && callsOf('proxy') === 0 && (live ? got === 'live' && r.via === 'direct' : got !== 'live'),
      true,
      `${got}${r.via ? ` via ${r.via}` : ''}, sent ${JSON.stringify(headers)} credentials ${sent ? sent.init.credentials : '-'}`,
    );
  }));
}

/* ------------------------------------------------------------------------------------------- */
/* Lounge finder: form labels per market, a search (recorded / synthetic answer / none), the    */
/* Economy flow (Yilu products). The lounge answers are not recorded yet: the fixtures below    */
/* are synthetic, in the shape the live app reads (4ca8ff36.chunk.js), to test the rendering.   */
/* ------------------------------------------------------------------------------------------- */

const LOUNGE_BLOCK = '<div class="lounge-finder"><div><div>Image base</div><div>/content/dam/lh/images/lounges</div></div></div>';
const loungeWeek = (weekday, weekend) => [...Array(5).fill([weekday]), ...Array(2).fill([weekend])];
const LOUNGE_FIXTURE = JSON.stringify({
  lounges: [{
    loungeid: '14072',
    loungename: 'Lufthansa Senator Lounge',
    category: 'SENATOR_LOUNGE',
    airportname: 'Frankfurt/Main',
    loungeLocation: { terminal: 'Terminal 1', level: 'Level 3', gateInfo: 'Gate A26' },
    loungeOpeningHours: loungeWeek({ from: '05:30', to: '22:00' }, { from: '06:00', to: '21:00' }),
    loungeDescription: '',
    loungefeatures: ['WLAN', 'SHOWER', 'FAX_MACHINE'],
  }, {
    loungeid: '99999',
    loungename: 'Lufthansa Business Lounge',
    category: 'BUSINESS_LOUNGE',
    airportname: 'Frankfurt/Main',
    plainLocation: 'Concourse B',
    openingHours: '24h',
    loungeOpeningHours: [],
    loungefeatures: [],
  }],
});
const YILU_FIXTURE = JSON.stringify({ items: [{ item: { productId: '106', regularPrice: 35, currency: 'EUR' } }] });

/** Decorates a synthetic lounge finder on a market page, optionally searching city/status. */
async function runLoungeFinder(market, { city, status } = {}) {
  const page = `/${market}/lounges`;
  setPage(page);
  if (city && status) window.location.search = `?city=${city}&status=${status}`;
  currentPage = page;
  const block = parseHtml(LOUNGE_BLOCK).querySelector('div.lounge-finder');
  decorateLoungeFinder(block);
  await waitFor(() => block.hasAttribute('data-lh-source'));
  if (city && status) {
    block.querySelector('form').dispatch('submit');
    await waitFor(() => block.hasAttribute('data-lh-searched')
      && !block.querySelector('.lounge-finder-results').hasAttribute('aria-busy'));
  }
  await sleep(1);
  return block;
}

const textOf = (node) => (node ? node.textContent : '');

{
  // labels per market: at/de is German (its live snapshot showed the app's English fallback texts)
  await inSequence(Object.keys(LOCALES).map((market) => async () => {
    startRun({ direct: 'cors', proxy: '502' });
    const locale = getLocale(`/${market}/lounges`);
    const block = await runLoungeFinder(market);
    const heading = textOf(block.querySelector('.lounge-finder-heading'));
    const options = block.querySelectorAll('option').filter((o) => o.value).map((o) => o.value);
    const groups = block.querySelectorAll('optgroup').map((g) => g.label);
    record(
      { run: 'L', locale: market, block: 'lounge-finder', check: 'form labels (direct fails -> recorded)' },
      heading === LOUNGE_HEADING[locale.lang] && block.getAttribute('data-lh-source') === 'recorded'
        && options.join() === 'FIR,BUS,ECO,HON,SEN,FTL,STA' && groups.length === 2,
      true,
      `"${heading}", submit "${textOf(block.querySelector('.lounge-finder-submit'))}", groups ${groups.join(' / ')}, ${options.join(',')}; ${block.getAttribute('data-lh-sources')}`,
    );
  }));

  // a search without any answer: the "no lounge" message, data-lh-source none
  startRun({ direct: 'cors', proxy: '502' });
  const none = await runLoungeFinder('at/de', { city: 'VIE', status: 'SEN' });
  record(
    { run: 'L', locale: 'at/de', block: 'lounge-finder', check: 'SEN/VIE not recorded -> no-lounge label' },
    textOf(none.querySelector('.lounge-finder-empty')).startsWith('Leider haben wir keine Informationen')
      && String(none.getAttribute('data-lh-sources')).includes('lounges:none')
      && none.getAttribute('data-lh-source') !== 'live',
    true,
    `"${textOf(none.querySelector('.lounge-finder-empty'))}"; ${none.getAttribute('data-lh-sources')}`,
  );

  // a direct answer (synthetic fixture): cards, grouped opening hours, German feature labels
  const senFra = `${LIVE_ORIGIN}${loungesRequest({ status: 'SEN', city: 'FRA' }).route}`;
  stubResponses.set(senFra, LOUNGE_FIXTURE);
  startRun({ direct: 'ok', proxy: '502' });
  const found = await runLoungeFinder('de/de', { city: 'FRA', status: 'SEN' });
  const cards = found.querySelectorAll('.lounge-finder-card');
  // the test DOM matches single selectors only: descend step by step
  const inside = (root, ...selectors) => selectors.reduce((nodes, sel) => nodes
    .flatMap((n) => n.querySelectorAll(sel)), [root]);
  const rowsText = inside(cards[0] || found, '.lounge-finder-hours', 'tr').map((tr) => tr.children.map((td) => td.textContent).join(' '));
  const amenities = inside(found, '.lounge-finder-amenities-list', 'li').map((li) => li.textContent);
  const [img] = inside(found, '.lounge-finder-image', 'img');
  record(
    { run: 'L', locale: 'de/de', block: 'lounge-finder', check: 'SEN/FRA direct answer -> cards' },
    cards.length === 2 && found.getAttribute('data-lh-source') === 'live'
      && textOf(found.querySelector('.lounge-finder-results-heading')) === 'Ergebnisse (2)'
      && rowsText[0] === 'Montag - Freitag 05:30 - 22:00' && rowsText[1] === 'Wochenende 06:00 - 21:00'
      && amenities.join() === 'W-LAN,Dusche,Faxgerät'
      && textOf(found.querySelector('.lounge-finder-badge')) === 'Senator Lounge'
      && Boolean(img) && img.src === `${LIVE_ORIGIN}/content/dam/lh/images/lounges/14072-square.jpg.transform/lh-dcep-transform-width-720/img.jpg`
      && textOf(inside(cards[1] || found, '.lounge-finder-hours', 'p')[0]) === '24h',
    true,
    `${cards.length} cards, ${rowsText.join(' | ')}; ${amenities.join(', ')}; ${found.getAttribute('data-lh-sources')}`,
  );
  // the same search with the direct call failing: no recording -> no-lounge label
  startRun({ direct: 'cors', proxy: '502' });
  const offline = await runLoungeFinder('de/de', { city: 'FRA', status: 'SEN' });
  record(
    { run: 'L', locale: 'de/de', block: 'lounge-finder', check: 'SEN/FRA direct fails, not recorded -> none' },
    !offline.querySelector('.lounge-finder-card')
      && String(offline.getAttribute('data-lh-sources')).includes('lounges:none'),
    true,
    `"${textOf(offline.querySelector('.lounge-finder-empty')).slice(0, 40)}..."`,
  );

  // Economy: Yilu products + BUS lounges -> only purchasable lounges, price and purchase link
  const busFra = `${LIVE_ORIGIN}${loungesRequest({ status: 'BUS', city: 'FRA' }).route}`;
  const yiluFra = 'https://amp.yiluhub.com/product/v1/products?storeId=6662ff1e7d41365f96988306&airport=FRA';
  stubResponses.set(busFra, LOUNGE_FIXTURE);
  stubResponses.set(yiluFra, YILU_FIXTURE);
  startRun({ direct: 'ok', proxy: '502' });
  const eco = await runLoungeFinder('de/en', { city: 'FRA', status: 'ECO' });
  const purchase = eco.querySelector('.lounge-finder-purchase');
  const buy = purchase && purchase.querySelector('a');
  record(
    { run: 'L', locale: 'de/en', block: 'lounge-finder', check: 'ECO/FRA: Yilu products -> purchase link' },
    eco.querySelectorAll('.lounge-finder-card').length === 1 && Boolean(buy)
      && buy.href.startsWith('https://lufthansa.travelintegration.com/lounges/product?loungeId=106&airportIataCode=FRA')
      && textOf(purchase.querySelector('p')) === 'from 35 EUR'
      && eco.getAttribute('data-lh-source') === 'live',
    true,
    `${textOf(purchase && purchase.querySelector('p'))}, ${buy ? buy.href.slice(0, 90) : 'no link'}; ${eco.getAttribute('data-lh-sources')}`,
  );
  // Yilu unreachable: no purchasable lounge is known -> no-lounge label, products none
  stubResponses.delete(yiluFra);
  startRun({ direct: 'ok', proxy: '502' });
  const ecoOffline = await runLoungeFinder('de/en', { city: 'FRA', status: 'ECO' });
  record(
    { run: 'L', locale: 'de/en', block: 'lounge-finder', check: 'ECO/FRA: Yilu fails -> no-lounge label' },
    !ecoOffline.querySelector('.lounge-finder-card')
      && textOf(ecoOffline.querySelector('.lounge-finder-empty')).startsWith('Unfortunately, no lounge')
      && String(ecoOffline.getAttribute('data-lh-sources')).includes('products:none'),
    true,
    ecoOffline.getAttribute('data-lh-sources'),
  );
  // a missing city or status: the required labels, no request
  startRun({ direct: 'ok', proxy: '502' });
  const empty = await runLoungeFinder('de/de');
  const before = callsOf('direct');
  empty.querySelector('form').dispatch('submit');
  await sleep(1);
  const errors = empty.querySelectorAll('.lounge-finder-error').filter((e) => !e.hidden).map((e) => e.textContent);
  record(
    { run: 'L', locale: 'de/de', block: 'lounge-finder', check: 'submit without city and status -> errors' },
    errors.join() === 'Stadt ist erforderlich,Reiseklasse oder Reisestatus ist erforderlich' && callsOf('direct') === before,
    true,
    errors.join(' | '),
  );
  stubResponses.clear();
  window.location.search = '';
}

/* ------------------------------------------------------------------------------------------- */
/* Car rental (Meili): #mli-root as the live component, the fallback form when the script fails */
/* or the app does not mount, a mount replacing it. No network: the script tag is simulated.    */
/* ------------------------------------------------------------------------------------------- */

{
  const scripts = [];
  let scriptOutcome = 'error'; // 'error' | 'load' | 'mount'
  const docQuery = document.querySelector;
  document.head = {
    append(script) {
      scripts.push(script);
      setTimeout(() => {
        if (scriptOutcome === 'error') script.onerror(new Error('blocked'));
        else {
          script.onload();
          if (scriptOutcome === 'mount') {
            const rootEl = currentCarRoot();
            if (rootEl) rootEl.classList.add('mli-loaded');
          }
        }
      }, 5);
    },
  };
  let carBlock = null;
  const currentCarRoot = () => carBlock && carBlock.querySelectorAll('div').find((d) => d.id === 'mli-root');
  CAR_RENTAL_TIMING.mount = 150;
  CAR_RENTAL_TIMING.poll = 10;
  CAR_RENTAL_TIMING.late = 400;
  const runCarRental = async (page, html, outcome) => {
    setPage(page);
    scriptOutcome = outcome;
    carBlock = parseHtml(html).querySelector('div.car-rental');
    await decorateCarRental(carBlock);
    return carBlock;
  };
  const carHtml = (rows) => `<div class="car-rental">${rows.map(([k, v]) => `<div><div>${k}</div><div>${v}</div></div>`).join('')}</div>`;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const pickUpDe = new Intl.DateTimeFormat('de-DE', { weekday: 'short', day: 'numeric', month: 'short' }).format(tomorrow);

  // script blocked: fallback form, German labels, today's default dates, action = live page
  const failed = await runCarRental('/de/de/sixt', carHtml([['Partner ID', '105.14'], ['Fallback link', '<a href="https://www.lufthansa.com/de/de/sixt">https://www.lufthansa.com/de/de/sixt</a>']]), 'error');
  const root = currentCarRoot();
  const form = failed.querySelector('form');
  const dateValues = failed.querySelectorAll('.car-rental-date').map((b) => textOf(b.querySelector('.car-rental-field-value')));
  record(
    { run: 'R', locale: 'de/de', block: 'car-rental', check: 'script error -> fallback form to the live page' },
    Boolean(root) && root.getAttribute('data-ptid') === '105.14' && root.getAttribute('data-locale') === 'de-DE'
      && scripts.length === 1 && scripts[0].src === 'https://direct-ux.meili.travel/index.js'
      && Boolean(form) && form.getAttribute('action') === 'https://www.lufthansa.com/de/de/sixt'
      && failed.getAttribute('data-lh-source') === 'none' && failed.getAttribute('data-state') === 'fallback'
      && textOf(failed.querySelector('.car-rental-submit')) === 'Suchen'
      && dateValues[0] === pickUpDe && !dateValues.includes('Fr., 23. Okt.')
      && failed.querySelectorAll('button').every((b) => b.type === 'submit'),
    true,
    `root ${root ? `${root.getAttribute('data-ptid')} ${root.getAttribute('data-locale')}` : 'missing'}, action ${form ? form.getAttribute('action') : '-'}, dates ${dateValues.join(' / ')}; ${failed.getAttribute('data-lh-sources')}`,
  );

  // script loads, app never mounts: fallback after the mount timeout; ptid by page name, en-GB
  scripts.length = 0;
  const silent = await runCarRental('/gb/en/hertz', '<div class="car-rental"></div>', 'load');
  const silentRoot = currentCarRoot();
  record(
    { run: 'R', locale: 'gb/en', block: 'car-rental', check: 'no mount within the timeout -> fallback' },
    Boolean(silentRoot) && silentRoot.getAttribute('data-ptid') === '105.13' && silentRoot.getAttribute('data-locale') === 'en-GB'
      && silent.getAttribute('data-lh-sources') === 'meili:timeout'
      && silent.querySelector('form').getAttribute('action') === 'https://www.lufthansa.com/gb/en/hertz'
      && textOf(silent.querySelector('.car-rental-submit')) === 'Search',
    true,
    `ptid ${silentRoot ? silentRoot.getAttribute('data-ptid') : '-'}, ${silent.getAttribute('data-lh-sources')}, submit "${textOf(silent.querySelector('.car-rental-submit'))}"`,
  );
  // ... and a late mount removes the fallback again
  silentRoot.classList.add('mli-loaded');
  await waitFor(() => silent.getAttribute('data-state') === 'mounted', 1000);
  record(
    { run: 'R', locale: 'gb/en', block: 'car-rental', check: 'late mount -> fallback removed' },
    silent.getAttribute('data-lh-source') === 'live' && !silent.querySelector('form'),
    true,
    `${silent.getAttribute('data-state')}, ${silent.getAttribute('data-lh-sources')}`,
  );

  // the app mounts: no fallback, live
  scripts.length = 0;
  const live = await runCarRental('/at/de/mietwagenangebote', '<div class="car-rental"></div>', 'mount');
  const liveRoot = currentCarRoot();
  record(
    { run: 'R', locale: 'at/de', block: 'car-rental', check: 'app mounts -> live, no fallback' },
    live.getAttribute('data-lh-source') === 'live' && !live.querySelector('form')
      && liveRoot.getAttribute('data-ptid') === '105.11' && liveRoot.getAttribute('data-locale') === 'de-AT',
    true,
    `${live.getAttribute('data-state')}, ${liveRoot.getAttribute('data-ptid')} ${liveRoot.getAttribute('data-locale')}`,
  );
  // a foreign script row is ignored
  const settings = readCarRentalSettings(readConfigRows(parseHtml(carHtml([['Script', 'https://evil.example/x.js']])).querySelector('div.car-rental')), getLocale('/de/en/sixt'), '/de/en/sixt');
  record(
    { run: 'R', locale: 'de/en', block: 'car-rental', check: 'only meili.travel scripts' },
    settings.script === 'https://direct-ux.meili.travel/index.js' && settings.locale === 'en-DE' && settings.ptid === '105.14',
    true,
    JSON.stringify(settings),
  );
  delete document.head;
  document.querySelector = docQuery;
}

/* ------------------------------------------------------------------------------------------- */
/* Direct requests = the live page's requests (URL, X-Portal-* headers, no credentials)         */
/* ------------------------------------------------------------------------------------------- */

const headerStats = { calls: 0, sameUrl: 0, notCaptured: new Set() };
directCalls.forEach(({
  href, init, market, page,
}) => {
  if (!page) return; // timing checks
  const pageMarket = getLocale(page).key;
  headerStats.calls += 1;
  const sent = Object.fromEntries(Object.entries(init.headers || {}).filter(([k]) => /^x-portal/i.test(k)));
  const live = liveRequests[pageMarket].get(href);
  const expectedHeaders = live || marketHeaders(pageMarket);
  const sameHeaders = JSON.stringify(Object.entries(sent).sort())
    === JSON.stringify(Object.entries(expectedHeaders || {}).sort());
  const noCookies = init.credentials === 'omit' && init.mode === 'cors';
  const noOtherHeaders = Object.keys(init.headers || {}).every((k) => /^x-portal/i.test(k));
  if (liveRequests[pageMarket].has(href)) headerStats.sameUrl += 1;
  else headerStats.notCaptured.add(`${pageMarket} ${href.replace(LIVE_ORIGIN, '')}`);
  if (!sameHeaders || !noCookies || !noOtherHeaders || market !== pageMarket) {
    record(
      { run: 'H', locale: pageMarket, page, check: `direct ${href.replace(LIVE_ORIGIN, '')}` },
      false,
      true,
      `sent ${JSON.stringify(init.headers)} credentials ${init.credentials}; live ${JSON.stringify(expectedHeaders)}`,
    );
  }
});
// the request builders give exactly the live URL wherever the live page made the request
const unexpected = [...headerStats.notCaptured].filter((u) => !u.includes(`query=${OFFLINE_TERM}`));
record(
  { run: 'H', check: 'direct request headers = live X-Portal-* headers of the market' },
  headerStats.calls > 0 && !rows.some((r) => r.run === 'H' && r.result === 'FAIL'),
  true,
  `${headerStats.calls} direct calls, credentials omit, X-Portal-* only: ${Object.keys(LOCALES).map((m) => `${m} ${JSON.stringify(portalHeaders(m))}`).join('; ')}`,
);
record(
  { run: 'H', check: 'direct request URL = a URL the live page requested' },
  headerStats.sameUrl > 0,
  true,
  `${headerStats.sameUrl}/${headerStats.calls} identical; never requested by the live page: ${unexpected.join(', ') || '-'} (plus the deliberately unrecorded term "${OFFLINE_TERM}")`,
);

/* ------------------------------------------------------------------------------------------- */
/* Output                                                                                       */
/* ------------------------------------------------------------------------------------------- */

const cols = ['run', 'locale', 'page', 'block', 'check', 'result', 'sample'];
// run B repeats run A's loader table: printed only where it differs (or with --verbose)
const loaderKey = (r) => `${r.page}|${r.block}|${r.check}|${r.result}|${r.sample}`;
const loaderA = new Set(rows.filter((r) => r.run === 'A' && !r.check.startsWith('data-lh-source')).map(loaderKey));
const printed = rows.filter((r) => verbose || r.run !== 'B' || r.check.startsWith('data-lh-source') || !loaderA.has(loaderKey(r)));
const width = Object.fromEntries(cols.map((c) => [c, Math.min(
  { sample: 110, check: 52, page: 40 }[c] || 20,
  Math.max(c.length, ...printed.map((r) => String(r[c] ?? '').length)),
)]));
const line = (r) => cols.map((c) => String(r[c] ?? '').slice(0, width[c]).padEnd(width[c])).join(' | ');
console.log(line(Object.fromEntries(cols.map((c) => [c, c]))));
console.log(cols.map((c) => '-'.repeat(width[c])).join('-|-'));
printed.forEach((r) => console.log(line(r)));
console.log('');
rows.filter((r) => r.run === 'H').forEach((r) => console.log(`${r.check}: ${r.result}\n  ${r.sample}`));
const sameAsA = rows.filter((r) => r.run === 'B' && !r.check.startsWith('data-lh-source')).length;
console.log(`\nrun B loader checks: ${sameAsA}, ${rows.filter((r) => r.run === 'B' && !r.check.startsWith('data-lh-source') && loaderA.has(loaderKey(r))).length} identical to run A (not repeated above)`);
Object.entries(summary).forEach(([run, s]) => console.log(`run ${run}: ${s.direct} direct calls, ${s.proxy} proxy calls, ${s.recorded} recorded files read, ${s.proxyDirectRoutes} direct routes sent to the proxy`));
console.log(`${pages.length} pages, ${blocks.length} widget blocks, ${rows.length} checks, ${rows.filter((r) => r.result === 'ok').length} ok, ${rows.filter((r) => r.result === 'miss').length} optional misses, ${failures} failures`);
process.exit(failures ? 1 : 0);
