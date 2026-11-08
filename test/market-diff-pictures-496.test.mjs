/* eslint-disable max-len, import/extensions, import/no-relative-packages -- tools/market-diff has a package.json of its own */
/* market-diff's pictures (brief 496): the normaliser (tools/market-diff/lib/aem-html.mjs) masks number tails of
   generated ids in attribute values (form-text-519644935 -> form-text-{n}), which made pictures named by numbers
   (c-1026695176-4252991.jpg, any number-named DAM file) look alike between a root and its language version, and www's
   transform URLs (.../c-…-….jpg.transform/lh-dcep-transform-width-1440/img.jpg) compare by their last segment img.jpg.
   A picture (src, srcset, data-src, data-srcset, poster, a widget's imageUrl) is compared by its DAM file, the path
   before www's .transform/ tail, unmasked; the rendition does not count. Other values keep the masking.
   Run: node --max-old-space-size=256 --test test/market-diff-pictures-496.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { pageFacts, VISIBLE_ATTR } from '../tools/market-diff/lib/aem-html.mjs';
import { decide } from '../tools/market-diff/lib/verdict.mjs';

const page = (inner) => `<!DOCTYPE html><html lang="en"><head><title>Offers</title></head><body><header>h</header><div class="page"><h2 id="main">Main</h2><h1>Offers</h1><p>Fly now</p>${inner}</div><footer>f</footer></body></html>`;
const verdict = (versionInner, rootInner) => decide(
  pageFacts(page(versionInner), 'de/en'),
  pageFacts(page(rootInner), 'ch/en'),
  { visibleAttr: VISIBLE_ATTR },
).verdict;
const T = (file, width = 1440) => `https://www.lufthansa.com/content/dam/lh/images/pixel_images/${file}.transform/lh-dcep-transform-width-${width}/img.jpg`;

test('two pictures named by numbers (c-<n>-<n>.jpg) differ', () => {
  assert.equal(verdict('<img src="/content/dam/lh/images/local_images/c-1026695176-4252991.jpg" alt="">', '<img src="/content/dam/lh/images/local_images/c-1026695176-4252992.jpg" alt="">'), 'differs');
});

test('two www transform URLs ending in img.jpg differ by their DAM file', () => {
  assert.equal(verdict(`<img src="${T('c-1026695176-4252991.jpg')}" alt="">`, `<img src="${T('c-998877665-1122334.jpg')}" alt="">`), 'differs');
  assert.equal(verdict(`<picture><source srcset="${T('c-1026695176-4252991.jpg')} 1x, ${T('c-1026695176-4252991.jpg', 2880)} 2x"><img src="${T('c-1.jpg')}" alt=""></picture>`, `<picture><source srcset="${T('c-1026695176-4252993.jpg')} 1x"><img src="${T('c-1.jpg')}" alt=""></picture>`), 'differs', 'srcset');
});

test('a widget\'s imageUrl names its picture too', () => {
  const w = (file) => `<div data-config='${JSON.stringify({ imageUrl: T(file), headline: 'Fly' })}'></div>`;
  assert.equal(verdict(w('c-1026695176-4252991.jpg'), w('c-1026695176-4252999.jpg')), 'differs');
  assert.equal(verdict(w('c-1026695176-4252991.jpg'), w('c-1026695176-4252991.jpg')), 'same');
});

test('the same picture in another rendition, and generated ids in other values, stay the same', () => {
  assert.equal(verdict(`<img src="${T('c-1026695176-4252991.jpg', 1440)}" alt="">`, `<img src="${T('c-1026695176-4252991.jpg', 720)}" alt="">`), 'same');
  assert.equal(verdict('<iframe src="/forms/form-text-519644935"></iframe><a href="#accordion_123456">A</a>', '<iframe src="/forms/form-text-882211335"></iframe><a href="#accordion_654321">A</a>'), 'same');
});
