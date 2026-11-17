/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 10 of 2026-11-12, item 1 (rows-for-ema-test.md row 6), restated by standing order 44 of 2026-11-17
   (token-free content): www.ita-airways.com's column-view headlines come in heading-medium (36 px at 1440) and
   heading-small (28). Order 10 carried them through as " {heading-medium}" / " {heading-small}" markers that the collapse
   kept in a Columns Media cell (THEMES.ita keepSizesIn). Since order 44 no document carries such a marker:
   - ita-import.mjs writes none (the snapshot step is gone from mappedOf);
   - the collapse keeps none in a Columns Media cell (no keepSizesIn);
   - ita.css carries www's heading-medium for a padded column view's H2 (the level's default size there), and the
     theme's heading-small for the other column views (a near value elsewhere).
   Run: node --max-old-space-size=512 --test test/ita-column-view-heading-sizes-so10.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseHTML } from 'linkedom';
import * as ita from '../tools/importer/ita-import.mjs';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { themeFor } from '../scripts/style-markers.js';

test('the import writes no heading-size marker for a column view', () => {
  assert.equal(ita.withColumnViewHeadingSizes, undefined);
  const src = fs.readFileSync(new URL('../tools/importer/ita-import.mjs', import.meta.url), 'utf8');
  assert.doesNotMatch(src, /\{heading-medium\}/);
});

const run = (html, brand) => collapseHtml(html, {
  path: '/it/en/support/utilities/contact', brand, parse: parseHTML, force: true,
}).html;
const doc = '<div><h1>Contact</h1><div class="columns-media"><div><div><h2>Albania {heading-medium}</h2><p>Phone</p></div><div><h2>Related {heading-small}</h2><p>x</p></div></div></div><h2>Outside {heading-small}</h2><p>y</p><h2>Other</h2><p>z</p></div>';

test('the collapse on ITA keeps no size marker in a Columns Media cell', () => {
  assert.equal(themeFor('ita').keepSizesIn, undefined);
  const once = run(doc, 'ita');
  assert.ok(!/\{heading-(medium|small)\}/.test(once), once.slice(0, 400));
  assert.equal(run(once, 'ita'), once, 'second run');
});

test('ita.css: a padded column view\'s unmarked H2 in heading-medium, the other views\' in heading-small', () => {
  const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8');
  assert.match(css, /body\.brand-ita main \.columns-media:not\(\.title-large, \.title-compact, \.sidebar\) \.columns-media-text h2:not\(\[class\*="heading-"\]\) \{\s*font-size: var\(--heading-font-size-l\);/);
  assert.match(css, /body\.brand-ita main \.columns-media\.padded \.columns-media-text h2:not\(\[class\*="heading-"\]\) \{\s*font-size: var\(--heading-font-size-xl\);/);
});
