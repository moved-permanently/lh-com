/* eslint-disable max-len, import/extensions -- dev tooling */
/* The locale table (scripts/locale-table.js, tools/markets/build-locale-table.mjs) and how the site
   reads it: the four roots exactly as before, the ch pilot rows, roots without a row.
   Run: node --test test/*.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildTable, moduleText, OUT } from '../tools/markets/build-locale-table.mjs';
import {
  getLocale, LOCALES, LIVE_ROOTS, LOCALE_TABLE, isMigratedLocale, getHomepageUrl, languageDefaults,
} from '../scripts/locale.js';
import { MARKET_TIME_ZONES, DEFAULT_TIME_ZONE } from '../scripts/clock.js';
import { buildShopHandoff } from '../scripts/shop-handoff.js';
import { portalHeaders } from '../scripts/lh-data.js';

// today's values of the four roots (scripts/locale.js before the table)
const BEFORE = {
  'de/en': {
    country: 'de', lang: 'en', homeAirport: 'FRA', currency: 'EUR',
  },
  'de/de': {
    country: 'de', lang: 'de', homeAirport: 'FRA', currency: 'EUR',
  },
  'at/de': {
    country: 'at', lang: 'de', homeAirport: 'VIE', currency: 'EUR',
  },
  'gb/en': {
    country: 'gb', lang: 'en', homeAirport: 'LHR', currency: 'GBP',
  },
};
const core = (l) => ({
  country: l.country, lang: l.lang, homeAirport: l.homeAirport, currency: l.currency,
});

test('scripts/locale-table.js is up to date (node tools/markets/build-locale-table.mjs)', () => {
  assert.equal(fs.readFileSync(OUT, 'utf8'), moduleText(buildTable()));
  assert.throws(() => buildTable([{ root: 'de/en', hreflang: ['en-DE'], ownSitemap: true }], {
    defaultLocale: 'de/en', languageVersions: {}, fallbackLanguageVersion: 'de/en', roots: { 'zz/en': { status: 'live' } },
  }), /zz\/en: not a root of www's sitemaps/);
});

test('the four roots: LOCALES, getLocale and the migrated checks exactly as before', () => {
  assert.deepEqual(LIVE_ROOTS, ['de/en', 'de/de', 'at/de', 'gb/en']);
  Object.entries(BEFORE).forEach(([key, row]) => {
    assert.deepEqual(core(LOCALES[key]), row, key);
    const l = getLocale(`/${key}/homepage`);
    assert.deepEqual({ ...core(l), key: l.key, base: l.base }, { ...row, key, base: `/${key}` }, key);
    assert.equal(getLocale(`/content/${key}/homepage`).base, `/content/${key}`, 'the dev server');
    const [cc, ll] = key.split('/');
    assert.ok(isMigratedLocale(cc, ll));
    assert.equal(getHomepageUrl(cc, ll), `/${key}/homepage`);
  });
  assert.equal(getLocale('/content/lh/markets/de/en/lounges/x').key, 'de/en', 'LoungeNet pages');
  assert.equal(LOCALE_TABLE['de/en'].hreflang, 'en-DE');
});

test('paths without a root keep the default locale de/de (app screens, fragments, /index)', () => {
  ['/content/mobile/lh/de/homepage', '/xf/lh/footer', '/index', '/'].forEach((p) => {
    const l = getLocale(p);
    assert.deepEqual({ ...core(l), key: l.key }, { ...BEFORE['de/de'], key: 'de/de' }, p);
  });
});

test('ch/en and ch/de: their own rows (CHF, ZRH, Europe/Zurich), not migrated (links to them stay on www)', () => {
  const en = getLocale('/ch/en/homepage');
  assert.deepEqual({
    ...core(en), key: en.key, base: en.base, timeZone: en.timeZone,
  }, {
    country: 'ch', lang: 'en', homeAirport: 'ZRH', currency: 'CHF', key: 'ch/en', base: '/ch/en', timeZone: 'Europe/Zurich',
  });
  assert.equal(getLocale('/ch/de/x').name, 'Schweiz | Deutsch');
  assert.ok(!LOCALES['ch/en'] && !LOCALES['ch/de']);
  assert.ok(!isMigratedLocale('ch', 'en'));
  assert.equal(getHomepageUrl('ch', 'de'), 'https://www.lufthansa.com/ch/de/homepage');
});

test('a root without a row: its own country and language, no home airport or currency, its language version\'s documents', () => {
  const us = getLocale('/us/en/ccpa');
  assert.deepEqual({
    ...core(us), key: us.key, base: us.base, root: us.root,
  }, {
    country: 'us', lang: 'en', homeAirport: null, currency: null, key: 'de/en', base: '/de/en', root: 'us/en',
  });
  // a German root of www's without a row yet (the rollout gives them rows batch by batch: fr/de
  // in batch 8), else none left to check
  const { roots } = JSON.parse(fs.readFileSync('tools/source-export/feeds/sitemaps/roots.json', 'utf8'));
  const rowless = roots.map((r) => `${r.cc}/${r.ll}`).find((k) => k.endsWith('/de') && !LOCALE_TABLE[k]);
  if (rowless) assert.equal(getLocale(`/${rowless}/x`).key, 'de/de', `German: de/de's documents (${rowless})`);
  const fr = getLocale('/fr/fr/homepage');
  assert.deepEqual({ ...core(fr), key: fr.key }, {
    country: 'fr', lang: 'fr', homeAirport: null, currency: null, key: 'de/en',
  }, 'no French version yet: de/en\'s documents, French texts fall back to English');
  assert.equal(languageDefaults('jp', 'ja').hreflang, 'ja-JP');
});

test('the readers of the table: time zones, shop language, portal headers (four roots unchanged, ch added)', () => {
  assert.deepEqual(MARKET_TIME_ZONES, {
    de: 'Europe/Berlin', at: 'Europe/Vienna', gb: 'Europe/London', ch: 'Europe/Zurich',
  });
  assert.equal(DEFAULT_TIME_ZONE, 'Europe/Berlin');
  const shop = (key) => buildShopHandoff({ departureDate: '2026-12-24', origin: 'FRA', destination: 'JFK' }, getLocale(`/${key}/homepage`)).fields.lang;
  assert.deepEqual(['de/en', 'de/de', 'at/de', 'gb/en', 'ch/de'].map(shop), ['en-GB', 'de-DE', 'de-AT', 'en-GB', 'en-GB']);
  assert.deepEqual(portalHeaders('at/de'), {
    'X-Portal': 'LH', 'X-Portal-Site': 'AT', 'X-Portal-Language': 'de', 'X-Portal-Taxonomy': '', 'X-Portal-CountryId': '',
  });
  assert.equal(portalHeaders('ch/de')['X-Portal-Site'], 'CH');
  assert.deepEqual(portalHeaders('fr/fr'), {});
});
