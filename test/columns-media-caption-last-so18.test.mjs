/* eslint-disable max-len */
/* Standing order 18, item 3: an image caption after a paragraph of several pictures. The columns-media parser writes a
   column item's image components without captions into one paragraph, then the last component's caption as
   "<p>... {caption}</p>" (www.brusselsairlines.com's article galleries: two pictures stacked on the right, the caption
   under the second, /be/en/articles/the-gambia). The block put that caption with the first picture of the paragraph,
   between the two; www has it under the last. A caption after a one-picture paragraph, as before.
   Run: node --max-old-space-size=256 --test test/columns-media-caption-last-so18.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
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

const pic = (n) => `<picture><img src="./media_${n}.jpg" alt="Image ${n}" width="800" height="600"></picture>`;
const caption = (t) => `<p class="caption">${t}</p>`;
const blockOf = (cls, cells) => {
  const block = document.createElement('div');
  block.className = `columns-media${cls ? ` ${cls}` : ''}`;
  block.innerHTML = `<div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`;
  document.body.replaceChildren(block);
  return block;
};
// the strip's children: a picture alone, or an item with its picture's src number and its caption
const stripOf = (block, n) => [...block.querySelectorAll('.columns-media-multi')[n].children].map((c) => (c.matches('.columns-media-item')
  ? `item(${c.querySelector('img').getAttribute('src').match(/media_(\d+)/)[1]}: ${c.querySelector('p.caption').textContent})`
  : `pic(${c.querySelector('img').getAttribute('src').match(/media_(\d+)/)[1]})`));

test('two pictures in one paragraph, then the caption: the caption under the last picture', async () => {
  const block = blockOf('stacked', [`<p>${pic(1)}</p>`, `<p>${pic(2)}${pic(3)}</p>${caption('Never a dull moment.')}`]);
  await decorate(block);
  assert.deepEqual(stripOf(block, 0), ['pic(2)', 'item(3: Never a dull moment.)']);
});

test('a caption after each one-picture paragraph, as before', async () => {
  const block = blockOf('stacked', [`<p>${pic(1)}</p>`, `<p>${pic(2)}</p>${caption('First.')}<p>${pic(3)}</p>${caption('Second.')}`]);
  await decorate(block);
  assert.deepEqual(stripOf(block, 0), ['item(2: First.)', 'item(3: Second.)']);
});
