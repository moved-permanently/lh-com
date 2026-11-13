/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* campaign-sections' onLoad (brief 555): a text component of a campaign section that ends with an empty paragraph with a
   line break (<p><br></p>: its line and margin, 51 px on www) becomes "{spacer-50}". An empty paragraph without one
   (<p></p>) draws nothing on www, but the blank-text test took it too: /gb/en/food-and-beverages (lh-parity-004b at 390)
   ends its text before the "Culinary journey" band with three <p></p>, and the band came 50 px too low. Only a
   paragraph that holds a <br> (and nothing else) is a spacer now.
   Run: node --max-old-space-size=256 --test test/campaign-sections-empty-paragraph-555.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

globalThis.WebImporter = { Blocks: { getMetadata: () => ({}), getMetadataBlock: (document) => document.createElement('table') } };
const { default: campaignTransform } = await import('../tools/importer/transformers/campaign-sections.js');

const aem = (inner) => `<div class="section"><div class="mb-default"><div class="section-content container-fluid section-regular section-padding-y-regular">${inner}</div></div></div>`;
const spacers = (ending) => {
  const html = aem('<div class="headline"><h2>First</h2></div><div class="text"><div class="richtext"><p>Intro</p></div></div>')
    + aem(`<div class="text"><div class="richtext"><ul><li>Our tiniest passengers are catered for too.</li></ul><p>Text</p>${ending}</div></div>`);
  const { document } = parseHTML(`<html><head><title>T</title></head><body><main><div class="container-content">${html}</div></main></body></html>`);
  campaignTransform('onLoad', document.body, { document, template: { name: 'hub' } });
  return [...document.querySelectorAll('p')].map((p) => p.textContent.trim()).filter((t) => /^\{spacer-/.test(t));
};

test('an empty paragraph with a line break ends the text: "{spacer-50}" as before', () => {
  assert.deepEqual(spacers('<p><br></p>'), ['{spacer-50}']);
  assert.deepEqual(spacers('<p>&nbsp;<br></p>'), ['{spacer-50}']);
});

test('an empty paragraph without a line break (www draws nothing): no spacer', () => {
  assert.deepEqual(spacers('<p></p>'), []);
  assert.deepEqual(spacers('<p></p><p></p><p></p>'), []);
  assert.deepEqual(spacers('<p> </p>'), []);
});
