/**
 * The bridge to the Lufthansa app: pages in the app's web view talk to the app through a
 * JavaScript interface named groupapp, window.groupapp.postMessage(<JSON string>) on Android and
 * window.webkit.messageHandlers.groupapp.postMessage(<JSON string>) on iOS. In a normal browser
 * neither exists and the callers navigate as usual.
 *
 * Messages as www's front end sends them (dcep clientlib bundles, 2026-10-25):
 * - OfferBookingRequest, DestinationFinderBookingRequest: {type, ...data} where data is the
 *   booking handoff (targetURL, parameters [{key, values}], newWindow, methodGet), when the user
 *   books from the offers / the destination finder; posted whenever the bridge exists;
 * - FareAlertLoginRequest: {type, targetURL, newWindow: false, methodGet: false,
 *   external: false, parameters: [], headers: []}, from the fare alert; www posts it only on
 *   pages opened through a .solo_continue URL (else it navigates to targetURL);
 * - AirEMProfileDeleted: {type}, after a profile is deleted (the profile page sends it).
 */

const currentWindow = () => (typeof window !== 'undefined' ? window : undefined);

/** Whether the page runs in the app's web view with the bridge. */
export function hasAppBridge(win = currentWindow()) {
  return Boolean(win && ((win.groupapp && typeof win.groupapp.postMessage === 'function')
    || (win.webkit && win.webkit.messageHandlers && win.webkit.messageHandlers.groupapp
      && typeof win.webkit.messageHandlers.groupapp.postMessage === 'function')));
}

/**
 * Sends a message to the app (Android first, then iOS, as www).
 * @param {Object|string} message an object (sent as JSON) or a JSON string
 * @returns {boolean} true when the app got it; false in a normal browser (navigate instead)
 */
export function postToApp(message, win = currentWindow()) {
  if (!hasAppBridge(win)) return false;
  const json = typeof message === 'string' ? message : JSON.stringify(message);
  try {
    if (win.groupapp && typeof win.groupapp.postMessage === 'function') win.groupapp.postMessage(json);
    else win.webkit.messageHandlers.groupapp.postMessage(json);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * A booking handoff message from the URL the page would navigate to: targetURL without the
 * query, its query as parameters [{key, values: [...]}], a GET in the same window.
 * @param {'OfferBookingRequest'|'DestinationFinderBookingRequest'} type
 * @param {string} href
 */
export function bookingRequest(type, href, base = currentWindow()?.location?.href) {
  const url = new URL(href, base);
  const keys = [...new Set([...url.searchParams.keys()])];
  return {
    type,
    // the page, not its web view form (channel.js may have made the link .solo_continue)
    targetURL: `${url.origin}${url.pathname.replace(/\.solo_continue$/, '')}`,
    parameters: keys.map((key) => ({ key, values: url.searchParams.getAll(key) })),
    newWindow: false,
    methodGet: true,
  };
}

/** The fare alert's login request (www's fields). */
export function fareAlertLoginRequest(targetURL) {
  return {
    type: 'FareAlertLoginRequest',
    targetURL,
    newWindow: false,
    methodGet: false,
    external: false,
    parameters: [],
    headers: [],
  };
}

/**
 * Makes a booking link post its message to the app instead of navigating, when the bridge
 * exists (checked at click time); in a browser the link works as before.
 * @param {HTMLAnchorElement} link
 * @param {'OfferBookingRequest'|'DestinationFinderBookingRequest'} type
 */
export function bookInApp(link, type) {
  link.addEventListener('click', (e) => {
    if (e.defaultPrevented || !link.href) return;
    if (postToApp(bookingRequest(type, link.href))) e.preventDefault();
  });
}

/**
 * The fare alert's login: in the app's web view opened through a .solo_continue URL the app
 * logs in (FareAlertLoginRequest); everywhere else the page goes to targetURL.
 * @returns {boolean} true when the app got the request
 */
export function requestFareAlertLogin(targetURL, win = currentWindow()) {
  if (win.location.href.includes('.solo_continue') && postToApp(fareAlertLoginRequest(targetURL), win)) return true;
  win.location.href = targetURL;
  return false;
}
