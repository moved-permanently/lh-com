/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The brief after 488, item 2: /gb/en/book-and-manage/flights/ana's "What you need to remember" four-column view
   (lh-snapshots-085) holds three link lists (.imagelinklist > .link-list) whose headings are h2.heading-copytext-large
   ("Check your travel documents", ...). The columns-media parser rebuilt a link list's heading without its size class, so
   the cleanup wrote no "{heading-copytext-large}" and the import dropped the size DA's documents have (the ana documents;
   the harness restored DA's markers twice). The rebuilt heading keeps its size class as every other rebuilt heading does.
   Run: node --max-old-space-size=256 --test test/columns-media-link-list-size-490.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

let out;
globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { variants = [], cells }) => {
      out = { variants, cells: cells.map((row) => row.map((c) => (Array.isArray(c) ? c.map((n) => n.outerHTML || n.textContent).join('') : (c && c.outerHTML) || String(c)))) };
      return document.createElement('table');
    },
  },
};
const { default: parse } = await import('../tools/importer/parsers/columns-media.js');

const ll = (text) => `<div class="imagelinklist event section"><div class="link-list " data-identifier="imagelinklist"><h2 class="headline heading-copytext-large   ">\n ${text}</h2><ul class="horizontal" id="communication-data"></ul></div></div><div class="text section"><div class="richtext"><p>About ${text}.</p></div></div>`;

test('a link list heading keeps its size class (the cleanup marks heading-copytext-large on an h2)', () => {
  const { document } = parseHTML(`<html><body><div class="section-content"><div class="fourcolumn column event section"><div class="column-view flex-column"><div class="row"><div class="col-md-6 col-lg column-view-item"><div class="headline section"><h2 class="headline heading-large">What you need to remember</h2></div></div><div class="col-md-6 col-lg column-view-item">${ll('Check your travel documents')}</div><div class="col-md-6 col-lg column-view-item">${ll('Check-in times')}</div><div class="col-md-6 col-lg column-view-item">${ll('Baggage')}</div></div></div></div></div></body></html>`);
  parse(document.querySelector('.fourcolumn'), { document });
  const all = out.cells.flat().join('');
  assert.ok(all.includes('<h2 class="heading-large">What you need to remember</h2>'), 'the column heading as before');
  ['Check your travel documents', 'Check-in times', 'Baggage'].forEach((t) => {
    assert.ok(all.includes(`<h2 class="heading-copytext-large">${t}</h2>`), t);
  });
});
