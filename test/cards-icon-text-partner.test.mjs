/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The cards-icon-text parser's partner cards (tools/importer/parsers/cards-icon-text.js): a column
   item holds the teaser (a.teaser.partner: icon and heading) and, after it, a text and a button
   (Brussels' gift card page /be/en/book-a-flight/flightvoucher "Your Gift Card": "You'll receive
   the Gift Card immediately…", "Continue"; tools/reports/brussels/parity.md P34). The parser took
   the teaser alone: icon and title, no text, no button. Now the item's text paragraphs and its
   buttons follow in the card (a primary button bold, a secondary one italic, as the other parsers
   write them). A teaser with its own description (lufthansa.com's /digital-self-services) as before.
   Run: node --max-old-space-size=256 --test test/cards-icon-text-partner.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

let cellsOut;
globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { name, variants = [], cells }) => {
      cellsOut = cells.map((row) => row.map((c) => (Array.isArray(c) ? c.map((n) => n.outerHTML).join('') : (c && c.outerHTML) || String(c))));
      const t = document.createElement('table');
      t.innerHTML = `<tr><th>${name} (${variants.join(', ')})</th></tr>`;
      return t;
    },
  },
};
const { default: parse } = await import('../tools/importer/parsers/cards-icon-text.js');

const item = (title, text, button) => `<div class="col-md-6 col-lg column-view-item"><div class="teaser event section"><a class="teaser partner"><h4 class="heading-copytext-large teaser-heading"><img class="icon icon-svg" src="/content/dam/bel/icons/browser_black.svg" alt=""><div class="teaser-heading-text">${title}</div></h4></a></div>${text ? `<div class="text section"><div class="richtext"><p>${text}</p></div></div>` : ''}${button || ''}</div>`;
const run = (items) => {
  const { document } = parseHTML(`<html><body><div class="threecolumn"><div class="column-view"><div><h2 class="heading-small">Your Gift Card</h2></div><div class="row">${items}</div></div></div></body></html>`);
  parse(document.querySelector('.threecolumn'), { document });
  return cellsOut;
};

test('the item\'s text and button follow the teaser in the card', () => {
  const rows = run(item('Digital card', 'You’ll receive the Gift Card immediately', '<div class="link event section"><div class="maui-link"><maui-button-link href="https://voucher.brusselsairlines.com/sn/sales/new?locale=en" type="primary" target="_blank">Continue <span class="sr-only">The link will be opened in a new browser tab</span></maui-button-link></div></div>')
    + item('Do you already have a Gift Card?', 'If you’ve already received a Gift Card, redeem it', '<div class="link event section"><div class="maui-link"><maui-button-link href="/be/en/book-a-flight/flight-search" type="secondary">Redeem now</maui-button-link></div></div>'));
  assert.equal(rows.length, 2);
  assert.equal(rows[0][1], '<h3>Digital card</h3><p>You’ll receive the Gift Card immediately</p><p><strong><a href="https://voucher.brusselsairlines.com/sn/sales/new?locale=en">Continue</a></strong></p>');
  assert.equal(rows[1][1], '<h3>Do you already have a Gift Card?</h3><p>If you’ve already received a Gift Card, redeem it</p><p><em><a href="/be/en/book-a-flight/flight-search">Redeem now</a></em></p>');
});

test('a teaser with its own description, alone in its item: as before', () => {
  const { document } = parseHTML('<html><body><div class="threecolumn"><div class="column-view"><div class="row"><div class="column-view-item"><a class="teaser partner" href="/de/en/app"><h4 class="teaser-heading"><img class="icon-svg" src="/content/dam/lh/icons/app.svg" alt=""><div class="teaser-heading-text">Lufthansa app</div></h4><div class="teaser-description"><p>All in one app</p></div></a></div></div></div></div></body></html>');
  parse(document.querySelector('.threecolumn'), { document });
  assert.equal(cellsOut[0][1], '<h3><a href="/de/en/app">Lufthansa app</a></h3><p>All in one app</p>');
});

/* The column view's own title (the gift card page's "Your Gift Card", h2.heading-small above the
   row; brief 441, item 3): the parser dropped it. It stays before the block with its size class,
   as the icon modules keep theirs. */
test('the column view\'s title stays before the block', () => {
  const { document } = parseHTML(`<html><body><div class="section-content"><div class="threecolumn"><div class="column-view"><div><h2 class="heading-small">Your Gift Card</h2></div><div class="row">${item('Digital card', 'You’ll receive the Gift Card immediately')}</div></div></div></div></body></html>`);
  parse(document.querySelector('.threecolumn'), { document });
  assert.equal(document.querySelector('.section-content').innerHTML, '<h2 class="heading-small">Your Gift Card</h2><table><tr><th>cards-icon-text (partner)</th></tr></table>');
});

test('no title: the block alone', () => {
  const { document } = parseHTML(`<html><body><div class="section-content"><div class="threecolumn"><div class="column-view"><div class="row">${item('The perfect gift', 'Treat someone you love')}</div></div></div></div></body></html>`);
  parse(document.querySelector('.threecolumn'), { document });
  assert.equal(document.querySelector('.section-content').innerHTML, '<table><tr><th>cards-icon-text (partner)</th></tr></table>');
});
