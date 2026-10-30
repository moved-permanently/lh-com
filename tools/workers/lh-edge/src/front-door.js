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
 *   /<cc>/<ll>/<page>.sdui, pilot roots other than ch, ...) answer from the origin there.
 * A host lookup and up to eight regular expressions on the path: no parse, no subrequest.
 */

// the main host's paths for lh-edge's routes: solo pages, feeds, www's endpoints, the ch market,
// the service endpoints, OneTrust and the fonts (in this order; each expression is a search, as
// RegExp.test)
export const EDGE_PATHS = [
  /\.solo(_continue|\.continue)(\..*)?$/,
  /^(\/content\/(mobile|dam)\/.*|(\/api\/content)?\/graphql\/execute\.json\/.*|\/\.well-known\/(assetlinks\.json|apple-app-site-association)|\/service\/secured\/api\/core\/authenticate\/loginPageUrl|\/service\/secured\/api\/search|\/service\/secured\/api\/core\/booking\/(defaultairport|bookinglist)|\/apps\/dcep\/deeplink\/goodfortrain\/stele|.*\.csi-owa-[a-z-]+\.json)$/,
  /^(\/|\/[a-z]{2}(\/[a-z]{2})?\/?|\/content\/experience-fragments\/.+\.csi-xf\.json|\/service-worker\.js|\/sitemap\/[^/]+\.xml\.gz|\/[a-z]{2}(\/[a-z]{2})?\/llms\.txt|\/service\/secured\/api\/captcha\/verify|\/content\/lh\/markets\/.+\.(sdui|csi-offline\.json)|.+\.(aircraft\.json|changelocale(\.html)?|mfe\.html))$/,
  /^(\/ch\/.+|\/sitemap\/sitemap_lh(_ch_[a-z]{2})?\.xml)$/,
  /^(\/service\/secured\/api\/.+|\/sso\/.+|\/deeplink\/.+|\/apps\/dcep\/deeplink\/.+|\/apps\/selectlanguage|\/[a-z]{2}\/[a-z]{2}\/.+\.v2\.sdui)$/,
  // OneTrust from the host (cdn.cookielaw.org) and the immutable brand fonts (src/onetrust.js)
  /^(\/onetrust\/.+|\/logos\/.+|\/fonts\/lufthansa\/v\d+(\.\d+)*\/[^/]+)$/,
];
// the gate's paths (lh-backends)
export const GATE_PATH = /^\/(migration-status.*|_lh-auth\/.*)$/;

const list = (v) => String(v || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

/** The front-door host of a request (its own host in FRONT_DOOR_HOSTS), or null. */
export function frontDoorOf(request, env) {
  const host = new URL(request.url).hostname.toLowerCase();
  return list(env.FRONT_DOOR_HOSTS).includes(host) ? host : null;
}

/** Where a front-door path goes: 'gate', 'edge' (lh-edge's routes) or 'origin'. */
export function frontDoorTarget(pathname) {
  if (GATE_PATH.test(pathname)) return 'gate';
  return EDGE_PATHS.some((re) => re.test(pathname)) ? 'edge' : 'origin';
}

/** The request with X-LH-Public-Host set to the front-door host (the routes' public host). */
export function withPublicHost(request, host) {
  const req = new Request(request);
  req.headers.set('x-lh-public-host', host);
  return req;
}
