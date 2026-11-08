/* Brief 496: campaign pages' spacer and divider paragraphs alone with their marker. The campaign
   template's spacer components (campaign-sections spacerComponent, "{spacer-50}" in a
   .richtext.limited-width) in a block cell came out "{spacer-50} {limited-width}": the cleanup's
   paragraph styles (markParagraphStyles, afterTransform) skip a paragraph that already ends in a
   marker, but read "{spacer-50}" as none (digits), and append the width. scripts.js makes a
   paragraph a spacer only when its marker stands alone, so the pair showed as text
   (/de/de and /at/de/100-years/chronicle, 6 each in lh-snapshots-085). campaign-sections'
   afterTransform (after the cleanup's) keeps a spacer or divider paragraph's own marker and
   drops any other marker after it; a spacer's own words ({spacer-17 from-768}) stay.
   Run: node --max-old-space-size=256 --test test/campaign-spacer-markers-496.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';

const { default: campaignTransform } = await import('../tools/importer/transformers/campaign-sections.js');

const run = (html) => {
  const { document } = parseHTML(`<!DOCTYPE html><html><body><main>${html}</main></body></html>`);
  const main = document.querySelector('main');
  campaignTransform('afterTransform', main, { document });
  return [...main.querySelectorAll('p')].map((p) => p.textContent);
};

test('a spacer or divider paragraph keeps its own marker alone', () => {
  assert.deepEqual(run('<p>{spacer-50} {limited-width}</p><p>{divider-25} {full-width}</p><p>{spacer-40}  {copytext-small full-width}</p>'), ['{spacer-50}', '{divider-25}', '{spacer-40}']);
});

test('a spacer\'s own words stay; other paragraphs and their markers are untouched', () => {
  assert.deepEqual(run('<p>{spacer-17 from-768}</p><p>{spacer-14 from-768} {limited-width}</p><p>Text {limited-width}</p><p>{heading-small} {full-width}</p><p>Before {spacer-50}</p>'), ['{spacer-17 from-768}', '{spacer-14 from-768}', 'Text {limited-width}', '{heading-small} {full-width}', 'Before {spacer-50}']);
});

test('a spacer paragraph with markup in it is left as it is (not a marker paragraph)', () => {
  const { document } = parseHTML('<!DOCTYPE html><html><body><main><p>{spacer-50} <a href="/x">{limited-width}</a></p></main></body></html>');
  const main = document.querySelector('main');
  campaignTransform('afterTransform', main, { document });
  assert.equal(main.querySelector('p').innerHTML, '{spacer-50} <a href="/x">{limited-width}</a>');
});
