/* eslint-disable max-len */
/* lufthansa.com's rows of column accordions (blocks/accordion-columns option column, the block's
   div.accordion-columns-row; /de/en/articles/tags and /articles/explore-the-world) as www's
   (parity pass 2, brief 424; www's /de/en/articles/tags in lh-parity-003 html/, 1440 and 390):
   each row is a .threecolumn straight in the page column (.column-view padding 2rem / 1rem, 4rem /
   2rem from 768px; items 1rem / 2rem apart) holding its title and the accordions
   (.accordion-maui margin 0 0 2rem, 4rem 0 from 768px; the last components' margins 0). So:
   - the title 64 px under the text before it (44 px on phones), ours 24;
   - 72 px from the title to the accordions from 768px (the title's 32 + 40), ours 32;
   - 30 px between stacked accordions (ours 10), 100 px between the lines of a two-column row at
     tablet;
   - 80 px (40 px) from the row's last accordion to the next heading, ours 24.
   Scoped to body.brand-lufthansa.
   Run: node --max-old-space-size=256 --test test/lufthansa-parity-accordion-row.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/accordion-columns/accordion-columns.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const has = (re, msg) => assert.ok(re.test(css), msg ? `${msg}: ${re}` : String(re));

test('phones: 30 px between the accordions, 40 px below the row, the title 44 px under the text', () => {
  has(/body\.brand-lufthansa main > \.section > \.accordion-columns-row \{ row-gap: 30px; margin-bottom: 40px; \}/);
  has(/body\.brand-lufthansa main > \.section > \.default-content-wrapper:has\(\+ \.accordion-columns-row\) > :is\(h1, h2, h3, h4, h5, h6\):last-child:not\(:first-child\) \{ margin-top: 44px; \}/, 'a title right after other text (not one after a row: the row\'s margin is the space)');
});

test('from 768px: 40 px above the accordions, 80 px below the row, the title 64 px under the text', () => {
  has(/@media \(width >= 768px\) \{[^@]*body\.brand-lufthansa main > \.section > \.accordion-columns-row \{ row-gap: 100px; margin-bottom: 80px; padding-top: 40px; \}/);
  has(/@media \(width >= 768px\) \{[^@]*body\.brand-lufthansa main > \.section > \.default-content-wrapper:has\(\+ \.accordion-columns-row\) > :is\(h1, h2, h3, h4, h5, h6\):last-child:not\(:first-child\) \{ margin-top: 64px; \}/);
});

test('the shared row as before (the brand sites)', () => {
  has(/\.accordion-columns-row \{ display: grid; grid-template-columns: minmax\(0, 1fr\); gap: 10px var\(--grid-gutter\); align-items: start; \}/);
});
