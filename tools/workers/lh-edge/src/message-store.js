/**
 * One Message Center store for the group's airlines. www has one Message Center for every airline:
 * a message is written and published once, tagged with the airlines (tenants) it is for, and each
 * airline's site shows its tenant's messages. Here the store is one Edge Delivery site (lh-com
 * today): on the hosts of the other sites that show Message Center tenants (scripts/brands.js
 * messageCenter; the sites with a source of their own, TAP, Air Dolomiti and Cargo, are PLAIN_SITES
 * and keep theirs), the Message Center read paths come from the store's origin, so the blocks
 * (scripts/message-center.js, same-origin relative paths) read the store without a change:
 * - /message-center/index.json, the index (the blocks filter it by the site's tenant);
 * - /message-center/config/cti-pages.json, the current travel information pages, a row per tenant;
 * - /message-center/{irreg,tech-outage,promo,details}/..., the message documents and their details
 *   pages (.plain.html, which the current travel information page reads).
 * The store and its tenants come from scripts/message-store.js (MESSAGE_STORE, STORE_TENANTS), the
 * one setting the site code reads too (a brand site's own aem.page/aem.live hosts read the store
 * cross-origin): moving the store to a site of its own is a change there.
 * The store is read past the edge cache (cache: no-store), so a publish or a withdrawal shows as
 * soon as the store's index has it (aem.live's own CDN is purged on publish); a revalidation of
 * the visitor's copy (If-None-Match, If-Modified-Since) goes to the store as it is.
 */
import { originFetch } from './edge.js';
/* eslint-disable-next-line import/no-relative-packages */
import { storeHost, STORE_TENANTS } from '../../../../scripts/message-store.js';

const STORE_PATH = /^\/message-center\/(index\.json|config\/cti-pages\.json|(irreg|tech-outage|promo|details)\/[^/].*)$/;

/** Whether a path is one of the Message Center paths the store answers. */
export const isStorePath = (pathname) => STORE_PATH.test(String(pathname || ''));

/** The store's origin host: its aem.live (scripts/message-store.js). */
export const storeOrigin = () => storeHost('live');

/** Whether a site's Message Center tenant (scripts/brands.js messageCenter) reads the store. */
export const readsStore = (tenant) => STORE_TENANTS.includes(tenant);

/** The store's answer for a Message Center read path, marked x-lh-edge-route: message-store. */
export async function messageStore(request, env) {
  const storeEnv = { ...env, ORIGIN: storeOrigin() };
  const resp = await originFetch(request, storeEnv, undefined, { edgeCache: false });
  const out = new Response(resp.body, resp);
  out.headers.set('x-lh-edge-route', 'message-store');
  return out;
}
