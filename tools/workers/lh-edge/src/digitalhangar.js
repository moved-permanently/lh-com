/**
 * /digitalhangar/*: www's design-system files, above all the brand fonts that every www loads from
 * /digitalhangar/design-system/releases/<release>/standalone/fonts/ (styles/fonts.css, the
 * themes), from the host's brand www: a site's SITE_WWW_HOSTS host (siteEnv's WWW_HOST), else
 * WWW_HOST, else www.lufthansa.com. Upstream's status and headers are handed on as they are
 * (cache-control included: www's max-age, no override), cached at the edge for that
 * cache-control (cacheEverything); a revalidation's conditions go upstream, so its 304 comes back.
 * No request cookies go upstream; no upstream cookie comes back (www's bot cookies are for www).
 */
export const DIGITALHANGAR = /^\/digitalhangar\/.+$/;
export const DEFAULT_WWW = 'www.lufthansa.com';

const FORWARDED = ['accept', 'accept-encoding', 'accept-language', 'user-agent', 'if-modified-since', 'if-none-match', 'range'];

export const isDigitalhangarPath = (pathname) => DIGITALHANGAR.test(pathname);

/** The www URL of a /digitalhangar/ request. */
export function digitalhangarUpstream(url, env = {}) {
  const host = String(env.WWW_HOST || '').trim() || DEFAULT_WWW;
  return `https://${host}${url.pathname}${url.search}`;
}

/** /digitalhangar/*: the brand www's answer. */
export async function digitalhangar(request, env) {
  const upstream = digitalhangarUpstream(new URL(request.url), env);
  const headers = new Headers();
  FORWARDED.forEach((h) => {
    if (request.headers.has(h)) headers.set(h, request.headers.get(h));
  });
  const resp = await fetch(upstream, {
    method: request.method === 'HEAD' ? 'HEAD' : 'GET', headers, redirect: 'manual', cf: { cacheEverything: true },
  });
  const out = new Response(request.method === 'HEAD' ? null : resp.body, resp);
  out.headers.delete('set-cookie');
  out.headers.set('x-lh-edge-route', 'digitalhangar');
  return out;
}
