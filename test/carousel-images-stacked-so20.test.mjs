/* eslint-disable max-len */
/* Standing order 20, item 3: a carousel slide with two pictures, one under the other. www's your-summer-in-athens-starts-here
   (brussels-parity-010), "5. Dive into ... Monastiraki and Psiri": the first slide holds two image components (the street,
   then the aerial view), 30 px apart at 1440 and 390 (876 x 492 + 30 + 876 x 579 at 1440). The parser kept the first
   picture of a slide and the block drew one per row, so the section was 552 px short at 1440 (-5.68 % for the page).
   Now the parser keeps every figure picture of a slide in its image cell, in order, and the block draws them one under
   the other, 30 px apart; a slide of one picture as before. Strings and counts only (no DOM nodes in asserts).
   Run: node --max-old-space-size=256 --test test/carousel-images-stacked-so20.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const { window, document } = parseHTML('<!DOCTYPE html><html><head></head><body></body></html>');
window.location = {
  hostname: 'brussels.turnsthe.page', pathname: '/be/en/articles/x', search: '', hash: '', href: 'https://brussels.turnsthe.page/be/en/articles/x', origin: 'https://brussels.turnsthe.page', replace: () => {},
};
window.origin = 'https://brussels.turnsthe.page';
window.matchMedia = () => ({ matches: false, addEventListener: () => {}, addListener: () => {} });
globalThis.window = window;
globalThis.document = document;
globalThis.Node = window.Node;
globalThis.Event = window.Event;
globalThis.NodeFilter = { SHOW_TEXT: 4 };
globalThis.requestAnimationFrame = (f) => setTimeout(f, 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
globalThis.WebImporter = {
  Blocks: {
    createBlock(doc, { name, cells }) {
      const t = doc.createElement('table');
      t.setAttribute('data-name', name);
      cells.forEach((row) => {
        const tr = doc.createElement('tr');
        row.forEach((c) => {
          const td = doc.createElement('td');
          if (Array.isArray(c)) c.forEach((n) => td.append(n)); else if (c) td.append(c);
          tr.append(td);
        });
        t.append(tr);
      });
      return t;
    },
  },
};

const { default: parse } = await import('../tools/importer/parsers/carousel-images.js');
const { default: decorate } = await import('../blocks/carousel-images/carousel-images.js');
if (window.hlx) window.hlx.codeBasePath = '';

const image = (src) => `<div class="image parbase section"><div class="image-wrapper "><div class="dcep-moving-image "><div class="moving-image"><div class="w-100 h-100 object-cover"><figure><img src="${src}" alt=""></figure></div></div></div></div></div>`;
const parsed = (slides) => {
  const { document: doc } = parseHTML(`<!DOCTYPE html><html><body><main><div class="carousel"><div class="new-carousel"><div class="swiper swiper-single-slide"><div class="swiper-wrapper">${slides}</div></div></div></div></main></body></html>`);
  parse(doc.querySelector('.carousel'), { document: doc });
  return [...doc.querySelectorAll('table[data-name] tr')].map((tr) => [...tr.children[0].querySelectorAll('img')].map((i) => i.getAttribute('src')).join(' '));
};

test('the parser keeps every picture of a slide in its image cell, in order', () => {
  const rows = parsed(`<div class="swiper-slide section"><div>${image('/content/dam/brussels/street.jpg')}${image('/content/dam/brussels/aerial.jpg')}</div></div>
    <div class="swiper-slide section"><div>${image('/content/dam/brussels/mosque.jpg')}</div></div>`);
  assert.deepEqual(rows, ['/content/dam/brussels/street.jpg /content/dam/brussels/aerial.jpg', '/content/dam/brussels/mosque.jpg']);
});

const row = (...srcs) => `<div><div>${srcs.map((s) => `<p><picture><img src="${s}" alt="" width="1920" height="1080"></picture></p>`).join('')}</div><div></div></div>`;

test('the block draws a row\'s pictures one under the other in its slide, none as a caption', () => {
  const block = document.createElement('div');
  block.className = 'carousel-images block';
  block.innerHTML = row('/media_street.jpg', '/media_aerial.jpg') + row('/media_mosque.jpg');
  document.body.append(block);
  decorate(block);
  const slides = [...block.querySelectorAll('.carousel-images-slide')];
  assert.equal(slides.length, 2);
  const srcs = slides.map((s) => [...s.querySelectorAll('.carousel-images-image img')].map((i) => new URL(i.getAttribute('src') || '', 'https://brussels.turnsthe.page').pathname).join(' '));
  assert.deepEqual(srcs, ['/media_street.jpg /media_aerial.jpg', '/media_mosque.jpg']);
  assert.equal(block.querySelectorAll('.carousel-images-caption img').length, 0);
});

test('two pictures in one paragraph: both in the slide (the page can wrap a cell\'s pictures in one paragraph)', () => {
  const block = document.createElement('div');
  block.className = 'carousel-images block';
  block.innerHTML = '<div><div><p><picture><img src="/media_street.jpg" alt="" width="1920" height="1080"></picture><picture><img src="/media_aerial.jpg" alt="" width="1920" height="1269"></picture></p></div><div></div></div>';
  document.body.append(block);
  decorate(block);
  const srcs = [...block.querySelectorAll('.carousel-images-slide .carousel-images-image img')].map((i) => new URL(i.getAttribute('src') || '', 'https://brussels.turnsthe.page').pathname);
  assert.deepEqual(srcs, ['/media_street.jpg', '/media_aerial.jpg']);
});

test('stacked pictures 30 px apart', () => {
  const css = fs.readFileSync(new URL('../blocks/carousel-images/carousel-images.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.match(css, /\.carousel-images \.carousel-images-image > :is\(picture, a\) \+ :is\(picture, a\) \{ margin-top: 30px; \}/);
});
