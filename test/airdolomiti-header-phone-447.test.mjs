/* eslint-disable max-len */
/* Air Dolomiti's bar below 768 px (styles/themes/airdolomiti.css), brief 447: as www's phone bar
   (airdolomiti-parity-001 at 390, its Navbar_navbar_flex: min-height 80px, padding 20px 15px):
   80 px high, the logo 31 px high (www's ink 169 x 32 at x 19, ours 169 x 31) 19 px from the left,
   20 px above and below the 40 px buttons.
   Run: node --test test/airdolomiti-header-phone-447.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('the phones\' bar 80 px high, the page under it', () => {
  assert.match(css, /body\.brand-airdolomiti \{ --nav-height: 80px;/);
});

test('the bar 20 px above and below, the logo 31 px high 19 px in', () => {
  assert.match(css, /@media \(width < 768px\) \{[^@]*body\.brand-airdolomiti header \{[^}]*--header-bar-padding: 20px 19px;[^}]*--nav-logo-height: 31px;/);
});
