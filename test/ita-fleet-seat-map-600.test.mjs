/* eslint-disable max-len */
/* ITA row 52 (standing order 16 of 2026-11-14, item 2): the fleet pages' specifications table and seat map as www's, from
   768 px (ita-parity-005; www's col-md-6 columns, 622 px each at 1440, 20 px apart, on the content width).
   - Row 34's grid kept the page's 88 px on both sides of each column: the table 532 px, the seat map 534 (890 px tall,
     www's 622 x 1037). In the grid the table's column keeps only its outer padding and the table fills it; the picture's
     column only its outer padding.
   - A section whose text ends with its heading right before the table (short-haul: "Specifications" closes the intro
     wrapper) has www's seat map level with that heading: the picture's column 50 px higher (its 24 px margin less the
     heading's 26 and its 24 px margin). Long-haul's heading is in the section before, its picture stays under it.
   - www's tab bar (maui-tab-control) over a specifications panel (the tab set right before a table section, short-haul's):
     tabs 45 px tall (12 / 24 px padding, 14 px uppercase labels, 21 px lines) and the text 48 px under the bar; ours the
     shared 64 px tabs and 72 px. Every ITA tab bar measured further on ita-airways-app (-0.22 -> -1.29 %), so scoped.
   long-haul 1440 3398 -> 3508 (www 3526, -3.63 -> -0.51 %), short-haul 3524 -> 3517 (www 3511, +0.37 -> +0.17 %); the 37
   other recorded ITA pages unchanged at 1440; phones as before. Run: node --test test/ita-fleet-seat-map-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const GRID = 'body.brand-ita main > .section:not([hidden]):has(> .table-striped-wrapper + .default-content-wrapper > p:only-child > picture)';
const rule = (sel) => {
  const q = css.indexOf(`${sel} {`);
  return q < 0 ? null : css.slice(q, css.indexOf('}', q));
};

test('the table fills its column with the outer padding only, the picture likewise', () => {
  const t = rule(`${GRID} > .table-striped-wrapper`);
  assert.ok(t, 'the table column rule');
  ['justify-self: stretch;', 'box-sizing: border-box;', 'width: 100%;', 'max-width: none;', 'margin-inline: 0;', 'padding-right: 0;'].forEach((d) => assert.ok(t.includes(d), d));
  assert.ok((rule(`${GRID} > .table-striped-wrapper :is(.table-striped, table)`) || '').includes('width: 100%;'), 'the table fills it');
  assert.ok((rule(`${GRID} > .table-striped-wrapper + .default-content-wrapper`) || '').includes('padding-left: 0;'), 'the picture column');
});

test('the seat map level with a heading that closes the text right above the table', () => {
  const sel = 'body.brand-ita main > .section:not([hidden]) > .default-content-wrapper:has(> h2:last-child) + .table-striped-wrapper + .default-content-wrapper:has(> p:only-child > picture)';
  assert.ok((rule(sel) || '').includes('margin-top: -50px;'));
  assert.doesNotMatch(sel, /:has\([^)]*:has\(/, 'no :has() inside another');
});

test('www\'s tab bar: 45 px tabs with 14 px uppercase labels, the text 48 px under the bar', () => {
  const tab = rule('body.brand-ita main > .section.section-tabs:has(+ .section.table-striped-container) [role="tab"]') || '';
  ['padding: 12px 24px;', 'font-size: 14px;', 'line-height: 21px;', 'text-transform: uppercase;'].forEach((d) => assert.ok(tab.includes(d), d));
  assert.ok((rule('body.brand-ita main > .section.section-tabs:has(+ .section.table-striped-container)') || '').includes('margin-bottom: 24px;'));
});

test('from 768 px only', () => {
  const start = css.indexOf('@media (width >= 768px) { body.brand-ita main > .section:not([hidden]):has(> .table-striped-wrapper + .default-content-wrapper > p:only-child > picture) > .table-striped-wrapper {');
  assert.ok(start >= 0, 'the column rules open a 768 px query');
  const end = css.indexOf('} }', start);
  const block = css.slice(start, end);
  ['.default-content-wrapper:has(> h2:last-child) + .table-striped-wrapper', '.section.section-tabs:has(+ .section.table-striped-container) [role="tab"] {', '.section.section-tabs:has(+ .section.table-striped-container) {'].forEach((s) => {
    assert.ok(block.includes(s), `inside the 768 px query: ${s}`);
    assert.equal(css.split(s).length - 1, 1, `only there: ${s}`);
  });
});
