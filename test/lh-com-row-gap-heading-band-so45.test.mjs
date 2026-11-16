/* eslint-disable max-len */
/* Standing order 45 of 2026-11-16 (delta-so45-rows.txt):
   - lufthansa.com from 768px: a plain Columns Media row whose cells all end with a link keeps 16px more before the
     next row (business-class-on-short-and-medium-haul 1440 13.29 -> 2.70 %);
   - lufthansa.com from 768px: separated rows right after a heading keep 31px above the first row
     (advance-seat-reservation 1440 13.98 -> 7.77);
   - lufthansa.com: a section closing with an outer column view's heading before a grey band keeps only the heading's
     32px (menus-on-long-haul-flights 1440 4.52 -> 1.94, 390 8.89 -> 3.35).
   Run: node --max-old-space-size=256 --test test/lh-com-row-gap-heading-band-so45.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (f) => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('lufthansa.com: 16px more after a row of linked cells, from 768px', () => {
  assert.ok(read('blocks/columns-media/columns-media.css').includes('@media (width >= 768px) { body.brand-lufthansa .columns-media:not(.padded, .sidebar, .separated, .wide-rows) > .columns-media-row:has(> div > p.link-wrapper:last-child):not(:has(> div:not(:empty) > :last-child:not(p.link-wrapper))) + .columns-media-row { margin-top: 16px; } }'));
});

test('lufthansa.com: separated rows after a heading keep the separator above the first row, from 768px', () => {
  assert.ok(read('blocks/columns-media/columns-media.css').includes('@media (width >= 768px) { body.brand-lufthansa main .default-content-wrapper:has(> :is(h2, h3):last-child) + .columns-media-wrapper > .columns-media.separated { padding-top: 31px; } }'));
});

test('lufthansa.com: no section gap between an outer column heading and a grey band', () => {
  assert.ok(read('styles/styles.css').includes('body.brand-lufthansa main > .section:has(> .default-content-wrapper:last-child > h2.column-start-outer:last-child):has(+ .section.grey:not(.flush, .column-view, .column-band, .in-column)) { margin-bottom: 0; }'));
});
