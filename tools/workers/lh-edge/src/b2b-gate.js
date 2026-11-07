/**
 * Lufthansa Group for Business (lh-b2b, scripts/brands.js b2b `memberGate`): the replica's
 * sign-in and member pages in front of lh-backends (binding BACKENDS; the b2b sign-in round of
 * 2026-11-07).
 * - POST /j_security_check and /<cc>/<ll>/j_security_check (www's sign-in form: j_username,
 *   j_password, loginType, j_validate, resource) go to lh-backends as they are;
 * - the member pages (GET and HEAD) ask lh-backends' gate first, with the visitor's cookie:
 *   GET https://<host>/_lh-backends/b2b/gate?path=<path and query>. 204: the page as usual, never
 *   cached (cache-control private, no-store), the gate's Set-Cookie passed on; any other answer
 *   (302 to the sign-in page or the eXperts sign-in, an error): the gate's, as it is.
 * README "lh-backends".
 */

/** www's sign-in endpoint, on the host or under a root. */
const SIGN_IN = /^(?:\/[a-z]{2}\/[a-z]{2})?\/j_security_check$/;

/** The member pages: the company area, its support and terms pages, the eXperts members' area. */
const MEMBER = /^\/[a-z]{2}\/[a-z]{2}\/(?:(?:home|profile|reports|fund|history|usermanagement|lhghome|experts-members)(?:\/.*)?|common\/(?:support|terms-and-conditions))$/;

/** Whether a request is a sign-in post. */
export function isSignInPost(url, request) {
  return request.method === 'POST' && SIGN_IN.test(url.pathname);
}

/** Whether a path is one of the member pages. */
export function isMemberPath(pathname) {
  return MEMBER.test(pathname);
}

/** The Set-Cookie headers of a response (each one; the runtime's getSetCookie when it has it). */
function setCookies(resp) {
  if (typeof resp.headers.getSetCookie === 'function') return resp.headers.getSetCookie();
  const one = resp.headers.get('set-cookie');
  return one ? [one] : [];
}

/**
 * A member page: the gate's answer, else (204) the page `serve()` answers, private, no-store, with
 * the gate's cookies.
 * @param {Request} request the visitor's request
 * @param {object} env the Worker's env (BACKENDS)
 * @param {() => Promise<Response>} serve the page as the site answers it
 */
export async function memberGate(request, env, serve) {
  if (!env.BACKENDS) {
    return new Response(JSON.stringify({ error: 'backends-not-bound' }), {
      status: 503,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
  }
  const url = new URL(request.url);
  const gate = new URL('/_lh-backends/b2b/gate', url.origin);
  gate.searchParams.set('path', `${url.pathname}${url.search}`);
  const headers = new Headers();
  const cookie = request.headers.get('cookie');
  if (cookie) headers.set('cookie', cookie);
  const answer = await env.BACKENDS.fetch(new Request(gate.href, { method: 'GET', headers }));
  if (answer.status !== 204) return answer;
  const page = await serve();
  const out = new Response(page.body, page);
  out.headers.set('cache-control', 'private, no-store');
  setCookies(answer).forEach((c) => out.headers.append('set-cookie', c));
  return out;
}
