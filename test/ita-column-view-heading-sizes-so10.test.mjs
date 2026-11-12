/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 10 of 2026-11-12, item 1 (rows-for-ema-test.md row 6): www.ita-airways.com's column-view headlines come
   in two sizes, heading-medium (36 / 39.6 px at 1440) and heading-small (28 / 30.8). The cleanup marks a heading only
   when its size is not its level's default, so an H2 in heading-medium (contact's country headings) came through
   unmarked, and the collapse turned a size one step from the level's default into the default: both sizes left the
   import unmarked, and ita.css (row 31) drew every unmarked Columns Media H2 at heading-small's size.
   - ita-import.mjs (the snapshot step): an H2 in heading-medium inside a column view gets its marker before the
     cleanup (" {heading-medium}"), once;
   - the collapse on ITA keeps heading-medium and heading-small markers inside a Columns Media cell (THEMES.ita
     keepSizesIn), the page reads them as the class; outside a block and on other brands as before.
   Run: node --max-old-space-size=512 --test test/ita-column-view-heading-sizes-so10.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { withColumnViewHeadingSizes } from '../tools/importer/ita-import.mjs';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { themeFor } from '../scripts/style-markers.js';

const view = (inner) => `<div class="twocolumn column event"><div data-identifier="twocolumn" class="column-view flex-column "><div class="row"><div class="col-md-6 col-lg column-view-item">${inner}</div></div></div></div>`;

test('the snapshot step: an H2 in heading-medium in a column view gets its marker, once', () => {
  const html = `${view('<div class="headline"><h2 class="headline heading-medium "> Albania</h2></div>')}<div class="headline"><h2 class="headline heading-medium">Outside</h2></div>`;
  const once = withColumnViewHeadingSizes(html);
  assert.ok(once.includes('Albania {heading-medium}</h2>'), once);
  assert.ok(once.includes('>Outside</h2>'), 'outside a view as it was');
  assert.ok(withColumnViewHeadingSizes(once) === once, 'once');
  const small = view('<div class="headline"><h2 class="headline heading-small">Related</h2></div>');
  assert.ok(withColumnViewHeadingSizes(small) === small, 'heading-small: the cleanup marks it (not the H2 default)');
});

const run = (html, brand) => collapseHtml(html, {
  path: '/it/en/support/utilities/contact', brand, parse: parseHTML, force: true,
}).html;
const doc = '<div><h1>Contact</h1><div class="columns-media"><div><div><h2>Albania {heading-medium}</h2><p>Phone</p></div><div><h2>Related {heading-small}</h2><p>x</p></div></div></div><h2>Outside {heading-small}</h2><p>y</p><h2>Other</h2><p>z</p></div>';

test('the collapse on ITA keeps heading-medium and heading-small in a Columns Media cell', () => {
  assert.deepEqual(themeFor('ita').keepSizesIn, { 'columns-media': ['heading-medium', 'heading-small'] });
  const once = run(doc, 'ita');
  assert.ok(once.includes('Albania {heading-medium}</h2>') && once.includes('Related {heading-small}</h2>'), once.slice(0, 400));
  assert.ok(!once.includes('Outside {heading-small}'), 'outside a block as before (the default)');
  assert.ok(run(once, 'ita').includes('Albania {heading-medium}'), 'second run');
});

test('other brands: the markers in a cell go as before', () => {
  const lh = run(doc, 'lufthansa');
  assert.ok(!lh.includes('{heading-medium}') && !lh.includes('{heading-small}'), lh.slice(0, 300));
});
