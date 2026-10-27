/**
 * The app's web view: www answers <page>.solo_continue (and .solo.continue,
 * .solo.continue.solo_continue, .solo_continue.html, .solo_continue.genapp.html) with the page
 * without its chrome. lh-edge strips the suffix, looks the path up in the alias sheet, fetches the
 * Edge Delivery page and answers it in place (no redirect) in lh-com's app view: page metadata
 * channel=app (scripts/channel.js hides header, footer, breadcrumb and consent). Internal links
 * get the .solo_continue form, so the reader stays in the web view; a link to a homepage becomes
 * https://<WWW_HOST>.solo_continue/, the URL on which the app closes the web view.
 */
/* global HTMLRewriter */
import { originFetch } from './edge.js';
import { siteFetch } from './markets.js';

export const SOLO_SUFFIX = new RegExp(`(${[
  '.solo.continue.solo_continue', '.solo_continue.genapp.html', '.solo_continue.html', '.solo.continue', '.solo_continue',
].map((s) => s.replace(/\./g, '\\.')).join('|')})$`);
const ALIAS_TTL_MS = 60000;

/** The app path of a solo URL path (suffix and trailing slash removed), or null. */
export function soloPath(pathname) {
  const m = pathname.match(SOLO_SUFFIX);
  if (!m) return null;
  const path = pathname.slice(0, -m[1].length).replace(/\/+$/, '');
  return path && path !== '/' ? path : null;
}

const homepage = /^\/(?:[a-z]{2}\/[a-z]{2}(?:\/homepage)?)?\/?$/;
// files (PDF, images, sheets, scripts) are no pages; .html is
const isFile = (pathname) => /\.(?!html?$)[a-z0-9]{2,5}$/i.test(pathname);

/**
 * The href of a link in a page opened through a solo URL.
 * @param {string} href the authored href
 * @param {URL} pageUrl the solo URL of the page
 * @param {string} wwwHost e.g. www.lufthansa.com
 * @returns {string|null} the new href, or null to leave it
 */
export function soloHref(href, pageUrl, wwwHost) {
  const raw = String(href || '').trim();
  if (!raw || raw.startsWith('#') || /^(mailto|tel|javascript|data|sms):/i.test(raw)) return null;
  let url;
  try {
    url = new URL(raw, pageUrl);
  } catch (e) {
    return null;
  }
  if (!/^https?:$/.test(url.protocol)) return null;
  const own = url.host === pageUrl.host;
  const www = url.hostname === wwwHost;
  if (!own && !www) return null;
  if (/\/logout(\/|$|\.|\?)/i.test(url.pathname)) return null;
  if (homepage.test(url.pathname)) return `https://${wwwHost}.solo_continue/`;
  if (isFile(url.pathname) || SOLO_SUFFIX.test(url.pathname)) return null;
  const path = url.pathname.replace(/\.html?$/, '').replace(/\/+$/, '');
  const target = `${path}.solo_continue${url.search}${url.hash}`;
  return own ? target : `https://${wwwHost}${target}`;
}

let aliasCache = { at: 0, map: null };
/** For tests: forget the cached alias sheet. */
export function resetAliasCache() { aliasCache = { at: 0, map: null }; }

/** The alias sheet as app path -> page (cached 60 s in the isolate, read past the edge cache). */
export async function loadAliases(request, env) {
  if (aliasCache.map && Date.now() - aliasCache.at < ALIAS_TTL_MS) return aliasCache.map;
  const target = new URL(env.ALIAS_SHEET || '/app/config/webview-aliases.json', `https://${env.ORIGIN}`);
  const map = new Map();
  try {
    // a GET with the visitor's headers (also for a HEAD request), towards the sheet
    const get = new Request(request.url, { headers: request.headers });
    const resp = await originFetch(get, env, target, { edgeCache: false });
    if (resp.ok) {
      const json = await resp.json();
      (json.data || []).forEach((row) => {
        const from = String(row['app-path'] || '').trim().replace(/\/+$/, '');
        const to = String(row.page || '').trim().replace(/\/+$/, '');
        if (from.startsWith('/') && to.startsWith('/')) map.set(from, to);
      });
    }
  } catch (e) {
    // no sheet: every path is looked up as it is
  }
  aliasCache = { at: Date.now(), map };
  return map;
}

/** The meta tags lh-edge puts first in <head>: the app view and the URL that closes it. */
export function headTags(env) {
  const host = env.WWW_HOST || 'www.lufthansa.com';
  return `<meta name="channel" content="app"><meta name="app-close-url" content="https://${host}.solo_continue/">`;
}

/** A relative media URL (./media_…) of the page as a root-relative one: the solo URL can sit in
 * another folder than the page (alias). Absolute and root-relative values stay. */
export function absolutize(value, pageUrl) {
  const v = String(value || '').trim();
  if (!v || /^([a-z][a-z0-9+.-]*:|\/|#)/i.test(v)) return null;
  const u = new URL(v, pageUrl);
  return `${u.pathname}${u.search}${u.hash}`;
}

const srcsetOf = (value, pageUrl) => String(value || '').split(',').map((part) => {
  const [src, ...rest] = part.trim().split(/\s+/);
  return [absolutize(src, pageUrl) || src, ...rest].join(' ');
}).join(', ');

/**
 * Rewrites the page: meta tags in <head>, solo hrefs, relative media made root-relative.
 * HTMLRewriter (Workers runtime).
 * @param {Response} response the page from the origin
 * @param {URL} pageUrl the page's own URL on the public host (path of the page, not of the alias)
 */
export function rewritePage(response, pageUrl, env) {
  const wwwHost = env.WWW_HOST || 'www.lufthansa.com';
  return new HTMLRewriter()
    .on('head', {
      element(el) { el.prepend(headTags(env), { html: true }); },
    })
    .on('a[href]', {
      element(el) {
        const href = el.getAttribute('href');
        const next = soloHref(absolutize(href, pageUrl) || href, pageUrl, wwwHost);
        if (next) el.setAttribute('href', next);
      },
    })
    .on('img[src]', {
      element(el) {
        const next = absolutize(el.getAttribute('src'), pageUrl);
        if (next) el.setAttribute('src', next);
      },
    })
    .on('source[srcset], img[srcset]', {
      element(el) {
        const value = el.getAttribute('srcset');
        const next = srcsetOf(value, pageUrl);
        if (next !== value) el.setAttribute('srcset', next);
      },
    })
    .transform(response);
}

/** The solo route. */
export async function solo(request, env) {
  const url = new URL(request.url);
  const appPath = soloPath(url.pathname);
  if (!appPath) return new Response('Not Found', { status: 404 });
  const aliases = await loadAliases(request, env);
  const page = aliases.get(appPath) || appPath;
  const target = new URL(page, `https://${env.ORIGIN}`);
  // a market root's page as the market route answers it (src/markets.js)
  const resp = await siteFetch(request, env, target);
  if (resp.status === 301 || resp.status === 302) {
    // a redirect of the site (redirects sheet): to the solo form of its target
    const location = resp.headers.get('location');
    const next = location && soloHref(location, url, env.WWW_HOST || 'www.lufthansa.com');
    if (next) {
      const headers = new Headers(resp.headers);
      headers.set('location', next.includes('?') ? next : `${next}${url.search}`);
      return new Response(null, { status: resp.status, headers });
    }
    return resp;
  }
  if (resp.status !== 200 || !(resp.headers.get('content-type') || '').includes('text/html')) {
    // no page: 404 as www (the site's 404 page)
    return resp;
  }
  // links and media resolve against the page's own path on the public host
  const pageUrl = new URL(`${page}${url.search}`, url);
  const page2 = rewritePage(resp, pageUrl, env);
  const headers = new Headers(page2.headers);
  headers.set('x-lh-edge-route', 'solo');
  headers.set('x-lh-edge-page', page);
  return new Response(page2.body, { status: 200, headers });
}
