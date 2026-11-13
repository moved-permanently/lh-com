/* eslint-disable max-len */
/* Standing order 11 of 2026-11-12, item 3 (Discover): on phones www's column view that follows a text paragraph starts
   about the paragraph's own margin under it (Punta Cana's "Fly from Frankfurt ..." -> "The most beautiful beaches":
   36 px), ours 56 (the margin and the view's 20 px edge). With an 8 px edge there: punta-cana 390 35.84 -> 33.90,
   41.64 -> 40.74; entertainment 32.11 -> 31.25, 23.15 -> 21.86; families 17.78 -> 15.60, 17.41 -> 16.12; customer-service
   +0.25 / +0.35 (no edge at all made those +0.66 / +0.54); the other 18 recorded page-widths at 390 unchanged.
   Run: node --test test/discover-phone-view-after-text-so11.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/discover.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('Discover on phones: a column view right after a text paragraph with an 8 px edge', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-discover main .default-content-wrapper > p:not(.column-mark, .spacer) + p.column-mark.column-start-outer { padding-top: 8px; } }'));
});
