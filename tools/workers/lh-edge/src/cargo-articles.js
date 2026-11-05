/**
 * Lufthansa Cargo's old article addresses that aem.live refuses before it reads lh-cargo's
 * /redirects sheet (src/url-forms.js cargoArticleTarget: %-escaped titles, a trailing dot, a
 * double slash): 301 to /<lang>/news/<slug> when the site's index (/<lang>/search-index.json) has
 * that page, else for de the English /en/news/<slug> when that exists (/de/-//de/it-does-fly-54:
 * no German page), else null (the path as it is). Cargo's host only (src/sites.js PLAIN_SITES
 * cargo.articles).
 */
import { originFetch } from './edge.js';

/** The paths of a language version's index on the site's origin (an empty set on an error). */
async function indexPaths(request, env, lang) {
  const get = new Request(request.url, { method: 'GET', headers: request.headers });
  try {
    const resp = await originFetch(get, env, new URL(`/${lang}/search-index.json?limit=5000`, `https://${env.ORIGIN}`));
    if (!resp.ok) return new Set();
    const sheet = await resp.json();
    return new Set((sheet.data || []).map((r) => r.path));
  } catch (e) {
    return new Set();
  }
}

/**
 * The location of an old article address, or null.
 * @param {Request} request
 * @param {Object} env the site's env (ORIGIN: lh-cargo's)
 * @param {{lang: string, slug: string}} article
 * @returns {Promise<string|null>}
 */
// eslint-disable-next-line import/prefer-default-export -- named, as the other routes' helpers
export async function cargoArticleLocation(request, env, { lang, slug }) {
  const { search } = new URL(request.url);
  const own = `/${lang}/news/${slug}`;
  if ((await indexPaths(request, env, lang)).has(own)) return `${own}${search}`;
  if (lang !== 'en') {
    const en = `/en/news/${slug}`;
    if ((await indexPaths(request, env, 'en')).has(en)) return `${en}${search}`;
  }
  return null;
}
