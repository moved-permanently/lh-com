/* eslint-disable max-len */
/* Group for Business contact (de/de and de/en about-us/contact; the brief after 523 item 2, B2B row 34): www's
   PartnerPlusBenefit box (.dcep-ppb-hotlinebox, its maui-headline type h3) draws its title as a B2B h3, 24 px on 28 px
   lines on phones, 28 on 32 from 1281 px, weight 400 (56 px in two lines at 390, 32 at 1440); ours was the finder's own
   18 / 24 bold. And www's box sits 30 px under the section's top at both widths (ours 20 / 40), 48 px under the hours on
   phones (ours 20) and 30 px under its picture from 768 px (ours 40); from 1025 px its text column takes the room beside
   the 640 px picture (the title one line, 539 px at 1440; ours 386 px, two lines). Measured on b2b.turnsthe.page with the
   rule, /de/de/about-us/contact: the box 893 + 500 px at 390 (www 896 + 510), 811 + 487 at 1440 (www 814 + 487), the title
   3 px from www's at both; the page 390 4056 -> 4102 px (www 4153), 1440 3417 -> 3397 (www 3499: the 40 px it lacks after
   the separator under the box were hidden by the box's 20 px too many).
   Run: node --max-old-space-size=256 --test test/b2b-hotline-finder-526.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/b2b.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('row 34: the finder\'s title is a B2B h3 (the l size on l + 4 px lines, 400)', () => {
  assert.match(css, /body\.brand-b2b main \.hotline-finder \.hotline-finder-title \{ font-size: var\(--heading-font-size-l\); font-weight: 400; line-height: calc\(var\(--heading-font-size-l\) \+ 4px\); \}/);
});

test('row 34: www\'s box: 30 px above the title, 48 px under the hours on phones, 30 px under the picture from 768 px', () => {
  assert.match(css, /body\.brand-b2b main > \.section\.hotline-finder-container \{ padding-top: 30px; padding-bottom: 48px; \}/);
  assert.match(css, /@media \(width >= 768px\) \{ body\.brand-b2b main > \.section\.hotline-finder-container \{ padding-bottom: 30px; \} \}/);
});

test('row 34: from 1025 px the text column takes the room beside the picture', () => {
  assert.match(css, /@media \(width >= 1025px\) \{ body\.brand-b2b main \.hotline-finder \{ grid-template-columns: minmax\(0, 1fr\) minmax\(0, 640px\); \} \}/);
});
