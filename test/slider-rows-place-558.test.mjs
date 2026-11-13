/* eslint-disable max-len */
/* lufthansa.com's two slider options from 1025 px, where they show rows (brief 558 item 4, /<root>/meetings-and-events at
   1440 on nine roots, 9 % off www, ours 109 px short): www's swiper keeps its pagination's place under the rows. The
   steps' three cards (cards-teaser three-up phone-slider): the next view's heading 132 px of ink under the button on
   www, ours 88; the logo strip (columns-media cell-slider, pictures only): 16 px lower and 19 px more under it;
   onboard-delights' media | text slides (10.9 -> 14.9 % at 1440 with it) as before. Spacious rows
   (digital-self-services, 2.9 % at 1440) and phones as before.
   Run: node --max-old-space-size=256 --test test/slider-rows-place-558.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(p, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('cards-teaser phone-slider rows from 1025 px: 44 px under them, not the spacious ones', () => {
  assert.ok(read('../blocks/cards-teaser/cards-teaser.css').includes('@media (width >= 1025px) { body.brand-lufthansa .cards-teaser.phone-slider:not(.spacious) { margin-bottom: 44px; } }'));
});

test('columns-media cell-slider of pictures only, rows from 1025 px: 16 px above, 19 px under', () => {
  assert.ok(read('../blocks/columns-media/columns-media.css').includes('@media (width >= 1025px) { body.brand-lufthansa .columns-media.cell-slider:not(:has(.columns-media-text)) { margin-top: 16px; margin-bottom: 19px; } }'));
});
