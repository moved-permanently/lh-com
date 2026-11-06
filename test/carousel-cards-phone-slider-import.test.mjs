/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The importer's carousel-cards parser and the option phone-slider (blocks/carousel-cards: the
   four-up carousel below 1025 px, the grid from 1025 px; brief 404 set it by hand on the Miles & More
   documents): www's three-card column views hold the cards twice, a grid for lg (.hidden-md-down)
   and a swiper below it (.hidden-lg-up). The import took the grid alone, so on phones the three
   cards stacked (/de/en/doctor-on-board-news 3087 px at 390, www 2383; medical-travel-companions).
   Now such a view gets phone-slider; one without the swiper copy stays a plain grid.
   Run: node --max-old-space-size=256 --test test/carousel-cards-phone-slider-import.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

let variantsOut;
globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { variants = [] }) => {
      variantsOut = variants;
      return document.createElement('table');
    },
  },
};
const { default: parse } = await import('../tools/importer/parsers/carousel-cards.js');

const card = (t) => `<div class="column-view-item"><div class="teaser"><a class="teaser card" href="/de/en/${t}"><div class="image"><img src="https://www.lufthansa.com/a-${t}.jpg" alt=""></div><h3 class="teaser-heading">${t}</h3><div class="teaser-description"><p>Text</p></div></a></div></div>`;
const variants = (inner) => {
  const { document } = parseHTML(`<html><body><div class="section-content"><div class="threecolumn">${inner}</div></div></body></html>`);
  parse(document.querySelector('.threecolumn'), { document });
  return variantsOut;
};

test('a grid with its swiper copy below lg: phone-slider', () => {
  const v = variants(`<div class="column-view"><div><h2 class="heading-small">This may also interest you</h2></div><div class="row hidden-md-down">${card('a')}${card('b')}${card('c')}</div><div class="carousel hidden-lg-up"><div class="swiper"><div class="swiper-slide">${card('a')}</div><div class="swiper-slide">${card('b')}</div><div class="swiper-slide">${card('c')}</div></div></div></div>`);
  assert.deepEqual(v, ['grid', 'phone-slider']);
});

test('a grid without a swiper copy: as before', () => {
  assert.deepEqual(variants(`<div class="column-view"><div class="row">${card('a')}${card('b')}${card('c')}</div></div>`), ['grid']);
});
