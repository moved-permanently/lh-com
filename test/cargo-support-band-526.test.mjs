/* eslint-disable max-len */
/* Cargo's Support & Contact, the support band at the page's end (columns support; the brief after 523 item 2, Cargo
   row 43): www's opening hours and call charges are small print (<small class="extraSmall">, 12 px on 20 px lines); the
   importer writes <p><small>, but Edge Delivery's conversion keeps no <small>, so ours came as 18 px body text (3 lines at
   1440, 4 at 390, www 2 and 3). And the band ends the page: www leaves 20 px under its last line to the footer, ours the
   last paragraph's 20, the block's 40 and the section gap's 48. Now the paragraph after the phone number is the small
   print, the band's last cell ends without a margin, 20 px of padding under it, no section gap after it when it is the
   page's last section. Measured on cargo.turnsthe.page with the rule: /en/support-and-contact 1440 2435 -> 2335 px
   (www 2301), 390 3254 -> 3130 (www 3066).
   Run: node --max-old-space-size=256 --test test/cargo-support-band-526.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/cargo.css', import.meta.url), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ');

test('row 43: the paragraph after the phone number is www\'s small print, 12 px on 20 px lines', () => {
  assert.match(css, /body\.brand-cargo \.columns\.support :is\(small, p:has\(> a\[href\^="tel:"\]\) ~ p\) \{ font-size: 12px; line-height: 20px; \}/);
});

test('row 43: the band ends as www\'s: 20 px under its last cell, no margin after it, no section gap before the footer', () => {
  assert.match(css, /body\.brand-cargo \.columns\.support \{ padding: 40px 0 20px; \}/);
  assert.match(css, /body\.brand-cargo \.columns\.support > div > div:last-child > :last-child \{ margin-bottom: 0; \}/);
  assert.match(css, /body\.brand-cargo main > :where\(\.section:last-child:has\(\.columns\.support\)\) \{ margin-bottom: 0; \}/);
});
