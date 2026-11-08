/* eslint-disable max-len */
/* Brief 500 item 2, /de/en/100-years/fleet at 1440 (25.4 %, 15 spec tables; drift -961 px by 7,840): www's maui-table
   cells hold a paragraph whose margin stays inside the cell; from 768 px a spec row is 36 px taller than ours (a one-line
   row 128 px on www, ours 91; two lines 155, ours 119), the text at the same height. Options beside / beside-end
   (the spec tables) from 768 px: 68 px under the cell's text. Below 768 px as before (fleet at 390: 9.1 %).
   Run: node --test test/table-striped-beside-rows-500.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync('blocks/table-striped/table-striped.css', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('from 768 px: a spec table\'s cells 68 px under their text', () => {
  const mq = css.lastIndexOf('@media (width >= 768px) { .table-striped:is(.beside, .beside-end) { display: grid;');
  assert.ok(mq > 0);
  assert.ok(css.slice(mq).includes('.table-striped:is(.beside, .beside-end) :is(th, td) { padding-bottom: 68px; }'));
});
