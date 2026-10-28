/**
 * www's site search API, POST /service/secured/api/search (README "Site search"): the answer
 * www's own front end and other clients read, from the locale's search index
 * (/<cc>/<ll>/search-index.json) and the site's scoring (scripts/site-search.js, the same as
 * the search-results block).
 *
 * - Request: body {"phrase": "..."}, headers X-Portal: LH, X-Portal-Site: <CC>,
 *   X-Portal-Language: <ll>. Without them, or without a phrase, www answers 400
 *   {"error":"Invalid input","errors":[],"validationErrors":[]}: so does this route.
 * - Answer: 200 {"results": [{"link", "headline", "description"}], "total", "pageSize": 10},
 *   at most 30 results, content-type application/json and no cache-control, as www. link is the
 *   page's path on this site (www sends its AEM paths, /content/lh/markets/de/en/..., which
 *   this site doesn't serve). Pages with hide-in-search: true are left out.
 * - Markets without their own replica (X-Portal-Site CH ...) search the migrated locale of
 *   the same language (de/de, de/en), as the site does for nav and footer.
 */
import { originFetch } from './edge.js';
import { dataSearchAnswer } from './search-data.js';
/* eslint-disable import/no-relative-packages */
import { prepareRow, searchAnswer } from '../../../../scripts/site-search.js';
import { LIVE_ROOTS } from '../../../../scripts/locale.js';
/* eslint-enable import/no-relative-packages */

export const SEARCH_PATH = '/service/secured/api/search';
export const isSearchPath = (pathname) => pathname === SEARCH_PATH;

// the migrated locales, from the locale table (scripts/locale-table.js)
const LOCALES = LIVE_ROOTS;
const INVALID = { error: 'Invalid input', errors: [], validationErrors: [] };
const INDEX_TTL_MS = 60000;
const PAGE = 1000;
const indexes = new Map();

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'content-type': 'application/json', 'x-lh-edge-route': 'search' },
});

/** The replica locale of www's market headers, or null. */
export function searchLocale(site, language) {
  const cc = String(site || '').trim().toLowerCase();
  const ll = String(language || '').trim().toLowerCase();
  if (!/^[a-z]{2}$/.test(cc) || !/^[a-z]{2}$/.test(ll)) return null;
  const key = `${cc}/${ll}`;
  if (LOCALES.includes(key)) return key;
  return LOCALES.find((l) => l.endsWith(`/${ll}`) && l.startsWith('de/')) || LOCALES.find((l) => l.endsWith(`/${ll}`)) || null;
}

/** The prepared rows of a locale's search index (kept for a minute per isolate). */
export async function loadSearchIndex(request, env, locale) {
  const cached = indexes.get(locale);
  if (cached && Date.now() - cached.at < INDEX_TTL_MS) return cached.rows;
  const get = new Request(request.url, { method: 'GET', headers: { accept: 'application/json' } });
  const rows = [];
  for (let offset = 0; offset < 50000; offset += PAGE) {
    // eslint-disable-next-line no-await-in-loop
    const resp = await originFetch(get, env, `https://${env.ORIGIN}/${locale}/search-index.json?limit=${PAGE}&offset=${offset}`);
    if (!resp.ok) throw new Error(`search index ${locale}: HTTP ${resp.status}`);
    // eslint-disable-next-line no-await-in-loop
    const sheet = await resp.json();
    const data = Array.isArray(sheet.data) ? sheet.data : [];
    rows.push(...data);
    if (data.length < PAGE || rows.length >= (sheet.total || 0)) break;
  }
  const prepared = rows.filter((r) => r && r.path).map(prepareRow);
  indexes.set(locale, { at: Date.now(), rows: prepared });
  return prepared;
}

/** Drops the cached indexes (tests). */
export function resetSearchCache() {
  indexes.clear();
}

/** The route. */
export async function siteSearch(request, env) {
  const h = request.headers;
  const locale = String(h.get('x-portal') || '').toUpperCase() === 'LH'
    ? searchLocale(h.get('x-portal-site'), h.get('x-portal-language')) : null;
  let phrase = '';
  try {
    const body = await request.json();
    phrase = body && typeof body.phrase === 'string' ? body.phrase.trim() : '';
  } catch (e) {
    phrase = '';
  }
  if (!locale || !phrase) return json(INVALID, 400);
  // the prebuilt search data when it is the index's state (src/search-data.js), else the index
  const fromData = await dataSearchAnswer(request, env, locale, phrase).catch(() => null);
  if (fromData) return json(fromData);
  let rows;
  try {
    rows = await loadSearchIndex(request, env, locale);
  } catch (e) {
    return json({ error: 'Search failed', errors: [], validationErrors: [] }, 500);
  }
  return json(searchAnswer(rows, phrase));
}
