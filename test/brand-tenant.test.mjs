/* eslint-disable max-len */
/* The tenant of a brand page's /service/api calls (scripts/locale.js portalOf, labelTenant;
   scripts/lh-data.js portalHeaders; scripts/lh-api.js labelsRequest; the header's login call):
   www's X-Portal of the brand (Discover FOUR_Y, ITA ITA: their pages' meta X-Portal), the
   site of the root's country (Discover XX on xx roots, as its meta X-Portal-Site), the root's
   language; the label bundles under the brand's tenant. lh-com: LH as before.
   Run: node --max-old-space-size=512 --test test/brand-tenant.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'ita.turnsthe.page', pathname: '/it/it/homepage', search: '', href: 'https://ita.turnsthe.page/it/it/homepage', origin: 'https://ita.turnsthe.page',
};
globalThis.window = window;
const { portalHeaders } = await import('../scripts/lh-data.js');
const { labelsRequest } = await import('../scripts/lh-api.js');
const { getLocale, portalOf, labelTenant } = await import('../scripts/locale.js');

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
const headers = (portal, site, lang) => ({
  'X-Portal': portal, 'X-Portal-Site': site, 'X-Portal-Language': lang, 'X-Portal-Taxonomy': '', 'X-Portal-CountryId': '',
});

test('portalHeaders: the brand\'s portal, the root\'s country and language', () => {
  assert.deepEqual(onPage({ brand: 'ita' }, () => portalHeaders('it/it')), headers('ITA', 'IT', 'it'));
  assert.deepEqual(onPage({ brand: 'ita' }, () => portalHeaders('jp/ja')), headers('ITA', 'JP', 'ja'));
  assert.deepEqual(onPage({ brand: 'discover' }, () => portalHeaders('xx/fr')), headers('FOUR_Y', 'XX', 'fr'), 'Discover\'s meta X-Portal-Site XX');
  assert.deepEqual(onPage({ brand: 'discover' }, () => portalHeaders('de/en')), headers('FOUR_Y', 'DE', 'en'));
  assert.deepEqual(onPage({ brand: 'ita' }, () => portalHeaders('nowhere')), {}, 'not a root of the site');
});

test('lh-com (no brand), and the brands without a portal: LH, as before', () => {
  ['de/en', 'de/de', 'at/de', 'gb/en', 'ch/de'].forEach((m) => {
    const row = m.split('/');
    assert.deepEqual(onPage({}, () => portalHeaders(m)), headers('LH', row[0].toUpperCase(), row[1]), m);
    assert.deepEqual(portalHeaders(m), headers('LH', row[0].toUpperCase(), row[1]), `${m} without a page`);
  });
  assert.deepEqual(onPage({ brand: 'cargo' }, () => portalHeaders('de/en')), headers('LH', 'DE', 'en'));
  assert.deepEqual(onPage({}, () => portalHeaders('it/it')), {}, 'not a locale of lh-com: none, as before');
  assert.equal(portalOf({ country: 'de', lang: 'en' }), 'LH');
  assert.equal(labelTenant({ country: 'de', lang: 'en' }), 'lh');
});

test('labelsRequest: the bundle under the brand\'s tenant; lh-com\'s lh', () => {
  const ita = onPage({ brand: 'ita' }, () => getLocale('/it/it/homepage'));
  assert.equal(portalOf(ita), 'ITA');
  assert.deepEqual(labelsRequest('flightmanager', ita), { method: 'GET', route: '/service/api/labels/flightmanager/ita/it' });
  const discover = onPage({ brand: 'discover' }, () => getLocale('/xx/fr/homepage'));
  assert.deepEqual(labelsRequest('flightmanager', discover), { method: 'GET', route: '/service/api/labels/flightmanager/four_y/fr' });
  const lh = onPage({}, () => getLocale('/de/en/homepage'));
  assert.deepEqual(labelsRequest('flightmanager', lh), { method: 'GET', route: '/service/api/labels/flightmanager/lh/en' });
  assert.deepEqual(labelsRequest('common', { lang: 'de' }), { method: 'GET', route: '/service/api/labels/common/lh/de' });
});

test('the header\'s login call sends the page\'s portal', () => {
  const src = fs.readFileSync(new URL('../blocks/header/header.js', import.meta.url), 'utf8');
  assert.match(src, /'X-Portal': portalOf\(locale\), 'X-Portal-Site': locale\.country\.toUpperCase\(\), 'X-Portal-Language': locale\.lang,/);
});
