/**
 * Other sites on lh-com's code (brief 124): a host of the var SITE_HOSTS ("host=site; host2=site",
 * empty: none) is answered for that site, everything else exactly as before. A site has its own
 * locale table (SITES below: roots, languages, hreflang; which roots hold the language documents,
 * which are market roots answered from them by src/markets.js), its own Edge Delivery origin (var
 * SITE_ORIGINS "site=main--<repo>--<owner>.aem.live", checked like ORIGIN) and the host its links
 * name on the source web site (var SITE_WWW_HOSTS "site=www.example.com"). Host names stay in
 * vars; a site without an origin in SITE_ORIGINS is not served. A site without <cc>/<ll> roots
 * (PLAIN_SITES) has no locale table: its paths pass through to its origin as they are, only its
 * entry paths redirect. www's design-system files (/digitalhangar/, the brand fonts) come from the
 * site's host in the var SITE_DESIGN_HOSTS ("site=www.example.com"; none: the origin's answer).
 * lh-com's own table (scripts/locale-table.js) is LH_TABLES: every route reads it as before.
 */
/* eslint-disable import/no-relative-packages */
import { LOCALE_TABLE, LANGUAGE_VERSIONS, NEUTRAL_VERSIONS } from '../../../../scripts/locale-table.js';
import { BRAND_SITES } from '../../../../scripts/brands.js';
/* eslint-enable import/no-relative-packages */

/**
 * A site's tables: the locale rows, the language versions, the market roots, the own roots, the
 * rest-of-world roots by language (BRAND_SITES restOfWorld; none: {}), the neutral versions by
 * language (lh-com's NEUTRAL_VERSIONS: www's xx/en and xx/de; none: {}).
 */
export function tablesOf(table, versions, restOfWorld = {}, neutral = {}) {
  const marketRoots = Object.keys(table).filter((k) => table[k].documents === 'language');
  // roots with every page as their own document besides the language versions (lh-com's at/de,
  // gb/en)
  const ownRoots = Object.keys(table).filter((k) => table[k].documents === 'own'
    && table[k].status === 'live' && !Object.values(versions).includes(k));
  return {
    table, versions, marketRoots, ownRoots, restOfWorld, neutral,
  };
}

/** lh-com's tables (scripts/locale-table.js). */
export const LH_TABLES = tablesOf(LOCALE_TABLE, LANGUAGE_VERSIONS, {}, NEUTRAL_VERSIONS);

/**
 * The sites with <cc>/<ll> roots: their tables, built from scripts/brands.js BRAND_SITES (the one
 * source of their roots, language versions and labels, shared with the site's pages:
 * scripts/locale.js).
 */
export const SITES = Object.fromEntries(Object.entries(BRAND_SITES)
  .map(([name, site]) => [name, tablesOf(site.rows, site.versions, site.restOfWorld)]));

/**
 * Entry paths of a site's roots: /<cc>/<ll> (and with a slash) to the root's homepage, /<cc> to
 * the country's first root's (the rows' order: its own roots first); alias countries (Brussels:
 * www sends /xx/<ll>/* to /be/<ll>/*) as their target's, /<alias> to the target's first root.
 */
function rootEntries(rows, aliases = {}) {
  const entries = {};
  const add = (from, to) => { entries[from] = to; entries[`${from}/`] = to; };
  Object.keys(rows).forEach((key) => {
    const [cc] = key.split('/');
    add(`/${key}`, `/${key}/homepage`);
    if (!entries[`/${cc}`]) add(`/${cc}`, `/${key}/homepage`);
  });
  Object.entries(aliases).forEach(([alias, cc]) => {
    Object.keys(rows).filter((k) => k.startsWith(`${cc}/`)).forEach((key) => add(`/${alias}/${key.split('/')[1]}`, `/${key}/homepage`));
    add(`/${alias}`, entries[`/${cc}`]);
  });
  return entries;
}

// alias countries of a site's roots (Brussels: www sends /xx/<ll>/* to /be/<ll>/*)
const ENTRY_ALIASES = { brussels: { xx: 'be' } };
// entry paths besides its roots', as on the source: Austrian's www sends /xx/en to
// /at/en/homepage and /at to a 404 (/at/at/en/homepage), here to /at/en/homepage too
// SWISS's www sends /ch to /ch/de/homepage, /xx/<ll>[/homepage] to /ch/<ll>/homepage and the
// sub-sites' /<ll>/homepage to /ch/<ll>/homepage (the groundwork's 1.6; the site's languages: the
// pilot's en and de, fr and it since brief 272)
const swissEntries = () => {
  const out = { '/ch': '/ch/de/homepage', '/ch/': '/ch/de/homepage' };
  Object.keys(BRAND_SITES.swiss.versions).forEach((ll) => {
    [`/xx/${ll}`, `/xx/${ll}/`, `/xx/${ll}/homepage`, `/${ll}/homepage`].forEach((p) => { out[p] = `/ch/${ll}/homepage`; });
  });
  return out;
};
const ENTRY_EXTRAS = {
  austrian: {
    '/xx/en': '/at/en/homepage', '/xx/en/': '/at/en/homepage', '/at': '/at/en/homepage', '/at/': '/at/en/homepage',
  },
  swiss: swissEntries(),
};

/**
 * A site's entry paths besides / (which goes to its first language version's homepage): path ->
 * the path it redirects to (302), as on the source (www.ita-airways.com /it/en ->
 * /it/en/homepage): every root of BRAND_SITES (/<cc>/<ll>[/], /<cc>[/]) to its homepage, plus the
 * aliases and extras above.
 */
export const SITE_ENTRIES = Object.fromEntries(Object.entries(BRAND_SITES).map(([name, site]) => [
  name, { ...rootEntries(site.rows, ENTRY_ALIASES[name]), ...(ENTRY_EXTRAS[name] || {}) },
]));

/**
 * The sites whose reference roots' pages list their alternates (src/live-alternates.js, as
 * lh-com's live roots): the ones whose www carries hreflang alternates, in its sitemaps (none in a
 * page head on www: content-sites/<site>/lists/hreflang-groups.tsv, Austrian 308 groups, Brussels
 * 317; ITA's 128 market sitemap files). The market copies list them on every site; B2B's www has
 * no sitemap and no hreflang, Discover's www has no snapshot here.
 */
// (SWISS: www's sitemaps carry alternates as Austrian's; its market roots come behind
// scripts/brands.js's switch: without them there is nothing to list)
export const ALTERNATES_SITES = new Set(['austrian', 'brussels', 'ita', 'swiss']);

/**
 * The sites whose www has page paths with "&" (SWISS: /us/en/local-pages/baggage-&-other-fees): a
 * 301 to the document's "-and-" path (src/url-forms.js ampersandTarget), since aem.live answers
 * such a path 404 before the site's redirects are read.
 */
export const AMPERSAND_SITES = new Set(['swiss']);

/**
 * The sites without <cc>/<ll> roots (no locale table, no market roots): every path passes through
 * to the site's origin as it is; entry: the paths that redirect (302) as on the source.
 */
export const PLAIN_SITES = {
  // Lufthansa Cargo (DA moved-permanently/lh-cargo, www.lufthansa-cargo.com): / redirects to
  // /en/home there, /en/ and /de/ serve the homepage, whose documents are /en/home and /de/home
  cargo: {
    // its old article addresses aem.live refuses before /redirects (src/cargo-articles.js)
    articles: true,
    entry: {
      '/': '/en/home', '/en': '/en/home', '/en/': '/en/home', '/de': '/de/home', '/de/': '/de/home',
    },
  },
  // Air Dolomiti (DA moved-permanently/lh-airdolomiti, www.airdolomiti.it): Italian at /, English
  // at /en/..., German at /de/...; www answers /en and /de as its English and German homepages
  // (200, 2026-11-01): here the 302 to /en/ and /de/
  airdolomiti: { entry: { '/en': '/en/', '/de': '/de/' } },
  // TAP Air Portugal (DA moved-permanently/lh-tap, www.flytap.com): <ll>-<cc> roots, / to the
  // first, /pt-pt (scripts/site-languages.js SITE_LANGUAGES.tap); markets: its market roots
  // (de-ch, fr-ca …) answered from its language versions once they are on (src/tap-markets.js)
  tap: { entry: { '/': '/pt-pt' }, markets: true },
};

const pairs = (value) => {
  const map = {};
  String(value || '').split(';').forEach((entry) => {
    const [k, v] = entry.split('=').map((s) => (s || '').trim());
    if (k && v) map[k.toLowerCase()] = v;
  });
  return map;
};

// as ORIGIN's check (src/edge.js originFetch): aem.page only for a test against the preview
// origin (wrangler dev --var SITE_ORIGINS:site=main--…aem.page)
const ORIGIN_SHAPE = /^main--[a-z0-9-]+--[a-z0-9-]+\.aem\.(live|page)$/;

/**
 * The site a request's host is (its name, tables, origin, www host), or null: lh-com as before.
 * host: the request's own host (the public host headers of a CDN in front don't name a site).
 */
export function siteOf(request, env = {}) {
  const host = new URL(request.url).hostname.toLowerCase();
  const name = pairs(env.SITE_HOSTS)[host];
  if (!name || !(SITES[name] || PLAIN_SITES[name])) return null;
  const origin = pairs(env.SITE_ORIGINS)[name];
  if (!origin || !ORIGIN_SHAPE.test(origin)) return null;
  return {
    name,
    tables: SITES[name] || null,
    plain: SITES[name] ? null : PLAIN_SITES[name],
    entry: (SITES[name] && SITE_ENTRIES[name]) || {},
    origin,
    www: pairs(env.SITE_WWW_HOSTS)[name] || '',
    design: pairs(env.SITE_DESIGN_HOSTS)[name] || '',
  };
}

/**
 * A site's own hosts (SITE_HOSTS of that site), but `except` (its alias host): the hosts whose
 * links its alias host's answers move to the alias (src/alias.js), as lufthansa-cn's
 * ALIAS_REWRITE_HOSTS.
 */
export function siteHostsOf(name, env = {}, except = '') {
  return Object.entries(pairs(env.SITE_HOSTS))
    .filter(([h, n]) => n === name && h !== except).map(([h]) => h);
}

/**
 * The sites whose language versions' index is not /<version>/search-index.json: SWISS's reference
 * roots are ch/<ll>, lh-com's market roots with documents of their own, and helix-query.yaml serves
 * every site, so a search-ch-<ll> index would give lh-com's origin a /ch/<ll>/search-index.json
 * too (its market route would answer that instead of ch's from de/en). SWISS's are
 * /ch/<ll>/language-index.json (helix-query.yaml language-ch-<ll>); src/edge.js originFetch reads
 * them for the search index on SWISS's hosts.
 */
export const SITE_INDEX_PATHS = {
  swiss: (version) => `/${version}/language-index.json`,
};

/**
 * The small sitemap index of a site's language version (brief 349; none: its language index):
 * SWISS's ch/<ll> (helix-query.yaml sitemap-ch-<ll>, the language index's pages with robots and
 * lastModified only), read by src/site-sitemaps.js once it is filled.
 */
export const SITE_SITEMAP_INDEXES = {
  swiss: (version) => (/^ch\/[a-z]{2}$/.test(version) ? `/${version}/sitemap-index.json` : null),
};

/**
 * The two-letter roots helix-query.yaml's market-pages index leaves out (it serves every site):
 * lh-com's four roots with their own indexes, Discover's xx/fr, ITA's and Austrian's language
 * versions. Each has its own search-<cc>-<ll> index. On SWISS (MARKET_EXTRA_INDEX_SITES) its
 * market roots among them are market roots like the others, whose own pages that index holds
 * instead of /market-pages.json: siteEnv's MARKET_EXTRA_INDEXES, read with it (src/edge.js
 * originFetch). test/swiss-market-index.test.mjs checks the list against helix-query.yaml.
 */
export const MARKET_INDEX_EXCLUDED_ROOTS = [
  'de/en', 'de/de', 'at/de', 'gb/en', 'xx/fr', 'it/en', 'it/it', 'fr/fr', 'es/es', 'nl/nl', 'br/pt',
  'gr/el', 'jp/ja', 'ru/ru', 'cn/zh', 'pl/pl',
];
const MARKET_EXTRA_INDEX_SITES = new Set(['swiss']);

/**
 * The env a site's request is answered with: its origin and www host, its tables (read by
 * src/markets.js tables(env)), every market root served on its host (no pilot rows); INDEX_PATHS:
 * its language versions' and own roots' (SWISS's kr/ko, helix-query.yaml language-kr-ko) index
 * paths where they are not their search-index.json (SITE_INDEX_PATHS);
 * MARKET_EXTRA_INDEXES: the search indexes of its market roots the market index leaves out.
 */
export function siteEnv(env, site) {
  const indexOf = SITE_INDEX_PATHS[site.name];
  const indexPaths = indexOf && site.tables
    ? Object.fromEntries([...Object.values(site.tables.versions), ...site.tables.ownRoots]
      .map((v) => [`/${v}/search-index.json`, indexOf(v)])) : undefined;
  const extra = MARKET_EXTRA_INDEX_SITES.has(site.name) && site.tables
    ? site.tables.marketRoots.filter((r) => MARKET_INDEX_EXCLUDED_ROOTS.includes(r))
      .map((r) => `/${r}/search-index.json`) : [];
  return {
    ...(indexPaths ? { INDEX_PATHS: indexPaths } : {}),
    ...(extra.length ? { MARKET_EXTRA_INDEXES: extra } : {}),
    ...env,
    ORIGIN: site.origin,
    WWW_HOST: site.www || env.WWW_HOST,
    SITE: site.name,
    // a plain site has none: no route of it reads the tables
    SITE_TABLES: site.tables || undefined,
    DESIGN_HOST: site.design,
    PILOT_HOSTS: '',
    PILOT_COUNTRIES_BY_HOST: '',
  };
}

/** The tables of a request's env: a site's (siteEnv), else lh-com's. */
export const tables = (env) => (env && env.SITE_TABLES) || LH_TABLES;
