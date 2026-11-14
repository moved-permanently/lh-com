/* eslint-disable max-len, import/extensions -- dev tooling */
/* Standing order 25 (2026-11-14), item 2: the xx business-class pages. Ten of the eleven published xx versions (all but
   xx/es) hold www's two-column view "upgrade to First" (picture | text) and the four-column card view after it in one
   Columns Media block, in one section: an old import (the documents were moved from /xx/<ll>/business-class) merged
   the views, and the picture | text row got four cells, two of them empty, so it drew at quarter width. www has the
   card view in a section of its own, and xx/es's copy has it that way. block-split-apply now also splits a block into a
   new section ("break": "section") and drops the empty cells the merge padded the rows before the split with
   ("trim": true). Input: the end of the published /xx/el/prepare-for-your-trip/travel-classes/business-class
   (aem.live, 2026-11-14; test/fixtures/block-split).
   Run: node --max-old-space-size=256 --test test/block-split-section-so25.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyBlockSplit } from '../tools/importer/block-split-apply.mjs';

const end = fs.readFileSync(new URL('./fixtures/block-split/business-class-el-end.html', import.meta.url), 'utf8');
const ROW = {
  block: 'columns-media', heading: 'Η First Class της Lufthansa', break: 'section', trim: true,
};
const count = (s, re) => (s.match(re) || []).length;

test('the card row goes to a section of its own, the picture | text row keeps its two cells', () => {
  const { html, results } = applyBlockSplit(end, [ROW]);
  assert.deepEqual(results.map((r) => r.result), ['placed, 2 empty cells dropped']);
  const tail = html.slice(html.indexOf('Μια πολυτελής αναβάθμιση') - 2000);
  // the upgrade row: picture cell, text cell, then the row, the block and the section close; a new section and block open
  assert.match(tail, /Αναβάθμιση τώρα<\/a><\/em><\/p>\n {6}<\/div>\n {4}<\/div>\n {2}<\/div>\n<\/div>\n<div>\n {2}<div class="columns-media padded">\n {4}<div>\n {6}<div>/);
  assert.equal(count(html, /<div><\/div>/g), count(end, /<div><\/div>/g) - 2);
  assert.equal(count(html, /<div\b/g), count(end, /<div\b/g) + 2 - 2);
  assert.equal(count(html, /<\/div>/g), count(end, /<\/div>/g) + 2 - 2);
  assert.equal(html.slice(0, html.indexOf('Αναβάθμιση τώρα')), end.slice(0, end.indexOf('Αναβάθμιση τώρα')), 'everything before stays byte for byte');
});

test('as before: a split with a spacer, and rows that change nothing', () => {
  assert.equal(applyBlockSplit(end, [{ block: 'columns-media', heading: 'Η First Class της Lufthansa' }]).results[0].result, 'bad row');
  const twice = applyBlockSplit(end, [ROW, ROW]);
  assert.deepEqual(twice.results.map((r) => r.result), ['placed, 2 empty cells dropped', 'opens its block']);
  assert.equal(applyBlockSplit(end, [{ ...ROW, heading: 'Μια πολυτελής αναβάθμιση' }]).results[0].result, 'opens its block');
  assert.equal(applyBlockSplit(end, [{ ...ROW, heading: 'Nothing' }]).html, end);
  // a block nested in another block (not a section's child) is not split into a section
  const nested = `<div><div class="tabs"><div><div>${end.slice(end.indexOf('<div class="columns-media padded">', end.lastIndexOf('<div>\n  <div class="columns-media')))}</div></div></div>`;
  assert.equal(applyBlockSplit(nested, [ROW]).results[0].result, 'not in a section');
});
