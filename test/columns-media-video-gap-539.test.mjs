/* eslint-disable max-len */
/* The brief after 539, item 1 (lh-parity-004a/b, new-onboard-experience at 390, de/de and gb/en): stacked on phones,
   www has 34 px between a columns-media video and the text under it (the video bottom at 770, the heading's box at
   804). Ours gave the media cell the image's 50 px (.image-wrapper 4rem + 1rem): +17 px. On lufthansa.com a video
   cell gets 34 px; an image cell keeps 50.
   Run: node --test test/columns-media-video-gap-539.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/columns-media/columns-media.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('lufthansa.com on phones: 34 px under a video cell, 50 under an image cell', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-lufthansa .columns-media .columns-media-row > .columns-media-media:not(:last-child):has(.media-video) { margin-bottom: 34px; } }'));
  assert.ok(css.includes('.columns-media .columns-media-row > .columns-media-media:not(:last-child) { margin-bottom: 50px; }'));
});
