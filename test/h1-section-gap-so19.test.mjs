/* eslint-disable max-len */
/* Standing order 19 of 2026-11-14, item 3: a first section that ends with its H1 (breadcrumb and title) before a
   section that is not flush. Ours: the section gap, 48 px under the H1; www: the H1's own margin, 32 px at 390 and
   40 px at 1440, as ours already has before a flush section (the drift steps of the recorded lufthansa.com
   page-widths: +16 at 390 on 8 of them, +8 at 1440 on 5; before a flush section 0). The rule takes the H1's margin
   (--heading-margin-xxl). On the stopover pages the sidebar with the map then sat 16 px high on phones (gate.mjs:
   "compensation removed", the sidebar's top had cancelled the step): below 768 px it keeps 36 px above (was 20).
   Gate on the 26 recorded page-widths with that structure (16 non-info, 8 on 4 info pages, /de/en/common's 2: a
   title-only page), local render before / after: 16 better by more than 0.5, 10 within, none worse.
   Run: node --test test/h1-section-gap-so19.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (f) => fs.readFileSync(new URL(f, import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('a first section ending with its H1 before a section that is not flush: the H1\'s margin under it', () => {
  assert.ok(read('../styles/styles.css').includes('body.brand-lufthansa main > .section:first-child:where(:has(> .default-content-wrapper:last-child > h1:last-child):not(:has(+ .section.flush))) { margin-bottom: var(--heading-margin-xxl); }'));
});

test('below 768 px the sidebar with the map 36 px under its top', () => {
  assert.ok(read('../blocks/columns-media/columns-media.css').includes('@media (width < 768px) { body.brand-lufthansa .columns-media.sidebar.with-map { padding-top: 36px; } }'));
});
