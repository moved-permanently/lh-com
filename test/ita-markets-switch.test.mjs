/* ITA's Spanish market roots us/es and ve/es (brief 411: Ben's locales of 2026-11-05; their
   homepage, nav and footer on preview), behind their switch as SWISS's new roots (scripts/brands.js
   ITA_MARKETS, ITA_MARKETS_LIVE, withItaMarkets). Off (as shipped, until their documents are
   published): not in ITA's table, the site as before; on: market roots of es/es's documents with
   the flight search's origin, as ar/es and do/es.
   Run: node --test test/ita-markets-switch.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BRAND_SITES, ITA_MARKETS, ITA_MARKETS_LIVE, withItaMarkets,
} from '../scripts/brands.js';

test('us/es and ve/es: off as shipped, not in ITA\'s table', () => {
  assert.deepEqual(Object.keys(ITA_MARKETS), ['us/es', 've/es']);
  assert.deepEqual(ITA_MARKETS_LIVE, []);
  const site = BRAND_SITES.ita;
  ['us/es', 've/es'].forEach((r) => {
    assert.equal(site.rows[r], undefined, r);
    assert.equal(site.airports[r], undefined, r);
  });
  assert.equal(site.rows['ar/es'].documents, 'language');
  assert.deepEqual(withItaMarkets(site, []), site, 'off: the site as it is');
});

test('us/es and ve/es on: market roots of es/es\'s documents, New York and Caracas as their origins', () => {
  const site = withItaMarkets(BRAND_SITES.ita, ['us/es', 've/es']);
  assert.deepEqual(site.rows['us/es'], {
    country: 'us', lang: 'es', hreflang: 'es-US', status: 'live', documents: 'language',
  });
  assert.deepEqual(site.rows['ve/es'], {
    country: 've', lang: 'es', hreflang: 'es-VE', status: 'live', documents: 'language',
  });
  assert.equal(site.airports['us/es'], 'NYC');
  assert.equal(site.airports['ve/es'], 'CCS');
  assert.equal(site.versions.es, 'es/es');
  // one on, the other as before; the other roots unchanged
  const one = withItaMarkets(BRAND_SITES.ita, ['us/es']);
  assert.ok(one.rows['us/es']);
  assert.equal(one.rows['ve/es'], undefined);
  assert.equal(Object.keys(site.rows).length, Object.keys(BRAND_SITES.ita.rows).length + 2);
});
