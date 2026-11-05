/**
 * The group's one Message Center store: the Edge Delivery site whose /message-center/ (index,
 * current travel information sheet, messages, details pages) holds every airline's messages, as
 * www's one Message Center does. The one setting for it: the site code (scripts/message-center.js)
 * and lh-edge (tools/workers/lh-edge/src/message-store.js) both read MESSAGE_STORE, so moving the
 * store to a site of its own is a change here (lh-messages' SOURCE_ORIGIN, the app feeds, names it
 * too). No imports: lh-edge bundles this file.
 *
 * Where a page reads the store:
 * - on a brand site's own Edge Delivery hosts (main--lh-swiss--moved-permanently.aem.page,
 *   .aem.live, a branch preview): the store's host of the same kind, cross-origin (its site config
 *   sends access-control-allow-origin: * on /message-center/**);
 * - everywhere else (the .turnsthe.page hosts, where lh-edge answers the same paths from the store;
 *   lh-com's own hosts; localhost): the same-origin path.
 * Only the tenants in STORE_TENANTS: lh-com's own (lh) is the store, and TAP, Air Dolomiti and
 * Cargo have a source of their own.
 */

export const MESSAGE_STORE = { site: 'lh-com', owner: 'moved-permanently' };

/** The brands' Message Center tenants (scripts/brands.js messageCenter) that read the store. */
export const STORE_TENANTS = ['lx', 'os', 'sn', 'ita', 'four_y', 'b2b'];

/** The store's Edge Delivery host: 'live' (default) or 'page'. */
export const storeHost = (kind = 'live') => `main--${MESSAGE_STORE.site}--${MESSAGE_STORE.owner}.aem.${kind}`;

const EDS_HOST = /^[a-z0-9-]+--([a-z0-9-]+)--([a-z0-9-]+)\.aem\.(page|live)$/;

/**
 * The origin a page on `hostname` with Message Center tenant `tenant` reads the store from: the
 * store's aem.page or aem.live on a brand site's own Edge Delivery host, else '' (same origin).
 * @param {string} hostname
 * @param {string} tenant
 * @returns {string} e.g. 'https://main--lh-com--moved-permanently.aem.live', or ''
 */
export function storeBase(hostname, tenant) {
  if (!STORE_TENANTS.includes(tenant)) return '';
  const m = String(hostname || '').toLowerCase().match(EDS_HOST);
  if (!m || (m[1] === MESSAGE_STORE.site && m[2] === MESSAGE_STORE.owner)) return '';
  return `https://${storeHost(m[3])}`;
}
