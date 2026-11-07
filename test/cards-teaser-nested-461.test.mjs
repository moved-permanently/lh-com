/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The cards-teaser parser on a column view nested in a one-column view (brief 461; the hub
   template's .container-content > .onecolumn > … > .column-view-item > .threecolumn, www's
   /de/en/meetings-and-events steps "01 Send enquiry", "02 Receive our offer", "03 Bring people
   together"). Its items were left out as nested ones because the one-column view's item is around
   them: the block came out empty (the page's steps missing, 37 % at 768). Items count as nested only
   inside another item of the parsed column view.
   Run: node --max-old-space-size=256 --test test/cards-teaser-nested-461.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

let created;
globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { name, cells }) => {
      created = { name, cells };
      const t = document.createElement('table');
      t.dataset.name = name;
      return t;
    },
  },
};
const { default: parse } = await import('../tools/importer/parsers/cards-teaser.js');

const item = (n, title) => `<div class="col-md-6 col-lg column-view-item"><div class="image parbase section"><div class="image-wrapper"><img src="https://www.lufthansa.com/content/dam/lh/images/n${n}.png" alt=""></div></div><div class="headline section"><h3 class="headline">${title}</h3></div><div class="text section"><div class="richtext"><p>Text ${n}</p></div></div></div>`;
const three = `<div class="threecolumn column event section"><div class="column-view flex-column"><div class="row">${item(1, 'Send enquiry')}${item(2, 'Receive our offer')}${item(3, 'Bring people together')}</div></div></div>`;
const page = (inner) => parseHTML(`<html><body><div class="container-content"><div class="onecolumn column event section"><div class="column-view flex-column"><div class="row"><div class="col-lg column-view-item">${inner}</div></div></div></div></div></body></html>`).document;

test('a three-column view in a one-column view: its three cards', () => {
  const document = page(three);
  created = null;
  parse(document.querySelector('.column-view-item > .threecolumn'), { document });
  assert.equal(created.name, 'cards-teaser');
  assert.equal(created.cells.length, 3);
  assert.deepEqual(created.cells.map(([, body]) => body.find((el) => el.tagName === 'H3').textContent), ['Send enquiry', 'Receive our offer', 'Bring people together']);
});

test('an item nested inside one of its own items still counts as nested', () => {
  const inner = '<div class="twocolumn column section"><div class="column-view"><div class="row"><div class="column-view-item"><div class="text section"><div class="richtext"><p>inner a</p></div></div></div><div class="column-view-item"><div class="text section"><div class="richtext"><p>inner b</p></div></div></div></div></div></div>';
  const nested = three.replace('<p>Text 1</p></div></div>', `<p>Text 1</p></div></div>${inner}`);
  const document = page(nested);
  created = null;
  parse(document.querySelector('.column-view-item > .threecolumn'), { document });
  assert.equal(created.cells.length, 3);
});
