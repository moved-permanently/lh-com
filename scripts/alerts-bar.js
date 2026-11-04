/**
 * A brand's alerts bar (scripts/brands.js alertsBar: TAP's), as www.flytap.com shows it: the
 * first thing on a root homepage, above the header, full width and in the flow (it scrolls away).
 * The page code places it, so no document carries it: a flash-teaser block of the brand's
 * variant (blocks/flash-teaser/flash-teaser-tap.js) in its own wrapper, 52 px reserved before the
 * Message Center index arrives (the block removes the bar when there is no message).
 */

/**
 * Whether a path is a root's homepage (/pt-pt, /pt-pt/; the local server's /content/pt-pt).
 * @param {string} pathname
 * @param {Object[]} [languages] the site's languages (scripts/site-languages.js: home)
 * @returns {boolean}
 */
export function isRootHomepage(pathname, languages) {
  if (!languages) return false;
  const path = String(pathname || '').replace(/^\/content(?=\/)/, '').replace(/(.)\/$/, '$1');
  return languages.some((l) => l.home && l.home === path);
}

/** The bar's height on www (8 px, a 36 px row, 8 px), reserved until the alerts are there. */
export const BAR_HEIGHT = 52;

/**
 * Puts the brand's alerts bar first in the body (before the header) on a root homepage.
 * @param {Document} doc
 * @param {Object|null} brand the page's brand entry (scripts/brands.js)
 * @param {Object} locale getLocale() (siteLanguages)
 * @param {string} pathname
 * @returns {Element|null} the block to load (scripts/aem.js decorateBlock, loadBlock), else null
 */
export function placeAlertsBar(doc, brand, locale, pathname) {
  if (!brand || !brand.alertsBar || !isRootHomepage(pathname, locale && locale.siteLanguages)) {
    return null;
  }
  const wrapper = doc.createElement('div');
  wrapper.className = 'alerts-bar';
  wrapper.style.minHeight = `${BAR_HEIGHT}px`;
  const block = doc.createElement('div');
  block.className = `flash-teaser ${brand.alertsBar}`;
  wrapper.append(block);
  doc.body.prepend(wrapper);
  return block;
}
