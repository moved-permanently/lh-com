/*
 * Brand themes (brief 95): a site that sets the metadata `brand` (site-wide, in its /metadata.json
 * sheet) to a known brand loads that brand's design tokens, styles/themes/<brand>.css (colours,
 * fonts, logo, spacing: tokens only), before the first section is shown. Sites without the key
 * (lh-com) load nothing extra and look as before. The brand also names the site in the showcase
 * notice (scripts/showcase-notice.js). Tests: test/brand.test.mjs.
 */

import { DEFAULT_ICONS, iconsOf } from './brand-icons.js';
import { BRANDS } from './brands.js';

export { DEFAULT_ICONS };

/** The known brands (their entries: scripts/brands.js, shared with lh-edge and locale.js). */
export { BRANDS };
export const DEFAULT_BRAND_NAME = 'Lufthansa';
/** www.lufthansa.com's OneTrust id: lh-com (no brand key). */
export const DEFAULT_ONETRUST = '01994cb2-af99-7dbe-8fb0-56427773e54e';
/** www.lufthansa.com's destination images (lh-com, and the brands without a folder of their own) */
export const DEFAULT_DESTINATION_IMAGES = '/content/dam/lh/images/offers/destination';

/** A page metadata value (as aem.js getMetadata: <meta name> or <meta property>). */
const metadata = (name) => {
  if (typeof document === 'undefined' || !document.head) return '';
  const meta = document.head.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
  return meta ? meta.content : '';
};

/** The site's brand key ('' for lh-com and unknown values). */
export function brandOf(read = metadata) {
  const key = String(read('brand') || '').trim().toLowerCase();
  return Object.prototype.hasOwnProperty.call(BRANDS, key) ? key : '';
}

/** The name of the site's brand, for texts such as the showcase notice. */
export function brandName(read = metadata) {
  const key = brandOf(read);
  return key ? BRANDS[key].name : DEFAULT_BRAND_NAME;
}

/** The site's OneTrust id: Lufthansa's for lh-com, the brand's own, '' for a brand without one. */
export function oneTrustId(read = metadata) {
  const key = brandOf(read);
  return key ? BRANDS[key].oneTrust || '' : DEFAULT_ONETRUST;
}

/** The suffix of the site's page titles (" | Lufthansa", " | ITA Airways"), as a pattern. */
export function siteTitleSuffix(read = metadata) {
  return new RegExp(` \\| ${brandName(read).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
}

/**
 * Whether a host is one of the site's own Edge Delivery hosts (<ref>--lh-com--moved-permanently,
 * a brand's lh-<brand>: lh-ita, lh-discover, ...).
 * @param {string} hostname
 * @param {Function} [read] metadata reader
 */
export function isSitePreviewHost(hostname, read = metadata) {
  const repo = `lh-${brandOf(read) || 'com'}`;
  return new RegExp(`^(?:[a-z0-9-]+--)?${repo}--moved-permanently\\.aem\\.(?:page|live)$`).test(String(hostname || '').toLowerCase());
}

/** The folder of the site's destination images ({code}-square.jpg, {code}-panorama.jpg). */
export function destinationImageBase(read = metadata) {
  const key = brandOf(read);
  return (key && BRANDS[key].destinationImages) || DEFAULT_DESTINATION_IMAGES;
}

/** The brand's own www host ('' for lh-com). */
export function brandWwwHost(read = metadata) {
  const key = brandOf(read);
  return (key && BRANDS[key].www) || '';
}

/**
 * Whether a host is the site's own www (its links open in the same tab, as www's do):
 * lufthansa.com and its subdomains on every site (as before), and the brand's domain (its www
 * host without "www.", and its subdomains) on the brand's site.
 * @param {string} hostname
 * @param {Function} [read] metadata reader
 */
export function isOwnWwwHost(hostname, read = metadata) {
  const host = String(hostname || '').toLowerCase();
  if (/(^|\.)lufthansa\.com$/.test(host)) return true;
  const domain = brandWwwHost(read).replace(/^www\./, '');
  return Boolean(domain) && (host === domain || host.endsWith(`.${domain}`));
}

/** The site's favicon (icon, type) and web app manifest ('' for none). */
export function brandIcons(read = metadata) {
  const key = brandOf(read);
  return iconsOf(key) || DEFAULT_ICONS;
}

/**
 * Points the head's icon and manifest links at the brand's files (no manifest: the link goes);
 * lh-com: untouched. On the brand hosts lh-edge has done it already (the links are the same).
 */
export function applyBrandIcons(read = metadata) {
  const icons = brandIcons(read);
  if (icons === DEFAULT_ICONS) return;
  document.head.querySelectorAll('link[rel]').forEach((link) => {
    const rel = String(link.getAttribute('rel')).toLowerCase().split(/\s+/);
    if (rel.includes('manifest')) {
      if (icons.manifest) link.setAttribute('href', icons.manifest);
      else link.remove();
    } else if (rel.includes('icon')) {
      link.setAttribute('href', icons.icon);
      if (icons.type) link.setAttribute('type', icons.type);
    }
  });
}

/**
 * Loads the brand's tokens (nothing for lh-com, nor for a brand with theme false) and marks the
 * body (body.brand-<key>). A theme file that isn't there (yet) leaves Lufthansa's look.
 */
export async function loadBrandTheme(read = metadata, loadStyles = null) {
  const key = brandOf(read);
  if (!key) return '';
  document.body.classList.add(`brand-${key}`);
  applyBrandIcons(read);
  if (BRANDS[key].theme === false) return key;
  const load = loadStyles || (await import('./aem.js')).loadCSS;
  try {
    await load(`${window.hlx.codeBasePath}/styles/themes/${key}.css`);
  } catch (e) {
    // no theme file: the page renders with lh-com's tokens
  }
  return key;
}
