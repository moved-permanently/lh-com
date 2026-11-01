/* columns-media (gallery) (blocks/columns-media): one row's images as a grid, up to 4 columns
   (www.airdolomiti.it articoli/didyouknow/parti-di-aereo-trasformate-in-mobili-di-design: 4
   images in a row), 2 on phones; the images of one cell or one image per cell. Without the
   variant the strip and rows are as before.
   Run: node --max-old-space-size=512 --test test/columns-media-gallery.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
// the block's imports load scripts.js: on a demo host's / it only redirects (stubbed)
window.hlx = { codeBasePath: '' };
window.location = {
  hostname: 'main--lh-com--moved-permanently.aem.page', pathname: '/', search: '', replace: () => {}, href: 'https://main--lh-com--moved-permanently.aem.page/', origin: 'https://main--lh-com--moved-permanently.aem.page',
};
window.origin = window.location.origin;
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
const { default: decorate } = await import('../blocks/columns-media/columns-media.js');

const pic = (n) => `<p><picture><img src="./media_${n}.jpg" alt="Image ${n}" width="800" height="600"></picture></p>`;
const blockOf = (cls, cells) => {
  const block = document.createElement('div');
  block.className = `columns-media${cls ? ` ${cls}` : ''}`;
  block.innerHTML = `<div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`;
  document.body.replaceChildren(block);
  return block;
};

test('gallery: one cell\'s four images in one grid strip of 4 columns', async () => {
  const block = blockOf('gallery', [[1, 2, 3, 4].map(pic).join('')]);
  await decorate(block);
  const strip = block.querySelector('.columns-media-multi');
  assert.ok(strip !== null);
  assert.equal(strip.querySelectorAll('picture').length, 4);
  assert.ok(strip.classList.contains('columns-media-gallery'));
  assert.equal(strip.style.getPropertyValue('--columns-media-gallery-cols'), '4');
  assert.ok(!block.querySelector('.columns-media-row').classList.contains('columns-media-gallery'), 'a one-cell row stays one column');
  const three = blockOf('gallery', [[1, 2, 3].map(pic).join('')]);
  await decorate(three);
  assert.equal(three.querySelector('.columns-media-multi').style.getPropertyValue('--columns-media-gallery-cols'), '3');
  const six = blockOf('gallery', [[1, 2, 3, 4, 5, 6].map(pic).join('')]);
  await decorate(six);
  assert.equal(six.querySelector('.columns-media-multi').style.getPropertyValue('--columns-media-gallery-cols'), '4', 'at most 4 a row');
});

test('gallery: one image per cell, the row the grid', async () => {
  const block = blockOf('gallery', [1, 2, 3, 4].map(pic));
  await decorate(block);
  const row = block.querySelector('.columns-media-row');
  assert.ok(row.classList.contains('columns-media-gallery'));
  assert.equal(row.style.getPropertyValue('--columns-media-gallery-cols'), '4');
});

test('without the variant: no gallery columns, as before', async () => {
  const block = blockOf('', [[1, 2, 3, 4].map(pic).join('')]);
  await decorate(block);
  assert.equal(block.querySelectorAll('.columns-media-gallery').length, 0);
  assert.equal(block.querySelector('.columns-media-multi').style.getPropertyValue('--columns-media-gallery-cols'), '');
  assert.equal(block.querySelector('.columns-media-row').style.getPropertyValue('--columns-media-gallery-cols'), '');
});

test('the CSS: 2 columns on phones, the gallery columns from 768px', () => {
  const css = fs.readFileSync('blocks/columns-media/columns-media.css', 'utf8');
  assert.match(css, /\.columns-media\.gallery \.columns-media-gallery \{[^}]*display: grid;[^}]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
  // the tablet rule for 3+ cell rows leaves the gallery alone
  assert.match(css, /\.columns-media:not\(\.sidebar, \.media-first, \.gallery\) \.columns-media-row:has\(> :nth-child\(3\)\)/);
  assert.match(css, /repeat\(var\(--columns-media-gallery-cols, 4\), minmax\(0, 1fr\)\)/);
});
