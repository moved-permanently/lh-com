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
import { graphql, isGraphqlPath } from './graphql.js';
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
  return env.MESSAGES.fetch(request);
}

/**
 * The routes, first match wins. match(url, request) -> boolean; handle(request, env, ctx).
 * Packages add their routes before login-return, entry and backends; pass-through comes last.
 */
export const ROUTES = [
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
    match: (url) => url.pathname.startsWith('/graphql/execute.json/Message-Center/'),
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
    name: 'search',
    match: (url, request) => request.method === 'POST' && isSearchPath(url.pathname),
    handle: siteSearch,
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
    name: 'pass-through',
    match: () => true,
    handle: passThrough,
  },
];

export function routeOf(request) {
  const url = new URL(request.url);
  return ROUTES.find((r) => r.match(url, request));
}

export default {
  async fetch(request, env, ctx) {
    const early = prelude(request);
    if (early) return early;
    return routeOf(request).handle(request, env, ctx);
  },
};

/**
 * The publish event poller, an RPC entrypoint for service bindings only (no route): lh-messages'
 * every-minute cron calls env.EVENTS_RELAY.poll() (the account's cron triggers are all in use).
 */
export class EventsRelay extends WorkerEntrypoint {
  async poll() {
    try {
      return await relay(this.env, this.ctx, { source: 'poll' });
    } catch (e) {
      // eslint-disable-next-line no-console -- the poll's error goes to the Worker log
      console.log(`events poll: ${e.message}`);
      return { ok: false, error: e.message };
    }
  }
}
