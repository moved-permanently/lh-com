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

test('initConsent: Lufthansa Cargo and Air Dolomiti (no OneTrust on their www) show no banner, not Lufthansa\'s', async () => {
  assert.equal(oneTrustId(meta({ brand: 'cargo' })), '');
  assert.equal(oneTrustId(meta({ brand: 'airdolomiti' })), '');
  for (const brand of ['cargo', 'airdolomiti']) { // eslint-disable-line no-restricted-syntax
    const { stub, events } = await consentOn(brand); // eslint-disable-line no-await-in-loop
    assert.equal(stub, null, brand);
    assert.deepEqual(events.map((e) => [e.consented, e.groups.join()]), [[false, 'C0001']], brand);
  }
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
