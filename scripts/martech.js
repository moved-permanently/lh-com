/**
 * The tag manager and data layer of www.lufthansa.com (Tealium iQ, window.lhgData), off by
 * default. scripts.js imports this module only for a host with a row in consent.js's
 * MARTECH_HOSTS or a page asking ?martech=dry (scripts.js: no request otherwise), in the slot of
 * the showcase notice (+3.5 s), and it waits for the load event and an idle moment on top.
 *
 * Modes, by hostname (MARTECH_HOSTS):
 * - off (every host without a row): nothing;
 * - dry (?martech=dry on a host that is not live, or a row with mode dry): window.lhgData
 *   (scripts/data-layer.js), window.utag_cfg_ovrd = { noview: true }, the meta fallbacks the
 *   container reads (X-Portal-Site, X-Portal-Language, language), the event 'martech.view'
 *   (detail: the object), console.debug with ?martech=debug; no vendor request, no script;
 * - live (a row only, never a query parameter): dry, then, after the first choice with a
 *   non-necessary category (consent.js 'consent.update' with consented, or the stored choice), the
 *   container https://tags.tiqcdn.com/utag/<account>/<profile>/<env>/utag.js (async, id
 *   utag-unique) and, once utag.view is there, www's page view: window.lhgData = <object>;
 *   window.utag.view(window.utag_data || {}). The container's consent integration holds each tag
 *   until its OneTrust category is accepted; for the fallback banner the choice is bridged
 *   (window.OnetrustActiveGroups and the dataLayer event OneTrust sets itself).
 * Never inside an authoring context, the app view or with ?martech=off. The only script this module
 * may add is the container loader; it refuses any other host, a hostname without a row, and
 * segments that are not plain names (the placeholders '<TEALIUM_ACCOUNT>' … included).
 */
import {
  MARTECH_HOSTS, NECESSARY, getStoredConsent, isAuthoringContext,
} from './consent.js';
import { getChannel, isSoloView } from './channel.js';
import { pageLhgData } from './data-layer.js';

export const TEALIUM_HOST = 'tags.tiqcdn.com';
export const SCRIPT_ID = 'utag-unique';
export const NOTICE_SLOT_MS = 3500;
const VIEW_POLL_MS = 100;
const VIEW_WAIT_MS = 10000;
const SEGMENT = /^[A-Za-z0-9_-]+$/;
const own = (hosts, host) => Object.prototype.hasOwnProperty.call(hosts, host);
const values = (search) => new URLSearchParams(search || '').getAll('martech');

/** The mode of a hostname: 'off' | 'dry' | 'live' ('live' only from a row of the table). */
export function modeOf(hostname, search, hosts = MARTECH_HOSTS) {
  const asked = values(search);
  if (asked.includes('off')) return 'off';
  const row = own(hosts, hostname) ? hosts[hostname] : null;
  if (row && row.mode === 'live') return 'live';
  if ((row && row.mode === 'dry') || asked.includes('dry')) return 'dry';
  return 'off';
}

/**
 * The container URL of a live host, or null: a row with mode live, account, profile and env plain
 * names, env prod only with a row, the host tags.tiqcdn.com.
 */
export function containerUrl(hostname, hosts = MARTECH_HOSTS) {
  const row = own(hosts, hostname) ? hosts[hostname] : null;
  const { account, profile, env } = (row && row.mode === 'live' && row.tealium) || {};
  if (![account, profile, env].every((s) => SEGMENT.test(String(s || '')))) return null;
  if (env === 'prod' && !row) return null;
  const url = new URL(`https://${TEALIUM_HOST}/utag/${account}/${profile}/${env}/utag.js`);
  return url.protocol === 'https:' && url.host === TEALIUM_HOST ? url.href : null;
}

/** Adds the container loader once (async, id utag-unique); refuses any host but tiqcdn. */
export function loadContainer(src) {
  let url;
  try {
    url = new URL(src);
  } catch (e) {
    return false;
  }
  if (url.protocol !== 'https:' || url.host !== TEALIUM_HOST) return false;
  if (document.getElementById(SCRIPT_ID)) return true;
  const script = document.createElement('script');
  script.src = url.href;
  script.id = SCRIPT_ID;
  script.type = 'text/javascript';
  script.async = true;
  document.head.append(script);
  return true;
}

const consented = (groups) => (groups || []).some((g) => g !== NECESSARY);

/** The first choice with a non-necessary category: the stored one, else the next one made. */
export function waitForConsent() {
  const stored = getStoredConsent();
  if (stored && consented(stored.groups)) {
    return Promise.resolve({ groups: stored.groups, source: stored.source });
  }
  return new Promise((resolve) => {
    const on = (e) => {
      if (!e.detail || !e.detail.consented) return;
      window.removeEventListener('consent.update', on);
      resolve({ groups: e.detail.groups, source: e.detail.source });
    };
    window.addEventListener('consent.update', on);
  });
}

/** The fallback banner's choice as OneTrust would announce it to the container. */
export function bridgeConsent(groups) {
  const active = `,${[...new Set([NECESSARY, ...groups])].join(',')},`;
  window.OnetrustActiveGroups = active;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'OneTrustGroupsUpdated', OnetrustActiveGroups: active });
  return active;
}

/** www's page view once utag.view is there (every 100 ms, at most 10 s); false when it never is. */
export function viewWhenReady(data, { poll = VIEW_POLL_MS, max = VIEW_WAIT_MS } = {}) {
  return new Promise((resolve) => {
    const started = Date.now();
    const tick = () => {
      if (window.utag && typeof window.utag.view === 'function') {
        window.lhgData = data;
        window.utag.view(window.utag_data || {});
        resolve(true);
      } else if (Date.now() - started >= max) {
        resolve(false);
      } else {
        setTimeout(tick, poll);
      }
    };
    tick();
  });
}

const setMeta = (name, content) => {
  let meta = document.head.querySelector(`meta[name="${name}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.name = name;
    document.head.append(meta);
  }
  meta.content = content;
};

/** After the load event, an idle moment and the showcase notice's slot (+3.5 s). */
export function whenQuiet() {
  const loaded = document.readyState === 'complete'
    ? Promise.resolve()
    : new Promise((resolve) => { window.addEventListener('load', resolve, { once: true }); });
  return loaded
    .then(() => new Promise((resolve) => {
      const now = window.performance ? window.performance.now() : NOTICE_SLOT_MS;
      setTimeout(resolve, Math.max(0, NOTICE_SLOT_MS - now));
    }))
    .then(() => new Promise((resolve) => {
      if (window.requestIdleCallback) {
        window.requestIdleCallback(() => resolve(), { timeout: 2000 });
      } else {
        setTimeout(resolve, 0);
      }
    }));
}

let started;

/**
 * Runs the mode of the page's host once per page view; resolves with what it did: 'off', 'dry',
 * 'live' (the page view sent), 'no-view' (the container never got ready) or 'refused'.
 */
export default function initMartech({ hosts = MARTECH_HOSTS, wait = whenQuiet, fetchImpl } = {}) {
  started ||= (async () => {
    if (isAuthoringContext() || getChannel() === 'app' || isSoloView()) return 'off';
    const { hostname, search } = window.location;
    const mode = modeOf(hostname, search, hosts);
    if (mode === 'off') return 'off';
    await wait();
    const data = await pageLhgData({ fetchImpl });
    window.lhgData = data;
    window.utag_cfg_ovrd = { noview: true };
    setMeta('X-Portal-Site', data.page.pageInfo.country.toUpperCase());
    setMeta('X-Portal-Language', data.page.pageInfo.language);
    setMeta('language', data.page.pageInfo.language);
    window.dispatchEvent(new CustomEvent('martech.view', { detail: data }));
    // eslint-disable-next-line no-console
    if (values(search).includes('debug')) console.debug('martech.view', mode, data);
    if (mode !== 'live') return 'dry';
    const src = containerUrl(hostname, hosts);
    if (!src) return 'refused';
    const choice = await waitForConsent();
    if (choice.source === 'fallback') bridgeConsent(choice.groups);
    if (!loadContainer(src)) return 'refused';
    return (await viewWhenReady(data)) ? 'live' : 'no-view';
  })();
  return started;
}

/** For tests: run again. */
export function resetMartech() {
  started = undefined;
}
