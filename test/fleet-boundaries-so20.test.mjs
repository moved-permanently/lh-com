/* eslint-disable max-len */
/* Standing order 20 of 2026-11-14, item 2: lufthansa.com's fleet pages from 768 px (the drift steps of 320, 32n,
   boeing787 and lufthansa-fleet/351 at 1440): a Columns Media sidebar before a padded section opening with an H2 sat
   14 px nearer on ours (not before a slideshow section: 32n's "Seat maps" is +23 already), and the card carousel
   after the grey column view 16 px nearer. Shipped with boeing787's own row (delta-so20-lh-com-fleet-pair.txt: its
   second Columns Media without padded), which takes away the +25 px that had kept the pair from the gate in order 19.
   Gate on the 7 recorded page-widths the rules or the row reach, rendered from one local folder: 4 better, 3 within,
   none worse.
   Run: node --test test/fleet-boundaries-so20.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('from 768 px: the carousel after a grey column view 16 px further, a sidebar to a padded H2 section 14 px further', () => {
  assert.ok(css.includes('@media (width >= 768px) { body.brand-lufthansa main > .section.grey.column-view:has(> .columns-media-wrapper:last-child > .columns-media:not(.sidebar)) + .section:has(> .default-content-wrapper:first-child > h2:first-child):has(> .carousel-cards-wrapper) { margin-top: calc(var(--section-gap) + 16px); } body.brand-lufthansa main > .section:has(> .columns-media-wrapper:last-child > .columns-media.sidebar) + .section.padded:has(> .default-content-wrapper:first-child > h2:first-child):not(:has(> .carousel-lightbox-wrapper)) { margin-top: calc(var(--section-gap) + 14px); } }'));
});
