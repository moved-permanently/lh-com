/* eslint-disable max-len */
/* Standing order 22 (2026-11-14), item 3: /de/en/cancellations-and-refunds. Its spaced accordion is followed on www by a
   20 px separator at the end of its column, so the accordion is not the column's last component and keeps its margin:
   www has 61 px more than ours from the accordion to "This might also be of interest to you" at 1440 (the 4rem margin and
   the separator's 21 px), 19 px more at 390 (the separator alone). Ours drew no space there (a spaced accordion right
   before "{column-end}" has none, right for the 734 documents without such a separator). Option column-end-gap keeps
   www's space: 21 px, 61 px from 768 px. Census of the 3,397 www snapshots: this shape (an accordion, then separators
   only, at the end of a column item) on cancellations-and-refunds only (7 documents); the option comes with
   block-option-apply rows (delta-so22-items-lh-com.txt). Measured by injection: 13.8 / 12.3 -> 3.5 / 11.1 % at 1440 / 390.
   Run: node --test test/accordion-column-end-gap-so22.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../blocks/accordion-columns/accordion-columns.css', import.meta.url), 'utf8');
const SEL = 'main > .section > .accordion-columns-wrapper:has(+ .default-content-wrapper > p.column-mark:is(.column-end, .column-end-outer):first-child) > .accordion-columns.spaced.column-end-gap {';

test('option column-end-gap: www\'s space before the column end, 21 px and 61 px from 768 px', () => {
  const first = css.indexOf(SEL);
  assert.ok(first > 0, 'the rule');
  assert.match(css.slice(first, css.indexOf('}', first)), /padding-bottom: 21px;/);
  const second = css.indexOf(SEL, first + 1);
  assert.ok(second > first, 'the 768 px rule');
  assert.equal(css.slice(css.lastIndexOf('@media', second), css.indexOf('{', css.lastIndexOf('@media', second))).trim(), '@media (width >= 768px)');
  assert.match(css.slice(second, css.indexOf('}', second)), /padding-bottom: 61px;/);
});
