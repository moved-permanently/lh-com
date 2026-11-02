/* eslint-disable max-len */
/* SWISS's new languages behind a switch (scripts/brands.js SWISS_LANGUAGES, SWISS_LANGUAGES_LIVE,
   withSwissLanguages; as lh-com's liveWaves): a language not switched on is a pilot: its root's
   pages render with their own row (lang, nav and footer, name, airport: scripts/locale.js), while
   BRAND_SITES.swiss's rows and versions, the country dialog, the links to its homepage and
   lh-edge's entries and routes stay as they were (swiss.turnsthe.page answers as before). Once
   its documents are published, its code in SWISS_LANGUAGES_LIVE makes it a root as ch/fr and
   ch/it. Spanish and Portuguese (ch/es, ch/pt; the capture's swiss-snapshots-011, -012, -016,
   -017: the homepages' "Suiza | Español", "Suiça | Português", the flight search from Zurich):
   on since their documents are live (2026-11-03).
   Run: node --max-old-space-size=512 --test test/swiss-languages-switch.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import {
  BRAND_SITES, SWISS_LANGUAGES, SWISS_LANGUAGES_LIVE, withSwissLanguages, withSwissMarkets,
} from '../scripts/brands.js';

const W = 'https://www.swiss.com';
const onPage = (fn) => {
  const { document } = parseHTML('<!DOCTYPE html><html><head><meta name="brand" content="swiss"></head><body></body></html>');
  const saved = globalThis.document;
  globalThis.document = document;
  try {
    return fn();
  } finally {
    globalThis.document = saved;
  }
};

// SWISS's rows as they were before the switch: ch's four, no market roots
const offBase = () => {
  const site = BRAND_SITES.swiss;
  const four = ['ch/en', 'ch/de', 'ch/fr', 'ch/it'];
  const pick = (map) => Object.fromEntries(Object.entries(map).filter(([k]) => four.includes(k)));
  return {
    rows: pick(site.rows),
    versions: Object.fromEntries(Object.entries(site.versions).filter(([, r]) => four.includes(r))),
    names: pick(site.names),
    airports: pick(site.airports),
  };
};

test('the switch is on for es and pt: ch/es and ch/pt are roots as ch/fr and ch/it, no pilots left', () => {
  assert.deepEqual(SWISS_LANGUAGES_LIVE, ['es', 'pt']);
  assert.deepEqual(Object.keys(SWISS_LANGUAGES), ['es', 'pt']);
  const site = BRAND_SITES.swiss;
  // ch's six with their own documents; the market roots (SWISS_MARKETS_LIVE) answered from them
  assert.deepEqual(Object.keys(site.rows).filter((r) => site.rows[r].documents === 'own'), ['ch/en', 'ch/de', 'ch/fr', 'ch/it', 'ch/es', 'ch/pt']);
  assert.deepEqual(Object.keys(site.versions), ['en', 'de', 'fr', 'it', 'es', 'pt']);
  assert.deepEqual(site.rows['ch/es'], {
    country: 'ch', lang: 'es', hreflang: 'es-CH', status: 'live', documents: 'own',
  });
  assert.equal(site.rows['ch/pt'].hreflang, 'pt-CH');
  assert.equal(site.rows['ch/pt'].status, 'live');
  assert.deepEqual(site.pilots.rows, {});
  assert.equal(site.names['ch/es'], 'Suiza | Español');
  assert.equal(site.names['ch/pt'], 'Suiça | Português');
  assert.equal(site.airports['ch/es'], 'ZRH');
  assert.equal(site.airports['ch/pt'], 'ZRH');
});

test('on for a language: its root joins as ch/fr did (row, version, name, airport); the other stays a pilot', () => {
  const base = offBase();
  const on = withSwissLanguages(base, ['es']);
  assert.deepEqual(Object.keys(on.rows).filter((r) => on.rows[r].documents === 'own'), ['ch/en', 'ch/de', 'ch/fr', 'ch/it', 'ch/es']);
  assert.deepEqual(on.rows['ch/es'], {
    country: 'ch', lang: 'es', hreflang: 'es-CH', status: 'live', documents: 'own',
  });
  assert.equal(on.versions.es, 'ch/es');
  assert.equal(on.names['ch/es'], 'Suiza | Español');
  assert.equal(on.airports['ch/es'], 'ZRH');
  assert.deepEqual(Object.keys(on.pilots.rows), ['ch/pt']);
  const both = withSwissLanguages(base, ['es', 'pt']);
  assert.deepEqual(both.pilots.rows, {});
  assert.equal(both.versions.pt, 'ch/pt');
  // with the markets' switch on too: the markets of a language that is on (none in the capture yet)
  const markets = withSwissMarkets(both, true);
  assert.ok(Object.values(markets.rows).filter((r) => r.documents === 'language').every((r) => ['en', 'de', 'fr', 'it', 'es', 'pt'].includes(r.lang)));
  assert.deepEqual(withSwissLanguages(base, []).rows, base.rows, 'off: the rows as they are');
  assert.deepEqual(Object.keys(withSwissLanguages(base, []).pilots.rows), ['ch/es', 'ch/pt'], 'off: both pilots');
});

test('on: the pages render with their root\'s row; the dialog, the links to them and the site\'s entry have them', async () => {
  const {
    getLocale, ownRoots, siteLocales, isMigratedLocale, getHomepageUrl, rootRedirectPath,
  } = await import('../scripts/locale.js');
  onPage(() => {
    const es = getLocale('/ch/es/fly/check-in');
    assert.equal(es.key, 'ch/es');
    assert.equal(es.lang, 'es');
    assert.equal(es.base, '/ch/es');
    assert.equal(es.name, 'Suiza | Español');
    assert.equal(es.homeAirport, 'ZRH');
    assert.equal(es.brand, 'swiss');
    assert.equal(es.status, 'live');
    assert.equal(getLocale('/content/ch/pt/homepage').base, '/content/ch/pt');
    assert.equal(getLocale('/ch/pt/homepage').name, 'Suiça | Português');
    assert.equal(siteLocales()['ch/es'].name, 'Suiza | Español', 'the header\'s globe label');
    assert.deepEqual(ownRoots().filter((r) => r.startsWith('ch/')), ['ch/en', 'ch/de', 'ch/fr', 'ch/it', 'ch/es', 'ch/pt']);
    assert.equal(isMigratedLocale('ch', 'es'), true);
    assert.equal(isMigratedLocale('ch', 'pt'), true);
    assert.equal(getHomepageUrl('ch', 'es'), '/ch/es/homepage');
    assert.equal(getHomepageUrl('ch', 'pt'), '/ch/pt/homepage');
    assert.equal(getHomepageUrl('ch', 'it'), '/ch/it/homepage');
    assert.equal(rootRedirectPath(), '/ch/en/homepage');
    // a language SWISS has no root for: ch/en's, as before
    assert.equal(getLocale('/ch/ja/homepage').key, 'ch/en');
  });
});
