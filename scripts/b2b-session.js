/*
 * Lufthansa Group for Business (lh-b2b): the sign-ins and member data lh-backends answers on the
 * site's own host (tools/workers/lh-edge src/b2b-gate.js routes them; cookies are host-only and
 * HttpOnly, so the page only sends them). Used by blocks/b2b-login, blocks/b2b-member and the
 * header's Login menu (blocks/header/header-b2b-session.js).
 */

export const SESSION_PATH = '/service/secured/api/b2bneo/session';
export const ROLES_PATH = '/service/secured/api/b2bneo/user/roles';
export const EXPERTS_LOGOUT_PATH = '/service/secured/api/experts/logout';

/** The page's root: { country, lang, root } of /<cc>/<ll>/…, de/en when the path has none. */
export function pageRoot(pathname = window.location.pathname) {
  const m = String(pathname).match(/^\/([a-z]{2})\/([a-z]{2})(?:\/|$)/);
  const country = m ? m[1] : 'de';
  const lang = m ? m[2] : 'en';
  return { country, lang, root: `${country}/${lang}` };
}

/** A path on this host: one leading slash, no scheme or second slash, no backslash or spaces. */
export function isSafePath(value) {
  return typeof value === 'string' && /^\/(?![/\\])[\x21-\x7E]*$/.test(value) && !value.includes('\\');
}

/**
 * A target on this host as a path (an absolute URL of this origin becomes its path), else ''.
 * @param {string} value
 */
export function sameHostPath(value) {
  if (!value) return '';
  if (isSafePath(value)) return value;
  try {
    const u = new URL(value);
    if (u.origin === window.location.origin) return `${u.pathname}${u.search}`;
  } catch (e) {
    // not a URL
  }
  return '';
}

/** The sign-in page of the root, coming back to `back` (a path) after the sign-in. */
export function loginUrl(root, back = '') {
  const path = `/${root}/login`;
  return back && isSafePath(back) ? `${path}?redirect=${encodeURIComponent(back)}` : path;
}

/** The company sign-out, back on the root's sign-in page. */
export function companyLogoutUrl(root) {
  return `/sso/b2bneo/logout?redirect=${window.location.origin}/${root}/login`;
}

/**
 * JSON from lh-backends: { status, data } (data null when the answer is no JSON); status 0 when
 * the request failed or took longer than `timeout` ms.
 */
export async function fetchJson(path, { method = 'GET', body, timeout = 8000 } = {}) {
  const controller = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeout) : null;
  try {
    const init = { method, credentials: 'same-origin', headers: { accept: 'application/json' } };
    if (body !== undefined) {
      init.body = JSON.stringify(body);
      init.headers['content-type'] = 'application/json';
    }
    if (controller) init.signal = controller.signal;
    const resp = await fetch(path, init);
    let data = null;
    try {
      data = await resp.json();
    } catch (e) {
      data = null;
    }
    return { status: resp.status, data };
  } catch (e) {
    return { status: 0, data: null };
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Who is signed in on this host: { company, experts } (each null), null when unknown. */
export async function loadSession({ timeout = 2500 } = {}) {
  const { status, data } = await fetchJson(SESSION_PATH, { timeout });
  if (status !== 200 || !data || typeof data !== 'object') return null;
  return { company: data.company || null, experts: data.experts || null };
}
