/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The columns-media parser and an image-only carousel view (ema-adobe's handover, tools/reports/parity-2026-11-09/
   shared-blocks-515.md item 1): www's /de/en/meetings-and-events shows its four partner logos (a four-column view with
   carousel behaviour, .column-view > .carousel: the .hidden-md-down grid from 1025 px, a .hidden-lg-up swiper below)
   one at a time with dots on phones; ours stacked the four (the page 14.5 % off at 390). The parser gave cell-slider only
   to a carousel view whose items mix pictures and text (onboard-delights' Dallmayr band). Now three or more image-only
   items get it too; two image-only items (the app teaser's photo + QR code pair) and the mixed band as before.
   Markup: the snapshot tools/importer/bd-snapshots/www.lufthansa.com/de/en/meetings-and-events.html, trimmed.
   Run: node --max-old-space-size=256 --test test/columns-media-logo-slider-519.test.mjs */
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
const { default: parse } = await import('../tools/importer/parsers/columns-media.js');

const logo = (n) => `<div class="col-md-6 col-lg column-view-item"><div class="image parbase section"><div class="image-wrapper "><div class="dcep-moving-image " role="presentation"><div class="moving-image"><div class="w-100 h-100 object-cover"><figure><img src="https://www.lufthansa.com/content/dam/lh/images/local_images/lufthansa-group/${n}.jpg.transform/lh-dcep-transform-width-1440/img.jpg" alt="" class="w-100 h-100 object-cover"></figure></div></div></div></div></div></div>`;
const textItem = (t) => `<div class="col-md-6 col-lg column-view-item"><div class="headline section"><h3 class="headline heading-small">${t}</h3></div><div class="text section"><div class="richtext"><p>${t} text.</p></div></div></div>`;
const view = (cls, items) => `<div class="${cls} column event"><div class="column-view flex-column " data-identifier="${cls}"><div class="carousel"><div class="hidden-md-down"><div class="row">${items.join('')}</div></div><div class="hidden-lg-up"><div class="swiper"><div class="swiper-wrapper">${items.map((i) => `<div class="swiper-slide">${i}</div>`).join('')}</div></div></div></div></div></div>`;
const variants = (cls, items, url = 'https://www.lufthansa.com/de/en/meetings-and-events') => {
  const { document } = parseHTML(`<html><body><div class="section-content">${view(cls, items)}</div></body></html>`);
  variantsOut = null;
  parse(document.querySelector(`.${cls}`), { document, url, params: { originalURL: url } });
  return variantsOut || [];
};

test('meetings-and-events\' four partner logos (image-only, carousel behaviour): cell-slider, one logo at a time with dots on phones', () => {
  assert.ok(variants('fourcolumn', ['os/Austrian_Logo_Red_RGB', 'sn/Brussels_newx2', 'lh/Lufthansa', 'lx/SWISS'].map(logo)).includes('cell-slider'));
  assert.ok(variants('threecolumn', ['a', 'b', 'c'].map(logo)).includes('cell-slider'), 'three image-only items too');
});

test('two image-only items (the photo + QR code pair) and the mixed Dallmayr band: as before', () => {
  assert.ok(!variants('twocolumn', ['photo', 'qr'].map(logo)).includes('cell-slider'), 'two image-only items: no cell-slider');
  assert.ok(variants('fourcolumn', [logo('a'), textItem('Coffee'), logo('b'), textItem('Tea')]).includes('cell-slider'), 'pictures and text: cell-slider as before');
  assert.ok(!variants('fourcolumn', ['A', 'B', 'C', 'D'].map(textItem)).includes('cell-slider'), 'text only: none');
});
