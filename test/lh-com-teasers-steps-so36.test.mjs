/* eslint-disable max-len */
/* Standing order 36 of 2026-11-16, item 2 (ema-adobe's hand-over), Columns Media on lufthansa.com:
   - from 768px an icon teaser's copytext-medium text 22px above its link (www's 48px text to "Further questions" on
     /de/en/advance-seat-reservations-terms-and-conditions at 1440: 12.18 -> 6.23 %; phones keep the 50px);
   - numbered steps (a text cell opening with its number as a heading-large H3 over an H2, /de/en/farealert/best-price-alert):
     the number 8px further from its heading, a numbered row 14px (phones) / 41px (from 768px) further from the row
     before (1440 11.37 -> 3.57 %, 390 12.77 -> 7.79 %).
   Run: node --max-old-space-size=256 --test test/lh-com-teasers-steps-so36.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/columns-media/columns-media.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const ROW = 'body.brand-lufthansa .columns-media > .columns-media-row:has(> .columns-media-text > h3.heading-large:first-child + h2)';

test('icon teaser text to link 22px from 768px', () => {
  assert.ok(css.includes('@media (width >= 768px) { body.brand-lufthansa .columns-media .columns-media-row > .columns-media-text :is(h3, h4):has(> picture) ~ p.copytext-medium:has(+ p.link-wrapper) { margin-bottom: 22px; } }'));
});

test('numbered steps: the number 8px from its heading, the rows 14 / 41px further apart', () => {
  assert.ok(css.includes('body.brand-lufthansa .columns-media .columns-media-text > h3.heading-large:first-child:has(+ h2) { padding-bottom: 8px; }'));
  assert.ok(css.includes(`${ROW} + .columns-media-row:has(> .columns-media-text > h3.heading-large:first-child + h2) { margin-top: 14px; }`));
  assert.ok(css.includes(`@media (width >= 768px) { ${ROW} + .columns-media-row:has(> .columns-media-text > h3.heading-large:first-child + h2) { margin-top: 41px; } }`));
});
