/**
 * TAP's market roots on its host (brief 328), as lufthansa.com's ch pilot (option B,
 * src/markets.js): a root <ll>-<cc> of scripts/tap-markets.js (de-ch, fr-ca, en-us …) that is
 * on (TAP_LIVE_MARKETS) is answered for /<root>/<path>:
 * - from the root's own document when the origin has one (its homepage /<root>/, Canada's legal
 *   pages, a nav or footer where it differs);
 * - else from its language version's (/<version>/<path>: de-ch from de-de, en-us from en-pt) when
 *   the page's `markets` (its metadata, its row of the version's pages index) allow the country;
 *   its sections by `markets`, its links into the language version the root's (unless the index
 *   leaves the root out of the target), www's links www's root, the site's hosts stripped,
 *   canonical and og:url the root's, hreflang per root (the language version and its roots that
 *   are on, the other languages' counterparts its alternate-<ll> metadata names, with theirs);
 *   a redirect of the language version into the root;
 * - else the origin's 404 for the root's path (www has no such page on the root).
 * /<root>/sitemap.xml: the language version's pages the country has (the pages index,
 * helix-query.yaml tap-pages-<version>) and the root's own pages. Media and files: the origin's.
 * A root that is off, a language root and every other path: null (the route as before).
 */
import {
  originFetch, passThrough, isMediaRequest, publicHost,
} from './edge.js';
import {
  marketHtml, marketHref, siteHosts, withoutConditions, NOT_PAGES,
} from './markets.js';
/* eslint-disable import/no-relative-packages */
import { marketAllows, dropMarketSections } from '../../../../scripts/market-rules.js';
import { TAP_MARKETS, TAP_LIVE_MARKETS } from '../../../../scripts/tap-markets.js';
/* eslint-enable import/no-relative-packages */

/** A language version's pages index (helix-query.yaml tap-pages-<version>). */
export const TAP_INDEX = (version) => `/${version}/pages-index.json`;

/** TAP's language versions (the roots whose documents the market roots use, and pt-br). */
const VERSIONS = new Set(['pt-pt', 'en-pt', 'es-es', 'fr-fr', 'de-de', 'it-it', 'pl-pl', 'pt-br']);
const hreflangOf = (root) => {
  const [ll, cc] = root.split('-');
  return `${ll}-${cc.toUpperCase()}`;
};
const ROUTE = 'tap-market';
const INDEX_TTL_MS = 60000;
const indexes = new Map();

/** The market root and the rest of a path (/de-ch/x -> {root: 'de-ch', rest: '/x'}), or null. */
export function tapMarketPath(pathname) {
  const m = String(pathname || '').match(/^\/([a-z]{2}-[a-z]{2})(\/.*)?$/);
  return m && TAP_MARKETS[m[1]] ? { root: m[1], rest: m[2] || '' } : null;
}

/** A language version's index as path -> row (kept a minute), or null when it can't be read. */
async function versionIndex(request, env, version) {
  const key = `${env.ORIGIN} ${version}`;
  const hit = indexes.get(key);
  if (hit && Date.now() - hit.at < INDEX_TTL_MS) return hit.rows;
  let rows = null;
  try {
    const resp = await originFetch(withoutConditions(request, 'GET'), env, `https://${env.ORIGIN}${TAP_INDEX(version)}?limit=1000`);
    if (resp.ok) {
      const json = await resp.json();
      rows = new Map((json.data || []).map((r) => [String(r.path || ''), r]));
    }
  } catch (e) {
    rows = null;
  }
  indexes.set(key, { at: Date.now(), rows });
  return rows;
}

/** Whether a root may have a language version's page: unknown to the index (not published): yes. */
function allowedIn(index, version, suffix, country) {
  if (!index) return true;
  const row = index.get(`/${version}${suffix}`);
  return !row || marketAllows(row.markets, country);
}

/** Whether a root has a language version's page: not in its lacks, its markets allowing it. */
function rootHas(root, index, suffix) {
  const [, country, version, , , , , lacks = []] = TAP_MARKETS[root];
  return !lacks.includes(suffix) && allowedIn(index, version, suffix, country);
}

const liveOf = (version, live) => live
  .filter((r) => TAP_MARKETS[r] && TAP_MARKETS[r][2] === version).sort();

/**
 * hreflang of a page: the language version and its roots that are on and have the page, then per
 * alternate-<ll> metadata (another language version's counterpart) that version and its roots.
 */
async function alternatesOf(request, env, html, version, suffix, live) {
  const out = [];
  const add = async (v, s) => {
    const index = await versionIndex(request, env, v);
    out.push({ hreflang: hreflangOf(v), path: `/${v}${s}` });
    liveOf(v, live).forEach((r) => {
      if (rootHas(r, index, s)) out.push({ hreflang: hreflangOf(r), path: `/${r}${s}` });
    });
  };
  await add(version, suffix);
  const metas = [...html.matchAll(/<meta name="alternate-[a-z]{2}" content="\/([a-z]{2}-[a-z]{2})((?:\/[^"?#]*)?)"/g)];
  // eslint-disable-next-line no-restricted-syntax
  for (const [, v, s] of metas) {
    // eslint-disable-next-line no-await-in-loop
    if (VERSIONS.has(v) && v !== version) await add(v, s.replace(/\/$/, ''));
  }
  return out;
}

const tagged = (resp, extra = {}) => {
  const headers = new Headers(resp.headers);
  headers.set('x-lh-edge-route', ROUTE);
  headers.delete('content-length');
  Object.entries(extra).forEach(([k, v]) => headers.set(k, v));
  return headers;
};

/**
 * www's market form of a link (https://www.flytap.com/en_pt/...) and the Alternate rows for the
 * root: www's en_us; an Alternate row the same market's root in that language where it is on.
 */
function rootForms(html, ctx) {
  const [ll, vcc] = ctx.from.split('-');
  const cc = ctx.country;
  const www = ctx.www.replace(/\./g, '\\.');
  const underscore = new RegExp(`(https://${www}/)${ll}_${vcc}(?=[/"?#&]|$)`, 'g');
  return html.replace(underscore, `$1${ll}_${cc}`)
    .replace(/(<meta name="alternate-([a-z]{2})" content=")\/([a-z]{2}-[a-z]{2})((?:\/[^"]*)?)"/g, (m, open, l2, v2, rest) => {
      const root = `${l2}-${cc}`;
      const row = TAP_MARKETS[root];
      if (!row || row[2] !== v2 || !ctx.live.includes(root)) return m;
      const lacks = row[7] || [];
      return lacks.includes(rest.replace(/\/$/, '')) ? m : `${open}/${root}${rest}"`;
    });
}

/** An HTML document for the root: sections, links, canonical, og:url, hreflang (marketHtml). */
async function forRoot(request, env, doc, ctx, { sections, alternates }) {
  const headers = tagged(doc);
  const text = await doc.text();
  const kept = sections ? dropMarketSections(text, ctx.country) : text;
  if (request.method === 'HEAD') return new Response(null, { status: doc.status, headers });
  const list = alternates
    ? await alternatesOf(request, env, kept, ctx.from, ctx.suffix, ctx.live) : [];
  const html = rootForms(kept, ctx);
  const resp = new Response(html, { status: doc.status, headers });
  return marketHtml(resp, { ...ctx, alternates: list });
}

const xmlEscape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const day = (lastModified) => {
  const n = Number(lastModified);
  return Number.isFinite(n) && n > 0 ? new Date(n * 1000).toISOString().slice(0, 10) : '';
};

/**
 * A root's sitemap: its homepage, the language version's pages the country has (its index) and
 * the root's own pages, each once, by path.
 */
export async function tapSitemapXml(request, env, root) {
  const [, country, version, , , , own = [], lacks = []] = TAP_MARKETS[root];
  const index = (await versionIndex(request, env, version)) || new Map();
  const host = `https://${publicHost(request, env)}`;
  const home = index.get(`/${version}`);
  const pages = new Map();
  index.forEach((row, path) => {
    if (!path.startsWith(`/${version}/`) || NOT_PAGES.test(path)) return;
    const suffix = path.slice(version.length + 1);
    if (!marketAllows(row.markets, country) || lacks.includes(suffix)) return;
    pages.set(suffix, day(row.lastModified));
  });
  own.forEach((s) => { if (!pages.has(s)) pages.set(s, ''); });
  const entry = (suffix, mod) => `<url><loc>${xmlEscape(`${host}/${root}${suffix}`)}</loc>${
    mod ? `<lastmod>${mod}</lastmod>` : ''}</url>`;
  const urls = [
    entry('', home ? day(home.lastModified) : ''),
    ...[...pages.keys()].sort().map((s) => entry(s, pages.get(s))),
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

/**
 * The route for a request on TAP's host, or null when it is not a market root's path that is on.
 * @param {Request} request
 * @param {Object} env the site's env (src/sites.js siteEnv: ORIGIN, WWW_HOST)
 * @param {{live?: string[]}} [options] the roots that are on (default: TAP_LIVE_MARKETS)
 * @returns {Promise<Response|null>}
 */
export async function tapMarket(request, env, { live = TAP_LIVE_MARKETS } = {}) {
  const url = new URL(request.url);
  const mp = tapMarketPath(url.pathname);
  if (!mp || !live.includes(mp.root) || !['GET', 'HEAD'].includes(request.method)) return null;
  if (isMediaRequest(url)) return passThrough(request, env);
  const { root, rest } = mp;
  const [, country, version] = TAP_MARKETS[root];
  if (rest === '/sitemap.xml') {
    const xml = await tapSitemapXml(request, env, root);
    return new Response(request.method === 'HEAD' ? null : xml, {
      headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600', 'x-lh-edge-route': ROUTE },
    });
  }
  const homepage = rest === '' || rest === '/';
  const last = rest.split('/').pop();
  const kind = (/\.plain\.html$/.test(last) && 'plain') || (last.includes('.') ? 'file' : 'page');
  const suffix = homepage ? '' : rest.replace(/\.plain\.html$/, '').replace(/\/$/, '');
  const index = await versionIndex(request, env, version);
  const ctx = {
    from: version,
    to: root,
    country,
    suffix,
    live,
    hosts: siteHosts(env),
    www: env.WWW_HOST || 'www.flytap.com',
    allowed: (s) => rootHas(root, index, s),
    marketPath: `/${root}${suffix}`,
  };
  // the root's own document first (its homepage is /<root>/, a folder's index)
  const ownPath = homepage ? `/${root}/` : `/${root}${rest}`;
  const own = await originFetch(withoutConditions(request, 'GET'), env, `https://${env.ORIGIN}${ownPath}${url.search}`);
  if (kind === 'file') return own;
  if (own.status !== 404) {
    if (!own.ok) return own;
    // www's root homepages list no hreflang; the root's other own pages none either
    return forRoot(request, env, own, ctx, { sections: false, alternates: false });
  }
  // the language version's, unless the root lacks it (markets.json) or the index leaves it out
  if (!rootHas(root, index, suffix)) return own;
  const target = homepage ? `/${version}` : `/${version}${rest}`;
  const doc = await originFetch(withoutConditions(request, 'GET'), env, `https://${env.ORIGIN}${target}`);
  const location = doc.headers.get('location');
  if ([301, 302, 307, 308].includes(doc.status) && location) {
    return new Response(null, {
      status: doc.status,
      headers: { location: marketHref(location, ctx) ?? location, 'cache-control': doc.headers.get('cache-control') || 'max-age=60', 'x-lh-edge-route': ROUTE },
    });
  }
  if (!doc.ok) return own;
  if (kind === 'page') {
    // the page's own markets metadata counts at once (the index takes it on publish)
    const text = await doc.clone().text();
    const meta = text.match(/<meta name="markets" content="([^"]*)"/);
    if (meta && !marketAllows(meta[1], country)) return own;
  }
  return forRoot(request, env, doc, ctx, { sections: true, alternates: kind === 'page' });
}
