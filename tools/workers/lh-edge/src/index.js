/**
 * lh-edge: the router in front of lh-com. An ordered route table: the compatibility routes that
 * answer what clients of www.lufthansa.com ask (the app's web view, the Message Center JSON, the
 * App Links files), then everything else passed to the Edge Delivery origin like Adobe's
 * reference Worker (src/edge.js). Hosts and origins are [vars], secrets are secrets, bindings
 * have generic names: the Worker moves to another account and zone unchanged. See README.md.
 */
import { prelude, passThrough } from './edge.js';
import { solo, soloPath } from './solo.js';
import { sdui, isSduiPath } from './sdui-route.js';
import { graphql, isGraphqlPath } from './graphql.js';
import { dam, isDamPath } from './dam.js';
import { siteSearch, isSearchPath } from './search.js';
import WELL_KNOWN from './well-known.js';

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
 * Packages 2 to 6 add their routes before the pass-through.
 */
export const ROUTES = [
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
