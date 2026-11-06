/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The cards-teaser parser and the option phone-slider (brief 441, item 5: /de/en/traveltricks'
   "This might also be of interest to you"): www's three-column view with carousel behaviour holds
   the cards twice, the rows for lg (.carousel > .hidden-md-down) and a swiper below it
   (.carousel > .hidden-lg-up: one card per view, bullets). The import took the rows alone, so on
   phones the three cards stacked (traveltricks 5045 px at 390, www 4536). Now such a view gets
   phone-slider (blocks/cards-teaser: the slider below 1025 px); a view without the swiper as before.
   Run: node --max-old-space-size=256 --test test/cards-teaser-phone-slider-import.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

let out;
globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { variants = [], cells }) => {
      out = { variants, cells: cells.length };
      return document.createElement('table');
    },
  },
};
const { default: parse } = await import('../tools/importer/parsers/cards-teaser.js');

const item = (t) => `<div class="col-md-6 col-lg column-view-item"><div class="image parbase section"><div class="image-wrapper"><img src="https://www.lufthansa.com/${t}.jpg" alt=""></div></div><div class="headline section"><h3 class="headline heading-copytext-large">${t}</h3></div><div class="text section"><div class="richtext"><p>Text</p></div></div></div>`;
const slide = (t) => `<div class="swiper-slide"><div class="image parbase section"><div class="image-wrapper"><img src="https://www.lufthansa.com/${t}.jpg" alt=""></div></div><div class="headline section"><h3>${t}</h3></div></div>`;
const run = (carousel) => {
  const { document } = parseHTML(`<html><body><div class="section-content"><div class="threecolumn column event"><div class="column-view flex-column"><div><h2 class="heading-small">This might also be of interest to you</h2></div>${carousel}</div></div></div></body></html>`);
  parse(document.querySelector('.threecolumn'), { document });
  return out;
};

test('rows with their swiper copy below lg: phone-slider, the cards once', () => {
  const r = run(`<div class="carousel"><div class="hidden-md-down"><div class="row">${item('a')}${item('b')}${item('c')}</div></div><div class="hidden-lg-up"><div class="swiper"><div class="swiper-wrapper">${slide('a')}${slide('b')}${slide('c')}</div></div></div></div>`);
  assert.deepEqual(r, { variants: ['three-up', 'phone-slider'], cells: 3 });
});

test('rows without a swiper copy: as before', () => {
  assert.deepEqual(run(`<div class="row">${item('a')}${item('b')}${item('c')}</div>`), { variants: ['three-up'], cells: 3 });
});

/* The cleanup drops the swiper copy before the parsers run (its content is the rows'), so it marks
   the rows it keeps (data-lh-swiper-below-lg); the parser reads the mark. */
const { default: cleanup } = await import('../tools/importer/transformers/lufthansa-cleanup.js');
const carousel = `<div class="carousel"><div class="hidden-md-down"><div class="row">${item('a')}${item('b')}</div></div><div class="hidden-lg-up"><div class="swiper"><div class="swiper-wrapper"><div class="swiper-slide">${item('a')}</div><div class="swiper-slide">${item('b')}</div></div></div></div></div>`;

test('the cleanup drops the swiper copy and marks the rows; the parser still sets phone-slider', () => {
  const url = 'https://www.lufthansa.com/de/en/traveltricks';
  const { document } = parseHTML(`<html><head><title>T | Lufthansa</title></head><body><main><div class="section-content"><div class="threecolumn column event"><div class="column-view flex-column"><div><h2 class="heading-small">This might also be of interest to you</h2></div>${carousel}</div></div></div></main></body></html>`);
  cleanup('beforeTransform', document.body, { document, url, params: { originalURL: url } });
  assert.equal(document.querySelectorAll('.hidden-lg-up').length, 0);
  assert.ok(document.querySelector('.carousel > .hidden-md-down[data-lh-swiper-below-lg]'));
  parse(document.querySelector('.threecolumn'), { document });
  assert.deepEqual(out, { variants: ['three-up', 'phone-slider'], cells: 2 });
});
