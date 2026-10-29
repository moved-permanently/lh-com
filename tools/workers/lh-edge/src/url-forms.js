/**
 * Other spellings of a page URL, as www answers them (recorded 2026-10-29,
 * tools/source-export/feeds/url-forms): one 301 to the page's URL for
 * - upper case in a page path: the path in lower case (www's 301), except under lufthansa-fleet
 *   (www keeps its fleet pages' upper case, /…/lufthansa-fleet/32N);
 * - <page>.html, <page>.nocache.html (AEM's uncached form), <page>/: www answers the page itself
 *   (200); here a 301, as under the suffixed URL the page breaks: its images are relative
 *   (./media_…, under <page>/ they resolve below the page) and the site's scripts read the path
 *   (the form block's form id, the language switch, the sub-page navigation);
 * - /content/lh/markets/<cc>/<ll>/<page>[.html] (www's AEM paths: 200, with .html a 302 to the
 *   long path): the short path /<cc>/<ll>/<page>, for the same reasons.
 * Page paths only: /<cc>/<ll>/… or /content/lh/markets/<cc>/<ll>/… whose last segment has no dot
 * once the suffix is gone, so .plain.html, .sdui, .solo_continue, .csi-*.json, .mfe.html,
 * .changelocale(.html), .aircraft.json, the other selector forms (.external.html, .solo.html,
 * .sdui.html: 404 as before) and every file keep their answers; never under the code paths,
 * /drafts, /content/dam, /content/mobile, /content/experience-fragments, /service, /deeplink,
 * /graphql, /api, /etc, the sitemaps, /.well-known, /migration-status*, /_lh-auth and the other
 * service paths (EXCLUDED); /<cc>/<ll>[/] is the entry redirect's. GET and HEAD; the query kept.
 * A regular expression or two per request; the var URL_FORMS "off" turns it off.
 */

import { COUNTRIES } from './entry.js';

// path prefixes no URL form touches (case-insensitive: www's exclusions and the replica's own)
const EXCLUDED = /^\/(blocks|scripts|styles|icons|fonts|tools|library|drafts|service|deeplink|graphql|api|etc|sitemap[^/]*|\.well-known|migration-status[^/]*|_lh-auth|_lh|_lh-backends|sso|apps|loginservice|seatmap|cdn-cgi|content\/(dam|mobile|experience-fragments))(\/|$)/i;
const LONG = /^\/content\/lh\/markets\/([a-z]{2})\/([a-z]{2})(\/.*)?$/i;
const SHORT = /^\/([a-z]{2})\/([a-z]{2})(\/.*)?$/i;

/** The page URL of another spelling (path and query), or null when the path is none. */
export function urlFormTarget(url) {
  const { pathname, search } = url;
  if (EXCLUDED.test(pathname)) return null;
  const long = pathname.match(LONG);
  const m = long || pathname.match(SHORT);
  if (!m || !COUNTRIES.has(m[1].toLowerCase())) return null;
  let [, cc, ll, rest = ''] = m;
  if (rest === '' || rest === '/') {
    // /<cc>/<ll>[/]: the entry redirect's (a long one goes to it, upper case is folded first)
    if (!long && !/[A-Z]/.test(`${cc}${ll}`)) return null;
    rest = '';
  } else if (rest.endsWith('/')) {
    rest = rest.replace(/\/+$/, '');
  } else if (/\.nocache\.html$/i.test(rest)) {
    rest = rest.replace(/\.nocache\.html$/i, '');
  } else if (/\.html$/i.test(rest)) {
    rest = rest.replace(/\.html$/i, '');
  }
  const last = rest.split('/').pop();
  if (last.includes('.') || rest.includes('//')) return null;
  if (!/\/lufthansa-fleet\//i.test(rest)) {
    rest = rest.toLowerCase();
  }
  cc = cc.toLowerCase();
  ll = ll.toLowerCase();
  const target = `/${cc}/${ll}${rest}`;
  return target === pathname ? null : `${target}${search}`;
}

/** The 301 of a request's other spelling, or null. */
export function urlForm(request, env = {}) {
  if (String(env.URL_FORMS || 'on').trim() === 'off') return null;
  if (!['GET', 'HEAD'].includes(request.method)) return null;
  const location = urlFormTarget(new URL(request.url));
  if (!location) return null;
  return new Response(null, {
    status: 301,
    headers: { location, 'cache-control': 'public, max-age=3600', 'x-lh-edge-route': 'url-form' },
  });
}
