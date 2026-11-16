/* eslint-disable max-len */
/* Standing order 36, item 4: on lufthansa.com a teaser grid right after a heading has no 32px above its first picture
   from 768px either. www draws that heading inside the grid's .column-view, so the view's padding is above the heading
   (/de/en/flight-search, /de/en/online-check-in: 66px from the heading's ink to the picture, www 32). Gate on the 6
   recorded documents with this pattern: flight-search 1440 10.5 -> 4.6 %, online-check-in 9.8 -> 5.8, the four baggage
   versions unchanged. The 79 unrecorded documents were rendered with and without the rule: no breakage.
   Run: node --test test/cards-teaser-title-view-so36.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/cards-teaser/cards-teaser.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SEL = 'body.brand-lufthansa main .default-content-wrapper:has(> :is(h2, h3, h4, h5, h6):last-child) + .cards-teaser-wrapper > .cards-teaser:not(.overlay, .spacious) > ul { padding-top: 0; }';

test('a teaser grid under its heading: no top padding below 768px (brief 467) and from 768px (standing order 36)', () => {
  assert.ok(css.includes(`@media (width < 768px) { ${SEL} }`));
  assert.ok(css.includes(`@media (width >= 768px) { ${SEL} }`));
  // a grid after a text keeps the 32px
  assert.ok(css.includes('body.brand-lufthansa .cards-teaser:not(.overlay) > ul { padding-top: 32px; }'));
});
