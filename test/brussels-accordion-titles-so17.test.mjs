/* eslint-disable max-len */
/* Standing order 17, item 4: Brussels accordion questions as www's .sn collapsible header (the recordings' shadow CSS,
   brussels-parity-007: .sn .header 20 / 24 px, regular while collapsed, sn-blue-3; padding 13px 20px on phones, 13px 10px
   from 768 px; the chevron 24 px in the header's padding). Ours were lufthansa.com's: 18 / 24 px bold, #1a1a1a, 12 px
   left and 48 px right. On phones www's questions wrap onto more lines (us-customer-service-plan's "Notification of the
   Lowest / Fares": two lines, ours one). Measured on the 32 recorded Brussels pages: at 390 seven closer
   (us-customer-service-plan -4.70 -> -1.23 %, special-assistance-legal-guidelines -5.01 -> -2.88,
   us-traveling-with-disabilities -2.72 -> -1.44, short-notice-eu-us -2.48 -> -1.70, travel-id -1.02 -> -0.30,
   responsible-disclosure -1.38 -> -0.48, conditions of carriage -3.39 -> -3.27), one 0.27 points further (the refund
   voucher's conditions -0.05 -> +0.32), the rest and every page at 1440 unchanged. Reads brussels.css as written.
   Run: node --max-old-space-size=256 --test test/brussels-accordion-titles-so17.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const T = 'body.brand-brussels main .accordion-columns .accordion-columns-title';

test('a question 20 / 24 px regular in sn-blue-3, 20 px in from each side on phones, the chevron in that padding', () => {
  assert.ok(css.includes(`${T} { padding-right: 44px; padding-left: 20px; color: var(--lh-marble-blue); font-size: calc(20px * var(--a11y-scale, 1)); font-weight: 400; }`));
  assert.ok(css.includes(`${T}::after { right: 20px; }`));
});

test('an open question bold, as www\'s expanded header', () => {
  assert.ok(css.includes('body.brand-brussels main .accordion-columns .accordion-columns-item[open] > .accordion-columns-title { font-weight: 700; }'));
});

test('from 768 px 10 px in from each side', () => {
  assert.ok(css.includes(`@media (width >= 768px) { ${T} { padding-right: 34px; padding-left: 10px; } ${T}::after { right: 10px; } }`));
});
