/**
 * Where and when OF1's "the site notices you" (scripts/of1/index.js) runs: lh-com's pages on
 * Lufthansa's turnsthe.page hosts (where lh-edge routes OF1's API), never on *.of1.live (OF1's
 * own banner and tracker govern there), in an authoring context, in the app channel or on a
 * brand's page; switched on by the site flag `of1` (flags sheet row, value on) or, on a demo
 * host only, the tester switch localStorage lh-of1 = on.
 */
import { turnsThePageBrandOf } from '../demo.js';

export const TESTER_KEY = 'lh-of1';
const OF1_HOST = /\.of1\.live$/i;

/** Whether the page is one OF1's features may run on (before the switch). */
export function of1Applies({
  hostname, channel, authoring, brand,
}) {
  const host = String(hostname || '').toLowerCase();
  if (OF1_HOST.test(host) || authoring || channel === 'app' || brand) return false;
  return turnsThePageBrandOf(host) === 'lufthansa';
}

/** Whether the features are on: the flag, or the tester switch on a demo host. */
export function of1SwitchedOn({ flag, demo, tester }) {
  return Boolean(flag) || (Boolean(demo) && String(tester || '').trim().toLowerCase() === 'on');
}

/** Whether window.of1Consent is defined: everywhere, on /of1 only with OneTrust C0004. */
export function consentApiWanted(pathname, groups) {
  if (!/^\/of1\/?$/.test(String(pathname || ''))) return true;
  return Array.isArray(groups) && groups.includes('C0004');
}
