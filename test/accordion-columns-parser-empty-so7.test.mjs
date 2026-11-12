/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Standing order 7 of 2026-11-12, item 3: www's B2B pages carry empty accordion components (<div class="accordion">
   <maui-collapsible class="accordion-maui"> </maui-collapsible></div>: SWISS Senses de/en corporates-start-of-booking
   right before its title). The parser wrote them as an accordion-columns block without rows (48 in 39 of lh-b2b's
   imported documents), whose wrapper took the space between blocks (the title 13 px under www's). A B2B accordion
   (theme="b2b") without an item now makes no block; one with items, and other sites' empty ones (Austrian's tariff
   pages: no recording of them), as before. styles/themes/b2b.css takes an empty block's space away in DA's copies.
   Run: node --max-old-space-size=256 --test test/accordion-columns-parser-empty-so7.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

let created = 0;
globalThis.WebImporter = {
  Blocks: {
    createBlock: (document) => {
      created += 1;
      const t = document.createElement('table');
      t.className = 'made';
      return t;
    },
  },
};
const { default: parse } = await import('../tools/importer/parsers/accordion-columns.js');

const run = (inner) => {
  created = 0;
  const { document } = parseHTML(`<html><body><div class="section-content"><div class="accordion">${inner}</div><div class="headline"><h1 class="headline heading-large">SWISS Senses</h1></div></div></body></html>`);
  parse(document.querySelector('.accordion'), { document });
  return document;
};

test('an accordion without items: no block, the element gone, the title stays', () => {
  const document = run('<maui-collapsible id="accordion--1969280942" class="accordion-maui" theme="b2b"> </maui-collapsible>');
  assert.ok(created === 0, 'no block created');
  assert.ok(document.querySelector('.accordion') === null, 'the empty accordion removed');
  assert.ok(document.querySelector('table.made') === null, 'no table');
  assert.ok(document.querySelector('h1') !== null, 'the title stays');
});

test('another site\'s empty accordion (Austrian\'s theme="os"): a block as before, until a recording shows www there', () => {
  run('<maui-limited-width theme="os"><maui-collapsible class="accordion-maui" theme="os"> </maui-collapsible></maui-limited-width>');
  assert.ok(created === 1, 'one block');
});

test('an accordion with an item: a block as before', () => {
  const document = run('<maui-collapsible class="accordion-maui"><div class="accordionitem"><maui-collapsible-item headline="Question"><div><div class="richtext"><p>Answer</p></div></div></maui-collapsible-item></div></maui-collapsible>');
  assert.ok(created === 1, 'one block');
  assert.ok(document.querySelector('table.made') !== null, 'the block in place');
});
