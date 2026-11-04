/**
 * Sitemaps on the brand hosts (brief 342; src/sites.js siteOf): /sitemap.xml is an index of the
 * host's sitemaps, each URL on the host itself (the demo host, not www):
 * - TAP: its language versions' /<version>/sitemap.xml (src/tap-markets.js tapVersionSitemapXml,
 *   from helix-query.yaml's tap-pages-<version>) and the market roots' that are on
 *   (/<root>/sitemap.xml, answered by the market route), as www.flytap.com's index;
 * - a site with <cc>/<ll> roots: every language version's, own root's and served market root's
 *   /<cc>/<ll>/sitemap.xml: a language version's or own root's pages from its index (its
 *   search-index.json, SWISS's language-index.json; SWISS's ch/<ll> its small sitemap-index.json
 *   once that is filled: src/sites.js SITE_SITEMAP_INDEXES), a market root's the language pages it
 *   serves and its own pages (the market model, as its pages are answered: src/markets.js
 *   sitemapEntries), without noindex pages, navs, footers and fragments;
 * - a site without roots (Cargo, Air Dolomiti): one per language from its search index (its
 *   homepage first), /<ll>/sitemap.xml, a language at / /sitemap-<ll>.xml (www.airdolomiti.it's
 *   /sitemap-it.xml).
 * No hreflang (the roots' sitemaps list none either). Kept an hour (the edge cache, the host in
 * its key). Every other path: null (the routes as before). robots.txt is the origin's.
 */
import { originFetch, publicHost } from './edge.js';
import { SITE_SITEMAP_INDEXES } from './sites.js';
import {
  compactIndex, marketModel, servedMarketRoots, sitemapEntries, NOT_PAGES,
} from './markets.js';
import { TAP_VERSIONS, tapVersionSitemapXml } from './tap-markets.js';
/* eslint-disable import/no-relative-packages */
import { SITE_LANGUAGES, languageOfPath } from '../../../../scripts/site-languages.js';
import { TAP_LIVE_MARKETS, TAP_MARKETS } from '../../../../scripts/tap-markets.js';
/* eslint-enable import/no-relative-packages */

const ROUTE = 'site-sitemap';
const TTL = 3600;
const SITEMAP_PATH = /^\/(?:[a-z0-9-]+\/){0,2}sitemap(?:-[a-z]{2})?\.xml$/;

const xmlEscape = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const day = (lastModified) => {
  const n = Number(lastModified);
  return Number.isFinite(n) && n > 0 ? new Date(n * 1000).toISOString().slice(0, 10) : '';
};
const HEAD = '<?xml version="1.0" encoding="UTF-8"?>\n';
const NS = 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';

/** An urlset of [path, lastModified] on the host. */
const urlset = (host, rows) => `${HEAD}<urlset ${NS}>\n${rows.map(([p, mod]) => `<url><loc>${xmlEscape(`${host}${p}`)}</loc>${
  day(mod) ? `<lastmod>${day(mod)}</lastmod>` : ''}</url>`).join('\n')}\n</urlset>\n`;

/** A sitemap index of paths on the host. */
const sitemapIndex = (host, paths) => `${HEAD}<sitemapindex ${NS}>\n${paths.map((p) => `<sitemap><loc>${xmlEscape(`${host}${p}`)}</loc></sitemap>`).join('\n')}\n</sitemapindex>\n`;

/** Whether a row of an index is a page of a sitemap: no nav, footer, fragment or noindex page. */
const listed = (p, row) => !NOT_PAGES.test(p) && !/noindex/i.test((row && row.robots) || '');

/** The pages of a root's index (path -> row) under the root, by path: [[path, lastModified]]. */
const rootRows = (index, root) => {
  const rows = [];
  index.forEach((row, p) => {
    if (p.startsWith(`/${root}/`) && listed(p, row)) rows.push([p, row.lastModified]);
  });
  return rows.sort(([a], [b]) => (a < b ? -1 : Number(a > b)));
};

/** The total of an index (one row read), or -1 when it can't be read. */
async function indexTotal(request, env, path) {
  try {
    const get = new Request(request.url, { method: 'GET', headers: { accept: 'application/json' } });
    const resp = await originFetch(get, env, `https://${env.ORIGIN}${path}?limit=1`);
    if (!resp.ok) {
      if (resp.body) resp.body.cancel().catch(() => {});
      return -1;
    }
    const total = Number((await resp.json()).total);
    return Number.isFinite(total) ? total : -1;
  } catch (e) {
    return -1;
  }
}

/**
 * A language version's small sitemap index (SITE_SITEMAP_INDEXES) as path -> row, once it is
 * filled (its total the language index's), else null (the language index as before).
 */
async function smallIndex(request, env, site, root) {
  const path = SITE_SITEMAP_INDEXES[site.name] && SITE_SITEMAP_INDEXES[site.name](root);
  if (!path) return null;
  const [small, full] = await Promise.all([
    indexTotal(request, env, path), indexTotal(request, env, `/${root}/search-index.json`),
  ]);
  return small > 0 && small === full ? compactIndex(request, env, path) : null;
}

/**
 * The sitemaps of a site: [{path, make}] in the index's order; make: (request, env) => xml, or
 * null where another route answers it (TAP's market roots).
 */
function sitemapsOf(site, request, env) {
  if (site.name === 'tap') {
    return [
      ...TAP_VERSIONS.map((v) => ({ path: `/${v}/sitemap.xml`, make: () => tapVersionSitemapXml(request, env, v) })),
      ...TAP_LIVE_MARKETS.filter((r) => TAP_MARKETS[r]).sort().map((r) => ({ path: `/${r}/sitemap.xml`, make: null })),
    ];
  }
  const languages = SITE_LANGUAGES[site.name];
  if (site.plain && languages) {
    return languages.map((l) => ({
      path: l.path === '/' ? `/sitemap-${l.lang}.xml` : `${l.path}sitemap.xml`,
      make: async (host) => {
        const index = await compactIndex(request, env, `${l.path}search-index.json`);
        const rows = [];
        index.forEach((row, p) => {
          const mine = p !== l.home && languageOfPath(p, languages) === l;
          if (mine && listed(p, row)) rows.push([p, row.lastModified]);
        });
        rows.sort(([a], [b]) => (a < b ? -1 : Number(a > b)));
        return urlset(host, [[l.home, index.get(l.home)?.lastModified], ...rows]);
      },
    }));
  }
  if (!site.tables) return [];
  const { versions, ownRoots, table } = site.tables;
  const versionRoots = Object.values(versions);
  const marketRoots = servedMarketRoots(request, env)
    .filter((r) => !versionRoots.includes(r)).sort();
  const own = ownRoots.filter((r) => table[r] && !versionRoots.includes(r));
  return [
    ...versionRoots.map((r) => ({
      path: `/${r}/sitemap.xml`,
      make: async (host) => {
        // its small sitemap index once it is filled (SWISS's ch/<ll>), else the market model's
        const small = await smallIndex(request, env, site, r);
        if (small) return urlset(host, rootRows(small, r));
        const model = await marketModel(request, env, [r]);
        return urlset(host, rootRows(model.versions[table[r].lang].index, r));
      },
    })),
    ...own.map((r) => ({
      path: `/${r}/sitemap.xml`,
      make: async (host) => urlset(host, rootRows(await compactIndex(request, env, `/${r}/search-index.json`), r)),
    })),
    ...marketRoots.map((r) => ({
      path: `/${r}/sitemap.xml`,
      make: async (host) => {
        const model = await marketModel(request, env, [r]);
        const rows = sitemapEntries(model, r).filter((e) => !NOT_PAGES.test(e.path))
          .map((e) => [e.path, e.lastModified]);
        return urlset(host, rows);
      },
    })),
  ];
}

/**
 * A brand host's sitemap: its index (/sitemap.xml) or one of its sitemaps, else null.
 * @param {Request} request
 * @param {Object} env the site's env (src/sites.js siteEnv)
 * @param {Object} site siteOf(request, env)
 * @param {Object} [ctx] the Worker's context (waitUntil: the edge cache)
 * @returns {Promise<Response|null>}
 */
export async function siteSitemap(request, env, site, ctx) {
  const url = new URL(request.url);
  if (!site || !['GET', 'HEAD'].includes(request.method) || !SITEMAP_PATH.test(url.pathname)) return null;
  const all = sitemapsOf(site, request, env);
  const one = url.pathname === '/sitemap.xml' ? null : all.find((s) => s.path === url.pathname);
  if (url.pathname !== '/sitemap.xml' && (!one || !one.make)) return null;
  const host = `https://${publicHost(request, env)}`;
  const headers = {
    'content-type': 'application/xml; charset=utf-8', 'cache-control': `public, max-age=${TTL}`, 'x-lh-edge-route': ROUTE,
  };
  if (request.method === 'HEAD') return new Response(null, { headers });
  const cache = typeof caches !== 'undefined' ? caches.default : null;
  const key = new Request(`${url.origin}${url.pathname}?site-sitemap=1&host=${encodeURIComponent(host)}`);
  const hit = cache && await cache.match(key);
  if (hit) return hit;
  let xml;
  try {
    xml = one ? await one.make(host) : sitemapIndex(host, all.map((s) => s.path));
  } catch (e) {
    return new Response('Service Unavailable', { status: 503, headers: { 'cache-control': 'no-store', 'x-lh-edge-route': ROUTE } });
  }
  const resp = new Response(xml, { headers });
  if (cache && ctx && ctx.waitUntil) ctx.waitUntil(cache.put(key, resp.clone()));
  return resp;
}

export default siteSitemap;
