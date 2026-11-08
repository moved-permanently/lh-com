/* eslint-disable max-len */
/* Lufthansa Cargo, the footer's logo strip (the brief after 505, item 2; Cargo row 40): www's
   .subFooter is 20 px above and below its logos, all 20 px tall: from 768 px one row in the
   1296 px content column (the Lufthansa Cargo mark, 20 px later "Member of Lufthansa Group", Cargo iQ
   at the row's end), 60 px in all; below 768 px stacked and centred, 10 px and 20 px apart (130 px).
   Ours took lufthansa.com's strip (25 / 28 px, the logos 6, 14 and 4 px down in turn, 40 px apart, from
   the page's 16 px edge): 87 px at 1440, 178 at 390, on every Cargo page. Cargo's theme only.
   Run: node --max-old-space-size=512 --test test/cargo-footer-logos-506.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/cargo.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');
const has = (re, msg) => assert.ok(re.test(css), msg ? `${msg}: ${re}` : String(re));

test('row 40: the strip 20 px above and below its logos, the logos without lufthansa.com\'s offsets', () => {
  has(/body\.brand-cargo \.footer \.footer-logos-inner \{[^}]*padding-block: 20px;/);
  has(/body\.brand-cargo \.footer \.footer-logos li:nth-child\(n\) \{[^}]*margin: 0;/);
});

test('row 40: below 768 px stacked, 10 px and 20 px apart', () => {
  has(/body\.brand-cargo \.footer \.footer-logos li:nth-child\(2\) \{[^}]*margin-top: 10px;/);
  has(/body\.brand-cargo \.footer \.footer-logos li:nth-child\(3\) \{[^}]*margin-top: 20px;/);
});

test('row 40: from 768 px one row in the 1296 px column, 20 px after the mark, Cargo iQ at the end', () => {
  const desktop = css.split('@media (width >= 768px)').slice(1).join(' ');
  assert.ok(desktop.includes('body.brand-cargo .footer .footer-logos-inner { padding-inline: max(16px, calc((100% - 1296px) / 2)); }'));
  assert.ok(desktop.includes('body.brand-cargo .footer .footer-logos li:nth-child(n) { margin: 0 20px 0 0; }'));
  assert.ok(desktop.includes('body.brand-cargo .footer .footer-logos li:last-child { margin: 0 0 0 auto; }'));
});
