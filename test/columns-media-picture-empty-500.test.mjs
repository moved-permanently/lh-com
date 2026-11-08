/* eslint-disable max-len */
/* Brief 500 item 2, /de/en/100-years/cabin-design at 390 (24.1 %): each decade title ("1920s – 1930s") is a picture in
   a [picture | empty] two-column view on www; below 768 px www stacks the empty column under the picture with its item
   margins, 122 px from the picture to the next heading (ours 70, seven times). Below 768 px a Columns Media row of a
   picture only and an empty cell keeps 52 px under it (as chronicle's jump links in brief 488).
   Run: node --test test/columns-media-picture-empty-500.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('blocks/columns-media/columns-media.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('below 768 px: a [picture | empty] row keeps 52 px under it', () => {
  assert.ok(css.includes('@media (width < 768px) { .columns-media .columns-media-row:has(> .columns-media-media:first-child + .columns-media-text:empty:last-child) { padding-bottom: 52px; } }'));
});
