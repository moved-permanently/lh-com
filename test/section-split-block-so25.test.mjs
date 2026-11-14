/* eslint-disable max-len, import/extensions */
/* Standing order 25 (2026-11-14), item 2: the business-class pages. www has the intro and its picture carousel in a
   padded AEM section and the two-column view "Arrive relaxed" ("Αποβιβαστείτε ξεκούραστα") in the unpadded one after it;
   our copies hold both in one section (style spaced, padded), so the view sits right under the carousel without the
   section's bottom padding: 65 px short at 1440 on xx/el. section-split-apply now also splits before a block
   ({block, heading}: the block's first heading), and such a row may leave the new section without a style. Draft of xx/el
   (with delta-so25-xx-business-class's rows) split there, against lh-snapshots-117: 25.5 / 27.4 -> 13.2 / 17.5 % at
   1440 / 390 (style spaced instead: 16.0 / 20.4).
   Run: node --max-old-space-size=256 --test test/section-split-block-so25.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { applySectionSplit } from '../tools/importer/section-split-apply.mjs';

const intro = '<h2>Travel just the way it suits you</h2><p>Every journey is unique</p>';
const carousel = '<div class="carousel-images"><div><div><picture><img src="./a.jpg" alt=""></picture></div></div></div>';
const arrive = '<div class="columns-media padded"><div><div><picture><img src="./b.jpg" alt=""></picture></div><div><h2>Arrive relaxed</h2><p>Text</p></div></div></div>';
const meta = (s) => `<div class="section-metadata"><div><div>style</div><div>${s}</div></div></div>`;
const ROW = {
  block: 'columns-media', heading: 'Arrive relaxed', before: '', style: '',
};

test('a published .plain.html: split before the block, the new section without a style', () => {
  const doc = `<div class="spaced padded">\n  ${intro}\n  ${carousel}\n  ${arrive}\n</div>\n<div class="column-band grey">\n  <p>Band</p>\n</div>\n`;
  const r = applySectionSplit(doc, [ROW]);
  assert.deepEqual(r.results.map((x) => x.result), ['placed']);
  assert.equal(r.html, `<div class="spaced padded">\n  ${intro}\n  ${carousel}\n</div>\n<div>\n  ${arrive}\n</div>\n<div class="column-band grey">\n  <p>Band</p>\n</div>\n`);
});

test('DA\'s format: the styles stay with the part before, the new section has no metadata block', () => {
  const doc = `<body><header></header><main><div>${intro}${carousel}${arrive}${meta('spaced, padded')}</div><div><p>Band</p>${meta('column-band, grey')}</div></main><footer></footer></body>`;
  const r = applySectionSplit(doc, [ROW]);
  assert.deepEqual(r.results.map((x) => x.result), ['placed']);
  assert.equal(r.html, `<body><header></header><main><div>${intro}${carousel}${meta('spaced, padded')}</div>\n<div>${arrive}</div><div><p>Band</p>${meta('column-band, grey')}</div></main><footer></footer></body>`);
});

test('a block row that opens its section, is not found or is found twice changes nothing; heading rows as before', () => {
  const opens = `<div>\n  ${arrive}\n</div>\n`;
  assert.equal(applySectionSplit(opens, [ROW]).results[0].result, 'opens its section');
  assert.equal(applySectionSplit(`<div>${intro}${carousel}</div>`, [ROW]).results[0].result, 'not found');
  assert.equal(applySectionSplit(`<div>${intro}${arrive}${arrive}</div>`, [ROW]).results[0].result, 'found more than once');
  assert.equal(applySectionSplit(`<div>${intro}${arrive}</div>`, [{ ...ROW, block: 'columns media' }]).results[0].result, 'bad row');
  assert.equal(applySectionSplit(`<div>${intro}${arrive}</div>`, [{ heading: 'Every', before: '', style: '' }]).results[0].result, 'bad row', 'a heading row still needs a style');
  // a block nested deeper (inside another block) is not a section child
  const nested = `<div>${intro}<div class="tabs"><div><div>${arrive}</div></div></div></div>`;
  assert.equal(applySectionSplit(nested, [ROW]).results[0].result, 'not found');
});
