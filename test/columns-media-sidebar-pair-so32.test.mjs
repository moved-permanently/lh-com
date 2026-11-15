/* eslint-disable max-len */
/* Standing order 32, item 2: on phones a sidebar columns-media that opens with its picture right after a padded one
   (the 100-years pages' chapters) sits 21px lower, as www (69px from the padded view's last line, ours 48); a sidebar
   that opens with text (100-years/chronicle) as before. Gate (injected, recordings, 390): 100-years/destinations
   12.1-12.3 -> 8.0-8.1 % in de/en, de/de, at/de, gb/en; 9 other recorded pages the same. Without the picture-first
   condition chronicle went 7.8 -> 9.8.
   Run: node --test test/columns-media-sidebar-pair-so32.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/columns-media/columns-media.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('phones: a picture-first sidebar after a padded view 41px from its top', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-lufthansa main .columns-media-wrapper:has(> .columns-media.padded) + .columns-media-wrapper > .columns-media.sidebar:has(> .columns-media-row.columns-media-media-first:first-child) { padding-top: 41px; } }'));
  assert.ok(css.includes('.columns-media.sidebar { padding: 20px 0 36px; }'), 'the default as before');
});
