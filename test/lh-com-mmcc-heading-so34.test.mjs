/* eslint-disable max-len */
/* Standing order 34 of 2026-11-15, item 1: "Find the right Miles & More Credit Card for your needs" on phones in www's three
   lines. www keeps "More Credit Card" together with non-breaking spaces; DA drops them from headings when a document is
   saved, so the heading is 318px wide below 768px (it breaks after "&" as www's). lufthansa.com only; the heading's id is
   in /de/en and /gb/en/discover-lufthansa/miles-and-more-credit-card. 390: 19.10 -> 15.58 % against lh-parity-002.
   Run: node --max-old-space-size=256 --test test/lh-com-mmcc-heading-so34.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('the heading 318px wide on phones only', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-lufthansa main .default-content-wrapper > h2[id="find-the-right-miles--more-credit-card-for-your-needs"] { max-width: 318px; } }'));
});
