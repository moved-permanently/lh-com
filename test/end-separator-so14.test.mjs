/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Standing order 14 (2026-11-13), item 1: what hides the grey band rule's gain on /de/en/childrens-menus-on-board. www
   ends an AEM section with a text and a 40px separator (.hr-no-layout, inline margin-bottom), then starts a new AEM section
   without .mb-default with a titled two-column view ("Kids Box on European flights"). The separator's inline margin beats
   www's last-component reset, so it stays: the view's title 40px further down than ours, where the cleanup dropped the
   separator as normal component spacing (under 50px). Kept now as "{spacer-N}" when it ends its AEM section after a text
   or link component and the next AEM section has no .mb-default, no padding and starts with a column view (our sections
   merge there, so the spacer lands between the text and the view). The six recorded documents with that shape:
   childrens-menus-on-board, food-and-beverages (de/en, gb/en), speisen-und-getraenke (de/de, at/de), 100-years/cabin-design.
   Input: the two AEM sections of the childrens-menus-on-board snapshot (test/fixtures/end-separator-so14).
   Run: node --max-old-space-size=256 --test test/end-separator-so14.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import transform from '../tools/importer/transformers/lufthansa-cleanup.js';

globalThis.WebImporter = { Blocks: { getMetadata: () => ({}), getMetadataBlock: (document) => document.createElement('table') } };

const URL_CM = 'https://www.lufthansa.com/de/en/childrens-menus-on-board';
const fixture = fs.readFileSync(new URL('./fixtures/end-separator-so14/childrens-menus.html', import.meta.url), 'utf8').replace(/^<!--.*-->\n/, '');
const run = (html, template = 'info') => {
  const { document } = parseHTML(`<html><head><title>Children's menus | Lufthansa</title></head><body><main><div class="container-content">${html}</div></main></body></html>`);
  const payload = {
    document, url: URL_CM, params: { originalURL: URL_CM }, template: { name: template, blocks: [] },
  };
  transform('beforeTransform', document.body, payload);
  transform('afterTransform', document.body, payload);
  return document;
};
const text = (el) => el.textContent.replace(/\s+/g, ' ').trim();
// the element just before the "Kids Box" heading's view, in document order
const beforeKidsBox = (document) => {
  const all = [...document.querySelectorAll('body *')];
  const h = all.findIndex((el) => /^H[1-6]$/.test(el.tagName) && /Kids Box on European flights/.test(el.textContent));
  assert.ok(h > 0, 'the Kids Box heading');
  return all.slice(0, h).filter((el) => el.tagName === 'P' && text(el)).pop();
};

test('the separator that ends the AEM section before the new section\'s view stays as {spacer-40}', () => {
  const p = beforeKidsBox(run(fixture));
  assert.equal(text(p), '{spacer-40}');
});

test('not when the next AEM section has .mb-default (its 2.4rem is there) and not on templates without flow spacing', () => {
  const withMb = fixture.replace(/(<div class="section">\s*<div class=")\s*("\s*>\s*<div class="section-content[^"]*">\s*<div class="twocolumn)/, '$1 mb-default $2');
  assert.notEqual(withMb, fixture, 'the fixture changed');
  assert.notEqual(text(beforeKidsBox(run(withMb))), '{spacer-40}');
  assert.notEqual(text(beforeKidsBox(run(fixture, 'hub'))), '{spacer-40}');
});
