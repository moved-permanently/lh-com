/* eslint-disable max-len */
/* ITA's fleet pages (standing order 6 of 2026-11-12, item 1; ITA row 34; ita-parity-005 /it/en/world-of-ita-airways/
   discover-ita-airways/fleet/short-haul and long-haul): in each aircraft's tab www puts the specifications table and the seat
   map side by side from 768 px (col-md-6: at 1440 the table at x 88, the map at x 723, 615 px wide; at 768 323 and 343 px,
   20 px apart), one under the other on phones. Ours stacked them, the map at the full width (1200 x 2000 px). The ITA
   theme lays a section's table and the picture paragraph right after it out as two columns from 768 px; the rest of the
   section across both.
   Run: node --test test/ita-seat-map-columns-589.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
const S = 'body.brand-ita main > .section:not([hidden]):has(> .table-striped-wrapper + .default-content-wrapper > p:only-child > picture)';
const rule = (sel) => {
  const i = css.indexOf(`${sel} {`);
  assert.ok(i > 0, `the rule ${sel}`);
  return [i, css.slice(i, css.indexOf('}', i))];
};

test('from 768 px a section with a table and its picture: two columns 20 px apart', () => {
  const [i, r] = rule(`  ${S}`);
  assert.match(r, /display: grid;/);
  assert.match(r, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
  assert.match(r, /column-gap: 20px;/);
  assert.ok(css.lastIndexOf('@media (width >= 768px)', i) > css.lastIndexOf('}\n}', i), 'from 768 px');
});

test('only the table and the picture after it share a row; everything else across both columns', () => {
  const [, r] = rule(`  ${S} > :not(.table-striped-wrapper, .table-striped-wrapper + .default-content-wrapper:has(> p:only-child > picture))`);
  assert.match(r, /grid-column: 1 \/ -1;/);
});
