/* eslint-disable max-len */
/* SWISS's booking lookup fields as www's maui-input (brief 453; online check-in, manage bookings):
   a 50 px box, #f2f2f2 with a 1 px warm grey border, the label inside (18/28 px while empty, 12/14
   px over the value), 20 px to the next field, from 1025 px 250 px wide; no underline tick; the
   check-in hints untracked (two lines in 250 px, as www). SWISS's theme only.
   Run: node --max-old-space-size=512 --test test/swiss-lookup-fields-453.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/swiss.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const B = 'body.brand-swiss .booking-lookup';

test('the fields boxed as www\'s', () => {
  assert.ok(css.includes(`${B} { --booking-lookup-field-height: 50px; --booking-lookup-field-reserve: 20px; }`));
  assert.ok(css.includes(`${B} .booking-lookup-field::after { content: none; }`));
  assert.ok(css.includes(`${B} .booking-lookup-field input { padding: 17px 11px 3px; border: 1px solid #6f6660; background-color: #f2f2f2; color: #101010; font-size: 18px; line-height: 28px; }`));
  assert.ok(css.includes(`${B} .booking-lookup-field:has(> input:placeholder-shown:not(:focus)) label { top: 11px; font-size: 18px; line-height: 28px; }`));
  assert.ok(css.includes(`@media (width >= 1025px) { ${B} .booking-lookup-field { max-width: 250px; } }`));
});
