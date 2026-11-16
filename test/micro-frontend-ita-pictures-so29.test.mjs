/* eslint-disable max-len, import/extensions -- dev tooling */
/* ITA's help center pictures (ema-lufthansa, standing order 29 of 2026-11-16, item 2): help-center-web writes its stage
   (main.png) and FAQ card (faq.png) pictures from www's host (https://www.ita-airways.com/content/dam/ita/images/local_images/help-center/;
   ita-parity-003's and -008's /it/en/help-and-contact, both widths). As SWISS's (standing order 28), the block points them at
   copies in lh-ita's DA (/media-da/ita/help-center/main.png and faq.png, delta-so29-ita-help-center-pictures.txt), but only a
   copy that loads: until the helper has copied them every picture stays the app's own, so the page draws as today.
   SWISS's checked copies and Austrian's pictures are unchanged; Brussels gets neither.
   Run: node --max-old-space-size=512 --test test/micro-frontend-ita-pictures-so29.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'ita.turnsthe.page', pathname: '/', search: '', replace: () => {}, href: 'https://ita.turnsthe.page/', origin: 'https://ita.turnsthe.page',
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
const WWW = 'https://www.ita-airways.com/content/dam/ita/images/local_images/help-center/';
const OURS = { [`${WWW}main.png`]: '/media-da/ita/help-center/main.png', [`${WWW}faq.png`]: '/media-da/ita/help-center/faq.png' };
const it = { country: 'it', lang: 'en', brand: 'ita' };

test('ITA help-center-web: its two pictures as checked copies, not swapped at once', () => {
  const plan = mountPlan(blockOf([['help-center-web']]), BRANDS.ita, it, 'ita.turnsthe.page');
  assert.deepEqual(plan.checkedPictures, OURS);
  assert.equal(plan.pictures, undefined, 'nothing swapped before its copy loads');
});

test('with no copy there the app keeps its own pictures; with both, the stage and the FAQ card point at them', async () => {
  assert.equal(await availablePictures(OURS, async () => false), null);
  const pictures = await availablePictures(OURS, async () => true);
  const app = document.createElement('help-center-web');
  app.innerHTML = `<div id="help-center-web"><div class="topic-selection-image-container"><img src="${WWW}main.png" alt=""></div>`
    + `<div class="info-card"><maui-image><img src="${WWW}faq.png" alt=""></maui-image></div>`
    + `<img class="topic" src="${WWW}baggage.png" alt=""></div>`;
  assert.equal(swapPictures(app, pictures), 2);
  assert.deepEqual([...app.querySelectorAll('img')].map((i) => i.getAttribute('src')), [OURS[`${WWW}main.png`], OURS[`${WWW}faq.png`], `${WWW}baggage.png`]);
});

test('the helper\'s list: HOLD until the files are on the drop, naming the copies and the backup', async () => {
  const fs = await import('node:fs');
  const { readyPaths } = await import('../tools/importer/ita-fragment-insert-apply.mjs');
  const list = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so29-ita-help-center-pictures.txt', import.meta.url), 'utf8');
  assert.deepEqual(readyPaths(list), []);
  assert.deepEqual(list.split('\n').filter((l) => l.startsWith('HOLD\t')).map((l) => l.split('\t')[1]), Object.values(OURS));
  assert.match(list, /\.token-free-backup\/2026-11-ita-so29-help-center-pictures\//);
});

test('other apps get none; SWISS keeps its own checked copies, Brussels none', () => {
  assert.equal(mountPlan(blockOf([['claim-form-entry']]), BRANDS.ita, it, 'ita.turnsthe.page').checkedPictures, undefined);
  const swiss = mountPlan(blockOf([['help-center-web']]), BRANDS.swiss, { country: 'ch', lang: 'en', brand: 'swiss' }, 'swiss.turnsthe.page').checkedPictures;
  assert.ok(Object.values(swiss).every((v) => v.startsWith('/media-da/swiss/')));
  assert.equal(mountPlan(blockOf([['help-center-web']]), BRANDS.brussels, { country: 'be', lang: 'en', brand: 'brussels' }, 'brussels.turnsthe.page').checkedPictures, undefined);
});
