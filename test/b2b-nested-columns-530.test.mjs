/* eslint-disable max-len, import/extensions */
/* Group for Business, nested column views (the brief after 526, item 1b; B2B row 36): www's airline rows on
   travel-solutions/lufthansa-group-airlines are two-item views inside one one-column view, 83 px apart at 1440; the
   homepage's rows are top-level views with a separator between, 106 px apart (b2b.css row 10). Both imported as rows of
   one columns-media block, so both got 106. Now b2b-import.mjs marks a one-column view that holds column views
   (withNestedColumnMarkers, before the import) and gives the columns-media block made of it the option nested
   (withNestedColumns, after it); b2b.css spaces a nested block's rows 83 px from 768 px. Fixtures: trimmed from
   b2b-parity-001's recordings of the two pages.
   Run: node --max-old-space-size=256 --test test/b2b-nested-columns-530.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { withNestedColumnMarkers, withNestedColumns } from '../tools/importer/b2b-import.mjs';

const read = (f) => fs.readFileSync(new URL(`./fixtures/b2b-nested-columns/${f}`, import.meta.url), 'utf8');
const nested = read('airlines-nested-view.html');
const top = read('homepage-top-views.html');
const count = (s, n) => s.split(n).length - 1;

test('row 36: a one-column view holding column views gets the markers around it, once', () => {
  const out = withNestedColumnMarkers(nested);
  assert.equal(count(out, '@@nested-columns@@'), 1);
  assert.equal(count(out, '@@nested-columns-end@@'), 1);
  assert.ok(out.indexOf('@@nested-columns@@') < out.indexOf('class="onecolumn'));
  assert.ok(out.lastIndexOf('@@nested-columns-end@@') > out.lastIndexOf('class="twocolumn'));
  assert.equal(withNestedColumnMarkers(out), out, 'twice as once');
});

test('row 36: top-level views (the homepage\'s, a separator between) get none', () => {
  assert.equal(withNestedColumnMarkers(top), top);
});

test('row 36: after the import the block between the markers is columns-media (nested), the markers go', () => {
  const doc = '<div><h2>Lufthansa Group airlines at a glance</h2><p>@@nested-columns@@</p><div class="columns-media"><div><div><p>Austrian</p></div><div><p>Brussels</p></div></div></div><p>@@nested-columns-end@@ {full-width}</p><p>After</p></div><div><div class="columns-media"><div><div><p>Other</p></div></div></div></div>';
  const out = withNestedColumns(doc);
  assert.equal(count(out, '<div class="columns-media nested">'), 1);
  assert.equal(count(out, '<div class="columns-media">'), 1, 'a block outside the markers as it is');
  assert.equal(count(out, '@@nested-columns'), 0);
  assert.ok(out.includes('<p>After</p>'));
  assert.equal(withNestedColumns('<div><p>none</p></div>'), '<div><p>none</p></div>');
});

test('row 36: b2b.css spaces a nested block\'s rows 83 px from 768 px', () => {
  const css = fs.readFileSync(new URL('../styles/themes/b2b.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
  assert.match(css, /@media \(width >= 768px\) \{ body\.brand-b2b \.columns-media\.nested \{ gap: 83px; \} \}/);
});
