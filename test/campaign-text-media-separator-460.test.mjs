/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Campaign pages: the separator between a text component and an image or image carousel (brief 460,
   item 2). www puts a transparent .separator (.hr: margin-bottom 2.5rem, 1px) between the 100-years
   pages' texts and their carousels or collage images; the replica dropped it as normal component
   spacing, but there it only has the paragraph's margin: the carousel 26 px too high (crane,
   menu-on-board, campaigns, global-network; 40 px separators on cabin-design, chronicle,
   new-onboard-experience). The campaign template now keeps such a separator: before an image (it
   stays in the text's wrapper) as "{spacer-N}", before a carousel as "{spacer-(N-24)}" (the spacer
   paragraph keeps the text's 24 px margin from collapsing into the block's).
   Other templates as before (info keeps text -> image through its flow spacing).
   Run: node --max-old-space-size=256 --test test/campaign-text-media-separator-460.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import transform from '../tools/importer/transformers/lufthansa-cleanup.js';

globalThis.WebImporter = { Blocks: { getMetadata: () => ({}), getMetadataBlock: (document) => document.createElement('table') } };

const URL_CRANE = 'https://www.lufthansa.com/de/en/100-years/crane';
const text = '<div class="text section"><div class="richtext"><p>From the first sketch to the centenary logo.</p></div></div>';
const sep = (style) => `<div class="separator section"><div aria-hidden="true" ${style ? `style="${style}" ` : ''}class="hr hr-no-layout "><maui-divider></maui-divider></div></div>`;
const carousel = '<div class="carousel section"><div class="new-carousel"><div class="swiper swiper-single-slide"><div class="swiper-wrapper"><div class="swiper-slide"><div class="image"><img src="https://www.lufthansa.com/a.jpg" alt=""></div></div></div></div></div></div>';
const image = '<div class="image parbase section"><div class="image-wrapper"><figure><img src="https://www.lufthansa.com/b.jpg" alt=""></figure></div></div>';
const headline = '<div class="headline section"><h2 class="headline heading-medium">Next</h2></div>';

const spacers = (inner, template) => {
  const { document } = parseHTML(`<html><head><title>T | Lufthansa</title></head><body><main><div class="section"><div class=" mb-default "><div class="section-content container-fluid section-regular ">${inner}</div></div></div></main></body></html>`);
  const payload = {
    document, url: URL_CRANE, params: { originalURL: URL_CRANE }, template: { name: template },
  };
  transform('beforeTransform', document.body, payload);
  transform('afterTransform', document.body, payload);
  return [...document.querySelectorAll('p')].map((p) => p.textContent.trim()).filter((t) => /^\{(spacer|divider)-/.test(t));
};

test('campaign: text, separator, carousel: the separator stays', () => {
  assert.deepEqual(spacers(`${text}${sep()}${carousel}`, 'campaign'), ['{spacer-1}']);
  assert.deepEqual(spacers(`${text}${sep('margin-bottom: 40px;')}${carousel}`, 'campaign'), ['{spacer-16}']);
});

test('campaign: text, separator, image: the separator stays', () => {
  assert.deepEqual(spacers(`${text}${sep()}${image}`, 'campaign'), ['{spacer-25}']);
});

test('campaign: text, separator, heading or text: dropped as before', () => {
  assert.deepEqual(spacers(`${text}${sep()}${headline}`, 'campaign'), []);
  assert.deepEqual(spacers(`${text}${sep()}${text}`, 'campaign'), []);
});

test('other templates as before', () => {
  assert.deepEqual(spacers(`${text}${sep()}${carousel}`, 'hub'), []);
});
