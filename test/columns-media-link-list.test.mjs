/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The columns-media parser and www's icon link lists (.imagelinklist > .link-list.nav-link-list: a
   heading with an icon before its text, links below), as on /de/en/carry-on-baggage's baggage
   allowances per travel class (a four-column view in a tab panel, lh-snapshots-064). The parser
   read the heading as a plain headline: the icons were lost and the block had no option. Brief 404
   built the document by hand as columns-media option link-list with <h4><picture>1 personal
   item</h4>; the import now writes that: the heading with its icon in it, the option link-list.
   Run: node --max-old-space-size=256 --test test/columns-media-link-list.test.mjs */
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

const ill = (icon, text) => `<div class="imagelinklist event section"><div class="link-list nav-link-list"><h4 class="headline heading-copytext-large d-flex align-items-center"><div><div class="image-wrapper"><img alt="" src="/content/dam/lh/icons/${icon}"></div></div> ${text}</h4><ul class="horizontal"></ul></div></div>`;
const item = (cls, body) => `<div class="col-md-6 col-lg column-view-item"><div class="headline section"><h4 class="headline heading-copytext-large">${cls}</h4></div>${body}</div>`;

test('icon link lists: the heading with its icon, option link-list', () => {
  const { document } = parseHTML(`<html><body><div class="section-content"><div class="fourcolumn"><div class="column-view"><div class="row">${item('Economy Basic', `${ill('Handbag-dg.svg', '1 personal item')}<div class="text section"><div class="richtext"><p>max. 40 x 30 x 15 cm</p></div></div>`)}${item('Economy Light', `${ill('Handbag-dg.svg', '1 personal item')}<div class="text section"><div class="richtext"><p>max. 40 x 30 x 15 cm</p></div></div>`)}</div></div></div></div></body></html>`);
  parse(document.querySelector('.fourcolumn'), { document });
  assert.ok(out.variants.includes('link-list'), out.variants.join(','));
  const all = out.cells.flat().join('');
  assert.match(all, /<h4[^>]*>Economy Basic<\/h4><h4><img src="\/content\/dam\/lh\/icons\/Handbag-dg\.svg" alt="">1 personal item<\/h4><p>max\. 40 x 30 x 15 cm<\/p>/);
});
