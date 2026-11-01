/**
 * OF1's generative search API (of1.live, Adobe) on the main host (FRONT_DOOR_HOSTS only): the
 * browser calls its own origin, lh-edge forwards to OF1's edge proxy (var OF1_ORIGIN,
 * https://main--lh-com--moved-permanently.of1.live), which answers server to server and sends
 * CORS headers only for its own origin. Exactly POST /api/generate, /api/suggest and
 * /api/personalize (OPTIONS too); any other method 405.
 * - Request: the same path without its query (visitors don't pick models), only Content-Type and
 *   the body, and of the cookies only OF1's (of1_*, not of1_model_overrides). No Origin (the
 *   proxy answers without one, so there is no CORS header to clean up), no Authorization: the
 *   proxy adds OF1's own credential.
 * - Response: status and body as they come (a stream: generate and personalize send NDJSON, one
 *   JSON object per line, and full-page generation can run past 60 s), content-type and the rate
 *   limit headers kept, cache-control no-store; no access-control-*, no set-cookie. No edge cache,
 *   no HTML rewriting.
 * Without OF1_ORIGIN the paths go where they went before (the origin: 404).
 */

export const OF1_PATHS = new Set(['/api/generate', '/api/suggest', '/api/personalize']);

/** Whether a path is one of OF1's three API paths (exactly). */
export const isOf1Path = (pathname) => OF1_PATHS.has(pathname);

/** The cookies OF1 gets: of1_* only, never of1_model_overrides (nor any other cookie). */
export function of1Cookies(header) {
  return String(header || '').split(';').map((c) => c.trim())
    .filter((c) => {
      const name = c.split('=')[0].trim();
      return name.startsWith('of1_') && name !== 'of1_model_overrides';
    })
    .join('; ');
}

// the upstream answer's headers that reach the browser (everything else stays at the edge:
// access-control-*, set-cookie, caching, the proxy's own CDN headers)
const KEPT = /^(content-type|retry-after|x-request-id|(x-)?ratelimit-[a-z-]+)$/i;

/** The upstream answer as the browser gets it: the body streamed, the headers filtered. */
export function of1Response(upstream) {
  const headers = new Headers();
  upstream.headers.forEach((value, name) => { if (KEPT.test(name)) headers.set(name, value); });
  headers.set('cache-control', 'no-store');
  headers.set('x-lh-edge-route', 'of1');
  return new Response(upstream.body, {
    status: upstream.status, statusText: upstream.statusText, headers,
  });
}

/** The route: the request forwarded to OF1's proxy, its answer passed through. */
export async function of1(request, env) {
  if (!['POST', 'OPTIONS'].includes(request.method)) {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: {
        allow: 'POST, OPTIONS', 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', 'x-lh-edge-route': 'of1',
      },
    });
  }
  const { pathname } = new URL(request.url);
  const target = new URL(pathname, String(env.OF1_ORIGIN).trim());
  const headers = new Headers();
  const type = request.headers.get('content-type');
  if (type) headers.set('content-type', type);
  const cookie = of1Cookies(request.headers.get('cookie'));
  if (cookie) headers.set('cookie', cookie);
  // the request body is small JSON: read whole; the answer is the stream
  const body = request.method === 'POST' ? await request.arrayBuffer() : undefined;
  const upstream = await fetch(target.href, {
    method: request.method, headers, body, redirect: 'manual',
  });
  return of1Response(upstream);
}
