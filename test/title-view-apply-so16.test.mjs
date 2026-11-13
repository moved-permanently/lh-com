/* eslint-disable max-len, import/extensions */
/* Standing order 16 of 2026-11-13, item 3: lhg-history's title sits in a column view on www (the collapse dropped the
   import's marks there), ours 42 px above it at 1440. tools/importer/title-view-apply.mjs: DA's copy plus the delta,
   a {column-start-outer} paragraph right before the document's one H1 (the page opens the view there), into DA's
   own text: the rest byte for byte; a document whose H1 has the marker before it, or with no or two H1s, unchanged.
   Run: node --test test/title-view-apply-so16.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { applyTitleView } from '../tools/importer/title-view-apply.mjs';

const DA = '<body><header></header><main><div><h1 id="t">From the route network &amp; more</h1><p>Intro <a href="/x?a=1&amp;b=2">link</a></p><div class="carousel-cards grid four-up"><div><div>x</div></div></div></div></main><footer></footer></body>';

test('the marker right before the H1, the rest byte for byte', () => {
  const { html, result } = applyTitleView(DA);
  assert.equal(result, '{column-start-outer}');
  assert.equal(html, DA.replace('<h1 id="t">', '<p>{column-start-outer}</p><h1 id="t">'));
});

test('idempotent; no H1 or two: unchanged', () => {
  const once = applyTitleView(DA).html;
  const again = applyTitleView(once);
  assert.equal(again.result, 'present');
  assert.equal(again.html, once);
  const none = DA.replace(/<\/?h1[^>]*>/g, '');
  assert.equal(applyTitleView(none).html, none);
  const two = DA.replace('<p>Intro', '<h1>Again</h1><p>Intro');
  assert.equal(applyTitleView(two).html, two);
  assert.equal(applyTitleView(two).result, 'not one H1');
});
