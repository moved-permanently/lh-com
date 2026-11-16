/* eslint-disable max-len */
/* Standing order 40, item 3: cards-teaser option horizontal (with overlay, the tiles). These are www's tiles with
   .gradient-black-horizontal, dark on the left only (all-it-takes-is-a-yes' "Explore more" tiles); the overlay
   tiles' default stays www's vertical gradient. No published document carried the option before
   delta-so40-aitiay-teaser-gradients-lh-com. Run: node --test test/cards-teaser-tiles-horizontal-so40.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/cards-teaser/cards-teaser.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('option horizontal: the wide teaser\'s horizontal gradient on overlay tiles', () => {
  assert.ok(css.includes('.cards-teaser.overlay.horizontal:not(.wide) .cards-teaser-image::after { background-image: linear-gradient(to right, #282828cc, #28282800 70%); }'));
});

test('the tiles\' default and option vertical as before', () => {
  assert.ok(css.includes('.cards-teaser.overlay .cards-teaser-image::after { content: ""; position: absolute; inset: 0; background-image: linear-gradient(to bottom, #282828e6, #282828cc, #28272899 66%, #28282866);'));
  assert.ok(css.includes('.cards-teaser.overlay.wide.vertical .cards-teaser-image::after {'));
});
