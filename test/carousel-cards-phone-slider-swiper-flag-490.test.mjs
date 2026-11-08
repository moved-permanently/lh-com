/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The brief after 488, item 3: /de/en and /de/de miles-and-more imported from lh-snapshots-085 lost DA's
   "carousel-cards grid phone-slider". In that capture www's swipers are initialized, so the swiper copy below lg
   (.hidden-lg-up .swiper-slide) has the grid's signature and the cleanup's removeMobileDuplicates drops it before the
   parser, flagging the grid it keeps (data-lh-swiper-below-lg; cards-teaser reads it since brief 441). carousel-cards
   only looked for the swiper copy itself. It reads the flag too.
   Run: node --max-old-space-size=256 --test test/carousel-cards-phone-slider-swiper-flag-490.test.mjs */
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

test('the grid the cleanup kept for a swiper copy below lg (data-lh-swiper-below-lg): phone-slider', () => {
  assert.deepEqual(variants(`<div class="column-view"><div><h3 class="heading-medium">This might also interest you</h3></div><div class="hidden-md-down" data-lh-swiper-below-lg=""><div class="row">${card('a')}${card('b')}${card('c')}</div></div></div>`), ['grid', 'phone-slider']);
});

test('a grid without the flag or a swiper copy: as before', () => {
  assert.deepEqual(variants(`<div class="column-view"><div class="hidden-md-down"><div class="row">${card('a')}${card('b')}${card('c')}</div></div></div>`), ['grid']);
});
