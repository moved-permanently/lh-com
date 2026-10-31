/*
 * The brands' favicons and web app manifests (no imports: lh-edge bundles this file, see
 * tools/workers/lh-edge/src/brand-icons.js). Per brand key (scripts/brand.js BRANDS): www's own
 * favicon (its type) and manifest ('' when www links none), the code's copies under the same
 * paths (etc/designs/<brand>/, o/, favicon/; bd-brand-icons.mjs captures). lh-edge links them on
 * the brand's host before the first paint, the page on other hosts (brand.js applyBrandIcons).
 */

/** www.lufthansa.com's favicon and manifest (head.html): lh-com, brands without their own. */
export const DEFAULT_ICONS = { icon: '/etc/designs/dcep/favicon.ico', manifest: '/etc/designs/dcep/manifest.json' };

export const BRAND_ICONS = {
  discover: { icon: '/etc/designs/four_y/favicon.ico', type: 'image/ico', manifest: '' },
  ita: { icon: '/etc/designs/ita/favicon.ico', type: 'image/ico', manifest: '/etc/designs/ita/manifest.json' },
  austrian: { icon: '/etc/designs/os/favicon.ico', type: 'image/ico', manifest: '/etc/designs/os/manifest.json' },
  cargo: { icon: '/o/eportal-theme/images/favicon.ico', type: 'image/x-icon', manifest: '' },
  // www.airdolomiti.it's favicon.ico is a PNG
  airdolomiti: { icon: '/favicon/favicon.ico', type: 'image/png', manifest: '' },
};

/** A brand's icons, or null (lh-com, unknown keys). */
export function iconsOf(key) {
  return Object.prototype.hasOwnProperty.call(BRAND_ICONS, key) ? BRAND_ICONS[key] : null;
}
