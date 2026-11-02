/**
 * lh-edge as the front door of the main host (FRONT_DOOR_HOSTS; lufthansa.turnsthe.page): its own
 * rules decide per path (they began as the rules of the CDN that was in front of the retired
 * first host):
 * - EDGE_PATHS: lh-edge's routes (X-LH-Public-Host is the request's host, whatever the request
 *   sent);
 * - GATE_PATH, /migration-status* and /_lh-auth/*: lh-backends' gate (BACKENDS) with
 *   X-LH-Public-Host;
 * - everything else: the Edge Delivery origin, as Adobe's reference Worker (the pass-through),
 *   so paths lh-edge answers on lufthansa-edge but the main host leaves to the origin (the short
 *   /<cc>/<ll>/<page>.sdui, pilot roots of countries the host does not show, ...) answer from the
 *   origin there;
 * - the pages and sitemap files of the countries whose market roots the host serves (the live
 *   market roots of a go-live wave, tools/reports/markets/go-live.md, and the host's
 *   PILOT_COUNTRIES_BY_HOST: today ch) go to lh-edge's market route.
 * A host lookup, up to ten regular expressions and a set lookup on the path: no parse, no
 * subrequest.
 */
/* eslint-disable import/no-relative-packages */
import { LOCALE_TABLE } from '../../../../scripts/locale-table.js';
/* eslint-enable import/no-relative-packages */

// the main host's paths for lh-edge's routes: solo pages, feeds, www's endpoints, the sitemap
// index, the service endpoints, OneTrust, the fonts and www's design-system files (in this order;
// each expression is a search, as RegExp.test)
export const EDGE_PATHS = [
  /\.solo(_continue|\.continue)(\..*)?$/,
  /^(\/content\/(mobile|dam)\/.*|(\/api\/content)?\/graphql\/execute\.json\/.*|\/\.well-known\/(assetlinks\.json|apple-app-site-association)|\/service\/secured\/api\/core\/authenticate\/loginPageUrl|\/service\/secured\/api\/search|\/service\/secured\/api\/core\/booking\/(defaultairport|bookinglist)|\/apps\/dcep\/deeplink\/goodfortrain\/stele|.*\.csi-owa-[a-z-]+\.json)$/,
  /^(\/|\/[a-z]{2}(\/[a-z]{2})?\/?|\/content\/experience-fragments\/.+\.csi-xf\.json|\/service-worker\.js|\/sitemap\/[^/]+\.xml\.gz|\/[a-z]{2}(\/[a-z]{2})?\/llms\.txt|\/service\/secured\/api\/captcha\/verify|\/content\/lh\/markets\/.+\.(sdui|csi-offline\.json)|.+\.(aircraft\.json|changelocale(\.html)?|mfe\.html))$/,
  // the sitemap index (the market roots' pages and sitemap files: MARKET_PATH below)
  /^\/sitemap\/sitemap_lh\.xml$/,
  /^(\/service\/secured\/api\/.+|\/sso\/.+|\/deeplink\/.+|\/apps\/dcep\/deeplink\/.+|\/apps\/selectlanguage|\/[a-z]{2}\/[a-z]{2}\/.+\.v2\.sdui)$/,
  // OneTrust from the host (cdn.cookielaw.org) and the immutable brand fonts (src/onetrust.js),
  // www's design-system files with the brand fonts (src/digitalhangar.js)
  /^(\/onetrust\/.+|\/logos\/.+|\/fonts\/lufthansa\/v\d+(\.\d+)*\/[^/]+|\/digitalhangar\/.+)$/,
  // OF1's generative search API, exactly these three (src/of1.js; /api/content/graphql above)
  /^\/api\/(generate|suggest|personalize)$/,
];
// the gate's paths (lh-backends)
export const GATE_PATH = /^\/(migration-status.*|_lh-auth\/.*)$/;
// the pages and sitemap files of a country whose market roots the host serves (frontDoorCountries)
const MARKET_PATH = /^\/([a-z]{2})\/.+$|^\/sitemap\/sitemap_lh_([a-z]{2})_[a-z]{2}\.xml$/;

const list = (v) => String(v || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

// the countries of the locale table's live market roots, per table (made once)
const liveMarketCountries = new WeakMap();
function liveCountriesOf(table) {
  if (!liveMarketCountries.has(table)) {
    liveMarketCountries.set(table, new Set(Object.values(table)
      .filter((r) => r.status === 'live' && r.documents === 'language').map((r) => r.country)));
  }
  return liveMarketCountries.get(table);
}
// the var PILOT_COUNTRIES_BY_HOST ("host=cc|cc; host2=cc"), parsed once per value
const pilotByHost = new Map();
function pilotCountriesOf(value) {
  const key = String(value || '');
  if (!pilotByHost.has(key)) {
    const map = {};
    key.split(';').forEach((entry) => {
      const [host, ccs] = entry.split('=').map((s) => (s || '').trim().toLowerCase());
      if (host && ccs) map[host] = ccs.split('|').map((c) => c.trim()).filter(Boolean);
    });
    pilotByHost.set(key, map);
  }
  return pilotByHost.get(key);
}

/**
 * The countries whose pages the front door sends to lh-edge's market route: the countries of the
 * live market roots (a wave of tools/reports/markets/go-live.md) and the host's pilot countries
 * (PILOT_COUNTRIES_BY_HOST: today ch).
 */
export function frontDoorCountries(host, env, table = LOCALE_TABLE) {
  const live = liveCountriesOf(table);
  const pilot = pilotCountriesOf(env.PILOT_COUNTRIES_BY_HOST)[String(host || '').toLowerCase()] || [];
  return pilot.length ? new Set([...live, ...pilot]) : live;
}

/** The front-door host of a request (its own host in FRONT_DOOR_HOSTS), or null. */
export function frontDoorOf(request, env) {
  const host = new URL(request.url).hostname.toLowerCase();
  return list(env.FRONT_DOOR_HOSTS).includes(host) ? host : null;
}

/**
 * Where a front-door path goes: 'gate', 'edge' (lh-edge's routes) or 'origin'. countries: the
 * countries whose pages and sitemap files go to lh-edge (frontDoorCountries).
 */
export function frontDoorTarget(pathname, countries = new Set()) {
  if (GATE_PATH.test(pathname)) return 'gate';
  if (EDGE_PATHS.some((re) => re.test(pathname))) return 'edge';
  const m = pathname.match(MARKET_PATH);
  return m && countries.has(m[1] || m[2]) ? 'edge' : 'origin';
}

/** The request with X-LH-Public-Host set to the front-door host (the routes' public host). */
export function withPublicHost(request, host) {
  const req = new Request(request);
  req.headers.set('x-lh-public-host', host);
  return req;
}
