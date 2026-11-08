/* eslint-disable max-len */
/* lufthansa.com's help app styled as www's (the brief after 505, item 3; lufthansa.com row 19): www's
   help-and-contact pages (lufthansa-parity-001, de/en) load mausy-v1.40.1 with lufthansa.css, the
   body has maui-theme-lh, the head X-Line b, and help-center-web is 4.3.2. Ours loaded the block's
   default v1.38.0 with 4.3.1 and neither the class nor the meta tag: the app's components drew
   unstyled (the h1 a 20 px line at 553 px, www's 40 px at 443). As Austrian's, ITA's and SWISS's: www's
   setup, the design system from the page's own /digitalhangar/ where the host serves it (lh-edge,
   lufthansa.turnsthe.page), else from www as before. Other apps on lufthansa.com and the brands' help
   apps unchanged. Run: node --max-old-space-size=512 --test test/micro-frontend-lh-help-506.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'main--lh-com--moved-permanently.aem.page', pathname: '/', search: '', replace: () => {}, href: 'https://main--lh-com--moved-permanently.aem.page/', origin: 'https://main--lh-com--moved-permanently.aem.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
const { mountPlan } = await import('../blocks/micro-frontend/micro-frontend.js');
const { BRANDS } = await import('../scripts/brands.js');

const blockOf = (rows) => {
  const block = document.createElement('div');
  block.className = 'micro-frontend';
  block.innerHTML = rows.map((cells) => `<div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`).join('');
  return block;
};
const DE_EN = { country: 'de', lang: 'en' };
const DS = (origin) => `${origin}/digitalhangar/design-system/releases/mausy-v1.40.1/standalone`;

test('lufthansa.com\'s help app: mausy-v1.40.1 and help-center-web 4.3.2 from the own /digitalhangar/ on lufthansa.turnsthe.page', () => {
  const plan = mountPlan(blockOf([['help-center-web']]), null, DE_EN, 'lufthansa.turnsthe.page');
  assert.equal(plan.css, `${DS('https://lufthansa.turnsthe.page')}/css/lufthansa.css`);
  assert.deepEqual(plan.scripts, [
    { src: `${DS('https://lufthansa.turnsthe.page')}/packages/maui-design-system.js`, module: true },
    { src: 'https://lufthansa.turnsthe.page/digitalhangar/cs-help-center/help-center-web/help-center-web-4.3.2.js', module: true },
  ]);
  assert.ok(!JSON.stringify(plan).includes('www.lufthansa.com'));
});

test('lufthansa.com\'s help app: www\'s maui-theme-lh and X-Line b with the X-Portal meta', () => {
  const plan = mountPlan(blockOf([['help-center-web']]), null, DE_EN, 'lufthansa.turnsthe.page');
  assert.equal(plan.themeClass, 'maui-theme-lh');
  assert.deepEqual(plan.meta, {
    'X-Portal': 'LH', 'X-Portal-Site': 'DE', 'X-Portal-Language': 'en', 'X-Line': 'b',
  });
});

test('lufthansa.com\'s help app where the host does not serve /digitalhangar/: the design system from www, as before', () => {
  const plan = mountPlan(blockOf([['help-center-web']]), null, DE_EN, 'main--lh-com--moved-permanently.aem.page');
  assert.equal(plan.css, `${DS('https://www.lufthansa.com')}/css/lufthansa.css`);
  assert.equal(plan.scripts[0].src, `${DS('https://www.lufthansa.com')}/packages/maui-design-system.js`);
});

test('other apps on lufthansa.com and the brands\' help apps as before', () => {
  const trip = mountPlan(blockOf([['trip-management']]), null, DE_EN, 'lufthansa.turnsthe.page');
  assert.ok(trip.css.includes('/v1.38.0/'));
  assert.equal(trip.themeClass, undefined);
  const claim = mountPlan(blockOf([['claim-form-entry']]), null, DE_EN, 'lufthansa.turnsthe.page');
  assert.equal(claim.meta['X-Line'], undefined);
  const aua = mountPlan(blockOf([['help-center-web']]), BRANDS.austrian, { country: 'at', lang: 'de', brand: 'austrian' }, 'austrian.turnsthe.page');
  assert.equal(aua.themeClass, 'maui-theme-os');
});

test('lufthansa.com\'s help app 56 px under the header from 768 px, 36 px below (www\'s section padding and the app\'s top)', async () => {
  const fs = await import('node:fs');
  const css = fs.readFileSync(new URL('../blocks/micro-frontend/micro-frontend.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  assert.ok(css.includes('body.maui-theme-lh main > .section:first-of-type:has(.micro-frontend help-center-web) { margin-top: 36px; }'));
  assert.ok(/@media \(width >= 768px\) \{ body\.maui-theme-lh main > \.section:first-of-type:has\(\.micro-frontend help-center-web\) \{ margin-top: 56px; \} \}/.test(css));
});
