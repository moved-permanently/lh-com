/* eslint-disable max-len */
/* ITA's Spanish market roots us/es and ve/es (brief 411: Ben's locales of 2026-11-05; their
   homepage, nav and footer on preview), behind their switch as SWISS's new roots (scripts/brands.js
   ITA_MARKETS, ITA_MARKETS_LIVE, withItaMarkets). Off: not in ITA's table, the site as
   before; on (as shipped since their documents are live, 2026-11-06): market roots of es/es's documents with
   the flight search's origin, as ar/es and do/es.
   Run: node --test test/ita-markets-switch.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BRAND_SITES, ITA_MARKETS, ITA_MARKETS_LIVE, withItaMarkets,
} from '../scripts/brands.js';

test('us/es and ve/es: on as shipped (their documents are live, 2026-11-06): market roots of es/es\'s documents', () => {
  assert.deepEqual(Object.keys(ITA_MARKETS), ['us/es', 've/es']);
  assert.deepEqual(ITA_MARKETS_LIVE, ['us/es', 've/es']);
  const site = BRAND_SITES.ita;
  assert.equal(site.rows['us/es'].documents, 'language');
  assert.equal(site.rows['ve/es'].documents, 'language');
  assert.equal(site.airports['us/es'], 'NYC');
  assert.equal(site.airports['ve/es'], 'CCS');
  assert.deepEqual(withItaMarkets(site, ITA_MARKETS_LIVE), site, 'on twice: the site as it is');
});

test('us/es and ve/es off: not in ITA\'s table', () => {
  const without = (o) => Object.fromEntries(Object.entries(o).filter(([r]) => !(r in ITA_MARKETS)));
  const base = BRAND_SITES.ita;
  const site = withItaMarkets({ ...base, rows: without(base.rows), airports: without(base.airports) }, []);
  ['us/es', 've/es'].forEach((r) => {
    assert.equal(site.rows[r], undefined, r);
    assert.equal(site.airports[r], undefined, r);
  });
  assert.equal(site.rows['ar/es'].documents, 'language');
});

test('us/es and ve/es on: market roots of es/es\'s documents, New York and Caracas as their origins', () => {
  const without = (o) => Object.fromEntries(Object.entries(o).filter(([r]) => !(r in ITA_MARKETS)));
  const base = { ...BRAND_SITES.ita, rows: without(BRAND_SITES.ita.rows), airports: without(BRAND_SITES.ita.airports) };
  const site = withItaMarkets(base, ['us/es', 've/es']);
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
  const one = withItaMarkets(base, ['us/es']);
  assert.ok(one.rows['us/es']);
  assert.equal(one.rows['ve/es'], undefined);
  assert.equal(Object.keys(site.rows).length, Object.keys(base.rows).length + 2);
});
