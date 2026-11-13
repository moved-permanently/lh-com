/* eslint-disable max-len */
/* The brief after 570c (the ranking against brussels-parity-004): /be/en/my-bookings/emergency-contact's core form bands
   have no title, only a description beside the card ("Passenger Details", "Contact Details", "Flights"). On www (full
   scale): the band's top 56 px above the first card at 1440 (51 at 390: the description 52 px under the band's top), the
   first field 35 px inside the card, the card's bottom 20 px under the last field's margin, 96 px from one card to the
   next (92 to the next description at 390), the card in the page column at 390. Ours: 30 / 30 / 30, 70 px between
   cards, 10 px wider on each side at 390. The Brussels theme draws an untitled band so; titled bands (895fc563) and the
   band-less form (560369f6) as before. With the rule and the tail rule on the live page: the first card at 435 (www 441),
   its first field at 470 (476), the second at 734 (740), the Flights card at 1311 (1324), the button within 6 px.
   Run: node --max-old-space-size=256 --test test/brussels-form-untitled-bands-570.test.mjs */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css = fs.readFileSync(new URL('../styles/themes/brussels.css', import.meta.url), 'utf8').replace(/\s+/g, ' ');
const UNTITLED = 'body\\.brand-brussels \\.form\\.core \\.form-step:not\\(\\.form-step-plain, :has\\(> \\.form-step-intro > \\.form-step-title\\)\\)';

test('an untitled band: 51 px above its card (56 from 1025 px)', () => {
  assert.match(css, new RegExp(`${UNTITLED} \\{ padding-top: 51px; \\}`));
  assert.match(css, new RegExp(`@media \\(width >= 1025px\\) \\{ ${UNTITLED} \\{ padding-top: 56px; \\} \\}`));
});

test('its card: 35 px above the first field, 20 below the last one\'s margin, in the page column', () => {
  assert.match(css, new RegExp(`${UNTITLED} \\.form-step-card \\{ margin-inline: 0; padding: 35px 20px 20px; \\}`));
});
