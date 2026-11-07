/* eslint-disable max-len */
/* Air Dolomiti, brief 443 (accessibility pass, axe WCAG 2.2 target-size, serious): the plain
   carousel-cards on the destinations pages (/destinazioni, /en/destinations, /de/reiseziele and a
   destination's page) kept the block's 8 px dots 16 px apart. As the other brands' (test/carousel-
   dots-374.test.mjs, which keeps Air Dolomiti out of the carousel files), each dot is now a 24 px
   target with the 8 px dot drawn in its middle (its border and fill as before, the current one
   filled), the targets touching; in Air Dolomiti's theme. Its promo and destinations sliders show
   no dots (unchanged). Run: node --test test/airdolomiti-a11y-443.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const D = 'body\\.brand-airdolomiti \\.carousel-cards \\.carousel-cards-dot';

test('the dots: 24 px targets touching, the 8 px dot drawn inside as before', () => {
  assert.match(css, /body\.brand-airdolomiti \.carousel-cards \.carousel-cards-dots \{ gap: 0; \}/);
  assert.match(css, new RegExp(`${D} \\{[^}]*display: flex;[^}]*align-items: center;[^}]*justify-content: center;[^}]*width: 24px;[^}]*height: 24px;[^}]*border: 0;[^}]*background: none;`));
  assert.match(css, new RegExp(`${D}::before \\{[^}]*content: "";[^}]*box-sizing: border-box;[^}]*width: 8px;[^}]*height: 8px;[^}]*border: 1px solid var\\(--lh-grey-7\\);[^}]*border-radius: 50%;[^}]*background-color: var\\(--lh-white\\);`));
  assert.match(css, new RegExp(`${D}\\[aria-current="true"\\]::before \\{[^}]*border-color: var\\(--lh-deepblue\\);[^}]*background-color: var\\(--lh-deepblue\\);`));
  assert.match(css, new RegExp(`${D}\\[aria-current="true"\\] \\{[^}]*background: none;`));
});

test('the promo and destinations sliders still without dots', () => {
  assert.match(css, /body\.brand-airdolomiti \.carousel-cards\.destinations \.carousel-cards-dots \{ display: none; \}/);
});
