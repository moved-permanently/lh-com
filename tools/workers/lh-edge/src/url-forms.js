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
 * A long path that is a page of the site itself (DA documents under /content/lh/markets/, such as
 * …/de/en/during-your-trip/lounges/loungenet) keeps its answer: the long path's own answer decides
 * (a 404 from the origin: the 301 to the short path, no extra request), and its other spellings
 * go to it once one HEAD to the origin finds it (with .html www's 302 to the long path).
 */

import { COUNTRIES } from './entry.js';
import { originFetch } from './edge.js';

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

/**
 * The long path of a long-path form's page (/content/lh/markets/<cc>/<ll>/<page>, spelled as the
 * page), or null (a short path, /content/lh/markets/<cc>/<ll>, no URL form).
 */
export function longPageOf(url, target = urlFormTarget(url)) {
  if (!target || !LONG.test(url.pathname)) return null;
  const short = target.split('?')[0];
  return /^\/[a-z]{2}\/[a-z]{2}\/./.test(short) ? `/content/lh/markets${short}` : null;
}

const enabled = (request, env) => String(env.URL_FORMS || 'on').trim() !== 'off'
  && ['GET', 'HEAD'].includes(request.method);

const redirect = (status, location) => new Response(null, {
  status,
  headers: { location, 'cache-control': 'public, max-age=3600', 'x-lh-edge-route': 'url-form' },
});

/** Whether the origin has a page at a path (one HEAD; only a 404 is no page). */
async function originHasPage(path, request, env) {
  const url = new URL(path, request.url);
  const resp = await originFetch(new Request(url, { method: 'HEAD' }), env, `https://${env.ORIGIN}${url.pathname}`);
  return resp.status !== 404;
}

/**
 * A long path that is itself a page's spelling (no suffix, lower case): its own answer decides
 * (urlFormUnlessPage), so no answer here. Its other spellings: to the long page when the origin has
 * one, else to the short path.
 */
export async function urlForm(request, env = {}, hasPage = originHasPage) {
  if (!enabled(request, env)) return null;
  const url = new URL(request.url);
  const location = urlFormTarget(url);
  if (!location) return null;
  const page = longPageOf(url, location);
  if (page === url.pathname) return null;
  if (page && await hasPage(page, request, env)) {
    // www: <long page>.html is a 302 to the long page
    return redirect(url.pathname === `${page}.html` ? 302 : 301, `${page}${url.search}`);
  }
  return redirect(301, location);
}

/** The answer of a long page path: the 301 to the short path when the site has no page there. */
export function urlFormUnlessPage(resp, request, env = {}) {
  if (resp.status !== 404 || !enabled(request, env)) return resp;
  const url = new URL(request.url);
  const location = urlFormTarget(url);
  return location && longPageOf(url, location) === url.pathname ? redirect(301, location) : resp;
}

/** Whether a request is for a long page path whose own answer decides (urlFormUnlessPage). */
export function isLongPagePath(request, env = {}) {
  if (!enabled(request, env)) return false;
  const url = new URL(request.url);
  return longPageOf(url) === url.pathname;
}
