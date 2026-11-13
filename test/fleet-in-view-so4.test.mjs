/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Standing order 4 item 1: the fleet pages' seat maps (Carousel Lightbox) sit in www column views; since brief 461 the
   fleet documents carry the views' marks, and the block's own margins (measured on documents without marks) came on
   top: /de/en/744 15.7 % at 1440 (the deck labels 40 px low, the next heading 119 px low), 359 17.7 %. lufthansa-cleanup's
   placeColumnMarks now gives a slideshow inside a marked view the option in-view (carousel-lightbox.css: no margins of
   its own) and lets a nested outer view that ends with its outer view write no end mark of its own (one
   {column-end-outer}: www pads each .column-view 2rem below). 744 7.7 %, 359 5.9 %, 32n 11.5, 320 11.8, boeing787 8.8
   at 1440; documents change only when re-imported.
   Input: 744's seat-map view (test/fixtures/fleet-in-view-so4, tools/importer/bd-snapshots).
   Run: node --max-old-space-size=256 --test test/fleet-in-view-so4.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

globalThis.WebImporter = {
  Blocks: {
    getMetadata: () => ({}),
    getMetadataBlock: (document) => document.createElement('table'),
    createBlock: (document) => document.createElement('table'),
  },
};
const { default: transform } = await import('../tools/importer/transformers/lufthansa-cleanup.js');

const view = fs.readFileSync(new URL('./fixtures/fleet-in-view-so4/744-seat-maps.html', import.meta.url), 'utf8').replace(/^<!--.*-->\n/, '');
const page = (body) => `<html><head><title>Boeing 747-400 | Lufthansa</title></head><body><main><div class="contentpage"><div class="content-wrapper"><div class="container-content">${body}</div></div></div></main></body></html>`;
const table = (document, name) => {
  const t = document.createElement('table');
  t.innerHTML = `<tr><th>${name}</th></tr><tr><td><p>Main deck</p></td></tr>`;
  return t;
};
const run = (html, { template = 'fleet', url = 'https://www.lufthansa.com/de/en/744', block = 'Carousel Lightbox (half)' } = {}) => {
  const { document } = parseHTML(page(html));
  const payload = { document, url, params: { originalURL: url }, template: { name: template } };
  transform('beforeTransform', document.body, payload);
  // the parser's part: each slideshow becomes its block table
  document.querySelectorAll('.slideshow').forEach((s) => s.replaceWith(table(document, block)));
  transform('afterTransform', document.body, payload);
  return document;
};
const count = (doc, token) => (doc.body.textContent.match(new RegExp(`\\{${token}\\}`, 'g')) || []).length;

test('/de/en/744: the seat maps inside the marked view take in-view, and the nested view ends with its outer one: one end mark', () => {
  const doc = run(view);
  const heads = [...doc.querySelectorAll('table tr > th')].map((th) => th.textContent);
  assert.ok(heads.length >= 1);
  heads.forEach((h) => assert.equal(h, 'Carousel Lightbox (half, in-view)'));
  assert.equal(count(doc, 'column-end-outer'), 1);
  assert.ok(doc.body.textContent.includes('column-start-outer'));
});

test('kept: another block in a view, a slideshow on a page without column marks (hub), one that has the option already', () => {
  const other = run(view, { block: 'Columns Media' });
  assert.ok([...other.querySelectorAll('table tr > th')].every((th) => th.textContent === 'Columns Media'));
  const hub = run(view, { template: 'hub' });
  assert.ok([...hub.querySelectorAll('table tr > th')].every((th) => th.textContent === 'Carousel Lightbox (half)'));
  const twice = run(view, { block: 'carousel-lightbox (in-view)' });
  assert.ok([...twice.querySelectorAll('table tr > th')].every((th) => th.textContent === 'carousel-lightbox (in-view)'));
});

test('the block drops its margins only with in-view', () => {
  const css = fs.readFileSync(new URL('../blocks/carousel-lightbox/carousel-lightbox.css', import.meta.url), 'utf8');
  assert.match(css, /\.carousel-lightbox\.in-view\.in-view,\n\.carousel-lightbox-pair > \.carousel-lightbox-wrapper > \.carousel-lightbox\.in-view\.in-view \{\n {2}margin-top: 0;\n {2}margin-bottom: 0;/);
  assert.match(css, /\.carousel-lightbox \{\n {2}margin-top: 46px;\n {2}margin-bottom: 95px;/);
});
