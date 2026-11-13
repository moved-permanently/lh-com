/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 14 of 2026-11-13, item 1 (businesstogo against b2b-parity-009, each width its own first load): www's
   column view begins at the page title (h2.heading-large inside the view, 40 px of the view's padding above it at 1440,
   20 at 390), the view's cells 32 px under it; ours had the view start between title and block: the title 40 / 22 px
   higher than www's, the cells where www's are. businesstogo's block is the only Columns Media of the option
   title-compact right after an H1 in the recorded B2B documents (20 others follow an H1 without it, their title where
   www's). So B2B's startAtHeading takes an H1 too when the block is title-compact.
   Run: node --max-old-space-size=512 --test test/b2b-title-view-so14.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const page = (mainHtml) => {
  const { document } = parseHTML(`<html><head></head><body><main>${mainHtml}</main></body></html>`);
  globalThis.document = document;
  return document.querySelector('main');
};
const { default: decorateTokenFree } = await import('../scripts/token-free.js');
const flowRead = (k) => (k === 'theme' ? 'flow-spacing' : '');
const CM = (cls) => `<div class="columns-media${cls}"><div><div><h2>Efficient</h2><p>x</p></div><div><p>y</p></div></div></div>`;
const seq = (main) => [...main.querySelector(':scope > div').children].map((el) => {
  if (el.classList.contains('column-mark')) return el.classList.contains('column-start-outer') ? 'start' : 'end';
  return el.tagName === 'DIV' ? el.className.split(' ')[0] : el.tagName.toLowerCase();
}).join(' ');

test('B2B: a title-compact Columns Media right after the H1 starts its view above the H1', () => {
  const main = page(`<div><p>Intro</p><h1>BusinessToGo is your Go-To</h1>${CM(' title-compact')}<p>More</p></div>`);
  decorateTokenFree(main, { brand: 'b2b', path: '/de/en/program/businesstogo', read: flowRead });
  assert.equal(seq(main), 'p start h1 columns-media end p');
});

test('without the option an H1 stays outside the view, as before', () => {
  const main = page(`<div><p>Intro</p><h1>Title</h1>${CM('')}<p>More</p></div>`);
  decorateTokenFree(main, { brand: 'b2b', path: '/de/en/x', read: flowRead });
  assert.equal(seq(main), 'p h1 start columns-media end p');
});
