/* eslint-disable max-len */
/* Standing order 49 of 2026-11-17 (delta-so49-rows.txt), lufthansa.com shared stylesheet, hand-over items 23 and 24:
   - an article's Columns Media video with its caption keeps 26px more under the caption (allegris-new-york de/en 1440
     9.57 -> 4.80 %, 390 12.86 -> 5.56; de/de, at/de, gb/en alike);
   - a hub's stage picture section before the blog overview's H1 keeps 40px on phones (explore-flying 390
     19.54 -> 18.23);
   - Discover: a divider-below section's closing divider no longer 16px into the block above (services-long-haul).
   Run: node --max-old-space-size=256 --test test/lh-com-video-caption-hub-stage-so49.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (f) => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('articles: 26px more under a Columns Media video caption', () => {
  assert.ok(read('styles/styles.css').includes('body.brand-lufthansa main:has(.article-header) .columns-media:has(.media-video + p.caption:last-child) { padding-bottom: 26px; }'));
});

test('Discover: a divider-below section keeps its closing divider under the block', () => {
  assert.ok(read('styles/themes/discover.css').includes('body.brand-discover main > .section.divider-below > div:not(.default-content-wrapper) + .default-content-wrapper:last-child:not(:has(> :not(p.spacer))) { margin-top: 0; }'));
});

test('hubs on phones: 40px from the stage picture section to the blog overview', () => {
  assert.ok(read('styles/styles.css').includes('@media (width < 768px) { body.brand-lufthansa main > .section:first-child:has(> .default-content-wrapper:last-child > p:only-child > picture):has(+ .section.blog-overview-container) { margin-bottom: 40px; } }'));
});
