/* The locale of a brand site without <cc>/<ll> roots (scripts/locale.js brandSiteLocale,
   scripts/site-languages.js: Cargo, Air Dolomiti): the page's `language` metadata sets the
   interface language, English without it; pages under <cc>/<ll> roots and every other site
   (lh-com) keeps today's rule; Discover and ITA have their own roots (scripts/brands.js). Run: node --test test/*.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { getLocale, brandSiteLocale } from '../scripts/locale.js';
import { siteLanguagesOf } from '../scripts/site-languages.js';

/** A page with these meta tags as the document getLocale reads. */
const withPage = (metas, fn) => {
  const { document } = parseHTML(`<!DOCTYPE html><html><head>${Object.entries(metas).map(([k, v]) => `<meta name="${k}" content="${v}">`).join('')}</head><body></body></html>`);
  const saved = globalThis.document;
  globalThis.document = document;
  try {
    return fn();
  } finally {
    globalThis.document = saved;
  }
};
const pick = (l) => ({ lang: l.lang, key: l.key, base: l.base });

test('Cargo (no roots): the page\'s language metadata, English without it', () => {
  withPage({ brand: 'cargo', language: 'en' }, () => {
    assert.deepEqual(pick(getLocale('/en/speed-flash')), { lang: 'en', key: 'de/en', base: '/de/en' });
    assert.deepEqual(getLocale('/en/home').siteLanguages.map((l) => l.lang), ['en', 'de']);
  });
  withPage({ brand: 'cargo', language: 'de' }, () => {
    assert.deepEqual(pick(getLocale('/de/speed-flash')), { lang: 'de', key: 'de/de', base: '/de/de' });
    assert.equal(getLocale('/de/home').lang, 'de');
  });
  withPage({ brand: 'cargo' }, () => assert.equal(getLocale('/de/speed-flash').lang, 'en', 'no language metadata: English'));
  withPage({ brand: 'cargo', language: 'english' }, () => assert.equal(getLocale('/en/x').lang, 'en', 'not a language code: English'));
  // a two-letter path that looks like a root: the brand rule as well
  withPage({ brand: 'cargo', language: 'en' }, () => assert.equal(getLocale('/en/de').lang, 'en'));
  // the local dev server's /content prefix
  withPage({ brand: 'cargo', language: 'en' }, () => assert.equal(getLocale('/content/en/home').base, '/content/de/en'));
});

test('Air Dolomiti (no roots): Italian at the root, English and German from their metadata; no Italian locale row: Italian texts with the default locale\'s rest', () => {
  withPage({ brand: 'airdolomiti', language: 'it' }, () => assert.deepEqual(pick(getLocale('/')), { lang: 'it', key: 'de/de', base: '/de/de' }));
  withPage({ brand: 'airdolomiti', language: 'en' }, () => assert.equal(getLocale('/en/').lang, 'en'));
  withPage({ brand: 'airdolomiti', language: 'de' }, () => assert.equal(getLocale('/de/voli').lang, 'de'));
});

test('lh-com as today; Discover and ITA (roots): their own table (test/brand-locale.test.mjs), outside the roots their first root', () => {
  withPage({}, () => {
    assert.deepEqual(pick(getLocale('/de/en/baggage')), { lang: 'en', key: 'de/en', base: '/de/en' });
    assert.deepEqual(pick(getLocale('/index')), { lang: 'de', key: 'de/de', base: '/de/de' });
    assert.deepEqual(pick(getLocale('/xf/lh/x')), { lang: 'de', key: 'de/de', base: '/de/de' });
    assert.equal(getLocale('/en/speed-flash').siteLanguages, undefined);
  });
  withPage({ brand: 'discover', language: 'en' }, () => {
    assert.deepEqual(pick(getLocale('/de/en/homepage')), { lang: 'en', key: 'de/en', base: '/de/en' });
    assert.deepEqual(pick(getLocale('/index')), { lang: 'en', key: 'de/en', base: '/de/en' }, 'Discover has roots: its first, not the language rule');
  });
  withPage({ brand: 'ita', language: 'it' }, () => assert.deepEqual(pick(getLocale('/index')), { lang: 'en', key: 'it/en', base: '/it/en' }));
  // a brand site's page under a root (none today): the root's rule
  withPage({ brand: 'cargo', language: 'en' }, () => assert.equal(getLocale('/de/de/x').lang, 'de'));
});

test('without a document (lh-edge bundles locale.js): no brand rule', () => {
  const saved = globalThis.document;
  delete globalThis.document;
  try {
    assert.equal(brandSiteLocale(''), null);
    assert.equal(siteLanguagesOf(() => ''), null);
    assert.equal(getLocale('/en/speed-flash').key, 'de/de');
  } finally {
    globalThis.document = saved;
  }
});
