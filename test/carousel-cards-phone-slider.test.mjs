/* eslint-disable class-methods-use-this */
/* carousel-cards option phone-slider (brief 404, Lufthansa parity row 17: www.lufthansa.com's
   /de/en/miles-and-more "This might also interest you", capture lufthansa-parity-001): a grid of
   teaser cards that below 1025px is www's swiper (.hidden-lg-up copy): one card per view on phones,
   the next peeking, dots; from 1025px the grid rows. The block carries four-up below 1025px and
   grid from 1025px, the carousel's controls hidden in the grid. Without the option grid stays grid.
   Run: node --max-old-space-size=512 --test test/carousel-cards-phone-slider.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
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

test('phone-slider below 1025px: the carousel (four-up: one card per view on phones), with dots', async () => {
  narrow = true;
  const block = blockOf('grid phone-slider');
  await decorate(block);
  assert.equal(block.classList.contains('four-up'), true);
  assert.equal(block.classList.contains('grid'), false);
  assert.ok(block.querySelector('.carousel-cards-dots') !== null, 'dots');
  assert.ok(block.querySelector('.carousel-cards-nav') !== null, 'arrows (shown from 1025px by four-up, hidden here)');
  assert.equal(block.querySelectorAll('.carousel-cards-slide').length, 3);
});

test('phone-slider from 1025px (and on resize): the grid rows', async () => {
  narrow = false;
  const block = blockOf('grid phone-slider');
  await decorate(block);
  assert.equal(block.classList.contains('grid'), true);
  assert.equal(block.classList.contains('four-up'), false);
  narrow = true;
  listeners.forEach((fn) => fn());
  assert.equal(block.classList.contains('four-up'), true);
  assert.equal(block.classList.contains('grid'), false);
});

test('grid without the option: no carousel controls, as before', async () => {
  narrow = true;
  const block = blockOf('grid');
  await decorate(block);
  assert.equal(block.querySelector('.carousel-cards-dots'), null);
  assert.equal(block.classList.contains('grid'), true);
});

test('the grid hides the phone slider\'s controls', () => {
  const css = fs.readFileSync(new URL('../blocks/carousel-cards/carousel-cards.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.match(css, /\.carousel-cards\.phone-slider\.grid :is\(\.carousel-cards-nav, \.carousel-cards-dots\) \{ display: none; \}/);
});
