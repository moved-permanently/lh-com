/* eslint-disable max-len */
/* Standing order 38, item 2: cards-teaser option vertical (with overlay, wide). It is www's wide stage teaser with
   .gradient-black-vertical: the tags/allegris pages' "Lufthansa Allegris - The New Long-Haul Experience" is drawn
   under the dark vertical gradient of the overlay tiles, where our wide option draws www's horizontal one (the other
   wide teasers in the snapshots). No published document carried the option before
   delta-so38-allegris-teaser-vertical-lh-com. Run: node --test test/cards-teaser-wide-vertical-so38.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/cards-teaser/cards-teaser.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('option vertical: the overlay tiles\' vertical gradient on a wide teaser', () => {
  assert.ok(css.includes('.cards-teaser.overlay.wide.vertical .cards-teaser-image::after { background-image: linear-gradient(to bottom, #282828e6, #282828cc, #28272899 66%, #28282866); }'));
  assert.ok(css.includes('.cards-teaser.overlay .cards-teaser-image::after { content: ""; position: absolute; inset: 0; background-image: linear-gradient(to bottom, #282828e6, #282828cc, #28272899 66%, #28282866);'));
});

test('a wide teaser without the option keeps www\'s horizontal gradient', () => {
  assert.ok(css.includes('.cards-teaser.overlay.wide .cards-teaser-image::after { background-image: linear-gradient(to right, #282828cc, #28282800 70%); }'));
});
