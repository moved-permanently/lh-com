/**
 * ITA Airways' complaint-form links
 * (www.complaint.ita-airways.com/s/complaint?language=..&market=..).
 * A market root's page (/au/en/..., /be/fr/...) is served from its language version's document,
 * whose links carry the version's market (market=IT, market=EN). www's root pages carry the root's
 * country in their content links and keep the language as the version has it (/au/en: market=AU,
 * /be/fr: language=fr&market=BE); the nav and footer keep theirs. So on an ITA market root
 * (documents "language", not an xx root) the links in the page's main take the root's country;
 * a fragment's main (the nav and footer, decorated detached) is left as it is.
 */

const COMPLAINT_HOST = /(^|\.)complaint\.ita-airways\.com$/i;

/**
 * The link with the root's country as its market, or null when it is no complaint-form link with a
 * market (other hosts, relative links, a link without market stay as they are).
 * @param {string} href
 * @param {string} country two-letter root country, lower case
 * @returns {string|null}
 */
export function withRootMarket(href, country) {
  let url;
  try {
    url = new URL(href);
  } catch (e) {
    return null;
  }
  if (!COMPLAINT_HOST.test(url.hostname) || !url.searchParams.has('market')) return null;
  url.searchParams.set('market', country.toUpperCase());
  return url.toString();
}

/**
 * Sets the root's market on the complaint-form links of the page's content.
 * @param {Element} main
 * @param {object} locale getLocale()'s result
 */
export default function rootMarketLinks(main, locale) {
  if (!main || !locale || locale.brand !== 'ita' || locale.documents !== 'language') return;
  if (!main.isConnected || !main.matches('body > main')) return;
  const country = String(locale.country || '').toLowerCase();
  if (!/^[a-z]{2}$/.test(country) || country === 'xx') return;
  main.querySelectorAll('a[href*="complaint.ita-airways.com"]').forEach((a) => {
    const href = withRootMarket(a.getAttribute('href'), country);
    if (href) a.setAttribute('href', href);
  });
}
