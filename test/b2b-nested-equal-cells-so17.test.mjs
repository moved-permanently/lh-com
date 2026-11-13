/* eslint-disable max-len */
/* Standing order 17 of 2026-11-13, item 1: businesstogo's nested feature block as one change with its delta.
   - The option equal-cells (written by delta-so17-b2b-businesstogo-nested.txt): from 768 px a nested row gives each
     cell it shows an equal column, an empty cell none (www's col-md-6: the text 622 px, ours a third, 408).
   - Cell spacers on B2B ({spacer-N} in a Columns Media text cell) N + 1 px, as lufthansa.com's: the delta puts
     {spacer-39} under each of www's zoom pictures (www's lightbox button keeps 40 px under the picture, its wrapper 40
     more: picture to heading 85 px on www, ours 46). No B2B document had a cell spacer before (census of the 84
     recorded documents), so both rules change no page until the delta is in.
   Run: node --test test/b2b-nested-equal-cells-so17.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/b2b.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('B2B from 768 px: equal-cells rows share the row among the cells they show', () => {
  assert.ok(css.includes('@media (width >= 768px) { body.brand-b2b .columns-media.nested.equal-cells > .columns-media-row { grid-template-columns: none; grid-auto-columns: minmax(0, 1fr); grid-auto-flow: column; } body.brand-b2b .columns-media.nested.equal-cells > .columns-media-row > :empty { display: none; } }'));
});

test('B2B: a cell spacer N + 1 px', () => {
  assert.ok(css.includes('body.brand-b2b .columns-media .columns-media-text > p.spacer { box-sizing: content-box; height: calc(var(--spacer-size, 25px) + 1px); margin: 0; }'));
});

test('the option is not the plain nested one (lufthansa-group-airlines unchanged)', () => {
  assert.ok(!css.includes('body.brand-b2b .columns-media.nested > .columns-media-row { grid-template-columns: none;'));
});
