/*
 * Brand themes (brief 95): a site that sets the metadata `brand` (site-wide, in its /metadata.json
 * sheet) to a known brand loads that brand's design tokens, styles/themes/<brand>.css (colours,
 * fonts, logo, spacing: tokens only), before the first section is shown. Sites without the key
 * (lh-com) load nothing extra and look as before. The brand also names the site in the showcase
 * notice (scripts/showcase-notice.js). Tests: test/brand.test.mjs.
 */

/**
 * The known brands: metadata value -> display name, OneTrust id (the data-domain-script of the
 * brand's www pages, 2026-10-30; scripts/consent.js) and theme (styles/themes/<key>.css; false:
 * Lufthansa's look). Unknown values are ignored. A brand without a oneTrust id gets no consent
 * banner (and nothing that needs consent runs on its pages). messageCenter: the brand's Message
 * Center tenant on www (its messages' tenant in the site's own /message-center/index.json and its
 * row of /message-center/config/cti-pages.json; scripts/message-center.js siteTenant); a brand
 * without one shows no messages, lh-com (no key) Lufthansa's ('lh'). destinationImages: the
 * folder of the destination images of the brand's fare widgets on www (its imageBaseUrl; the
 * site's own copies under that path); Lufthansa's without one. www: the brand's own www host (its
 * links open like lufthansa.com's on lh-com: isOwnWwwHost). The languages of the sites
 * without <cc>/<ll> roots (Cargo, Air Dolomiti): scripts/site-languages.js.
 */
export const BRANDS = {
  discover: {
    name: 'Discover Airlines',
    oneTrust: '01994cb4-6d4f-7911-abbc-7117e4e6c370',
    messageCenter: 'four_y',
    destinationImages: '/content/dam/four_y/images/offers/destination',
    www: 'www.discover-airlines.com',
  },
  ita: {
    name: 'ITA Airways',
    oneTrust: '01994cb4-04ea-768d-baf8-f6ed09be97dd',
    messageCenter: 'ita',
    destinationImages: '/content/dam/ita/images/offers/destination',
    www: 'www.ita-airways.com',
  },
  // Austrian Airlines (lh-austrian): when the Austrian session adds its brand key here, its entry
  // gets messageCenter: 'os' (its tenant on www)
  // Lufthansa Cargo (lh-cargo): Lufthansa's look; www.lufthansa-cargo.com shows no cookie banner;
  // no Message Center tenant (nor Air Dolomiti's): their blocks show nothing
  cargo: { name: 'Lufthansa Cargo', theme: false, www: 'www.lufthansa-cargo.com' },
  // Air Dolomiti (lh-airdolomiti): its own theme (styles/themes/airdolomiti.css, the Air Dolomiti
  // session's; until it exists the pages keep Lufthansa's look); www.airdolomiti.it loads no
  // OneTrust (2026-10-30)
  airdolomiti: { name: 'Air Dolomiti', www: 'www.airdolomiti.it' },
};
export const DEFAULT_BRAND_NAME = 'Lufthansa';
/** www.lufthansa.com's OneTrust id: lh-com (no brand key). */
export const DEFAULT_ONETRUST = '01994cb2-af99-7dbe-8fb0-56427773e54e';
/** www.lufthansa.com's destination images (lh-com, and the brands without a folder of their own) */
export const DEFAULT_DESTINATION_IMAGES = '/content/dam/lh/images/offers/destination';

/** A page metadata value (as aem.js getMetadata: <meta name> or <meta property>). */
const metadata = (name) => {
  if (typeof document === 'undefined') return '';
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

/**
 * Loads the brand's tokens (nothing for lh-com, nor for a brand with theme false) and marks the
 * body (body.brand-<key>). A theme file that isn't there (yet) leaves Lufthansa's look.
 */
export async function loadBrandTheme(read = metadata, loadStyles = null) {
  const key = brandOf(read);
  if (!key) return '';
  document.body.classList.add(`brand-${key}`);
  if (BRANDS[key].theme === false) return key;
  const load = loadStyles || (await import('./aem.js')).loadCSS;
  try {
    await load(`${window.hlx.codeBasePath}/styles/themes/${key}.css`);
  } catch (e) {
    // no theme file: the page renders with lh-com's tokens
  }
  return key;
}
