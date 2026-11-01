/* The Message Center on the brand sites without <cc>/<ll> roots (Lufthansa Cargo: /en/, /de/; Air
   Dolomiti: Italian at /, /en/, /de/): their tenants (scripts/brands.js messageCenter cargo,
   airdolomiti), the page's language from its `language` metadata, else its first path segment (the
   site's languages), no market (messages for all markets only), the current travel information
   page per language (cti-pages.json rows with a `language` column: Air Dolomiti's slugs differ per
   language). lh-com's /{cc}/{ll}/ pages, ITA's and Austrian's as before.
   Run: node --max-old-space-size=512 --test test/message-center-brand-sites.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
const at = (pathname, meta = {}) => {
  window.location = {
    hostname: 'main--lh-airdolomiti--moved-permanently.aem.page', pathname, search: '', hash: '', replace: () => {}, href: `https://main--lh-airdolomiti--moved-permanently.aem.page${pathname}`, origin: 'https://main--lh-airdolomiti--moved-permanently.aem.page',
  };
  document.head.innerHTML = Object.entries(meta).map(([k, v]) => `<meta name="${k}" content="${v}">`).join('');
};
at('/');
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;

const { BRANDS } = await import('../scripts/brands.js');
const { getLocale } = await import('../scripts/locale.js');
const {
  messageLocale, messageHref, selectMessages, siteTenant,
} = await import('../scripts/message-center.js');

const NOW = Date.parse('2026-09-29T09:00:00.000Z');
const row = (path, fields = {}) => ({
  path, headline: `Headline ${path}`, criticality: 'high', tenants: ['airdolomiti'], markets: [], touchpoints: ['web'], link: '', details: '', from: '', to: '', push: 'false', 'internal-title': '', lastModified: 1792900000, ...fields,
});
// www.airdolomiti.it's navbar alert (2026-09-30 strike, its three languages) as messages
const AD = [
  row('/message-center/irreg/strike-2026-09-30/it', { headline: 'Possibili cancellazioni per sciopero nazionale ENAV mercoledì 30 settembre' }),
  row('/message-center/irreg/strike-2026-09-30/en', { headline: 'Possible flight cancellations due to the national strike in Italy on Wednesday, September 30, 2026' }),
  row('/message-center/irreg/strike-2026-09-30/de', { headline: 'Mögliche Flugausfälle aufgrund des landesweiten Streiks in Italien am Mittwoch, dem 30. September 2026' }),
  row('/message-center/irreg/only-for-italy/it', { markets: ['it'] }),
  row('/message-center/irreg/lufthansa/en', { tenants: ['lh'] }),
];
const AD_CTI = [
  { tenant: 'airdolomiti', language: 'it', webPath: '/informazioni-aggiornate' },
  { tenant: 'airdolomiti', language: 'en', webPath: '/en/current-flight-information' },
  { tenant: 'airdolomiti', language: 'de', webPath: '/de/fluginformationen' },
];

test('brands.js: tenants cargo and airdolomiti; the others as before', () => {
  assert.equal(BRANDS.cargo.messageCenter, 'cargo');
  assert.equal(BRANDS.airdolomiti.messageCenter, 'airdolomiti');
  assert.equal(BRANDS.ita.messageCenter, 'ita');
  assert.equal(BRANDS.discover.messageCenter, 'four_y');
  assert.equal(BRANDS.austrian.messageCenter, 'os');
  at('/', { brand: 'airdolomiti' });
  assert.equal(siteTenant(), 'airdolomiti');
  at('/en/home', { brand: 'cargo' });
  assert.equal(siteTenant(), 'cargo');
  at('/de/en/homepage');
  assert.equal(siteTenant(), 'lh');
});

test('messageLocale: a site without roots: the language from the metadata, else the first path segment; no market', () => {
  const cases = [
    ['/', { brand: 'airdolomiti' }, 'it'],
    ['/informazioni-aggiornate', { brand: 'airdolomiti' }, 'it'],
    ['/en/', { brand: 'airdolomiti' }, 'en'],
    ['/en/current-flight-information', { brand: 'airdolomiti' }, 'en'],
    ['/de/fluginformationen', { brand: 'airdolomiti' }, 'de'],
    ['/en/home', { brand: 'cargo' }, 'en'],
    ['/de/home', { brand: 'cargo' }, 'de'],
    ['/', { brand: 'airdolomiti', language: 'en' }, 'en'],
    ['/en/x', { brand: 'cargo', language: 'de' }, 'de'],
  ];
  cases.forEach(([path, meta, lang]) => {
    at(path, meta);
    const locale = messageLocale();
    assert.equal(locale.lang, lang, `${path} ${JSON.stringify(meta)}`);
    assert.equal(locale.country, '', 'no market');
  });
});

test('messageLocale: lh-com, ITA and Austrian pages: getLocale() as it is', () => {
  [
    ['/de/en/homepage', {}], ['/at/de/fluege', {}], ['/it/it/homepage', { brand: 'ita' }], ['/at/en/homepage', { brand: 'austrian' }],
  ].forEach(([path, meta]) => {
    at(path, meta);
    assert.deepEqual(messageLocale(), getLocale(), path);
  });
});

test('selectMessages on Air Dolomiti: its tenant, the page\'s language, messages for all markets', () => {
  at('/', { brand: 'airdolomiti' });
  const it = messageLocale();
  const list = selectMessages(AD, { market: it.country, lang: it.lang, now: NOW });
  assert.deepEqual(list.map((m) => `${m.id}/${m.lang}`), ['strike-2026-09-30/it']);
  at('/de/', { brand: 'airdolomiti' });
  const de = messageLocale();
  assert.deepEqual(selectMessages(AD, { market: de.country, lang: de.lang, now: NOW }).map((m) => m.lang), ['de']);
});

test('messageHref: a cti-pages row per language wins; rows without one as before', () => {
  const msg = { id: 'strike-2026-09-30', link: '' };
  at('/', { brand: 'airdolomiti' });
  assert.equal(messageHref(msg, AD_CTI, messageLocale()), '/informazioni-aggiornate#strike-2026-09-30');
  at('/en/', { brand: 'airdolomiti' });
  assert.equal(messageHref(msg, AD_CTI, messageLocale()), '/en/current-flight-information#strike-2026-09-30');
  at('/de/', { brand: 'airdolomiti' });
  assert.equal(messageHref(msg, AD_CTI, messageLocale()), '/de/fluginformationen#strike-2026-09-30');
  // a language without a row of its own: the tenant's row without a language
  const withDefault = [...AD_CTI.slice(1), { tenant: 'airdolomiti', webPath: '/{ll}/travel' }];
  at('/', { brand: 'airdolomiti' });
  assert.equal(messageHref(msg, withDefault, messageLocale()), '/it/travel#strike-2026-09-30');
  // lh-com's sheet (no language column): unchanged
  const LH = [{ tenant: 'lh', webPath: '/{cc}/{ll}/prepare-for-your-trip/current-travel-information' }, { tenant: 'lx', webPath: '' }];
  at('/de/en/homepage');
  assert.equal(messageHref(msg, LH, getLocale()), '/de/en/prepare-for-your-trip/current-travel-information#strike-2026-09-30');
  // a row in another language only: no link
  at('/de/', { brand: 'airdolomiti' });
  assert.equal(messageHref(msg, AD_CTI.slice(0, 1), messageLocale()), '');
});

test('flash-teaser on Air Dolomiti\'s Italian homepage: the Italian notice, linked to its travel information page', async () => {
  at('/', { brand: 'airdolomiti' });
  globalThis.fetch = async (url) => {
    const json = (data) => new Response(JSON.stringify({ data }), { headers: { 'content-type': 'application/json' } });
    if (String(url).startsWith('/message-center/index.json')) return json(AD.map((r) => ({ ...r, from: '2026-01-01T00:00:00.000Z' })));
    if (String(url).startsWith('/message-center/config/cti-pages.json')) return json(AD_CTI);
    return new Response('{}', { status: 404 });
  };
  const { default: decorate } = await import('../blocks/flash-teaser/flash-teaser.js');
  const block = document.createElement('div');
  block.className = 'flash-teaser';
  document.body.replaceChildren(block);
  await decorate(block);
  const links = [...block.querySelectorAll('.flash-teaser-link')];
  assert.equal(links.length, 1);
  assert.equal(links[0].getAttribute('href'), '/informazioni-aggiornate#strike-2026-09-30');
  assert.match(links[0].textContent, /sciopero nazionale ENAV/);
});

test('Brussels: tenant sn (www\'s), its current travel information page from lh-brussels\' cti-pages row', () => {
  assert.equal(BRANDS.brussels.messageCenter, 'sn');
  at('/be/fr/homepage', { brand: 'brussels' });
  assert.equal(siteTenant(), 'sn');
  const SN = [{ tenant: 'sn', webPath: '/{cc}/{ll}/plan-your-trip/flight-information', contentPath: '/content/bel/gc/en/plan-your-trip/flight-information' }];
  assert.equal(messageHref({ id: 'strike', link: '' }, SN, getLocale()), '/be/fr/plan-your-trip/flight-information#strike');
  // a message for sn only: shown on Brussels' pages, not on lh-com's
  const rows = [row('/message-center/irreg/sn-only/en', { tenants: ['sn'], markets: [] })];
  at('/be/en/homepage', { brand: 'brussels' });
  assert.equal(selectMessages(rows, { market: 'be', lang: 'en', now: NOW }).length, 1);
  at('/de/en/homepage');
  assert.equal(selectMessages(rows, { market: 'de', lang: 'en', now: NOW }).length, 0);
});
