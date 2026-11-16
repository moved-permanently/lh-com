/* eslint-disable max-len */
/* Standing order 43 of 2026-11-16 (delta-so43-lh-com-rows.txt):
   - Columns Media option map-tight on phones: a sidebar's map cell 8px from the next cell (zugspitze 390 10.07 -> 3.88 %);
   - the closing-mark rule of order 42 not after a column-view section (the lounge roots, 8.20 -> 6.33 % at 390 again).
   Run: node --max-old-space-size=256 --test test/lh-com-map-tight-so43.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (f) => fs.readFileSync(new URL(`../${f}`, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('option map-tight on phones', () => {
  assert.ok(read('blocks/columns-media/columns-media.css').includes('@media (width < 768px) { body.brand-lufthansa .columns-media.sidebar.with-map.map-tight .columns-media-row > div:not(:last-child):has(> .poi-map:last-child) { margin-bottom: 8px; } }'));
});

test('the closing mark keeps 16px before a grey band, not after a column view', () => {
  assert.ok(read('styles/styles.css').includes('@media (width < 768px) { body.brand-lufthansa main > .section:not(.column-view):has(+ .section.grey.column-band) > .default-content-wrapper:last-child > :is(p.column-end, p.column-end-outer):last-child { padding-bottom: 16px; } }'));
});
