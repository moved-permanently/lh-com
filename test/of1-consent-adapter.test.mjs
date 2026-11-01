/* eslint-disable max-len */
/* OF1's consent API from our OneTrust choice (scripts/of1/consent-adapter.js): functional and
   marketing are OneTrust C0004 (personalisation), analytics is C0002; the region from lh-geo
   (EU/EEA/UK/CH and unknown: eu, US: us); on(category) fires when the category is granted;
   OF1's of1_consent cookie (base64url JSON, Path=/; SameSite=None; Secure; Partitioned, a
   session cookie, host-only) from the same choice; a withdrawal deletes it, our tracker's
   storage and of1_profile.
   Run: node --max-old-space-size=512 --test test/of1-consent-adapter.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  categoriesOf, regionOf, consentCookieValue, consentCookie, withdrawalCookies, createConsentAdapter,
} from '../scripts/of1/consent-adapter.js';

const fromBase64url = (v) => JSON.parse(Buffer.from(v.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));

test('categories: functional and marketing from C0004, analytics from C0002', () => {
  assert.deepEqual(categoriesOf(['C0001']), { functional: false, analytics: false, marketing: false });
  assert.deepEqual(categoriesOf(['C0001', 'C0004']), { functional: true, analytics: false, marketing: true });
  assert.deepEqual(categoriesOf(['C0001', 'C0002']), { functional: false, analytics: true, marketing: false });
  assert.deepEqual(categoriesOf(['C0001', 'C0002', 'C0004', 'C0005']), { functional: true, analytics: true, marketing: true });
  assert.deepEqual(categoriesOf(undefined), { functional: false, analytics: false, marketing: false });
});

test('region: EU, EEA, UK and CH are eu, US is us, unknown is eu', () => {
  ['DE', 'DE-HH', 'AT', 'FR-75', 'IE', 'NO', 'IS', 'LI', 'GB-ENG', 'CH', 'ch-zh'].forEach((geo) => assert.equal(regionOf(`a=1; lh-geo=${geo}; b=2`), 'eu', geo));
  ['US', 'US-CA', 'us-ny'].forEach((geo) => assert.equal(regionOf(`lh-geo=${geo}`), 'us', geo));
  assert.equal(regionOf(''), 'eu', 'no cookie');
  assert.equal(regionOf('lh-geo=XYZ'), 'eu', 'unreadable');
  assert.equal(regionOf('x=lh-geo=US'), 'eu', 'another cookie\'s value');
  assert.equal(regionOf('lh-geo=JP'), 'eu', 'other countries: the strict default');
});

test('the of1_consent cookie: base64url of OF1\'s JSON, session, host-only, partitioned', () => {
  const value = consentCookieValue(['C0001', 'C0004'], 'eu', '2026-11-02T08:00:00.000Z');
  assert.match(value, /^[A-Za-z0-9_-]+$/, 'base64url, no padding');
  assert.deepEqual(fromBase64url(value), {
    v: 1, region: 'eu', timestamp: '2026-11-02T08:00:00.000Z', categories: { functional: true, analytics: false, marketing: true },
  });
  assert.equal(Object.keys(fromBase64url(value)).join(), 'v,region,timestamp,categories', 'OF1\'s key order');
  const cookie = consentCookie(value);
  assert.equal(cookie, `of1_consent=${value}; Path=/; SameSite=None; Secure; Partitioned`);
  assert.ok(!/expires|max-age|domain/i.test(cookie), 'a session cookie on the host only');
});

test('withdrawal: of1_consent and of1_profile deleted, with and without Partitioned; never Adobe\'s cookies', () => {
  const cookies = withdrawalCookies();
  ['of1_consent', 'of1_profile'].forEach((name) => {
    assert.ok(cookies.includes(`${name}=; Path=/; Max-Age=0; SameSite=None; Secure; Partitioned`), name);
    assert.ok(cookies.includes(`${name}=; Path=/; Max-Age=0; SameSite=None; Secure`), name);
  });
  assert.ok(cookies.every((c) => !/AMCV_|kndctr_/.test(c)));
});

test('the adapter: has() from the choice, on() fires when granted (and at once if granted), updates', async () => {
  const adapter = createConsentAdapter({ groups: ['C0001'], region: 'us' });
  assert.equal(adapter.region, 'us');
  assert.equal(adapter.has('functional'), false);
  assert.equal(adapter.has('marketing'), false);
  assert.equal(adapter.has('analytics'), false);
  assert.equal(adapter.has('anything'), false);
  const fired = [];
  adapter.on('marketing', () => fired.push('marketing'));
  adapter.on('analytics', () => fired.push('analytics'));
  adapter.update(['C0001', 'C0004']);
  assert.deepEqual(fired, ['marketing']);
  assert.equal(adapter.has('functional'), true);
  adapter.update(['C0001']);
  adapter.update(['C0001', 'C0004', 'C0002']);
  assert.deepEqual(fired, ['marketing', 'marketing', 'analytics'], 'again on each new grant, never on withdrawal');
  const late = [];
  adapter.on('functional', () => late.push('functional'));
  await Promise.resolve();
  assert.deepEqual(late, ['functional'], 'already granted: fires right away');
  // a failing callback does not stop the others
  const b = createConsentAdapter({ groups: ['C0001'], region: 'eu' });
  const after = [];
  b.on('functional', () => { throw new Error('x'); });
  b.on('functional', () => after.push(1));
  b.update(['C0004']);
  assert.deepEqual(after, [1]);
});
