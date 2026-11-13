/* eslint-disable max-len */
/* The brief after 570 (the ranking against brussels-parity-004): /be/en/contact/feedback/general/other, +4.2 % at 1440 and
   +5.1 % at 390 on brussels.turnsthe.page once the capture's 71 px Turnstile checkbox is taken off; each of its 8 bands
   16 to 34 px taller than www's. A band with a title (h2 36 px) on www: the white card 26 px under the title at 1440, 22 at
   390 (ours 32), the description right on the card at 390 (ours 10 px under it), the first field 20 px inside the card and
   the card's bottom 20 px under the last field's 24 px margin (ours 30 / 30, lufthansa.com's .p-7), the card in the page
   column at 390 (ours 10 px wider on each side). The Brussels theme draws a titled band so. Bands without a title (only a
   description beside the card: /my-bookings/emergency-contact) as before: www pads those cards about 36 px.
   Measured with the rule added on the live pages, without the 71 px: feedback/general/other +4.2 -> +1.0 % (1440),
   +5.1 -> +1.9 % (390); groups-and-charter/charter +1.8 -> +0.2 / +3.0 -> +0.9 %; legal-notices/dsar-start
   +2.3 -> -0.3 / +2.8 -> +0.7 %; emergency-contact unchanged (-1.4 / +0.2 %).
   Run: node --max-old-space-size=256 --test test/brussels-form-bands-570.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const TITLED = 'body\\.brand-brussels \\.form\\.core \\.form-step:has\\(> \\.form-step-intro > \\.form-step-title\\)';

test('a titled band\'s card: 20 px padding, in the page column', () => {
  assert.match(css, new RegExp(`${TITLED} \\.form-step-card \\{ margin-inline: 0; padding: 20px; \\}`));
});

test('the title 22 px over the card (26 from 1025 px), the description right on it', () => {
  assert.match(css, /body\.brand-brussels \.form\.core \.form-step-title \{ margin-bottom: 22px;[^}]*font-weight: 700; \}/);
  assert.match(css, /@media \(width >= 1025px\) \{ body\.brand-brussels \.form\.core \.form-step-title \{ margin-bottom: 26px; \} \}/);
  assert.match(css, new RegExp(`${TITLED} \\.form-step-description \\{ margin-bottom: 0; \\}`));
});

test('bands without a title keep their card (no rule for every .form-step-card)', () => {
  assert.doesNotMatch(css, /body\.brand-brussels \.form\.core \.form-step-card \{[^}]*padding: 20px/);
});
