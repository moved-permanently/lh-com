/* eslint-disable max-len */
/* Brief 582 item c, the token-free switch plan's B1 (the column view carrier on hub pages): the hub documents hold each
   www column view as a flush column-view padded section opening with a separator block; the collapse splits that
   separator into a section of its own that keeps the view's classes, so it got the view's padding (20/20 px at 390,
   40/40 from 768 px) and the view before it its 48 px section gap: digital-self-services +281 px at 390, +393 at 1440
   after the switch. A column-view section holding only a separator: no padding, no gap; one right after another view:
   margin-top -48px. No published document has such a section before the switch (census of 6,826).
   Run: node --max-old-space-size=256 --test test/column-view-separator-582.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/styles.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('a separator-only column-view section: no padding, no gap; after a view: -48px', () => {
  assert.ok(css.includes('body.brand-lufthansa main > .section.column-view:not(.grey):has(> .default-content-wrapper:only-child > p.spacer:only-child) { padding-top: 0; padding-bottom: 0; margin-bottom: 0; }'));
  assert.ok(css.includes('body.brand-lufthansa main > .section.column-view:not(.grey) + .section.column-view:not(.grey):has(> .default-content-wrapper:only-child > p.spacer:only-child) { margin-top: -48px; }'));
});
