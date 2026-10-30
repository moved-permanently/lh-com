/* OneTrust's stub URL and geolocation answer (scripts/consent.js, brief 150).
   Run: node --test test/*.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'lufthansa.turnsthe.page', pathname: '/de/de/homepage', search: '', href: 'https://lufthansa.turnsthe.page/de/de/homepage', origin: 'https://lufthansa.turnsthe.page',
};
Object.defineProperty(window, 'origin', { value: 'https://lufthansa.turnsthe.page', configurable: true });
globalThis.window = window;
globalThis.document = document;
const { oneTrustStubUrl, geolocationOf } = await import('../scripts/consent.js');

test('oneTrustStubUrl: the own host where lh-edge serves the page, cdn.cookielaw.org elsewhere', () => {
  ['lufthansa.turnsthe.page', 'lufthansa-edge.turnsthe.page', 'lufthansa-cn.turnsthe.page', 'discover.turnsthe.page'].forEach((h) => {
    assert.equal(oneTrustStubUrl(h), '/onetrust/scripttemplates/otSDKStub.js', h);
  });
  ['main--lh-com--moved-permanently.aem.page', 'main--lh-discover--moved-permanently.aem.live', 'localhost', 'other.turnsthe.page', 'www.lufthansa.com'].forEach((h) => {
    assert.equal(oneTrustStubUrl(h), 'https://cdn.cookielaw.org/scripttemplates/otSDKStub.js', h);
  });
});

test('geolocationOf: country and state from lh-geo only, never from the page', () => {
  assert.deepEqual(geolocationOf('a=1; lh-geo=DE-HH; b=2'), { countryCode: 'DE', stateCode: 'HH' });
  assert.deepEqual(geolocationOf('lh-geo=us-ca'), { countryCode: 'US', stateCode: 'CA' });
  assert.deepEqual(geolocationOf('lh-geo=DE'), { countryCode: 'DE', stateCode: '' }, 'the old value: the country');
  assert.deepEqual(geolocationOf('lh-geo=IT-RM'), { countryCode: 'IT', stateCode: 'RM' });
  assert.deepEqual(geolocationOf('lh-geo=GB-ENG'), { countryCode: 'GB', stateCode: 'ENG' });
  assert.equal(geolocationOf('lh-geo=US'), null, 'US without a state: OneTrust asks itself');
  assert.equal(geolocationOf(''), null, 'no cookie: OneTrust asks itself');
  assert.equal(geolocationOf('x=lh-geo=AT'), null, 'another cookie\'s value');
  assert.equal(geolocationOf('lh-geo=XYZ'), null);
  assert.equal(geolocationOf('lh-geo=DE-'), null);
  assert.equal(geolocationOf('lh-geo=DE-HHHH'), null);
});
