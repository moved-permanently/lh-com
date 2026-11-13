/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 9 of 2026-11-12, item 1: the B2B heading markers a re-import drops. THEMES.b2b keepSizes
   ['heading-copytext-large']: www's H2s in heading-copytext-large (route-network, businesstogo: 10 on the recorded
   pages) keep their marker through the collapse, the page reads it as the class. Measured as a re-import would write
   them (our host's copies plus every such marker the cleanup writes on the recorded pages): 12 page-widths, 6 better,
   none worse by more than 0.16. Not heading-small: keeping it as well (H1 / H2 / H3 heading-small, 157 markers on 63
   pages) made 22 page-widths better and 9 worse (Allegris intermediaries +4.5, video-gallery +4.3, start-of-booking
   corporates +3.9), so H2 heading-small still goes to the default on a re-import.
   Run: node --test test/b2b-keep-copytext-so9.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { themeFor } from '../scripts/style-markers.js';

const run = (html) => collapseHtml(html, {
  path: '/de/de/travel-management/route-network', brand: 'b2b', parse: parseHTML, force: true,
}).html;

test('THEMES.b2b keeps heading-copytext-large, not heading-small', () => {
  const { keepSizes = [] } = themeFor('b2b');
  assert.ok(keepSizes.includes('heading-copytext-large') && !keepSizes.includes('heading-small'));
});

test('a B2B H2 in heading-copytext-large in a mixed section keeps its marker; an H2 in heading-small goes to the default', () => {
  const html = '<div><h1>Route network</h1><h2>Profitieren Sie von den Vorteilen {heading-copytext-large}</h2><p>Text</p><h2>Other heading</h2><p>More</p><h2>Small one {heading-small}</h2><p>x</p></div>';
  const once = run(html);
  assert.ok(once.includes('Profitieren Sie von den Vorteilen {heading-copytext-large}</h2>'), once.slice(0, 300));
  assert.ok(!once.includes('{heading-small}'), 'heading-small dropped as before');
  assert.ok(run(once).includes('{heading-copytext-large}'), 'second run');
});
