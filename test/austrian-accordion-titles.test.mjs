/* eslint-disable max-len -- dev tooling */
/* Austrian's accordion titles (brief 445 item 6): every collapsible in austrian-parity-002 (23 captured pages: the
   conditions of carriage's articles, the info pages' questions, new-destinations) wraps as 24 px type does, 52 px
   for a line and 28 more for each further one; brief 386's 18 / 28 regular grey for every faq accordion came from
   the contact page's help topics only. Now the 24 / 28 500 titles with 12 px padding for all, the 18 px regular
   style for the accordion after the help centre app (the 12 contact pages) with its 13 px.
   Run: node --max-old-space-size=256 --test test/austrian-accordion-titles.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('the theme: content accordions\' titles 24 / 28 500 with 12 px padding; the contact topics alone 18 / 28 regular', () => {
  const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
  assert.match(css, /body\.brand-austrian \.accordion-columns \.accordion-columns-title \{ padding-top: 12px; padding-bottom: 12px; font-family: var\(--body-font-family\); font-size: calc\(24px \* var\(--a11y-scale, 1\)\); font-weight: 500; line-height: calc\(28px \* var\(--a11y-scale, 1\)\);/);
  assert.match(css, /body\.brand-austrian \.micro-frontend-wrapper \+ \.accordion-columns-wrapper \.accordion-columns\.faq \.accordion-columns-title \{ padding-top: 13px; padding-bottom: 13px; color: #4d4d4d; font-size: calc\(18px \* var\(--a11y-scale, 1\)\); font-weight: 400; \}/);
  assert.doesNotMatch(css, /body\.brand-austrian \.accordion-columns\.faq \.accordion-columns-title \{/, 'no 18 px rule for every faq accordion');
});
