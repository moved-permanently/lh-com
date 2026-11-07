/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* The columns-media parser (brief 454 item 5, Austrian's /at/en/discover/inspiration, +20 % at 1440): www's two-column
   view holds one teaser (picture, heading, text, link) and an empty item, so the teaser takes half the width from
   768 px. The parser dropped the empty item and the one cell ran the full width. Now a two-column view of exactly two
   items, one of them empty, keeps the empty cell; three- and four-column views and full rows as before.
   Run: node --max-old-space-size=256 --test test/columns-media-half-alone.test.mjs */
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

const teaser = '<div class="column-view-item"><div class="image"><img src="https://www.austrian.com/a.jpg" alt=""></div><div class="headline"><h2>Travel with Austrian</h2></div><div class="text"><div class="richtext"><p>Our focus is on the needs of our guests.</p></div></div></div>';
const empty = '<div class="column-view-item"></div>';
const text = (t) => `<div class="column-view-item"><div class="text"><div class="richtext"><p>${t}</p></div></div></div>`;
const rows = (cls, items) => {
  const { document } = parseHTML(`<html><body><div class="section-content"><div class="${cls} column"><div class="column-view"><div class="row">${items.join('')}</div></div></div></div></body></html>`);
  parse(document.querySelector(`.${cls}`), { document });
  return cellsOut;
};

test('a two-column view of a teaser and an empty item: two cells, the second empty (half the width as www)', () => {
  const out = rows('twocolumn', [teaser, empty]);
  assert.equal(out.length, 1);
  assert.equal(out[0].length, 2);
  assert.match(out[0][0], /Travel with Austrian/);
  assert.equal(out[0][1], '');
  const left = rows('twocolumn', [empty, teaser]);
  assert.deepEqual([left[0].length, left[0][0]], [2, ''], 'the empty item first: in its place');
});

test('otherwise as before: two filled items; a three-column view with one empty item', () => {
  assert.equal(rows('twocolumn', [teaser, text('Beside')])[0].length, 2);
  const three = rows('threecolumn', [text('One'), text('Two'), empty]);
  assert.equal(three[0].length, 2, 'the empty item of a three-column view still dropped');
});
