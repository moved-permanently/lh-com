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
import { LOCALE_TABLE, LANGUAGE_VERSIONS } from '../../../../scripts/locale-table.js';
/* eslint-enable import/no-relative-packages */

/** A site's tables: the locale rows, the language versions, the market roots, the own roots. */
export function tablesOf(table, versions) {
  const marketRoots = Object.keys(table).filter((k) => table[k].documents === 'language');
  // roots with every page as their own document besides the language versions (lh-com's at/de,
  // gb/en)
  const ownRoots = Object.keys(table).filter((k) => table[k].documents === 'own'
    && table[k].status === 'live' && !Object.values(versions).includes(k));
  return {
    table, versions, marketRoots, ownRoots,
  };
}

/** lh-com's tables (scripts/locale-table.js). */
export const LH_TABLES = tablesOf(LOCALE_TABLE, LANGUAGE_VERSIONS);

// label: www's country and language label of the root (its header's selector), set where a
// market root's nav and footer come from its language version's (src/markets.js)
const row = (country, lang, hreflang, documents, label) => ({
  country, lang, hreflang, status: 'live', documents, ...(label ? { label } : {}),
});

// rows of roots <cc>/<ll>: hreflang <ll>-<CC>, an xx root's the language alone (as Discover's)
const rowsOf = (documents, roots) => Object.fromEntries(roots.map((r) => {
  const [cc, ll] = r.split('/');
  return [r, row(cc, ll, cc === 'xx' ? ll : `${ll}-${cc.toUpperCase()}`, documents)];
}));

/**
 * The sites. Discover Airlines (DA moved-permanently/lh-discover, www.discover-airlines.com):
 * de/en, de/de and xx/fr hold the language documents (the largest root of each language), the
 * market roots get them where their sitemaps list the page (the page's `markets` metadata) and
 * hold their own homepage and own pages; hreflang as www's sitemaps (2026-10-29); the market
 * roots' labels as www's country and language selector (its snapshots, 2026-10-30).
 * ITA Airways (DA moved-permanently/lh-ita, www.ita-airways.com): the nine reference roots hold
 * the language documents (tools/importer/ita-scope.mjs LANGUAGE_VERSIONS), the market roots get
 * them where the document's `markets` row lists the root (written as roots, "be/fr, ch/fr":
 * scripts/market-rules.js); the market roots as the published documents' markets rows and
 * tools/reports/lh-ita.md name them (50 of www's 55: the de, nl, pt, el and ja ones beyond xx/nl,
 * xx/pt and xx/ja come with those languages' documents).
 */
export const SITES = {
  discover: tablesOf({
    'de/en': row('de', 'en', 'en-DE', 'own'),
    'de/de': row('de', 'de', 'de-DE', 'own'),
    'xx/fr': row('xx', 'fr', 'fr', 'own'),
    'us/en': row('us', 'en', 'en-US', 'language', 'USA | English'),
    'ca/en': row('ca', 'en', 'en-CA', 'language', 'Canada | English'),
    'xx/en': row('xx', 'en', 'en', 'language', 'Other countries | English'),
    'us/de': row('us', 'de', 'de-US', 'language', 'USA | Deutsch'),
    'xx/de': row('xx', 'de', 'de', 'language', 'Andere Länder | Deutsch'),
    'ca/fr': row('ca', 'fr', 'fr-CA', 'language', 'Canada | Français'),
  }, { en: 'de/en', de: 'de/de', fr: 'xx/fr' }),
  ita: tablesOf({
    ...rowsOf('own', ['it/en', 'it/it', 'fr/fr', 'es/es', 'de/de', 'nl/nl', 'br/pt', 'gr/el', 'jp/ja']),
    ...rowsOf('language', [
      'ae/en', 'al/en', 'ar/en', 'at/en', 'au/en', 'be/en', 'bg/en', 'br/en', 'ca/en', 'ch/en',
      'de/en', 'do/en', 'dz/en', 'eg/en', 'es/en', 'fr/en', 'gb/en', 'gh/en', 'gr/en', 'hr/en',
      'il/en', 'in/en', 'jp/en', 'ly/en', 'mt/en', 'mu/en', 'mv/en', 'nl/en', 'sa/en', 'sn/en',
      'th/en', 'tn/en', 'us/en', 've/en', 'xx/en',
      'al/it', 'be/it', 'ch/it', 'xx/it',
      'be/fr', 'ca/fr', 'ch/fr', 'tn/fr', 'xx/fr',
      'ar/es', 'do/es', 'xx/es',
      'xx/nl', 'xx/pt', 'xx/ja',
    ]),
  }, {
    en: 'it/en', it: 'it/it', fr: 'fr/fr', es: 'es/es', de: 'de/de', nl: 'nl/nl', pt: 'br/pt', el: 'gr/el', ja: 'jp/ja',
  }),
};

/**
 * The sites without <cc>/<ll> roots (no locale table, no market roots): every path passes through
 * to the site's origin as it is; entry: the paths that redirect (302) as on the source.
 */
export const PLAIN_SITES = {
  // Lufthansa Cargo (DA moved-permanently/lh-cargo, www.lufthansa-cargo.com): / redirects to
  // /en/home there, /en/ and /de/ serve the homepage, whose documents are /en/home and /de/home
  cargo: {
    entry: {
      '/': '/en/home', '/en': '/en/home', '/en/': '/en/home', '/de': '/de/home', '/de/': '/de/home',
    },
  },
  // Air Dolomiti (DA moved-permanently/lh-airdolomiti, www.airdolomiti.it): Italian at /, English
  // at /en/..., German at /de/..., as on the source: no redirects
  airdolomiti: { entry: {} },
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
    origin,
    www: pairs(env.SITE_WWW_HOSTS)[name] || '',
    design: pairs(env.SITE_DESIGN_HOSTS)[name] || '',
  };
}

/**
 * The env a site's request is answered with: its origin and www host, its tables (read by
 * src/markets.js tables(env)), every market root served on its host (no pilot rows).
 */
export function siteEnv(env, site) {
  return {
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
