/* eslint-disable max-len -- dev tooling */
/* columns-media (blocks/columns-media): a link holding only a picture without a text alternative
   (www's linked teaser pictures; axe link-name on 7 Austrian pages, offline package 2026-11-06 item 5):
   when the row also links the same page in text, the picture link stays a pointer target only
   (aria-hidden, out of the tab order); otherwise it takes the row's heading as its name. A picture
   with an alt text, or a link with text, stays as it was. Every brand (brand-neutral).
   Run: node --max-old-space-size=512 --test test/columns-media-image-links.test.mjs */
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
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
const { default: decorate } = await import('../blocks/columns-media/columns-media.js');

const blockOf = (cells) => {
  const block = document.createElement('div');
  block.className = 'columns-media';
  block.innerHTML = `<div>${cells.map((c) => `<div>${c}</div>`).join('')}</div>`;
  document.body.replaceChildren(block);
  return block;
};
const linkedPic = (href, alt = '') => `<p><a href="${href}" title=" "><picture><img src="./media_1.jpg" alt="${alt}" width="800" height="600"></picture></a></p>`;

test('a picture link that repeats a text link of its row: hidden from assistive tech and the tab order', async () => {
  const block = blockOf([linkedPic('/at/de/uebergepaeck'), '<h3>Übergepäck</h3><p>Text</p><p><a href="/at/de/uebergepaeck">Zum Übergepäck</a></p>']);
  await decorate(block);
  const a = block.querySelector('.columns-media-media a');
  assert.ok(a.getAttribute('aria-hidden') === 'true', 'aria-hidden');
  assert.ok(a.getAttribute('tabindex') === '-1', 'tabindex -1');
  const text = block.querySelector('.columns-media-text a');
  assert.ok(!text.hasAttribute('aria-hidden') && !text.hasAttribute('tabindex'), 'the text link as it was');
});

test('a picture link without a twin: named after its row\'s heading', async () => {
  const block = blockOf([linkedPic('/at/en/vienna-airport'), '<h3>Vienna airport</h3><p>Text only.</p>']);
  await decorate(block);
  const a = block.querySelector('.columns-media-media a');
  assert.ok(a.getAttribute('aria-label') === 'Vienna airport', 'aria-label from the heading');
  assert.ok(!a.hasAttribute('aria-hidden'), 'still announced');
});

test('a picture with an alt text, a link with text: as they were', async () => {
  const block = blockOf([linkedPic('/x', 'Baggage belt'), '<h3>X</h3><p><a href="/x">Go</a></p>']);
  await decorate(block);
  const a = block.querySelector('.columns-media-media a');
  assert.ok(!a.hasAttribute('aria-hidden') && !a.hasAttribute('aria-label'), 'named by its alt');
});
