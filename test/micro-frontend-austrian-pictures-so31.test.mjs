/* eslint-disable max-len */
/* Austrian's help center pictures from lh-austrian (standing order 31). help-center-web 4.3.2 writes
   its stage (main.png) and FAQ card (faq.png) pictures from a baseImageUrl compiled into the app
   (https://austrian.com/content/dam/aua/images/local_images/help-center/), as plain <img> elements
   in its light DOM (the FAQ card's in a maui-image). The same bytes (brand-media-004) are in
   lh-austrian's DA, published under /media-da/austrian/help-center/ (main.png and faq.png answer 301
   to these media_ names). The block points the app's pictures at them; other brands and apps are
   left as they are.
   Run: node --max-old-space-size=512 --test test/micro-frontend-austrian-pictures-so31.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'austrian.turnsthe.page', pathname: '/', search: '', replace: () => {}, href: 'https://austrian.turnsthe.page/', origin: 'https://austrian.turnsthe.page',
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
const WWW = 'https://austrian.com/content/dam/aua/images/local_images/help-center/';
const MAIN = '/media-da/austrian/help-center/media_162d642a0ea6253af0793f4bed963218ac649b385.png';
const FAQ = '/media-da/austrian/help-center/media_1a45234493606ceea57e1dbad76ba5d605a45155a.png';

test('Austrian help-center-web: its two pictures from lh-austrian, on every host', () => {
  ['austrian.turnsthe.page', 'main--lh-austrian--moved-permanently.aem.page', 'main--lh-austrian--moved-permanently.aem.live', 'localhost'].forEach((host) => {
    const plan = mountPlan(blockOf([['help-center-web']]), BRANDS.austrian, { country: 'at', lang: 'en', brand: 'austrian' }, host);
    assert.deepEqual(plan.pictures, { [`${WWW}main.png`]: MAIN, [`${WWW}faq.png`]: FAQ }, host);
  });
});

test('no pictures for the other apps and brands', () => {
  const at = { country: 'at', lang: 'de', brand: 'austrian' };
  assert.equal(mountPlan(blockOf([['culinary-hub']]), BRANDS.austrian, at, 'austrian.turnsthe.page').pictures, undefined);
  ['swiss', 'brussels', 'ita'].filter((b) => BRANDS[b]).forEach((b) => {
    assert.equal(mountPlan(blockOf([['help-center-web']]), BRANDS[b], { country: 'be', lang: 'en', brand: b }, `${b}.turnsthe.page`).pictures, undefined, b);
  });
  // lufthansa.com's own stage picture since standing order 80 (micro-frontend-lufthansa-pictures-so80.test.mjs)
  assert.deepEqual(Object.keys(mountPlan(blockOf([['help-center-web']]), null, { country: 'de', lang: 'en' }, 'main--lh-com--moved-permanently.aem.page').pictures), ['https://lufthansa.com/content/dam/lh/images/local_images/help-center/main.png']);
});

test('swapPictures: the stage and the FAQ card, nothing else, once', () => {
  const { pictures } = mountPlan(blockOf([['help-center-web']]), BRANDS.austrian, { country: 'at', lang: 'en', brand: 'austrian' }, 'austrian.turnsthe.page');
  const app = document.createElement('help-center-web');
  app.innerHTML = `<div id="help-center-web"><div class="topic-selection-image-container"><img src="${WWW}main.png" alt=""></div>`
    + `<div class="info-card"><maui-image><img src="${WWW}faq.png" alt=""></maui-image></div>`
    + '<img class="topic" src="https://www.austrian.com/content/dam/aua/images/local_images/help-center//baggage.png" alt=""></div>';
  assert.equal(swapPictures(app, pictures), 2);
  const srcs = [...app.querySelectorAll('img')].map((i) => i.getAttribute('src'));
  assert.deepEqual(srcs, [MAIN, FAQ, 'https://www.austrian.com/content/dam/aua/images/local_images/help-center//baggage.png']);
  assert.equal(swapPictures(app, pictures), 0);
  assert.equal(swapPictures(app, undefined), 0);
});
