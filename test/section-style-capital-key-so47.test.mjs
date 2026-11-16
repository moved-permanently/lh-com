/* eslint-disable max-len */
/**
 * Standing order 47 (2026-11-16): DA's Cargo copies write the section's style key as "Style" (/en/live-animals:
 * `<div>Style</div><div>grey</div>`). The tool used to miss that block and add a second section-metadata block after it;
 * the style now joins the existing block, and taking it off again gives the copy back.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applySectionStyle } from '../tools/importer/section-style-apply.mjs';

const tabs = '<div class="accordion-columns faq tabs"><div><div>Features</div><div><p>Text</p></div></div></div>';
const meta = (k, v) => `<div class="section-metadata"><div><div>${k}</div><div>${v}</div></div></div>`;
const doc = (m) => `<body><header></header><main><div><h1>Live Animals</h1></div><div>${tabs}${m}</div></main><footer></footer></body>`;

test('a capital Style key: the style joins that block, no second block', () => {
  const r = applySectionStyle(doc(meta('Style', 'grey')), [{ block: 'accordion-columns', add: 'flush' }]);
  assert.equal(r.results[0].result, 'placed');
  assert.equal(r.html, doc(meta('Style', 'grey, flush')));
  assert.equal((r.html.match(/section-metadata/g) || []).length, 1);
});

test('a capital Style key: there already, and remove gives the copy back', () => {
  const placed = doc(meta('Style', 'grey, flush'));
  assert.equal(applySectionStyle(placed, [{ block: 'accordion-columns', add: 'flush' }]).results[0].result, 'there already');
  const back = applySectionStyle(placed, [{ block: 'accordion-columns', remove: 'flush' }]);
  assert.equal(back.results[0].result, 'placed');
  assert.equal(back.html, doc(meta('Style', 'grey')));
});

test('the lowercase key works as before', () => {
  const r = applySectionStyle(doc(meta('style', 'grey')), [{ block: 'accordion-columns', add: 'flush' }]);
  assert.equal(r.html, doc(meta('style', 'grey, flush')));
});
