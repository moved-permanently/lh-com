/* eslint-disable max-len */
/* Austrian's roots as its own locales (scripts/brands.js BRAND_SITES.austrian, shared with
   lh-edge's src/sites.js): the ten reference roots, the 54 market roots with their language
   version, each root's home airport and www's selector label.
   Run: node --max-old-space-size=512 --test test/brand-locale-austrian.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const L = await import('../scripts/locale.js');
const { BRAND_SITES } = await import('../scripts/brands.js');

function onPage(meta, fn) {
  const rows = Object.entries(meta).map(([k, v]) => `<meta name="${k}" content="${v}">`).join('');
  const { document } = parseHTML(`<!DOCTYPE html><html><head>${rows}</head><body></body></html>`);
  globalThis.document = document;
  try {
    return fn();
  } finally {
    delete globalThis.document;
  }
}
const austrian = (fn) => onPage({ brand: 'austrian' }, fn);
const pick = (l, keys = ['key', 'country', 'lang', 'base', 'root', 'homeAirport', 'versionBase', 'brand']) => Object.fromEntries(keys.filter((k) => l[k] !== undefined).map((k) => [k, l[k]]));

test('Austrian: 64 roots, ten language versions, a name and an airport for each root', () => {
  const site = BRAND_SITES.austrian;
  assert.equal(Object.keys(site.rows).length, 64);
  assert.equal(Object.values(site.rows).filter((r) => r.documents === 'language').length, 54);
  assert.deepEqual(Object.values(site.versions), ['at/en', 'at/de', 'fr/fr', 'it/it', 'ru/ru', 'cn/zh', 'es/es', 'gr/el', 'jp/ja', 'pl/pl']);
  Object.keys(site.rows).forEach((r) => {
    assert.ok(site.names[r], `name ${r}`);
    assert.match(site.airports[r], /^[A-Z]{3}$/, `airport ${r}`);
  });
  ['xx/de', 'xx/fr', 'ae/ae', 'be/fr', 'kr/en'].forEach((r) => assert.equal(site.rows[r], undefined, r));
});

test('Austrian: its roots are its own locales; a market root with its language version', () => {
  assert.deepEqual(austrian(() => pick(L.getLocale('/at/en/baggage'))), {
    key: 'at/en', country: 'at', lang: 'en', base: '/at/en', root: 'at/en', homeAirport: 'VIE', brand: 'austrian',
  });
  assert.deepEqual(austrian(() => pick(L.getLocale('/ch/de/gepaeck'))), {
    key: 'ch/de', country: 'ch', lang: 'de', base: '/ch/de', root: 'ch/de', homeAirport: 'ZRH', versionBase: '/at/de', brand: 'austrian',
  });
  assert.equal(austrian(() => L.getLocale('/cn/zh/x')).name, '中国内地 (China Mainland) | 简体中文');
  assert.equal(austrian(() => L.getLocale('/ca/fr/x')).homeAirport, 'YTO');
  assert.equal(austrian(() => Object.keys(L.siteLocales()).length), 64);
});

test('Austrian\'s entry leaves lh-com, ITA and Discover as they were', () => {
  assert.equal(onPage({}, () => L.getLocale('/at/en/x')).brand, undefined, 'lh-com: no brand row');
  assert.equal(onPage({ brand: 'ita' }, () => L.getLocale('/at/en/x')).versionBase, '/it/en', 'ITA\'s at/en: a market root of it/en');
  assert.equal(Object.keys(BRAND_SITES.ita.rows).length, 64);
  assert.equal(Object.keys(BRAND_SITES.discover.rows).length, 9);
});
