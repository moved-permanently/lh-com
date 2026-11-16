/* eslint-disable max-len */
/* Standing order 44 of 2026-11-16 (delta-so44-rows.txt):
   - brusselsairlines.com from 768px: two closing buttons of a Columns Media text cell share a line (student-fares);
   - Columns Media option narrow-pictures on phones (child-in-businessclass 390 13.32 -> 8.37 %).
   Run: node --max-old-space-size=256 --test test/brussels-buttons-narrow-pictures-so44.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (f) => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('Brussels: two closing buttons side by side from 768px', () => {
  assert.ok(read('styles/themes/brussels.css').includes('@media (width >= 768px) { body.brand-brussels .columns-media .columns-media-text > :not(p.button-wrapper) + p.button-wrapper + p.button-wrapper:last-child, body.brand-brussels .columns-media .columns-media-text > p.button-wrapper:has(+ p.button-wrapper:last-child):not(:has(+ p.button-wrapper + p.button-wrapper)) { display: inline-block; width: calc(50% - 4px); margin-bottom: 0; vertical-align: top; } }'));
});

test('Columns Media option narrow-pictures on phones', () => {
  const css = read('blocks/columns-media/columns-media.css');
  assert.ok(css.includes('@media (width < 768px) { body.brand-lufthansa .columns-media.narrow-pictures .columns-media-row > .columns-media-media img { width: 260px; max-width: 100%; } body.brand-lufthansa .columns-media.narrow-pictures .columns-media-row > .columns-media-media:first-child { padding-bottom: 25px; } }'));
});
