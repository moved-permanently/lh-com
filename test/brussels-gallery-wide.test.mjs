/* eslint-disable max-len */
/* Brussels' photo galleries (the parity sweep of the brief after 471, be/fr/travel-classes/business at 1440): www's slideshow
   sits in its section, not in a column, and its preview runs the content's width (about 1,250 px at 1440); ours took half
   (622 px: the block's half width from 768px, lufthansa.com's .col-md-6 slideshow), 130 to 190 px short per gallery. The
   carousel-lightbox parser gives a Brussels slideshow outside a multi-column view option wide (the preview the block's
   width); in a column view, and on the other sites, as before.
   Run: node --max-old-space-size=256 --test test/brussels-gallery-wide.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

let variants;
globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, opts) => { variants = opts.variants; return document.createElement('table'); },
  },
};
const { default: parse } = await import('../tools/importer/parsers/carousel-lightbox.js');

const slideshow = '<div class="slideshow parbase section"><div class="image-wrapper"><a class="open-lightbox" data-target="#lightbox-1"><img src="https://www.brusselsairlines.com/a.jpg" alt="Lounge"></a></div></div>';
const modal = '<div class="lightbox-modal" id="lightbox-1"><div class="swiper-slide"><img src="https://www.brusselsairlines.com/a.jpg" alt="Lounge"></div></div>';
const run = (inner, url, params) => {
  const { document } = parseHTML(`<html><body><main><div class="section-content">${inner}</div>${modal}</main></body></html>`);
  variants = null;
  parse(document.querySelector('.slideshow'), { document, url, params });
  return variants;
};

test('a Brussels slideshow in its section: option wide', () => {
  assert.deepEqual(run(slideshow, 'https://www.brusselsairlines.com/be/fr/travel-classes/business'), ['wide']);
});

test('a snapshot import: the source page (params.originalURL) decides, not the URL loaded', () => {
  assert.deepEqual(run(slideshow, 'http://localhost:8080/be/fr/travel-classes/business.html', { originalURL: 'https://www.brusselsairlines.com/be/fr/travel-classes/business' }), ['wide']);
  assert.deepEqual(run(slideshow, 'http://localhost:8080/de/en/359.html', { originalURL: 'https://www.lufthansa.com/de/en/359' }), []);
});

test('in a multi-column view, or on lufthansa.com: as before', () => {
  const inColumn = `<div class="twocolumn column"><div class="column-view"><div class="row"><div class="col-md-6 column-view-item">${slideshow}</div><div class="col-md-6 column-view-item"><div class="text"><p>Text</p></div></div></div></div></div>`;
  assert.deepEqual(run(inColumn, 'https://www.brusselsairlines.com/be/fr/x'), []);
  assert.deepEqual(run(slideshow, 'https://www.lufthansa.com/de/en/359'), []);
});

test('the block: option wide takes the full width', () => {
  const css = fs.readFileSync(new URL('../blocks/carousel-lightbox/carousel-lightbox.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.match(css, /\.carousel-lightbox\.wide \.carousel-lightbox-inline \{ width: 100%; \}/);
});
