/* OneTrust's geolocation answer (scripts/consent.js geolocationOf, loadOneTrust): set only from the
   lh-geo cookie lh-edge sets (DE, DE-HH, US-CA), never guessed from the page's market; without the
   cookie, or for a US visitor without a state, OneTrust asks geolocation.onetrust.com itself.
   Run: node --test test/*.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import consentOn from './consent-page.js';

const answer = (window) => (window.OneTrust ? window.OneTrust.geolocationResponse : undefined);

test('initConsent: no cookie means no geolocationResponse (OneTrust asks itself)', async () => {
  // a German page and an ITA page: the market is no visitor's location
  const lh = await consentOn('', { hostname: 'lufthansa.turnsthe.page' });
  assert.ok(lh.stub, 'OneTrust loads');
  assert.equal(answer(lh.window), undefined);
  const ita = await consentOn('ita', { hostname: 'ita.turnsthe.page' });
  assert.ok(ita.stub);
  assert.equal(answer(ita.window), undefined);
});

test('initConsent: the lh-geo cookie\'s country and region', async () => {
  const hh = await consentOn('ita', { hostname: 'ita.turnsthe.page', cookie: 'a=1; lh-geo=DE-HH' });
  assert.deepEqual(answer(hh.window), { countryCode: 'DE', stateCode: 'HH' });
  const ca = await consentOn('', { cookie: 'lh-geo=US-CA' });
  assert.deepEqual(answer(ca.window), { countryCode: 'US', stateCode: 'CA' });
  // the value lh-edge set before the region (until the next HTML answer renews it)
  const de = await consentOn('discover', { cookie: 'lh-geo=DE' });
  assert.deepEqual(answer(de.window), { countryCode: 'DE', stateCode: '' });
});

test('initConsent: a US value without a state leaves OneTrust to ask', async () => {
  const us = await consentOn('', { cookie: 'lh-geo=US' });
  assert.ok(us.stub);
  assert.equal(answer(us.window), undefined);
});
