/**
 * Production mode (README "Production mode"): which answer a request gets is configuration, not
 * code. Off by default: without the vars and the KV entry below every request is routed exactly
 * as before (the route table, then the Edge Delivery pass-through).
 *
 * vars (wrangler.toml):
 * - DEFAULT_ORIGIN: the origin of paths no route claims ('' : Edge Delivery, the pass-through as
 *   today; production: the current origin's host, e.g. origin-www.lufthansa.com). With a default
 *   origin the pass-through to Edge Delivery claims only the configured paths (`paths`).
 * - ROUTER_KILL: "on" sends every request to the default origin (a deploy; the KV entry's
 *   `kill` does the same without one).
 * - ROUTER_HEADER: a header name (e.g. x-lh-edge-router) set on every answer to the route that
 *   answered ("default" for the default origin); '' : none.
 * - DEMO_HOSTS / PRODUCTION_HOSTS: public hosts; a demo host's answers get X-Robots-Tag: noindex,
 *   a production host's never ('' : none get it, as today).
 * KV (binding ROUTER, key "router", JSON; or the var ROUTER_CONFIG with the same JSON, a deploy):
 *   {"kill": false,
 *    "routes": {"<route name>": "on" | "off" | <percent>},
 *    "paths": {"/de/en/baggage": "on", "/de/en/offers/**": 25}}
 *   routes: a route off falls to the default origin; a percentage sends that share of visitors,
 *   sticky by cookie (lhe-<name>); paths (only with DEFAULT_ORIGIN): the paths Edge Delivery
 *   answers, exact or a prefix ending /**, the longest pattern wins, values as for routes.
 * Read once per isolate per 30 s (the KV read cached 60 s at the edge): no parse of anything
 * large per request.
 */
import { passThrough, publicHost } from './edge.js';

const TTL_MS = 30000;
let cached = null;

/** Drops the read configuration (tests). */
export function resetRouterCache() {
  cached = null;
}

const list = (v) => String(v || '').split(',').map((h) => h.trim().toLowerCase()).filter(Boolean);

/** The configuration (KV ROUTER "router", else the var ROUTER_CONFIG), {} without one. */
export async function routerConfig(env) {
  if (!env.ROUTER && !env.ROUTER_CONFIG) return {};
  if (cached && cached.env === env && Date.now() - cached.at < TTL_MS) return cached.value;
  let value = {};
  try {
    const raw = env.ROUTER ? await env.ROUTER.get('router', { cacheTtl: 60 }) : null;
    const text = raw ?? env.ROUTER_CONFIG;
    value = text ? JSON.parse(text) : {};
  } catch (e) {
    // a broken entry routes as without one
    value = {};
  }
  if (!value || typeof value !== 'object') value = {};
  cached = { at: Date.now(), env, value };
  return value;
}

/** Whether the configuration sends everything to the default origin. */
export const killed = (env, cfg) => String(env.ROUTER_KILL || '').trim() === 'on' || cfg.kill === true;

/** A configured state: true (on), false (off) or a percentage 0..100; undefined: not configured. */
export function stateOf(value) {
  if (value === undefined || value === null) return undefined;
  if (value === 'on' || value === true) return true;
  if (value === 'off' || value === false) return false;
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  return Math.max(0, Math.min(100, n));
}

const cookieName = (key) => `lhe-${key.replace(/[^a-zA-Z0-9-]/g, '_')}`;

function cookieValue(request, name) {
  const header = request.headers.get('cookie') || '';
  const m = header.match(new RegExp(`(?:^|;\\s*)${name}=([01])(?:;|$)`));
  return m ? m[1] : null;
}

/**
 * Whether a switch lets the request through: {pass, setCookie}. A percentage is decided once
 * per visitor (cookie lhe-<key>: 1 in, 0 out) and kept for 30 days.
 */
export function decide(request, key, state, random = Math.random) {
  if (state === undefined || state === true) return { pass: true };
  if (state === false) return { pass: false };
  const name = cookieName(key);
  const seen = cookieValue(request, name);
  if (seen !== null) return { pass: seen === '1' };
  const pass = random() * 100 < state;
  return { pass, setCookie: `${name}=${pass ? 1 : 0}; Max-Age=2592000; Path=/; Secure; SameSite=Lax` };
}

/** The longest configured path pattern a path matches (exact, or a prefix ending /**). */
export function pathPattern(paths, pathname) {
  let best = null;
  Object.keys(paths || {}).forEach((p) => {
    const hit = p.endsWith('/**') ? pathname === p.slice(0, -3) || pathname.startsWith(p.slice(0, -2)) : pathname === p;
    if (hit && (!best || p.length > best.length)) best = p;
  });
  return best;
}

/** The answer of the default origin: Edge Delivery (the pass-through), else DEFAULT_ORIGIN. */
export async function defaultOrigin(request, env) {
  const host = String(env.DEFAULT_ORIGIN || '').trim();
  if (!host) return passThrough(request, env);
  const url = new URL(request.url);
  url.protocol = 'https:';
  url.hostname = host;
  url.port = '';
  const req = new Request(url.href, request);
  req.headers.set('x-forwarded-host', publicHost(request, env));
  return fetch(req, { redirect: 'manual' });
}

/** The headers production mode adds: the route's name, noindex on demo hosts, a route cookie. */
export function finish(resp, request, env, name, setCookie) {
  const header = String(env.ROUTER_HEADER || '').trim();
  const host = publicHost(request, env).toLowerCase().split(':')[0];
  const noindex = list(env.DEMO_HOSTS).includes(host) && !list(env.PRODUCTION_HOSTS).includes(host);
  if (!header && !noindex && !setCookie) return resp;
  const out = new Response(resp.body, resp);
  if (header) out.headers.set(header, name);
  if (noindex) out.headers.set('x-robots-tag', 'noindex');
  if (setCookie) out.headers.append('set-cookie', setCookie);
  return out;
}

/**
 * The route a request gets: {route, setCookie}; route null: the default origin. The first route
 * that matches, unless the configuration switches it off (or the visitor out of its share); with
 * a default origin the pass-through to Edge Delivery only for the configured paths; killed:
 * always the default origin.
 */
export function choose(routes, request, env, cfg) {
  if (killed(env, cfg)) return { route: null };
  const url = new URL(request.url);
  const route = routes.find((r) => r.match(url, request));
  if (route.name === 'pass-through' && String(env.DEFAULT_ORIGIN || '').trim()) {
    const p = pathPattern(cfg.paths, url.pathname);
    if (!p) return { route: null };
    const d = decide(request, `path${p}`, stateOf(cfg.paths[p]));
    return { route: d.pass ? route : null, setCookie: d.setCookie };
  }
  const d = decide(request, route.name, stateOf(cfg.routes && cfg.routes[route.name]));
  return { route: d.pass ? route : null, setCookie: d.setCookie };
}
