/**
 * Head URLs on the turnsthe.page hosts. The site config's production host is still
 * lhcom.bbird.live (lhcom's CDN purge depends on it), so Edge Delivery writes it into every page's
 * canonical, hreflang alternates, og:url, og:image(:*) and twitter:* URLs. On an HTML answer for a
 * brand host of turnsthe.page (scripts/demo.js TURNSTHE_PAGE_BRANDS) those absolute URLs of the var
 * HEAD_URLS_FROM (lhcom.bbird.live) point at the host instead; on an alias host (lufthansa-cn) at
 * its brand's main host (lufthansa.turnsthe.page), as an alias keeps one canonical host. A
 * streaming HTMLRewriter on those head elements only; body links, .plain.html and non-HTML answers
 * are not touched, and on every other host (bbird.live included) no rewriter is made at all.
 * Goes away (HEAD_URLS_FROM empty) when the production host moves to turnsthe.page.
 */
/* global HTMLRewriter */
/* eslint-disable import/no-relative-packages */
// the brand list of the site (one place: scripts/demo.js)
import { turnsThePageBrandOf, TURNSTHE_PAGE_DOMAIN } from '../../../../scripts/demo.js';
/* eslint-enable import/no-relative-packages */

const META = /^(og:url|og:image(:.*)?|twitter:.+)$/i;

/** The host head URLs point at on this request's host, or null (no rewrite). */
export function headUrlHost(request, env, alias) {
  const from = String(env.HEAD_URLS_FROM || '').trim().toLowerCase();
  if (!from) return null;
  const host = new URL(request.url).hostname.toLowerCase();
  const brand = turnsThePageBrandOf(host);
  if (!brand || host === from) return null;
  // an alias host (lufthansa-cn) keeps one canonical host: its brand's main host
  return alias ? `${brand}.${TURNSTHE_PAGE_DOMAIN}` : host;
}

/** An absolute URL of `from` moved to `to`, or null when it is another URL. */
export function moved(value, from, to) {
  const v = String(value || '');
  const prefix = `https://${from}`;
  if (v !== prefix && !v.startsWith(`${prefix}/`) && !v.startsWith(`${prefix}?`) && !v.startsWith(`${prefix}#`)) return null;
  return `https://${to}${v.slice(prefix.length)}`;
}

/** The answer with its head URLs moved (HTML answers only, not .plain.html). */
export function rewriteHeadUrls(response, request, env, to) {
  const type = response.headers.get('content-type') || '';
  if (!type.includes('text/html') || !response.body) return response;
  if (/\.plain\.html$/.test(new URL(request.url).pathname)) return response;
  const from = String(env.HEAD_URLS_FROM).trim().toLowerCase();
  const set = (el, attr) => {
    const next = moved(el.getAttribute(attr), from, to);
    if (next !== null) el.setAttribute(attr, next);
  };
  return new HTMLRewriter()
    .on('head link[href]', {
      element(el) {
        const rel = String(el.getAttribute('rel') || '').toLowerCase().split(/\s+/);
        if (rel.includes('canonical') || rel.includes('alternate')) set(el, 'href');
      },
    })
    .on('head meta[content]', {
      element(el) {
        const key = el.getAttribute('property') || el.getAttribute('name') || '';
        if (META.test(key)) set(el, 'content');
      },
    })
    .transform(response);
}
