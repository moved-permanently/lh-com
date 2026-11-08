/* eslint-disable max-len -- dev tooling */
/* Brief 510 item 3 (the Brussels overview rows left open): the space below the last card grid. A page of one section
   with a sidebar intro that ends with its card grid (or the grid and a column mark alone; 202 lh-brussels documents,
   25 recorded): www leaves 61 to 130 px from the last card to the footer at 1440 and 82 to 248 at 390, ours 32 to 52
   and 20 to 48, less on all 25. The median of the differences: 64 px more from 768 px, 130 on phones (mean error 64 ->
   23 px at 1440, 125 -> 45 at 390). inflight-services and online-check-in-options (three sections) stay out.
   Run: node --test test/brussels-overview-bottom-510.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const sel = 'body.brand-brussels main > .section:only-child:has(> .columns-media-wrapper > .columns-media.sidebar):has(> .carousel-cards-wrapper:last-child, > .carousel-cards-wrapper + .default-content-wrapper:last-child > p.column-mark:only-child)';

test('an overview page ending with its card grid: 130 px below it on phones (Brussels only)', () => {
  assert.ok(css.includes(`*/ ${sel} { padding-bottom: 130px; }`));
});

test('from 768 px: 64 px', () => {
  assert.ok(css.includes(`@media (width >= 768px) { ${sel} { padding-bottom: 64px; } }`));
});
