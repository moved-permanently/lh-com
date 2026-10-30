/* A page for scripts/consent.js in linkedom (test/consent-*.test.mjs): the brand's metadata, a
   turnsthe.page host, the cookies; initConsent of a fresh module (its state is per page). The
   fallback timer does not run (no 5 s wait), OneTrust's stub is never fetched. */
/* global globalThis */
import { parseHTML } from 'linkedom';

let n = 0;

/**
 * @param {string} brand the metadata brand ('' for lh-com)
 * @param {{cookie?: string, hostname?: string}} [options]
 * @returns {Promise<{stub: Element|null, events: Object[], window: Object}>}
 */
export default async function consentOn(brand, { cookie = '', hostname = 'discover.turnsthe.page' } = {}) {
  const { window, document } = parseHTML(`<!DOCTYPE html><html><head>${brand ? `<meta name="brand" content="${brand}">` : ''}</head><body></body></html>`);
  const origin = `https://${hostname}`;
  window.location = {
    hostname, pathname: '/de/en/homepage', search: '', href: `${origin}/de/en/homepage`, origin,
  };
  Object.defineProperty(window, 'origin', { value: origin, configurable: true });
  Object.defineProperty(document, 'cookie', { value: cookie, configurable: true, writable: true });
  window.hlx = { codeBasePath: '' };
  // linkedom's window hands unknown properties to globalThis: no OneTrust from an earlier case
  delete globalThis.OneTrust;
  delete globalThis.OptanonWrapper;
  globalThis.window = window;
  globalThis.document = document;
  globalThis.Node = window.Node;
  globalThis.MutationObserver = window.MutationObserver;
  globalThis.CustomEvent = window.CustomEvent;
  const events = [];
  window.addEventListener('consent.update', (e) => events.push(e.detail));
  n += 1;
  const consent = await import(`../scripts/consent.js?case=${n}`);
  // the fallback timer (window.setTimeout is globalThis's) never starts
  const { setTimeout, clearTimeout } = globalThis;
  globalThis.setTimeout = () => 0;
  globalThis.clearTimeout = () => {};
  try {
    consent.initConsent();
  } finally {
    Object.assign(globalThis, { setTimeout, clearTimeout });
  }
  const stub = document.querySelector('script[data-domain-script]');
  return { stub, events, window };
}
