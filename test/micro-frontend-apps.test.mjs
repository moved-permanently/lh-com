/* eslint-disable max-len */
/* The micro-frontend block's apps (blocks/micro-frontend mountPlan): trip-management as before;
   help-center-web (ITA's and Austrian's contact pages) and culinary-hub (Austrian's culinary
   journey) from the brand's www with the brand's design system (www.austrian.com's capture:
   mausy-v1.40.1, austrian.css; www.ita-airways.com serves the same files, ita.css), rows after the
   app's name as the element's data- attributes, and for both the page's X-Portal, X-Portal-Site
   and X-Portal-Language meta tags they read (else the help center runs as Lufthansa's, the
   culinary hub without a theme).
   Run: node --max-old-space-size=512 --test test/micro-frontend-apps.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
// the block's imports load scripts.js: on a demo host's / it only redirects (stubbed)
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'main--lh-com--moved-permanently.aem.page', pathname: '/', search: '', replace: () => {}, href: 'https://main--lh-com--moved-permanently.aem.page/', origin: 'https://main--lh-com--moved-permanently.aem.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
const {
  mountPlan, appOf, DESIGN_SYSTEM_CSS, DESIGN_SYSTEM_JS,
} = await import('../blocks/micro-frontend/micro-frontend.js');
const { BRANDS } = await import('../scripts/brands.js');

const blockOf = (rows) => {
  const block = document.createElement('div');
  block.className = 'micro-frontend';
  block.innerHTML = rows.map((cells) => `<div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`).join('');
  return block;
};

test('trip-management: as before (www.lufthansa.com, its design system, its classes)', () => {
  const plan = mountPlan(blockOf([['trip-management']]), null, { country: 'de', lang: 'en' });
  assert.deepEqual(plan, {
    tag: 'trip-management',
    className: 'full-width-bg px-0 pb-5',
    css: DESIGN_SYSTEM_CSS,
    scripts: [{ src: DESIGN_SYSTEM_JS, module: true }, { src: 'https://www.lufthansa.com/digitalhangar/trip-management/trip-management/trip-management-latest.js', module: false }],
    attributes: {},
    meta: {},
  });
  assert.equal(appOf(blockOf([['']])).tag, 'trip-management', 'no name: the default');
});

test('help-center-web on Austrian\'s and ITA\'s pages: their www, design system, the X-Portal meta', () => {
  const aua = mountPlan(blockOf([['help-center-web']]), BRANDS.austrian, { country: 'at', lang: 'en', brand: 'austrian' });
  assert.equal(aua.tag, 'help-center-web');
  assert.equal(aua.css, 'https://www.austrian.com/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/css/austrian.css');
  assert.deepEqual(aua.scripts, [
    { src: 'https://www.austrian.com/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/packages/maui-design-system.js', module: true },
    { src: 'https://www.austrian.com/digitalhangar/cs-help-center/help-center-web/help-center-web-4.3.1.js', module: true },
  ]);
  assert.deepEqual(aua.attributes, { 'data-public-endpoint': '' });
  assert.deepEqual(aua.meta, { 'X-Portal': 'OS', 'X-Portal-Site': 'AT', 'X-Portal-Language': 'en' });
  const ita = mountPlan(blockOf([['help-center-web']]), BRANDS.ita, { country: 'it', lang: 'it', brand: 'ita' });
  assert.equal(ita.css, 'https://www.ita-airways.com/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/css/ita.css');
  assert.deepEqual(ita.meta, { 'X-Portal': 'ITA', 'X-Portal-Site': 'IT', 'X-Portal-Language': 'it' });
});

test('culinary-hub: the rows after its name as data- attributes (Austrian\'s configuration and gateway)', () => {
  const plan = mountPlan(blockOf([['culinary-hub'], ['Configuration', 'apiKey:abc;tmc:13806'], ['API gateway', 'https://api.travelid.austrian.com/one-catering/v1']]), BRANDS.austrian, { country: 'at', lang: 'de', brand: 'austrian' });
  assert.equal(plan.tag, 'culinary-hub');
  assert.deepEqual(plan.scripts[1], { src: 'https://www.austrian.com/digitalhangar/onecatering/culinary-hub/culinary-hub-latest.js', module: false });
  assert.deepEqual(plan.attributes, {
    'data-public-endpoint': '', 'data-configuration': 'apiKey:abc;tmc:13806', 'data-api-gateway': 'https://api.travelid.austrian.com/one-catering/v1',
  });
  // its theme from X-Portal (www's body maui-theme-os; without the meta maui-theme-undefined) and
  // www's classes
  assert.deepEqual(plan.meta, { 'X-Portal': 'OS', 'X-Portal-Site': 'AT', 'X-Portal-Language': 'de' });
  assert.equal(plan.className, 'full-width-bg px-0');
  assert.ok(appOf(blockOf([['no-such-app']])) === null);
});
