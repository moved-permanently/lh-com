/* eslint-disable max-len, import/extensions */
/* Standing order 18 (2026-11-13), item 2: tools/importer/section-style-apply.mjs, a style added to one section of DA's
   copy (passengers-with-sensory-impairment: "Assistance on your trip" and the assistance-dog section get spaced, www's
   .mb-default instead of our section gap): in the section-metadata block in DA's format (a new one when there is none),
   in the classes of a published .plain.html; everything else byte for byte; not found, twice or there already: no
   change.
   Run: node --max-old-space-size=256 --test test/section-style-so18.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { applySectionStyle } from '../tools/importer/section-style-apply.mjs';

const meta = (s) => `<div class="section-metadata"><div><div>style</div><div>${s}</div></div></div>`;
const dog = '<h3>Travelling with an assistance dog {heading-small}</h3><p>Dog</p>';
const assist = '<div class="columns-media padded"><div><div><h2>Assistance on your trip</h2></div></div></div>';

test('DA\'s format: into the section-metadata block, or a new block at the section\'s end', () => {
  const doc = `<body><main><div>${assist}</div>\n<div>${dog}${meta('padded')}</div></main></body>`;
  const r = applySectionStyle(doc, [{ heading: 'Travelling with an assistance dog', add: 'spaced' }, { heading: 'Assistance on your trip', add: 'spaced' }]);
  assert.deepEqual(r.results.map((x) => x.result), ['placed', 'placed']);
  assert.equal(r.html, `<body><main><div>${assist}${meta('spaced')}</div>\n<div>${dog}${meta('padded, spaced')}</div></main></body>`);
});

test('a published .plain.html: the section classes', () => {
  const doc = `<div>\n  ${assist}\n</div>\n<div class="padded">\n  ${dog}\n</div>\n`;
  const r = applySectionStyle(doc, [{ heading: 'Assistance on your trip', add: 'spaced' }, { heading: 'Travelling with an assistance dog', add: 'spaced' }]);
  assert.equal(r.html, `<div class="spaced">\n  ${assist}\n</div>\n<div class="padded spaced">\n  ${dog}\n</div>\n`);
});

test('not found, twice or there already: nothing changes', () => {
  const doc = `<main><div>${dog}${meta('padded, spaced')}</div></main>`;
  assert.equal(applySectionStyle(doc, [{ heading: 'Travelling with an assistance dog', add: 'spaced' }]).results[0].result, 'there already');
  assert.equal(applySectionStyle(doc, [{ heading: 'Nothing', add: 'spaced' }]).results[0].result, 'not found');
  const twice = `<main><div>${dog}${meta('padded')}</div><div>${dog}${meta('padded')}</div></main>`;
  assert.equal(applySectionStyle(twice, [{ heading: 'Travelling with an assistance dog', add: 'spaced' }]).html, twice);
});
