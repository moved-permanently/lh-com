/* Standing order 21 (2026-11-14), item 4: tools/importer/section-join-apply.mjs, the importer's FAQ join
   (test/faq-join-so21) for DA's copies imported before: lhg-wifi's and involuntary-rebooking's "Frequently Asked
   Questions" heading back in one section with its Accordion Columns, the heading's section's styles kept (padded).
   Run: node --test test/section-join-so21.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { applySectionJoin } from '../tools/importer/section-join-apply.mjs';

const meta = (style) => `<div class="section-metadata"><div><div>style</div><div>${style}</div></div></div>`;
const ROW = [{ heading: 'Frequently Asked Questions', block: 'accordion-columns' }];
const ACC = '<div class="accordion-columns faq"><div><div>Q1</div><div>A1</div></div></div>';
const BAND = `<div><h2>Wi-Fi made simple</h2>${meta('flush, column-view, grey')}</div>`;

test('DA\'s format: the accordion moves into the heading\'s padded section, before its metadata', () => {
  const doc = `<body><header></header><main>${BAND}<div><h2 id="faq">Frequently Asked Questions</h2>${meta('padded')}</div><div>${ACC}</div></main><footer></footer></body>`;
  const r = applySectionJoin(doc, ROW);
  assert.equal(r.results[0].result, 'placed');
  assert.equal(r.html, `<body><header></header><main>${BAND}<div><h2 id="faq">Frequently Asked Questions</h2>${ACC}${meta('padded')}</div></main><footer></footer></body>`);
});

test('a published copy\'s shape (classes, pretty-printed): the same', () => {
  const doc = `<div class="padded">\n  <h2 id="faq">Frequently Asked Questions</h2>\n</div>\n<div>\n  ${ACC}\n</div>\n`;
  const r = applySectionJoin(doc, ROW);
  assert.equal(r.results[0].result, 'placed');
  assert.equal(r.html, `<div class="padded">\n  <h2 id="faq">Frequently Asked Questions</h2>\n  ${ACC}\n</div>\n`);
});

test('nothing changes: more than the heading, a styled or marked next section, another block, not found', () => {
  const cases = [
    [`<main><div><h2>Frequently Asked Questions</h2><p>Intro</p>${meta('padded')}</div><div>${ACC}</div></main>`, 'holds more than the heading'],
    [`<main><div><h2>Frequently Asked Questions</h2>${meta('padded')}</div><div>${ACC}${meta('grey')}</div></main>`, 'next section has styles or metadata'],
    [`<main><div><h2>Frequently Asked Questions</h2>${meta('padded')}</div><div>${ACC}<div class="section-metadata"><div><div>markets</div><div>de</div></div></div></div></main>`, 'next section has styles or metadata'],
    [`<main><div><h2>Frequently Asked Questions</h2>${meta('padded')}</div><div><div class="columns-media"><div><div>x</div></div></div></div></main>`, 'next section does not open with the block'],
    [`<main><div><h2>FAQ</h2>${meta('padded')}</div><div>${ACC}</div></main>`, 'not found'],
  ];
  cases.forEach(([doc, result]) => {
    const r = applySectionJoin(doc, ROW);
    assert.equal(r.results[0].result, result, doc);
    assert.equal(r.html, doc);
  });
});
