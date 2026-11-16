/* eslint-disable max-len */
/* Standing order 40 of 2026-11-16 (delta-so40-rows.txt):
   - Columns Media option slider from 1025px (online-check-in's app band): the title at most 450px, the media centred
     (1440 5.79 -> 4.94 %);
   - Group for Business option cover-16x9 from 768px: a media cell picture at least 16:9, cropped to fill
     (entertainment-on-board 1440 22.96 -> 10.52 %);
   - section style gap-after-small-below-768 (manage-my-bookings 390 7.49 -> 6.35 %).
   Run: node --max-old-space-size=256 --test test/lh-com-b2b-so40.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (f) => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('slider band: title width and centred media from 1025px', () => {
  const css = read('blocks/columns-media/columns-media.css');
  assert.ok(css.includes('@media (width >= 1025px) { body.brand-lufthansa .columns-media.slider .columns-media-row > .columns-media-text > h2:first-child { max-width: 450px; } body.brand-lufthansa .columns-media.slider .columns-media-row > .columns-media-media { align-self: center; } }'));
});

test('B2B option cover-16x9 from 768px', () => {
  const css = read('blocks/columns-media/columns-media.css');
  assert.ok(css.includes('@media (width >= 768px) { body.brand-b2b .columns-media.cover-16x9 .columns-media-media:has(img) { container-type: inline-size; } body.brand-b2b .columns-media.cover-16x9 .columns-media-media img { min-height: calc(100cqi * 9 / 16); object-fit: cover; } }'));
});

test('section style gap-after-small-below-768', () => {
  assert.ok(read('styles/styles.css').includes('@media (width < 768px) { body.brand-lufthansa main > .section.gap-after-small-below-768 { margin-bottom: 24px; } }'));
});
