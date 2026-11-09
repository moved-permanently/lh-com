/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Brief 506 item 3, /de/en/miles-and-more at 390: www's slider dots sit 56 px under the cards, ours 21 (the drawn dot
   in its 24 px target, 8 px under the cards). www's slides there hold experience fragments (.swiper-slide >
   .experiencefragment > .xf-content-height > .aem-Grid > .teaser): each slide is 30 px taller than its tallest teaser
   (www's own render, 239 px slides around 209 px teasers), the pagination 20 px under the slides. Teaser slides
   without a fragment (flying-with-small-children, doctor-on-board-news: the teaser is the slide) have the dots 20 px
   under the cards, as ours. Of 312 de/en pages in the captures only miles-and-more has fragment slides. The parser
   writes what www's markup is (option fragment-slides on a phone-slider whose cards are fragment teasers);
   lufthansa.com's carousel-cards CSS draws the fragments' 30 px above the dots on phones.
   Run: node --test test/carousel-cards-fragment-slides-506.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
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

const teaser = (t) => `<div class="teaser"><a class="teaser card" href="/de/en/${t}"><div class="image"><img src="https://www.lufthansa.com/a-${t}.jpg" alt=""></div><h3 class="heading-small">${t}</h3><p>Text ${t}</p></a></div>`;
const xf = (t) => `<div class="experiencefragment section"><div class="cmp-experiencefragment"><div class="xf-content-height"><div class="aem-Grid aem-Grid--12">${teaser(t).replace('class="teaser"', 'class="teaser event aem-GridColumn"')}</div></div></div></div>`;
const view = (cell) => `<div class="column-view"><div><h3>This might also interest you</h3></div><div class="row hidden-md-down">${['a', 'b', 'c'].map((t) => `<div class="column-view-item">${cell(t)}</div>`).join('')}</div><div class="hidden-lg-up"><div class="carousel"><div class="swiper"><div class="swiper-wrapper">${['a', 'b', 'c'].map((t) => `<div class="swiper-slide">${cell(t)}</div>`).join('')}</div></div></div></div></div>`;
const variants = (inner) => {
  const { document } = parseHTML(`<html><body><div class="section-content"><div class="threecolumn column">${inner}</div></div></body></html>`);
  parse(document.querySelector('.threecolumn'), { document });
  return variantsOut;
};

test('a phone slider of experience-fragment teasers: option fragment-slides', () => {
  assert.deepEqual(variants(view(xf)), ['grid', 'phone-slider', 'fragment-slides']);
});

test('a phone slider of plain teasers, a grid without a swiper copy: as before', () => {
  assert.deepEqual(variants(view(teaser)), ['grid', 'phone-slider']);
  assert.deepEqual(variants(`<div class="column-view"><div class="row">${['a', 'b', 'c'].map((t) => `<div class="column-view-item">${xf(t)}</div>`).join('')}</div></div>`), ['grid']);
});

test('lufthansa.com on phones: the fragments\' 30 px above the dots (8 + 30)', () => {
  const css = fs.readFileSync('blocks/carousel-cards/carousel-cards.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  assert.ok(css.includes('@media (width < 768px) { body.brand-lufthansa .carousel-cards.phone-slider.fragment-slides .carousel-cards-dots { margin-top: 38px; } }'));
});
