/* eslint-disable max-len */
/* The brief after 527, item 2 (Brussels against the recordings, brussels.turnsthe.page): the footer from 1025 px. www's is 478 px
   on the en pages (42 recorded) and 515 on the fr ones (41), ours 468 on every page (-10 / -47 px on all 83). From the
   footer's top (1440): the first column link 10 px higher on www (the titles 14 px over the lists, ours 24), the legal row
   98 px under the last column link (ours 68) and 41 px over the logo band (ours 31), the logo band 68 px high (ours 88: 25 /
   28 px padded); and www's legal links share three quarters of the content width (948 px of 1264), so the French row wraps
   its sixth link ("Gérer les paramètres de confidentialité", +37 px) where the English one fits (ours to 985 px).
   Run: node --max-old-space-size=256 --test test/brussels-footer-desktop-530.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const block = css.match(/@media \(width >= 1025px\) \{ body\.brand-brussels \.footer \.footer-column-title \{[^}]*\}(?: body\.brand-brussels \.footer [^{]+\{[^}]*\})* \}/)?.[0] || '';

test('from 1025 px the footer as www\'s: titles 14 px over the lists, the legal row 60 / 10 px padded and 948 px wide, the logo band 15 / 18 px', () => {
  assert.match(block, /body\.brand-brussels \.footer \.footer-column-title \{ margin-bottom: 14px; \}/);
  assert.match(block, /body\.brand-brussels \.footer \.footer-legal \{ max-width: 948px; padding-top: 60px; padding-bottom: 10px; \}/);
  assert.match(block, /body\.brand-brussels \.footer \.footer-logos-inner \{ padding-top: 15px; padding-bottom: 18px; \}/);
});
