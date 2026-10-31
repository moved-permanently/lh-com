/* eslint-disable max-len */
/* Austrian Airlines as a full brand (scripts/brands.js, the values of www.austrian.com's snapshots of
   2026-10-30): portal OS (its pages' meta X-Portal; X-Portal-Site the root's country), hub VIE (the
   at roots' origin), airline OS (the flight status' selected airline), the fallback banner's links
   per language (each own root's footer: Datenschutz, Imprint; the Cookie Policy /browser-cookies its
   data protection page links). Run: node --max-old-space-size=512 --test test/brand-austrian.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'austrian.turnsthe.page', pathname: '/at/de/homepage', search: '', href: 'https://austrian.turnsthe.page/at/de/homepage', origin: 'https://austrian.turnsthe.page',
};
window.hlx = { codeBasePath: '' };
Object.defineProperty(window, 'origin', { value: 'https://austrian.turnsthe.page', configurable: true });
globalThis.window = window;
const { BRANDS } = await import('../scripts/brands.js');
const { portalHeaders } = await import('../scripts/lh-data.js');
const { labelsRequest } = await import('../scripts/lh-api.js');
const { getLocale } = await import('../scripts/locale.js');
const { bannerLinks } = await import('../scripts/consent-banner.js');

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
const aua = (fn) => onPage({ brand: 'austrian' }, fn);
const W = 'https://www.austrian.com';

test('the entry: portal, hub and airline from www\'s pages', () => {
  assert.equal(BRANDS.austrian.portal, 'OS');
  assert.equal(BRANDS.austrian.hub, 'VIE');
  assert.equal(BRANDS.austrian.airline, 'OS');
  assert.equal(BRANDS.austrian.messageCenter, 'os', 'the Austrian session\'s, unchanged');
});

test('an Austrian page: X-Portal OS, the root\'s site and language; its label bundles', () => {
  assert.deepEqual(aua(() => portalHeaders('at/de')), {
    'X-Portal': 'OS', 'X-Portal-Site': 'AT', 'X-Portal-Language': 'de', 'X-Portal-Taxonomy': '', 'X-Portal-CountryId': '',
  });
  assert.equal(aua(() => portalHeaders('cn/zh'))['X-Portal-Site'], 'CN');
  assert.deepEqual(labelsRequest('flightmanager', aua(() => getLocale('/ru/ru/homepage'))), { method: 'GET', route: '/service/api/labels/flightmanager/os/ru' });
  assert.equal(aua(() => getLocale('/at/de/homepage')).homeAirport, 'VIE');
});

test('the fallback banner\'s links: the language\'s own pages on www.austrian.com', () => {
  assert.deepEqual(aua(() => bannerLinks('en')).map(([, h]) => h), [`${W}/at/en/datenschutz`, `${W}/at/en/browser-cookies`, `${W}/at/en/imprint`]);
  assert.deepEqual(aua(() => bannerLinks('de')).map(([, h]) => h), [`${W}/at/de/datenschutz`, `${W}/at/de/browser-cookies`, `${W}/at/de/impressum`]);
  assert.deepEqual(aua(() => bannerLinks('ru')).map(([, h]) => h), [`${W}/ru/ru/datenschutz`, `${W}/ru/ru/browser-cookies`, `${W}/ru/ru/imprint`]);
  assert.deepEqual(aua(() => bannerLinks('zh')).map(([, h]) => h), [`${W}/cn/zh/datenschutz`, `${W}/cn/zh/browser-cookies`, `${W}/cn/zh/imprint`]);
  ['fr/fr', 'it/it', 'es/es', 'gr/el', 'jp/ja', 'pl/pl'].forEach((root) => {
    const lang = root.split('/')[1];
    assert.deepEqual(aua(() => bannerLinks(lang)).map(([, h]) => h), [`${W}/${root}/datenschutz`, `${W}/${root}/browser-cookies`, `${W}/${root}/imprint`], root);
  });
});
