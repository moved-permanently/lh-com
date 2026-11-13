/* eslint-disable max-len */
/* ITA's tables with equal columns, as www's (standing order 6 of 2026-11-12, item 1, the ranking against ita-parity-005:
   /it/en/book-and-prepare/travel-information/at-the-airport/group-boarding -4.7 % at 1440). Every recorded ITA table is a
   maui-table with equalcolumns (ita-parity-004 and -005: group-boarding, checked-baggage, electronic devices, the fleet,
   Verona): at 1440 group-boarding's two columns 625 / 625 px, the table 872 px tall; ours took the columns by their content
   (ITA row 27: 212 / 1052 px), the rows shorter (751 px). Each cell keeps ITA row 27's 200 px at least (the block scrolls
   sideways on phones), and a row of 2 to 6 cells shares the width equally.
   Run: node --test test/ita-table-equal-columns-589.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('a row of n cells (2 to 6): each cell 100% / n', () => {
  [2, 3, 4, 5, 6].forEach((n) => {
    const sel = `body.brand-ita .table-striped tr > :first-child:nth-last-child(${n}), body.brand-ita .table-striped tr > :first-child:nth-last-child(${n}) ~ :is(td, th)`;
    const i = css.indexOf(`${sel} {`);
    assert.ok(i >= 0, `the rule for ${n} cells`);
    assert.match(css.slice(i, css.indexOf('}', i)), new RegExp(`width: calc\\(100% / ${n}\\);`));
  });
});

test('ITA row 27 stays: cells 200 px at least, the layout by content', () => {
  assert.match(css, /body\.brand-ita \.table-striped table \{ table-layout: auto; \}/);
  assert.match(css, /body\.brand-ita \.table-striped :is\(td, th\) \{ min-width: 200px; \}/);
});
