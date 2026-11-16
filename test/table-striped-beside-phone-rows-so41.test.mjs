/* eslint-disable max-len */
/* Standing order 41, item 4 (place 80 of sweep-so34-lh-adobe.md): lufthansa.com's fleet spec tables (table-striped
   beside / beside-end) keep www's 68px under a cell's text on phones too (www's cell keeps its paragraph's margin
   inside: a one-line row 128px at 390, ours was 90). Gate: /de/en/100-years/fleet 390 7.9 -> 6.4 %, 1440 untouched
   (the rule is below 768px); the 6 other fleet documents rendered with and without, no breakage.
   Run: node --test test/table-striped-beside-phone-rows-so41.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/table-striped/table-striped.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('fleet spec rows: 68px under the text on phones, as from 768px', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-lufthansa .table-striped:is(.beside, .beside-end) :is(th, td) { padding-bottom: 68px; } }'));
  assert.ok(css.includes('.table-striped:is(.beside, .beside-end) :is(th, td) { padding-bottom: 68px; } }'));
});
