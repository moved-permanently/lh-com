/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The columns-media parser (tools/importer/parsers/columns-media.js): a link component whose button
   has no target (www's /de/en/advance-seat-reservation, the Business Class tab: <maui-button-link
   type="secondary" data-technicalname="login">Book your Privacy Seat now</maui-button-link>, no
   href, lh-snapshots-064) was skipped, so the paragraph DA has as text disappeared. Now its text
   stays as a paragraph (no link: there is none to give); a button with a target as before.
   Run: node --max-old-space-size=256 --test test/columns-media-buttonless-link.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

let cellsOut;
globalThis.WebImporter = {
  Blocks: {
    createBlock: (document, { cells }) => {
      cellsOut = cells.map((row) => row.map((c) => (Array.isArray(c) ? c.map((n) => n.outerHTML || n.textContent).join('') : (c && c.outerHTML) || String(c))));
      return document.createElement('table');
    },
  },
};
const { default: parse } = await import('../tools/importer/parsers/columns-media.js');

const row = (link) => {
  const { document } = parseHTML(`<html><body><div class="section-content"><div class="twocolumn"><div class="column-view"><div class="row"><div class="column-view-item"><div class="image"><img src="https://www.lufthansa.com/a.jpg" alt="Seat"></div></div><div class="column-view-item"><div class="headline"><h3>Privacy Seat</h3></div><div class="text"><div class="richtext"><p>More privacy and peace on your flight.</p></div></div><div class="link event section"><div class="maui-link">${link}</div></div></div></div></div></div></div></body></html>`);
  parse(document.querySelector('.twocolumn'), { document });
  return cellsOut.flat().join('');
};

test('a button without a target: its text as a paragraph', () => {
  assert.match(row('<maui-button-link type="secondary" data-technicalname="login" width="auto" behavior="submit" size="medium" theme="lh">Book your Privacy Seat now </maui-button-link>'), /<p>More privacy and peace on your flight\.<\/p><p>Book your Privacy Seat now<\/p>/);
});

test('a button with a target: the link as before', () => {
  assert.match(row('<maui-button-link href="/de/en/seat" type="secondary">Book now</maui-button-link>'), /<p><em><a href="\/de\/en\/seat">Book now<\/a><\/em><\/p>/);
});
