/* eslint-disable max-len */
/* Standing order 17, item 4: an open accordion answer's spacing on Brussels phones. www (390, the legal pages'
   faq accordions: terms-of-use, the two voucher conditions, conditions of carriage, cancel-and-refund-requests) puts
   the answer's text 5 px under the question and its last paragraph keeps its 16 px margin, the panel 31 px more below:
   the next question 47 px under the text. Ours: 10 px above, 20 below, every open panel 21 px short at 390. Measured
   with the rule on the 32 recorded Brussels pages: those five better at 390 (terms-of-use -2.54 -> -0.21 %, the voucher
   conditions -3.46 / -3.08 -> -0.36 / -0.05, cancel-and-refund -4.61 -> -3.70, conditions of carriage -4.06 -> -3.39),
   none worse. Below 768 px only: at 1440 the same spacing made three pages worse, their answers there 66 % of the full
   width (P50, held). Reads brussels.css as written.
   Run: node --max-old-space-size=256 --test test/brussels-panel-spacing-390-so17.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('below 768 px an open answer 5 px under its question and 31 px more under its text, as www', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-brussels main .accordion-columns.faq .accordion-columns-panel { padding-top: 5px; padding-bottom: calc(var(--spacing-default) + 31px); } }'));
});

test('the phone side insets (the brief after 593) as they were', () => {
  assert.ok(css.includes('@media (width < 768px) { body.brand-brussels main .accordion-columns.faq .accordion-columns-panel { padding-left: 20px; padding-right: 20px; } }'));
});
