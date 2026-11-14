/* eslint-disable max-len */
/* Standing order 28 (2026-11-14): Austrian tables in equal columns on wide screens, as www's. Every maui-table of the Austrian
   recordings carries equalcolumns and is rendered at 1440 as "table os equalColumns" (shadow CSS: .equalColumns .table-wrapper
   { table-layout: fixed }); at 390 www renders the same tables as "table os", by their content (order 570's rule, kept). All 58
   tables of the on-disk www snapshots carry the attribute too. From 1025 px a row of 2 to 6 cells shares the width equally
   (each cell 200 px at least, as before); accessible-travel 1440 -0.25 -> -0.06 %, the only recorded page-width it moves.
   Run: node --max-old-space-size=256 --test test/austrian-table-equal-columns-so28.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('from 1025 px a row of n cells (2 to 6): each cell 100% / n', () => {
  const at = css.indexOf('@media (width >= 1025px) { body.brand-austrian .table-striped tr > :first-child:nth-last-child(2)');
  assert.ok(at >= 0, 'the wide-screen block');
  const block = css.slice(at, css.indexOf('} }', at) + 3);
  [2, 3, 4, 5, 6].forEach((n) => {
    const sel = `body.brand-austrian .table-striped tr > :first-child:nth-last-child(${n}), body.brand-austrian .table-striped tr > :first-child:nth-last-child(${n}) ~ :is(td, th)`;
    const i = block.indexOf(`${sel} {`);
    assert.ok(i >= 0, `the rule for ${n} cells`);
    assert.match(block.slice(i, block.indexOf('}', i)), new RegExp(`width: calc\\(100% / ${n}\\);`));
  });
});

test('no equal widths outside the wide-screen block; order 570\'s layout by content stays', () => {
  const outside = css.replace(/@media \(width >= 1025px\) \{ body\.brand-austrian \.table-striped tr[\s\S]*?\} \}/, '');
  assert.doesNotMatch(outside, /body\.brand-austrian \.table-striped tr > :first-child:nth-last-child/);
  assert.match(css, /body\.brand-austrian \.table-striped table \{ table-layout: auto; \}/);
  assert.match(css, /body\.brand-austrian \.table-striped :is\(td, th\) \{ min-width: 200px; \}/);
});
