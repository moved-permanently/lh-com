/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Brief 497 (the parity re-check, Austrian): www.austrian.com's column views with carousel behaviour (30 of the 82
   recorded pages: /at/en/economy-class's "Services on short and medium-haul flights") are swipers on phones, one card
   and dots; ours stacked the cards (economy-class at 390: 5,856 px against www's 5,414). The import's capture (the
   Studio's) holds the swiper copy before www's swiper ran: .carousel > .hidden-lg-up without the .swiper-slide classes,
   so the cleanup dropped the copy without marking the rows (data-lh-swiper-below-lg) and the cards-teaser parser gave
   three-up alone (the recording, with its slides, gives phone-slider). A mobile copy inside a .carousel, or holding any
   swiper element, now marks the rows it duplicates; a mobile copy without either, as before.
   Run: node --max-old-space-size=256 --test test/cleanup-carousel-twin-497.test.mjs */
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
    getMetadata: () => ({}),
    getMetadataBlock: (d) => d.createElement('table'),
  },
};
const { default: parse } = await import('../tools/importer/parsers/cards-teaser.js');
const { default: cleanup } = await import('../tools/importer/transformers/lufthansa-cleanup.js');

const item = (t) => `<div class="col-md-6 col-lg column-view-item"><div class="image parbase section"><div class="image-wrapper"><img src="https://www.austrian.com/content/dam/${t}.jpg" alt=""></div></div><div class="headline section"><h3 class="headline heading-small">${t}</h3></div><div class="text section"><div class="richtext"><p>On our flights, ${t}.</p></div></div></div>`;
const rows = (...t) => `<div class="hidden-md-down"><div class="row">${t.map(item).join('')}</div></div>`;
const run = (view) => {
  const url = 'https://www.austrian.com/at/en/economy-class';
  const { document } = parseHTML(`<html><head><title>Economy | Austrian</title></head><body><main><div class="section-content"><div class="threecolumn column event section"><div class="column-view flex-column">${view}</div></div></div></main></body></html>`);
  cleanup('beforeTransform', document.body, { document, url, params: { originalURL: url } });
  const marked = !!document.querySelector('[data-lh-swiper-below-lg]');
  parse(document.querySelector('.threecolumn'), { document });
  return { ...out, marked, mobileLeft: document.querySelectorAll('.hidden-lg-up').length };
};

test('a swiper copy whose swiper has not run (no .swiper-slide): the rows marked, phone-slider', () => {
  const swiper = `<div class="hidden-lg-up"><div><div class="swiper swiper-container-jquery"><div class="swiper-wrapper"><div>${item('a')}</div><div>${item('b')}</div><div>${item('c')}</div></div></div></div></div>`;
  assert.deepEqual(run(`<div class="carousel">${rows('a', 'b', 'c')}${swiper}</div>`), {
    variants: ['three-up', 'phone-slider'], cells: 3, marked: true, mobileLeft: 0,
  });
});

test('a mobile copy inside a .carousel without swiper markup at all: the rows marked too', () => {
  const plain = `<div class="hidden-lg-up"><div>${item('a')}${item('b')}${item('c')}</div></div>`;
  assert.deepEqual(run(`<div class="carousel">${rows('a', 'b', 'c')}${plain}</div>`), {
    variants: ['three-up', 'phone-slider'], cells: 3, marked: true, mobileLeft: 0,
  });
});

test('a mobile copy outside a .carousel and without swiper markup: dropped, nothing marked, as before', () => {
  const plain = `<div class="hidden-lg-up"><div>${item('a')}${item('b')}${item('c')}</div></div>`;
  assert.deepEqual(run(`${rows('a', 'b', 'c')}${plain}`), {
    variants: ['three-up'], cells: 3, marked: false, mobileLeft: 0,
  });
});
