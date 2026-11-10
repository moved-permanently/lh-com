/* eslint-disable max-len */
/* Brief 582 item c, B1 of the token-free switch plan: in a view carried by its section (column-view, no marks) the last
   element loses its bottom margin; the sliders' own bottom margins (cell-slider Columns Media 19 px and phone-slider
   Cards Teaser 44 px from 1025 px: www's dots, brief 558) are the marked views' too, so they stay: meetings-and-events
   at 1440 after the switch 8.3 -> 4.7 % (today 3.9). Before the switch: 15 documents have such a view (onboard-delights
   in 15 versions, its last cell-slider); /de/en/onboard-delights measures the same (12.9 / 10.9 %).
   Run: node --max-old-space-size=256 --test test/column-view-slider-margin-582.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('the carrier view\'s last-element reset leaves the sliders\' margins', () => {
  assert.ok(css.includes('body.brand-lufthansa main > .section.column-view:not(.grey, :has(.column-start, .column-end, .column-start-outer, .column-end-outer)) > div:last-child > :last-child:not(.cards-teaser.phone-slider, .columns-media.cell-slider) { margin-bottom: 0; }'));
});
