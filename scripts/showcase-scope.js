/**
 * Where the showcase notice (scripts/showcase-notice.js) and the demo badge after it
 * (scripts/demo-badge.js) apply: not in DA authoring contexts, inside iframes or under /tools/.
 * The demo hosts are the caller's rule (scripts/scripts.js isDemoHost).
 */
import { isAuthoringContext } from './consent.js';

/**
 * Whether the notice and the badge apply to the page.
 * @returns {boolean}
 */
// eslint-disable-next-line import/prefer-default-export
export function noticeApplies() {
  if (isAuthoringContext()) return false;
  if (window.self !== window.top) return false;
  const path = window.location.pathname.replace(/^\/content(?=\/)/, '');
  return !path.startsWith('/tools/');
}
