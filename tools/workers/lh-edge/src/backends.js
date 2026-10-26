/**
 * The server endpoints of www that are not pages and that lh-backends (another Worker, service
 * binding BACKENDS) answers for the replica: www's own REST calls, partner and app deeplinks,
 * the Travel ID return and logout, Amadeus' late login, the seat map, lh-backends' own pages.
 * lh-edge hands them over unchanged (method, path, query, headers, body) and returns the answer
 * as it is (Set-Cookie included); nothing of it is cached here. README "lh-backends".
 */

/** www paths under /service/secured/api/ that lh-edge answers itself (packages 7, 8 and 5). */
const OWN_API = new Set([
  '/service/secured/api/search',
  '/service/secured/api/core/booking/defaultairport',
  '/service/secured/api/core/booking/bookinglist',
  '/service/secured/api/core/authenticate/loginPageUrl',
]);
const OWN_DEEPLINKS = new Set(['/apps/dcep/deeplink/goodfortrain/stele']);

/** Whether a path is one of the families lh-backends answers. */
export function isBackendsPath(pathname) {
  if (pathname.startsWith('/service/secured/api/')) return !OWN_API.has(pathname);
  if (pathname.startsWith('/apps/dcep/deeplink/')) return !OWN_DEEPLINKS.has(pathname);
  return pathname.startsWith('/deeplink/')
    || pathname.startsWith('/sso/')
    || pathname === '/loginservice' || pathname.startsWith('/loginservice/')
    || pathname.startsWith('/seatmap/')
    || pathname.startsWith('/_lh-backends/');
}

/**
 * The return from the login provider: a GET of / or of a page under /<cc>/<ll>/ with the query
 * parameters code and state, state a page path (/de/en/homepage).
 */
export function isLoginReturn(url, request) {
  if (!['GET', 'HEAD'].includes(request.method)) return false;
  if (url.pathname !== '/' && !/^\/[a-z]{2}\/[a-z]{2}\/./.test(url.pathname)) return false;
  const state = url.searchParams.get('state');
  return url.searchParams.has('code') && typeof state === 'string' && /^\/[a-z]{2}\//i.test(state);
}

/** Hands the request to lh-backends. */
export async function backends(request, env) {
  if (!env.BACKENDS) {
    return new Response(JSON.stringify({ error: 'backends-not-bound' }), {
      status: 503,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
  }
  return env.BACKENDS.fetch(request);
}
