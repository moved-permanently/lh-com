/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* The brief after 510, item 1 (Brussels' phone sliders, brief 510's ranking rows 5 and 26): www.brusselsairlines.com's
   column views with carousel behaviour (<div class="carousel">: a .hidden-md-down grid and a .hidden-lg-up swiper copy)
   are one-card swipers on phones. /be/fr/extra-services/inflight-services' "Autres sujets" (four teasers, a
   .fourcolumn view) came in as "carousel-cards grid four-up" and stacked (390: 3,661 px, www 2,902);
   /be/en/book-a-flight/groups-and-charter/meetings-and-events' three steps (a .threecolumn view of image, headline and
   text) as "cards-teaser three-up" (390: +347 px before "Benefits"). brussels-import.mjs marks such a view
   (withPhoneSliders: data-import-phone-slider), and the carousel-cards parser gives a marked four-column view
   phone-slider as well (four-up stays: the block keeps it from 1025 px). The three-column view gets phone-slider from
   the cleanup's carousel flag (brief 497). Views without carousel behaviour, and unmarked four-column views
   (lufthansa.com), stay as they were.
   Run: node --max-old-space-size=256 --test test/brussels-phone-slider-import.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

let out;
globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { name, variants = [], cells }) => {
      out = { name, variants, cells: cells.length };
      return document.createElement('table');
    },
    getMetadata: () => ({}),
    getMetadataBlock: (d) => d.createElement('table'),
  },
};
const { withPhoneSliders } = await import('../tools/importer/brussels-import.mjs');
const { default: carouselCards } = await import('../tools/importer/parsers/carousel-cards.js');
const { default: cardsTeaser } = await import('../tools/importer/parsers/cards-teaser.js');
const { default: cleanup } = await import('../tools/importer/transformers/lufthansa-cleanup.js');

// www's markup (the recording of /be/fr/extra-services/inflight-services, brussels-parity-002b), trimmed
const teaser = (t) => `<div class="teaser event section"><a href="https://www.brusselsairlines.com/be/fr/${t}" class="teaser card "><div class="image-wrapper"><img src="/content/dam/bel/images/sn-${t}--2x1.jpg.transform/lh-dcep-transform-width-1440/img.jpg" alt="Queue"></div><div class="card-content"><h4 class="heading-copytext-large teaser-heading">${t}</h4><div class="teaser-description "><div class="richtext ellipsis"><span class="line-wrap-n-1"></span></div></div></div></a></div>`;
const step = (t) => `<div class="image parbase section"><div class="image-wrapper "><img src="/content/dam/lh/images/${t}.png" alt=""></div></div><div class="headline section"><h3 class="headline heading-small "> ${t}</h3></div><div class="text section"><div class="richtext"><p>We ${t}.</p></div></div>`;
const T = ['Repas', 'Classes', 'Flotte', 'Salons'];
const S = ['Send enquiry', 'Receive our offer', 'Bring people together'];
const grid = (items, part) => `<div class="hidden-md-down"><div class="row">${items.map((t) => `<div class="col-md-6 col-lg column-view-item">${part(t)}</div>`).join('')}</div></div>`;
const swiper = (items, part) => `<div class="hidden-lg-up"><div class="" aria-live="polite"><div class="swiper swiper-container-jquery swiper-initialized swiper-horizontal"><div class="swiper-wrapper">${items.map((t) => `<div class="swiper-slide">${part(t)}</div>`).join('')}</div></div></div></div>`;
const view = (cols, items, part, carousel = true) => `<div class="${cols}column column event section"><div class="column-view flex-column container-gray full-width-bg" data-identifier="${cols}column">${cols === 'four' ? '<div><h2 class="heading-medium ">Autres sujets</h2></div>' : ''}${carousel ? `<div class="carousel">${grid(items, part)}${swiper(items, part)}</div>` : grid(items, part)}</div></div>`;
const page = (body) => `<html><head><title>Services à bord | Brussels Airlines</title></head><body><main><div class="section-content container-fluid">${body}</div></main></body></html>`;

const run = (html, cols, parse) => {
  const url = 'https://www.brusselsairlines.com/be/fr/extra-services/inflight-services';
  const { document } = parseHTML(html);
  cleanup('beforeTransform', document.body, { document, url, params: { originalURL: url } });
  out = null;
  parse(document.querySelector(`.${cols}column`), { document });
  return out && { name: out.name, variants: out.variants, cells: out.cells };
};

test('withPhoneSliders marks a four- or three-column view with carousel behaviour, once', () => {
  const html = page(view('four', T, teaser) + view('three', S, step));
  const marked = withPhoneSliders(html);
  assert.equal((marked.match(/data-import-phone-slider=""/g) || []).length, 2);
  assert.match(marked, /<div class="fourcolumn column event section" data-import-phone-slider="">/);
  assert.match(marked, /<div class="threecolumn column event section" data-import-phone-slider="">/);
  assert.equal(withPhoneSliders(marked), marked);
});

test('a column view without carousel behaviour: not marked', () => {
  const html = page(view('four', T, teaser, false));
  assert.equal(withPhoneSliders(html), html);
});

test('inflight-services\' four teasers: carousel-cards grid four-up phone-slider', () => {
  assert.deepEqual(run(withPhoneSliders(page(view('four', T, teaser))), 'four', carouselCards), { name: 'carousel-cards', variants: ['grid', 'four-up', 'phone-slider'], cells: 4 });
});

test('an unmarked four-column view (lufthansa.com, no brand mark): grid four-up, as before', () => {
  assert.deepEqual(run(page(view('four', T, teaser)), 'four', carouselCards), { name: 'carousel-cards', variants: ['grid', 'four-up'], cells: 4 });
});

test('meetings-and-events\' three steps: cards-teaser three-up phone-slider', () => {
  assert.deepEqual(run(withPhoneSliders(page(view('three', S, step))), 'three', cardsTeaser), { name: 'cards-teaser', variants: ['three-up', 'phone-slider'], cells: 3 });
});
