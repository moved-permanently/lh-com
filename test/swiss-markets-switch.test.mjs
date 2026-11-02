/* eslint-disable max-len */
/* SWISS's market roots behind a switch (scripts/brands.js SWISS_MARKETS_LIVE, withSwissMarkets):
   off, BRAND_SITES.swiss is ch's four roots alone (swiss.turnsthe.page and the country dialog as
   before: the other countries go to www.swiss.com); on, the 204 roots of the capture
   (swiss-snapshots-031, -032) in the languages lh-swiss has (en, de, fr, it) join as roots answered
   from ch/<ll>'s documents, with www's labels and their homepages' default airports. Roots of
   other languages (es, zh, pt, el, ja, ru) are not in the table until their language version is.
   Run: node --max-old-space-size=512 --test test/swiss-markets-switch.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { BRAND_SITES, SWISS_MARKETS_LIVE, withSwissMarkets } from '../scripts/brands.js';

test('the switch is off: SWISS\'s rows are ch\'s own four', () => {
  assert.equal(SWISS_MARKETS_LIVE, false);
  assert.deepEqual(Object.keys(BRAND_SITES.swiss.rows).sort(), ['ch/de', 'ch/en', 'ch/fr', 'ch/it']);
  assert.ok(Object.values(BRAND_SITES.swiss.rows).every((r) => r.documents === 'own'));
  assert.deepEqual(withSwissMarkets(BRAND_SITES.swiss, false), BRAND_SITES.swiss, 'off: the site as it is');
});

test('on: 51 countries in each of en, de, fr, it as language roots, www\'s labels, their airports; the language versions and ch\'s rows as they are', () => {
  const on = withSwissMarkets(BRAND_SITES.swiss, true);
  const markets = Object.entries(on.rows).filter(([, r]) => r.documents === 'language');
  assert.equal(markets.length, 204);
  ['en', 'de', 'fr', 'it'].forEach((ll) => assert.equal(markets.filter(([, r]) => r.lang === ll).length, 51, ll));
  assert.deepEqual(on.rows['ae/en'], {
    country: 'ae', lang: 'en', hreflang: 'en-AE', status: 'live', documents: 'language', label: 'United Arab Emirates | English',
  });
  assert.equal(on.names['at/en'], 'Österreich | English', 'www\'s label as www writes it');
  assert.equal(on.names['ch/en'], BRAND_SITES.swiss.names['ch/en']);
  assert.equal(on.airports['de/en'], 'FRA');
  assert.equal(on.airports['ae/fr'], 'DXB');
  assert.equal(on.airports['ca/en'], undefined, 'no default origin on www: the hub');
  assert.deepEqual(on.versions, BRAND_SITES.swiss.versions);
  Object.keys(BRAND_SITES.swiss.rows).forEach((k) => assert.deepEqual(on.rows[k], BRAND_SITES.swiss.rows[k], k));
  assert.ok(markets.every(([k, r]) => Object.prototype.hasOwnProperty.call(on.versions, r.lang) && !k.startsWith('xx/') && !k.startsWith('ch/')), 'only languages lh-swiss has, no xx or ch roots');
});

test('a language version not there yet: its roots stay out', () => {
  const enOnly = withSwissMarkets({ ...BRAND_SITES.swiss, versions: { en: 'ch/en' } }, true);
  assert.ok(Object.values(enOnly.rows).filter((r) => r.documents === 'language').every((r) => r.lang === 'en'));
});
