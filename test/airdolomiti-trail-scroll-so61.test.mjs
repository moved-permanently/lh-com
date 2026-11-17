/* eslint-disable max-len */
/* Air Dolomiti's trail never scrolls the page (standing order 61, item 1): the German "Sehenswürdigkeiten" sub-pages'
   four parents need more than 350 px at 390 (3 to 38 px sideways, the current crumb 0 px). The trail list scrolls
   inside itself (no scrollbar drawn), and once it scrolls (a scroll-state container query) the current crumb keeps its
   whole label. A trail that fits is not scrollable, so the query does not apply and it lays out as before.
   Run: node --test test/airdolomiti-trail-scroll-so61.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/airdolomiti.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

test('the trail list scrolls inside itself, a scroll-state container', () => {
  const m = css.match(/(?:^|\})\s*body\.brand-airdolomiti \.breadcrumb ol \{([^}]*overflow-x[^}]*)\}/);
  assert.ok(m, 'rule found');
  ['overflow-x: auto;', 'scrollbar-width: none;', 'container-type: scroll-state;'].forEach((d) => assert.ok(m[1].includes(d), d));
});

test('only a scrolling trail gives the current crumb its whole label', () => {
  const m = css.match(/@container scroll-state\(scrollable: inline\) \{\s*body\.brand-airdolomiti \.breadcrumb li:last-child \{([^}]*)\}\s*\}/);
  assert.ok(m, 'container query found');
  assert.match(m[1], /min-width: max-content;/);
  // outside the query the current crumb still shrinks to an ellipsis (www's Breadcrumbs, AD row 100)
  assert.match(css, /body\.brand-airdolomiti \.breadcrumb li:last-child \{\s*min-width: 0;\s*\}/);
});
