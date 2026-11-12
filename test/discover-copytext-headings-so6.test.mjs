/* eslint-disable max-len, import/no-extraneous-dependencies, import/extensions -- dev tooling; linkedom is a dev dependency */
/* rows-for-ema-test.md row 3 (standing order 6 of 2026-11-12, item 2): www's Discover headings marked
   heading-copytext-large (16 / 18 px bold) lost their size in the collapse (in blocks, and where a section's headings
   disagree). THEMES.discover keepSizes: the collapse keeps the {heading-copytext-large} marker on the heading, which
   scripts.js decorateTextStyles turns into the class (Discover's 16 to 18 px bold); other sizes and brands as before. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { collapseHtml } from '../tools/importer/marker-collapse.mjs';
import { themeFor, HEADING_STYLE } from '../scripts/style-markers.js';

const run = (html, brand = 'discover') => collapseHtml(html, {
  path: '/de/en/travel-inspiration/inspiration/destinations/punta-cana', brand, parse: parseHTML, force: true,
}).html;

test('Discover keeps heading-copytext-large: in a mixed section, in a block, on an eyebrow; idempotent', () => {
  assert.deepEqual(themeFor('discover').keepSizes, ['heading-copytext-large']);
  const mixed = run('<div><h1>Punta Cana</h1><h2>Useful to know {heading-copytext-large}</h2><p>x</p><h2>Best time</h2><p>y</p></div>');
  assert.equal(mixed.includes('<h2>Useful to know {heading-copytext-large}</h2>'), true);
  assert.equal(mixed.includes('<h2>Best time</h2>'), true);
  const block = run('<div><h1>T</h1><div class="columns-media"><div><div><h3>Seats {heading-copytext-large}</h3><p>x</p></div><div><h3>Food</h3><p>y</p></div></div></div></div>');
  assert.equal(block.includes('<h3>Seats {heading-copytext-large}</h3>'), true);
  const eyebrow = run('<div><h1>Punta Cana</h1><h2>Your dream destination {heading-copytext-large}</h2><p>x</p></div>');
  assert.equal(eyebrow.includes('<h2>Your dream destination {heading-copytext-large}</h2>'), true, 'the marker, not a section style');
  assert.equal(eyebrow.includes('h2-compact'), false);
  assert.equal(run(mixed), mixed, 'a second run leaves it');
  // a heading with a link keeps its marker after the link
  const link = run('<div><h1>T</h1><h2><a href="/x">Go</a> {heading-copytext-large}</h2><p>x</p><h2>B</h2><p>y</p></div>');
  assert.equal(/<h2><a href="\/x">Go<\/a> \{heading-copytext-large\}<\/h2>/.test(link), true);
});

test('the kept marker is one the page reads as the class', () => {
  assert.equal(HEADING_STYLE.test('Useful to know {heading-copytext-large}'), true);
});

test('other sizes on Discover and other brands as before', () => {
  const small = run('<div><h1>T</h1><h2>A {heading-small}</h2><p>x</p><h2>B</h2><p>y</p></div>');
  assert.equal(small.includes('{heading-small}'), false);
  ['lufthansa'].forEach((brand) => {
    assert.equal(Boolean(themeFor(brand).keepSizes), false, brand);
    const out = run('<div><h1>T</h1><h2>A {heading-copytext-large}</h2><p>x</p><h2>B</h2><p>y</p></div>', brand);
    assert.equal(out.includes('{heading-copytext-large}'), false, brand);
  });
  // Group for Business keeps it too since standing order 9 (test/b2b-keep-copytext-so9)
  assert.deepEqual(themeFor('b2b').keepSizes, ['heading-copytext-large']);
});

test('the delta: a listed heading gets its marker once; the list\'s READY rows have data', async () => {
  const fs = await import('node:fs');
  const { applyHeadingSizeMarks, listPaths } = await import('../tools/importer/heading-size-marks-apply.mjs');
  const doc = '<div><h1>Santorini</h1><h2>Head to the Red Beach</h2><p>x</p><h2>Other</h2></div>';
  const row = {
    path: '/x', level: 2, text: 'Head to the Red Beach', size: 'heading-copytext-large',
  };
  const once = applyHeadingSizeMarks(doc, [row]);
  assert.equal(once.html.includes('<h2>Head to the Red Beach {heading-copytext-large}</h2>'), true);
  assert.equal(applyHeadingSizeMarks(once.html, [row]).results[0].result, 'present');
  assert.equal(applyHeadingSizeMarks('<div><h2>A</h2><h2>A</h2></div>', [{ ...row, text: 'A' }]).results[0].result, 'ambiguous');
  const list = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/reimport-so6-lh-discover-copytext-headings.txt', import.meta.url), 'utf8');
  const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/discover-copytext-headings-so6.json', import.meta.url), 'utf8'));
  const ready = listPaths(list);
  assert.equal(ready.length, 4);
  assert.equal(ready.every((p) => data.some((r) => r.path === p)), true);
});
