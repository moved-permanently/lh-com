/* eslint-disable max-len, import/extensions -- dev tooling */
/* The library models (tools/library/structure.mjs): how a page block resolves against a model as
   the Block Inspector checks it, and the entries chooseModels gives a variant. Run: node --test test/*.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parse, describeBlockDiv, rowFits, itemsFit, chooseModels, rowIsModel, describeModel,
} from '../tools/library/structure.mjs';

const block = (html) => describeBlockDiv(parse(html).querySelector('body > div'));
const IMG = '<picture><img src="./media_1.jpeg" alt=""></picture>';
// columns-media (sidebar) as the pages use it: image left, text right (two or three fields) …
const left2 = block(`<div class="columns-media sidebar"><div><div>${IMG}</div><div><h3>Title</h3><p>Text</p></div></div></div>`);
const left3 = block(`<div class="columns-media sidebar"><div><div>${IMG}</div><div><h3>Title</h3><p>Text</p><p><a href="/x">More</a></p></div></div></div>`);
// … text left, image right …
const right = block(`<div class="columns-media sidebar"><div><div><h3>Title</h3><p>Text</p></div><div>${IMG}</div></div></div>`);
// … and text in both columns (/de/en/320)
const texts = block('<div class="columns-media sidebar"><div><div><p>Intro</p></div><div><p><a href="/a">A</a></p><p><a href="/b">B</a></p></div></div></div>');

test('rowFits: per cell at least the model\'s fields, the same type at each position', () => {
  assert.ok(rowFits([['image'], ['text', 'text']], left3.rows[0]), 'more text fields than the model: resolves');
  assert.ok(!rowFits([['image'], ['text', 'text', 'text']], left2.rows[0]), 'fewer fields than the model: does not');
  assert.ok(!rowFits([['image'], ['text']], right.rows[0]), 'image and text swapped: does not');
  assert.ok(!rowFits([['image']], left2.rows[0]), 'another cell count: does not');
  assert.ok(rowIsModel([['image'], ['text', 'text']], left2.rows[0]));
  assert.ok(!rowIsModel([['image'], ['text', 'text']], left3.rows[0]), 'one field more than the model');
});

test('chooseModels: the model the most blocks resolve against first, with the fields they all share; then the other structures', () => {
  const blocks = [left2, left3, left2, left3, left3, left3, right, right, right, right, texts];
  const entries = chooseModels(blocks, false, { min: 4 });
  assert.equal(entries.length, 2, 'text in both columns: 1 block of 11, under 4 blocks and a tenth');
  assert.deepEqual(entries[0].model, [[['image'], ['text', 'text']]]);
  assert.equal(entries[0].fit.length, 6);
  assert.deepEqual(entries[1].model, [[['text', 'text'], ['image']]]);
  assert.equal(entries[1].fit.length, 4);
  assert.equal(describeModel(entries[1].model, false), 'text | image');
  assert.equal(chooseModels(blocks, false, { min: 1 }).length, 3, 'with min 1 the third structure gets its entry');
});

test('itemsFit (multi): every row with the item\'s cells resolves; a block without one has nothing to edit', () => {
  const faq = block('<div class="accordion-columns faq"><div><div>Q1</div><div><p>A1</p></div></div><div><div>Q2</div><div><ul><li>a</li></ul></div></div></div>');
  assert.ok(!itemsFit([['text'], ['text']], faq), 'the second item starts with a list');
  assert.ok(itemsFit([['text'], ['text']], block('<div class="accordion-columns"><div><div>Q</div><div><p>A</p><p>B</p></div></div></div>')));
  assert.ok(!itemsFit([['text'], ['text'], ['text']], faq), 'no row with three cells');
  const settings = block('<div class="flight-search"><div><div>Origin</div><div>FRA</div></div><div><div>Destination</div><div>JFK</div></div><div><div>Cabin</div><div>Business</div></div></div>');
  assert.ok(itemsFit([['text'], ['text']], settings), 'key/value settings as items: any number of rows');
});
