/*
 * The focus after a choice in the cookie dialog (OneTrust's banner and preference center, the
 * fallback banner: scripts/consent.js, scripts/consent-banner.js): back where it was before the
 * dialog opened; when it opened on load (the focus on body) or that element is gone, the first
 * skip link (scripts/skip-links.js), else where it is.
 */

const DIALOGS = '#onetrust-consent-sdk, .lh-consent';

const inDialog = (node) => Boolean(node && node.closest && node.closest(DIALOGS));

/**
 * Where the focus goes after a choice.
 * @param {Element|null} previous the focused element before the dialog opened
 * @param {Document} doc
 * @returns {Element|null}
 */
export function focusReturnTarget(previous, doc = document) {
  const kept = previous && previous !== doc.body && previous.isConnected && !inDialog(previous);
  if (kept) return previous;
  return doc.querySelector('.skip-link') || null;
}

/**
 * Moves the focus to the target while it is on body or still inside a dialog (not when the
 * visitor has moved on).
 * @param {Element|null} target focusReturnTarget's
 * @param {Document} doc
 * @returns {boolean} whether the focus moved
 */
export function returnFocus(target, doc = document) {
  if (!target) return false;
  const active = doc.activeElement;
  if (active && active !== doc.body && !inDialog(active)) return false;
  target.focus({ preventScroll: true });
  return true;
}
