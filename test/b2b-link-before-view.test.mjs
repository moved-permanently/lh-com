/* eslint-disable max-len */
/* The brief after e035d652 / 6a7de8fe, item 2 (Group for Business, B2B theme): a link paragraph right before a column
   view. www's link component has no margin below: travel-id-now-required's "Back to News" sits 40 px over the column
   view (its padding), ours 64 (the paragraph's 24 px and the view's 40), at 1440 and 390 alike (b2b-parity-001). In
   B2B's documents 24 link-only paragraphs stand right before a column start (news articles' Back to News, program
   pages' links).
   Run: node --test test/b2b-link-before-view.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/b2b.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('B2B: a link paragraph right before a column view\'s start has no margin below', () => {
  const sel = 'body.brand-b2b main .default-content-wrapper > p.link-wrapper:has(+ .column-start-outer) {';
  const i = css.indexOf(sel);
  assert.ok(i >= 0, 'the rule');
  assert.match(css.slice(i + sel.length, css.indexOf('}', i)), /^ ?margin-bottom: 0;/);
});
