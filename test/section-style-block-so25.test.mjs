/* eslint-disable max-len, import/extensions */
/* Standing order 25 (2026-11-14), item 2: the xx business-class pages start 25 px low at 1440 (20 px at 390). www
   draws their stage right under the sub-navigation bar (.contentpage.pt-0 in all eleven lh-snapshots-117 recordings);
   brief 582's rule (style flush on the bar's section, styles.css) does that for ours, but nine of the eleven published
   copies were imported before it and have no flush (xx/es and xx/fr have it). The bar's section has no heading, so
   section-style-apply now also finds a section by its first block ("block": "profile-nav") instead of a heading, and
   takes a style off ("remove": the old import's before-padded on the first stage, which the current import does not
   write).
   Run: node --max-old-space-size=256 --test test/section-style-block-so25.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { applySectionStyle } from '../tools/importer/section-style-apply.mjs';

const nav = '<div class="profile-nav"><div><div><ul><li><a href="/xx/el/first-class">First Class</a></li></ul></div></div></div>';
const stage = '<div class="hero-campaign"><div><div><h1>Η Business Class της Lufthansa</h1></div></div></div>';
const ROW = { block: 'profile-nav', add: 'flush' };

test('a published .plain.html: the bar\'s section gets the class, the rest byte for byte', () => {
  const doc = `<div>\n  ${nav}\n</div>\n<div class="before-padded stage">\n  ${stage}\n</div>\n`;
  const r = applySectionStyle(doc, [ROW]);
  assert.deepEqual(r.results.map((x) => x.result), ['placed']);
  assert.equal(r.html, `<div class="flush">\n  ${nav}\n</div>\n<div class="before-padded stage">\n  ${stage}\n</div>\n`);
});

test('DA\'s format: a new section-metadata block at the section\'s end', () => {
  const doc = `<body><header></header><main><div>${nav}</div><div>${stage}</div></main><footer></footer></body>`;
  const r = applySectionStyle(doc, [ROW]);
  assert.equal(r.html, `<body><header></header><main><div>${nav}<div class="section-metadata"><div><div>style</div><div>flush</div></div></div></div><div>${stage}</div></main><footer></footer></body>`);
});

test('only the section whose first block it is; there already, not found or twice: no change', () => {
  const later = `<div>\n  <p>Intro</p>\n  ${nav}\n</div>\n`;
  assert.equal(applySectionStyle(later, [ROW]).results[0].result, 'not found');
  const flush = `<div class="flush">\n  ${nav}\n</div>\n`;
  assert.equal(applySectionStyle(flush, [ROW]).results[0].result, 'there already');
  assert.equal(applySectionStyle(`<div>${nav}</div><div>${nav}</div>`, [ROW]).results[0].result, 'found more than once');
  assert.equal(applySectionStyle(`<div>${nav}</div>`, [{ block: 'profile nav', add: 'flush' }]).results[0].result, 'bad row');
  // the heading rows as before
  assert.equal(applySectionStyle(`<div>${stage}</div>`, [{ heading: 'Η Business Class', add: 'flush' }]).results[0].result, 'placed');
});

test('remove: the class or the section-metadata entry goes; a section without it changes nothing', () => {
  const doc = `<div class="before-padded stage">\n  ${stage}\n</div>\n`;
  const r = applySectionStyle(doc, [{ heading: 'Η Business Class', remove: 'before-padded' }]);
  assert.deepEqual(r.results.map((x) => x.result), ['placed']);
  assert.equal(r.html, `<div class="stage">\n  ${stage}\n</div>\n`);
  assert.equal(applySectionStyle(r.html, [{ heading: 'Η Business Class', remove: 'before-padded' }]).results[0].result, 'not there');
  assert.equal(applySectionStyle(`<div class="stage">${stage}</div>`, [{ heading: 'Η Business Class', remove: 'stage' }]).html, `<div>${stage}</div>`);
  const meta = (x) => `<div class="section-metadata"><div><div>style</div><div>${x}</div></div></div>`;
  const da = (x) => `<body><main><div>${stage}${x}</div></main></body>`;
  assert.equal(applySectionStyle(da(meta('before-padded, stage')), [{ heading: 'Η Business Class', remove: 'before-padded' }]).html, da(meta('stage')));
  assert.equal(applySectionStyle(da(meta('before-padded')), [{ heading: 'Η Business Class', remove: 'before-padded' }]).html, da(''));
  assert.equal(applySectionStyle(da(''), [{ heading: 'Η Business Class', add: 'flush', remove: 'stage' }]).results[0].result, 'bad row');
});
