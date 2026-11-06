/* A brand site's language rule does not follow lh-com's market go-live (scripts/locale.js
   brandSiteLocale; tools/reports/markets/go-live.md): Cargo, Air Dolomiti and TAP (the brands of
   scripts/site-languages.js) look a page's language up among the four roots with documents of their
   own that were live before the waves (de/en, de/de, at/de, gb/en), else de/de, as before wave 11,
   whichever market waves and language versions (xx/fr, xx/es, ...) are live.
   Run: node --test test/brand-site-locale-waves.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { getLocale } from '../scripts/locale.js';

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
const pick = (l) => ({
  lang: l.lang, key: l.key, root: l.root, shopLang: l.shopLang, timeZone: l.timeZone,
});
const DE_DE = {
  key: 'de/de', root: 'de/de', shopLang: getLocale('/de/de/homepage').shopLang, timeZone: getLocale('/de/de/homepage').timeZone,
};

test('Cargo (no roots): es, fr, it and pt take de/de\'s row, en de/en\'s, de de/de\'s', () => {
  ['es', 'fr', 'it', 'pt'].forEach((lang) => withPage({ brand: 'cargo', language: lang }, () => {
    assert.deepEqual(pick(getLocale(`/${lang}/home`)), { lang, ...DE_DE }, lang);
    assert.equal(getLocale(`/${lang}/home`).base, '/de/de', lang);
  }));
  withPage({ brand: 'cargo', language: 'en' }, () => assert.equal(getLocale('/en/home').key, 'de/en'));
  withPage({ brand: 'cargo', language: 'de' }, () => assert.equal(getLocale('/de/home').key, 'de/de'));
});

test('Air Dolomiti (no roots): Italian takes de/de\'s row', () => {
  withPage({ brand: 'airdolomiti', language: 'it' }, () => assert.deepEqual(pick(getLocale('/')), { lang: 'it', ...DE_DE }));
});

test('TAP (roots): its es, fr, pt, it and pl roots take de/de\'s row and keep their own country', () => {
  [['/es-es/vuelos', 'es', 'es'], ['/fr-fr', 'fr', 'fr'], ['/pt-pt', 'pt', 'pt'], ['/pt-br', 'pt', 'br'], ['/it-it', 'it', 'it'], ['/pl-pl', 'pl', 'pl']].forEach(([path, lang, country]) => withPage({ brand: 'tap' }, () => {
    const l = getLocale(path);
    assert.deepEqual(pick(l), { lang, ...DE_DE }, path);
    assert.equal(l.country, country, path);
  }));
  withPage({ brand: 'tap' }, () => assert.equal(getLocale('/en-us').key, 'de/en'));
});
