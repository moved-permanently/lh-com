/* eslint-disable max-len */
/* Brief 500 item 2, /de/en/discover-lufthansa/take-off at 390 (33.9 %, published document and draft alike): option
   spacious, two cards per www row (a two-column view each, straight in the page column). Within a row the cards match
   www (description, link, next picture: 49 / 48 px); from a row's last link to the next row's picture www has 79 px,
   ours 55, at every row boundary (-167 px by the end). overview-travel-information has the same steps (-26 / -29 px).
   Below 768 px a row's first card (but the first) has 66 px above it, was 42.
   Run: node --test test/cards-teaser-spacious-rows-500.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('blocks/cards-teaser/cards-teaser.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('below 768 px: a spacious row\'s first card 66 px under the row above', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-lufthansa .cards-teaser.spacious:not(.overlay, .three-up, .four-up) > ul > li:nth-child(2n + 3) { margin-top: 66px; } }'));
});
