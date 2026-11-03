/* eslint-disable max-len */
/* SWISS's market roots behind a switch (scripts/brands.js SWISS_MARKETS_LIVE, withSwissMarkets):
   on since the documents are live (2026-11-03); off, BRAND_SITES.swiss is ch's four roots alone (swiss.turnsthe.page and the country dialog as
   before: the other countries go to www.swiss.com); on, the 204 roots of the capture
   (swiss-snapshots-031, -032) in the languages lh-swiss has (en, de, fr, it) join as roots answered
   from ch/<ll>'s documents, with www's labels and their homepages' default airports. Roots of
   other languages (es, zh, pt, el, ja, ru) are not in the table until their language version is.
   Run: node --max-old-space-size=512 --test test/swiss-markets-switch.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { BRAND_SITES, SWISS_MARKETS_LIVE, withSwissMarkets } from '../scripts/brands.js';

test('the switch is on: SWISS\'s rows are ch\'s own eight and the 204 market roots', () => {
  assert.equal(SWISS_MARKETS_LIVE, true);
  const { rows } = BRAND_SITES.swiss;
  assert.deepEqual(Object.keys(rows).filter((k) => rows[k].documents === 'own').sort(), ['ch/de', 'ch/en', 'ch/es', 'ch/fr', 'ch/it', 'ch/ja', 'ch/pt', 'ch/zh']);
  assert.equal(Object.values(rows).filter((r) => r.documents === 'language').length, 204);
  assert.deepEqual(withSwissMarkets(BRAND_SITES.swiss, true), BRAND_SITES.swiss, 'on: the site as it is');
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
  const { rows } = BRAND_SITES.swiss;
  const ownRows = Object.fromEntries(Object.entries(rows).filter(([, r]) => r.documents === 'own'));
  const enOnly = withSwissMarkets({ ...BRAND_SITES.swiss, rows: ownRows, versions: { en: 'ch/en' } }, true);
  assert.ok(Object.values(enOnly.rows).filter((r) => r.documents === 'language').every((r) => r.lang === 'en'));
});

// the market roots of SWISS's newer languages (es, pt: the held roots of lh-swiss-markets-held.tsv,
// imported 2026-11-03) join when their language is in SWISS_MARKET_LANGUAGES_LIVE, once their
// documents are published; until then the table is as before
test('es and pt market roots (ar/es, br/es, es/es, us/es, br/pt, pt/pt): out while SWISS_MARKET_LANGUAGES_LIVE lists en, de, fr, it; in with their language, www\'s labels and airports', async () => {
  const { SWISS_MARKET_LANGUAGES_LIVE } = await import('../scripts/brands.js');
  const NEW = ['ar/es', 'br/es', 'es/es', 'us/es', 'br/pt', 'pt/pt'];
  assert.deepEqual(SWISS_MARKET_LANGUAGES_LIVE, ['en', 'de', 'fr', 'it']);
  assert.equal(NEW.some((r) => BRAND_SITES.swiss.rows[r]), false);
  const on = withSwissMarkets(BRAND_SITES.swiss, true, ['en', 'de', 'fr', 'it', 'es', 'pt']);
  assert.equal(Object.values(on.rows).filter((r) => r.documents === 'language').length, 210);
  assert.deepEqual(on.rows['ar/es'], {
    country: 'ar', lang: 'es', hreflang: 'es-AR', status: 'live', documents: 'language', label: 'Argentina | Español',
  });
  assert.equal(on.names['pt/pt'], 'Portugal | Português');
  assert.equal(on.names['br/pt'], 'Brasile | Português', 'www\'s label as www writes it');
  assert.deepEqual(NEW.map((r) => on.airports[r]), ['BUE', 'SAO', 'MAD', 'NYC', 'SAO', 'LIS']);
  const esOnly = withSwissMarkets(BRAND_SITES.swiss, true, ['en', 'de', 'fr', 'it', 'es']);
  assert.equal(Boolean(esOnly.rows['es/es']) && !esOnly.rows['pt/pt'], true);
});
