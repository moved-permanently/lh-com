/* eslint-disable class-methods-use-this */
/* carousel-cards: a track that scrolls sideways is a Tab stop with an accessible name (brief 439,
   item 5; axe scrollable-region-focusable, serious, on Cargo's Facts & Figures timeline at 1440,
   whose slides hold no links): tabindex 0 and the carousel's label (translated, as the block's)
   while it scrolls; no Tab stop when it doesn't (the cards fit). The arrow keys scroll a focused
   track (the browser's own). Brand-neutral (every brand's carousel-cards).
   Run: node --max-old-space-size=512 --test test/carousel-cards-track-focus.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html lang="de"><head></head><body><main></main></body></html>');
window.location = {
  hostname: 'main--lh-cargo--moved-permanently.aem.page', pathname: '/de/ci/facts-figures', search: '', hash: '', href: 'https://main--lh-cargo--moved-permanently.aem.page/de/ci/facts-figures', origin: 'https://main--lh-cargo--moved-permanently.aem.page',
};
Object.defineProperty(window, 'origin', { value: 'https://main--lh-cargo--moved-permanently.aem.page', configurable: true });
window.matchMedia = () => ({ matches: false, addEventListener() {}, addListener() {} });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
globalThis.ResizeObserver = class { observe() {} };
globalThis.requestAnimationFrame = (fn) => fn();
globalThis.cancelAnimationFrame = () => {};
globalThis.getComputedStyle = () => ({ columnGap: '20px' });
window.getComputedStyle = globalThis.getComputedStyle;
// the track's widths as the test sets them (linkedom lays nothing out)
let widths = { scroll: 0, client: 0 };
const track = (el) => el.classList && el.classList.contains('carousel-cards-track');
Object.defineProperty(window.HTMLElement.prototype, 'scrollWidth', { configurable: true, get() { return track(this) ? widths.scroll : 0; } });
Object.defineProperty(window.HTMLElement.prototype, 'clientWidth', { configurable: true, get() { return track(this) ? widths.client : 0; } });
const { default: decorate } = await import('../blocks/carousel-cards/carousel-cards.js');

const slide = (n) => `<div><div></div><div><p>19${n}</p><h3>Event ${n}</h3><p>Text ${n}</p></div></div>`;
const blockOf = (cls) => {
  const block = document.createElement('div');
  block.className = `carousel-cards ${cls}`;
  block.innerHTML = [20, 21, 22, 23].map(slide).join('');
  document.querySelector('main').replaceChildren(block);
  return block;
};

test('a track that scrolls: a Tab stop named as the carousel (the page\'s language)', async () => {
  widths = { scroll: 2400, client: 1296 };
  const block = blockOf('timeline');
  await decorate(block);
  const t = block.querySelector('.carousel-cards-track');
  assert.equal(t.getAttribute('tabindex'), '0');
  assert.equal(t.getAttribute('aria-label'), block.getAttribute('aria-label'));
  assert.equal(t.getAttribute('aria-label'), 'Karussell');
});

test('a track whose cards fit: no Tab stop; it gets one once it scrolls (resize), and loses it again', async () => {
  widths = { scroll: 1296, client: 1296 };
  const block = blockOf('timeline');
  await decorate(block);
  const t = block.querySelector('.carousel-cards-track');
  assert.equal(t.hasAttribute('tabindex'), false);
  assert.equal(t.hasAttribute('aria-label'), false);
  widths = { scroll: 2400, client: 800 };
  t.dispatchEvent(new window.Event('scroll'));
  assert.equal(t.getAttribute('tabindex'), '0');
  widths = { scroll: 800, client: 800 };
  t.dispatchEvent(new window.Event('scroll'));
  assert.equal(t.hasAttribute('tabindex'), false);
});

test('the focused track shows the focus ring (inside its edge)', () => {
  const css = fs.readFileSync(new URL('../blocks/carousel-cards/carousel-cards.css', import.meta.url), 'utf8');
  assert.match(css, /\.carousel-cards \.carousel-cards-track:focus-visible \{[^}]*outline: 2px solid var\(--focus-color\);[^}]*outline-offset: -2px;/);
});
