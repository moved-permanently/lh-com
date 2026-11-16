/* eslint-disable max-len */
/* SWISS (ema-lufthansa, standing order 37 of 2026-11-16, item 3, rank 115): from 1025 px the footer's bottom row is three
   equal columns, as www's subfooter grid (repeat(3, 1fr)), so the legal links keep to the middle third and the German ones
   wrap as www's (www's German footer 622 px at 1440, ours 596 before; sweep-so37-ranks-110-129.md).
   Run: node --test test/swiss-footer-thirds-so37.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/swiss.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('from 1025 px the subfooter is three equal columns', () => {
  assert.ok(css.includes('@media (width >= 1025px) { body.brand-swiss .footer .footer-subfooter { display: grid; grid-template-columns: repeat(3, 1fr); padding: 23px 0 44px; }'));
});

test('the middle column no longer takes the links\' width', () => {
  assert.ok(!css.includes('grid-template-columns: 1fr auto 1fr'));
});
