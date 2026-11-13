/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 4 of 2026-11-11, item 2 (the B2B ranking, a cause shared by several pages): on the airlines-at-a-glance pages a
   one-picture Columns Media (the airline's logo, its other cells empty) is followed by the text Columns Media; www opens a column
   view of its own for the text (B2B's census: 8 of 8 such pairs marked {column-end-outer}{column-start-outer}); the theme drew
   only the logo's end edge, the text 20 px (390) / 40 px (1440) higher than www's. THEMES.b2b flow columnViews.startAfterLogo:
   that Columns Media gets its own start edge (40 px at every width, b2b.css), on a page of the new version only (its title's
   section H1 compact, which reimport-583-b2b-teaser-grids.txt writes): measured with that list on the 23 recorded documents
   (46 page-widths against b2b-parity-006 / -003): mean 35.83 -> 19.23 %, none worse by more than 0.5 points.
   Run: node --max-old-space-size=256 --test test/b2b-start-after-logo.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { themeFor } from '../scripts/style-markers.js';

const page = (mainHtml) => {
  const { document } = parseHTML(`<html><head></head><body><main>${mainHtml}</main></body></html>`);
  globalThis.document = document;
  return document.querySelector('main');
};
const { default: decorateTokenFree } = await import('../scripts/token-free.js');
const flowRead = (k) => (k === 'theme' ? 'flow-spacing' : '');
const LOGO = '<div class="columns-media"><div><div><picture><img src="logo.png" alt=""></picture></div><div></div><div></div><div></div></div></div>';
const TEXT = '<div class="columns-media"><div><div><p>Eurowings is the value airline</p></div><div><picture><img src="a.jpg" alt=""></picture></div></div></div>';
const seq = (main) => [...main.querySelector(':scope > div').children].map((el) => {
  if (el.classList.contains('column-mark')) return el.classList.contains('column-start-outer') ? 'start' : 'end';
  return el.tagName === 'DIV' ? el.className.split(' ')[0] : el.tagName.toLowerCase();
}).join(' ');

test('B2B: after a logo stage the next Columns Media opens a view of its own', () => {
  assert.equal(themeFor('b2b', 'flow').columnViews.startAfterLogo, true);
  const main = page(`<div class="h1-compact"><p>Breadcrumb</p>${LOGO}${TEXT}<h1>Eurowings Products</h1></div>`);
  decorateTokenFree(main, { brand: 'b2b', path: '/de/en/program/experts/airlines-at-a-glance/eurowings', read: flowRead });
  assert.equal(seq(main), 'p start columns-media end start columns-media end h1');
  assert.ok(main.querySelector('p.column-start-outer.after-logo'), 'the edge 40 px (b2b.css)');
  // a document of today's version (no H1 compact): as before
  const old = page(`<div><p>Breadcrumb</p>${LOGO}${TEXT}<h1>Eurowings Products</h1></div>`);
  decorateTokenFree(old, { brand: 'b2b', path: '/de/en/program/experts/airlines-at-a-glance/eurowings', read: flowRead });
  assert.equal(seq(old), 'p start columns-media end columns-media end h1');
});

test('two Columns Media with text, or Discover: one edge between them as before', () => {
  const two = page(`<div><p>Text</p>${TEXT}${TEXT}<p>More</p></div>`);
  decorateTokenFree(two, { brand: 'b2b', path: '/de/en/x', read: flowRead });
  assert.equal(seq(two), 'p start columns-media end columns-media end p');
  assert.ok(!themeFor('discover', 'flow').columnViews.startAfterLogo);
});
