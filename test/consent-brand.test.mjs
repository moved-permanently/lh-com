/* OneTrust per brand (scripts/brand.js oneTrustId, scripts/consent.js): Lufthansa's id on lh-com,
   Discover's and ITA's own on theirs; a brand without an id gets no banner and only the necessary
   consent (nothing that needs consent runs). Each case a fresh consent.js (test/consent-page.js).
   Run: node --test test/*.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { oneTrustId, BRANDS, DEFAULT_ONETRUST } from '../scripts/brand.js';
import consentOn from './consent-page.js';

const meta = (values) => (name) => values[name] || '';

test('oneTrustId: Lufthansa for lh-com, the brand\'s own id, none for a brand without one', () => {
  assert.equal(oneTrustId(meta({})), '01994cb2-af99-7dbe-8fb0-56427773e54e');
  assert.equal(DEFAULT_ONETRUST, '01994cb2-af99-7dbe-8fb0-56427773e54e');
  assert.equal(oneTrustId(meta({ brand: 'discover' })), '01994cb4-6d4f-7911-abbc-7117e4e6c370');
  assert.equal(oneTrustId(meta({ brand: 'ita' })), '01994cb4-04ea-768d-baf8-f6ed09be97dd');
  assert.equal(oneTrustId(meta({ brand: 'unknown' })), DEFAULT_ONETRUST, 'an unknown value is lh-com');
  BRANDS.nobanner = { name: 'No Banner Air' };
  try {
    assert.equal(oneTrustId(meta({ brand: 'nobanner' })), '');
  } finally {
    delete BRANDS.nobanner;
  }
});

test('initConsent: the stub carries the brand\'s OneTrust id', async () => {
  const lh = await consentOn('');
  assert.equal(lh.stub.dataset.domainScript, DEFAULT_ONETRUST);
  const discover = await consentOn('discover');
  assert.equal(discover.stub.dataset.domainScript, '01994cb4-6d4f-7911-abbc-7117e4e6c370');
  const ita = await consentOn('ita');
  assert.equal(ita.stub.dataset.domainScript, '01994cb4-04ea-768d-baf8-f6ed09be97dd');
});

test('initConsent: Air Dolomiti (no consent tool on its www) shows no banner, not Lufthansa\'s', async () => {
  assert.equal(oneTrustId(meta({ brand: 'airdolomiti' })), '');
  const { stub, events } = await consentOn('airdolomiti');
  assert.equal(stub, null);
  assert.deepEqual(events.map((e) => [e.consented, e.groups.join()]), [[false, 'C0001']]);
});

// Lufthansa Cargo (brief 422): www's Usercentrics is not ours; the same handling as the brand
// sites, without OneTrust: the look-alike banner (consent-banner.js) at once, the footer's Cookie
// Settings its preference center, Cargo's own privacy, cookie and imprint pages in it
test('initConsent: Lufthansa Cargo (consent: fallback) shows the look-alike banner without OneTrust; Cookie Settings opens its preferences', async () => {
  assert.equal(oneTrustId(meta({ brand: 'cargo' })), '');
  assert.equal(BRANDS.cargo.consent, 'fallback');
  const { stub, events, window } = await consentOn('cargo', { hostname: 'cargo.turnsthe.page' });
  assert.equal(stub, null, 'no OneTrust stub');
  assert.ok(window.document.documentElement.classList.contains('lh-consent-fallback'), 'the fallback banner');
  assert.deepEqual(events.map((e) => [e.consented, e.groups.join()]), [[false, 'C0001']]);
  window.document.documentElement.classList.remove('lh-consent-fallback');
  window.dispatchEvent(new window.CustomEvent('consent.preferences'));
  assert.ok(window.document.documentElement.classList.contains('lh-consent-fallback'), 'the preferences');
  assert.equal(window.document.querySelector('script[data-domain-script]'), null);
});

test('Cargo\'s consent links: its data protection, cookie information and imprint pages (German: its imprint, the English pages it lacks)', () => {
  assert.deepEqual(BRANDS.cargo.consentLinks, {
    en: { privacy: '/en/data-protection', cookies: '/en/cookie-information', imprint: '/en/footer/bottomnav/imprint' },
    de: { privacy: '/en/data-protection', cookies: '/en/cookie-information', imprint: '/de/footer/bottomnav/imprint' },
  });
});

test('initConsent: a brand without an id loads no banner and announces the necessary group only', async () => {
  BRANDS.nobanner = { name: 'No Banner Air' };
  try {
    const { stub, events, window } = await consentOn('nobanner');
    assert.equal(stub, null, 'no OneTrust stub');
    assert.deepEqual(events.map((e) => [e.consented, e.groups.join()]), [[false, 'C0001']]);
    // the footer's "Change Privacy Settings" opens nothing either (no OneTrust, no look-alike)
    window.dispatchEvent(new window.CustomEvent('consent.preferences'));
    assert.ok(window.document.querySelector('script[data-domain-script]') === null, 'no script[data-domain-script]');
    assert.equal(window.document.documentElement.classList.contains('lh-consent-fallback'), false);
    assert.equal(events.length, 1);
  } finally {
    delete BRANDS.nobanner;
  }
});
