/* eslint-disable max-len */
/* ITA's help app styled as www's (ITA parity row 14; ita-parity-001 help-and-contact, en and it):
   www's body has class maui-theme-az, the theme the design system reads to load ITA's fonts
   (az-fonts.css) and icon library (icon.library.AZ.js) instead of Lufthansa's (lh-fonts.css,
   icon.library.LH.js); its head has <meta name="X-Line" content="b">; its page loads
   help-center-web 4.3.2. The block gives ITA's pages the same: themeClass, the meta tag and the
   brand's release of the app (a page's Version row still wins). The other brands as before.
   Run: node --max-old-space-size=512 --test test/micro-frontend-ita-help.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
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
const { mountPlan, pagePrepare } = await import('../blocks/micro-frontend/micro-frontend.js');
const { BRANDS } = await import('../scripts/brands.js');

const blockOf = (rows) => {
  const block = document.createElement('div');
  block.className = 'micro-frontend';
  block.innerHTML = rows.map((cells) => `<div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`).join('');
  return block;
};
const IT = { country: 'it', lang: 'it', brand: 'ita' };
const APP = (host, v) => `https://${host}/digitalhangar/cs-help-center/help-center-web/help-center-web-${v}.js`;

test('ITA: maui-theme-az, X-Line b and help-center-web 4.3.2 from its own host', () => {
  const plan = mountPlan(blockOf([['help-center-web']]), BRANDS.ita, IT, 'ita.turnsthe.page');
  assert.equal(plan.themeClass, 'maui-theme-az');
  assert.deepEqual(plan.meta, {
    'X-Portal': 'ITA', 'X-Portal-Site': 'IT', 'X-Portal-Language': 'it', 'X-Line': 'b',
  });
  assert.equal(plan.scripts[1].src, APP('ita.turnsthe.page', '4.3.2'));
  assert.equal(plan.css, 'https://ita.turnsthe.page/digitalhangar/design-system/releases/mausy-v1.40.1/standalone/css/ita.css');
  // aem.page and localhost: the same files from ita.turnsthe.page
  assert.equal(mountPlan(blockOf([['help-center-web']]), BRANDS.ita, IT, 'main--lh-ita--moved-permanently.aem.page').scripts[1].src, APP('ita.turnsthe.page', '4.3.2'));
});

test('a page\'s Version row still chooses the release', () => {
  const plan = mountPlan(blockOf([['help-center-web'], ['Version', '4.3.1']]), BRANDS.ita, IT, 'ita.turnsthe.page');
  assert.equal(plan.scripts[1].src, APP('ita.turnsthe.page', '4.3.1'));
  assert.equal('data-version' in plan.attributes, false);
});

test('pagePrepare: the body class and the X-Line meta before the scripts', () => {
  const { document: d } = parseHTML('<!DOCTYPE html><html><head></head><body class="brand-ita"></body></html>');
  pagePrepare(mountPlan(blockOf([['help-center-web']]), BRANDS.ita, IT, 'ita.turnsthe.page'), d);
  assert.ok(d.body.classList.contains('maui-theme-az'));
  assert.equal(d.head.querySelector('meta[name="X-Line"]').getAttribute('content'), 'b');
});

test('the other brands: their release and theme class (SWISS and Austrian with X-Line since brief 397)', () => {
  const swiss = mountPlan(blockOf([['help-center-web']]), BRANDS.swiss, { country: 'ch', lang: 'en', brand: 'swiss' }, 'swiss.turnsthe.page');
  assert.equal(swiss.themeClass, 'maui-theme-lx');
  assert.equal(swiss.meta['X-Line'], 'b');
  assert.equal(swiss.scripts[1].src, APP('swiss.turnsthe.page', '4.3.1'));
  const aua = mountPlan(blockOf([['help-center-web']]), BRANDS.austrian, { country: 'at', lang: 'en', brand: 'austrian' }, 'austrian.turnsthe.page');
  assert.equal(aua.themeClass, 'maui-theme-os');
  assert.equal(aua.scripts[1].src, APP('austrian.turnsthe.page', '4.3.2'));
  const claim = mountPlan(blockOf([['claim-form-entry']]), BRANDS.ita, IT, 'ita.turnsthe.page');
  assert.ok(/claim-form-entry-0\.11\.16\.js$/.test(claim.scripts[1].src), 'another app keeps its release');
});

test('ITA: the topic rules are not drawn (www\'s design system defines no --border-color for them; ours is the page\'s token)', () => {
  const css = fs.readFileSync('blocks/micro-frontend/micro-frontend.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  assert.ok(css.includes('body.maui-theme-az .micro-frontend help-center-web { --border-color: initial; }'));
  assert.ok(!/maui-theme-(lx|sn|lh|os) [^{]*\{ --border-color/.test(css), 'SWISS and Brussels keep theirs');
});
