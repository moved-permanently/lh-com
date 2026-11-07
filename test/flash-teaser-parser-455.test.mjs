/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The flash-teaser parser (tools/importer/parsers/flash-teaser.js) takes the strip's own settings
   from www's homepage (brief 455): www writes the strip's messages into the page on the server
   (.dcep-flash-teaser data-dcep flashTeaserMessages). Where that list holds promotions and no
   irregularity or outage (www.lufthansa.com/my/en on 2026-10-29 and 2026-11-06: the MYR 450 promo,
   while every other recorded homepage, my/de among them, showed the Dubai notice), the page's strip
   is for promotions: the block gets the row Types | promo. A list with an alert, or none, gives the
   empty block as before (all three types, blocks/flash-teaser). The block's messages still come from
   the Message Center index.
   Run: node --max-old-space-size=256 --test test/flash-teaser-parser-455.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

let cellsOut;
globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { name, cells }) => {
      cellsOut = cells.map((row) => row.map((c) => (c && c.outerHTML) || String(c)));
      const t = document.createElement('table');
      t.dataset.name = name;
      return t;
    },
  },
};
const { default: parse } = await import('../tools/importer/parsers/flash-teaser.js');

const run = (html) => {
  const { document } = parseHTML(`<html><body><div class="section-content">${html}</div></body></html>`);
  parse(document.querySelector('.flashteasercore'), { document });
  return { cells: cellsOut, block: document.querySelector('table') };
};
const fixture = (name) => fs.readFileSync(new URL(`./fixtures/flash-teaser/${name}`, import.meta.url), 'utf8');
const component = (messages) => `<div class="flashteasercore section"><div class="dcep-flash-teaser" data-dcep="${JSON.stringify({ id: 'x', flashTeaserMessages: messages }).replace(/"/g, '&quot;')}" role="presentation"></div></div>`;

test('my/en (www: the promo alone): Types | promo', () => {
  const { cells, block } = run(fixture('my-en-homepage.html'));
  assert.equal(block.dataset.name, 'flash-teaser');
  assert.deepEqual(cells, [['Types', 'promo']]);
});

test('my/de (www: the Dubai notice): the empty block, all types, as before', () => {
  assert.deepEqual(run(fixture('my-de-homepage.html')).cells, []);
});

test('a list with an alert and a promotion, an empty list, no data: the empty block', () => {
  assert.deepEqual(run(component([{ type: 'irreg', criticality: 'high' }, { type: 'promo', criticality: 'low' }])).cells, []);
  assert.deepEqual(run(component([{ type: 'tech-outage', criticality: 'low' }])).cells, []);
  assert.deepEqual(run(component([])).cells, []);
  assert.deepEqual(run('<div class="flashteasercore section"><div class="dcep-flash-teaser"></div></div>').cells, []);
  assert.deepEqual(run('<div class="flashteasercore section"><div class="dcep-flash-teaser" data-dcep="{not json"></div></div>').cells, []);
});
