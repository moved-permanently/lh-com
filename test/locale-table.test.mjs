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
import { LANGUAGE_VERSIONS, NEUTRAL_VERSIONS } from '../scripts/locale-table.js';

// the live roots with documents of their own: the four, and a language version with documents of
// its own once its wave is live (xx/fr: wave 11, xx/es: 12, xx/pt: 13 ... xx/pl: 21, in the table's
// order; tools/reports/markets/go-live.md)
const VERSION_WAVES = [['xx/fr', 11], ['xx/es', 12], ['xx/pt', 13], ['xx/ru', 14], ['xx/hk', 15], ['xx/zh', 16], ['xx/it', 17], ['xx/el', 18], ['xx/ja', 19], ['xx/ko', 20], ['xx/pl', 21]];
const ownLiveRoots = () => {
  const { liveWaves = [] } = JSON.parse(fs.readFileSync('tools/markets/locale-data.json', 'utf8'));
  return ['de/en', 'de/de', 'at/de', 'gb/en', ...VERSION_WAVES.filter(([, w]) => liveWaves.includes(w)).map(([k]) => k)];
};

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
  assert.deepEqual(LIVE_ROOTS, ownLiveRoots());
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

test('ch/en and ch/de: their own rows (CHF, ZRH, Europe/Zurich), not migrated until a go-live wave (links to them on www until then)', () => {
  const en = getLocale('/ch/en/homepage');
  assert.deepEqual({
    ...core(en), key: en.key, base: en.base, timeZone: en.timeZone,
  }, {
    country: 'ch', lang: 'en', homeAirport: 'ZRH', currency: 'CHF', key: 'ch/en', base: '/ch/en', timeZone: 'Europe/Zurich',
  });
  assert.equal(getLocale('/ch/de/x').name, 'Schweiz | Deutsch');
  // migrated once the go-live setting lists ch (tools/reports/markets/go-live.md), else pilot
  const { liveWaves = [] } = JSON.parse(fs.readFileSync('tools/markets/locale-data.json', 'utf8'));
  const live = liveWaves.includes('ch');
  assert.equal(Boolean(LOCALES['ch/en'] && LOCALES['ch/de']), live);
  assert.equal(isMigratedLocale('ch', 'en'), live);
  assert.equal(getHomepageUrl('ch', 'de'), live ? '/ch/de/homepage' : 'https://www.lufthansa.com/ch/de/homepage');
});

test('a root without a row: its own country and language, no home airport or currency, its language version\'s documents', () => {
  // an English and a German root of www's without a row yet (the rollout gives them rows batch by
  // batch: fr/de in batch 8, us/en in batch 10), else none left to check; fr/fr below always is one
  const { roots } = JSON.parse(fs.readFileSync('tools/source-export/feeds/sitemaps/roots.json', 'utf8'));
  const rowless = (ll) => roots.map((r) => `${r.cc}/${r.ll}`).find((k) => k.endsWith(`/${ll}`) && !LOCALE_TABLE[k]);
  const en = rowless('en');
  if (en) {
    const l = getLocale(`/${en}/x`);
    assert.deepEqual({
      ...core(l), key: l.key, base: l.base, root: l.root,
    }, {
      country: en.split('/')[0], lang: 'en', homeAirport: null, currency: null, key: 'de/en', base: '/de/en', root: en,
    });
  }
  const de = rowless('de');
  if (de) assert.equal(getLocale(`/${de}/x`).key, 'de/de', `German: de/de's documents (${de})`);
  // a root of a language without a version (it/it until batch 17): de/en's documents, its texts
  // fall back to English; since batch 21 every root of www's has a row
  const other = roots.filter((r) => r.ownSitemap).map((r) => `${r.cc}/${r.ll}`).find((k) => !LOCALE_TABLE[k] && !['en', 'de'].includes(k.split('/')[1]));
  if (other) {
    const l = getLocale(`/${other}/homepage`);
    const [cc, ll] = other.split('/');
    assert.deepEqual({ ...core(l), key: l.key }, {
      country: cc, lang: ll, homeAirport: null, currency: null, key: 'de/en',
    }, `no version of ${ll}: de/en's documents, its texts fall back to English`);
    assert.deepEqual(portalHeaders(other), {});
  } else {
    assert.deepEqual(roots.filter((r) => r.ownSitemap && !LOCALE_TABLE[r.root]).map((r) => r.root), []);
  }
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
  // a row's headers (it/it's since batch 17); a path that is no row, none
  assert.equal(portalHeaders('it/it')['X-Portal-Site'], 'IT');
  assert.deepEqual(portalHeaders('zz/it'), {});
});

test('a language version still pilot (French, batch 11): allowed while its market roots are; a wave makes both live, a country wave not the root of a pilot version', () => {
  const www = ['de/en', 'de/de', 'fr/fr', 'ch/en', 'ch/de', 'ch/fr', 'be/fr'].map((root) => ({ root, hreflang: [`${root.split('/')[1]}-${root.split('/')[0].toUpperCase()}`], ownSitemap: true }));
  const data = (liveWaves, extra = {}) => ({
    defaultLocale: 'de/en',
    languageVersions: { en: 'de/en', de: 'de/de', fr: 'fr/fr' },
    fallbackLanguageVersion: 'de/en',
    liveWaves,
    roots: {
      'de/en': { status: 'live' },
      'de/de': { status: 'live' },
      'fr/fr': { status: 'pilot', documents: 'own', batch: 11 },
      'ch/en': { status: 'pilot', documents: 'language' },
      'ch/de': { status: 'pilot', documents: 'language' },
      'ch/fr': { status: 'pilot', documents: 'language', batch: 11 },
      'be/fr': { status: 'pilot', documents: 'language', batch: 11 },
      ...extra,
    },
  });
  const status = (t) => Object.fromEntries(Object.entries(t.rows).map(([k, r]) => [k, r.status]));
  assert.deepEqual(status(buildTable(www, data([]))), {
    'de/en': 'live', 'de/de': 'live', 'fr/fr': 'pilot', 'ch/en': 'pilot', 'ch/de': 'pilot', 'ch/fr': 'pilot', 'be/fr': 'pilot',
  });
  assert.deepEqual(buildTable(www, data([])).languageVersions, { en: 'de/en', de: 'de/de', fr: 'fr/fr' });
  // ch first (wave "ch"): ch/en and ch/de; ch/fr waits for its language version's wave
  assert.deepEqual(status(buildTable(www, data(['ch']))), {
    'de/en': 'live', 'de/de': 'live', 'fr/fr': 'pilot', 'ch/en': 'live', 'ch/de': 'live', 'ch/fr': 'pilot', 'be/fr': 'pilot',
  });
  assert.deepEqual(status(buildTable(www, data([11]))), {
    'de/en': 'live', 'de/de': 'live', 'fr/fr': 'live', 'ch/en': 'pilot', 'ch/de': 'pilot', 'ch/fr': 'live', 'be/fr': 'live',
  });
  assert.equal(status(buildTable(www, data(['ch', 11])))['ch/fr'], 'live');
  // a live market root needs a live language version; the default and fallback stay live rows
  assert.throws(() => buildTable(www, data([], { 'be/fr': { status: 'live', documents: 'language' } })), /be\/fr: a live market root needs a live language version \(fr\/fr is pilot\)/);
  assert.throws(() => buildTable(www, { ...data([]), fallbackLanguageVersion: 'fr/fr' }), /fr\/fr: must be a live row/);
});

test('French (batch 11, pilot; brief 281: www\'s xx/fr has pages): xx/fr the language version with its own documents, 14 market roots from it (fr/fr among them); the four live roots as before', () => {
  const { liveWaves = [] } = JSON.parse(fs.readFileSync('tools/markets/locale-data.json', 'utf8'));
  assert.deepEqual(LIVE_ROOTS, ownLiveRoots());
  assert.deepEqual({ en: LANGUAGE_VERSIONS.en, de: LANGUAGE_VERSIONS.de, fr: LANGUAGE_VERSIONS.fr }, { en: 'de/en', de: 'de/de', fr: 'xx/fr' });
  const french = Object.entries(LOCALE_TABLE).filter(([, r]) => r.lang === 'fr');
  assert.equal(french.length, 15);
  assert.ok(french.every(([, r]) => r.status === (liveWaves.includes(11) ? 'live' : 'pilot')));
  assert.deepEqual(french.filter(([, r]) => r.documents === 'own').map(([k]) => k), ['xx/fr']);
  assert.equal(LOCALE_TABLE['xx/fr'].hreflang, 'fr');
  assert.equal(LOCALE_TABLE['fr/fr'].hreflang, 'fr-FR');
  const xx = getLocale('/xx/fr/homepage');
  assert.deepEqual({ key: xx.key, lang: xx.lang, versionBase: xx.versionBase }, { key: 'xx/fr', lang: 'fr', versionBase: undefined });
  const fr = getLocale('/fr/fr/bagages');
  assert.deepEqual({ key: fr.key, lang: fr.lang, versionBase: fr.versionBase }, { key: 'fr/fr', lang: 'fr', versionBase: '/xx/fr' }, 'France: a market root of xx/fr');
  const ch = getLocale('/ch/fr/bagages');
  assert.deepEqual({ key: ch.key, currency: ch.currency, versionBase: ch.versionBase }, { key: 'ch/fr', currency: 'CHF', versionBase: '/xx/fr' });
  if (!liveWaves.includes(11)) {
    assert.ok(!isMigratedLocale('fr', 'fr'));
    assert.equal(getHomepageUrl('ch', 'fr'), 'https://www.lufthansa.com/ch/fr/homepage');
  }
  assert.deepEqual(portalHeaders('fr/fr'), {
    'X-Portal': 'LH', 'X-Portal-Site': 'FR', 'X-Portal-Language': 'fr', 'X-Portal-Taxonomy': '', 'X-Portal-CountryId': '',
  });
});

test('the neutral versions (brief 267): www\'s market-neutral roots xx/en and xx/de, no rows; their pages keep de/en\'s and de/de\'s documents', () => {
  assert.deepEqual(NEUTRAL_VERSIONS, { en: 'xx/en', de: 'xx/de' });
  assert.ok(!LOCALE_TABLE['xx/en'] && !LOCALE_TABLE['xx/de']);
  assert.equal(getLocale('/xx/en/book-and-manage/stopover/munich-airport').key, 'de/en');
  assert.equal(getLocale('/xx/de/319').key, 'de/de');
  assert.throws(() => buildTable([{ root: 'de/en', hreflang: ['en-DE'], ownSitemap: true }], {
    defaultLocale: 'de/en', languageVersions: { en: 'de/en' }, neutralVersions: { en: 'zz/en' }, fallbackLanguageVersion: 'de/en', roots: { 'de/en': { status: 'live' } },
  }), /zz\/en: a neutral version must be a root of www's/);
});

test('a market-neutral language version (Spanish, brief 268: www\'s xx/es has pages): a row of a root that is only an alternate, hreflang the language', () => {
  const www = [
    { root: 'de/en', hreflang: ['en-DE'], ownSitemap: true },
    { root: 'xx/es', hreflang: ['es'], ownSitemap: false },
    { root: 'mx/es', hreflang: ['es-MX'], ownSitemap: true },
    { root: 'xx/it', hreflang: ['it'], ownSitemap: false },
  ];
  const data = (roots, versions = { en: 'de/en', es: 'xx/es' }) => ({
    defaultLocale: 'de/en', languageVersions: versions, fallbackLanguageVersion: 'de/en', liveWaves: [], roots,
  });
  const t = buildTable(www, data({ 'de/en': { status: 'live' }, 'xx/es': { status: 'pilot', documents: 'own', batch: 12 }, 'mx/es': { status: 'pilot', documents: 'language', batch: 12 } }));
  assert.equal(t.rows['xx/es'].hreflang, 'es');
  assert.equal(t.rows['xx/es'].country, 'xx');
  assert.equal(t.rows['mx/es'].hreflang, 'es-MX');
  // an alternate-only root that is no language version: no row
  assert.throws(() => buildTable(www, data({ 'de/en': { status: 'live' }, 'xx/it': { status: 'pilot', documents: 'own' } })), /xx\/it: not a root of www's sitemaps/);
});

test('Spanish (batch 12, pilot): xx/es the language version with its own documents, 13 market roots from it (es/es among them)', () => {
  const { liveWaves = [] } = JSON.parse(fs.readFileSync('tools/markets/locale-data.json', 'utf8'));
  assert.deepEqual(LIVE_ROOTS, ownLiveRoots());
  assert.equal(LANGUAGE_VERSIONS.es, 'xx/es');
  const spanish = Object.entries(LOCALE_TABLE).filter(([, r]) => r.lang === 'es');
  assert.equal(spanish.length, 14);
  assert.ok(spanish.every(([, r]) => r.status === (liveWaves.includes(12) ? 'live' : 'pilot')));
  assert.deepEqual(spanish.filter(([, r]) => r.documents === 'own').map(([k]) => k), ['xx/es']);
  assert.equal(LOCALE_TABLE['xx/es'].hreflang, 'es');
  assert.equal(getLocale('/xx/es/homepage').key, 'xx/es');
  const mx = getLocale('/mx/es/equipaje');
  assert.deepEqual({ key: mx.key, currency: mx.currency, versionBase: mx.versionBase }, { key: 'mx/es', currency: 'MXN', versionBase: '/xx/es' });
  assert.equal(getLocale('/es/es/equipaje').versionBase, '/xx/es', 'Spain: a market root of xx/es');
});
