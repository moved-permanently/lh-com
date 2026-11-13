/* eslint-disable max-len */
/* Standing order 19, item 2: the Brussels articles' gallery captions once a re-import marks them ("{caption}": p.caption,
   the block's media cell, the caption under the last picture since 50059d38). www (brussels-parity-009, the-gambia and
   vibrant-senegal at 390 and 1440): the caption Intelo bold 16 / 24 px, 15 px under the picture; the two pictures of a
   gallery's right column 30 px apart (.image-wrapper margin-bottom 3rem). lufthansa.com's p.caption is 14 / 18 px,
   10 px under, its stacked pictures 40 px apart. Brussels articles only. Live today: vibrant-senegal (be/fr) already has
   strips of pictures and three captions (1440 -0.42 -> +0.80 %, 390 -1.33 -> -0.70 %); the-gambia unchanged (its
   captions plain text cells until the re-import, reimport-so19-brussels-article-captions.txt); the other 30 recorded
   Brussels pages are no articles. Reads brussels.css as written.
   Run: node --max-old-space-size=256 --test test/brussels-article-captions-so19.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('an article caption 16 / 24 px, 15 px under its picture', () => {
  assert.ok(css.includes('body.brand-brussels main:has(.article-header) .columns-media .columns-media-row p.caption { margin-top: 15px; font-size: 16px; line-height: 24px; }'));
});

test('an article gallery\'s stacked pictures 30 px apart', () => {
  assert.ok(css.includes('body.brand-brussels main:has(.article-header) .columns-media.stacked .columns-media-multi { gap: 30px; }'));
});
