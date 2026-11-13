/* eslint-disable max-len, import/extensions -- dev tooling */
/* www's table cells as they read, into DA's copy as it is (standing order 9 of 2026-11-13, item 2, the worst single ITA
   page: /it/en/book-and-prepare/other-requests/families-and-children/baggage-and-strollers -10.0 % at 1440, -21.5 % at
   390, ita-parity-005): www's fare tables write each cell as a bold label, a line break and the value
   ("<b>Baggage</b><br>No baggage<br><br><br>", the header "Light fare and lap seat<br>&nbsp;"); the import flattened them
   to "BaggageNo baggage", one line that reads wrong. tools/importer/ita-cells-apply.mjs puts www's cell HTML (bold as
   <strong>, the line breaks) into every <td> / <th> of DA's copy whose text is the flat text, when there are as many
   as expected; refused when the number differs or a cell has the markup already. Nothing else changes.
   Run: node --test test/ita-cells-apply-592.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyCells } from '../tools/importer/ita-cells-apply.mjs';

const table = '<table><thead><tr><th>Light fare and lap seat</th></tr></thead><tbody><tr><td>BaggageNo baggage</td></tr><tr><td>Folding strollerYes, in the hold</td></tr></tbody></table>';
const DA = `<body><header></header><main><div>${table}</div><div>${table}</div><div><table><tr><td>Other</td></tr></table></div></main><footer></footer></body>`;
const ROW = {
  cells: {
    'Light fare and lap seat': 'Light fare and lap seat<br>&nbsp;',
    'BaggageNo baggage': '<strong>Baggage</strong><br>No baggage<br><br><br>',
    'Folding strollerYes, in the hold': '<strong>Folding stroller<br></strong>Yes, in the hold&nbsp;',
  },
  count: 6,
};

test('every matching cell gets www\'s HTML, in every market variant; other cells as they were', () => {
  const r = applyCells(DA, ROW);
  assert.deepEqual(r.problems, []);
  assert.equal((r.html.match(/<strong>Baggage<\/strong><br>No baggage<br><br><br>/g) || []).length, 2);
  assert.equal((r.html.match(/<th>Light fare and lap seat<br>&nbsp;<\/th>/g) || []).length, 2);
  assert.match(r.html, /<td>Other<\/td>/);
  assert.equal(r.html.replace(/<br>|&nbsp;|<\/?strong>/g, ''), DA.replace(/<br>|&nbsp;|<\/?strong>/g, ''));
});

test('refused: another number of cells, or the markup there already', () => {
  assert.ok(applyCells(DA, { ...ROW, count: 5 }).problems.length);
  const once = applyCells(DA, ROW).html;
  const again = applyCells(once, ROW);
  assert.ok(again.problems.length);
  assert.equal(again.html, once);
});

test('the data and the list agree: each path a READY row', () => {
  const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/ita-cells-592.json', import.meta.url), 'utf8'));
  const rows = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/reimport-592-ita-strollers-cells.txt', import.meta.url), 'utf8').split('\n').filter((l) => l && !l.startsWith('#')).map((l) => l.split('\t'));
  Object.keys(data).forEach((p) => {
    const row = rows.find((r) => r[0] === p);
    assert.ok(row, p);
    assert.match(row[row.length - 1], /^READY\b/);
  });
});
