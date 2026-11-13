/* eslint-disable max-len */
/* ITA row 36's rest (standing order 8 of 2026-11-12, item 2, the worst single ITA page: /it/en/book-and-prepare/other-
   requests/families-and-children/baggage-and-strollers, ita-parity-005): inside the fare accordion's items www lays the
   tables out as a four-column view (col-md-6 col-lg: two a row from 768 px, all in one row from 992 px, one under the
   other on phones); ours stacked them, each 1240 px wide (four tables 1528 px in an item at 1440). The ITA theme lays a
   panel whose content is only tables out the same way.
   Run: node --test test/ita-accordion-tables-row-591.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const S = 'body.brand-ita .accordion-columns .accordion-columns-intro:has(> .accordion-columns-table + .accordion-columns-table):not(:has(> :not(.accordion-columns-table)))';
// the rule inside the given media query (the first after the query opens, before the query ends)
const ruleIn = (media, extra = '') => {
  const q = css.indexOf(`@media (width >= ${media}px) { ${S}`);
  assert.ok(q >= 0, `a ${media} px query with the rule`);
  const i = css.indexOf(`${S}${extra} {`, q);
  assert.ok(i >= 0 && i < css.indexOf('} }', q) + 3, `the rule ${extra} from ${media} px`);
  return css.slice(i, css.indexOf('}', i));
};

test('from 768 px an item of tables only: two a row, 20 px apart', () => {
  const r = ruleIn(768);
  assert.match(r, /display: grid;/);
  assert.match(r, /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
  assert.match(r, /gap: 24px 20px;/);
});

test('from 992 px all in one row', () => {
  const r = ruleIn(992);
  assert.match(r, /grid-template-columns: none;/);
  assert.match(r, /grid-auto-flow: column;/);
  assert.match(r, /grid-auto-columns: minmax\(0, 1fr\);/);
});

test('the tables keep no margin of their own in the grid', () => {
  assert.match(ruleIn(768, ' > .accordion-columns-table'), /margin: 0;/);
});
