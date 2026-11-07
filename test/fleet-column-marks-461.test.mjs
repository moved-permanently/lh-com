/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Brief 461, item 3: the fleet template gets the column-view marks info has (lufthansa-cleanup.js
   COLUMN_MARK_TEMPLATES): www pads a one-column view directly in the page column 4rem above and
   below from 768px (2rem below it), its last component without margin. Fleet pages are such views
   one after another (lufthansa-first-class-fleet: headline, text, image, accordion per aircraft);
   without the marks ours lost the view padding at every boundary: picture -> accordion 65 px and
   accordion -> next heading 72 px of ink at 1440 where www has 80 / 87 (lh-parity-002), each
   aircraft 25 px short. With the marks (xx/hk's snapshot imported, rendered by the local preview):
   80 / 80 px at 1440, 40 / 40 at 390, as www. Other templates without marks as before.
   Run: node --max-old-space-size=256 --test test/fleet-column-marks-461.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import transform from '../tools/importer/transformers/lufthansa-cleanup.js';

globalThis.WebImporter = { Blocks: { getMetadata: () => ({}), getMetadataBlock: (document) => document.createElement('table') } };

const URL_FLEET = 'https://www.lufthansa.com/de/en/lufthansa-first-class-fleet';
const view = (title) => `<div class="onecolumn column event"><div class="column-view flex-column"><div class="row"><div class="col-lg column-view-item"><div class="headline section"><h2 class="headline heading-medium">${title}</h2></div><div class="text section"><div class="richtext"><p>Text about the ${title}.</p></div></div><div class="image parbase section"><div class="image-wrapper"><figure><img src="https://www.lufthansa.com/a.jpg" alt=""></figure></div></div></div></div></div></div>`;

const markers = (template) => {
  const { document } = parseHTML(`<html><head><title>T | Lufthansa</title></head><body><main><div class="container-content">${view('A350')}${view('747-8')}</div></main></body></html>`);
  const payload = {
    document, url: URL_FLEET, params: { originalURL: URL_FLEET }, template: { name: template, blocks: [] },
  };
  transform('beforeTransform', document.body, payload);
  transform('afterTransform', document.body, payload);
  return (document.body.textContent.match(/\{[a-z -]*column-(?:start|end)[a-z -]*\}/g) || []);
};

test('fleet: each one-column view in the page column gets its outer start and end marks', () => {
  const m = markers('fleet');
  assert.equal(m.filter((x) => x.includes('column-start-outer')).length, 2, m.join(' '));
  assert.equal(m.filter((x) => x.includes('column-end-outer')).length, 2, m.join(' '));
});

test('info as before; a template without marks (hub) as before', () => {
  assert.equal(markers('info').length, 4);
  assert.equal(markers('hub').length, 0);
});
