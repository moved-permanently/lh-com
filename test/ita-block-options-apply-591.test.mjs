/* eslint-disable max-len, import/extensions -- dev tooling */
/* A block option into DA's copy as it is (standing order 8 of 2026-11-12, item 2, ITA row 36: baggage-and-strollers'
   fare accordion opens its two items at load on www; main's importer writes accordion-columns (open-2), but DA's copy
   holds the block twice, as market variants, which a re-import drops). tools/importer/ita-block-options-apply.mjs adds
   the option to every block of the kind whose text starts as given, when there are as many as expected; nothing else
   changes; refused when the number differs or one has the option already.
   (The tool was written before this test: noted in the report.)
   Run: node --test test/ita-block-options-apply-591.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { applyOptions } from '../tools/importer/ita-block-options-apply.mjs';

const block = (cls, first) => `<div class="${cls}"><div><div>${first}</div><div><table><tr><td>x</td></tr></table></div></div></div>`;
const meta = (v) => `<div class="section-metadata"><div><div><p>markets</p></div><div><p>${v}</p></div></div></div>`;
const DA = `<body><header></header><main><div>${block('accordion-columns', 'Newborn (0-23 months)')}${meta('-au/en')}</div><div>${block('accordion-columns', 'Newborn (0-23 months)')}${meta('au/en')}</div><div>${block('accordion-columns faq', 'Stroller FAQs')}</div></main><footer></footer></body>`;
const ROW = {
  block: 'accordion-columns', start: 'Newborn (0-23 months)', add: 'open-2', count: 2,
};

test('both market variants get the option, nothing else changes', () => {
  const r = applyOptions(DA, [ROW]);
  assert.deepEqual(r.problems, []);
  assert.equal(r.html, DA.replaceAll('<div class="accordion-columns"><div><div>Newborn', '<div class="accordion-columns open-2"><div><div>Newborn'));
  assert.match(r.html, /<div class="accordion-columns faq"><div><div>Stroller FAQs/);
});

test('refused: another number of blocks, or the option there already', () => {
  assert.ok(applyOptions(DA, [{ ...ROW, count: 1 }]).problems.length);
  const once = applyOptions(DA, [ROW]).html;
  const again = applyOptions(once, [ROW]);
  assert.ok(again.problems.length);
  assert.equal(again.html, once);
});

test('the data and the list agree: each path a READY row', () => {
  const data = JSON.parse(fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/ita-block-options-591.json', import.meta.url), 'utf8'));
  const rows = fs.readFileSync(new URL('../tools/reports/parity-2026-11-09/reimport-591-ita-strollers-open.txt', import.meta.url), 'utf8').split('\n').filter((l) => l && !l.startsWith('#')).map((l) => l.split('\t'));
  Object.keys(data).forEach((p) => {
    const row = rows.find((r) => r[0] === p);
    assert.ok(row, p);
    assert.match(row[row.length - 1], /^READY\b/);
  });
});
