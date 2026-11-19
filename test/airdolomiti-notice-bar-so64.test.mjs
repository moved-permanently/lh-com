/* Air Dolomiti's notice above the header (standing order 64, item 2): www.airdolomiti.it's NavbarAllert is a teal bar above
   the header (27 px at 390 on the homepages); ours stood first in the content under it. The flash-teaser block moves it to a
   wrapper first in the body on Air Dolomiti pages (as TAP's alerts bar), the header kept under it; the stage under it the window's
   height less the header and the bar. Measured: the three homepages 1440 16.36 -> 14.87, 17.16 -> 15.72, 16.77 -> 15.35 %,
   390 25.05 -> 23.84, 23.67 -> 22.65, 23.98 -> 22.99 %. Other brands' teasers as before.
   Run: node --test test/airdolomiti-notice-bar-so64.test.mjs */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const js = readFileSync('blocks/flash-teaser/flash-teaser.js', 'utf8');
const css = readFileSync('styles/themes/airdolomiti.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('the block moves the notice above the header on Air Dolomiti pages only', () => {
  assert.ok(js.includes("if (document.body.classList.contains('brand-airdolomiti')) airdolomitiBar(block, view.region, locale);"));
  assert.ok(js.includes("wrapper.className = 'alerts-bar alerts-bar-airdolomiti';"));
  assert.ok(js.includes('document.body.prepend(wrapper);'));
  assert.ok(js.includes("root.style.setProperty('--alerts-bar-height'"));
});

test('the bar teal and white; the stage the window less the header and the bar; the first section without its margin', () => {
  assert.ok(/body\.brand-airdolomiti \.alerts-bar-airdolomiti \{[^}]*background-color: #00889a;/.test(css), 'teal bar');
  assert.ok(css.includes('min-height: calc(100svh - var(--nav-height) - var(--alerts-bar-height, 0px));'), 'stage height');
  assert.ok(css.includes('body.brand-airdolomiti:has(> .alerts-bar-airdolomiti) main > .section:first-child { margin-top: 0; }'));
});
