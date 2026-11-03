/* eslint-disable max-len */
/* SWISS's new languages behind a switch (scripts/brands.js SWISS_LANGUAGES, SWISS_LANGUAGES_LIVE,
   withSwissLanguages; as lh-com's liveWaves): a language not switched on is a pilot: its root's
   pages render with their own row (lang, nav and footer, name, airport: scripts/locale.js), while
   BRAND_SITES.swiss's rows and versions, the country dialog, the links to its homepage and
   lh-edge's entries and routes stay as they were (swiss.turnsthe.page answers as before). Once
   its documents are published, its code in SWISS_LANGUAGES_LIVE makes it a root as ch/fr and
   ch/it. Spanish and Portuguese (brief 279: swiss-snapshots-011, -012, -016, -017: "Suiza |
   Español", "Suiça | Português"), Chinese and Japanese (brief 28x: -014, -015, -021, -022:
   "瑞士 (Switzerland) | 简体中文", "Switzerland | 日本語"), Greek and Russian (brief 283: -018, -019,
   -023, -024: "Ελβετία | Ελληνικά", "Switzerland | Русский"); the flight search from Zurich on all.
   es and pt on since their documents are live (2026-11-03), zh and ja too (2026-11-03). The tests read SWISS_LANGUAGES_LIVE:
   turning a language on needs no change here.
   Run: node --max-old-space-size=512 --test test/swiss-languages-switch.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import {
  BRAND_SITES, SWISS_LANGUAGES, SWISS_LANGUAGES_LIVE, withSwissLanguages, withSwissMarkets,
} from '../scripts/brands.js';

const W = 'https://www.swiss.com';
const NAMES = {
  'ch/es': 'Suiza | Español',
  'ch/pt': 'Suiça | Português',
  'ch/zh': '瑞士 (Switzerland) | 简体中文',
  'ch/ja': 'Switzerland | 日本語',
  'ch/el': 'Ελβετία | Ελληνικά',
  'ch/ru': 'Switzerland | Русский',
};
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
const off = Object.keys(SWISS_LANGUAGES).filter((ll) => !SWISS_LANGUAGES_LIVE.includes(ll));
const on = Object.keys(SWISS_LANGUAGES).filter((ll) => SWISS_LANGUAGES_LIVE.includes(ll));
// SWISS's site without the switch's languages (as withSwissLanguages finds it)
const base = (() => {
  // ch's roots of these languages and their market roots (es and pt's since 2026-11-03)
  const roots = [
    ...Object.values(SWISS_LANGUAGES).map((l) => l.root),
    ...Object.keys(BRAND_SITES.swiss.rows).filter((k) => SWISS_LANGUAGES[k.split('/')[1]]),
  ];
  const without = (map) => Object.fromEntries(Object.entries(map).filter(([k]) => !roots.includes(k)));
  const s = {
    ...BRAND_SITES.swiss,
    rows: without(BRAND_SITES.swiss.rows),
    names: without(BRAND_SITES.swiss.names),
    airports: without(BRAND_SITES.swiss.airports),
    versions: Object.fromEntries(Object.entries(BRAND_SITES.swiss.versions).filter(([ll]) => !SWISS_LANGUAGES[ll])),
  };
  delete s.pilots;
  return s;
})();

test('the languages behind the switch: es, pt, zh, ja (on), el and ru (off); www\'s names, Zurich', () => {
  assert.deepEqual(Object.keys(SWISS_LANGUAGES), ['es', 'pt', 'zh', 'ja', 'el', 'ru']);
  assert.ok(['es', 'pt', 'zh', 'ja'].every((ll) => SWISS_LANGUAGES_LIVE.includes(ll)), 'es, pt, zh and ja on since their documents are live');
  assert.ok(!SWISS_LANGUAGES_LIVE.includes('el') && !SWISS_LANGUAGES_LIVE.includes('ru'), 'el and ru off until published');
  assert.ok(SWISS_LANGUAGES_LIVE.every((ll) => SWISS_LANGUAGES[ll]), 'only languages of the table');
  Object.entries(SWISS_LANGUAGES).forEach(([ll, { root, name, airport }]) => {
    assert.equal(root, `ch/${ll}`);
    assert.equal(name, NAMES[root]);
    assert.equal(airport, 'ZRH');
  });
});

test('BRAND_SITES.swiss: the languages off as pilots, the ones on as roots; ch\'s own four first', () => {
  const site = BRAND_SITES.swiss;
  const own = Object.keys(site.rows).filter((r) => site.rows[r].documents === 'own');
  assert.deepEqual(own, ['ch/en', 'ch/de', 'ch/fr', 'ch/it', ...on.map((ll) => `ch/${ll}`)]);
  assert.deepEqual(Object.keys(site.versions), ['en', 'de', 'fr', 'it', ...on]);
  assert.deepEqual(Object.keys(site.pilots.rows), off.map((ll) => `ch/${ll}`));
  off.forEach((ll) => {
    const root = `ch/${ll}`;
    assert.deepEqual(site.pilots.rows[root], {
      country: 'ch', lang: ll, hreflang: `${ll}-CH`, status: 'pilot', documents: 'own',
    });
    assert.equal(site.pilots.names[root], NAMES[root]);
    assert.equal(site.pilots.airports[root], 'ZRH');
    assert.equal(site.names[root], undefined);
    assert.equal(site.rows[root], undefined);
  });
  on.forEach((ll) => assert.equal(site.rows[`ch/${ll}`].status, 'live'));
});

test('on for a language: its root joins as ch/fr did (row, version, name, airport); the others stay pilots', () => {
  const es = withSwissLanguages(base, ['es']);
  assert.deepEqual(Object.keys(es.rows).filter((r) => es.rows[r].documents === 'own'), ['ch/en', 'ch/de', 'ch/fr', 'ch/it', 'ch/es']);
  assert.deepEqual(es.rows['ch/es'], {
    country: 'ch', lang: 'es', hreflang: 'es-CH', status: 'live', documents: 'own',
  });
  assert.equal(es.versions.es, 'ch/es');
  assert.equal(es.names['ch/es'], 'Suiza | Español');
  assert.equal(es.airports['ch/es'], 'ZRH');
  assert.deepEqual(Object.keys(es.pilots.rows), ['ch/pt', 'ch/zh', 'ch/ja', 'ch/el', 'ch/ru']);
  const ja = withSwissLanguages(base, ['ja']);
  assert.deepEqual(ja.rows['ch/ja'], {
    country: 'ch', lang: 'ja', hreflang: 'ja-CH', status: 'live', documents: 'own',
  });
  assert.equal(ja.names['ch/ja'], 'Switzerland | 日本語');
  const ru = withSwissLanguages(base, ['ru']);
  assert.deepEqual(ru.rows['ch/ru'], {
    country: 'ch', lang: 'ru', hreflang: 'ru-CH', status: 'live', documents: 'own',
  });
  assert.equal(ru.names['ch/ru'], 'Switzerland | Русский');
  const all = withSwissLanguages(base, Object.keys(SWISS_LANGUAGES));
  assert.deepEqual(all.pilots.rows, {});
  assert.equal(all.versions.zh, 'ch/zh');
  // with the markets' switch on too: the markets of the languages that are on only
  const markets = withSwissMarkets(withSwissLanguages(base, ['es']), true);
  assert.ok(Object.values(markets.rows).filter((r) => r.documents === 'language').every((r) => ['en', 'de', 'fr', 'it', 'es'].includes(r.lang)));
  assert.deepEqual(withSwissLanguages(base, []).rows, base.rows, 'all off: the rows as they are');
});

test('a pilot\'s page renders with its own row; the dialog, the links to it and the site\'s entry leave it out', async () => {
  const {
    getLocale, ownRoots, siteLocales, isMigratedLocale, getHomepageUrl, rootRedirectPath,
  } = await import('../scripts/locale.js');
  onPage(() => {
    off.forEach((ll) => {
      const root = `ch/${ll}`;
      const l = getLocale(`/${root}/fly/check-in`);
      assert.equal(l.key, root);
      assert.equal(l.lang, ll);
      assert.equal(l.base, `/${root}`);
      assert.equal(l.name, NAMES[root]);
      assert.equal(l.homeAirport, 'ZRH');
      assert.equal(l.brand, 'swiss');
      assert.equal(l.status, 'pilot');
      assert.equal(getLocale(`/content/${root}/homepage`).base, `/content/${root}`);
      assert.equal(siteLocales()[root].name, NAMES[root], 'the header\'s globe label');
      assert.ok(!ownRoots().some((r) => r.endsWith(`/${ll}`)), `no ${ll} roots in the dialog`);
      assert.equal(isMigratedLocale('ch', ll), false);
      assert.equal(getHomepageUrl('ch', ll), `${W}/${root}/homepage`);
    });
    on.forEach((ll) => assert.equal(getHomepageUrl('ch', ll), `/ch/${ll}/homepage`));
    assert.ok(['ch/en', 'ch/de', 'ch/fr', 'ch/it'].every((r) => ownRoots().includes(r)));
    assert.equal(isMigratedLocale('ch', 'fr'), true);
    assert.equal(getHomepageUrl('ch', 'it'), '/ch/it/homepage');
    assert.equal(rootRedirectPath(), '/ch/en/homepage');
    // a language SWISS has no root for: ch/en's, as before
    assert.equal(getLocale('/ch/ko/homepage').key, 'ch/en');
  });
});
