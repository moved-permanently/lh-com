/* eslint-disable max-len, import/no-extraneous-dependencies -- dev tooling; linkedom is a dev dependency */
/* Standing order 18 (2026-11-13), item 1: /de/en/childrens-menus-on-board's grey band ("Catering on board") sat 17px
   (1440) / 15px (390) higher than www's. www ends the Kids Box AEM section (no .mb-default) with a 40px separator
   (.hr-no-layout, inline margin-bottom: it beats www's last-component reset) right after the Kids Box column view, then
   starts a new AEM section without .mb-default whose first component is the grey column view. The cleanup dropped the
   separator as normal component spacing. Kept now as "{spacer-N}" at the end of the view's section, as standing order
   14's separator before a column view (test/end-separator-so14); styles.css lets such a separator after a padded
   Columns Media before a grey column band take the block's 8px bottom too (measured: the band's title 0 / +2px off
   www's at 1440 / 390). The band's own end separator (before "Baby food") stays as it was.
   Input: the two AEM sections of the childrens-menus-on-board snapshot (test/fixtures/band-separator-so18).
   Run: node --max-old-space-size=256 --test test/band-separator-so18.test.mjs */
/* global globalThis */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import transform from '../tools/importer/transformers/lufthansa-cleanup.js';

globalThis.WebImporter = { Blocks: { getMetadata: () => ({}), getMetadataBlock: (document) => document.createElement('table') } };

const URL_CM = 'https://www.lufthansa.com/de/en/childrens-menus-on-board';
const fixture = fs.readFileSync(new URL('./fixtures/band-separator-so18/childrens-menus.html', import.meta.url), 'utf8').replace(/^<!--.*-->\n/, '');
// the separator paragraphs, each with the text before and after it in document order
const separators = (html, template = 'info') => {
  const { document } = parseHTML(`<html><head><title>Children's menus | Lufthansa</title></head><body><main><div class="container-content">${html}</div></main></body></html>`);
  const payload = {
    document, url: URL_CM, params: { originalURL: URL_CM }, template: { name: template, blocks: [] },
  };
  transform('beforeTransform', document.body, payload);
  transform('afterTransform', document.body, payload);
  const leaves = [...document.querySelectorAll('body *')].filter((e) => !e.children.length && e.textContent.trim());
  return leaves.map((e, i) => [e, i]).filter(([e]) => /^\{(spacer|divider)-/.test(e.textContent.trim()))
    // (the text before it: not a marker paragraph, the view's own "{column-end}" without the parsers)
    .map(([e, i]) => [leaves.slice(0, i).map((l) => l.textContent.trim()).filter((t) => !/^\{[a-z0-9 -]+\}$/.test(t)).pop(), e.textContent.trim(), leaves[i + 1] ? leaves[i + 1].textContent.trim() : '']);
};

test('the separator that ends the view\'s AEM section before the grey band stays as {spacer-40}; the band\'s own as before', () => {
  assert.deepEqual(separators(fixture), [
    ['Culinary Journey', '{spacer-40}', 'Catering on board: tailored completely to your wishes'],
    ['To Culinary Journey', '{spacer-40}', ''],
  ]);
});

test('not when the view\'s AEM section has .mb-default, not before an AEM section that does not open with a grey view, not on hub', () => {
  const withMb = fixture.replace(/^<div class="section"><div class=" {2}">/, '<div class="section"><div class=" mb-default ">');
  assert.notEqual(withMb, fixture, 'the fixture changed');
  assert.deepEqual(separators(withMb), [['To Culinary Journey', '{spacer-40}', '']]);
  const notGrey = fixture.replace('column-view  flex-column container-gray full-width-bg', 'column-view  flex-column');
  assert.notEqual(notGrey, fixture, 'the fixture changed');
  assert.ok(!separators(notGrey).some(([before]) => before === 'Culinary Journey'));
  assert.ok(!separators(fixture, 'hub').some(([before]) => before === 'Culinary Journey'));
});
