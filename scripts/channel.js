/**
 * Channels: one document in DA, one codebase, several presentations.
 *
 * - website (default): the lufthansa.com replica as migrated.
 * - flynet: a FlyNet-style onboard portal (compact, mobile first, no booking, login or flight
 *   search, a sample flight bar from the site's /flight sheet). Switched on ONLY by page
 *   metadata `channel: flynet`, which the lh-flynet site sets for every page with one row of
 *   its bulk metadata sheet (URL `/**`); never by hostname. Without that row the code renders
 *   the website.
 * - app: `?channel=app` on any page (lh-com or lh-flynet), or page metadata `channel: app` (lh-edge
 *   sets it for the app's solo URLs, <page>.solo_continue): no header, footer, breadcrumb or
 *   cookie banner, for an app's web view, which handles navigation and consent itself. Internal
 *   links keep the parameter (solo pages: the .solo_continue form), so the reader stays in the app
 *   view; homepage links become the URL that closes the web view. No second site, no copy.
 * The showcase notice (scripts/showcase-notice.js) shows in every channel.
 */
import { getMetadata } from './aem.js';

export const CHANNELS = ['website', 'flynet', 'app'];
const APP_PARAM = 'channel';
const APP_VALUE = 'app';

/** Locales the FlyNet site holds (start page, nav and footer). */
export const FLYNET_LOCALES = ['de/en', 'de/de'];

/** Blocks that book, log in or search flights: not offered in the FlyNet channel. */
export const FLYNET_HIDDEN_BLOCKS = [
  'flight-search', 'booking-lookup', 'price-bar', 'fare-teaser', 'destination-finder',
];

/**
 * Nav and footer links that book, log in or search flights (hidden in the FlyNet channel):
 * the shop, the booking deep links, Travel ID login, check-in and the flight search pages.
 */
const FLYNET_HIDDEN_LINKS = [
  /(^|\.)shop\.lufthansa\.com$/i,
  /(^|\.)travelid\.lufthansa\.com$/i,
  /(^|\.)once\.lufthansa\.com$/i,
  /\/deeplink\/cockpit/i,
  /\/(flight-search|flugsuche|book-and-manage|online-check-in|all-check-in|advance-seat-reservation|upgrade-options)(\/|$|\?)/i,
  /[?&]view=login/i,
];

let current;

/**
 * The channel of the current page view.
 * @returns {'website'|'flynet'|'app'}
 */
export function getChannel() {
  if (current) return current;
  const param = new URLSearchParams(window.location.search).get(APP_PARAM);
  if (param === APP_VALUE) {
    current = 'app';
  } else {
    const meta = getMetadata('channel').trim().toLowerCase();
    current = CHANNELS.includes(meta) ? meta : 'website';
  }
  return current;
}

/**
 * Whether a link books, logs in or searches flights (hidden in the FlyNet channel).
 * @param {string} href
 * @returns {boolean}
 */
export function isFlynetHiddenLink(href) {
  try {
    const url = new URL(href, window.location.href);
    const test = `${url.hostname}${url.pathname}${url.search}`;
    return FLYNET_HIDDEN_LINKS.some((re) => re.test(url.hostname) || re.test(test));
  } catch (e) {
    return false;
  }
}

/**
 * The same URL in the app view when it is an internal page link, else null.
 * @param {string} href
 * @returns {string|null}
 */
export function appViewUrl(href) {
  let url;
  try {
    url = new URL(href, window.location.href);
  } catch (e) {
    return null;
  }
  if (url.origin !== window.location.origin || !/^https?:$/.test(url.protocol)) return null;
  // files (PDF, images, sheets) are not pages
  if (/\.(?!html?$)[a-z0-9]{2,5}$/i.test(url.pathname)) return null;
  if (url.searchParams.get(APP_PARAM) === APP_VALUE) return url.href;
  url.searchParams.set(APP_PARAM, APP_VALUE);
  return url.href;
}

/** The solo URL forms of the app's web view (lh-edge answers them in the app view). */
const SOLO_SUFFIX = /(\.solo\.continue\.solo_continue|\.solo_continue\.genapp\.html|\.solo_continue\.html|\.solo\.continue|\.solo_continue)$/;
const HOMEPAGE = /^\/(?:[a-z]{2}\/[a-z]{2}(?:\/homepage)?)?\/?$/;
const DEFAULT_WWW_HOST = 'www.lufthansa.com';

/** Whether the page was opened through a solo URL (<page>.solo_continue, lh-edge). */
export function isSoloView(pathname = window.location.pathname) {
  return SOLO_SUFFIX.test(pathname);
}

/** The URL on which the app closes its web view (lh-edge's meta app-close-url, else www's). */
export function appCloseUrl() {
  return getMetadata('app-close-url') || `https://${DEFAULT_WWW_HOST}.solo_continue/`;
}

/**
 * The href of a link in the app view: a homepage link closes the web view; in a page opened
 * through a solo URL, page links get the .solo_continue form (on this host and on www), else
 * ?channel=app (appViewUrl). Logout links and files stay. Null: leave the link.
 * @param {string} href
 * @param {boolean} [solo] the page was opened through a solo URL
 * @returns {string|null}
 */
export function appLinkUrl(href, solo = isSoloView()) {
  let url;
  try {
    url = new URL(href, window.location.href);
  } catch (e) {
    return null;
  }
  if (!/^https?:$/.test(url.protocol)) return null;
  const closeUrl = appCloseUrl();
  const wwwHost = new URL(closeUrl.replace('.solo_continue/', '/')).hostname || DEFAULT_WWW_HOST;
  const own = url.origin === window.location.origin;
  const www = url.hostname === wwwHost;
  if (!own && !www) return null;
  if (/\/logout(\/|$|\.|\?)/i.test(url.pathname)) return null;
  if (HOMEPAGE.test(url.pathname)) return closeUrl;
  if (/\.(?!html?$)[a-z0-9]{2,5}$/i.test(url.pathname) || SOLO_SUFFIX.test(url.pathname)) return null;
  if (!solo) return own ? appViewUrl(url.href) : null;
  const path = url.pathname.replace(/\.html?$/, '').replace(/\/+$/, '');
  const target = `${path}.solo_continue${url.search}${url.hash}`;
  return own ? target : `https://${wwwHost}${target}`;
}

/**
 * App view: every internal link the reader follows stays in it (the .solo_continue form when the
 * page was opened through one, else ?channel=app); homepage links close the web view.
 */
function keepAppView() {
  const rewrite = (e) => {
    const a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a) return;
    const next = appLinkUrl(a.href);
    if (next && next !== a.href) a.href = next;
  };
  // before the browser follows the link (click, middle click, context menu "open in new tab")
  ['click', 'auxclick', 'contextmenu'].forEach((type) => document.addEventListener(type, rewrite, true));
}

/**
 * Marks the document with its channel and removes what the channel does not show.
 * Runs in loadEager after decorateMain, before the first section loads.
 * @param {Element} main
 * @returns {string} the channel
 */
export function applyChannel(main) {
  const channel = getChannel();
  document.documentElement.dataset.channel = channel;
  if (channel === 'website') return channel;
  document.body.classList.add(`channel-${channel}`);

  const removeBlock = (block) => {
    const wrapper = block.parentElement && block.parentElement.classList.contains(`${block.classList[0]}-wrapper`)
      ? block.parentElement : block;
    const section = wrapper.closest('.section');
    wrapper.remove();
    if (section && !section.querySelector(':scope > *')) section.remove();
  };

  if (channel === 'flynet' && main) {
    main.querySelectorAll(FLYNET_HIDDEN_BLOCKS.map((name) => `div.${name}`).join(', ')).forEach(removeBlock);
  }
  if (channel === 'app') {
    if (main) main.querySelectorAll('div.breadcrumb').forEach(removeBlock);
    document.querySelectorAll('body > header, body > footer').forEach((el) => el.remove());
    keepAppView();
  }
  return channel;
}
