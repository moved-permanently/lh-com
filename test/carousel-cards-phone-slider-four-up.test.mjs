/* eslint-disable class-methods-use-this, max-len -- dev tooling */
/* carousel-cards option phone-slider with four-up (the brief after 510, item 1: Brussels' four-column views with
   carousel behaviour, /be/fr/extra-services/inflight-services' "Autres sujets", imported "grid four-up phone-slider"):
   below 1025px the four-up carousel (one card a view on phones, dots), as phone-slider alone; from 1025px the grid
   with four-up kept (four cards a row, www's .hidden-md-down row). Before, the block dropped four-up from 1025px
   (three a row). phone-slider without four-up: as before (no four-up from 1025px).
   Run: node --max-old-space-size=512 --test test/carousel-cards-phone-slider-four-up.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html lang="en"><head></head><body><main></main></body></html>');
window.location = {
  hostname: 'main--lh-com--moved-permanently.aem.page', pathname: '/de/en/miles-and-more', search: '', hash: '', href: 'https://main--lh-com--moved-permanently.aem.page/de/en/miles-and-more', origin: 'https://main--lh-com--moved-permanently.aem.page',
};
Object.defineProperty(window, 'origin', { value: 'https://main--lh-com--moved-permanently.aem.page', configurable: true });
let narrow = true;
const listeners = [];
window.matchMedia = (q) => ({
  get matches() { return /width < 1025px/.test(q) ? narrow : false; },
  addEventListener: (type, fn) => listeners.push(fn),
  addListener: (fn) => listeners.push(fn),
});
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
globalThis.ResizeObserver = class { observe() {} };
globalThis.requestAnimationFrame = (fn) => fn();
globalThis.cancelAnimationFrame = () => {};
globalThis.getComputedStyle = () => ({ columnGap: '20px' });
window.getComputedStyle = globalThis.getComputedStyle;
const { default: decorate } = await import('../blocks/carousel-cards/carousel-cards.js');

const card = (n) => `<div><div><picture><img src="./media_${n}.jpg" alt="Card ${n}"></picture></div><div><h3><a href="/de/en/card-${n}">Card ${n}</a></h3><p>Text ${n}</p></div></div>`;
const blockOf = (cls) => {
  const block = document.createElement('div');
  block.className = `carousel-cards ${cls}`;
  block.innerHTML = [1, 2, 3].map(card).join('');
  document.querySelector('main').replaceChildren(block);
  return block;
};

test('grid four-up phone-slider below 1025px: the four-up carousel with dots', async () => {
  narrow = true;
  const block = blockOf('grid four-up phone-slider');
  await decorate(block);
  assert.equal(block.classList.contains('four-up'), true);
  assert.equal(block.classList.contains('grid'), false);
  assert.ok(block.querySelector('.carousel-cards-dots') !== null, 'dots');
});

test('grid four-up phone-slider from 1025px: the grid, four-up kept; and back on resize', async () => {
  narrow = false;
  listeners.length = 0;
  const block = blockOf('grid four-up phone-slider');
  await decorate(block);
  assert.equal(block.classList.contains('grid'), true);
  assert.equal(block.classList.contains('four-up'), true);
  narrow = true;
  listeners.forEach((fn) => fn());
  assert.equal(block.classList.contains('grid'), false);
  assert.equal(block.classList.contains('four-up'), true);
  narrow = false;
  listeners.forEach((fn) => fn());
  assert.equal(block.classList.contains('grid'), true);
  assert.equal(block.classList.contains('four-up'), true);
});

test('grid phone-slider (no four-up authored) from 1025px: no four-up, as before', async () => {
  narrow = false;
  const block = blockOf('grid phone-slider');
  await decorate(block);
  assert.equal(block.classList.contains('grid'), true);
  assert.equal(block.classList.contains('four-up'), false);
});
