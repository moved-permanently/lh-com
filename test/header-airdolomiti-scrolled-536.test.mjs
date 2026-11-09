/* eslint-disable max-len */
/* Air Dolomiti's header when the page is scrolled, as www's (the brief after 531, item 1; airdolomiti-parity-002
   /destinations stuck and unstuck at 1440): from 1025 px www's Navbar is 120 px at the top and 80 px once scrolled,
   its logo 51 px then 40 px high (8 px, then 4 px, above the bar's middle), the menu in the middle; the hub's
   booking strip follows it (its fields from the bar's bottom: the strip 30 px from the top). Ours stayed 120 px and
   the strip at 70. Phones (an 80 px bar both times) as before.
   Run: node --max-old-space-size=512 --test test/header-airdolomiti-scrolled-536.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const strip = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');
const header = strip(fs.readFileSync(new URL('../blocks/header/header-airdolomiti.css', import.meta.url), 'utf8'));
const theme = strip(fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8'));
const has = (css, text) => assert.ok(css.includes(text), text);

test('from 1025 px the scrolled bar 80 px, its logo 40 px', () => {
  has(header, '  .header .nav-airdolomiti.is-scrolled .nav-bar {\n    min-height: 80px;\n    padding-block: 10px;\n  }');
  has(header, '  .header .nav-airdolomiti.is-scrolled .nav-brand img {\n    height: 40px;\n    translate: 0 -4px;\n  }');
});

test('the hub\'s strip 30 px from the top under the scrolled bar', () => {
  has(theme, '  body.brand-airdolomiti header:has(.nav-wrapper.is-scrolled) ~ main > .section > .breadcrumb-wrapper + .flight-search-wrapper:has(> .flight-search.airdolomiti.strip) {\n    top: 30px;\n  }');
});
