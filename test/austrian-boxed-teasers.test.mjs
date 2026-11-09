/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* The brief after 510, item 1b (Austrian baggage's boxed teaser cards, brief 510's ranking row 21: /at/en/baggage
   390 -13.5 %): www's current page (brief 497's recording, austrian-parity-002b) has its nine cards as context
   teasers (experience fragments, id="contextteaser-…": a.teaser.card) in two-column views, which www draws as boxed
   cards; our document came from the Studio's older capture of the page (h2 titles in a columns-media padded grid,
   "Carry-on baggage" where www now says "Hand lugagge"). austrian-import.mjs already takes the current markup to
   www's boxed cards: withTeaserColumns marks the two-column teaser view data-import-two-up and the carousel-cards
   parser gives "grid two-up" (as /at/de/familien). This test keeps that path; the documents need a re-import from
   the newer capture (tools/reports/parity-2026-11-08/reimport-austrian-boxed-teasers.txt).
   Run: node --max-old-space-size=256 --test test/austrian-boxed-teasers.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

let out;
globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { name, variants = [], cells }) => {
      out = { name, variants, cells: cells.length };
      return document.createElement('table');
    },
    getMetadata: () => ({}),
    getMetadataBlock: (d) => d.createElement('table'),
  },
};
const { mappedOf } = await import('../tools/importer/austrian-import.mjs');
const { default: parse } = await import('../tools/importer/parsers/carousel-cards.js');
const { default: cleanup } = await import('../tools/importer/transformers/lufthansa-cleanup.js');

// www's markup (the recording of /at/en/baggage), trimmed
const fragment = (id, t) => `<div class="col-md-6 col-lg column-view-item"><div class="experiencefragment section"><div id="contextteaser-${id}" class="cmp-experiencefragment cmp-experiencefragment--${id}"><div class="xf-content-height"><div class="aem-Grid aem-Grid--12 aem-Grid--default--12 "><div class="teaser event aem-GridColumn aem-GridColumn--default--12"><a href="https://www.austrian.com/at/en/${id}" class="teaser card " data-qm-allow="true"><div class="image-wrapper"><img src="/content/dam/aua/images/${id}.jpg" alt=""></div><div class="card-content"><h4 class="heading-copytext-large teaser-heading">${t}</h4><div class="teaser-description "><div class="richtext ellipsis"><p class="desc-inline">About ${t}.</p></div></div></div><div class="teaser-link-text"><span class="btn-link mb-0"><span>To ${t}</span></span></div></a></div></div></div></div></div></div>`;
const view = (a, b) => `<div class="twocolumn column event section"><div class="column-view flex-column " data-identifier="twocolumn_314025266"><div class="row">${fragment(...a)}${fragment(...b)}</div></div></div>`;
const page = `<html><head><title>Baggage | Austrian Airlines</title></head><body><main><div class="section-content container-fluid section-regular ">${view(['airportr', 'Baggage pick-up'], ['hand-luggage', 'Hand lugagge'])}</div></main></body></html>`;

test('a two-column view of context teasers is marked for the two-up grid', () => {
  const m = mappedOf(page, '/at/en/baggage');
  assert.match(m, /<div class="threecolumn column event section" data-import-two-up="">/);
});

test('and imports as carousel-cards grid two-up, www\'s boxed cards two a row', () => {
  const url = 'https://www.austrian.com/at/en/baggage';
  const { document } = parseHTML(mappedOf(page, '/at/en/baggage'));
  cleanup('beforeTransform', document.body, { document, url, params: { originalURL: url } });
  out = null;
  parse(document.querySelector('.threecolumn'), { document });
  assert.deepEqual(out, { name: 'carousel-cards', variants: ['grid', 'two-up'], cells: 2 });
});
