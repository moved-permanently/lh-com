/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 25 (2026-11-14), item 1: giftvoucher's de card lines through the importer as it runs. The harness
   imported lh-snapshots-083 with the info bundle of 0126d539: no third cells. Cause: the cleanup's beforeTransform
   (markSeparators) drops the 10 px separator between the card and the link component before the parsers run, so the
   parser's linkBelow (card, separator, link) never matched; its unit test fed the parser a DOM that had not gone
   through the transformers. The cleanup's onLoad now marks the link component that follows a card and its separator in
   the same column-view item (data-lh-card-link), and the parser takes a marked link. Input: the card view of 083's
   /de/en/book-and-manage/flights/giftvoucher (test/fixtures/carousel-cards-link-below), through onLoad, beforeTransform
   and the parser, as the bundle runs them.
   Run: node --max-old-space-size=256 --test test/carousel-cards-link-below-cleanup-so25.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

globalThis.WebImporter = {
  Blocks: {
    getMetadata: () => ({}),
    getMetadataBlock: (doc) => doc.createElement('table'),
    createBlock(doc, { name, variants = [], cells }) {
      const t = doc.createElement('table');
      t.setAttribute('data-name', [name, ...variants].join(' '));
      (Array.isArray(cells) ? cells : []).forEach((row) => {
        const tr = doc.createElement('tr');
        row.forEach((c) => {
          const td = doc.createElement('td');
          if (Array.isArray(c)) c.forEach((n) => td.append(n)); else if (c) td.append(c);
          tr.append(td);
        });
        t.append(tr);
      });
      return t;
    },
  },
};
const { default: transform } = await import('../tools/importer/transformers/lufthansa-cleanup.js');
const { default: parse } = await import('../tools/importer/parsers/carousel-cards.js');

const URL_DE_EN = 'https://www.lufthansa.com/de/en/book-and-manage/flights/giftvoucher';
const view = fs.readFileSync(new URL('./fixtures/carousel-cards-link-below/giftvoucher-083-cards.html', import.meta.url), 'utf8');

const run = (html) => {
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main><div class="contentpage"><div class="container-content"><div class="section"><div class=" mb-default "><div class="section-content container-fluid section-regular ">${html}</div></div></div></div></div></main></body></html>`);
  const payload = {
    document, url: URL_DE_EN, params: { originalURL: URL_DE_EN }, template: { name: 'info' },
  };
  transform('onLoad', document.body, payload);
  transform('beforeTransform', document.body, payload);
  const el = document.querySelector('.threecolumn');
  parse(el, { document, url: URL_DE_EN, params: { originalURL: URL_DE_EN } });
  return [...document.querySelectorAll('table[data-name^="carousel-cards"] tr')];
};

test('083\'s cards through the cleanup and the parser: each line a cell of its own after the text', () => {
  const rows = run(view);
  assert.equal(rows.length, 3);
  const below = rows.map((tr) => tr.querySelectorAll('td')[2]);
  assert.deepEqual(below.map((td) => td && td.textContent.replace(/\s+/g, ' ').trim()), ['Visit the FAQs', 'Redeem on Lufthansa.com', 'Buy Gift Card now']);
  assert.ok(!rows.some((tr) => /Continue|new browser tab/.test(tr.textContent)), "the card's hidden text and the screen-reader notes stay out");
});

test('the separator is still dropped, and a link component after a card without a separator stays out as before', () => {
  const noSep = view.replace(/<div class="separator section">.*?<\/maui-divider><\/div> <\/div>/g, '');
  assert.ok(!/separator section/.test(noSep), 'fixture without separators');
  const rows = run(noSep);
  assert.ok(rows.every((tr) => tr.querySelectorAll('td').length === 2), JSON.stringify(rows.map((tr) => tr.querySelectorAll('td').length)));
});
