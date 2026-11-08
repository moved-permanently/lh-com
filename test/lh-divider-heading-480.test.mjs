/* eslint-disable max-len */
/* lufthansa.com's legal pages (the brief after 476, item 2: /de/en/terms-of-use 261 px taller than
   www's at 1440, 40 px more before each numbered heading). www separates the sections with a line
   (.separator .hr, its margin-bottom the space) and the next headline has no margin of its own above.
   Ours wrote the line as a "{divider-N}" paragraph and kept the heading's 40 px top margin (pages
   without flow spacing: legal). A heading right after a divider paragraph has no top margin on
   lufthansa.com (not on Insights articles); flow-spacing pages had none already; other brands as before.
   Run: node --max-old-space-size=256 --test test/lh-divider-heading-480.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('a heading right after a divider paragraph: no top margin on lufthansa.com', () => {
  assert.ok(/body\.brand-lufthansa main:not\(:has\(\.article-header\)\) \.default-content-wrapper > p\.spacer\.divider \+ :is\(h2, h3\) \{ margin-top: 0; \}/.test(css));
});

test('the heading margin elsewhere as before', () => {
  assert.ok(/main \.default-content-wrapper > \* \+ h2 \{ margin-top: var\(--section-padding\); \}/.test(css));
});
