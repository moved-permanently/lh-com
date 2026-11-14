/* eslint-disable max-len */
/* Standing order 21 of 2026-11-14, item 1: Group for Business's link-only list as www's .link-list .responsive
   (travel-management: the five "Travel information <airline>" links, b2b-parity-007). www: the links side by side at
   every width (li inline-flex, 2rem to the next; maui-navigation-link at regular weight), the grey band 63 px under
   the row; ours stacked them as a bulleted list with the theme's 60 px separator before the band. The list gets the
   "{links-responsive}" marker (delta-so21-b2b-travel-management.txt), which B2B's theme now draws: no bullets, the
   items inline, the links 14 px regular, and no separator right after such a list at its section's end. No B2B
   document has a link-list marker yet (census of the 86 recorded pages), so nothing else changes. Gate: 1440
   34.73 -> 12.90 %, 390 42.76 -> 21.76 %.
   Run: node --test test/b2b-links-responsive-so21.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/b2b.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('B2B: a links-responsive list without bullets, its items side by side, the links 14 px regular', () => {
  assert.ok(css.includes('body.brand-b2b main ul.links-responsive { padding: 0; list-style: none; }'));
  assert.ok(css.includes('body.brand-b2b main ul.links-responsive > li { display: inline-flex; margin: 0 20px 0 0; }'));
  assert.ok(css.includes('body.brand-b2b main ul.links-responsive > li > a:any-link { font-size: 14px; font-weight: 400; }'));
});

test('B2B: no separator right after such a list at its section\'s end', () => {
  assert.ok(css.includes('body.brand-b2b main .default-content-wrapper > ul.links-responsive + p.spacer:last-child { display: none; }'));
});
