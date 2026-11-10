/* eslint-disable max-len */
/* lufthansa.com's accordion titles on phones (brief 557): www's collapsible header insets its title 20 px on both sides
   below 768 px (text at x 42 at 390, the chevron 20 px from the right; /de/de/lounges' Lounge-News, every recorded FAQ
   page), ours 12 px (text at x 34): our titles ran 16 px wider and wrapped into fewer lines (lounges: 20 px short in
   the finder band). 1440 has 12 px on both (text at x 101 on www and ours). Option spaced only (the 80 recorded accordion pages: net -25
   points on the 45 spaced ones, +3.3 on the rest). Other brands as before.
   Run: node --max-old-space-size=256 --test test/accordion-title-inset-557.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/accordion-columns/accordion-columns.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('below 768 px lufthansa.com spaced accordions: titles 20 px in from both sides, the chevron too', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-lufthansa .accordion-columns.spaced .accordion-columns-title { padding-right: 56px; padding-left: 20px; } body.brand-lufthansa .accordion-columns.spaced .accordion-columns-title::after { right: 20px; } }'));
});

test('the base title keeps 12 px', () => {
  assert.ok(css.includes('padding: 13px 48px 13px 12px;'));
});
