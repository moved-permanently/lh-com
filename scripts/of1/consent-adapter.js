/**
 * OF1's consent API (window.of1Consent: region, has(category), on(category, cb)) from our consent
 * state (scripts/consent.js, the OneTrust choice): OF1's own banner (of1-consent.js) never loads
 * on our hosts, the visitor sees one banner only, ours.
 * - functional and marketing: OneTrust C0004 (personalisation); analytics: C0002.
 * - region from the lh-geo cookie lh-edge sets: US us, every other or no country eu (the EU, the
 *   EEA, the UK and Switzerland, and the strict default for the rest).
 * - on(category, cb): when the category is granted (OF1's API fires on grant only; at once when
 *   it is granted already).
 * - OF1's of1_consent cookie from the same choice (the proxy reads it on /api/*, lh-edge forwards
 *   it): base64url of {"v":1,"region","timestamp","categories"}, Path=/; SameSite=None; Secure;
 *   Partitioned, a session cookie on the host only. Without C0004 (a withdrawal) it goes, with
 *   of1_profile (the proxy's).
 */

export const C_PERSONALISATION = 'C0004';
export const C_PERFORMANCE = 'C0002';

/** OF1's three categories from the accepted OneTrust groups. */
export function categoriesOf(groups) {
  const list = Array.isArray(groups) ? groups : [];
  const personalisation = list.includes(C_PERSONALISATION);
  return {
    functional: personalisation,
    analytics: list.includes(C_PERFORMANCE),
    marketing: personalisation,
  };
}

/** OF1's region from the lh-geo cookie (DE, DE-HH, US-CA): us for the US, else eu. */
export function regionOf(cookie = '') {
  const geo = String(cookie || '').match(/(?:^|;\s*)lh-geo=([A-Za-z]{2})(?:-[A-Za-z0-9]{1,3})?(?:;|$)/);
  return geo && geo[1].toUpperCase() === 'US' ? 'us' : 'eu';
}

const base64url = (text) => btoa(unescape(encodeURIComponent(text)))
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/** The of1_consent cookie's value for a choice. */
export function consentCookieValue(groups, region, timestamp) {
  return base64url(JSON.stringify({
    v: 1, region, timestamp, categories: categoriesOf(groups),
  }));
}

const ATTRIBUTES = 'Path=/; SameSite=None; Secure';

/** The Set-Cookie string of of1_consent (a session cookie, host-only, partitioned). */
export function consentCookie(value) {
  return `of1_consent=${value}; ${ATTRIBUTES}; Partitioned`;
}

/** The strings that delete of1_consent and of1_profile (partitioned or not). */
export function withdrawalCookies() {
  return ['of1_consent', 'of1_profile'].flatMap((name) => [
    `${name}=; Path=/; Max-Age=0; SameSite=None; Secure; Partitioned`,
    `${name}=; Path=/; Max-Age=0; SameSite=None; Secure`,
  ]);
}

/**
 * The adapter: window.of1Consent's shape, with update(groups) for our consent changes.
 * @param {{groups: string[], region: string}} options
 */
export function createConsentAdapter({ groups = [], region = 'eu' } = {}) {
  let current = categoriesOf(groups);
  const CATEGORIES = ['functional', 'analytics', 'marketing'];
  // [category, cb] in the order they came
  const listeners = [];
  const fire = (fn) => {
    try {
      fn();
    } catch (e) {
      // a listener's error is its own
    }
  };
  return {
    region,
    has: (category) => Boolean(current[category]),
    on(category, cb) {
      if (!CATEGORIES.includes(category) || typeof cb !== 'function') return;
      listeners.push([category, cb]);
      if (current[category]) Promise.resolve().then(() => fire(cb));
    },
    update(next) {
      const before = current;
      current = categoriesOf(next);
      listeners.forEach(([category, cb]) => {
        if (current[category] && !before[category]) fire(cb);
      });
    },
  };
}
