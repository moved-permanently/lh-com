/**
 * Alias hosts (brief 94, the China host): a request whose host is in ALIAS_HOSTS (demo
 * `lufthansa-cn.turnsthe.page`) is routed exactly like one to the main host (same origin, routes
 * and the Workers behind them); then, on its answer:
 * - text/html: absolute href/src/srcset/action URLs whose host is one of the replica's own hosts
 *   (ALIAS_REWRITE_HOSTS, demo `lufthansa.turnsthe.page,lufthansa-edge.turnsthe.page`) point at
 *   the alias host, so visitors stay on it (www.lufthansa.cn keeps its links on .cn).
 *   `<link rel="canonical">` and `<link rel="alternate" hreflang>` stay (one canonical host for
 *   search engines); links to other hosts (www.lufthansa.com: pages the replica does not have)
 *   stay;
 * - text/html gets `Cache-Control: public, max-age=28800` (www's .cn host;
 *   ALIAS_HTML_CACHE_CONTROL);
 * - a redirect to one of the replica's own hosts goes to the alias host (`/` redirects like `/`
 *   on the main host).
 * Other hosts' answers are not touched.
 */
/* global HTMLRewriter */

const list = (v) => String(v || '').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
export const HTML_CACHE_CONTROL = 'public, max-age=28800';

/** The alias host of a request, or null. */
export function aliasHostOf(request, env) {
  const host = new URL(request.url).hostname.toLowerCase();
  return list(env.ALIAS_HOSTS).includes(host) ? host : null;
}

/** An absolute URL on one of the replica's own hosts, moved to the alias host; else null. */
export function toAlias(value, hosts, alias) {
  const v = String(value || '').trim();
  if (!/^(https?:)?\/\//i.test(v)) return null;
  let u;
  try {
    u = new URL(v.startsWith('//') ? `https:${v}` : v);
  } catch (e) {
    return null;
  }
  if (!hosts.includes(u.hostname.toLowerCase())) return null;
  u.host = alias;
  u.protocol = 'https:';
  return v.startsWith('//') ? u.href.slice('https:'.length) : u.href;
}

const srcsetToAlias = (value, hosts, alias) => {
  let changed = false;
  const out = String(value || '').split(',').map((part) => {
    const [url, ...rest] = part.trim().split(/\s+/);
    const next = toAlias(url, hosts, alias);
    if (next) changed = true;
    return [next || url, ...rest].join(' ');
  }).join(', ');
  return changed ? out : null;
};

const ATTRS = [['a', 'href'], ['area', 'href'], ['form', 'action'], ['img', 'src'], ['img', 'srcset'], ['source', 'src'], ['source', 'srcset'], ['script', 'src'], ['iframe', 'src'], ['link', 'href'], ['video', 'src'], ['video', 'poster']];

/** The answer for an alias host (see above). */
export function forAlias(response, alias, env) {
  const hosts = list(env.ALIAS_REWRITE_HOSTS);
  const headers = new Headers(response.headers);
  const location = headers.get('location');
  const moved = location && toAlias(location, hosts, alias);
  if (moved) headers.set('location', moved);
  const type = headers.get('content-type') || '';
  if (!type.includes('text/html')) {
    if (!moved) return response;
    return new Response(response.body, {
      status: response.status, statusText: response.statusText, headers,
    });
  }
  headers.set('cache-control', env.ALIAS_HTML_CACHE_CONTROL || HTML_CACHE_CONTROL);
  const base = new Response(response.body, {
    status: response.status, statusText: response.statusText, headers,
  });
  if (!response.body || !hosts.length) return base;
  let rewriter = new HTMLRewriter();
  ATTRS.forEach(([tag, attr]) => {
    rewriter = rewriter.on(`${tag}[${attr}]`, {
      element(el) {
        if (tag === 'link') {
          const rel = String(el.getAttribute('rel') || '').toLowerCase().split(/\s+/);
          const hreflang = el.getAttribute('hreflang') !== null;
          if (rel.includes('canonical') || (rel.includes('alternate') && hreflang)) return;
        }
        const value = el.getAttribute(attr);
        const next = attr === 'srcset' ? srcsetToAlias(value, hosts, alias) : toAlias(value, hosts, alias);
        if (next) el.setAttribute(attr, next);
      },
    });
  });
  return rewriter.transform(base);
}
