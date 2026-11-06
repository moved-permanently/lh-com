/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The accordion-columns parser's list items (tools/importer/parsers/accordion-columns.js): an item
   with a link and text around it (Brussels /be/fr/special-care/families-and-children/
   children-travelling-alone: <li>Un <a>formulaire</a><span> supplémentaire devant être rempli…
   </span></li>; tools/reports/brussels/parity.md P35) became the link alone. Now the item keeps its
   text with the link in it (icons and screen-reader texts dropped); an item that is only a link
   stays a link item (lufthansa.com's /articles/tags lists).
   Run: node --max-old-space-size=256 --test test/accordion-columns-list-text.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

let cellsOut;
globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { cells }) => {
      cellsOut = cells.map((row) => row.map((c) => (Array.isArray(c) ? c.map((n) => n.outerHTML).join('') : (c && c.outerHTML) || String(c))));
      return document.createElement('table');
    },
  },
};
const { default: parse } = await import('../tools/importer/parsers/accordion-columns.js');

const run = (li) => {
  const { document } = parseHTML(`<html><body><div class="accordion"><maui-collapsible class="accordion-maui"><div class="accordionitem"><maui-collapsible-item headline="Mineurs voyageant seuls hors de France"><div><div class="text"><div class="richtext"><ul>${li}</ul></div></div></div></maui-collapsible-item></div></maui-collapsible></div></body></html>`);
  parse(document.querySelector('.accordion'), { document });
  return cellsOut[0][1];
};

test('an item with text around its link keeps the text', () => {
  assert.match(
    run('<li>Un <a href="https://webv4.brusselsairlines.com/prod/content/airem/autorisation.pdf" target="_blank"><em class="lh lh-arrow-top-right"></em>formulaire<span class="sr-only">Le lien s’ouvrira dans un nouvel onglet de navigateur.</span></a><span style=" background-color: transparent;"> supplémentaire devant être rempli</span></li>'),
    /<li>Un <a href="https:\/\/webv4\.brusselsairlines\.com\/prod\/content\/airem\/autorisation\.pdf">formulaire<\/a> supplémentaire devant être rempli<\/li>/,
  );
});

test('an item that is only a link stays a link item', () => {
  assert.match(run('<li><a href="/de/en/articles/tags/art">Art</a></li><li>Plain text</li>'), /<li><a href="\/de\/en\/articles\/tags\/art">Art<\/a><\/li><li>Plain text<\/li>/);
});

// www's link text inside the link's icon element (/xx/hk/common/seatreservation-condtions/
// seat-reservations: <a href="/xx/hk/terms-of-service-group"><em class="lh lh-arrow-right">旅客和行李的
// 一般承運條件</em></a>): the icon removal took the text, and the link was lost
const runP = (p) => {
  const { document } = parseHTML(`<html><body><div class="accordion"><maui-collapsible class="accordion-maui"><div class="accordionitem"><maui-collapsible-item headline="什麼是座位預訂？"><div><div class="text"><div class="richtext">${p}</div></div></div></maui-collapsible-item></div></maui-collapsible></div></body></html>`);
  parse(document.querySelector('.accordion'), { document });
  return cellsOut[0][1];
};

test('a link whose text sits in its icon element keeps the text', () => {
  assert.match(runP('<p>所有座位預訂均須遵守<a href="/xx/hk/terms-of-service-group"><em class="lh lh-arrow-right">旅客和行李的一般承運條件</em></a>。</p>'), /<p>所有座位預訂均須遵守<a href="\/xx\/hk\/terms-of-service-group">旅客和行李的一般承運條件<\/a>。<\/p>/);
  assert.match(runP('<p>透過<a href="/xx/hk/overview-manage"><em class="lh lh-arrow-right"></em>「我的預訂」</a></p>'), /<p>透過<a href="\/xx\/hk\/overview-manage">「我的預訂」<\/a><\/p>/);
});
