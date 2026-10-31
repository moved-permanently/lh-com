/**
 * lh-edge: the router in front of lh-com. An ordered route table: the compatibility routes that
 * answer what clients of www.lufthansa.com ask (the app's web view, the Message Center JSON, the
 * App Links files), then everything else passed to the Edge Delivery origin like Adobe's
 * reference Worker (src/edge.js). Hosts and origins are [vars], secrets are secrets, bindings
 * have generic names: the Worker moves to another account and zone unchanged. See README.md.
 */
// eslint-disable-next-line import/no-unresolved -- Workers runtime module (tests: a shim)
import { WorkerEntrypoint } from 'cloudflare:workers';
import { prelude, passThrough, originFetch } from './edge.js';
import { solo, soloPath } from './solo.js';
import { sdui, isSduiPath } from './sdui-route.js';
import {
  sduiWeb, isWebSduiPath, shortSdui, isShortSduiPath,
} from './sdui-web.js';
import { graphql, isGraphqlPath, graphqlPath } from './graphql.js';
import { dam, isDamPath } from './dam.js';
import { siteSearch, isSearchPath } from './search.js';
import { backends, isBackendsPath, isLoginReturn } from './backends.js';
import { entry, entryPath } from './entry.js';
import { loginUrl, LOGIN_PATH } from './login.js';
import {
  defaultAirport, bookingList, DEFAULT_AIRPORT_PATH, BOOKING_LIST_PATH,
} from './booking.js';
import { g4tKiosk, G4T_PATH } from './g4t.js';
import { selectLanguage, SELECT_LANGUAGE_PATH } from './select-language.js';
import { owa, OWA } from './owa.js';
import WELL_KNOWN from './well-known.js';
import {
  relay, eventsList, eventsWebhook, EVENTS_PATH, WEBHOOK_PATH,
} from './events.js';
import { xfCatalog, isXfPath } from './xf.js';
import { aircraftList, isAircraftPath } from './aircraft.js';
import { changeLocale, isChangeLocalePath } from './changelocale.js';
import { sitemapGz, isSitemapGzPath } from './sitemap.js';
import { aemKeepAlive } from './aem-keepalive.js';
import { llmsTxt, isLlmsPath } from './llms.js';
import { captchaVerify, CAPTCHA_PATH } from './captcha.js';
import { mfe, isMfePath } from './mfe.js';
import { csiOffline, isOfflinePath } from './offline.js';
import { aliasHostOf, forAlias } from './alias.js';
import { siteOf, siteEnv } from './sites.js';
import {
  market, marketPath, marketSitemap, isMarketSitemapPath, withoutConditions,
} from './markets.js';
import {
  routerConfig, choose, defaultOrigin, finish,
} from './router.js';
import { referrerRefusal } from './referrer.js';
import { frontDoorOf, frontDoorTarget, withPublicHost } from './front-door.js';
import { headUrlHost, rewriteHeadUrls } from './head-urls.js';
import { rewriteBrandIcons } from './brand-icons.js';
import { urlForm, urlFormUnlessPage, isLongPagePath } from './url-forms.js';
import {
  onetrust, isOnetrustPath, fonts, isFontsPath, withGeoCookie,
} from './onetrust.js';
import { digitalhangar, isDigitalhangarPath } from './digitalhangar.js';

/**
 * /service-worker.js: www's file (the code repository's copy, served by the origin) with www's
 * headers: application/javascript, public, max-age=21600.
 */
async function serviceWorker(request, env) {
  const resp = await originFetch(new Request(request.url, { method: 'GET', headers: request.headers }), env, new URL('/service-worker.js', `https://${env.ORIGIN}`));
  if (!resp.ok) return resp;
  return new Response(request.method === 'HEAD' ? null : await resp.text(), {
    headers: { 'content-type': 'application/javascript', 'cache-control': 'public, max-age=21600', 'x-lh-edge-route': 'service-worker' },
  });
}

/** The App Links / Universal Links files of www, byte for byte, as application/json. */
function wellKnown(request) {
  const body = WELL_KNOWN[new URL(request.url).pathname];
  return new Response(request.method === 'HEAD' ? null : body, {
    headers: {
      'content-type': 'application/json',
      'cache-control': 'public, max-age=3600',
      'x-lh-edge-route': 'well-known',
    },
  });
}

/** The Message Center JSON: the messages Worker (service binding MESSAGES). */
async function messages(request, env) {
  if (!env.MESSAGES) return new Response('Message Center not bound', { status: 503 });
  // the /api/content/graphql/... alias reaches the messages Worker in its /graphql/... form
  const url = new URL(request.url);
  const canonical = graphqlPath(url.pathname);
  if (canonical === url.pathname) return env.MESSAGES.fetch(request);
  url.pathname = canonical;
  return env.MESSAGES.fetch(new Request(url.href, request));
}

/**
 * The routes, first match wins. match(url, request) -> boolean; handle(request, env, ctx).
 * Packages add their routes before login-return, entry and backends; pass-through comes last.
 */
export const ROUTES = [
  {
    // brief 150: OneTrust from the page's own host (/onetrust/*, /logos/*: cdn.cookielaw.org)
    name: 'onetrust',
    match: (url, request) => ['GET', 'HEAD'].includes(request.method) && isOnetrustPath(url.pathname),
    handle: onetrust,
  },
  {
    // the site's versioned brand fonts, immutable
    name: 'fonts',
    match: (url, request) => ['GET', 'HEAD'].includes(request.method) && isFontsPath(url.pathname),
    handle: (request, env) => fonts(request, env, passThrough),
  },
  {
    // www's design-system files (the brand fonts) from www, upstream's headers as they are
    name: 'digitalhangar',
    match: (url, request) => ['GET', 'HEAD'].includes(request.method) && isDigitalhangarPath(url.pathname),
    handle: digitalhangar,
  },
  {
    // publish events (package 6): the stored events and the site config's webhook
    name: 'events',
    match: (url, request) => ['GET', 'HEAD'].includes(request.method) && url.pathname === EVENTS_PATH,
    handle: eventsList,
  },
  {
    name: 'events-webhook',
    match: (url, request) => request.method === 'POST' && url.pathname === WEBHOOK_PATH,
    handle: eventsWebhook,
  },
  {
    // AMS rest A3: www's fragment catalog, the aircraft list of any page, the service worker
    name: 'csi-xf',
    match: (url, request) => ['GET', 'HEAD'].includes(request.method) && isXfPath(url.pathname),
    handle: xfCatalog,
  },
  {
    name: 'aircraft',
    match: (url, request) => ['GET', 'HEAD'].includes(request.method) && isAircraftPath(url.pathname),
    handle: aircraftList,
  },
  {
    // AMS rest A4: www's country and language selector
    name: 'changelocale',
    match: (url, request) => request.method === 'POST' && isChangeLocalePath(url.pathname),
    handle: changeLocale,
  },
  {
    // AMS rest A4 part 2: the micro-frontend hand-off (POST <page>.mfe.html; GET like the page)
    name: 'mfe',
    match: (url) => isMfePath(url.pathname),
    handle: mfe,
  },
  {
    // brief 80 part 4: www's offline page list (full content paths; the short form 404)
    name: 'csi-offline',
    match: (url, request) => ['GET', 'HEAD'].includes(request.method) && isOfflinePath(url.pathname),
    handle: csiOffline,
  },
  {
    // market roots' sitemaps and the index with them (src/markets.js), where the host serves
    // market roots; elsewhere the two routes below as before
    name: 'market-sitemap',
    match: (url, request) => ['GET', 'HEAD'].includes(request.method) && isMarketSitemapPath(url.pathname),
    handle: (request, env, ctx) => {
      const gz = isSitemapGzPath(new URL(request.url).pathname);
      return marketSitemap(request, env, gz ? sitemapGz : passThrough, ctx);
    },
  },
  {
    // AMS rest A7: www's gzipped sitemap names
    name: 'sitemap-gz',
    match: (url, request) => ['GET', 'HEAD'].includes(request.method) && isSitemapGzPath(url.pathname),
    handle: sitemapGz,
  },
  {
    // AMS rest A8: generated llms.txt per market and locale (the curated static files win)
    name: 'llms',
    match: (url, request) => ['GET', 'HEAD'].includes(request.method) && isLlmsPath(url.pathname),
    handle: llmsTxt,
  },
  {
    name: 'service-worker',
    match: (url, request) => ['GET', 'HEAD'].includes(request.method) && url.pathname === '/service-worker.js',
    handle: serviceWorker,
  },
  {
    name: 'well-known',
    match: (url) => Object.prototype.hasOwnProperty.call(WELL_KNOWN, url.pathname),
    handle: wellKnown,
  },
  {
    name: 'message-center',
    match: (url) => graphqlPath(url.pathname).startsWith('/graphql/execute.json/Message-Center/'),
    handle: messages,
  },
  {
    name: 'graphql',
    match: (url, request) => ['GET', 'HEAD', 'OPTIONS'].includes(request.method) && isGraphqlPath(url.pathname),
    handle: graphql,
  },
  {
    name: 'sdui',
    match: (url, request) => ['GET', 'HEAD'].includes(request.method) && isSduiPath(url.pathname),
    handle: sdui,
  },
  {
    // web pages as SDUI on their full content paths (brief 78 part 2); short spellings: the page
    name: 'sdui-web',
    match: (url, request) => ['GET', 'HEAD'].includes(request.method) && isWebSduiPath(url.pathname),
    handle: sduiWeb,
  },
  {
    name: 'sdui-web-short',
    match: (url, request) => ['GET', 'HEAD'].includes(request.method) && isShortSduiPath(url.pathname),
    handle: shortSdui,
  },
  {
    name: 'search',
    match: (url, request) => request.method === 'POST' && isSearchPath(url.pathname),
    handle: siteSearch,
  },
  {
    // AMS rest A6: www's bot check URL, any method (always 200), before the backends route
    name: 'captcha-verify',
    match: (url) => url.pathname === CAPTCHA_PATH,
    handle: captchaVerify,
  },
  {
    name: 'login-url',
    match: (url, request) => ['GET', 'HEAD'].includes(request.method) && url.pathname === LOGIN_PATH,
    handle: loginUrl,
  },
  {
    name: 'default-airport',
    match: (url, request) => ['GET', 'HEAD'].includes(request.method) && url.pathname === DEFAULT_AIRPORT_PATH,
    handle: defaultAirport,
  },
  {
    name: 'booking-list',
    match: (url, request) => ['GET', 'HEAD'].includes(request.method) && url.pathname === BOOKING_LIST_PATH,
    handle: bookingList,
  },
  {
    name: 'g4t-kiosk',
    match: (url, request) => request.method === 'POST' && url.pathname === G4T_PATH,
    handle: g4tKiosk,
  },
  {
    name: 'select-language',
    match: (url, request) => ['GET', 'HEAD'].includes(request.method) && url.pathname === SELECT_LANGUAGE_PATH,
    handle: selectLanguage,
  },
  {
    name: 'owa',
    match: (url, request) => ['GET', 'HEAD'].includes(request.method) && OWA.test(url.pathname),
    handle: owa,
  },
  {
    name: 'dam',
    match: (url, request) => ['GET', 'HEAD'].includes(request.method) && isDamPath(url.pathname),
    handle: dam,
  },
  {
    name: 'solo',
    match: (url, request) => ['GET', 'HEAD'].includes(request.method) && soloPath(url.pathname) !== null,
    handle: solo,
  },
  {
    // the return from the login provider (/?code=..&state=/de/en/...): before the entry redirects
    name: 'login-return',
    match: (url, request) => isLoginReturn(url, request),
    handle: backends,
  },
  {
    name: 'entry',
    match: (url, request) => ['GET', 'HEAD'].includes(request.method) && entryPath(url.pathname) !== null,
    handle: entry,
  },
  {
    // www's remaining server endpoints, answered by lh-backends (after every route of lh-edge)
    name: 'backends',
    match: (url) => isBackendsPath(url.pathname),
    handle: backends,
  },
  {
    // market roots answered from their language's documents (src/markets.js; pilot roots only on
    // PILOT_HOSTS, elsewhere the pass-through)
    name: 'market',
    match: (url) => marketPath(url.pathname) !== null,
    handle: market,
  },
  {
    name: 'pass-through',
    match: () => true,
    handle: passThrough,
  },
];

export function routeOf(request) {
  const url = new URL(request.url);
  return ROUTES.find((r) => r.match(url, request));
}

// the POSTs lh-edge answers itself that change state: the referrer check (src/referrer.js)
const REFERRER_CHECKED = new Set(['changelocale', 'mfe', 'g4t-kiosk']);

// routes that hand on a document or a backend's answer as it is keep a revalidation's conditions
// (the origin's or the backend's 304 is right); every other route makes its answer from
// documents, so a GET or HEAD reaches it without them and gets the whole answer (with them, the
// source document's 304 or a 404 came back: app screens, solo pages, offline lists)
const KEEPS_CONDITIONS = new Set(['pass-through', 'market', 'dam', 'backends', 'message-center', 'digitalhangar']);
const conditional = (request) => ['GET', 'HEAD'].includes(request.method)
  && (request.headers.has('if-modified-since') || request.headers.has('if-none-match'));

/** The answer for a request, before the head-URL and alias steps. */
async function respond(incoming, env, ctx, forms = true) {
  const early = prelude(incoming);
  if (early) return early;
  // another spelling of a page URL (upper case, .html, .nocache.html, a trailing slash, the long
  // /content/lh/markets/<cc>/<ll>/ path): one 301 to the page (src/url-forms.js); a long path the
  // site has a page at (DA documents under /content/lh/markets/) answers as itself, only its 404
  // becomes the 301
  if (forms) {
    if (isLongPagePath(incoming, env)) {
      const own = await respond(incoming, env, ctx, false);
      const resp = urlFormUnlessPage(own, incoming, env);
      return resp === own ? own : finish(resp, incoming, env, 'url-form');
    }
    const form = await urlForm(incoming, env);
    if (form) return finish(form, incoming, env, 'url-form');
  }
  // a front-door host (FRONT_DOOR_HOSTS, src/front-door.js) answers as its twin does through the
  // CDN in front of it: the gate's paths to lh-backends, the paths the CDN sends to lh-edge to
  // the routes below (X-LH-Public-Host: the host), everything else to the origin
  let request = incoming;
  const door = frontDoorOf(incoming, env);
  if (door) {
    request = withPublicHost(incoming, door);
    const target = frontDoorTarget(new URL(request.url).pathname);
    if (target === 'gate') return finish(await backends(request, env), request, env, 'gate');
    if (target === 'origin') return finish(await passThrough(request, env), request, env, 'pass-through');
  }
  // production mode (src/router.js): off without its vars and KV entry (the first matching
  // route, as before)
  const cfg = await routerConfig(env);
  const { route, setCookie } = choose(ROUTES, request, env, cfg);
  let resp;
  if (!route) {
    resp = await defaultOrigin(request, env);
  } else {
    const refused = REFERRER_CHECKED.has(route.name) && request.method === 'POST' ? referrerRefusal(request, env) : null;
    const strip = !KEEPS_CONDITIONS.has(route.name) && conditional(request);
    const req = strip ? withoutConditions(request) : request;
    resp = refused || await route.handle(req, env, ctx);
  }
  return finish(resp, request, env, route ? route.name : 'default', setCookie);
}

/**
 * A request for another site (src/sites.js: a host of SITE_HOSTS): its market roots from its
 * language documents (src/markets.js with the site's tables and origin), everything else from the
 * site's origin; / to the homepage of its first language version. No other route of lh-com.
 */
async function siteRespond(incoming, env, site, ctx) {
  const early = prelude(incoming);
  if (early) return early;
  const senv = siteEnv(env, site);
  const url = new URL(incoming.url);
  const read = ['GET', 'HEAD'].includes(incoming.method);
  // OneTrust from the host and the immutable fonts, as on lh-com's hosts; www's design-system
  // files from the site's design host (SITE_DESIGN_HOSTS; none: the origin's answer)
  if (read && isOnetrustPath(url.pathname)) return finish(await onetrust(incoming), incoming, senv, 'onetrust');
  if (read && isFontsPath(url.pathname)) return finish(await fonts(incoming, senv, passThrough), incoming, senv, 'fonts');
  if (read && site.design && isDigitalhangarPath(url.pathname)) return finish(await digitalhangar(incoming, senv), incoming, senv, 'digitalhangar');
  // a site without roots (src/sites.js PLAIN_SITES): its entry redirects, every other path as it is
  if (site.plain) {
    const target = read && site.plain.entry[url.pathname];
    if (target) {
      return finish(new Response(null, { status: 302, headers: { location: `${target}${url.search}`, 'cache-control': 'max-age=60', 'x-lh-edge-route': 'site-entry' } }), incoming, senv, 'site-entry');
    }
    return finish(await passThrough(incoming, senv), incoming, senv, 'site');
  }
  // www's DAM URLs: lh-com's DAM route with the site's origin (its DA copies), then AEM
  if (isDamPath(url.pathname)) return finish(await dam(incoming, senv, ctx), incoming, senv, 'dam');
  if (url.pathname === '/' && ['GET', 'HEAD'].includes(incoming.method)) {
    const home = `/${Object.values(site.tables.versions)[0]}/homepage${url.search}`;
    return finish(new Response(null, { status: 302, headers: { location: home, 'cache-control': 'max-age=60', 'x-lh-edge-route': 'site-entry' } }), incoming, senv, 'site-entry');
  }
  return finish(await market(incoming, senv), incoming, senv, 'site');
}

export default {
  async fetch(incoming, env, ctx) {
    const alias = aliasHostOf(incoming, env);
    // another site's host (var SITE_HOSTS, empty: none): answered for that site only
    const site = siteOf(incoming, env);
    let resp = site
      ? await siteRespond(incoming, env, site, ctx)
      : await respond(incoming, env, ctx);
    // a brand's host (src/brand-icons.js): its favicon and manifest in the head, before the paint
    if (site) resp = rewriteBrandIcons(resp, incoming, site);
    // turnsthe.page hosts (src/head-urls.js): head URLs that name the site config's production host
    // (HEAD_URLS_FROM, "" today) point at the host; no rewriter anywhere else
    const head = headUrlHost(incoming, env, alias);
    if (head) resp = rewriteHeadUrls(resp, incoming, env, head);
    // alias hosts (ALIAS_HOSTS, src/alias.js): routed like the main host, links to the replica's
    // own hosts kept on the alias host
    if (alias) resp = forAlias(resp, alias, env);
    // HTML pages: the visitor's country as lh-geo (src/onetrust.js), after every cache
    return withGeoCookie(resp, incoming);
  },
};

/**
 * The publish event poller, an RPC entrypoint for service bindings only (no route): lh-messages'
 * every-minute cron calls env.EVENTS_RELAY.poll() (the account's cron triggers are all in use).
 */
export class EventsRelay extends WorkerEntrypoint {
  async poll() {
    try {
      // the AEM sandbox's hourly keep-alive (src/aem-keepalive.js): in waitUntil, never throws
      aemKeepAlive(this.env, this.ctx);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(`aem-keepalive: ${e.message}`);
    }
    try {
      return await relay(this.env, this.ctx, { source: 'poll' });
    } catch (e) {
      // eslint-disable-next-line no-console -- the poll's error goes to the Worker log
      console.log(`events poll: ${e.message}`);
      return { ok: false, error: e.message };
    }
  }
}
