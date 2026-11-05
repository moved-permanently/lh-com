/* columns-media (slider) (blocks/columns-media): below 1025px the slider's strip scrolls, so it is
   a Tab stop (axe scrollable-region-focusable, WCAG 2.1.1: lh-com's /de/en/online-check-in at 390);
   from 1025px, where it is a row, it is none. The cell-slider's row the same.
   Run: node --max-old-space-size=256 --test test/columns-media-slider-focus.test.mjs */
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
let narrow = true;
const listeners = [];
window.matchMedia = (q) => ({
  get matches() { return /width < 1025px/.test(q) ? narrow : false; },
  addEventListener: (type, fn) => listeners.push(fn),
  addListener: (fn) => listeners.push(fn),
});
window.requestAnimationFrame = (fn) => setTimeout(fn, 0);
globalThis.window = window;
globalThis.document = document;
globalThis.requestAnimationFrame = window.requestAnimationFrame;
const { default: decorate } = await import('../blocks/columns-media/columns-media.js');

const pic = (n) => `<p><picture><img src="./media_${n}.jpg" alt="Image ${n}" width="800" height="600"></picture></p>`;
const blockOf = (cls, cells) => {
  const block = document.createElement('div');
  block.className = `columns-media ${cls}`;
  block.innerHTML = `<div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`;
  document.body.replaceChildren(block);
  return block;
};

test('slider: the scrolling strip is a Tab stop below 1025px, none from 1025px', async () => {
  narrow = true;
  const block = blockOf('slider', [[1, 2].map(pic).join(''), '<h3>Title</h3><p>Text</p>']);
  await decorate(block);
  const strip = block.querySelector('.columns-media-multi');
  assert.equal(strip.getAttribute('tabindex'), '0');
  narrow = false;
  listeners.forEach((fn) => fn());
  assert.equal(strip.hasAttribute('tabindex'), false);
});

test('without slider the strip is no Tab stop', async () => {
  narrow = true;
  const block = blockOf('', [[1, 2].map(pic).join(''), '<h3>Title</h3><p>Text</p>']);
  await decorate(block);
  assert.equal(block.querySelector('.columns-media-multi').hasAttribute('tabindex'), false);
});
