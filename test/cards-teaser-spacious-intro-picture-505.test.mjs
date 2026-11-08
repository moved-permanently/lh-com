/* eslint-disable max-len */
/* Brief 505 item 1, /de/en/discover-lufthansa/take-off at 390 (24.5 %): the page opens with its title, a picture and the
   intro text before the spacious cards; www's image component keeps its 4rem under the picture, ours 24 px: the intro
   16 px higher, every card picture after it misaligned (the bands over the pictures 54-64 %). On a page of spacious
   cards, a picture right after the title, before more content, keeps 40 px under it (the other spacious pages open
   with a heading or text). Below 768 px only: at 1440 it measured worse (19.6 -> 23.1 %).
   Run: node --test test/cards-teaser-spacious-intro-picture-505.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('styles/styles.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('below 768 px: a picture after the title on a page of spacious cards, 40 px under it', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-lufthansa main:has(.cards-teaser.spacious) .default-content-wrapper > h1 + p:is(:has(> picture), :has(> a > picture)):not(:last-child) { margin-bottom: 40px; } }'));
});
