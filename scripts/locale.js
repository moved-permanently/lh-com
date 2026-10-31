/**
 * Locale handling. Pages live under /{country}/{lang}/...; the locale data is one table,
 * scripts/locale-table.js (generated from www's sitemap dataset and
 * tools/markets/locale-data.json).
 * A brand site with <cc>/<ll> roots (a page's `brand` metadata: Discover, ITA) has its own roots,
 * language versions, home airports and www host (scripts/brands.js BRAND_SITES and BRANDS, the
 * one source lh-edge's site tables are built from): getLocale, getHomepageUrl, isMigratedLocale,
 * getCounterpartPath, siteLocales and siteOrigin read them on its pages. A page without `brand`
 * metadata (lh-com) and lh-edge (no page) keep lh-com's table as before.
 */
import {
  LOCALE_TABLE, DEFAULT_LOCALE, LANGUAGE_VERSIONS, FALLBACK_LANGUAGE_VERSION, WWW_ROOTS,
} from './locale-table.js';
import { siteLanguagesOf } from './site-languages.js';
import { BRANDS, BRAND_SITES } from './brands.js';

export { LOCALE_TABLE, DEFAULT_LOCALE };

export const LIVE_ORIGIN = 'https://www.lufthansa.com';

/** The migrated locales (status live): local links, the language switch, lh-edge's routes. */
export const LOCALES = Object.fromEntries(Object.entries(LOCALE_TABLE)
  .filter(([, row]) => row.status === 'live'));

/** The keys of the migrated locales, e.g. for tools: ['de/en', 'de/de', 'at/de', 'gb/en']. */
export const LIVE_ROOTS = Object.keys(LOCALES);

const wwwRoots = new Set(WWW_ROOTS.split(' '));

/** Whether a cc/ll key is one of www's market-language roots (de/en yes, xf/lh no). */
export const isWwwRoot = (key) => wwwRoots.has(key);

/**
 * The defaults of a root without a row (e.g. /us/en/ccpa): its own country and language, no
 * home airport, currency or time zone, and the documents (nav, footer, indexes) of its
 * language's version (en de/en, de de/de, other languages de/en, whose texts are English).
 */
export function languageDefaults(country, lang) {
  const key = LANGUAGE_VERSIONS[lang] || FALLBACK_LANGUAGE_VERSION;
  return {
    country,
    lang,
    hreflang: `${lang}-${country.toUpperCase()}`,
    status: 'none',
    name: null,
    homeAirport: null,
    currency: null,
    timeZone: null,
    shopLang: null,
    key,
  };
}

const pageMeta = (name) => {
  if (typeof document === 'undefined' || !document.head) return '';
  const meta = document.head.querySelector(`meta[name="${name}"]`);
  return meta ? meta.content.trim().toLowerCase() : '';
};

/**
 * The locale of a page of a brand site without <cc>/<ll> roots (scripts/site-languages.js:
 * Cargo, Air Dolomiti): the interface language from the page's `language` metadata, English
 * without it; the rest of a migrated locale of that language (de/en for English), else of the
 * default locale. null for every other site (lh-com, Discover, ITA: as before).
 */
export function brandSiteLocale(prefix = '', read = pageMeta) {
  const languages = siteLanguagesOf(read);
  if (!languages) return null;
  const lang = (/^[a-z]{2}$/.test(read('language')) && read('language')) || 'en';
  const key = Object.keys(LOCALES).find((k) => k.endsWith(`/${lang}`)) || DEFAULT_LOCALE;
  return {
    ...LOCALE_TABLE[key], lang, key, base: `${prefix}/${key}`, root: key, siteLanguages: languages,
  };
}

/** The page's brand key ('' for lh-com, unknown values and no page). */
function brandKey(read = pageMeta) {
  const key = String(read('brand') || '').trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(BRANDS, key) ? key : '';
}

/** The page's brand site with <cc>/<ll> roots (Discover, ITA), or null. */
function brandSite(read = pageMeta) {
  const key = brandKey(read);
  if (!key || !Object.prototype.hasOwnProperty.call(BRAND_SITES, key)) return null;
  return { key, ...BRAND_SITES[key] };
}

/** A brand root's locale row: its table row, dialog name and home airport (else the hub's). */
function brandRow(site, root) {
  const row = site.rows[root];
  return {
    ...row,
    name: site.names[root] || row.label || null,
    homeAirport: site.airports[root] || BRANDS[site.key].hub || null,
    currency: null,
    timeZone: null,
    shopLang: null,
    brand: site.key,
  };
}

/** The locale of a path on a brand site with roots (getLocale's rules with the brand's table). */
function brandLocale(site, root, prefix) {
  if (root && site.rows[root]) {
    const row = brandRow(site, root);
    const version = row.documents === 'language' ? site.versions[row.lang] : null;
    return {
      ...row, key: root, base: `${prefix}/${root}`, root, ...(version ? { versionBase: `${prefix}/${version}` } : {}),
    };
  }
  // no root, or one the site lacks: the language's version, else the site's first (its entry)
  const lang = root ? root.split('/')[1] : '';
  const key = site.versions[lang] || Object.values(site.versions)[0];
  return {
    ...brandRow(site, key), key, base: `${prefix}/${key}`, root: key,
  };
}

/**
 * Resolves the locale of a path.
 * @param {string} [pathname] Page path, defaults to the current page
 * @returns {Object} locale: the table row (country, lang, homeAirport, currency …), key (the
 *   root whose documents the page uses), base (its path prefix) and root (the page's own root)
 */
export function getLocale(pathname = window.location.pathname) {
  // the local dev server (aem up --html-folder content) serves pages under /content/
  const prefix = pathname.startsWith('/content/') && !pathname.startsWith('/content/lh/markets/')
    ? '/content' : '';
  // market-only pages www serves under their repository path (LoungeNet):
  // /content/lh/markets/{country}/{lang}/...
  const rest = pathname.slice(prefix.length).replace(/^\/content\/lh\/markets(?=\/)/, '');
  const match = rest.match(/^\/([a-z]{2})\/([a-z]{2})(?:\/|$)/);
  // a brand site with roots (Discover, ITA): its own table
  const site = brandSite();
  if (site) return brandLocale(site, match ? `${match[1]}/${match[2]}` : '', prefix);
  // no root in the path: a brand site without roots (its page's language), else (app screens,
  // experience fragments, /index) the default locale
  if (!match) {
    const plain = brandSiteLocale(prefix);
    if (plain) return plain;
    return {
      ...LOCALE_TABLE[DEFAULT_LOCALE], key: DEFAULT_LOCALE, base: `${prefix}/${DEFAULT_LOCALE}`, root: DEFAULT_LOCALE,
    };
  }
  const root = `${match[1]}/${match[2]}`;
  // a root of the table (live or pilot) is its own locale; a root answered from its language
  // version (documents "language") also names that version's base: its nav and footer where the
  // host has none of the root's own (lh-edge serves them on its pilot hosts)
  if (LOCALE_TABLE[root]) {
    const row = LOCALE_TABLE[root];
    const version = row.documents === 'language' ? LANGUAGE_VERSIONS[row.lang] : null;
    return {
      ...row, key: root, base: `${prefix}/${root}`, root, ...(version ? { versionBase: `${prefix}/${version}` } : {}),
    };
  }
  // a root of www without a row (market-only pages, /us/en/ccpa): its language's defaults
  if (isWwwRoot(root)) {
    const defaults = languageDefaults(match[1], match[2]);
    return { ...defaults, base: `${prefix}/${defaults.key}`, root };
  }
  // two segments that are no root (/xf/lh/…): a brand site without roots (its page's language),
  // else a migrated locale of that language, else the default
  const plain = brandSiteLocale(prefix);
  if (plain) return plain;
  const key = Object.keys(LOCALES).find((k) => k.endsWith(`/${match[2]}`)) || DEFAULT_LOCALE;
  return {
    ...LOCALE_TABLE[key], key, base: `${prefix}/${key}`, root: key,
  };
}

/**
 * The www origin of the site: the brand's (its www host) on a brand page, www.lufthansa.com's
 * (LIVE_ORIGIN) on lh-com and without a page.
 * @param {Function} [read] metadata reader
 * @returns {string}
 */
export function siteOrigin(read = pageMeta) {
  const key = brandKey(read);
  return key && BRANDS[key].www ? `https://${BRANDS[key].www}` : LIVE_ORIGIN;
}

/**
 * The site's locales by key: a brand site's roots (with their names and home airports), else
 * lh-com's migrated locales (LOCALES itself).
 * @param {Function} [read] metadata reader
 * @returns {Object<string, Object>}
 */
export function siteLocales(read = pageMeta) {
  const site = brandSite(read);
  if (!site) return LOCALES;
  return Object.fromEntries(Object.keys(site.rows).map((root) => [root, brandRow(site, root)]));
}

/**
 * The roots the country and language dialog lists: a brand site's named roots (its own roots'
 * footer labels, its market roots' www labels), else lh-com's migrated locales.
 * @param {Function} [read] metadata reader
 * @returns {string[]}
 */
export function ownRoots(read = pageMeta) {
  const site = brandSite(read);
  if (!site) return Object.keys(LOCALES);
  return Object.keys(site.rows).filter((root) => site.names[root] || site.rows[root].label);
}

/**
 * Whether a country/language pair is one of the migrated locales.
 * @param {string} country two-letter country code
 * @param {string} lang two-letter language code
 * @returns {boolean}
 */
export function isMigratedLocale(country, lang) {
  return Boolean(siteLocales()[`${country.toLowerCase()}/${lang.toLowerCase()}`]);
}

/**
 * Homepage of a country/language pair: local for migrated locales, live site otherwise.
 * @param {string} country two-letter country code
 * @param {string} lang two-letter language code
 * @returns {string}
 */
export function getHomepageUrl(country, lang) {
  const path = `/${country.toLowerCase()}/${lang.toLowerCase()}/homepage`;
  // a brand site with roots: its www for the roots it lacks; every other site www.lufthansa.com
  return isMigratedLocale(country, lang) ? path : `${brandSite() ? siteOrigin() : LIVE_ORIGIN}${path}`;
}

let localeMap;

/**
 * Finds the same page in another migrated locale (the live language switch).
 * Falls back to that locale's homepage when the page has no counterpart.
 * @param {string} targetKey locale key, e.g. 'de/de'
 * @param {string} [pathname] Page path, defaults to the current page
 * @returns {Promise<string>}
 */
export async function getCounterpartPath(targetKey, pathname = window.location.pathname) {
  // a brand site: the target root's homepage (its locale map is lh-com's)
  if (brandSite()) return getHomepageUrl(...targetKey.split('/'));
  const target = LOCALES[targetKey];
  if (!target) return getHomepageUrl(...targetKey.split('/'));
  if (!localeMap) {
    try {
      const resp = await fetch('/data/locale-map.json');
      localeMap = resp.ok ? (await resp.json()).pages : [];
    } catch (e) {
      localeMap = [];
    }
  }
  const path = pathname.replace(/\.html$/, '').replace(/\/$/, '');
  const row = localeMap.find((r) => Object.values(r).includes(path));
  return (row && row[targetKey]) || `/${targetKey}/homepage`;
}
