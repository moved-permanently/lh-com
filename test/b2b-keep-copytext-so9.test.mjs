/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* Standing order 9 of 2026-11-12, item 1, superseded by standing order 67 (2026-11-17, token-free: no document keeps a
   size marker). Order 9 gave THEMES.b2b keepSizes ['heading-copytext-large'], so www's headings in that size kept their
   {heading-copytext-large} marker through the collapse. Since order 67 B2B keeps no marker: an H3 in that size is a
   choice of its own (compact; in a block the option title-compact, in a section H3 compact), an H2 is H2 compact where
   the section's H2s agree, and an H2 in a mixed section goes to the theme (the documents' rows give such an H2 a section
   of its own: delta-so67-b2b-heading-carriers). heading-small still goes to the default (order 9: 9 page-widths worse).
   Run: node --test test/b2b-keep-copytext-so9.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { themeFor } from '../scripts/style-markers.js';

const run = (html) => collapseHtml(html, {
  path: '/de/de/travel-management/route-network', brand: 'b2b', parse: parseHTML, force: true,
}).html;

test('THEMES.b2b keeps no size marker (order 67)', () => {
  assert.equal(themeFor('b2b').keepSizes, undefined);
  assert.equal(themeFor('b2b', 'flow').keepSizes, undefined);
});

test('a B2B H2 in heading-copytext-large in a mixed section goes to the theme; an H2 in heading-small too; no marker left', () => {
  const html = '<div><h1>Route network</h1><h2>Profitieren Sie von den Vorteilen {heading-copytext-large}</h2><p>Text</p><h2>Other heading</h2><p>More</p><h2>Small one {heading-small}</h2><p>x</p></div>';
  const once = run(html);
  assert.ok(once.includes('<h2>Profitieren Sie von den Vorteilen</h2>'), once.slice(0, 300));
  assert.ok(!/\{heading-/.test(once), 'no size marker left');
  assert.equal(run(once), once, 'second run');
});

test('a B2B H2 in heading-copytext-large alone in its section: H2 compact', () => {
  const once = run('<div><h1>T</h1><p>x</p></div><div><h2>FAQ {heading-copytext-large}</h2><div class="accordion-columns"><div><div>Q</div><div>A</div></div></div></div>');
  assert.ok(once.includes('<h2>FAQ</h2>'), once);
  assert.ok(/<div class="section-metadata"><div><div>Style<\/div><div>h2-compact<\/div><\/div><\/div>/.test(once), once);
});
