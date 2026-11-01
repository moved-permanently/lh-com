/* eslint-disable max-len */
/* Brussels Airlines (lh-brussels) as a brand: the values of www.brusselsairlines.com's be/en and
   be/fr homepages (2026-10-31): OneTrust id, portal SN (meta X-Portal), hub BRU (the fare widgets'
   origin), airline SN, the fare widgets' destination images, the cookie banner's links (xx/en,
   xx/fr), the favicon and manifest at www's paths; the theme styles/themes/brussels.css: tokens and
   the Intelo faces of the design system's brussels.css (mausy-v1.40.1, the same file as v1.38.0).
   Run: node --max-old-space-size=512 --test test/brand-brussels.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'brussels.turnsthe.page', pathname: '/be/en/homepage', search: '', href: 'https://brussels.turnsthe.page/be/en/homepage', origin: 'https://brussels.turnsthe.page',
};
window.hlx = { codeBasePath: '' };
Object.defineProperty(window, 'origin', { value: 'https://brussels.turnsthe.page', configurable: true });
globalThis.window = window;
const {
  BRANDS, brandOf, brandName, oneTrustId, brandIcons, destinationImageBase, brandWwwHost, isOwnWwwHost, isSitePreviewHost,
} = await import('../scripts/brand.js');
const { portalHeaders } = await import('../scripts/lh-data.js');
globalThis.brandSites = await import('../scripts/brands.js');
const { bannerLinks } = await import('../scripts/consent-banner.js');

const meta = (values) => (name) => values[name] || '';
const bru = meta({ brand: 'brussels' });
const W = 'https://www.brusselsairlines.com';

function onPage(values, fn) {
  const rows = Object.entries(values).map(([k, v]) => `<meta name="${k}" content="${v}">`).join('');
  const { document } = parseHTML(`<!DOCTYPE html><html><head>${rows}</head><body></body></html>`);
  globalThis.document = document;
  try {
    return fn();
  } finally {
    delete globalThis.document;
  }
}

test('the entry: name, OneTrust, www, portal, hub, airline, destination images', () => {
  assert.equal(brandOf(bru), 'brussels');
  assert.equal(brandName(bru), 'Brussels Airlines');
  assert.equal(oneTrustId(bru), '01994cb3-c7a3-7096-82a3-ae642c99e85e');
  assert.equal(brandWwwHost(bru), 'www.brusselsairlines.com');
  assert.ok(isOwnWwwHost('www.brusselsairlines.com', bru));
  assert.ok(isSitePreviewHost('main--lh-brussels--moved-permanently.aem.page', bru));
  assert.equal(destinationImageBase(bru), '/content/dam/bel/images/offers/destination');
  assert.equal(BRANDS.brussels.portal, 'SN');
  assert.equal(BRANDS.brussels.hub, 'BRU');
  assert.equal(BRANDS.brussels.airline, 'SN');
  assert.equal(BRANDS.brussels.messageCenter, 'sn', 'www\'s Message Center tenant');
  // the X-Portal of a root comes from its row (BRAND_SITES.brussels)
  assert.equal(onPage({ brand: 'brussels' }, () => portalHeaders('be/en'))['X-Portal'], 'SN');
  assert.equal(onPage({ brand: 'brussels' }, () => portalHeaders('sn/fr'))['X-Portal-Site'], 'SN', 'Senegal: the country, not the tenant');
});

test('the roots: six reference roots with their own documents, 92 market roots from their language, no xx', () => {
  const { BRAND_SITES } = globalThis.brandSites;
  const site = BRAND_SITES.brussels;
  assert.equal(Object.keys(site.rows).length, 98);
  assert.deepEqual(Object.keys(site.rows).filter((r) => site.rows[r].documents === 'own'), ['be/en', 'be/fr', 'be/nl', 'de/de', 'it/it', 'es/es']);
  assert.deepEqual(site.versions, {
    en: 'be/en', fr: 'be/fr', nl: 'be/nl', de: 'de/de', it: 'it/it', es: 'es/es',
  });
  assert.ok(!Object.keys(site.rows).some((r) => r.startsWith('xx/')));
  Object.keys(site.rows).forEach((r) => assert.ok(site.names[r], `name ${r}`));
  assert.equal(site.names['be/en'], 'Belgium | English');
  assert.equal(site.names['sn/fr'], 'Senegal | Français', 'www\'s French selector writes Senegal');
});

test('the cookie banner\'s links: www\'s OneTrust banner links (xx/en, xx/fr)', () => {
  assert.deepEqual(onPage({ brand: 'brussels' }, () => bannerLinks('en')).map(([, h]) => h), [`${W}/xx/en/legal-notices/data-protection-and-privacy-notice?hidebanner=true`, `${W}/xx/en/legal-notices/cookie-notice?hidebanner=true`, `${W}/xx/en/legal-notices/imprint?hidebanner=true`]);
  assert.deepEqual(onPage({ brand: 'brussels' }, () => bannerLinks('fr')).map(([, h]) => h), [`${W}/xx/fr/legal-notices/data-protection-and-privacy-notice?hidebanner=true`, `${W}/xx/fr/legal-notices/cookie-notice?hidebanner=true`, `${W}/xx/fr/legal-notices/imprint?hidebanner=true`]);
});

test('favicon and manifest at www\'s paths, the copies in the code', () => {
  assert.deepEqual(brandIcons(bru), { icon: '/etc/designs/sn/favicon.ico', type: 'image/ico', manifest: '/etc/designs/sn/manifest.json' });
  const json = JSON.parse(fs.readFileSync(new URL('../etc/designs/sn/manifest.json', import.meta.url), 'utf8'));
  assert.equal(json.name, 'Brussels Airlines');
});

test('the theme: Intelo at www\'s font path, Brussels red, blue and greys on lh-com\'s token names', () => {
  const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8');
  const token = (name) => (css.match(new RegExp(`^\\s*${name}:\\s*([^;]+);`, 'm')) || [])[1];
  ['Intelo-Regular.woff2', 'Intelo-Bold.woff2'].forEach((f) => {
    assert.ok(css.includes(`url('/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/fonts/brussels/${f}')`), f);
    assert.ok(css.includes(`url('${W}/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/fonts/brussels/${f}')`), `${f} on www`);
  });
  assert.match(token('--body-font-family'), /^intelo,/);
  assert.match(token('--heading-font-family'), /^intelo,/);
  assert.equal(token('--text-color'), '#1a1a1a');
  assert.equal(token('--brand-color'), '#e5002b');
  assert.equal(token('--lh-yellow'), '#e5002b', 'primary actions red');
  assert.equal(token('--lh-sunglow-yellow'), '#ac0020', 'their hover');
  assert.equal(token('--button-secondary-color'), '#e5002b', 'www\'s secondary buttons: red outline');
  assert.equal(token('--button-secondary-hover'), '#ac0020');
  assert.equal(token('--lh-marble-blue'), '#0a1f62', 'selection blue');
  assert.equal(token('--footer-surface'), '#051446');
  assert.equal(token('--header-bar-surface'), '#fff');
  assert.equal(token('--lh-grey-1'), '#f8f8f8');
  assert.equal(token('--lh-grey-7'), '#696969');
});
