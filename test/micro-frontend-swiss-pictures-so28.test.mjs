/* eslint-disable max-len */
/* SWISS's help center pictures (ema-lufthansa, standing order 28 of 2026-11-15, item 1): help-center-web writes its stage
   (main.png) and FAQ card (faq.png) pictures from www's host (https://swiss.com/content/dam/lx/images/local_images/help-center/;
   swiss-parity-001's contact pages, de and en). As Austrian's (standing order 31), the block points them at copies in
   lh-swiss's DA (/media-da/swiss/help-center/main.png and faq.png, delta-so28-swiss-help-center-pictures.txt), but only a
   copy that loads: until the helper has copied them every picture stays the app's own, so the page draws as today.
   Austrian's pictures are unchanged (plan.pictures, swapped at once); other brands get neither.
   Run: node --max-old-space-size=512 --test test/micro-frontend-swiss-pictures-so28.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'swiss.turnsthe.page', pathname: '/', search: '', replace: () => {}, href: 'https://swiss.turnsthe.page/', origin: 'https://swiss.turnsthe.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
const { mountPlan, swapPictures, availablePictures } = await import('../blocks/micro-frontend/micro-frontend.js');
const { BRANDS } = await import('../scripts/brands.js');

const blockOf = (rows) => {
  const block = document.createElement('div');
  block.className = 'micro-frontend';
  block.innerHTML = rows.map((cells) => `<div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`).join('');
  return block;
};
const WWW = 'https://swiss.com/content/dam/lx/images/local_images/help-center/';
const OURS = { [`${WWW}main.png`]: '/media-da/swiss/help-center/main.png', [`${WWW}faq.png`]: '/media-da/swiss/help-center/faq.png' };
const ch = { country: 'ch', lang: 'en', brand: 'swiss' };

test('SWISS help-center-web: its two pictures as checked copies, not swapped at once', () => {
  const plan = mountPlan(blockOf([['help-center-web']]), BRANDS.swiss, ch, 'swiss.turnsthe.page');
  assert.deepEqual(plan.checkedPictures, OURS);
  assert.equal(plan.pictures, undefined, 'nothing swapped before its copy loads');
});

test('only a copy that loads is used; with none the map is empty and the app keeps its own', async () => {
  assert.equal(await availablePictures(OURS, async () => false), null);
  assert.deepEqual(await availablePictures(OURS, async (u) => u.endsWith('faq.png')), { [`${WWW}faq.png`]: OURS[`${WWW}faq.png`] });
  assert.deepEqual(await availablePictures(OURS, async () => true), OURS);
  assert.equal(await availablePictures(null, async () => true), null);
});

test('with both copies there, the stage and the FAQ card point at them and nothing else changes', async () => {
  const pictures = await availablePictures(OURS, async () => true);
  const app = document.createElement('help-center-web');
  app.innerHTML = `<div id="help-center-web"><div class="topic-selection-image-container"><img src="${WWW}main.png" alt=""></div>`
    + `<div class="info-card"><maui-image><img src="${WWW}faq.png" alt=""></maui-image></div>`
    + `<img class="topic" src="${WWW}baggage.png" alt=""></div>`;
  assert.equal(swapPictures(app, pictures), 2);
  assert.deepEqual([...app.querySelectorAll('img')].map((i) => i.getAttribute('src')), [OURS[`${WWW}main.png`], OURS[`${WWW}faq.png`], `${WWW}baggage.png`]);
});

test('no checked pictures for other apps and brands; Austrian\'s stay as they are', () => {
  assert.equal(mountPlan(blockOf([['claim-form-entry']]), BRANDS.swiss, ch, 'swiss.turnsthe.page').checkedPictures, undefined);
  ['austrian', 'brussels', 'ita'].filter((b) => BRANDS[b]).forEach((b) => {
    assert.equal(mountPlan(blockOf([['help-center-web']]), BRANDS[b], { country: 'be', lang: 'en', brand: b }, `${b}.turnsthe.page`).checkedPictures, undefined, b);
  });
  assert.ok(mountPlan(blockOf([['help-center-web']]), BRANDS.austrian, { country: 'at', lang: 'en', brand: 'austrian' }, 'austrian.turnsthe.page').pictures);
});
