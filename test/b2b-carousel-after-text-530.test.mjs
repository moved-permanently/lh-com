/* eslint-disable max-len */
/* Group for Business, a card carousel right under text in a white section (the brief after 526, item 1a; B2B row 35):
   www's two-item column view there has its 4rem above (64 px from 768 px, 44 on phones); ours sat in the text's section,
   24 px under it (about-us -2.0 % at 1440, celebrating-shared-stories -2.9 %). In a grey band the band's padding spaces
   it, as before. Measured on b2b.turnsthe.page with the rule, every recorded page at 1440 and 390 against
   b2b-parity-001: 20 of 52 change, none more than 1 % further from www (the most: experts/news and route-network de/en at
   1440, +0.8 points), about-us 1440 -2.0 -> -0.5 %, celebrating-shared-stories -2.9 -> -2.4 %.
   Run: node --max-old-space-size=256 --test test/b2b-carousel-after-text-530.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/b2b.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('row 35: a card carousel under text in a white section: 44 px above it on phones, 64 from 768 px', () => {
  assert.ok(css.includes('body.brand-b2b main > .section:not(.grey) .default-content-wrapper + .carousel-cards-wrapper { margin-top: 44px; }'));
  assert.ok(css.includes('@media (width >= 768px) { body.brand-b2b main > .section:not(.grey) .default-content-wrapper + .carousel-cards-wrapper { margin-top: 64px; } }'));
});
