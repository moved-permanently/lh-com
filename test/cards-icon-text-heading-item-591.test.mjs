/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* A column item that is only a headline before the partner teasers (ITA row 39; standing order 7 of 2026-11-12, item 2, and 8, item 1; the ITA
   ranking; ita-parity-005 /it/en/book-and-prepare/travel-information/entry-regulations/entry-regulations-schengen/
   entry-exit-system -3.4 % at 390): www's three-column view holds "What data is collected?" (h2 heading-large) in its
   first item and the four icon teasers in the next ones. The cards-icon-text parser built the block of the teasers and
   dropped the first item: the heading was missing from the page (an offline import of the recording with main's info
   bundle: no "What data is collected?"). The cleanup (lufthansa-cleanup.js, before the parsers) now puts such an
   item's heading before its column view, with its size class, as a column view's own title goes; items with a teaser
   as before.
   Run: node --max-old-space-size=256 --test test/cards-icon-text-heading-item-591.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

let cellsOut;
globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { name, variants = [], cells }) => {
      cellsOut = cells;
      const t = document.createElement('table');
      t.innerHTML = `<tr><th>${name} (${variants.join(', ')})</th></tr>`;
      return t;
    },
  },
};
globalThis.WebImporter.Blocks.getMetadata = () => ({});
globalThis.WebImporter.Blocks.getMetadataBlock = (document) => document.createElement('table');
const { default: parse } = await import('../tools/importer/parsers/cards-icon-text.js');
const { default: cleanup } = await import('../tools/importer/transformers/lufthansa-cleanup.js');

const teaser = (title) => `<div class="col-md-6 col-lg column-view-item"><div class="teaser event section"><a class="teaser partner"><h4 class="heading-copytext-large teaser-heading"><img class="icon icon-svg" src="/content/dam/lh/icons/card-travel-documents.svg" alt=""><div class="teaser-heading-text">${title}</div></h4></a></div></div>`;
const heading = '<div class="col-md-6 col-lg column-view-item"><div class="headline section"><h2 class="headline heading-large "> What data is collected?&nbsp;&nbsp;</h2></div></div>';
const run = (items) => {
  const { document } = parseHTML(`<html><head><title>T</title></head><body><main><div class="threecolumn column event section"><div class="column-view flex-column"><div class="row">${items}</div></div></div></main></body></html>`);
  const url = 'https://www.ita-airways.com/it/en/book-and-prepare/travel-information/entry-regulations/entry-regulations-schengen/entry-exit-system';
  cleanup('beforeTransform', document.body, {
    document, url, params: { originalURL: url }, template: { name: 'info' },
  });
  parse(document.querySelector('.threecolumn'), { document });
  return document.querySelector('main');
};

test('a heading-only item: its heading before the block, the teasers the block\'s rows', () => {
  const main = run(`${heading}${teaser('Information in the travel document')}${teaser('Date and place of entry')}`);
  const h2 = main.firstElementChild;
  assert.equal(h2.tagName, 'H2');
  assert.match(h2.textContent, /What data is collected\?/);
  assert.match(h2.className, /heading-large/);
  assert.equal(main.children[1].tagName, 'TABLE');
  assert.equal(cellsOut.length, 2);
});

test('items with teasers only: as before', () => {
  const main = run(`${teaser('A')}${teaser('B')}`);
  assert.equal(main.firstElementChild.tagName, 'TABLE');
  assert.equal(main.children.length, 1);
});
