/**
 * Locale handling for the four migrated lufthansa.com markets.
 * Pages live under /{country}/{lang}/... (AEM) or /lhg/{country}/{lang}/... (AirCore).
 */

export const LIVE_ORIGIN = 'https://www.lufthansa.com';

export const LOCALES = {
  'de/en': {
    country: 'de', lang: 'en', homeAirport: 'FRA', currency: 'EUR',
  },
  'de/de': {
    country: 'de', lang: 'de', homeAirport: 'FRA', currency: 'EUR',
  },
  'at/de': {
    country: 'at', lang: 'de', homeAirport: 'VIE', currency: 'EUR',
  },
  'gb/en': {
    country: 'gb', lang: 'en', homeAirport: 'LHR', currency: 'GBP',
  },
};

export const DEFAULT_LOCALE = 'de/de';

/**
 * Resolves the locale of a path.
 * @param {string} [pathname] Page path, defaults to the current page
 * @returns {Object} locale with key, base path and whether the page is an AirCore page
 */
export function getLocale(pathname = window.location.pathname) {
  // the local dev server (aem up --html-folder content) serves pages under /content/
  const prefix = pathname.startsWith('/content/') && !pathname.startsWith('/content/lh/markets/')
    ? '/content' : '';
  // market-only pages www serves under their repository path (LoungeNet):
  // /content/lh/markets/{country}/{lang}/...
  const rest = pathname.slice(prefix.length).replace(/^\/content\/lh\/markets(?=\/)/, '');
  const match = rest.match(/^\/(lhg\/)?([a-z]{2})\/([a-z]{2})(?:\/|$)/);
  const key = match && LOCALES[`${match[2]}/${match[3]}`] ? `${match[2]}/${match[3]}` : DEFAULT_LOCALE;
  return {
    ...LOCALES[key],
    key,
    base: `${prefix}/${key}`,
    aircore: Boolean(match && match[1]),
  };
}

/**
 * Whether a country/language pair is one of the migrated locales.
 * @param {string} country two-letter country code
 * @param {string} lang two-letter language code
 * @returns {boolean}
 */
export function isMigratedLocale(country, lang) {
  return Boolean(LOCALES[`${country.toLowerCase()}/${lang.toLowerCase()}`]);
}

/**
 * Homepage of a country/language pair: local for migrated locales, live site otherwise.
 * @param {string} country two-letter country code
 * @param {string} lang two-letter language code
 * @returns {string}
 */
export function getHomepageUrl(country, lang) {
  const path = `/${country.toLowerCase()}/${lang.toLowerCase()}/homepage`;
  return isMigratedLocale(country, lang) ? path : `${LIVE_ORIGIN}${path}`;
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
