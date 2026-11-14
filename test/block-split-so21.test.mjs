/* Standing order 21 (2026-11-14), item 3: tools/importer/block-split-apply.mjs, the importer's change (no merge of column
   views across a kept spacer, test/columns-media-kept-spacer-so21) for DA's copies imported before:
   delayed-baggage-lhg's Columns Media split before "SWISS" and before "Lufthansa City", one of the two {spacer-100}
   after the block moved into each gap. Applied to a published copy's shape and DA's, it gives what a fresh import
   writes: three blocks, a {spacer-100} between them, none at the end.
   Run: node --test test/block-split-so21.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { applyBlockSplit } from '../tools/importer/block-split-apply.mjs';

const card = (name) => `<div><h3 id="${name.toLowerCase()}">${name} {heading-medium}</h3><p><a href="https://mybag.aero/${name}">Report delayed baggage</a></p></div>`;
const rowOf = (names) => `<div>${names.map(card).join('')}</div>`;
const ROWS = [
  { block: 'columns-media', heading: 'SWISS', spacer: 'spacer-100' },
  { block: 'columns-media', heading: 'Lufthansa City', spacer: 'spacer-100' },
];
const A = rowOf(['Austrian', 'Brussels', 'Lufthansa']);
const S = rowOf(['SWISS', 'Dolomiti', 'Edelweiss']);
const C = rowOf(['Lufthansa City']);
const block = (rows) => `<div class="columns-media padded">${rows.join('')}</div>`;
const sp = '<p>{spacer-100}</p>';
const meta = '<div class="section-metadata"><div><div>style</div><div>flush</div></div></div>';

test('DA\'s format: the block split at both rows, the spacers between the blocks, none after them', () => {
  const doc = `<body><header></header><main><div><p>Report it.</p><p>{spacer-60}</p>${block([A, S, C])}${sp}${sp}${meta}</div></main><footer></footer></body>`;
  const r = applyBlockSplit(doc, ROWS);
  assert.deepEqual(r.results.map((x) => x.result), ['placed', 'placed']);
  assert.equal(r.html, `<body><header></header><main><div><p>Report it.</p><p>{spacer-60}</p>${block([A])}${sp}${block([S])}${sp}${block([C])}${meta}</div></main><footer></footer></body>`);
});

test('a published copy\'s shape (pretty-printed): the same, the new tags on lines of their own', () => {
  const doc = `<div>\n  <div class="columns-media padded">\n    ${A}\n    ${S}\n  </div>\n  ${sp}\n</div>\n`;
  const r = applyBlockSplit(doc, [ROWS[0]]);
  assert.equal(r.results[0].result, 'placed');
  assert.equal(r.html, `<div>\n  <div class="columns-media padded">\n    ${A}\n</div>\n${sp}\n<div class="columns-media padded">\n    ${S}\n  </div>\n</div>\n`);
});

test('nothing changes when the row is not found, opens its block, or no such spacer follows the block', () => {
  const doc = `<main><div>${block([A, S])}<p>{spacer-40}</p></div></main>`;
  const r = applyBlockSplit(doc, [
    { block: 'columns-media', heading: 'Edelweiss air', spacer: 'spacer-100' },
    { block: 'columns-media', heading: 'Austrian', spacer: 'spacer-100' },
    { block: 'columns-media', heading: 'SWISS', spacer: 'spacer-100' },
    { block: 'columns-media', heading: 'SWISS' },
  ]);
  assert.deepEqual(r.results.map((x) => x.result), ['not found', 'opens its block', 'no such paragraph after the block', 'bad row']);
  assert.equal(r.html, doc);
});

test('only the named block: a heading in another block or a block whose name only starts the same does not count', () => {
  const doc = `<main><div><div class="columns-media-x">${A}${S}</div>${sp}</div></main>`;
  assert.equal(applyBlockSplit(doc, [ROWS[0]]).results[0].result, 'not found');
});
