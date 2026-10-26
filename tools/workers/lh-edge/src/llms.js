/**
 * Generated llms.txt (AMS rest A8): GET /<cc>/llms.txt (every locale of the market) and
 * /<cc>/<ll>/llms.txt, built from the locale query indexes (/<cc>/<ll>/search-index.json,
 * columns llms-include, llms-title, llms-description, llms-category, ai-guidance; AUTHORING.md):
 * - a title line (as the curated /de/llms.txt: "# Lufthansa — <Country> (<CC>)") and the
 *   global index line;
 * - per locale a banner heading, the ai-guidance text of the locale's homepage, then one
 *   section per llms-category with `- [<llms-title or page title>](<page URL>): <llms-description
 *   or description>` for the pages with llms-include true, ordered by category and title;
 * - a closing line pointing at https://www.lufthansa.com/llms.txt.
 * A static file at the path (the curated /llms.txt and /de/llms.txt) wins: the origin is asked
 * first. text/plain, cached for an hour (edge and browsers) once it lists pages; a file without
 * pages for a minute and not at the edge, so the first published page shows at once.
 */
/* eslint-disable import/no-relative-packages */
import { LOCALES, LIVE_ORIGIN } from '../../../../scripts/locale.js';
/* eslint-enable import/no-relative-packages */
import { originFetch } from './edge.js';
import { readSheet } from './sheet.js';

const PATH = /^\/([a-z]{2})(?:\/([a-z]{2}))?\/llms\.txt$/;
export const GLOBAL_INDEX = `${LIVE_ORIGIN}/llms.txt`;
const COUNTRIES = { at: 'Austria', de: 'Germany', gb: 'United Kingdom' };
const LANGUAGES = { de: 'GERMAN', en: 'ENGLISH' };
const RULE = '#'.repeat(72);
const TTL = 3600;

export const isLlmsPath = (pathname) => PATH.test(pathname);
const isTrue = (v) => String(v || '').trim().toLowerCase() === 'true';
const clean = (s) => String(s || '').replace(/\s+/g, ' ').trim();
const titleOf = (r) => clean(r['llms-title']) || clean(r.title).replace(/\s*\|\s*Lufthansa\s*$/, '');

/** The locales of a request path: [cc/ll] or every locale of the market cc. */
export function localesOf(pathname) {
  const m = pathname.match(PATH);
  if (!m) return [];
  const [, cc, ll] = m;
  // the market's locales in alphabetical order (de/de before de/en, as the curated /de/llms.txt)
  const keys = ll ? [`${cc}/${ll}`] : Object.keys(LOCALES).filter((k) => k.startsWith(`${cc}/`)).sort();
  return keys.filter((k) => LOCALES[k]);
}

/** The llms.txt text of the locales from their index rows ({ 'at/de': rows }). */
export function buildLlms(keys, rowsByLocale) {
  const cc = keys[0].split('/')[0];
  const out = [`# Lufthansa — ${COUNTRIES[cc] || cc.toUpperCase()} (${cc.toUpperCase()})`, '', `meta: global-index=${GLOBAL_INDEX}`];
  keys.forEach((key) => {
    const ll = key.split('/')[1];
    const rows = rowsByLocale[key] || [];
    out.push('', RULE, `# ${LANGUAGES[ll] || ll.toUpperCase()} LANGUAGE (${ll}) — ${(COUNTRIES[cc] || cc).toUpperCase()}`, RULE);
    const home = rows.find((r) => r.path === `/${key}/homepage`);
    const guidance = clean(home && home['ai-guidance']);
    if (guidance) out.push('', guidance);
    const pages = rows.filter((r) => isTrue(r['llms-include']) && clean(r['llms-category']));
    const categories = [...new Set(pages.map((r) => clean(r['llms-category'])))].sort((a, b) => a.localeCompare(b, ll));
    categories.forEach((cat) => {
      out.push('', `## ${cat}`, '');
      pages.filter((r) => clean(r['llms-category']) === cat).sort((a, b) => titleOf(a).localeCompare(titleOf(b), ll)).forEach((r) => {
        const desc = clean(r['llms-description']) || clean(r.description);
        out.push(`- [${titleOf(r)}](${LIVE_ORIGIN}${r.path})${desc ? `: ${desc}` : ''}`);
      });
    });
  });
  out.push('', `Global index of all Lufthansa markets: ${GLOBAL_INDEX}`, '');
  return out.join('\n');
}

const text = (body, extra = {}) => new Response(body, {
  headers: {
    'content-type': 'text/plain; charset=utf-8', 'cache-control': `public, max-age=${TTL}`, 'x-lh-edge-route': 'llms', ...extra,
  },
});

export async function llmsTxt(request, env, ctx) {
  const url = new URL(request.url);
  // a curated static file at this path wins (/llms.txt, /de/llms.txt)
  const own = await originFetch(new Request(request.url, { method: 'GET', headers: request.headers }), env, new URL(url.pathname, `https://${env.ORIGIN}`));
  if (own.ok) return own;
  const keys = localesOf(url.pathname);
  if (!keys.length) return new Response('Not Found', { status: 404, headers: { 'x-lh-edge-route': 'llms' } });
  const cache = typeof caches !== 'undefined' ? caches.default : null;
  // the cache key's version drops what an earlier version cached
  const cacheKey = new Request(`${url.origin}${url.pathname}?llms-cache=2`);
  const hit = cache && await cache.match(cacheKey);
  if (hit) return hit;
  const rowsByLocale = Object.fromEntries(await Promise.all(keys.map(async (k) => [k, await readSheet(request, env, `/${k}/search-index.json?limit=5000`)])));
  const body = buildLlms(keys, rowsByLocale);
  const listed = /^- \[/m.test(body);
  // a file without pages is not kept at the edge: the first published page shows at once
  const resp = text(body, listed ? {} : { 'cache-control': 'public, max-age=60' });
  if (listed && cache && ctx && ctx.waitUntil) ctx.waitUntil(cache.put(cacheKey, resp.clone()));
  return resp;
}
