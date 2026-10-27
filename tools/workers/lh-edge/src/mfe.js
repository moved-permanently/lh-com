/**
 * www's micro-frontend hand-off (AMS rest A4 part 2): other systems POST booking data as form
 * fields to <page>.mfe.html (also under /content/lh/markets). Pages with the metadata
 * `post-handler: true` answer 200 with the page and the remaining fields as JSON in the
 * micro-frontend block's data-config (HTML-escaped; blocks/micro-frontend hands it to the app);
 * other pages answer 403 with a short text. Dropped: names that look like a credential or control
 * field (password, token, secret, cookie, authorization, redirect, host, script and the like, a
 * leading `_`) or contain `:` (or other characters than letters, digits, `-`, `_`, `.`), files,
 * and any value longer than 256 characters after HTML escaping; multi-value fields are joined with
 * `,`. The answer is never cached (it carries the visitor's data). GET and HEAD answer like the
 * page. Fields are never logged.
 */
import { siteFetch } from './markets.js';

const SUFFIX = /\.mfe\.html$/;
const MAX_BODY = 64 * 1024;
const MAX_FIELDS = 50;
const MAX_VALUE = 256;
const NAME = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/;
const CONTROL = /pass|pwd|token|secret|cookie|session|auth|credential|api[-_.]?key|private|redirect|return[-_.]?(url|to)|callback|host|referr?er|script|csrf|xsrf|nonce|signature|charset/i;

export const isMfePath = (pathname) => SUFFIX.test(pathname);

/** The page path of a .mfe.html path (without the suffix and the repository's market prefix). */
export const mfePage = (pathname) => pathname.replace(SUFFIX, '')
  .replace(/^\/content\/lh\/markets(?=\/)/, '').replace(/\/+$/, '') || '/';

export const escapeHtml = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;');

/** Whether a field name may reach the page. */
export const allowedName = (name) => NAME.test(name) && !CONTROL.test(name);

/**
 * The fields that reach the page: [[name, values], ...] in their order -> {name: value}.
 * @param {Array<[string, Array<string|File>]>} entries
 */
export function filterFields(entries) {
  const out = {};
  entries.forEach(([name, values]) => {
    if (Object.keys(out).length >= MAX_FIELDS || !allowedName(name)) return;
    const texts = values.filter((v) => typeof v === 'string');
    if (!texts.length) return;
    const value = texts.join(',');
    if (escapeHtml(value).length > MAX_VALUE) return;
    out[name] = value;
  });
  return out;
}

/**
 * The form fields of a POST body, grouped by name ([] for another type or a broken body; null for
 * a body over 64 KB).
 */
async function formEntries(request) {
  const type = (request.headers.get('content-type') || '').toLowerCase();
  const grouped = new Map();
  const add = (k, v) => grouped.set(k, [...(grouped.get(k) || []), v]);
  try {
    if (type.includes('multipart/form-data')) {
      (await request.formData()).forEach((v, k) => add(k, v));
    } else if (type.includes('application/x-www-form-urlencoded') || !type) {
      const body = await request.text();
      if (body.length > MAX_BODY) return null;
      new URLSearchParams(body).forEach((v, k) => add(k, v));
    }
  } catch (e) {
    return [];
  }
  return [...grouped.entries()];
}

/** Whether the page's head has <meta name="post-handler" content="true">. */
export function acceptsPost(html) {
  const head = String(html).split(/<\/head>/i)[0];
  return [...head.matchAll(/<meta\s[^>]*>/gi)].some(([tag]) => /\bname=["']?post-handler["'\s>/]/i.test(tag)
    && /\bcontent=["']?\s*true\s*["'\s>/]/i.test(tag));
}

/** The page with data-config on the first micro-frontend block (none: the page unchanged). */
export function withConfig(html, fields) {
  return String(html).replace(
    /<div class="micro-frontend(?: [^"]*)?"/,
    (tag) => `${tag} data-config="${escapeHtml(JSON.stringify(fields))}"`,
  );
}

const text = (status, body) => new Response(body, {
  status,
  headers: {
    'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', 'x-lh-edge-route': 'mfe',
  },
});

export async function mfe(request, env) {
  const url = new URL(request.url);
  const page = mfePage(url.pathname);
  const target = new URL(`${page}${url.search}`, `https://${env.ORIGIN}`);
  if (request.method === 'GET' || request.method === 'HEAD') {
    const resp = await siteFetch(request, env, target);
    resp.headers.set('x-lh-edge-route', 'mfe');
    return resp;
  }
  if (request.method !== 'POST') return text(405, 'Method not allowed\n');
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY) return text(413, 'Too much data\n');
  const entries = await formEntries(request);
  if (!entries) return text(413, 'Too much data\n');
  // the page itself, fetched with GET and the visitor's headers but without the body
  const headers = new Headers(request.headers);
  ['content-type', 'content-length'].forEach((h) => headers.delete(h));
  const resp = await siteFetch(new Request(url.href, { headers }), env, target);
  const html = resp.status === 200 && (resp.headers.get('content-type') || '').includes('text/html')
    ? await resp.text() : '';
  if (!html || !acceptsPost(html)) return text(403, 'This page does not accept posted data.\n');
  const out = new Headers(resp.headers);
  ['etag', 'last-modified', 'cdn-cache-control', 'surrogate-control', 'surrogate-key', 'cache-tag', 'content-length', 'content-encoding']
    .forEach((h) => out.delete(h));
  out.set('cache-control', 'private, no-store');
  out.set('x-lh-edge-route', 'mfe');
  return new Response(withConfig(html, filterFields(entries)), { status: 200, headers: out });
}
