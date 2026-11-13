/* eslint-disable max-len */
/* Standing order 13 of 2026-11-13, item 3 (Discover): the stage picture under the breadcrumb, at 1440 on all 12 recorded
   stage pages: www's starts 6 px lower than ours (y 192 against 186; the same as the title under the breadcrumb, order
   12), and where the stage is a full-bleed section of its own (business-class, check-in-at-the-airport, punta-cana,
   santorini) www's next text starts 36 px under it (picture's end to the next box), ours the 56 px section gap; there the
   title in the next section keeps www's 60 px under it too (order 12 left titles under a stage at 40: measured alone,
   check-in-at-the-airport was worse). Not where a tab set follows the title's section (www's panel 104 px under the
   tabs, ours 56: check-in-at-the-airport +0.51 with it). From 768 px: a stage picture's wrapper 34 px under the breadcrumb, a stage-only
   section 36 px above the next, the next section's title 60 px above what follows.
   Run: node --test test/discover-stage-so13.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/discover.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const SECTION = 'body.brand-discover main > .section.breadcrumb-container:not(.destination-finder-container)';

test('Discover from 768 px: the stage 6 px lower under the breadcrumb, a stage section 36 px above the next', () => {
  assert.ok(css.includes(`@media (width >= 768px) { ${SECTION} > .breadcrumb-wrapper + .default-content-wrapper:has(> p:first-child > picture) { margin-top: 34px; } ${SECTION}.full-bleed:has(> .breadcrumb-wrapper + .default-content-wrapper:last-child > p:only-child > picture):not(:has(+ .section + .section.section-tabs)) { margin-bottom: 36px; } ${SECTION}.full-bleed:has(> .breadcrumb-wrapper + .default-content-wrapper:last-child > p:only-child > picture):not(:has(+ .section + .section.section-tabs)) + .section > .default-content-wrapper:first-child > h1.heading-large { margin-bottom: 60px; } }`));
});
