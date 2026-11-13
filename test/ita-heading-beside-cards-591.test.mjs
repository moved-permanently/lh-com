/* eslint-disable max-len */
/* ITA row 39 (standing order 8 of 2026-11-12, item 1; ita-parity-005 /it/en/book-and-prepare/travel-information/
   entry-regulations/entry-regulations-schengen/entry-exit-system): www's three-column view holds "What data is
   collected?" in its first column (x 88, 408 px wide at 1440) and the four icon teasers two by two in the other two
   (x 516 and 944, 408 px each, 20 px apart); on phones the heading over the teasers. The heading comes back as default
   content right before the cards-icon-text block (its own wrapper: the H2 alone); from 768 px the ITA theme lays the
   section out on the content box: the heading in a column of a third (less the gaps), the teasers in two columns
   beside it, the section's other content across both.
   Run: node --test test/ita-heading-beside-cards-591.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const HEAD = '.default-content-wrapper:first-child';
// two :has() side by side (a :has() inside a :has() is no valid selector): the first wrapper the H2 alone, the cards after it
const S = `body.brand-ita main > .section:has(> ${HEAD} > h2:only-child):has(> ${HEAD} + .cards-icon-text-wrapper > .cards-icon-text.partner)`;
const rule = (sel) => {
  const i = css.indexOf(`${sel} {`);
  assert.ok(i >= 0, `the rule ${sel}`);
  assert.ok(css.lastIndexOf('@media (width >= 768px)', i) > css.lastIndexOf('} }', i), `${sel}: from 768 px`);
  return css.slice(i, css.indexOf('}', i));
};

test('from 768 px the section is a grid on the content box: a third (less the gaps) and the rest, 20 px apart', () => {
  const r = rule(S);
  assert.match(r, /display: grid;/);
  assert.match(r, /grid-template-columns: calc\(\(100% - 40px\) \/ 3\) minmax\(0, 1fr\);/);
  assert.match(r, /column-gap: 20px;/);
  assert.match(r, /padding-inline: max\(var\(--layout-margin\), calc\(\(100% - var\(--content-max-width\)\) \/ 2 \+ var\(--layout-margin\)\)\);/);
});

test('its children across both columns on the content box; the heading the first column, the teasers the second', () => {
  const all = rule(`${S} > *`);
  assert.match(all, /grid-column: 1 \/ -1;/);
  assert.match(all, /max-width: none;/);
  assert.match(all, /padding-inline: 0;/);
  assert.match(rule(`${S} > ${HEAD}`), /grid-column: 1;/);
  assert.doesNotMatch(css, /:has\([^()]*:has\(/, 'no :has() in a :has()');
  const cards = rule(`${S} > ${HEAD} + .cards-icon-text-wrapper`);
  assert.match(cards, /grid-column: 2;/);
  assert.match(cards, /margin-top: 0;/);
});

test('the teasers two by two beside the heading', () => {
  assert.match(rule(`${S} > ${HEAD} + .cards-icon-text-wrapper > .cards-icon-text.partner > ul`), /grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
});
