/* eslint-disable max-len */
/* lufthansa.com's help center stage picture (standing order 80). help-center-web 4.3.2 writes its stage picture
   from a baseImageUrl compiled into the app (https://lufthansa.com/content/dam/lh/images/local_images/help-center/
   main.png). On our hosts lufthansa.com is refused or not ours yet, and once lufthansa.com is answered by lh-edge
   that path needs our copy: the Captures child copied www's file into DA for the /content/dam route (200 on
   lufthansa.turnsthe.page since 20 Nov, 1920 x 1280 PNG). The block points the app's stage <img> at the page's own
   /content/dam/... path. The FAQ card picture (faq.png) has no copy and is left as the app writes it; the brands keep
   their own maps (Austrian's 70c60a7d).
   Run: node --max-old-space-size=512 --test test/micro-frontend-lufthansa-pictures-so80.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'lufthansa.turnsthe.page', pathname: '/de/en/help-and-contact', search: '', replace: () => {}, href: 'https://lufthansa.turnsthe.page/de/en/help-and-contact', origin: 'https://lufthansa.turnsthe.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
const { mountPlan, swapPictures } = await import('../blocks/micro-frontend/micro-frontend.js');
const { BRANDS } = await import('../scripts/brands.js');

const blockOf = (rows) => {
  const block = document.createElement('div');
  block.className = 'micro-frontend';
  block.innerHTML = rows.map((cells) => `<div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`).join('');
  return block;
};
const WWW = 'https://lufthansa.com/content/dam/lh/images/local_images/help-center/main.png';
const OURS = '/content/dam/lh/images/local_images/help-center/main.png';

test('lufthansa.com help-center-web: its stage picture from our /content/dam route', () => {
  ['lufthansa.turnsthe.page', 'main--lh-com--moved-permanently.aem.live', 'localhost'].forEach((host) => {
    const plan = mountPlan(blockOf([['help-center-web']]), null, { country: 'de', lang: 'en' }, host);
    assert.deepEqual(plan.pictures, { [WWW]: OURS }, host);
    assert.equal(plan.checkedPictures, undefined, host);
  });
});

test('the other lufthansa.com apps keep their pictures, the brands their own maps', () => {
  const de = { country: 'de', lang: 'de' };
  ['culinary-hub', 'trip-management', 'claim-form-entry'].forEach((tag) => {
    const plan = mountPlan(blockOf([[tag]]), null, de, 'lufthansa.turnsthe.page');
    assert.equal(plan && plan.pictures, undefined, tag);
  });
  const at = mountPlan(blockOf([['help-center-web']]), BRANDS.austrian, { country: 'at', lang: 'en', brand: 'austrian' }, 'austrian.turnsthe.page');
  assert.equal(Object.keys(at.pictures).some((u) => u.startsWith('https://lufthansa.com/')), false);
});

test('swapPictures: the stage only, once', () => {
  const { pictures } = mountPlan(blockOf([['help-center-web']]), null, { country: 'gb', lang: 'en' }, 'lufthansa.turnsthe.page');
  const app = document.createElement('help-center-web');
  const faq = 'https://lufthansa.com/content/dam/lh/images/local_images/help-center/faq.png';
  app.innerHTML = `<div id="help-center-web"><div class="topic-selection-image-container"><img src="${WWW}" alt=""></div>`
    + `<div class="info-card"><maui-image><img src="${faq}" alt=""></maui-image></div></div>`;
  assert.equal(swapPictures(app, pictures), 1);
  const srcs = [...app.querySelectorAll('img')].map((i) => i.getAttribute('src'));
  assert.deepEqual(srcs, [OURS, faq]);
  assert.equal(swapPictures(app, pictures), 0);
});
