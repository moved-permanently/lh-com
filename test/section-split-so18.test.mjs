/* eslint-disable max-len, import/extensions */
/* Standing order 18 (2026-11-13), item 2: tools/importer/section-split-apply.mjs, the importer's split of an unpadded AEM
   section between two padded ones (test/info-padded-sandwich-so18) for DA's copies imported before: the section holding
   the heading ends right before it, keeping its styles plus "flush"; the part from the heading on gets "spaced". On the
   offline import of /de/en/passengers-with-sensory-impairment before the change it gives the import after it, but for
   the order of the two style words. Everything else byte for byte; not found, twice, or a heading that opens its
   section: no change.
   Run: node --max-old-space-size=256 --test test/section-split-so18.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { applySectionSplit } from '../tools/importer/section-split-apply.mjs';

const ROW = [{ heading: 'Travelling with a companion.', before: 'flush', style: 'spaced' }];
const meta = (s) => `<div class="section-metadata"><div><div>style</div><div>${s}</div></div></div>`;
const sunflower = '<div class="columns-media sidebar"><div><div><h3>Hidden Disabilities Sunflower {heading-small}</h3></div></div></div>';
const companion = '<h3 id="travelling-with-a-companion-heading-small">Travelling with a companion. {heading-small}</h3><p>A travelling companion</p>';

test('DA\'s format: split before the heading, both parts with their section-metadata', () => {
  const doc = `<body><header></header><main><div>${sunflower}${companion}${meta('padded')}</div>\n<div><h3>Dog</h3>${meta('padded')}</div></main></body>`;
  const r = applySectionSplit(doc, ROW);
  assert.equal(r.results[0].result, 'placed');
  assert.equal(r.html, `<body><header></header><main><div>${sunflower}${meta('padded, flush')}</div>\n<div>${companion}${meta('spaced')}</div>\n<div><h3>Dog</h3>${meta('padded')}</div></main></body>`);
});

test('a published .plain.html: the section classes', () => {
  const doc = `<div class="padded">\n  ${sunflower}\n  ${companion}\n</div>\n<div class="padded">\n  <h3>Dog</h3>\n</div>\n`;
  assert.equal(applySectionSplit(doc, ROW).html, `<div class="padded flush">\n  ${sunflower}\n</div>\n<div class="spaced">\n  ${companion}\n</div>\n<div class="padded">\n  <h3>Dog</h3>\n</div>\n`);
});

test('not found, found twice, or the heading opens its section: nothing changes', () => {
  const doc = `<main><div>${sunflower}${companion}${meta('padded')}</div></main>`;
  assert.equal(applySectionSplit(doc, [{ heading: 'Nothing', before: 'flush', style: 'spaced' }]).results[0].result, 'not found');
  const twice = `<main><div>${sunflower}${companion}${meta('padded')}</div><div>${sunflower}${companion}${meta('padded')}</div></main>`;
  assert.equal(applySectionSplit(twice, ROW).html, twice);
  const once = applySectionSplit(doc, ROW).html;
  const again = applySectionSplit(once, ROW);
  assert.equal(again.results[0].result, 'opens its section');
  assert.equal(again.html, once);
});
