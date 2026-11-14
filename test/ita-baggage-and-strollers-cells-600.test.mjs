/* eslint-disable max-len, import/extensions -- dev tooling */
/* ITA baggage-and-strollers' fare cells as www's (standing order 17 of 2026-11-14, item 1):
   delta-so17-ita-baggage-and-strollers-cells.txt with tools/importer/ita-fragment-replace-apply.mjs.
   - Bold labels: DA's "<strong>Folding stroller<br></strong>Yes, in the hold" is served as "Folding strollerYes, in the
     hold" (publishing drops a break at the end of bold text); the break moves out of the bold, nothing else changes.
   - Empty lines: a cell's trailing breaks ("<br><br><br>", "<br><br>&nbsp;", "<br>&nbsp;"), dropped by publishing,
     become the cell's text in a paragraph and a spacer of those lines (27 px a line; ITA row 55 sizes it).
   Run: node --test test/ita-baggage-and-strollers-cells-600.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyReplacements, revertReplacements } from '../tools/importer/ita-fragment-replace-apply.mjs';
import { readyPaths } from '../tools/importer/ita-fragment-insert-apply.mjs';
import { SEPARATOR } from '../scripts/style-markers.js';

const PATH = '/it/en/book-and-prepare/other-requests/families-and-children/baggage-and-strollers';
const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so17-ita-baggage-and-strollers-cells.json', import.meta.url), 'utf8'));
const list = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/delta-so17-ita-baggage-and-strollers-cells.txt', import.meta.url), 'utf8');
const rows = data[PATH];
const text = (s) => s.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();

test('the bold rows only move the break out of the bold', () => {
  const bold = rows.filter((r) => r.from.includes('<br></strong>'));
  assert.equal(bold.reduce((n, r) => n + r.count, 0), 16, 'the 16 cells');
  bold.forEach((r) => assert.equal(r.to, r.from.replace('<br></strong>', '</strong><br>')));
});

test('the empty-line rows: the cell\'s text in a paragraph, then a known spacer of 27 px a trailing line', () => {
  const cells = rows.filter((r) => !r.from.includes('<br></strong>'));
  assert.equal(cells.reduce((n, r) => n + r.count, 0), 10, 'the 10 cells');
  cells.forEach((r) => {
    const m = r.from.match(/^<(t[dh])>(.*?)((?:<br>|&nbsp;|\s)+)<\/\1>$/);
    assert.ok(m, r.from);
    const lines = (m[3].match(/<br>/g) || []).length - (m[3].trimEnd().endsWith('<br>') ? 1 : 0);
    assert.equal(r.to, `<${m[1]}><p>${m[2]}</p><p>{spacer-${27 * lines}}</p></${m[1]}>`);
    assert.ok(SEPARATOR.test(`{spacer-${27 * lines}}`));
    assert.equal(text(r.to.replace(/\{spacer-\d+\}/, '')), text(r.from), 'the same words');
  });
});

test('on a document of these cells: applied, refused the second time, reverted byte for byte', () => {
  const doc = `<main><table>${rows.map((r) => `<tr>${r.from.startsWith('<t') ? r.from : `<td>${r.from}</td>`}</tr>`.repeat(r.count)).join('')}</table></main>`;
  const r = applyReplacements(doc, rows);
  assert.deepEqual(r.problems, []);
  assert.ok(applyReplacements(r.html, rows).problems.length);
  assert.equal(revertReplacements(r.html, rows).html, doc);
});

test('the list: the row READY, status first, the header naming the tool, its data, ITA row 55 and www\'s heights', () => {
  assert.deepEqual(readyPaths(list), [PATH]);
  const head = list.split('\n')[0];
  assert.match(head, /node tools\/importer\/ita-fragment-replace-apply\.mjs --data tools\/reports\/parity-2026-11-09\/delta-so17-ita-baggage-and-strollers-cells\.json/);
  assert.match(head, /Expected change only/);
  assert.match(head, /ITA row 55/);
  assert.match(list.split('\n')[2], /^READY\t.*4446 \/ 7882/);
});
