/* eslint-disable max-len */
/* Brussels' footer on phones (brief 478; ema-test's sweep follow-up: 696 px against www's 829 / 849 on every
   page at 390). www (brussels-parity-003, its CSS and screenshots): the section rows 40 px high (10 px
   padded, 32 px in) one every 60 px; "Social media" 14/15.4 bold, 20 px over the icons, 29 px under the
   last row and 32 px in; the legal links 32 px in, the first 78 px under the icons, the dark band 58 px
   past the last one; the logo band 42 px padded above and below, its logos 31 / 30 px apart. Ours: rows
   47 px apart flush with the edge, 39 px from the icons to the links, the band 19 px past them.
   Run: node --max-old-space-size=256 --test test/brussels-footer-phone-478.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const phone = (css.match(/@media \(width < 768px\) \{ body\.brand-brussels \.footer \.footer-column:not\(\.footer-column-badges\) \{[\s\S]*?\} \}/) || [''])[0];
const F = 'body.brand-brussels .footer';

test('one phone block for the footer', () => assert.ok(phone));

test('the section rows: 40 px high, 32 px in, one every 60 px', () => {
  assert.ok(phone.includes(`${F} .footer-column:not(.footer-column-badges) { margin-bottom: 20px; }`));
  assert.ok(phone.includes(`${F} .footer-column-toggle { width: calc(100% - 44px); margin: 0 22px; padding: 10px; }`));
});

test('Social media 29 px under the rows, 32 px in, 14/15.4 with 20 px over the icons', () => {
  assert.ok(phone.includes(`${F} .footer-column-badges { padding: 9px 12px 0; }`));
  assert.ok(phone.includes(`${F} .footer-badge-heading { margin-bottom: 20px; line-height: 15.4px; }`));
});

test('the legal links 32 px in, 78 px under the icons, the band 58 px past them; the logo band 42 px padded, logos 31 / 30 px apart', () => {
  assert.ok(phone.includes(`${F} .footer-legal { padding: PT 0 PB 10px; }`.replace('PT', '69px').replace('PB', '39px')));
  assert.ok(phone.includes(`${F} .footer-logos-inner { padding: 42px 0; }`));
  assert.ok(phone.includes(`${F} .footer-logos-inner > ul > li:nth-child(1) { margin-bottom: 31px; }`));
  assert.ok(phone.includes(`${F} .footer-logos-inner > ul > li:nth-child(2) { margin-bottom: 30px; }`));
});
