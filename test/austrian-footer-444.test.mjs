/* eslint-disable max-len -- dev tooling */
/* Austrian's footer against austrian-parity-002 (brief 444 item 5; /at/de/book/rebook, the same on every page): ours
   was about 100 px shorter (716 / 815 at 1440, 962 / 1065 at 390). From the captures' pixel rows: the payment
   heading 23 px further from the link columns (both widths); from 1025 px the legal links 29 px further from the
   badges and 27 px from the red band's end (our link columns start 8 px lower); below 1025 px the follow-us group 46 px further from the payment
   badges, the legal links 19 px closer to the social icons and 38 px from the band's end; the white logo strip
   19 (17) px more under the logos.
   Run: node --max-old-space-size=512 --test test/austrian-footer-444.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = () => fs.readFileSync(new URL('../styles/themes/austrian.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');

test('the footer\'s spacing as www\'s at both breakpoints', () => {
  const s = css();
  const i = s.indexOf('/* brief 444: the footer');
  assert.ok(i > 0, 'the part');
  const part = s.slice(i);
  assert.match(part, /body\.brand-austrian \.footer \.footer-inner \.footer-badges \{ padding-top: 47px; \}/);
  assert.match(part, /@media \(width < 1025px\) \{ body\.brand-austrian \.footer \.footer-badge-group \+ \.footer-badge-group \{ margin-top: 46px; \} body\.brand-austrian \.footer \.footer-inner \.footer-legal \{ padding-top: 11px; padding-bottom: 38px; \} body\.brand-austrian \.footer \.footer-logos-inner \{ padding-bottom: 55px; \} \}/);
  assert.match(part, /@media \(width >= 1025px\) \{ body\.brand-austrian \.footer \.footer-inner \.footer-badges \{ padding-bottom: 53px; \} body\.brand-austrian \.footer \.footer-inner \.footer-legal \{ padding-bottom: 27px; \} body\.brand-austrian \.footer \.footer-logos-inner \{ padding-bottom: 47px; \} \}/);
});
