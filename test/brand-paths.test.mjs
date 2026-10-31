/* eslint-disable max-len */
/* The smaller paths that assumed Lufthansa, on a brand page (scripts/brand.js isSitePreviewHost,
   siteTitleSuffix; scripts/brands.js consentLinks): the fallback cookie banner's privacy links
   (the brand's www pages), the data layer's title without " | <brand>", the car-rental fallback
   on the brand's www, the breadcrumb's and related-articles' own preview host (lh-<brand>).
   lh-com exactly as before. Run: node --max-old-space-size=512 --test test/brand-paths.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'ita.turnsthe.page', pathname: '/it/en/car-rental', search: '', href: 'https://ita.turnsthe.page/it/en/car-rental', origin: 'https://ita.turnsthe.page',
};
window.hlx = { codeBasePath: '' };
Object.defineProperty(window, 'origin', { value: 'https://ita.turnsthe.page', configurable: true });
globalThis.window = window;
const { isSitePreviewHost, siteTitleSuffix } = await import('../scripts/brand.js');
const { bannerLinks } = await import('../scripts/consent-banner.js');
const { buildLhgData } = await import('../scripts/data-layer.js');
const { readCarRentalSettings } = await import('../blocks/car-rental/car-rental.js');
const { getLocale } = await import('../scripts/locale.js');

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

test('the fallback banner\'s privacy links: the brand\'s www pages; lh-com\'s as before', () => {
  const lhEn = onPage({}, () => bannerLinks('en'));
  assert.deepEqual(lhEn.map(([, h]) => h), ['https://www.lufthansa.com/xx/en/data-protection-information?hidebanner=true', 'https://www.lufthansa.com/xx/en/cookie-policy?hidebanner=true', 'https://www.lufthansa.com/xx/en/imprint?hidebanner=true']);
  assert.equal(onPage({}, () => bannerLinks('de'))[2][1], 'https://www.lufthansa.com/de/de/impressum?hidebanner=true');
  const ita = onPage({ brand: 'ita' }, () => bannerLinks('en'));
  assert.deepEqual(ita.map(([, h]) => h), ['https://www.ita-airways.com/xy/en/legal/data-protection-overview/data-protection-ita?hidebanner=true', 'https://www.ita-airways.com/xy/en/legal/cookie-policy?hidebanner=true', 'https://www.ita-airways.com/xy/en/legal/imprint?hidebanner=true']);
  assert.deepEqual(ita.map(([l]) => l), lhEn.map(([l]) => l), 'the banner\'s own labels');
  assert.deepEqual(onPage({ brand: 'discover' }, () => bannerLinks('de')).map(([, h]) => h), ['https://www.discover-airlines.com/de/de/legal/data-protection-information', 'https://www.discover-airlines.com/de/de/legal/imprint']);
  assert.deepEqual(onPage({ brand: 'discover' }, () => bannerLinks('fr')).map(([, h]) => h), ['https://www.discover-airlines.com/de/en/legal/data-protection-information', 'https://www.discover-airlines.com/de/en/legal/imprint'], 'other languages: the English pages');
  assert.deepEqual(onPage({ brand: 'cargo' }, () => bannerLinks('en')), lhEn, 'a brand without its own: as before');
});

test('the data layer\'s title: without " | <brand>"; lh-com\'s as before', () => {
  const data = (title, meta) => onPage(meta, () => buildLhgData({
    pathname: '/it/en/x', title, country: 'it', language: 'en',
  }).page.attributes.htmlTitle);
  assert.equal(data('Baggage | Lufthansa', {}), 'Baggage');
  assert.equal(data('Bagagli | ITA Airways', { brand: 'ita' }), 'Bagagli');
  assert.equal(data('Ocean Blue | Discover Airlines', { brand: 'discover' }), 'Ocean Blue');
  assert.equal(data('Baggage | ITA Airways', {}), 'Baggage | ITA Airways', 'lh-com strips only its own');
  assert.equal(onPage({}, () => String(siteTitleSuffix())), String(/ \| Lufthansa$/));
});

test('car rental: the fallback on the brand\'s www; lh-com\'s on www.lufthansa.com', () => {
  const settings = (meta) => onPage(meta, () => readCarRentalSettings({}, getLocale('/it/en/car-rental'), '/it/en/car-rental'));
  assert.equal(settings({ brand: 'ita' }).liveUrl, 'https://www.ita-airways.com/it/en/car-rental');
  assert.equal(settings({}).liveUrl, 'https://www.lufthansa.com/it/en/car-rental');
  const src = fs.readFileSync(new URL('../blocks/car-rental/car-rental.js', import.meta.url), 'utf8');
  assert.match(src, /labels\['live hint'\]\.replace\('lufthansa\.com', brand\.www\.replace\(\/\^www\\\.\/, ''\)\)/);
});

test('breadcrumb and related articles: the site\'s own preview repo', () => {
  assert.ok(onPage({}, () => isSitePreviewHost('main--lh-com--moved-permanently.aem.page')));
  assert.ok(onPage({}, () => isSitePreviewHost('branch--lh-com--moved-permanently.aem.live')));
  assert.ok(!onPage({}, () => isSitePreviewHost('main--lh-ita--moved-permanently.aem.page')), 'lh-com: not ITA\'s');
  assert.ok(onPage({ brand: 'ita' }, () => isSitePreviewHost('main--lh-ita--moved-permanently.aem.page')));
  assert.ok(!onPage({ brand: 'ita' }, () => isSitePreviewHost('main--lh-com--moved-permanently.aem.page')));
  assert.ok(onPage({ brand: 'discover' }, () => isSitePreviewHost('main--lh-discover--moved-permanently.aem.live')));
  ['blocks/breadcrumb/breadcrumb.js', 'blocks/related-articles/related-articles.js'].forEach((f) => {
    const src = fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8');
    assert.doesNotMatch(src, /const SITE_HOST = /, f);
    assert.match(src, /isSitePreviewHost\(url\.hostname\)/, f);
  });
});
