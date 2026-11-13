/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Hub pages: the separator right after a column view nested in a one-column view's item, before a headline (brief 540,
   /de/de/lounges: the two-column "Zugang zu unseren Lounges", then www's .separator (.hr-no-layout, 2.5rem), then
   "Unsere Lounges in der Übersicht"). The replica dropped it as normal component spacing, but the heading has no
   margin of its own above on pages with column marks: the heading 25 px too high (lh-parity-004a, 1440 and 390, the
   four lounges roots). The hub template now keeps such a separator as "{spacer-N}"; between text components, or after a
   view at a section's top level, as before.
   Run: node --max-old-space-size=256 --test test/hub-separator-after-view-540.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import transform from '../tools/importer/transformers/lufthansa-cleanup.js';

globalThis.WebImporter = { Blocks: { getMetadata: () => ({}), getMetadataBlock: (document) => document.createElement('table') } };

const URL_LOUNGES = 'https://www.lufthansa.com/de/de/lounges';
const text = '<div class="text section"><div class="richtext"><p>Informieren Sie sich über die Zugangsregeln.</p></div></div>';
const sep = (style) => `<div class="separator section"><div aria-hidden="true" ${style ? `style="${style}" ` : ''}class="hr hr-no-layout "><maui-divider></maui-divider></div></div>`;
const headline = '<div class="headline section"><h2 class="headline">Unsere Lounges in der Übersicht</h2></div>';
const twocolumn = `<div class="twocolumn column"><div class="column-view flex-column"><div class="row"><div class="col-md-6 col-lg column-view-item"><div class="image parbase section"><div class="image-wrapper"><img src="https://www.lufthansa.com/a.jpg" alt=""></div></div></div><div class="col-md-6 col-lg column-view-item">${text}</div></div></div></div>`;
const onecolumn = (inner) => `<div class="onecolumn column section"><div class="column-view flex-column"><div class="row"><div class="col-lg column-view-item">${inner}</div></div></div></div>`;

const spacers = (inner, template) => {
  const { document } = parseHTML(`<html><head><title>T | Lufthansa</title></head><body><main><div class="section"><div class=" mb-default "><div class="section-content container-fluid section-regular ">${inner}</div></div></div></main></body></html>`);
  const payload = {
    document, url: URL_LOUNGES, params: { originalURL: URL_LOUNGES }, template: { name: template },
  };
  transform('beforeTransform', document.body, payload);
  transform('afterTransform', document.body, payload);
  return [...document.querySelectorAll('p')].map((p) => p.textContent.trim()).filter((t) => /\{(spacer|divider)-/.test(t));
};

test('hub: a nested column view, a separator, a headline in the same item: the separator stays', () => {
  assert.deepEqual(spacers(onecolumn(`${twocolumn}${sep()}${headline}${text}`), 'hub'), ['{spacer-25}']);
  assert.deepEqual(spacers(onecolumn(`${twocolumn}${sep('margin-bottom: 40px;')}${headline}${text}`), 'hub'), ['{spacer-40}']);
});

test('hub: text, separator, headline (and a separator after a view before text): dropped as before', () => {
  assert.deepEqual(spacers(onecolumn(`${text}${sep()}${headline}${text}`), 'hub'), []);
  assert.deepEqual(spacers(onecolumn(`${twocolumn}${sep()}${text}`), 'hub'), []);
});

test('other templates as before (campaign)', () => {
  assert.deepEqual(spacers(onecolumn(`${twocolumn}${sep()}${headline}${text}`), 'campaign'), []);
});
