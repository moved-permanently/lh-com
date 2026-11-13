/* eslint-disable max-len, import/extensions */
/* Standing order 16 (2026-11-13), item 3: tools/importer/carousel-marks-apply.mjs, the card views' column marks for the
   documents imported without them (the importer change and these rows are held: delta-so16-card-marks-lh-com.txt): the title directly before a
   carousel-cards block gets "column-start" in its marker, the end marker follows the block; everything else stays byte
   for byte, a heading not found, found twice or marked already changes nothing.
   Run: node --max-old-space-size=256 --test test/carousel-marks-apply-so16.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { applyCarouselMarks } from '../tools/importer/carousel-marks-apply.mjs';

const block = '<div class="carousel-cards grid two-up"><div><div><p>a</p></div><div><h3>Children’s menus</h3></div></div><div><div><p>b</p></div><div><h3>Menus</h3></div></div></div>';
const doc = `<div><p>{spacer-40}</p><h2>More information about our in-flight menus {heading-small}</h2>${block}</div>\n<div><h2>Next</h2></div>`;

test('the title gets column-start, the block its end marker; the rest byte for byte', () => {
  const r = applyCarouselMarks(doc, [{ heading: 'More information about our in-flight menus', end: 'column-end column-spaced' }]);
  assert.equal(r.results[0].result, 'placed');
  assert.equal(r.html, `<div><p>{spacer-40}</p><h2>More information about our in-flight menus {heading-small column-start}</h2>${block}<p>{column-end column-spaced}</p></div>\n<div><h2>Next</h2></div>`);
});

test('a title without a marker gets one; DA\'s pretty-printed copies too', () => {
  const pretty = `<div>\n  <h3 id="x">Further information on travel and health</h3>\n  ${block}\n</div>`;
  const r = applyCarouselMarks(pretty, [{ heading: 'Further information on travel and health', end: 'column-end' }]);
  assert.equal(r.results[0].result, 'placed');
  assert.equal(r.html, `<div>\n  <h3 id="x">Further information on travel and health {column-start}</h3>\n  ${block}<p>{column-end}</p>\n</div>`);
});

test('not found, found twice, marked already or an unknown end: nothing changes', () => {
  const rows = (heading, end = 'column-end') => [{ heading, end }];
  assert.equal(applyCarouselMarks(doc, rows('Next')).results[0].result, 'not found', 'a heading without a card block after it');
  const twice = `${doc}${doc}`;
  assert.equal(applyCarouselMarks(twice, rows('More information about our in-flight menus')).html, twice);
  const marked = applyCarouselMarks(doc, rows('More information about our in-flight menus')).html;
  const again = applyCarouselMarks(marked, rows('More information about our in-flight menus'));
  assert.equal(again.results[0].result, 'there already');
  assert.equal(again.html, marked);
  assert.equal(applyCarouselMarks(doc, rows('More information about our in-flight menus', 'column-start')).html, doc);
});
