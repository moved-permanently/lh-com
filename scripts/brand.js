/*
 * Brand themes (brief 95): a site that sets the metadata `brand` (site-wide, in its /metadata.json
 * sheet) to a known brand loads that brand's design tokens, styles/themes/<brand>.css (colours,
 * fonts, logo, spacing: tokens only), before the first section is shown. Sites without the key
 * (lh-com) load nothing extra and look as before. The brand also names the site in the showcase
 * notice (scripts/showcase-notice.js). Tests: test/brand.test.mjs.
 */

/** The known brands: metadata value -> display name. Unknown values are ignored. */
export const BRANDS = {
  discover: { name: 'Discover Airlines' },
};
export const DEFAULT_BRAND_NAME = 'Lufthansa';

/** A page metadata value (as aem.js getMetadata: <meta name> or <meta property>). */
const metadata = (name) => {
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

/** Loads the brand's tokens (nothing for lh-com) and marks the body (body.brand-<key>). */
export async function loadBrandTheme(read = metadata) {
  const key = brandOf(read);
  if (!key) return '';
  document.body.classList.add(`brand-${key}`);
  const { loadCSS } = await import('./aem.js');
  await loadCSS(`${window.hlx.codeBasePath}/styles/themes/${key}.css`);
  return key;
}
