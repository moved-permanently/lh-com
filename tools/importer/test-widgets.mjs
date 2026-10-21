/* eslint-disable no-console, import/extensions, max-classes-per-file */
/* global globalThis */
/**
 * Offline test of the live-data widgets against the recorded lufthansa.com responses.
 *
 * For every imported page with a widget block (content/**.plain.html) it reads the block's
 * authored config like the block does (readConfigRows), runs the block's request builders and
 * loaders, and fetches through lhFetch with a fetch stub: the proxy answers 502 (upstream
 * blocked, as today) and /data/recorded/* is served from disk. No browser, no network.
 *
 * Usage: node tools/importer/test-widgets.mjs [--verbose]
 * Exit code 1 when a required lookup misses: flight-search labels/catalogs, fare-teaser fares,
 * labels and catalogs in every locale; destination-finder, price-bar and weather wherever the
 * exact request is recorded.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PROXY_ORIGIN, requestKey } from '../../scripts/lh-data.js';
import { getLocale } from '../../scripts/locale.js';
import { readConfigRows } from '../../scripts/block-config.js';
import {
  airportSuggestionsRequest, fetchRequest, mapAirportSuggestions, searchAirports, formatFare,
} from '../../scripts/lh-api.js';
import { readFlightSearchSettings, loadFlightSearchData } from '../../blocks/flight-search/flight-search.js';
import {
  readFareTeaserSettings, fareTeaserRequests, loadFareTeaserData,
} from '../../blocks/fare-teaser/fare-teaser.js';
import {
  readDestinationFinderSettings, destinationFinderRequests, loadDestinations, loadFinderContext,
} from '../../blocks/destination-finder/destination-finder.js';
import { readPriceBarSettings, priceBarRequests, loadPriceBarData } from '../../blocks/price-bar/price-bar.js';
import { weatherRequest, loadWeather } from '../../blocks/weather/weather.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const verbose = process.argv.includes('--verbose');
const WIDGETS = ['flight-search', 'fare-teaser', 'destination-finder', 'price-bar', 'weather'];

/* ------------------------------------------------------------------------------------------- */
/* Minimal DOM for .plain.html block tables (what readConfigRows and the settings use)         */
/* ------------------------------------------------------------------------------------------- */

const VOID = new Set(['img', 'source', 'br', 'hr', 'meta', 'link', 'input', 'wbr']);
const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
};
const decode = (s) => s.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e) => {
  if (e[0] === '#') return String.fromCodePoint(e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
  return ENTITIES[e.toLowerCase()] ?? m;
});

class TextNode {
  constructor(text) { this.nodeType = 3; this.text = text; }

  get textContent() { return this.text; }
}

class Element {
  constructor(tagName, attrs = {}) {
    this.nodeType = 1;
    this.tagName = tagName.toUpperCase();
    this.attrs = attrs;
    this.childNodes = [];
  }

  get children() { return this.childNodes.filter((n) => n.nodeType === 1); }

  get textContent() { return this.childNodes.map((n) => n.textContent).join(''); }

  getAttribute(name) { return name in this.attrs ? this.attrs[name] : null; }

  get classList() {
    const list = (this.attrs.class || '').split(/\s+/).filter(Boolean);
    return { contains: (c) => list.includes(c) };
  }

  matches(selector) {
    return selector.split(',').map((s) => s.trim()).some((s) => {
      const m = s.match(/^([a-z0-9]*)(?:\.([\w-]+))?(?:\[([\w-]+)\])?$/i);
      if (!m) return false;
      const [, tag, cls, attr] = m;
      return (!tag || this.tagName === tag.toUpperCase())
        && (!cls || this.classList.contains(cls))
        && (!attr || attr in this.attrs);
    });
  }

  querySelectorAll(selector) {
    const found = [];
    const visit = (node) => node.children.forEach((child) => {
      if (child.matches(selector)) found.push(child);
      visit(child);
    });
    visit(this);
    return found;
  }

  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
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
    if (text !== undefined) top.childNodes.push(new TextNode(decode(text)));
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
      top.childNodes.push(el);
      if (!selfClose && !VOID.has(open.toLowerCase())) stack.push(el);
    }
  }
  return doc;
}

/* ------------------------------------------------------------------------------------------- */
/* fetch stub: proxy 502, recorded data from disk                                               */
/* ------------------------------------------------------------------------------------------- */

const calls = [];
globalThis.fetch = async (url, init = {}) => {
  const href = String(url);
  calls.push(`${init.method || 'GET'} ${href}`);
  if (href.startsWith(PROXY_ORIGIN)) {
    return new Response(JSON.stringify({ error: 'upstream-blocked' }), { status: 502 });
  }
  if (href.startsWith('/data/recorded/')) {
    const file = path.join(root, href.split('?')[0]);
    if (!fs.existsSync(file)) return new Response('not found', { status: 404 });
    return new Response(fs.readFileSync(file), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }
  throw new TypeError(`network access blocked in test: ${href}`);
};

const index = JSON.parse(fs.readFileSync(path.join(root, 'data/recorded/index.json'), 'utf8')).entries;
/** Whether the exact request is recorded (in the market or, like lhFetch, any market). */
const isRecorded = (market, request) => {
  const key = requestKey(request.method, request.route, request.body);
  return Boolean(index[`${market}|${key}`] || Object.keys(index).some((k) => k.endsWith(`|${key}`)));
};

/* ------------------------------------------------------------------------------------------- */
/* Checks per widget                                                                           */
/* ------------------------------------------------------------------------------------------- */

const rows = [];
let failures = 0;

/**
 * @param {Object} row { page, locale, block, check }
 * @param {boolean} hit data arrived and mapped
 * @param {boolean} required a miss fails the run
 * @param {string} sample short sample of the mapped data
 */
function record(row, hit, required, sample = '') {
  const result = hit ? 'hit' : 'miss';
  if (!hit && required) failures += 1;
  rows.push({
    ...row, result: !hit && required ? 'MISS (required)' : result, sample,
  });
}

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
    data.labels['from label'] ? `from "${data.labels['from label']}"` : 'not recorded for this language',
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
  const offlineTerm = 'Frankf';
  const offline = await searchAirports(offlineTerm, locale);
  record(
    { ...base, check: `suggestions "${offlineTerm}" (offline filter)` },
    !isRecorded(locale.key, airportSuggestionsRequest(offlineTerm, locale)) && offline.length > 0,
    true,
    offline.slice(0, 3).map((a) => a.label).join(' | '),
  );
}

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
    true,
    `link "${data.labels['link label'] || ''}"`,
  );
  record({ ...base, check: 'defaultAirport' }, settings.origin || data.sources.defaultAirport === 'recorded', true, `origin ${data.origin}`);
}

async function checkWeather(base, config, locale) {
  const text = (k) => (config[k] || {}).text || '';
  const location = (text('location').match(/[A-Z]{3}/) || [''])[0];
  const request = weatherRequest({ location }, locale);
  const { weather, source } = await loadWeather({ location, unit: 'C' }, locale);
  record(
    { ...base, check: request.route },
    source === 'recorded' && Boolean(weather),
    isRecorded(locale.key, request),
    weather ? `${weather.days.length} days, today ${weather.current.temp}°C ${weather.current.condition}, humidity ${weather.current.humidity}` : 'not recorded',
  );
}

const CHECKS = {
  'flight-search': checkFlightSearch,
  'fare-teaser': checkFareTeaser,
  'destination-finder': checkDestinationFinder,
  'price-bar': checkPriceBar,
  weather: checkWeather,
};

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
  .map((file) => ({ file, html: fs.readFileSync(file, 'utf8') }))
  .filter(({ html }) => WIDGETS.some((w) => html.includes(`class="${w}`)));

// one check after the other: the table follows page and block order
const jobs = pages.flatMap(({ file, html }) => {
  const page = `/${path.relative(contentDir, file).replace(/\\/g, '/').replace(/\.plain\.html$/, '')}`;
  const locale = getLocale(page);
  const doc = parseHtml(html);
  return WIDGETS.flatMap((name) => doc.querySelectorAll(`div.${name}`).map((block) => () => CHECKS[name](
    { locale: locale.key, page, block: name },
    readConfigRows(block),
    locale,
  )));
});
await jobs.reduce((done, job) => done.then(job), Promise.resolve());

const cols = ['locale', 'page', 'block', 'check', 'result', 'sample'];
const width = Object.fromEntries(cols.map((c) => [c, Math.min(
  c === 'sample' ? 90 : 48,
  Math.max(c.length, ...rows.map((r) => String(r[c]).length)),
)]));
const line = (r) => cols.map((c) => String(r[c]).slice(0, width[c]).padEnd(width[c])).join(' | ');
console.log(line(Object.fromEntries(cols.map((c) => [c, c]))));
console.log(cols.map((c) => '-'.repeat(width[c])).join('-|-'));
rows.forEach((r) => console.log(line(r)));
const proxied = calls.filter((c) => c.includes(PROXY_ORIGIN)).length;
console.log(`\n${pages.length} pages, ${rows.length} checks, ${rows.filter((r) => r.result === 'hit').length} hits, ${failures} required misses; ${proxied} proxy calls answered 502, ${calls.length - proxied} recorded files read`);
process.exit(failures ? 1 : 0);
