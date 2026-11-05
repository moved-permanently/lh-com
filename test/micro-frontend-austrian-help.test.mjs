/* eslint-disable max-len */
/* Austrian's help app from its own host, styled as www's (Austrian parity row 26; brief 397).
   www.austrian.com sends help-center-web without Access-Control-Allow-Origin, so our pages kept
   the fallback; austrian.turnsthe.page serves /digitalhangar/ through lh-edge (the 4.3.2 module,
   the design system, austrian.css, os-fonts.css, the OS icon and graphic libraries) and the data
   copies (lh-com 87335767). As SWISS, Brussels and ITA: the app and design system from the page's
   own /digitalhangar/ on austrian.turnsthe.page, from austrian.turnsthe.page on aem.page, aem.live
   and localhost, never www.austrian.com. www's contact pages (at/en, at/de, 2026-11-05): body
   maui-theme-os (the design system then loads os-fonts.css and icon.library.OS.js), X-Line b,
   help-center-web 4.3.2. The culinary hub on Austrian's pages from the own host too. SWISS gets
   www's X-Line b as well.
   Run: node --max-old-space-size=512 --test test/micro-frontend-austrian-help.test.mjs */
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
const AT = { country: 'at', lang: 'de', brand: 'austrian' };
const DS = (host) => `https://${host}/digitalhangar/design-system/releases/mausy-v1.40.1/standalone`;

test('Austrian\'s help app and design system from its own host, never www.austrian.com', () => {
  ['austrian.turnsthe.page', 'main--lh-austrian--moved-permanently.aem.page', 'main--lh-austrian--moved-permanently.aem.live', 'localhost'].forEach((host) => {
    const plan = mountPlan(blockOf([['help-center-web']]), BRANDS.austrian, AT, host);
    assert.equal(plan.css, `${DS('austrian.turnsthe.page')}/css/austrian.css`, host);
    assert.deepEqual(plan.scripts, [
      { src: `${DS('austrian.turnsthe.page')}/packages/maui-design-system.js`, module: true },
      { src: 'https://austrian.turnsthe.page/digitalhangar/cs-help-center/help-center-web/help-center-web-4.3.2.js', module: true },
    ], host);
    assert.ok(!JSON.stringify(plan).includes('www.austrian.com'), host);
  });
});

test('Austrian: maui-theme-os, X-Line b and the X-Portal meta', () => {
  const plan = mountPlan(blockOf([['help-center-web']]), BRANDS.austrian, AT, 'austrian.turnsthe.page');
  assert.equal(plan.themeClass, 'maui-theme-os');
  assert.deepEqual(plan.meta, {
    'X-Portal': 'OS', 'X-Portal-Site': 'AT', 'X-Portal-Language': 'de', 'X-Line': 'b',
  });
  // a page's Version row still chooses the release
  const v = mountPlan(blockOf([['help-center-web'], ['Version', '4.3.1']]), BRANDS.austrian, AT, 'austrian.turnsthe.page');
  assert.equal(v.scripts[1].src, 'https://austrian.turnsthe.page/digitalhangar/cs-help-center/help-center-web/help-center-web-4.3.1.js');
});

test('Austrian\'s culinary hub from the own host too (its release unchanged)', () => {
  const plan = mountPlan(blockOf([['culinary-hub']]), BRANDS.austrian, AT, 'main--lh-austrian--moved-permanently.aem.page');
  assert.equal(plan.scripts[1].src, 'https://austrian.turnsthe.page/digitalhangar/onecatering/culinary-hub/culinary-hub-latest.js');
  assert.equal(plan.themeClass, 'maui-theme-os');
});

test('SWISS: www\'s X-Line b; its release and theme class as before', () => {
  const plan = mountPlan(blockOf([['help-center-web']]), BRANDS.swiss, { country: 'ch', lang: 'en', brand: 'swiss' }, 'swiss.turnsthe.page');
  assert.equal(plan.meta['X-Line'], 'b');
  assert.equal(plan.themeClass, 'maui-theme-lx');
  assert.equal(plan.scripts[1].src, 'https://swiss.turnsthe.page/digitalhangar/cs-help-center/help-center-web/help-center-web-4.3.1.js');
  const brussels = mountPlan(blockOf([['help-center-web']]), BRANDS.brussels, { country: 'be', lang: 'en', brand: 'brussels' }, 'brussels.turnsthe.page');
  assert.equal('X-Line' in brussels.meta, false, 'Brussels as before');
});
