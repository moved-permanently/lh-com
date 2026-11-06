/* eslint-disable class-methods-use-this, max-len */
/* Brief 440, item 2: Cargo's homepage eServices slider (carousel-cards option slides, www's
   .eservicesSlider) with one dot per page of slides in view, as www (cargo-parity-001: three slides,
   two in view at 1440: two dots; one in view on phones: three); ours had one dot per slide. The
   option counts the slides in view as four-up does; carousels without either option keep one dot per
   slide. Run: node --max-old-space-size=512 --test test/cargo-eservices-dots.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html lang="en"><head><meta name="brand" content="cargo"></head><body><main></main></body></html>');
window.location = {
  hostname: 'cargo.turnsthe.page', pathname: '/en/home', search: '', hash: '', href: 'https://cargo.turnsthe.page/en/home', origin: 'https://cargo.turnsthe.page',
};
Object.defineProperty(window, 'origin', { value: 'https://cargo.turnsthe.page', configurable: true });
window.matchMedia = () => ({ matches: false, addEventListener() {}, addListener() {} });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
globalThis.ResizeObserver = class { observe() {} };
globalThis.requestAnimationFrame = (fn) => fn();
globalThis.cancelAnimationFrame = () => {};
globalThis.getComputedStyle = () => ({ columnGap: '24px' });
window.getComputedStyle = globalThis.getComputedStyle;

// the widths: a slide and the track (no layout in linkedom)
let slide = 636;
let trackWidth = 1296;
const proto = Object.getPrototypeOf(document.createElement('li'));
const base = Object.getPrototypeOf(proto);
Object.defineProperty(base, 'offsetWidth', { configurable: true, get() { return this.classList && this.classList.contains('carousel-cards-slide') ? slide : 0; } });
Object.defineProperty(base, 'clientWidth', { configurable: true, get() { return this.classList && this.classList.contains('carousel-cards-track') ? trackWidth : 0; } });

const { default: decorate } = await import('../blocks/carousel-cards/carousel-cards.js');

const card = (n) => `<div><div><picture><img src="./media_${n}.jpg" alt=""></picture></div><div><h3>eService ${n}</h3><p>Text ${n}</p><p><a href="/en/e-${n}">Find out more</a></p></div></div>`;
const blockOf = async (cls) => {
  const main = document.querySelector('main');
  main.innerHTML = `<div class="section"><div class="carousel-cards-wrapper"><div class="carousel-cards ${cls} block">${[1, 2, 3].map(card).join('')}</div></div></div>`;
  const block = main.querySelector('.carousel-cards');
  await decorate(block);
  return block;
};
const dots = (block) => block.querySelectorAll('.carousel-cards-dot').length;

test('slides at 1440: two slides in view, two dots (www\'s pages)', async () => {
  slide = 636; trackWidth = 1296;
  assert.equal(dots(await blockOf('slides')), 2);
});

test('slides on a phone: one slide in view, three dots', async () => {
  slide = 331; trackWidth = 351;
  assert.equal(dots(await blockOf('slides')), 3);
});

test('a carousel without slides or four-up: one dot per slide, as before', async () => {
  slide = 636; trackWidth = 1296;
  assert.equal(dots(await blockOf('')), 3);
});
