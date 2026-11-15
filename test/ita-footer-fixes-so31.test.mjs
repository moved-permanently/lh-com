/* eslint-disable max-len */
/* Standing order 31 of 2026-11-15, item 2: ITA's phone footer as www's and the places that had kept it held (the gate:
   ita-parity-005 to -008, the 26 recorded ITA phone pages, Arial's metric-compatible face, ours vs www page height; none
   further by more than 0.5 points). All below 768 px, ITA only (body.brand-ita):
   - the legal links in www's 90 % of the footer's width (seven rows in English as www's, ours six);
   - the header row's tables as www's maui-table (az columnheader): header cells 22 px on 110 % lines, 24 px / 16 px in,
     the table 25 px under the text, the first row 34 px under the header's line (digital-newsstand, group-boarding,
     checked-baggage);
   - the gap under a grey band by section style, put by rows: gap-after-small 24 px (www's band to the footer,
     invoicing), gap-after-none 0 (www's heading right under the band, ita-airways-app).
   Run: node --max-old-space-size=256 --test test/ita-footer-fixes-so31.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/ita.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const PHONES = '@media (width < 768px) {';

test('the legal links 90 % wide on phones', () => {
  assert.ok(css.includes(`${PHONES} body.brand-ita .footer .footer-legal { max-width: 90%; } }`));
});

test('the header row\'s tables on phones as www\'s maui-table', () => {
  assert.ok(css.includes(`${PHONES} body.brand-ita .table-striped.header { margin-top: 25px; } body.brand-ita .table-striped.header thead th { padding: 24px 16px; font-size: 22px; line-height: 1.1; } body.brand-ita .table-striped.header tbody tr:first-child > * { border-top-width: 34px; } }`));
});

test('the gap under a grey band by section style, phones only', () => {
  assert.ok(css.includes(`${PHONES} body.brand-ita main > .section.grey.gap-after-small { margin-bottom: 24px; } body.brand-ita main > .section.grey.gap-after-small + .section:last-child:empty { margin-bottom: 0; } body.brand-ita main > .section.grey.gap-after-none { margin-bottom: 0; } }`));
  assert.ok(!/@media \(width >= 768px\) \{[^}]*gap-after-none/.test(css), 'not from 768 px (the app page short elsewhere there)');
});

test('no :has() nested in another (a browser drops such a rule)', () => {
  const rules = css.match(/body\.brand-ita[^{}]*(gap-after|footer-legal|table-striped\.header)[^{}]*\{/g) || [];
  assert.ok(rules.length >= 6);
  assert.ok(rules.every((r) => !/:has\([^()]*:has\(/.test(r)));
});
