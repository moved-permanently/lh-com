/* eslint-disable max-len */
/* A heading's icon row only for a heading that opens with its picture (the brief after 509, item 2;
   Air Dolomiti row 74): the icon rule (an icon before the text, brief 404) made every heading holding
   a picture a flex row, so an Air Dolomiti article's h3 with a whole paragraph, bold words and a
   photo at its end (en/articles/destinations/street-food-in-munich) laid each run and bold word out
   side by side, unbroken: the page 813 px wide at 390 (the self-check of the published pages).
   Now the row is for a picture that is the heading's first element, as the icon is.
   Run: node --max-old-space-size=512 --test test/heading-icon-first-510.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('row 74: the icon row for a heading that opens with its picture only', () => {
  assert.ok(css.includes('main .default-content-wrapper :is(h2, h3, h4, h5, h6):has(> picture:first-child) { display: flex; align-items: center; }'));
  assert.ok(!css.includes('main .default-content-wrapper :is(h2, h3, h4, h5, h6):has(> picture) {'));
});
