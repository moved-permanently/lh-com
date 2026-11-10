/* eslint-disable max-len */
/* lufthansa.com on phones: a divider between two spacious teaser grids (brief 558 item 4, /<root>/airport-information's
   airport cards on de/en, de/de, at/de, gb/en): www draws the line 25 px of ink under the last link and the next
   picture 46 px under the line at 390 (lh-parity-004a), ours 12 and 70. Below 768 px the divider's wrapper keeps
   21 px above it and the next grid no wrapper gap. From 768 px as before (1440 measured 5.3 -> 7.3 % with the same).
   Run: node --max-old-space-size=256 --test test/divider-between-grids-558.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/cards-teaser/cards-teaser.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('below 768 px: 21 px above a divider between spacious grids, no gap above the next grid', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-lufthansa main .cards-teaser-wrapper:has(> .cards-teaser.spacious) + .default-content-wrapper:not(:has(> :not(p.spacer.divider))) { margin-top: 21px; } body.brand-lufthansa main .cards-teaser-wrapper:has(> .cards-teaser.spacious) + .default-content-wrapper:not(:has(> :not(p.spacer.divider))) + .cards-teaser-wrapper { margin-top: 0; } }'));
});
