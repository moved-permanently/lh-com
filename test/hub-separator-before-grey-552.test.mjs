/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Hub pages: the separator between a picture and a grey component (brief 552, /de/de/lounges: the intro picture, www's
   .separator (.hr-no-layout, margin-bottom 25px), then the lounge finder in its .container-gray). The replica dropped it
   (25 px is the normal component spacing, kept only between two blocks): 50 px from the picture to the grey band, www
   66 (lh-parity-004a, the four lounges roots). The hub template keeps a separator after a picture when a grey component
   follows ("{spacer-25}"); a picture before text or a heading, and the other templates, as before.
   Run: node --max-old-space-size=256 --test test/hub-separator-before-grey-552.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import transform from '../tools/importer/transformers/lufthansa-cleanup.js';

globalThis.WebImporter = { Blocks: { getMetadata: () => ({}), getMetadataBlock: (document) => document.createElement('table') } };

const URL_LOUNGES = 'https://www.lufthansa.com/de/de/lounges';
const text = '<div class="text section"><div class="richtext"><p>Wir freuen uns, Sie in unseren Lufthansa Lounges begrüßen zu dürfen.</p></div></div>';
const image = '<div class="image parbase section"><div class="image-wrapper"><figure><img src="https://www.lufthansa.com/a.jpg" alt=""></figure></div></div>';
const sep = (style) => `<div class="separator section"><div aria-hidden="true" ${style ? `style="${style}" ` : ''}class="hr hr-no-layout "><maui-divider></maui-divider></div></div>`;
const finder = '<div class="loungefinder section"><section class="container-gray py-8"><div class="row lounge-finder-headline"><h2>Finden Sie Ihre Lounge</h2></div></section></div>';
const headline = '<div class="headline section"><h2 class="headline">Lounge-News</h2></div>';

const spacers = (inner, template) => {
  const { document } = parseHTML(`<html><head><title>T | Lufthansa</title></head><body><main><div class="section"><div class=" mb-default "><div class="section-content container-fluid section-regular ">${inner}</div></div></div></main></body></html>`);
  const payload = {
    document, url: URL_LOUNGES, params: { originalURL: URL_LOUNGES }, template: { name: template },
  };
  transform('beforeTransform', document.body, payload);
  transform('afterTransform', document.body, payload);
  return [...document.querySelectorAll('p')].map((p) => p.textContent.trim()).filter((t) => /\{(spacer|divider)-/.test(t));
};

test('hub: a picture, a separator, a grey component: the separator stays', () => {
  assert.deepEqual(spacers(`${text}${image}${sep('margin-bottom: 25px;')}${finder}`, 'hub'), ['{spacer-25}']);
  assert.deepEqual(spacers(`${text}${image}${sep()}${finder}`, 'hub'), ['{spacer-25}']);
});

test('hub: a picture, a separator, a heading or text: dropped as before', () => {
  assert.deepEqual(spacers(`${text}${image}${sep()}${headline}${text}`, 'hub'), []);
  assert.deepEqual(spacers(`${text}${image}${sep()}${text}`, 'hub'), []);
});

test('other templates as before (campaign)', () => {
  assert.deepEqual(spacers(`${text}${image}${sep()}${finder}`, 'campaign'), []);
});
