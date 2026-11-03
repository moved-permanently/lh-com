/* TAP Air Portugal on lh-com's code (brief 312; DA moved-permanently/lh-tap, www.flytap.com): the
   brand entry tap (scripts/brands.js) and its <ll>-<cc> roots (scripts/site-languages.js; a site
   without /<cc>/<ll>/ roots, as Air Dolomiti): /pt-pt first, /en-pt, later /es-es, /fr-fr, /de-de,
   /it-it, /pl-pl. A page's language, country, hreflang and base (its nav and footer) from its
   root; the header's language switch lists the roots the site has pages of. Booking, check-in,
   sign-in, search, forms, fares and chat stay links to www.flytap.com: no hand-off, no Travel ID,
   no Message Center tenant, no embeds; no consent manager (www.flytap.com's pages load none of
   their own, only Google Tag Manager, which the replica doesn't run). Air Dolomiti, Cargo and
   lh-com as before. Run: node --max-old-space-size=512 --test test/tap-brand.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { BRANDS, BRAND_SITES } from '../scripts/brands.js';
import {
  getLocale, siteOrigin, rootRedirectPath, brandEntry,
} from '../scripts/locale.js';
import {
  SITE_LANGUAGES, languageOfPath, languageSwitch, counterpartPath,
} from '../scripts/site-languages.js';
import {
  brandName, oneTrustId, isOwnWwwHost,
} from '../scripts/brand.js';
import { turnsThePageBrandOf, isTurnsThePageHost } from '../scripts/demo.js';

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
const read = (meta) => (n) => meta[n] || '';
const tap = read({ brand: 'tap' });
const pick = (l) => ({
  lang: l.lang, country: l.country, hreflang: l.hreflang, base: l.base,
});

test('the brand entry: name, www, and none of the live systems (links to www.flytap.com), no consent manager', () => {
  assert.equal(BRANDS.tap.name, 'TAP Air Portugal');
  assert.equal(BRANDS.tap.www, 'www.flytap.com');
  ['oneTrust', 'consentLinks', 'messageCenter', 'booking', 'travelId', 'embeds', 'serviceOrigin', 'backends', 'portal', 'aemContent', 'accessibility', 'notifications', 'destinationImages', 'theme']
    .forEach((k) => assert.equal(BRANDS.tap[k], undefined, k));
  assert.equal(BRAND_SITES.tap, undefined, 'no <cc>/<ll> roots');
  assert.equal(brandName(tap), 'TAP Air Portugal');
  assert.equal(oneTrustId(tap), '', 'no consent banner');
  assert.equal(siteOrigin(tap), 'https://www.flytap.com');
  assert.ok(isOwnWwwHost('www.flytap.com', tap));
  assert.ok(!isOwnWwwHost('www.airdolomiti.it', tap));
  withPage({ brand: 'tap' }, () => assert.equal(brandEntry(), BRANDS.tap));
});

// the others join the switch when their pages are imported
test('its roots: <ll>-<cc>, pt-pt first; the switch lists pt-pt and en-pt', () => {
  const roots = SITE_LANGUAGES.tap;
  assert.deepEqual(roots.map((l) => [l.lang, l.country, l.path, l.home]), [
    ['pt', 'pt', '/pt-pt/', '/pt-pt'], ['en', 'pt', '/en-pt/', '/en-pt'], ['es', 'es', '/es-es/', '/es-es'], ['fr', 'fr', '/fr-fr/', '/fr-fr'],
    ['de', 'de', '/de-de/', '/de-de'], ['it', 'it', '/it-it/', '/it-it'], ['pl', 'pl', '/pl-pl/', '/pl-pl']]);
  assert.deepEqual(roots.filter((l) => l.listed !== false).map((l) => l.path), ['/pt-pt/', '/en-pt/']);
  assert.equal(languageOfPath('/pt-pt', roots).lang, 'pt');
  assert.equal(languageOfPath('/en-pt/book', roots).lang, 'en');
  assert.equal(languageOfPath('/pt-ptx', roots), null);
  // a homepage's counterpart: the other root's homepage; a page: its path under the other root
  assert.equal(counterpartPath('/pt-pt', roots[0], roots[1]), '/en-pt');
  assert.equal(counterpartPath('/pt-pt/bagagem', roots[0], roots[1]), '/en-pt/bagagem');
  const { links } = languageSwitch([], '/pt-pt/bagagem', 'pt', roots);
  assert.deepEqual(links.map((l) => [l.lang, l.home, l.counterpart]), [['en', '/en-pt', '/en-pt/bagagem']]);
  assert.deepEqual(languageSwitch([], '/en-pt', 'en', roots).links.map((l) => l.home), ['/pt-pt']);
});

test('a page\'s locale from its root: language, country, hreflang <ll>-<CC>, base the root (its nav and footer)', () => {
  withPage({ brand: 'tap' }, () => {
    assert.deepEqual(pick(getLocale('/pt-pt')), {
      lang: 'pt', country: 'pt', hreflang: 'pt-PT', base: '/pt-pt',
    });
    assert.deepEqual(pick(getLocale('/en-pt/flights/lisbon')), {
      lang: 'en', country: 'pt', hreflang: 'en-PT', base: '/en-pt',
    });
    assert.deepEqual(pick(getLocale('/es-es/vuelos')), {
      lang: 'es', country: 'es', hreflang: 'es-ES', base: '/es-es',
    }, 'a root not listed yet resolves too');
    assert.deepEqual(pick(getLocale('/content/pl-pl/x')), {
      lang: 'pl', country: 'pl', hreflang: 'pl-PL', base: '/content/pl-pl',
    }, 'the local dev server\'s /content prefix');
    assert.equal(getLocale('/pt-pt/x').siteLanguages, SITE_LANGUAGES.tap);
    // outside the roots (/nav, a fragment): the first root
    assert.deepEqual(pick(getLocale('/fragments/x')), {
      lang: 'pt', country: 'pt', hreflang: 'pt-PT', base: '/pt-pt',
    });
  });
  // the path decides, not the language metadata
  withPage({ brand: 'tap', language: 'en' }, () => assert.equal(getLocale('/pt-pt/x').lang, 'pt'));
});

test('/ on a demo host: the first root\'s homepage (lh-edge answers / with the same 302 in production)', () => {
  assert.equal(rootRedirectPath(tap), '/pt-pt');
  assert.equal(rootRedirectPath(read({ brand: 'airdolomiti' })), '', 'Air Dolomiti: its homepage is /');
  assert.equal(rootRedirectPath(read({ brand: 'cargo' })), '', 'Cargo: as before');
  assert.equal(rootRedirectPath(read({})), '/de/de/homepage');
});

test('Air Dolomiti, Cargo and lh-com as before', () => {
  const pickOld = (l) => ({
    lang: l.lang, key: l.key, base: l.base, country: l.country,
  });
  withPage({ brand: 'airdolomiti', language: 'en' }, () => assert.deepEqual(pickOld(getLocale('/en/voli')), {
    lang: 'en', key: 'de/en', base: '/de/en', country: 'de',
  }));
  withPage({ brand: 'airdolomiti', language: 'it' }, () => assert.deepEqual(pickOld(getLocale('/')), {
    lang: 'it', key: 'de/de', base: '/de/de', country: 'de',
  }));
  withPage({ brand: 'cargo' }, () => assert.equal(getLocale('/de/home').lang, 'en', 'no language metadata: English, as before'));
  withPage({}, () => assert.deepEqual(pickOld(getLocale('/de/en/baggage')), {
    lang: 'en', key: 'de/en', base: '/de/en', country: 'de',
  }));
  assert.ok(SITE_LANGUAGES.airdolomiti.every((l) => !l.country && l.listed === undefined));
});

test('tap.turnsthe.page is a brand host', () => {
  assert.equal(turnsThePageBrandOf('tap.turnsthe.page'), 'tap');
  assert.ok(isTurnsThePageHost('tap.turnsthe.page'));
});
