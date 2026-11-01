/* eslint-disable import/extensions */
/* The micro-frontend import parser (tools/importer/parsers/micro-frontend.js) and the cleanup:
   <trip-management> one cell as before; <culinary-hub> (Discover's /de/en/culinaryjourney, www
   2026-10-27) its name and the Configuration and API gateway rows from its data- attributes, as
   Austrian's documents carry them; the cleanup keeps the element (it has no text: it was dropped
   as an empty component, so the page imported empty). A linkedom page, a createBlock stand-in, no
   network. Run: node --test test/micro-frontend-parser.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import parse from '../tools/importer/parsers/micro-frontend.js';

globalThis.WebImporter = {
  Blocks: {
    createBlock(doc, { name, cells }) {
      const t = doc.createElement('table');
      t.setAttribute('data-name', name);
      cells.forEach((row) => {
        const tr = doc.createElement('tr');
        row.forEach((c) => {
          const td = doc.createElement('td');
          if (c) td.append(c);
          tr.append(td);
        });
        t.append(tr);
      });
      return t;
    },
  },
};

const HUB = '<culinary-hub data-public-endpoint="" data-configuration="apiKey:yA8iz2C5BnAIf2GKKdkAlgPPW9y6wjLO;dmc:https://www.discover-airlines.com/de/de/culinaryjourney;tmc:13806;dam:/content/dam/four_y/images/offers/destination/" data-api-gateway="https://api.travelid.lufthansa.com/one-catering/v1" class="full-width-bg px-0 maui-theme-four_y" ng-version="21.2.25"></culinary-hub>';
const rowsOf = (document) => [...document.querySelectorAll('table[data-name="micro-frontend"] tr')].map((tr) => [...tr.children].map((td) => td.textContent));

test('culinary-hub: its name, Configuration and API gateway', () => {
  const { document } = parseHTML(`<html><body><div class="container-content"><div class="section"><div class="wrapper section">${HUB}</div></div></div></body></html>`);
  parse(document.querySelector('culinary-hub'), { document });
  assert.deepEqual(rowsOf(document), [
    ['culinary-hub'],
    ['Configuration', 'apiKey:yA8iz2C5BnAIf2GKKdkAlgPPW9y6wjLO;dmc:https://www.discover-airlines.com/de/de/culinaryjourney;tmc:13806;dam:/content/dam/four_y/images/offers/destination/'],
    ['API gateway', 'https://api.travelid.lufthansa.com/one-catering/v1'],
  ]);
});

test('trip-management: one cell as before', () => {
  const { document } = parseHTML('<html><body><trip-management><div>Your trip</div></trip-management></body></html>');
  parse(document.querySelector('trip-management'), { document });
  assert.deepEqual(rowsOf(document), [['trip-management']]);
});

test('the cleanup keeps <culinary-hub> (no text, no media) for the parser', async () => {
  const { default: transform } = await import('../tools/importer/transformers/lufthansa-cleanup.js');
  const { document } = parseHTML(`<html><body><div class="container-content"><div class="section"><div class="section-content"><div class="wrapper section">${HUB}</div></div></div></div></body></html>`);
  transform('beforeTransform', document.body, { document, url: 'https://www.discover-airlines.com/de/en/culinaryjourney', template: { name: 'mfe', blocks: [] } });
  assert.ok(document.querySelector('culinary-hub') !== null, 'kept');
});

test('Discover\'s import picks the mfe template for a page with <culinary-hub>', async () => {
  const { templateOf } = await import('../tools/importer/discover-import.mjs');
  assert.equal(templateOf('/de/en/culinaryjourney', `<div class="wrapper section">${HUB}</div>`), 'mfe');
  assert.equal(templateOf('/de/en/book/travel-information', '<div class="text section"></div>'), 'info');
});
